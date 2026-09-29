import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Baseline schema (formerly database/init.sql + migrations/001). Written to be idempotent
 * so it can be recorded against databases that were created from init.sql before
 * migrations existed, without changing them.
 */
export class InitialSchema1790640000000 implements MigrationInterface {
  name = 'InitialSchema1790640000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'regular',
        department_id INTEGER REFERENCES departments(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
    // Columns and role added by the old migrations/001 script.
    await queryRunner.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE`);
    await queryRunner.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT FALSE`,
    );
    await queryRunner.query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check`);
    await queryRunner.query(
      `ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('regular', 'supervisor', 'admin'))`,
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ot_records (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        duration DECIMAL(4,2) NOT NULL,
        reason TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        approved_by INTEGER REFERENCES users(id),
        comments TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);

    for (const [name, table, column] of [
      ['idx_users_department_id', 'users', 'department_id'],
      ['idx_users_role', 'users', 'role'],
      ['idx_ot_records_user_id', 'ot_records', 'user_id'],
      ['idx_ot_records_date', 'ot_records', 'date'],
      ['idx_ot_records_status', 'ot_records', 'status'],
      ['idx_ot_records_approved_by', 'ot_records', 'approved_by'],
    ]) {
      await queryRunner.query(`CREATE INDEX IF NOT EXISTS ${name} ON ${table}(${column})`);
    }

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql`);
    for (const table of ['departments', 'users', 'ot_records']) {
      await queryRunner.query(`DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table}`);
      await queryRunner.query(
        `CREATE TRIGGER update_${table}_updated_at BEFORE UPDATE ON ${table}
         FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS ot_records`);
    await queryRunner.query(`DROP TABLE IF EXISTS users`);
    await queryRunner.query(`DROP TABLE IF EXISTS departments`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column`);
  }
}
