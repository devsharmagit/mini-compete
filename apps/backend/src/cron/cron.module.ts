import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { WorkerModule } from '../worker/worker.module';
import { CronService } from './cron.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    WorkerModule,
  ],
  providers: [CronService],
})
export class CronModule {}