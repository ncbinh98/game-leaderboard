import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Leaderboard, LeaderboardStatus } from './entities/leaderboard.entity';

@Injectable()
export class LeaderboardsService {
  constructor(
    @InjectRepository(Leaderboard)
    private readonly leaderboardRepository: Repository<Leaderboard>,
  ) {}

  async findAllActive(): Promise<Leaderboard[]> {
    return await this.leaderboardRepository.find({
      where: { status: LeaderboardStatus.ACTIVE },
    });
  }

  async findOne(id: string): Promise<Leaderboard> {
    const leaderboard = await this.leaderboardRepository.findOne({
      where: { id },
    });
    if (!leaderboard) {
      throw new NotFoundException(`Leaderboard with ID ${id} not found`);
    }
    return leaderboard;
  }
}
