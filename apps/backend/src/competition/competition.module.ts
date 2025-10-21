import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { CompetitionsService } from './competition.service';
import { CompetitionsController } from './competition.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: 'email', // 👈 must match your @InjectQueue('email')
    }),
  ],
  controllers: [CompetitionsController],
  providers: [CompetitionsService, PrismaService],
  exports: [CompetitionsService],
})
export class CompetitionsModule {}
