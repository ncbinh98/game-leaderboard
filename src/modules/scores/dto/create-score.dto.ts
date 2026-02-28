import {
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  IsNumber,
} from 'class-validator';

export class CreateScoreDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  scoreValue: number;

  @IsOptional()
  metaData?: any;
}
