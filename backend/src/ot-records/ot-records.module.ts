import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtRecord } from './entities/ot-record.entity';
import { OtRecordsService } from './ot-records.service';
import { OtRecordsController } from './ot-records.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OtRecord])],
  providers: [OtRecordsService],
  controllers: [OtRecordsController],
  exports: [OtRecordsService],
})
export class OtRecordsModule {}
