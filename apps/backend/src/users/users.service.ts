import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUserRegistrations(userId: number) {
    const registrations = await this.prisma.registration.findMany({
      where: { userId },
      include: {
        competition: {
          select: {
            id: true,
            title: true,
            description: true,
            regDeadline: true,
            startDate: true,
            capacity: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      userId,
      totalRegistrations: registrations.length,
      registrations: registrations.map((reg) => ({
        id: reg.id,
        registeredAt: reg.createdAt,
        competition: reg.competition,
      })),
    };
  }

  async getUserMailbox(userId: number) {
    const emails = await this.prisma.mailBox.findMany({
      where: { userId },
      orderBy: {
        sentAt: 'desc',
      },
    });

    return {
      userId,
      totalEmails: emails.length,
      emails: emails.map((email) => ({
        id: email.id,
        to: email.to,
        subject: email.subject,
        body: email.body,
        sentAt: email.sentAt,
      })),
    };
  }
}