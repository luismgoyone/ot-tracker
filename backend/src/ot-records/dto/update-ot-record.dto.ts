import { PartialType } from '@nestjs/mapped-types';
import { CreateOtRecordDto } from './create-ot-record.dto';

export class UpdateOtRecordDto extends PartialType(CreateOtRecordDto) {}
