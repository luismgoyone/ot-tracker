import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DepartmentsModule } from './departments/departments.module';
import { OtRecordsModule } from './ot-records/ot-records.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { DatabaseConfig } from './database/database.config';
import { HealthController } from './health/health.controller';
import { validateEnv } from './config/env.validation';
import { AppThrottlerGuard } from './auth/guards/app-throttler.guard';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { PasswordChangeGuard } from './auth/guards/password-change.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { RequestLoggerMiddleware } from './common/request-logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    AuthModule,
    UsersModule,
    DepartmentsModule,
    OtRecordsModule,
    AnalyticsModule,
  ],
  controllers: [HealthController],
  // Global guards run in this order: rate limit -> authenticate -> temp-password lock -> role check.
  providers: [
    { provide: APP_GUARD, useClass: AppThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PasswordChangeGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
