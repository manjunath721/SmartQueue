-- ==============================================================================
-- SMART QUEUE: Seed Data for Local & Production PostgreSQL
-- ==============================================================================

-- Insert Roles
INSERT INTO roles (name, description) VALUES
('ROLE_ADMIN', 'Administrator with full system and queue governance privileges'),
('ROLE_STAFF', 'Staff operator responsible for calling, serving, and updating customer queues')
ON CONFLICT (name) DO NOTHING;

-- Insert Users (Passwords are BCrypt hashes)
-- admin / AdminPassword123!
-- staff_sarah / StaffPassword123!
-- staff_david / StaffPassword123!
INSERT INTO users (username, email, password, full_name, phone, active) VALUES
('admin', 'admin@smartqueue.com', '$2a$10$wE1b54oMvXoX5q/2mC1EAu8d9f4N0.kEknIqU7cM3vK0fHhB2Ym1W', 'System Administrator', '+1 (555) 019-2831', true),
('staff_sarah', 'sarah@smartqueue.com', '$2a$10$tZ2c9w3xY1oZ5q/2mC1EAu8d9f4N0.kEknIqU7cM3vK0fHhB2Ym1W', 'Sarah Jenkins', '+1 (555) 014-9982', true),
('staff_david', 'david@smartqueue.com', '$2a$10$tZ2c9w3xY1oZ5q/2mC1EAu8d9f4N0.kEknIqU7cM3vK0fHhB2Ym1W', 'David Miller', '+1 (555) 018-7741', true)
ON CONFLICT (username) DO NOTHING;

-- Assign Roles
-- Admin gets both ADMIN and STAFF roles
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'admin' AND r.name IN ('ROLE_ADMIN', 'ROLE_STAFF')
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username IN ('staff_sarah', 'staff_david') AND r.name = 'ROLE_STAFF'
ON CONFLICT DO NOTHING;

-- Insert Services
INSERT INTO services (name, code, prefix, description, avg_duration_minutes, active) VALUES
('General Inquiries & Reception', 'GEN', 'A', 'General questions, token inquiries, appointment confirmations and visitor assistance.', 10, true),
('Accounts & Billing Desk', 'BILL', 'B', 'Invoicing, settlements, payment processing, fee receipts and billing disputes.', 15, true),
('Loan & Mortgage Advisory', 'LOAN', 'C', 'Personal loans, mortgage consulting, loan refinancing and financial credit advisory.', 25, true),
('Technical Support & IT Services', 'TECH', 'D', 'Hardware diagnostic, device registration, warranty checks and troubleshooting.', 20, true)
ON CONFLICT (code) DO NOTHING;

-- Staff Assignments
INSERT INTO staff_service_assignments (user_id, service_id, counter_name)
SELECT u.id, s.id, 'Counter 1' FROM users u, services s
WHERE u.username = 'staff_sarah' AND s.code IN ('GEN', 'BILL')
ON CONFLICT DO NOTHING;

INSERT INTO staff_service_assignments (user_id, service_id, counter_name)
SELECT u.id, s.id, 'Desk 2' FROM users u, services s
WHERE u.username = 'staff_david' AND s.code IN ('LOAN', 'TECH')
ON CONFLICT DO NOTHING;
