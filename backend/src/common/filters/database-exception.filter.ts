import { ArgumentsHost, Catch, HttpStatus, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

// https://www.postgresql.org/docs/current/errcodes-appendix.html
const PG_ERRORS: Record<string, { status: HttpStatus; message: string }> = {
  '23505': { status: HttpStatus.CONFLICT, message: 'A record with these details already exists' },
  '23503': { status: HttpStatus.BAD_REQUEST, message: 'A referenced record does not exist' },
  '23514': { status: HttpStatus.BAD_REQUEST, message: 'A value is not allowed' },
  '23502': { status: HttpStatus.BAD_REQUEST, message: 'A required value is missing' },
  '22P02': { status: HttpStatus.BAD_REQUEST, message: 'A value has an invalid format' },
};

/** Turns constraint violations into 4xx responses instead of generic 500s. */
@Catch(QueryFailedError)
export class DatabaseExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(DatabaseExceptionFilter.name);

  catch(exception: QueryFailedError & { code?: string }, host: ArgumentsHost) {
    const mapped = exception.code ? PG_ERRORS[exception.code] : undefined;
    if (!mapped) {
      return super.catch(exception, host);
    }

    this.logger.warn(`${exception.code}: ${exception.message}`);
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(mapped.status)
      .json({ statusCode: mapped.status, message: mapped.message });
  }
}
