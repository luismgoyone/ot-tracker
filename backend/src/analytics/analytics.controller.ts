import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.SUPERVISOR)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboardStats() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('by-department')
  getOtByDepartment() {
    return this.analyticsService.getOtByDepartment();
  }

  @Get('monthly')
  getMonthlyOtStats(@Query('year') year?: string) {
    const yearNum = year ? parseInt(year) : undefined;
    return this.analyticsService.getMonthlyOtStats(yearNum);
  }

  @Get('top-users')
  getTopOtUsers(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : undefined;
    return this.analyticsService.getTopOtUsers(limitNum);
  }

  @Get('trends')
  getOtTrends(@Query('days') days?: string) {
    const daysNum = days ? parseInt(days) : undefined;
    return this.analyticsService.getOtTrends(daysNum);
  }
}
