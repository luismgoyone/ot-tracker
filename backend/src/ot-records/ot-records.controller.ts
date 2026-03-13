import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, OtStatus } from '../common/enums';
import { OtRecordsService } from './ot-records.service';
import { CreateOtRecordDto } from './dto/create-ot-record.dto';
import { UpdateOtRecordDto } from './dto/update-ot-record.dto';

@Controller('ot-records')
@UseGuards(AuthGuard('jwt'))
export class OtRecordsController {
  constructor(private readonly otRecordsService: OtRecordsService) {}

  @Post()
  create(@Body() createOtRecordDto: CreateOtRecordDto, @Request() req: { user: { userId: number } }) {
    return this.otRecordsService.create(createOtRecordDto, req.user.userId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERVISOR)
  findAll(
    @Query('departmentId') departmentId?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('status') status?: OtStatus,
  ) {
    if (departmentId) {
      return this.otRecordsService.findByDepartment(Number.parseInt(departmentId, 10));
    }
    return this.otRecordsService.findAll(Number.parseInt(page, 10), Number.parseInt(limit, 10), status);
  }

  @Get('my-records')
  findMyRecords(
    @Request() req: { user: { userId: number } },
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.otRecordsService.findByUser(req.user.userId, Number.parseInt(page, 10), Number.parseInt(limit, 10));
  }

  @Get('date-range')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERVISOR)
  findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.otRecordsService.findByDateRange(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERVISOR)
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: OtStatus,
    @Request() req: { user: { userId: number } },
  ) {
    return this.otRecordsService.updateStatus(+id, status, req.user.userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOtRecordDto: UpdateOtRecordDto) {
    return this.otRecordsService.update(+id, updateOtRecordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.otRecordsService.remove(+id);
  }
}
