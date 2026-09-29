import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { OtStatus } from '../../common/enums';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class FindOtRecordsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(OtStatus)
  status?: OtStatus;

  /** Matches employee name, department or reason (case-insensitive). */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  /** Only honoured for admins; supervisors are always scoped to their own department. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  departmentId?: number;
}
