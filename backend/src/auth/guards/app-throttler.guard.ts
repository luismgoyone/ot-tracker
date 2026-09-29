import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

/**
 * Rate-limits by client IP, and additionally by the target email on login so that
 * spoofed forwarding headers can't be used to brute-force a single account.
 */
@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Request): Promise<string> {
    const email = typeof req.body?.email === 'string' ? req.body.email.toLowerCase() : null;
    return email ? `login:${email}` : req.ip ?? 'unknown';
  }
}
