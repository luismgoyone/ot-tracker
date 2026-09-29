import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { OtStatus, UserRole } from '../common/enums';
import { AuthUser } from '../auth/auth-user';

const MONTHS_SHOWN = 6;

/**
 * Builds the shared WHERE clause: department scope for non-admins. Parameters are
 * positional, so callers pass `params` through and append their own after it.
 */
function scope(actor: AuthUser, params: unknown[]): string {
  if (actor.role === UserRole.ADMIN) return '';
  params.push(actor.departmentId);
  return `AND u.department_id = $${params.length}`;
}

@Injectable()
export class AnalyticsService {
  /** IANA timezone used to decide what "today" and "this month" mean. */
  private readonly timezone: string;

  constructor(
    private dataSource: DataSource,
    config: ConfigService,
  ) {
    this.timezone = config.get<string>('APP_TIMEZONE', 'Asia/Manila');
  }

  async getDashboardStats(actor: AuthUser) {
    const params: unknown[] = [];
    const where = scope(actor, params);
    const [row] = await this.dataSource.query(
      `SELECT
         COUNT(*)::int AS "totalOtRecords",
         COUNT(*) FILTER (WHERE r.status = '${OtStatus.PENDING}')::int AS "pendingOtRecords",
         COUNT(*) FILTER (WHERE r.status = '${OtStatus.APPROVED}')::int AS "approvedOtRecords",
         COALESCE(SUM(r.duration) FILTER (WHERE r.status = '${OtStatus.APPROVED}'), 0)::float AS "totalOtHours",
         COALESCE(AVG(r.duration) FILTER (WHERE r.status = '${OtStatus.APPROVED}'), 0)::float AS "avgOtDuration"
       FROM ot_records r
       JOIN users u ON u.id = r.user_id
       WHERE TRUE ${where}`,
      params,
    );

    const userParams: unknown[] = [UserRole.REGULAR];
    const userWhere = scope(actor, userParams);
    const [users] = await this.dataSource.query(
      `SELECT COUNT(*)::int AS count FROM users u WHERE u.role = $1 AND u.is_active ${userWhere}`,
      userParams,
    );

    return { ...row, totalUsers: users.count };
  }

  async getOtByDepartment(actor: AuthUser) {
    const params: unknown[] = [OtStatus.APPROVED];
    const where = scope(actor, params);
    return this.dataSource.query(
      `SELECT d.id AS "departmentId",
              d.name AS "departmentName",
              COUNT(r.id)::int AS count,
              COALESCE(SUM(r.duration), 0)::float AS "totalHours"
       FROM ot_records r
       JOIN users u ON u.id = r.user_id
       JOIN departments d ON d.id = u.department_id
       WHERE r.status = $1 ${where}
       GROUP BY d.id, d.name
       ORDER BY "totalHours" DESC`,
      params,
    );
  }

  /** The last six calendar months including the current one, with empty months filled in. */
  async getMonthlyOtStats(actor: AuthUser) {
    const params: unknown[] = [OtStatus.APPROVED, this.timezone, MONTHS_SHOWN - 1];
    const where = scope(actor, params);
    return this.dataSource.query(
      `WITH months AS (
         SELECT generate_series(
           date_trunc('month', (now() AT TIME ZONE $2)::date) - make_interval(months => $3::int),
           date_trunc('month', (now() AT TIME ZONE $2)::date),
           interval '1 month'
         )::date AS month_start
       )
       SELECT EXTRACT(YEAR FROM m.month_start)::int AS year,
              EXTRACT(MONTH FROM m.month_start)::int AS month,
              COUNT(r.id)::int AS count,
              COALESCE(SUM(r.duration), 0)::float AS "totalHours"
       FROM months m
       LEFT JOIN (
         SELECT r.id, r.duration, r.date
         FROM ot_records r
         JOIN users u ON u.id = r.user_id
         WHERE r.status = $1 ${where}
       ) r ON date_trunc('month', r.date) = m.month_start
       GROUP BY m.month_start
       ORDER BY m.month_start`,
      params,
    );
  }

  /** Top users by approved hours this month, with the change against last month. */
  async getTopOtUsers(actor: AuthUser, limit: number) {
    const params: unknown[] = [OtStatus.APPROVED, this.timezone, limit];
    const where = scope(actor, params);
    const rows: {
      userId: number;
      firstName: string;
      lastName: string;
      departmentName: string;
      count: number;
      totalHours: number;
      previousHours: number;
    }[] = await this.dataSource.query(
      `WITH bounds AS (
         SELECT date_trunc('month', (now() AT TIME ZONE $2)::date)::date AS this_month,
                (date_trunc('month', (now() AT TIME ZONE $2)::date) - interval '1 month')::date AS last_month
       )
       SELECT u.id AS "userId",
              u.first_name AS "firstName",
              u.last_name AS "lastName",
              d.name AS "departmentName",
              COUNT(r.id) FILTER (WHERE r.date >= b.this_month)::int AS count,
              COALESCE(SUM(r.duration) FILTER (WHERE r.date >= b.this_month), 0)::float AS "totalHours",
              COALESCE(SUM(r.duration) FILTER (WHERE r.date < b.this_month), 0)::float AS "previousHours"
       FROM ot_records r
       CROSS JOIN bounds b
       JOIN users u ON u.id = r.user_id
       LEFT JOIN departments d ON d.id = u.department_id
       WHERE r.status = $1 AND r.date >= b.last_month ${where}
       GROUP BY u.id, u.first_name, u.last_name, d.name
       HAVING COUNT(r.id) FILTER (WHERE r.date >= b.this_month) > 0
       ORDER BY "totalHours" DESC
       LIMIT $3`,
      params,
    );

    return rows.map(({ firstName, lastName, previousHours, ...rest }) => ({
      ...rest,
      name: `${firstName} ${lastName}`,
      previousHours,
      // null when there's nothing to compare against (no approved OT last month)
      changePercent: previousHours > 0 ? Math.round(((rest.totalHours - previousHours) / previousHours) * 100) : null,
    }));
  }

  /** Daily approved OT for the last N days (including today), with empty days filled in. */
  async getOtTrends(actor: AuthUser, days: number) {
    const params: unknown[] = [OtStatus.APPROVED, this.timezone, days - 1];
    const where = scope(actor, params);
    return this.dataSource.query(
      `WITH days AS (
         SELECT generate_series(
           (now() AT TIME ZONE $2)::date - $3::int,
           (now() AT TIME ZONE $2)::date,
           interval '1 day'
         )::date AS day
       )
       SELECT to_char(dy.day, 'YYYY-MM-DD') AS date,
              COUNT(r.id)::int AS count,
              COALESCE(SUM(r.duration), 0)::float AS "totalHours"
       FROM days dy
       LEFT JOIN (
         SELECT r.id, r.duration, r.date
         FROM ot_records r
         JOIN users u ON u.id = r.user_id
         WHERE r.status = $1 ${where}
       ) r ON r.date = dy.day
       GROUP BY dy.day
       ORDER BY dy.day`,
      params,
    );
  }
}
