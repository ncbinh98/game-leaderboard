import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Score } from './entities/score.entity';
import { CreateScoreDto } from './dto/create-score.dto';

@Injectable()
export class ScoresService {
  constructor(
    @InjectRepository(Score)
    private readonly scoreRepository: Repository<Score>,
  ) {}

  async create(createScoreDto: CreateScoreDto): Promise<Score> {
    const score = this.scoreRepository.create(createScoreDto);
    return await this.scoreRepository.save(score);
  }

  async getLeaderboardWithRank(): Promise<Score[]> {
    const { entities, raw } = await this.scoreRepository
      .createQueryBuilder('score')
      .addSelect('RANK() OVER (ORDER BY score.scoreValue DESC)', 'rank')
      .orderBy('score.scoreValue', 'DESC')
      .limit(100)
      .getRawAndEntities();

    return entities.map((entity, index) => {
      entity.rank = Number(raw[index].rank);
      return entity;
    });
  }
}
