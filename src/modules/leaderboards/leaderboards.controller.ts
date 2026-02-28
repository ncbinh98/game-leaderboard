import { Controller, Get, Param } from '@nestjs/common';
import { LeaderboardsService } from './leaderboards.service';

@Controller('leaderboards')
export class LeaderboardsController {
  constructor(private readonly leaderboardsService: LeaderboardsService) {}

  @Get()
  findAll() {
    return this.leaderboardsService.findAllActive();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leaderboardsService.findOne(id);
  }
}
