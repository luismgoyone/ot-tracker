import { DataSource } from 'typeorm';

/**
 * Development/test sample data: 5 departments, 16 users (password: password123) and OT
 * records dated relative to today so the dashboard has recent data.
 */
export const SEED_SQL = `
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

INSERT INTO ot_records (user_id, date, start_time, end_time, duration, reason, status, approved_by)
SELECT * FROM (VALUES
  -- casts on the first row set the column types for the whole VALUES list
  (6, CURRENT_DATE - 115, '18:00'::time, '21:00'::time, 3.0::decimal, 'System migration support during off-hours', 'approved', 1),
  (6, CURRENT_DATE - 102, '17:30', '19:30', 2.0, 'Hotfix deployment for production incident', 'approved', 1),
  (6, CURRENT_DATE - 87, '18:00', '20:00', 2.0, 'Year-end infrastructure audit', 'approved', 1),
  (6, CURRENT_DATE - 49, '17:00', '18:30', 1.5, 'Sprint retrospective and backlog grooming', 'pending', NULL),
  (7, CURRENT_DATE - 137, '17:30', '20:00', 2.5, 'Quarterly sales report compilation', 'approved', 5),
  (7, CURRENT_DATE - 82, '18:00', '21:30', 3.5, 'End-of-year client proposals preparation', 'approved', 5),
  (7, CURRENT_DATE - 23, '17:00', '19:00', 2.0, 'New client onboarding documentation', 'pending', NULL),
  (8, CURRENT_DATE - 161, '17:00', '19:00', 2.0, 'Budget reconciliation for Q3', 'approved', 1),
  (8, CURRENT_DATE - 121, '18:00', '20:30', 2.5, 'Audit preparation and document review', 'approved', 1),
  (8, CURRENT_DATE - 98, '17:30', '20:00', 2.5, 'Financial forecast modeling for next quarter', 'approved', 1),
  (8, CURRENT_DATE - 72, '18:00', '21:00', 3.0, 'Year-end closing entries and reconciliation', 'approved', 1),
  (8, CURRENT_DATE - 34, '17:00', '18:30', 1.5, 'Tax filing preparation', 'rejected', 1),
  (9, CURRENT_DATE - 110, '18:00', '20:00', 2.0, 'HR policy review and update drafting', 'approved', 1),
  (9, CURRENT_DATE - 14, '17:30', '19:30', 2.0, 'Performance review calibration session', 'pending', NULL),
  (10, CURRENT_DATE - 200, '17:00', '20:00', 3.0, 'Trade show booth setup and coordination', 'approved', 5),
  (10, CURRENT_DATE - 176, '18:00', '20:30', 2.5, 'Campaign asset review and feedback session', 'approved', 5),
  (10, CURRENT_DATE - 133, '17:30', '19:30', 2.0, 'Social media content planning workshop', 'approved', 5),
  (10, CURRENT_DATE - 92, '18:00', '21:00', 3.0, 'Holiday campaign launch preparation', 'approved', 5),
  (10, CURRENT_DATE - 70, '17:00', '19:00', 2.0, 'Brand guideline update review', 'pending', NULL),
  (10, CURRENT_DATE - 44, '18:00', '20:00', 2.0, 'Q1 marketing strategy alignment meeting', 'pending', NULL),
  (11, CURRENT_DATE - 144, '18:00', '20:00', 2.0, 'Server maintenance during scheduled downtime', 'approved', 1),
  (11, CURRENT_DATE - 79, '17:30', '20:30', 3.0, 'CI/CD pipeline overhaul and testing', 'approved', 1),
  (11, CURRENT_DATE - 8, '17:00', '19:00', 2.0, 'Security patch rollout validation', 'pending', NULL),
  (12, CURRENT_DATE - 166, '18:00', '20:30', 2.5, 'New employee onboarding program development', 'approved', 9),
  (12, CURRENT_DATE - 117, '17:30', '19:30', 2.0, 'Benefits enrollment support for open period', 'approved', 9),
  (12, CURRENT_DATE - 89, '18:00', '21:00', 3.0, 'Year-end HR compliance documentation', 'approved', 9),
  (12, CURRENT_DATE - 39, '17:00', '18:30', 1.5, 'Policy handbook revision', 'rejected', 9),
  (13, CURRENT_DATE - 106, '18:00', '20:00', 2.0, 'Tax liability analysis for Q4', 'approved', 1),
  (13, CURRENT_DATE - 18, '17:30', '19:30', 2.0, 'Financial model update for board presentation', 'pending', NULL),
  (14, CURRENT_DATE - 184, '17:00', '19:30', 2.5, 'Proposal preparation for enterprise client', 'approved', 5),
  (14, CURRENT_DATE - 142, '18:00', '21:00', 3.0, 'Sales pipeline review and CRM data cleanup', 'approved', 5),
  (14, CURRENT_DATE - 95, '17:30', '19:30', 2.0, 'Contract negotiation follow-up documentation', 'approved', 5),
  (14, CURRENT_DATE - 74, '18:00', '20:30', 2.5, 'Q4 sales performance report', 'approved', 5),
  (14, CURRENT_DATE - 29, '17:00', '18:30', 1.5, 'Lead generation campaign review', 'pending', NULL),
  (15, CURRENT_DATE - 129, '18:00', '20:30', 2.5, 'Event planning for department team-building', 'approved', 5),
  (15, CURRENT_DATE - 85, '17:30', '20:00', 2.5, 'Vendor contract review and renewal', 'approved', 5),
  (15, CURRENT_DATE - 3, '18:00', '20:00', 2.0, 'Quarterly operations review preparation', 'pending', NULL)
) AS v(user_id, date, start_time, end_time, duration, reason, status, approved_by)
WHERE NOT EXISTS (SELECT 1 FROM ot_records);
`;

/** Applies pending migrations, then inserts the sample data (no-op for rows that already exist). */
export async function seedDatabase(dataSource: DataSource): Promise<void> {
  await dataSource.runMigrations();
  await dataSource.query(SEED_SQL);
}
