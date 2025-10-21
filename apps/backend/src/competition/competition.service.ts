import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CompetitionsService {
  private redisClient: Redis;

  constructor(
    private prisma: PrismaService,
    @InjectQueue('email') private emailQueue: Queue,
    private configService: ConfigService,
  ) {
    // Initialize Redis client for distributed locks
    this.redisClient = new Redis({
      host: this.configService.get('REDIS_HOST') || 'localhost',
      port: this.configService.get('REDIS_PORT') || 6379,
    });
  }

  async create(createCompetitionDto: CreateCompetitionDto, organizerId: number) {
    const competition = await this.prisma.competition.create({
      data: {
        title: createCompetitionDto.title,
        description: createCompetitionDto.description,
        tags: createCompetitionDto.tags || [],
        capacity: createCompetitionDto.capacity,
        regDeadline: new Date(createCompetitionDto.regDeadline),
        organizerId,
      },
    });

    return {
      id: competition.id,
      title: competition.title,
      description: competition.description,
      tags: competition.tags,
      capacity: competition.capacity,
      regDeadline: competition.regDeadline,
      createdAt: competition.createdAt,
    };
  }

  async findAll(page: number = 1, limit: number = 10, tags?: string[]) {
    const skip = (page - 1) * limit;

    const where = tags?.length
      ? {
          tags: {
            hasSome: tags,
          },
        }
      : {};

    const [competitions, total] = await Promise.all([
      this.prisma.competition.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          _count: {
            select: { registrations: true },
          },
        },
      }),
      this.prisma.competition.count({ where }),
    ]);

    return {
      data: competitions.map((comp) => ({
        ...comp,
        registeredCount: comp._count.registrations,
        seatsLeft: comp.capacity - comp._count.registrations,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const competition = await this.prisma.competition.findUnique({
      where: { id },
      include: {
        _count: {
          select: { registrations: true },
        },
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!competition) {
      throw new NotFoundException(`Competition with ID ${id} not found`);
    }

    return {
      ...competition,
      registeredCount: competition._count.registrations,
      seatsLeft: competition.capacity - competition._count.registrations,
    };
  }

  async register(
    competitionId: number,
    userId: number,
    idempotencyKey?: string,
  ) {
    // Check idempotency key if provided
    if (idempotencyKey) {
      const idempotencyRecord = await this.prisma.idempotencyKey.findUnique({
        where: { key: idempotencyKey },
      });

      if (idempotencyRecord) {
        // Return the cached response
        return idempotencyRecord.response as any;
      }
    }

    // Acquire distributed lock using Redis
    const lockKey = `lock:competition:${competitionId}`;
    const lockValue = `${userId}-${Date.now()}`;
    const lockTTL = 5000; // 5 seconds

    const acquired = await this.redisClient.set(
      lockKey,
      lockValue,
      'PX',
      lockTTL,
      'NX',
    );

    if (!acquired) {
      throw new ConflictException('Registration in progress, please try again');
    }

    try {
      // Use Prisma transaction with proper isolation
      const result = await this.prisma.$transaction(
        async (tx) => {
          // Lock the competition row for update
          const competition = await tx.competition.findUnique({
            where: { id: competitionId },
            include: {
              _count: {
                select: { registrations: true },
              },
            },
          });

          if (!competition) {
            throw new NotFoundException(
              `Competition with ID ${competitionId} not found`,
            );
          }

          // Check registration deadline
          if (new Date() > competition.regDeadline) {
            throw new BadRequestException('Registration deadline has passed');
          }

          // Check capacity
          const seatsLeft = competition.capacity - competition._count.registrations;
          if (seatsLeft <= 0) {
            throw new BadRequestException('Competition is full');
          }

          // Check if user is already registered
          const existingRegistration = await tx.registration.findFirst({
            where: {
              competitionId,
              userId,
            },
          });

          if (existingRegistration) {
            throw new ConflictException(
              'You are already registered for this competition',
            );
          }

          // Create registration
          const registration = await tx.registration.create({
            data: {
              competitionId,
              userId,
            },
            include: {
              competition: {
                select: {
                  title: true,
                },
              },
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          });

          // Store idempotency key if provided
          if (idempotencyKey) {
            const response = {
              id: registration.id,
              competitionId: registration.competitionId,
              userId: registration.userId,
              registeredAt: registration.createdAt,
              competition: registration.competition,
            };

            await tx.idempotencyKey.create({
              data: {
                key: idempotencyKey,
                response: response as any,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
              },
            });
          }

          return registration;
        },
        {
          isolationLevel: 'Serializable',
          timeout: 10000,
        },
      );

      // Enqueue confirmation email job
      await this.emailQueue.add(
        'registration-confirmation',
        {
          registrationId: result.id,
          userId: result.userId,
          competitionId: result.competitionId,
          userEmail: result.user.email,
          userName: result.user.name,
          competitionTitle: result.competition.title,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: true,
        },
      );

      return {
        id: result.id,
        competitionId: result.competitionId,
        userId: result.userId,
        registeredAt: result.createdAt,
        competition: result.competition,
      };
    } finally {
      // Release the lock
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;
      await this.redisClient.eval(script, 1, lockKey, lockValue);
    }
  }

  async getRegistrations(competitionId: number) {
    const competition = await this.prisma.competition.findUnique({
      where: { id: competitionId },
    });

    if (!competition) {
      throw new NotFoundException(
        `Competition with ID ${competitionId} not found`,
      );
    }

    const registrations = await this.prisma.registration.findMany({
      where: { competitionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return {
      competitionId,
      totalRegistrations: registrations.length,
      registrations: registrations.map((reg) => ({
        id: reg.id,
        user: reg.user,
        registeredAt: reg.createdAt,
      })),
    };
  }
}