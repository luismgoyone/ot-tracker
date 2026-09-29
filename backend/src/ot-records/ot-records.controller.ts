import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, HttpCode } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/auth-user';
import { UserRole } from '../common/enums';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { OtRecordsService } from './ot-records.service';
import { CreateOtRecordDto } from './dto/create-ot-record.dto';
import { UpdateOtRecordDto } from './dto/update-ot-record.dto';
import { UpdateOtStatusDto } from './dto/update-ot-status.dto';
import { FindOtRecordsQueryDto } from './dto/find-ot-records-query.dto';

@Controller('ot-records')
export class OtRecordsController {
  constructor(private readonly otRecordsService: OtRecordsService) {}

  @Post()
  create(@Body() dto: CreateOtRecordDto, @CurrentUser() user: AuthUser) {
    return this.otRecordsService.create(dto, user.id);
  }

  @Get()
  @Roles(UserRole.SUPERVISOR)
  findAll(@Query() query: FindOtRecordsQueryDto, @CurrentUser() user: AuthUser) {
    return this.otRecordsService.findAll(query, user);
  }

  @Get('my-records')
  findMyRecords(@Query() query: PaginationQueryDto, @CurrentUser() user: AuthUser) {
    return this.otRecordsService.findByUser(user.id, query);
  }

  @Get('my-summary')
  getMySummary(@CurrentUser() user: AuthUser) {
    return this.otRecordsService.getSummary(user.id);
  }

  @Patch(':id/status')
  @Roles(UserRole.SUPERVISOR)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOtStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.otRecordsService.updateStatus(id, dto, user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOtRecordDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.otRecordsService.update(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.otRecordsService.remove(id, user);
  }
}
