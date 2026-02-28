import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
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
  getLeaderboardWithRank(
    @Query('leaderboardId') leaderboardId: string,
    @Query('top') top: string,
  ) {
    if (!leaderboardId) {
      // For now requirement might need a default or error
      throw new BadRequestException('leaderboardId is required');
    }
    return this.scoresService.getLeaderboardWithRank(leaderboardId, top);
  }
}
