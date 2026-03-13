-- Migration 001: Add admin role, is_active, and must_change_password
-- Run this against existing databases that were initialized before this feature.

-- 1. Extend CHECK constraint to include 'admin'
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('regular', 'supervisor', 'admin'));

-- 2. Add is_active column
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- 3. Add must_change_password column
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT FALSE;

-- 4. Seed admin user (password: password123)
INSERT INTO users (email, password, first_name, last_name, role, department_id, is_active, must_change_password)
VALUES (
  'admin@company.com',
  '$2a$10$E8S.pAH6wdU8DFxevY.OhOmksIm07B5ns60NFJamAabcgxPawYTUK',
  'System', 'Admin', 'admin', 1, TRUE, FALSE
) ON CONFLICT (email) DO NOTHING;
