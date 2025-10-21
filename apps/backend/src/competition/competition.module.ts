import { Module } from '@nestjs/common';
import { WorkerModule } from '../worker/worker.module';
import { CompetitionsService } from './competition.service';
import { CompetitionsController } from './competition.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    WorkerModule,
  ],
  controllers: [CompetitionsController],
  providers: [CompetitionsService, PrismaService],
  exports: [CompetitionsService],
})
export class CompetitionsModule {}
