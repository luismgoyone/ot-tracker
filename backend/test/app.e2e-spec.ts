import { Test } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { SEED_SQL } from '../src/database/seed-data';

/**
 * End-to-end tests against a real Postgres database (DATABASE_NAME, default ot_tracker_test).
 * The schema is dropped and rebuilt from migrations + seed data before the suite runs.
 *
 * Seed cast used below (all passwords are password123):
 *   supervisor@company.com  supervisor, Engineering (dept 1)
 *   employee@company.com    regular,    Engineering
 *   david.lee@company.com   regular,    Engineering
 *   carol.wilson@company.com supervisor, Marketing (dept 4)
 *   admin@company.com       admin,      Engineering
 */
describe('OT Tracker API (e2e)', () => {
  let app: NestExpressApplication;
  let db: DataSource;
  const tokens: Record<string, string> = {};
  const ids: Record<string, number> = {};

  const api = () => request(app.getHttpServer());
  const as = (who: string) => ({ Authorization: `Bearer ${tokens[who]}` });
  const login = async (email: string, password = 'password123') => {
    const res = await api().post('/api/auth/login').send({ email, password }).expect(200);
    return res.body.access_token as string;
  };
  const userId = async (email: string) =>
    (await db.query(`SELECT id FROM users WHERE email = $1`, [email]))[0].id as number;
  const pendingRecordOf = async (email: string) =>
    (
      await db.query(
        `SELECT r.id FROM ot_records r JOIN users u ON u.id = r.user_id
         WHERE u.email = $1 AND r.status = 'pending' ORDER BY r.id LIMIT 1`,
        [email],
      )
    )[0].id as number;

  beforeAll(async () => {
    // Start from an empty schema; the app applies migrations on boot.
    const reset = new DataSource({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
    });
    await reset.initialize();
    await reset.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    await reset.destroy();

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication<NestExpressApplication>({ logger: ['error'] });
    configureApp(app);
    await app.init();

    db = app.get(DataSource);
    await db.query(SEED_SQL);

    for (const [key, email] of [
      ['supervisor', 'supervisor@company.com'],
      ['employee', 'employee@company.com'],
      ['david', 'david.lee@company.com'],
      ['carol', 'carol.wilson@company.com'],
      ['admin', 'admin@company.com'],
    ]) {
      tokens[key] = await login(email);
      ids[key] = await userId(email);
    }
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('auth', () => {
    it('rejects bad credentials', () =>
      api().post('/api/auth/login').send({ email: 'employee@company.com', password: 'wrong-password' }).expect(401));

    it('treats email case-insensitively', () =>
      api().post('/api/auth/login').send({ email: 'EMPLOYEE@company.com', password: 'password123' }).expect(200));

    it('requires a token on protected routes', () => api().get('/api/ot-records/my-records').expect(401));

    it('keeps /health public', () => api().get('/api/health').expect(200, { status: 'ok' }));

    it('rate-limits repeated login attempts for one account', async () => {
      const attempt = () =>
        api().post('/api/auth/login').send({ email: 'ratelimit@company.com', password: 'whatever1' });
      for (let i = 0; i < 5; i++) await attempt().expect(401);
      await attempt().expect(429);
    });

    it('locks out a user as soon as they are deactivated', async () => {
      const token = await login('mia.clark@company.com');
      await api().get('/api/auth/me').set('Authorization', `Bearer ${token}`).expect(200);
      await api()
        .patch(`/api/users/${await userId('mia.clark@company.com')}`)
        .set(as('admin'))
        .send({ isActive: false })
        .expect(200);
      await api().get('/api/auth/me').set('Authorization', `Bearer ${token}`).expect(401);
    });

    it('requires the current password to change it', async () => {
      const token = await login('liam.harris@company.com');
      const auth = { Authorization: `Bearer ${token}` };
      await api().post('/api/auth/change-password').set(auth).send({ newPassword: 'new-password-1' }).expect(400);
      await api()
        .post('/api/auth/change-password')
        .set(auth)
        .send({ currentPassword: 'nope-nope', newPassword: 'new-password-1' })
        .expect(400);
      await api()
        .post('/api/auth/change-password')
        .set(auth)
        .send({ currentPassword: 'password123', newPassword: 'new-password-1' })
        .expect(204);
      await login('liam.harris@company.com', 'new-password-1');
    });

    it('only lets users with a temporary password change it', async () => {
      const created = await api()
        .post('/api/users')
        .set(as('admin'))
        .send({
          email: 'new.hire@company.com',
          temporaryPassword: 'temporary-1',
          firstName: 'New',
          lastName: 'Hire',
          role: 'regular',
          departmentId: 1,
        })
        .expect(201);
      expect(created.body).not.toHaveProperty('password');

      const token = await login('new.hire@company.com', 'temporary-1');
      const auth = { Authorization: `Bearer ${token}` };
      await api().get('/api/ot-records/my-records').set(auth).expect(403);
      await api().get('/api/auth/me').set(auth).expect(200);
      // No current password needed when replacing a temporary one.
      await api().post('/api/auth/change-password').set(auth).send({ newPassword: 'permanent-1' }).expect(204);
      await api().get('/api/ot-records/my-records').set(auth).expect(200);
    });
  });

  describe('users', () => {
    it('never returns password hashes', async () => {
      const res = await api().get('/api/users').set(as('admin')).expect(200);
      expect(JSON.stringify(res.body)).not.toContain('$2a$');
    });

    it('scopes the supervisor user list to their department', async () => {
      const res = await api().get('/api/users').set(as('carol')).expect(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body.every((u: { departmentId: number }) => u.departmentId === 4)).toBe(true);
    });

    it('forbids employees from listing users', () => api().get('/api/users').set(as('employee')).expect(403));

    it('stops admins from deactivating themselves', () =>
      api().patch(`/api/users/${ids.admin}`).set(as('admin')).send({ isActive: false }).expect(400));

    it('returns 404 for unknown users', () => api().get('/api/users/999999').set(as('admin')).expect(404));

    it('maps an unknown department to a 400 instead of a 500', () =>
      api().patch(`/api/users/${ids.david}`).set(as('admin')).send({ departmentId: 999 }).expect(400));
  });

  describe('ot records', () => {
    it('computes the duration on the server', async () => {
      const res = await api()
        .post('/api/ot-records')
        .set(as('employee'))
        .send({ date: '2026-01-05', startTime: '18:00', endTime: '20:30', reason: 'Release support' })
        .expect(201);
      expect(res.body.duration).toBe(2.5);
      expect(res.body.status).toBe('pending');
    });

    it('rejects a client-supplied duration and bad times', async () => {
      const base = { date: '2026-01-05', startTime: '18:00', endTime: '20:30', reason: 'x' };
      await api().post('/api/ot-records').set(as('employee')).send({ ...base, duration: 11 }).expect(400);
      await api().post('/api/ot-records').set(as('employee')).send({ ...base, endTime: '25:00' }).expect(400);
      await api()
        .post('/api/ot-records')
        .set(as('employee'))
        .send({ ...base, startTime: '06:00', endTime: '19:30' })
        .expect(400);
    });

    it("forbids editing or deleting someone else's record", async () => {
      const davidsRecord = await pendingRecordOf('david.lee@company.com');
      await api().patch(`/api/ot-records/${davidsRecord}`).set(as('employee')).send({ endTime: '23:00' }).expect(403);
      await api().delete(`/api/ot-records/${davidsRecord}`).set(as('employee')).expect(403);
    });

    it('lets owners edit and delete their own pending records', async () => {
      const created = await api()
        .post('/api/ot-records')
        .set(as('david'))
        .send({ date: '2026-01-06', startTime: '18:00', endTime: '19:00', reason: 'Deploy' })
        .expect(201);
      const edited = await api()
        .patch(`/api/ot-records/${created.body.id}`)
        .set(as('david'))
        .send({ endTime: '21:00' })
        .expect(200);
      expect(edited.body.duration).toBe(3);
      await api().delete(`/api/ot-records/${created.body.id}`).set(as('david')).expect(204);
    });

    it('freezes records once they have been decided', async () => {
      const approved = (
        await db.query(
          `SELECT r.id FROM ot_records r WHERE r.user_id = $1 AND r.status = 'approved' LIMIT 1`,
          [ids.david],
        )
      )[0].id;
      await api().patch(`/api/ot-records/${approved}`).set(as('david')).send({ endTime: '23:00' }).expect(409);
      await api().delete(`/api/ot-records/${approved}`).set(as('david')).expect(409);
    });

    it('returns 404 for unknown records', () =>
      api().patch('/api/ot-records/999999').set(as('employee')).send({ reason: 'x' }).expect(404));

    it('forbids employees from listing all records', () =>
      api().get('/api/ot-records').set(as('employee')).expect(403));

    it('scopes the supervisor list to their department and hides hashes', async () => {
      const res = await api().get('/api/ot-records?limit=100').set(as('carol')).expect(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data.every((r: { user: { departmentId: number } }) => r.user.departmentId === 4)).toBe(true);
      expect(JSON.stringify(res.body)).not.toContain('$2a$');
    });

    it('searches across name, department and reason on the server', async () => {
      const res = await api().get('/api/ot-records?search=david&limit=100').set(as('admin')).expect(200);
      expect(res.body.meta.total).toBeGreaterThan(0);
      expect(res.body.data.every((r: { user: { firstName: string } }) => r.user.firstName === 'David')).toBe(true);
      // LIKE wildcards are matched literally
      const none = await api().get('/api/ot-records?search=%25').set(as('admin')).expect(200);
      expect(none.body.meta.total).toBe(0);
    });

    it('summarises all of a user\'s records, not just one page', async () => {
      const res = await api().get('/api/ot-records/my-summary').set(as('employee')).expect(200);
      const [expected] = await db.query(
        `SELECT COUNT(*)::int AS total FROM ot_records WHERE user_id = $1`,
        [ids.employee],
      );
      expect(res.body.totalRecords).toBe(expected.total);
      expect(res.body).toEqual(
        expect.objectContaining({
          pendingRecords: expect.any(Number),
          approvedHours: expect.any(Number),
          approvedHoursThisMonth: expect.any(Number),
        }),
      );
    });

    it('caps the page size', () => api().get('/api/ot-records?limit=1000').set(as('admin')).expect(400));

    describe('approvals', () => {
      it('validates the status value', async () => {
        const id = await pendingRecordOf('david.lee@company.com');
        await api().patch(`/api/ot-records/${id}/status`).set(as('supervisor')).send({ status: 'bogus' }).expect(400);
        await api().patch(`/api/ot-records/${id}/status`).set(as('supervisor')).send({ status: 'pending' }).expect(400);
      });

      it("forbids reviewing another department's records", async () => {
        const id = await pendingRecordOf('david.lee@company.com'); // Engineering
        await api().patch(`/api/ot-records/${id}/status`).set(as('carol')).send({ status: 'approved' }).expect(403);
      });

      it('forbids approving your own overtime', async () => {
        const own = await api()
          .post('/api/ot-records')
          .set(as('supervisor'))
          .send({ date: '2026-01-07', startTime: '18:00', endTime: '19:00', reason: 'Self' })
          .expect(201);
        await api()
          .patch(`/api/ot-records/${own.body.id}/status`)
          .set(as('supervisor'))
          .send({ status: 'approved' })
          .expect(403);
      });

      it('approves once, then refuses to change the decision', async () => {
        const id = await pendingRecordOf('david.lee@company.com');
        const res = await api()
          .patch(`/api/ot-records/${id}/status`)
          .set(as('supervisor'))
          .send({ status: 'approved' })
          .expect(200);
        expect(res.body).toMatchObject({ status: 'approved', approvedBy: ids.supervisor });
        await api().patch(`/api/ot-records/${id}/status`).set(as('supervisor')).send({ status: 'rejected' }).expect(409);
      });
    });
  });

  describe('analytics', () => {
    it('is supervisor-only', () => api().get('/api/analytics/dashboard').set(as('employee')).expect(403));

    it('returns six consecutive months ending this month', async () => {
      const res = await api().get('/api/analytics/monthly').set(as('admin')).expect(200);
      expect(res.body).toHaveLength(6);
      const now = new Date();
      const last = res.body[5];
      expect([last.year, last.month]).toEqual([now.getFullYear(), now.getMonth() + 1]);
    });

    it('returns one entry per day for trends', async () => {
      const res = await api().get('/api/analytics/trends?days=30').set(as('admin')).expect(200);
      expect(res.body).toHaveLength(30);
    });

    it('scopes department stats for supervisors', async () => {
      const res = await api().get('/api/analytics/by-department').set(as('carol')).expect(200);
      expect(res.body.every((d: { departmentId: number }) => d.departmentId === 4)).toBe(true);
    });

    it('counts approved overtime from this month in top users', async () => {
      const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
      const created = await api()
        .post('/api/ot-records')
        .set(as('david'))
        .send({ date: today, startTime: '18:00', endTime: '22:00', reason: 'Month-end close' })
        .expect(201);
      await api()
        .patch(`/api/ot-records/${created.body.id}/status`)
        .set(as('supervisor'))
        .send({ status: 'approved' })
        .expect(200);

      const res = await api().get('/api/analytics/top-users').set(as('supervisor')).expect(200);
      const david = res.body.find((u: { userId: number }) => u.userId === ids.david);
      expect(david).toMatchObject({ name: 'David Lee', totalHours: expect.any(Number) });
      expect(david.totalHours).toBeGreaterThanOrEqual(4);
      expect(david).toHaveProperty('changePercent');
    });
  });
});
