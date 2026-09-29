import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { OtStatus } from '../../common/enums';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class FindOtRecordsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(OtStatus)
  status?: OtStatus;

  /** Only honoured for admins; supervisors are always scoped to their own department. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  departmentId?: number;
}
