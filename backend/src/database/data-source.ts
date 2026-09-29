import 'dotenv/config';
import { DataSource } from 'typeorm';
import { buildDataSourceOptions } from './data-source-options';

/** Used by the TypeORM CLI (`npm run migration:*`). */
export default new DataSource(buildDataSourceOptions(process.env));
