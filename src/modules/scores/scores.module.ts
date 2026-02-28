import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ScoresController } from './scores.controller';
import { ScoresService } from './scores.service';
import { Score } from './entities/score.entity';
import { LeaderboardEntry } from './entities/leaderboard-entry.entity';
import { LeaderboardsModule } from '../leaderboards/leaderboards.module';
import { ScoresProcessor } from './scores.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Score, LeaderboardEntry]),
    BullModule.registerQueue({
      name: 'scores',
    }),
    forwardRef(() => LeaderboardsModule),
  ],
  controllers: [ScoresController],
  providers: [ScoresService, ScoresProcessor],
  exports: [ScoresService],
})
export class ScoresModule {}
