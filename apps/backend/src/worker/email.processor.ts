import { Processor, Process, OnQueueError, OnQueueFailed } from '@nestjs/bull';
import type{ Job } from 'bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface RegistrationConfirmationPayload {
  registrationId: number;
  userId: number;
  competitionId: number;
  userEmail: string;
  userName: string;
  competitionTitle: string;
}

interface ReminderPayload {
  userId: number;
  competitionId: number;
  userEmail: string;
  userName: string;
  competitionTitle: string;
  competitionStartDate: string;
}

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private prisma: PrismaService) {}

  @Process('registration-confirmation')
  async handleRegistrationConfirmation(
    job: Job<RegistrationConfirmationPayload>,
  ) {
    const { registrationId, userId, competitionId, userEmail, userName, competitionTitle } =
      job.data;

    this.logger.log(
      `Processing registration confirmation job ${job.id} for registration ${registrationId}`,
    );

    try {
      // Verify registration still exists and is valid
      const registration = await this.prisma.registration.findUnique({
        where: { id: registrationId },
      });

      if (!registration) {
        this.logger.warn(
          `Registration ${registrationId} not found, skipping email`,
        );
        return { status: 'skipped', reason: 'registration_not_found' };
      }

      // Simulate sending email by persisting to MailBox table
      const mailbox = await this.prisma.mailBox.create({
        data: {
          userId,
          to: userEmail,
          subject: `Registration Confirmed: ${competitionTitle}`,
          body: `
            Hi ${userName},

            Your registration for "${competitionTitle}" has been confirmed!

            Registration ID: ${registrationId}
            Competition ID: ${competitionId}

            Thank you for registering.

            Best regards,
            Mini Compete Team
          `,
        },
      });

      this.logger.log(
        `Successfully sent confirmation email ${mailbox.id} for registration ${registrationId}`,
      );

      return {
        status: 'success',
        mailboxId: mailbox.id,
        registrationId,
      };
    } catch (error) {
      this.logger.error(
        `Failed to send confirmation email for registration ${registrationId}`,
        error,
      );
      throw error; // Will trigger retry logic
    }
  }

  @Process('reminder-notification')
  async handleReminderNotification(job: Job<ReminderPayload>) {
    const { userId, competitionId, userEmail, userName, competitionTitle, competitionStartDate } =
      job.data;

    this.logger.log(
      `Processing reminder notification job ${job.id} for user ${userId}, competition ${competitionId}`,
    );

    try {
      // Verify user is still registered
      const registration = await this.prisma.registration.findFirst({
        where: {
          userId,
          competitionId,
        },
      });

      if (!registration) {
        this.logger.warn(
          `User ${userId} is no longer registered for competition ${competitionId}, skipping reminder`,
        );
        return { status: 'skipped', reason: 'not_registered' };
      }

      // Simulate sending reminder email
      const mailbox = await this.prisma.mailBox.create({
        data: {
          userId,
          to: userEmail,
          subject: `Reminder: ${competitionTitle} starts soon!`,
          body: `
            Hi ${userName},

            This is a friendly reminder that "${competitionTitle}" is starting on ${competitionStartDate}.

            Competition ID: ${competitionId}

            Make sure you're prepared!

            Best regards,
            Mini Compete Team
          `,
        },
      });

      this.logger.log(
        `Successfully sent reminder email ${mailbox.id} for competition ${competitionId}`,
      );

      return {
        status: 'success',
        mailboxId: mailbox.id,
        competitionId,
      };
    } catch (error) {
      this.logger.error(
        `Failed to send reminder email for competition ${competitionId}`,
        error,
      );
      throw error;
    }
  }

  @OnQueueFailed()
  async onQueueFailed(job: Job, error: Error) {
    this.logger.error(
      `Job ${job.id} failed after ${job.attemptsMade} attempts`,
      error,
    );

    // After all retries exhausted, log to FailedJobs table (DLQ)
    if (job.attemptsMade >= (job.opts.attempts || 3)) {
      try {
        await this.prisma.failedJob.create({
          data: {
            jobId: job.id.toString(),
            jobName: job.name,
            payload: job.data as any,
            error: error.message,
            stackTrace: error.stack || '',
            attempts: job.attemptsMade,
          },
        });
        this.logger.log(`Logged failed job ${job.id} to FailedJobs table`);
      } catch (dbError) {
        this.logger.error(
          `Failed to log failed job to database`,
          dbError,
        );
      }
    }
  }

  @OnQueueError()
  async onQueueError(error: Error) {
    this.logger.error('Queue error occurred', error);
  }
}