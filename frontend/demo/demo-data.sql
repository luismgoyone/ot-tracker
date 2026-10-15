-- Extra approved OT for the demo recording only (applied on top of `npm run seed`
-- by playwright.demo.config.ts), so the "last 30 days" and "this month" charts look busy.
-- Never run against a real database.
INSERT INTO ot_records (user_id, date, start_time, end_time, duration, reason, status, approved_by)
SELECT u.id, CURRENT_DATE - v.days_ago, v.start_time, v.end_time, v.duration, v.reason, 'approved', a.id
FROM (VALUES
  ('david.lee@company.com', 29, '18:00'::time, '21:00'::time, 3.0::decimal, 'Release deployment support', 'supervisor@company.com'::text),
  ('irene.anderson@company.com', 28, '17:30', '19:30', 2.0, 'CI/CD pipeline fixes', 'supervisor@company.com'),
  ('alice.smith@company.com', 26, '17:00', '20:00', 3.0, 'Recruitment drive interviews', 'grace.martinez@company.com'),
  ('bob.jones@company.com', 25, '18:00', '20:30', 2.5, 'Enterprise proposal preparation', 'admin@company.com'),
  ('employee@company.com', 24, '18:00', '22:00', 4.0, 'Production incident hotfix', 'supervisor@company.com'),
  ('karen.white@company.com', 22, '17:30', '20:30', 3.0, 'Month-end closing entries', 'admin@company.com'),
  ('liam.harris@company.com', 19, '17:00', '19:30', 2.5, 'Quarter-end sales reporting', 'admin@company.com'),
  ('david.lee@company.com', 18, '19:00', '23:00', 4.0, 'Database migration window', 'supervisor@company.com'),
  ('mia.clark@company.com', 15, '18:00', '21:00', 3.0, 'Campaign launch preparation', 'carol.wilson@company.com'),
  ('employee@company.com', 14, '17:30', '20:00', 2.5, 'Sprint deadline for client feature', 'supervisor@company.com'),
  ('frank.garcia@company.com', 13, '18:00', '22:00', 4.0, 'Month-end closing entries', 'admin@company.com'),
  ('emma.davis@company.com', 12, '17:00', '19:30', 2.5, 'Client contract follow-up', 'admin@company.com'),
  ('irene.anderson@company.com', 12, '18:30', '22:00', 3.5, 'Security patch rollout', 'supervisor@company.com'),
  ('david.lee@company.com', 10, '18:00', '22:30', 4.5, 'Load testing before launch', 'supervisor@company.com'),
  ('james.thomas@company.com', 10, '17:30', '19:30', 2.0, 'Performance review calibration', 'grace.martinez@company.com'),
  ('henry.taylor@company.com', 9, '18:00', '21:30', 3.5, 'Product launch event', 'carol.wilson@company.com'),
  ('employee@company.com', 9, '19:00', '22:00', 3.0, 'Release deployment support', 'supervisor@company.com'),
  ('karen.white@company.com', 6, '17:30', '21:00', 3.5, 'Board presentation financial model', 'admin@company.com'),
  ('bob.jones@company.com', 5, '18:00', '21:00', 3.0, 'Pipeline review with regional leads', 'admin@company.com'),
  ('irene.anderson@company.com', 4, '19:00', '23:00', 4.0, 'On-call infrastructure maintenance', 'supervisor@company.com'),
  ('alice.smith@company.com', 3, '17:00', '19:00', 2.0, 'Benefits enrollment support', 'grace.martinez@company.com'),
  ('mia.clark@company.com', 2, '18:00', '20:30', 2.5, 'Brand guideline review', 'carol.wilson@company.com')
) AS v(email, days_ago, start_time, end_time, duration, reason, approver_email)
JOIN users u ON u.email = v.email
JOIN users a ON a.email = v.approver_email;
