import { join } from 'path';
import { DataSourceOptions } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Department } from '../departments/entities/department.entity';
import { OtRecord } from '../ot-records/entities/ot-record.entity';

type Env = Record<string, string | undefined>;

/** Shared by the Nest app and the TypeORM CLI so both hit the same database the same way. */
export function buildDataSourceOptions(env: Env): DataSourceOptions {
  return {
    type: 'postgres',
    host: env.DATABASE_HOST ?? 'localhost',
    port: Number(env.DATABASE_PORT ?? 5432),
    username: env.DATABASE_USER ?? 'postgres',
    password: env.DATABASE_PASSWORD ?? 'password',
    database: env.DATABASE_NAME ?? 'ot_tracker',
    ssl: env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    entities: [User, Department, OtRecord],
    // .ts under ts-node/jest, .js once compiled (a broader glob would also match .d.ts files).
    migrations: [join(__dirname, 'migrations', `*.${__filename.endsWith('.ts') ? 'ts' : 'js'}`)],
    // Schema changes only ever happen through migrations.
    synchronize: false,
    logging: env.NODE_ENV === 'development' ? ['query', 'error'] : env.NODE_ENV === 'test' ? false : ['error'],
  };
}
