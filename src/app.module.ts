import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from './infra/database/typeorm.module';
import { databaseConfig } from './config/database.config';
import { UtilsModule } from './shared/utils/utils.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { RedisModule } from './infra/redis/redis.module';
import { redisConfig } from './config/redis.config';
import { ScoresModule } from './modules/scores/scores.module';

import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { LeaderboardsModule } from './modules/leaderboards/leaderboards.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig],
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('redis.host'),
          port: config.get('redis.port'),
          password: config.get('redis.password'),
          db: config.get('redis.db'),
        },
      }),
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    RedisModule,
    UtilsModule,
    UsersModule,
    AuthModule,
    ScoresModule,
    LeaderboardsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
