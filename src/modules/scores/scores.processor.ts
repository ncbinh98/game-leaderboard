import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
import { Score } from './entities/score.entity';
import { LeaderboardEntry } from './entities/leaderboard-entry.entity';
import { REDIS_CLIENT } from '../../infra/redis/redis.module';
import { LeaderboardsService } from '../leaderboards/leaderboards.service';

@Processor('scores')
export class ScoresProcessor extends WorkerHost {
  private readonly logger = new Logger(ScoresProcessor.name);

  constructor(
    @InjectRepository(Score)
    private readonly scoreRepository: Repository<Score>,
    @InjectRepository(LeaderboardEntry)
    private readonly leaderboardEntryRepository: Repository<LeaderboardEntry>,
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
    private readonly leaderboardsService: LeaderboardsService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { userId, scoreValue, metaData } = job.data;
    this.logger.log(`Processing score for user ${userId}: ${scoreValue}`);

    try {
      // 1. Audit Log: Save the raw score
      const score = this.scoreRepository.create({
        userId,
        scoreValue,
        metaData,
      });
      await this.scoreRepository.save(score);

      // 2. Identify all active leaderboards (Fan-out)
      const activeLeaderboards = await this.leaderboardsService.findAllActive();

      for (const lb of activeLeaderboards) {
        // 3. Upsert Leaderboard Entry (Personal Best)
        let entry = await this.leaderboardEntryRepository.findOne({
          where: { userId, leaderboardId: lb.id },
        });

        if (!entry) {
          entry = this.leaderboardEntryRepository.create({
            userId,
            leaderboardId: lb.id,
            bestScore: scoreValue,
          });
          await this.leaderboardEntryRepository.save(entry);
        } else if (scoreValue > entry.bestScore) {
          entry.bestScore = scoreValue;
          await this.leaderboardEntryRepository.save(entry);
        }

        // 4. Update Redis Sorted Set with the LATEST personal best
        // Key format: lb:{leaderboardId}
        await this.redis.zadd(`lb:${lb.id}`, entry.bestScore, userId);
      }

      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to process score job ${job.id}`, error.stack);
      throw error;
    }
  }
}
