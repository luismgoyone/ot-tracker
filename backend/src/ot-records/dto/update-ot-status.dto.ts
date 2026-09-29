import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { OtStatus } from '../../common/enums';

export class UpdateOtStatusDto {
  @IsIn([OtStatus.APPROVED, OtStatus.REJECTED])
  status!: OtStatus.APPROVED | OtStatus.REJECTED;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comments?: string;
}
