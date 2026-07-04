-- ============================================================================
-- GiziChain — Migration 00000: Rollback (DROP ALL)
-- ============================================================================
-- Urutan terbalik: policies → triggers → tabel → enums
-- ============================================================================

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. DROP RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "users_read_own" ON public.users;
DROP POLICY IF EXISTS "users_admin_all" ON public.users;

DROP POLICY IF EXISTS "children_parent_own" ON public.children;
DROP POLICY IF EXISTS "children_medic_admin_all" ON public.children;

DROP POLICY IF EXISTS "assessments_parent_own" ON public.assessments;
DROP POLICY IF EXISTS "assessments_medic_admin_all" ON public.assessments;

DROP POLICY IF EXISTS "predictions_parent_own" ON public.predictions;
DROP POLICY IF EXISTS "predictions_medic_admin_all" ON public.predictions;

DROP POLICY IF EXISTS "nutrition_parent_own" ON public.nutrition_logs;
DROP POLICY IF EXISTS "nutrition_medic_admin_all" ON public.nutrition_logs;

DROP POLICY IF EXISTS "chat_parent_own" ON public.chat_sessions;
DROP POLICY IF EXISTS "chat_medic_admin_all" ON public.chat_sessions;

DROP POLICY IF EXISTS "anchors_insert_server" ON public.blockchain_anchors;
DROP POLICY IF EXISTS "anchors_read_own" ON public.blockchain_anchors;
DROP POLICY IF EXISTS "anchors_medic_admin_all" ON public.blockchain_anchors;

DROP POLICY IF EXISTS "vc_medic_insert" ON public.verifiable_credentials;
DROP POLICY IF EXISTS "vc_parent_read_own" ON public.verifiable_credentials;
DROP POLICY IF EXISTS "vc_medic_admin_all" ON public.verifiable_credentials;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. DROP TRIGGERS & FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TRIGGER IF EXISTS set_updated_at_users ON public.users;
DROP TRIGGER IF EXISTS set_updated_at_children ON public.children;
DROP TRIGGER IF EXISTS set_updated_at_predictions ON public.predictions;
DROP TRIGGER IF EXISTS set_updated_at_chat_sessions ON public.chat_sessions;
DROP FUNCTION IF EXISTS public.set_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. DROP TABLES (with CASCADE)
-- ═══════════════════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS public.verifiable_credentials CASCADE;
DROP TABLE IF EXISTS public.blockchain_anchors CASCADE;
DROP TABLE IF EXISTS public.chat_sessions CASCADE;
DROP TABLE IF EXISTS public.nutrition_logs CASCADE;
DROP TABLE IF EXISTS public.predictions CASCADE;
DROP TABLE IF EXISTS public.assessments CASCADE;
DROP TABLE IF EXISTS public.children CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. DROP ENUMS
-- ═══════════════════════════════════════════════════════════════════════════

DROP TYPE IF EXISTS role_enum CASCADE;
DROP TYPE IF EXISTS gender_enum CASCADE;
DROP TYPE IF EXISTS stunt_enum CASCADE;
DROP TYPE IF EXISTS pred_status_enum CASCADE;
DROP TYPE IF EXISTS anchor_enum CASCADE;
DROP TYPE IF EXISTS vc_type_enum CASCADE;
