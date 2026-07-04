-- ============================================================================
-- GiziChain — Seed Test Data
-- ============================================================================
-- Jalankan di Supabase Dashboard → SQL Editor
-- Bikin test user langsung via auth.users (pake pgcrypto buat password hash)
-- ============================================================================

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. Create test user (bypass email confirmation)
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_user_id uuid := '00000000-0000-0000-0000-000000000001';
  v_exists  boolean;
BEGIN
  SELECT EXISTS (SELECT 1 FROM auth.users WHERE id = v_user_id) INTO v_exists;

  IF NOT v_exists THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_user_meta_data, created_at, updated_at, role,
      aud, confirmation_sent_at, is_sso_user, deleted_at
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'test@nutricare.id',
      crypt('Test123!', gen_salt('bf')),
      now(),
      jsonb_build_object('name', 'Test User'),
      now(), now(),
      'authenticated',
      'authenticated',
      now(),
      false, null
    );

    INSERT INTO public.users (id, name, role, is_active)
    VALUES (v_user_id, 'Test User', 'PARENT', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. Test Children
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.children (id, user_id, name, birth_date, gender, anon_id)
VALUES
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001',
   'Anak Sehat', '2024-07-01', 'MALE', 'ANON-TEST-001'),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001',
   'Anak Berisiko', '2024-01-15', 'FEMALE', 'ANON-TEST-002')
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. Test Assessments
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.assessments (id, child_id, weight, height, head_circumference, bf_exclusive, mpasi_age, meal_freq, illness_history)
VALUES
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000010',
   10.5, 85.0, 46.0, true, 6, 3, 'Tidak ada riwayat sakit berat'),
  ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000011',
   7.2, 68.0, 43.0, false, 4, 2, 'Riwayat ISPA berulang, diare 2x dalam 3 bulan terakhir')
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. Test Predictions (PENDING)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.predictions (id, assessment_id, prediction_status)
VALUES
  ('00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000020', 'PENDING'),
  ('00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000021', 'PENDING')
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- RESULT
-- ═══════════════════════════════════════════════════════════════════════════
-- Login:   test@nutricare.id / Test123!
--
-- Test endpoints:
--   curl http://localhost:3000/api/gemini/predict
--   -H "Content-Type: application/json"
--   -d '{"assessmentId":"00000000-0000-0000-0000-000000000020"}'
--
-- ═══════════════════════════════════════════════════════════════════════════
