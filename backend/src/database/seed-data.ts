import { DataSource, EntityManager } from 'typeorm';

/**
 * Demo data: 5 departments, 16 users (password: password123) and ~76 OT records spread
 * over the last six months, dated relative to today so every dashboard view has data.
 * Used by `npm run seed` (local) and the monthly demo refresh (see refresh-demo.ts).
 */
const DEMO_ORG_SQL = `
INSERT INTO departments (name, description) VALUES
('Engineering', 'Software development and technical operations'),
('Human Resources', 'Employee relations and organizational development'),
('Sales', 'Business development and client relations'),
('Marketing', 'Brand management and promotional activities'),
('Finance', 'Financial planning and accounting operations')
ON CONFLICT (name) DO NOTHING;

INSERT INTO users (email, password, first_name, last_name, role, department_id) VALUES
('supervisor@company.com', '$2a$10$E8S.pAH6wdU8DFxevY.OhOmksIm07B5ns60NFJamAabcgxPawYTUK', 'John', 'Supervisor', 'supervisor', 1),
('employee@company.com', '$2a$10$E8S.pAH6wdU8DFxevY.OhOmksIm07B5ns60NFJamAabcgxPawYTUK', 'Jane', 'Employee', 'regular', 1),
('alice.smith@company.com', '$2a$10$E8S.pAH6wdU8DFxevY.OhOmksIm07B5ns60NFJamAabcgxPawYTUK', 'Alice', 'Smith', 'regular', 2),
('bob.jones@company.com', '$2a$10$E8S.pAH6wdU8DFxevY.OhOmksIm07B5ns60NFJamAabcgxPawYTUK', 'Bob', 'Jones', 'regular', 3),
('carol.wilson@company.com', '$2a$10$E8S.pAH6wdU8DFxevY.OhOmksIm07B5ns60NFJamAabcgxPawYTUK', 'Carol', 'Wilson', 'supervisor', 4),
('david.lee@company.com', '$2a$10$E8S.pAH6wdU8DFxevY.OhOmksIm07B5ns60NFJamAabcgxPawYTUK', 'David', 'Lee', 'regular', 1),
('emma.davis@company.com', '$2a$10$E8S.pAH6wdU8DFxevY.OhOmksIm07B5ns60NFJamAabcgxPawYTUK', 'Emma', 'Davis', 'regular', 3),
('frank.garcia@company.com', '$2a$10$E8S.pAH6wdU8DFxevY.OhOmksIm07B5ns60NFJamAabcgxPawYTUK', 'Frank', 'Garcia', 'regular', 5),
('grace.martinez@company.com', '$2a$10$E8S.pAH6wdU8DFxevY.OhOmksIm07B5ns60NFJamAabcgxPawYTUK', 'Grace', 'Martinez', 'supervisor', 2),
('henry.taylor@company.com', '$2a$10$E8S.pAH6wdU8DFxevY.OhOmksIm07B5ns60NFJamAabcgxPawYTUK', 'Henry', 'Taylor', 'regular', 4),
('irene.anderson@company.com', '$2a$10$E8S.pAH6wdU8DFxevY.OhOmksIm07B5ns60NFJamAabcgxPawYTUK', 'Irene', 'Anderson', 'regular', 1),
('james.thomas@company.com', '$2a$10$E8S.pAH6wdU8DFxevY.OhOmksIm07B5ns60NFJamAabcgxPawYTUK', 'James', 'Thomas', 'regular', 2),
('karen.white@company.com', '$2a$10$E8S.pAH6wdU8DFxevY.OhOmksIm07B5ns60NFJamAabcgxPawYTUK', 'Karen', 'White', 'regular', 5),
('liam.harris@company.com', '$2a$10$E8S.pAH6wdU8DFxevY.OhOmksIm07B5ns60NFJamAabcgxPawYTUK', 'Liam', 'Harris', 'regular', 3),
('mia.clark@company.com', '$2a$10$E8S.pAH6wdU8DFxevY.OhOmksIm07B5ns60NFJamAabcgxPawYTUK', 'Mia', 'Clark', 'regular', 4),
('admin@company.com', '$2a$10$E8S.pAH6wdU8DFxevY.OhOmksIm07B5ns60NFJamAabcgxPawYTUK', 'System', 'Admin', 'admin', 1)
ON CONFLICT (email) DO NOTHING;
`;

/**
 * Demo OT records, linked to users by email so they work whatever ids the users have.
 * The last ~10 days are pending (something to approve); older records are mostly approved.
 */
const DEMO_RECORDS_SQL = `
INSERT INTO ot_records (user_id, date, start_time, end_time, duration, reason, status, approved_by)
SELECT u.id, CURRENT_DATE - v.days_ago, v.start_time, v.end_time, v.duration, v.reason, v.status, a.id
FROM (VALUES
  -- casts on the first row set the column types for the whole VALUES list
  ('alice.smith@company.com', 175, '19:00'::time, '23:00'::time, 4.0::decimal, 'Performance review calibration', 'approved', 'grace.martinez@company.com'::text),
  ('alice.smith@company.com', 148, '18:00', '20:00', 2.0, 'Performance review calibration', 'approved', 'grace.martinez@company.com'),
  ('alice.smith@company.com', 115, '17:00', '19:00', 2.0, 'Policy handbook revision', 'approved', 'grace.martinez@company.com'),
  ('alice.smith@company.com', 99, '18:00', '20:00', 2.0, 'Performance review calibration', 'approved', 'grace.martinez@company.com'),
  ('alice.smith@company.com', 73, '17:00', '19:00', 2.0, 'Policy handbook revision', 'approved', 'grace.martinez@company.com'),
  ('alice.smith@company.com', 5, '17:30', '19:30', 2.0, 'Benefits enrollment support', 'pending', NULL),
  ('bob.jones@company.com', 113, '17:30', '19:30', 2.0, 'Pipeline review with regional leads', 'approved', 'admin@company.com'),
  ('bob.jones@company.com', 54, '17:00', '19:00', 2.0, 'Pipeline review with regional leads', 'approved', 'admin@company.com'),
  ('bob.jones@company.com', 42, '18:30', '21:00', 2.5, 'Enterprise proposal preparation', 'approved', 'admin@company.com'),
  ('bob.jones@company.com', 1, '17:00', '19:00', 2.0, 'Enterprise proposal preparation', 'pending', NULL),
  ('carol.wilson@company.com', 137, '17:00', '20:30', 3.5, 'Trade show booth setup', 'approved', 'admin@company.com'),
  ('carol.wilson@company.com', 94, '18:30', '21:00', 2.5, 'Campaign launch preparation', 'approved', 'admin@company.com'),
  ('carol.wilson@company.com', 92, '18:00', '21:00', 3.0, 'Social media content planning', 'approved', 'admin@company.com'),
  ('carol.wilson@company.com', 58, '18:00', '21:00', 3.0, 'Social media content planning', 'approved', 'admin@company.com'),
  ('carol.wilson@company.com', 43, '18:30', '21:00', 2.5, 'Product launch event', 'approved', 'admin@company.com'),
  ('carol.wilson@company.com', 8, '18:30', '21:00', 2.5, 'Social media content planning', 'pending', NULL),
  ('david.lee@company.com', 159, '18:00', '20:00', 2.0, 'Database migration window', 'approved', 'supervisor@company.com'),
  ('david.lee@company.com', 145, '17:30', '19:30', 2.0, 'CI/CD pipeline fixes', 'approved', 'supervisor@company.com'),
  ('david.lee@company.com', 53, '18:30', '21:00', 2.5, 'Sprint deadline for client feature', 'approved', 'supervisor@company.com'),
  ('david.lee@company.com', 17, '17:30', '19:30', 2.0, 'Load testing before launch', 'approved', 'supervisor@company.com'),
  ('david.lee@company.com', 16, '18:00', '21:00', 3.0, 'Security patch rollout', 'approved', 'supervisor@company.com'),
  ('david.lee@company.com', 7, '18:30', '21:00', 2.5, 'Sprint deadline for client feature', 'pending', NULL),
  ('david.lee@company.com', 5, '22:00', '01:00', 3.0, 'Load testing before launch', 'pending', NULL),
  ('david.lee@company.com', 2, '19:00', '23:00', 4.0, 'On-call infrastructure maintenance', 'pending', NULL),
  ('emma.davis@company.com', 158, '22:00', '01:00', 3.0, 'CRM data cleanup', 'approved', 'admin@company.com'),
  ('emma.davis@company.com', 97, '17:30', '19:30', 2.0, 'Client contract follow-up', 'approved', 'admin@company.com'),
  ('emma.davis@company.com', 39, '18:30', '21:00', 2.5, 'Client contract follow-up', 'approved', 'admin@company.com'),
  ('emma.davis@company.com', 4, '17:30', '19:30', 2.0, 'Quarter-end sales reporting', 'pending', NULL),
  ('employee@company.com', 150, '17:30', '19:30', 2.0, 'Security patch rollout', 'approved', 'supervisor@company.com'),
  ('employee@company.com', 148, '17:00', '20:30', 3.5, 'Database migration window', 'approved', 'supervisor@company.com'),
  ('employee@company.com', 102, '17:00', '20:30', 3.5, 'Release deployment support', 'approved', 'supervisor@company.com'),
  ('employee@company.com', 13, '17:00', '19:00', 2.0, 'Database migration window', 'approved', 'supervisor@company.com'),
  ('employee@company.com', 3, '18:30', '21:00', 2.5, 'Release deployment support', 'pending', NULL),
  ('frank.garcia@company.com', 141, '18:00', '21:00', 3.0, 'Audit preparation', 'rejected', 'admin@company.com'),
  ('frank.garcia@company.com', 34, '18:00', '20:00', 2.0, 'Audit preparation', 'approved', 'admin@company.com'),
  ('frank.garcia@company.com', 6, '17:30', '19:30', 2.0, 'Board presentation financial model', 'pending', NULL),
  ('frank.garcia@company.com', 0, '17:00', '20:30', 3.5, 'Board presentation financial model', 'pending', NULL),
  ('grace.martinez@company.com', 141, '18:00', '21:00', 3.0, 'Recruitment drive interviews', 'rejected', 'admin@company.com'),
  ('grace.martinez@company.com', 103, '17:30', '19:30', 2.0, 'Benefits enrollment support', 'approved', 'admin@company.com'),
  ('grace.martinez@company.com', 72, '19:00', '23:00', 4.0, 'Benefits enrollment support', 'approved', 'admin@company.com'),
  ('grace.martinez@company.com', 36, '17:00', '20:30', 3.5, 'Policy handbook revision', 'approved', 'admin@company.com'),
  ('grace.martinez@company.com', 6, '18:00', '20:00', 2.0, 'Policy handbook revision', 'pending', NULL),
  ('henry.taylor@company.com', 94, '19:00', '23:00', 4.0, 'Trade show booth setup', 'approved', 'carol.wilson@company.com'),
  ('henry.taylor@company.com', 90, '17:30', '19:30', 2.0, 'Campaign launch preparation', 'approved', 'carol.wilson@company.com'),
  ('henry.taylor@company.com', 57, '17:00', '19:00', 2.0, 'Brand guideline review', 'approved', 'carol.wilson@company.com'),
  ('henry.taylor@company.com', 27, '22:00', '01:00', 3.0, 'Product launch event', 'approved', 'carol.wilson@company.com'),
  ('henry.taylor@company.com', 21, '22:00', '01:00', 3.0, 'Trade show booth setup', 'approved', 'carol.wilson@company.com'),
  ('henry.taylor@company.com', 3, '22:00', '01:00', 3.0, 'Trade show booth setup', 'pending', NULL),
  ('irene.anderson@company.com', 172, '22:00', '01:00', 3.0, 'Release deployment support', 'approved', 'supervisor@company.com'),
  ('irene.anderson@company.com', 108, '17:30', '19:30', 2.0, 'Sprint deadline for client feature', 'approved', 'supervisor@company.com'),
  ('irene.anderson@company.com', 20, '22:00', '01:00', 3.0, 'Load testing before launch', 'approved', 'supervisor@company.com'),
  ('irene.anderson@company.com', 11, '18:30', '21:00', 2.5, 'On-call infrastructure maintenance', 'approved', 'supervisor@company.com'),
  ('irene.anderson@company.com', 8, '17:00', '19:00', 2.0, 'Sprint deadline for client feature', 'pending', NULL),
  ('james.thomas@company.com', 137, '17:30', '19:30', 2.0, 'Performance review calibration', 'approved', 'grace.martinez@company.com'),
  ('james.thomas@company.com', 108, '19:00', '23:00', 4.0, 'Performance review calibration', 'approved', 'grace.martinez@company.com'),
  ('james.thomas@company.com', 38, '17:00', '19:00', 2.0, 'Recruitment drive interviews', 'approved', 'grace.martinez@company.com'),
  ('james.thomas@company.com', 5, '17:00', '19:00', 2.0, 'Benefits enrollment support', 'pending', NULL),
  ('james.thomas@company.com', 2, '18:30', '21:00', 2.5, 'Benefits enrollment support', 'pending', NULL),
  ('karen.white@company.com', 151, '19:00', '23:00', 4.0, 'Board presentation financial model', 'approved', 'admin@company.com'),
  ('karen.white@company.com', 84, '18:30', '21:00', 2.5, 'Board presentation financial model', 'approved', 'admin@company.com'),
  ('karen.white@company.com', 67, '19:00', '23:00', 4.0, 'Month-end closing entries', 'approved', 'admin@company.com'),
  ('karen.white@company.com', 8, '18:00', '20:00', 2.0, 'Board presentation financial model', 'pending', NULL),
  ('liam.harris@company.com', 123, '17:00', '19:00', 2.0, 'CRM data cleanup', 'approved', 'admin@company.com'),
  ('liam.harris@company.com', 88, '18:30', '21:00', 2.5, 'Pipeline review with regional leads', 'approved', 'admin@company.com'),
  ('liam.harris@company.com', 68, '17:00', '19:00', 2.0, 'Pipeline review with regional leads', 'approved', 'admin@company.com'),
  ('liam.harris@company.com', 2, '17:30', '19:30', 2.0, 'CRM data cleanup', 'pending', NULL),
  ('mia.clark@company.com', 163, '18:00', '20:00', 2.0, 'Product launch event', 'approved', 'carol.wilson@company.com'),
  ('mia.clark@company.com', 102, '17:00', '19:00', 2.0, 'Social media content planning', 'approved', 'carol.wilson@company.com'),
  ('mia.clark@company.com', 86, '18:00', '20:00', 2.0, 'Trade show booth setup', 'approved', 'carol.wilson@company.com'),
  ('mia.clark@company.com', 23, '19:00', '23:00', 4.0, 'Campaign launch preparation', 'approved', 'carol.wilson@company.com'),
  ('mia.clark@company.com', 7, '22:00', '01:00', 3.0, 'Brand guideline review', 'pending', NULL),
  ('supervisor@company.com', 167, '19:00', '23:00', 4.0, 'Release deployment support', 'rejected', 'admin@company.com'),
  ('supervisor@company.com', 102, '19:00', '23:00', 4.0, 'Release deployment support', 'rejected', 'admin@company.com'),
  ('supervisor@company.com', 39, '18:00', '21:00', 3.0, 'CI/CD pipeline fixes', 'rejected', 'admin@company.com'),
  ('supervisor@company.com', 13, '17:30', '19:30', 2.0, 'Production incident hotfix', 'approved', 'admin@company.com'),
  ('supervisor@company.com', 1, '18:00', '21:00', 3.0, 'Production incident hotfix', 'pending', NULL)
) AS v(email, days_ago, start_time, end_time, duration, reason, status, approver_email)
JOIN users u ON u.email = v.email
LEFT JOIN users a ON a.email = v.approver_email;
`;

/** Local/test seed: adds the demo org and, if there are no OT records yet, the demo records. */
export const SEED_SQL = `${DEMO_ORG_SQL}
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM ot_records) THEN
    ${DEMO_RECORDS_SQL.trim()}
  END IF;
END $$;
`;

/** Applies pending migrations, then inserts the sample data (no-op for rows that already exist). */
export async function seedDatabase(dataSource: DataSource): Promise<void> {
  await dataSource.runMigrations();
  await dataSource.query(SEED_SQL);
}

/**
 * Replaces every OT record with a fresh set of demo records dated relative to today.
 * Users and departments are left as they are (missing demo users are added back).
 */
export async function refreshDemoRecords(manager: EntityManager): Promise<{ records: number }> {
  await manager.query(DEMO_ORG_SQL);
  await manager.query('DELETE FROM ot_records');
  await manager.query(DEMO_RECORDS_SQL);
  const [{ count }] = await manager.query('SELECT COUNT(*)::int AS count FROM ot_records');
  return { records: count };
}
