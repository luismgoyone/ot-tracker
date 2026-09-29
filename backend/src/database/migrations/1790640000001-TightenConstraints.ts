import { MigrationInterface, QueryRunner } from 'typeorm';

/** Makes the database enforce what the entities already assume. */
export class TightenConstraints1790640000001 implements MigrationInterface {
  name = 'TightenConstraints1790640000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Every user belongs to a department and every record to a user.
    await queryRunner.query(`ALTER TABLE users ALTER COLUMN department_id SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE users ALTER COLUMN role SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE ot_records ALTER COLUMN user_id SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE ot_records ALTER COLUMN status SET NOT NULL`);

    // Mirrors the API's 15-minute to 12-hour rule.
    await queryRunner.query(
      `ALTER TABLE ot_records ADD CONSTRAINT ot_records_duration_check CHECK (duration >= 0.25 AND duration <= 12)`,
    );

    // Emails are compared case-insensitively at login, so they must be unique that way too.
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email))`);

    // Most queries filter a user's records by date.
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_ot_records_user_date ON ot_records(user_id, date)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_ot_records_user_date`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_email_lower`);
    await queryRunner.query(`ALTER TABLE ot_records DROP CONSTRAINT IF EXISTS ot_records_duration_check`);
    await queryRunner.query(`ALTER TABLE ot_records ALTER COLUMN status DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE ot_records ALTER COLUMN user_id DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE users ALTER COLUMN role DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE users ALTER COLUMN department_id DROP NOT NULL`);
  }
}
