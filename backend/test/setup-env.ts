// Defaults for the e2e suite; CI and local runs can override any of these.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET ??= 'test-secret-that-is-long-enough-for-tests';
process.env.DATABASE_HOST ??= 'localhost';
process.env.DATABASE_PORT ??= '5432';
process.env.DATABASE_USER ??= 'postgres';
process.env.DATABASE_PASSWORD ??= 'password';
process.env.DATABASE_NAME ??= 'ot_tracker_test';
