import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ScoresService } from './scores.service';
import { CreateScoreDto } from './dto/create-score.dto';

@Controller('scores')
export class ScoresController {
  constructor(private readonly scoresService: ScoresService) {}

  @Post()
  create(@Body() createScoreDto: CreateScoreDto) {
    return this.scoresService.create(createScoreDto);
  }

  @Get('ranked')
  getRankedLeaderboard() {
    return this.scoresService.getLeaderboardWithRank();
  }
}
