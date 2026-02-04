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
('carol.wilson@company.com', '$2a$10$E8S.pAH6wdU8DFxevY.OhOmksIm07B5ns60NFJamAabcgxPawYTUK', 'Carol', 'Wilson', 'supervisor', 4)
ON CONFLICT (email) DO NOTHING;

-- Insert sample OT records
INSERT INTO ot_records (user_id, date, start_time, end_time, duration, reason, status, approved_by) VALUES
(2, '2024-01-15', '18:00', '20:30', 2.5, 'Emergency bug fix for critical production issue', 'approved', 1),
(2, '2024-01-20', '17:30', '19:00', 1.5, 'Completing project deliverables for client deadline', 'approved', 1),
(3, '2024-01-18', '18:00', '21:00', 3.0, 'Preparing materials for upcoming presentation', 'approved', 5),
(4, '2024-01-22', '17:00', '19:30', 2.5, 'Client meeting preparation and follow-up', 'pending', NULL),
(2, '2024-01-25', '16:30', '18:00', 1.5, 'Code review and testing for new feature release', 'pending', NULL);

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