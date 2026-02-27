import {
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateScoreDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsInt()
  @Min(0)
  scoreValue: number;

  @IsObject()
  @IsOptional()
  metaData?: Record<string, any>;
}
