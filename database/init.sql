-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'regular' CHECK (role IN ('regular', 'supervisor')),
    department_id INTEGER REFERENCES departments(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ot_records table
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
);

-- Insert sample departments
INSERT INTO departments (name, description) VALUES
('Engineering', 'Software development and technical operations'),
('Human Resources', 'Employee relations and organizational development'),
('Sales', 'Business development and client relations'),
('Marketing', 'Brand management and promotional activities'),
('Finance', 'Financial planning and accounting operations')
ON CONFLICT (name) DO NOTHING;

-- Insert sample users (passwords are hashed for 'password123')
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
('mia.clark@company.com', '$2a$10$E8S.pAH6wdU8DFxevY.OhOmksIm07B5ns60NFJamAabcgxPawYTUK', 'Mia', 'Clark', 'regular', 4)
ON CONFLICT (email) DO NOTHING;

-- Insert sample OT records
INSERT INTO ot_records (user_id, date, start_time, end_time, duration, reason, status, approved_by) VALUES
-- Original records
(2, '2024-01-15', '18:00', '20:30', 2.5, 'Emergency bug fix for critical production issue', 'approved', 1),
(2, '2024-01-20', '17:30', '19:00', 1.5, 'Completing project deliverables for client deadline', 'approved', 1),
(3, '2024-01-18', '18:00', '21:00', 3.0, 'Preparing materials for upcoming presentation', 'approved', 5),
(4, '2024-01-22', '17:00', '19:30', 2.5, 'Client meeting preparation and follow-up', 'pending', NULL),
(2, '2024-01-25', '16:30', '18:00', 1.5, 'Code review and testing for new feature release', 'pending', NULL),

-- David Lee (user 6) — 4 records
(6, '2025-11-05', '18:00', '21:00', 3.0, 'System migration support during off-hours', 'approved', 1),
(6, '2025-11-18', '17:30', '19:30', 2.0, 'Hotfix deployment for production incident', 'approved', 1),
(6, '2025-12-03', '18:00', '20:00', 2.0, 'Year-end infrastructure audit', 'approved', 1),
(6, '2026-01-10', '17:00', '18:30', 1.5, 'Sprint retrospective and backlog grooming', 'pending', NULL),

-- Emma Davis (user 7) — 3 records
(7, '2025-10-14', '17:30', '20:00', 2.5, 'Quarterly sales report compilation', 'approved', 5),
(7, '2025-12-08', '18:00', '21:30', 3.5, 'End-of-year client proposals preparation', 'approved', 5),
(7, '2026-02-05', '17:00', '19:00', 2.0, 'New client onboarding documentation', 'pending', NULL),

-- Frank Garcia (user 8) — 5 records
(8, '2025-09-20', '17:00', '19:00', 2.0, 'Budget reconciliation for Q3', 'approved', 1),
(8, '2025-10-30', '18:00', '20:30', 2.5, 'Audit preparation and document review', 'approved', 1),
(8, '2025-11-22', '17:30', '20:00', 2.5, 'Financial forecast modeling for next quarter', 'approved', 1),
(8, '2025-12-18', '18:00', '21:00', 3.0, 'Year-end closing entries and reconciliation', 'approved', 1),
(8, '2026-01-25', '17:00', '18:30', 1.5, 'Tax filing preparation', 'rejected', 1),

-- Grace Martinez (user 9, supervisor) — 2 records
(9, '2025-11-10', '18:00', '20:00', 2.0, 'HR policy review and update drafting', 'approved', 1),
(9, '2026-02-14', '17:30', '19:30', 2.0, 'Performance review calibration session', 'pending', NULL),

-- Henry Taylor (user 10) — 6 records
(10, '2025-08-12', '17:00', '20:00', 3.0, 'Trade show booth setup and coordination', 'approved', 5),
(10, '2025-09-05', '18:00', '20:30', 2.5, 'Campaign asset review and feedback session', 'approved', 5),
(10, '2025-10-18', '17:30', '19:30', 2.0, 'Social media content planning workshop', 'approved', 5),
(10, '2025-11-28', '18:00', '21:00', 3.0, 'Holiday campaign launch preparation', 'approved', 5),
(10, '2025-12-20', '17:00', '19:00', 2.0, 'Brand guideline update review', 'pending', NULL),
(10, '2026-01-15', '18:00', '20:00', 2.0, 'Q1 marketing strategy alignment meeting', 'pending', NULL),

-- Irene Anderson (user 11) — 3 records
(11, '2025-10-07', '18:00', '20:00', 2.0, 'Server maintenance during scheduled downtime', 'approved', 1),
(11, '2025-12-11', '17:30', '20:30', 3.0, 'CI/CD pipeline overhaul and testing', 'approved', 1),
(11, '2026-02-20', '17:00', '19:00', 2.0, 'Security patch rollout validation', 'pending', NULL),

-- James Thomas (user 12) — 4 records
(12, '2025-09-15', '18:00', '20:30', 2.5, 'New employee onboarding program development', 'approved', 9),
(12, '2025-11-03', '17:30', '19:30', 2.0, 'Benefits enrollment support for open period', 'approved', 9),
(12, '2025-12-01', '18:00', '21:00', 3.0, 'Year-end HR compliance documentation', 'approved', 9),
(12, '2026-01-20', '17:00', '18:30', 1.5, 'Policy handbook revision', 'rejected', 9),

-- Karen White (user 13) — 2 records
(13, '2025-11-14', '18:00', '20:00', 2.0, 'Tax liability analysis for Q4', 'approved', 1),
(13, '2026-02-10', '17:30', '19:30', 2.0, 'Financial model update for board presentation', 'pending', NULL),

-- Liam Harris (user 14) — 5 records
(14, '2025-08-28', '17:00', '19:30', 2.5, 'Proposal preparation for enterprise client', 'approved', 5),
(14, '2025-10-09', '18:00', '21:00', 3.0, 'Sales pipeline review and CRM data cleanup', 'approved', 5),
(14, '2025-11-25', '17:30', '19:30', 2.0, 'Contract negotiation follow-up documentation', 'approved', 5),
(14, '2025-12-16', '18:00', '20:30', 2.5, 'Q4 sales performance report', 'approved', 5),
(14, '2026-01-30', '17:00', '18:30', 1.5, 'Lead generation campaign review', 'pending', NULL),

-- Mia Clark (user 15) — 3 records
(15, '2025-10-22', '18:00', '20:30', 2.5, 'Event planning for department team-building', 'approved', 5),
(15, '2025-12-05', '17:30', '20:00', 2.5, 'Vendor contract review and renewal', 'approved', 5),
(15, '2026-02-25', '18:00', '20:00', 2.0, 'Quarterly operations review preparation', 'pending', NULL);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_department_id ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_ot_records_user_id ON ot_records(user_id);
CREATE INDEX IF NOT EXISTS idx_ot_records_date ON ot_records(date);
CREATE INDEX IF NOT EXISTS idx_ot_records_status ON ot_records(status);
CREATE INDEX IF NOT EXISTS idx_ot_records_approved_by ON ot_records(approved_by);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating updated_at column
DROP TRIGGER IF EXISTS update_departments_updated_at ON departments;
CREATE TRIGGER update_departments_updated_at 
    BEFORE UPDATE ON departments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ot_records_updated_at ON ot_records;
CREATE TRIGGER update_ot_records_updated_at 
    BEFORE UPDATE ON ot_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();