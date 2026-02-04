import {
  IsDateString,
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class CreateOtRecordDto {
  @IsDateString()
  date: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.25)
  @Max(12)
  duration: number;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  comments?: string;
}
