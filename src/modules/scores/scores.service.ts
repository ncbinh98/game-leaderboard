import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { Score } from './entities/score.entity';
import { CreateScoreDto } from './dto/create-score.dto';
import { REDIS_CLIENT } from '../../infra/redis/redis.module';

@Injectable()
export class ScoresService {
  constructor(
    @InjectRepository(Score)
    private readonly scoreRepository: Repository<Score>,
    @InjectQueue('scores')
    private readonly scoresQueue: Queue,
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  async create(createScoreDto: CreateScoreDto): Promise<{ jobId: string }> {
    const job = await this.scoresQueue.add('process-score', createScoreDto);
    return { jobId: job.id! };
  }

  async getLeaderboardWithRank(
    leaderboardId: string,
    topStart: string = '1',
    topEnd: string = '100',
  ): Promise<any[]> {
    const redisKey = `lb:${leaderboardId}`;
    const topScores = await this.redis.zrevrange(
      redisKey,
      +topStart - 1,
      +topEnd - 1,
      'WITHSCORES',
    );

    const results: any[] = [];
    let countRank = +topStart;
    for (let i = 0; i < topScores.length; i += 2) {
      const userId = topScores[i];
      const score = parseInt(topScores[i + 1] || '0', 10);
      const rank = countRank;
      countRank++;

      const userName =
        (await this.redis.get(`user:${userId}:name`)) || 'Anonymous';

      results.push({
        rank,
        userId,
        userName,
        score,
      });
    }

    return results;
  }
}
