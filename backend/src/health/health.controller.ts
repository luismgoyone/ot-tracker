import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { DataSource } from 'typeorm';
import { Public } from '../auth/decorators/public.decorator';

/** Liveness + database check. Point an uptime monitor here to keep the free Render instance warm. */
@Controller('health')
export class HealthController {
  constructor(private dataSource: DataSource) {}

  @Public()
  @SkipThrottle()
  @Get()
  async check() {
    try {
      await this.dataSource.query('SELECT 1');
      return { status: 'ok' };
    } catch {
      throw new ServiceUnavailableException({ status: 'error', database: 'unreachable' });
    }
  }
}
