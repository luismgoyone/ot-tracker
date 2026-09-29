import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { buildDataSourceOptions } from './data-source-options';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      ...buildDataSourceOptions(process.env),
      // Apply pending migrations on boot so every deploy brings the schema up to date.
      migrationsRun: true,
    };
  }
}
