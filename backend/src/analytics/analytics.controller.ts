import { Controller, Get, Query } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/auth-user';
import { UserRole } from '../common/enums';
import { AnalyticsService } from './analytics.service';
import { TopUsersQueryDto, TrendsQueryDto } from './dto/analytics-query.dto';

/** All figures count approved overtime only, scoped to the supervisor's department (admins see everything). */
@Controller('analytics')
@Roles(UserRole.SUPERVISOR)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboardStats(@CurrentUser() user: AuthUser) {
    return this.analyticsService.getDashboardStats(user);
  }

  @Get('by-department')
  getOtByDepartment(@CurrentUser() user: AuthUser) {
    return this.analyticsService.getOtByDepartment(user);
  }

  @Get('monthly')
  getMonthlyOtStats(@CurrentUser() user: AuthUser) {
    return this.analyticsService.getMonthlyOtStats(user);
  }

  @Get('top-users')
  getTopOtUsers(@Query() query: TopUsersQueryDto, @CurrentUser() user: AuthUser) {
    return this.analyticsService.getTopOtUsers(user, query.limit);
  }

  @Get('trends')
  getOtTrends(@Query() query: TrendsQueryDto, @CurrentUser() user: AuthUser) {
    return this.analyticsService.getOtTrends(user, query.days);
  }
}
