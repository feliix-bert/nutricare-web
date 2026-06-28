-- =============================================
-- Seed: Admin User
-- Run this after init-enum-types.sql
-- =============================================
-- Password: Admin123!
-- Hash ini harus digenerate pake BCryptPasswordEncoder
-- Cara generate: register dulu via API, lalu query hash dari DB
INSERT INTO users (id, name, email, password_hash, role, is_active, created_at, updated_at)
VALUES (
    'admin_cuid_001',
    'Admin Nutricare',
    'admin@nutricare.com',
    '$2a$10$PLACEHOLDER_YOU_NEED_TO_REPLACE_THIS_HASH',
    'ADMIN',
    true,
    NOW(),
    NOW()
);
