-- ============================================================================
-- GiziChain — Migration 00002: Fix RLS infinite recursion
-- ============================================================================
-- Masalah: Policy admin_all SELECT dari public.users → trigger RLS → loop
-- Solusi: Security definer function bypass RLS buat cek role user
-- ============================================================================

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. Helper function: cek role via auth.users JWT (bypass RLS)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.is_admin_or_medic()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = (select auth.uid())
    AND role IN ('MEDIC', 'ADMIN')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = (select auth.uid())
    AND role = 'ADMIN'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_medic()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = (select auth.uid())
    AND role = 'MEDIC'
  );
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. Ganti semua RLS policy — pake function, bukan subquery langsung
-- ═══════════════════════════════════════════════════════════════════════════

-- 2.1 users
DROP POLICY IF EXISTS "users_read_own" ON public.users;
DROP POLICY IF EXISTS "users_admin_all" ON public.users;

CREATE POLICY "users_read_own" ON public.users
  FOR SELECT USING ((select auth.uid()) = id);

CREATE POLICY "users_admin_all" ON public.users
  FOR ALL USING (public.is_admin());

-- 2.2 children
DROP POLICY IF EXISTS "children_parent_own" ON public.children;
DROP POLICY IF EXISTS "children_medic_admin_all" ON public.children;

CREATE POLICY "children_parent_own" ON public.children
  FOR ALL USING (user_id = (select auth.uid()));

CREATE POLICY "children_medic_admin_all" ON public.children
  FOR ALL USING (public.is_admin_or_medic());

-- 2.3 assessments
DROP POLICY IF EXISTS "assessments_parent_own" ON public.assessments;
DROP POLICY IF EXISTS "assessments_medic_admin_all" ON public.assessments;

CREATE POLICY "assessments_parent_own" ON public.assessments
  FOR ALL USING (
    child_id IN (SELECT id FROM public.children WHERE user_id = (select auth.uid()))
  );

CREATE POLICY "assessments_medic_admin_all" ON public.assessments
  FOR ALL USING (public.is_admin_or_medic());

-- 2.4 predictions
DROP POLICY IF EXISTS "predictions_parent_own" ON public.predictions;
DROP POLICY IF EXISTS "predictions_medic_admin_all" ON public.predictions;

CREATE POLICY "predictions_parent_own" ON public.predictions
  FOR SELECT USING (
    assessment_id IN (
      SELECT a.id FROM public.assessments a
      JOIN public.children c ON c.id = a.child_id
      WHERE c.user_id = (select auth.uid())
    )
  );

CREATE POLICY "predictions_medic_admin_all" ON public.predictions
  FOR ALL USING (public.is_admin_or_medic());

-- 2.5 nutrition_logs
DROP POLICY IF EXISTS "nutrition_parent_own" ON public.nutrition_logs;
DROP POLICY IF EXISTS "nutrition_medic_admin_all" ON public.nutrition_logs;

CREATE POLICY "nutrition_parent_own" ON public.nutrition_logs
  FOR ALL USING (
    child_id IN (SELECT id FROM public.children WHERE user_id = (select auth.uid()))
  );

CREATE POLICY "nutrition_medic_admin_all" ON public.nutrition_logs
  FOR ALL USING (public.is_admin_or_medic());

-- 2.6 chat_sessions
DROP POLICY IF EXISTS "chat_parent_own" ON public.chat_sessions;
DROP POLICY IF EXISTS "chat_medic_admin_all" ON public.chat_sessions;

CREATE POLICY "chat_parent_own" ON public.chat_sessions
  FOR ALL USING (
    prediction_id IN (
      SELECT p.id FROM public.predictions p
      JOIN public.assessments a ON a.id = p.assessment_id
      JOIN public.children c ON c.id = a.child_id
      WHERE c.user_id = (select auth.uid())
    )
  );

CREATE POLICY "chat_medic_admin_all" ON public.chat_sessions
  FOR ALL USING (public.is_admin_or_medic());

-- 2.7 blockchain_anchors
DROP POLICY IF EXISTS "anchors_insert_server" ON public.blockchain_anchors;
DROP POLICY IF EXISTS "anchors_read_own" ON public.blockchain_anchors;
DROP POLICY IF EXISTS "anchors_medic_admin_all" ON public.blockchain_anchors;

CREATE POLICY "anchors_insert_server" ON public.blockchain_anchors
  FOR INSERT WITH CHECK (true);

CREATE POLICY "anchors_read_own" ON public.blockchain_anchors
  FOR SELECT USING (
    assessment_id IN (
      SELECT a.id FROM public.assessments a
      JOIN public.children c ON c.id = a.child_id
      WHERE c.user_id = (select auth.uid())
    )
  );

CREATE POLICY "anchors_medic_admin_all" ON public.blockchain_anchors
  FOR ALL USING (public.is_admin_or_medic());

-- 2.8 verifiable_credentials
DROP POLICY IF EXISTS "vc_medic_insert" ON public.verifiable_credentials;
DROP POLICY IF EXISTS "vc_parent_read_own" ON public.verifiable_credentials;
DROP POLICY IF EXISTS "vc_medic_admin_all" ON public.verifiable_credentials;

CREATE POLICY "vc_medic_insert" ON public.verifiable_credentials
  FOR INSERT WITH CHECK (public.is_medic());

CREATE POLICY "vc_parent_read_own" ON public.verifiable_credentials
  FOR SELECT USING (
    child_id IN (SELECT id FROM public.children WHERE user_id = (select auth.uid()))
  );

CREATE POLICY "vc_medic_admin_all" ON public.verifiable_credentials
  FOR ALL USING (public.is_admin_or_medic());

-- Note: function pake SECURITY DEFINER → bypass RLS.
-- Tapi tetap aman karena function nya sendiri cek auth.uid().
