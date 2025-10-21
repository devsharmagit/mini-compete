import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CompetitionsModule } from './competition/competition.module';
import { CronModule } from './cron/cron.module';
import { WorkerModule } from './worker/worker.module';
import { UsersModule } from './users/users.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  PrismaModule,
  AuthModule,
  BullModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => ({
      redis: {
        host: configService.get('REDIS_HOST') || 'localhost',
        port: configService.get('REDIS_PORT') || 6379,
      },
    }),
    inject: [ConfigService],
  }),
  // ensure Bull is configured before modules that register queues
  WorkerModule,
  CompetitionsModule,
  CronModule,
  // Add other modules here (CompetitionsModule, etc.)
  UsersModule,
  ],
})
export class AppModule {}