import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('email') private emailQueue: Queue,
  ) {}

  // Run every night at midnight (change to '* * * * *' for every minute in dev)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCompetitionReminders() {
    this.logger.log('Running competition reminders cron job');

    try {
      const now = new Date();
      const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Find competitions starting in the next 24 hours
      const upcomingCompetitions = await this.prisma.competition.findMany({
        where: {
          startDate: {
            gte: now,
            lte: next24Hours,
          },
        },
        include: {
          registrations: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      this.logger.log(
        `Found ${upcomingCompetitions.length} competitions starting in next 24 hours`,
      );

      let totalJobsEnqueued = 0;

      // Enqueue reminder jobs for each registered user
      for (const competition of upcomingCompetitions) {
        for (const registration of competition.registrations) {
          await this.emailQueue.add(
            'reminder-notification',
            {
              userId: registration.userId,
              competitionId: competition.id,
              userEmail: registration.user.email,
              userName: registration.user.name,
              competitionTitle: competition.title,
              competitionStartDate: competition.startDate?.toISOString() || 'TBD',
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
          totalJobsEnqueued++;
        }
      }

      this.logger.log(
        `Enqueued ${totalJobsEnqueued} reminder notification jobs`,
      );
    } catch (error) {
      this.logger.error('Error in competition reminders cron job', error);
    }
  }

  // Optional: Purge old soft-deleted registrations (run weekly)
  @Cron(CronExpression.EVERY_WEEK)
  async purgeOldRegistrations() {
    this.logger.log('Running purge old registrations cron job');

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Delete soft-deleted registrations older than 30 days
      // Note: You'd need to add a deletedAt field to your schema for this
      const result = await this.prisma.registration.deleteMany({
        where: {
          deletedAt: {
            lte: thirtyDaysAgo,
          },
        },
      });

      this.logger.log(
        `Purged ${result.count} old soft-deleted registrations`,
      );
    } catch (error) {
      this.logger.error('Error in purge old registrations cron job', error);
    }
  }

  // Optional: Clean up expired idempotency keys
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupExpiredIdempotencyKeys() {
    this.logger.log('Running cleanup expired idempotency keys cron job');

    try {
      const result = await this.prisma.idempotencyKey.deleteMany({
        where: {
          expiresAt: {
            lte: new Date(),
          },
        },
      });

      this.logger.log(
        `Cleaned up ${result.count} expired idempotency keys`,
      );
    } catch (error) {
      this.logger.error(
        'Error in cleanup expired idempotency keys cron job',
        error,
      );
    }
  }
}