-- ============================================================================
-- GiziChain — Migration 00004: Fix RLS security issues
-- ============================================================================
-- 1. Revoke EXECUTE on SECURITY DEFINER functions (bypass RLS risk)
-- 2. Fix blockchain_anchors RLS — restrict INSERT to service_role only
-- 3. Add WITH CHECK on UPDATE policies
-- 4. Create storage bucket for food-photos
-- ============================================================================

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. Revoke EXECUTE on SECURITY DEFINER functions
-- ═══════════════════════════════════════════════════════════════════════════
-- SECURITY DEFINER functions in public schema are callable by ALL roles by default.
-- anon & authenticated can call these directly — potential privilege escalation.

REVOKE EXECUTE ON FUNCTION public.is_admin_or_medic() FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.is_medic() FROM PUBLIC, anon, authenticated, service_role;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. Replace blockchain_anchors RLS policies
-- ═══════════════════════════════════════════════════════════════════════════
-- Old: INSERT WITH CHECK (true) — ANYONE can insert (including anon)
-- New: Only allow INSERT via SECURITY DEFINER function or service_role

DROP POLICY IF EXISTS "anchors_insert_server" ON public.blockchain_anchors;

CREATE POLICY "anchors_insert_server" ON public.blockchain_anchors
  FOR INSERT WITH CHECK ((select auth.role()) = 'service_role');

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. Add WITH CHECK on UPDATE policies (best practice)
-- ═══════════════════════════════════════════════════════════════════════════
-- Postgres RLS: UPDATE requires both USING (which rows) and WITH CHECK (what values)
-- Without WITH CHECK, users can reassign rows to other users.
-- Drop & recreate policies that use FOR ALL without explicit WITH CHECK.

-- 3.1 children — parent can only update own
DROP POLICY IF EXISTS "children_parent_own" ON public.children;
CREATE POLICY "children_parent_own" ON public.children
  FOR ALL
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- 3.2 children — medic/admin
DROP POLICY IF EXISTS "children_medic_admin_all" ON public.children;
CREATE POLICY "children_medic_admin_all" ON public.children
  FOR ALL
  USING (public.is_admin_or_medic())
  WITH CHECK (public.is_admin_or_medic());

-- 3.3 assessments — parent
DROP POLICY IF EXISTS "assessments_parent_own" ON public.assessments;
CREATE POLICY "assessments_parent_own" ON public.assessments
  FOR ALL
  USING (child_id IN (SELECT id FROM public.children WHERE user_id = (select auth.uid())))
  WITH CHECK (child_id IN (SELECT id FROM public.children WHERE user_id = (select auth.uid())));

-- 3.4 assessments — medic/admin
DROP POLICY IF EXISTS "assessments_medic_admin_all" ON public.assessments;
CREATE POLICY "assessments_medic_admin_all" ON public.assessments
  FOR ALL
  USING (public.is_admin_or_medic())
  WITH CHECK (public.is_admin_or_medic());

-- 3.5 nutrition_logs — parent
DROP POLICY IF EXISTS "nutrition_parent_own" ON public.nutrition_logs;
CREATE POLICY "nutrition_parent_own" ON public.nutrition_logs
  FOR ALL
  USING (child_id IN (SELECT id FROM public.children WHERE user_id = (select auth.uid())))
  WITH CHECK (child_id IN (SELECT id FROM public.children WHERE user_id = (select auth.uid())));

-- 3.6 nutrition_logs — medic/admin
DROP POLICY IF EXISTS "nutrition_medic_admin_all" ON public.nutrition_logs;
CREATE POLICY "nutrition_medic_admin_all" ON public.nutrition_logs
  FOR ALL
  USING (public.is_admin_or_medic())
  WITH CHECK (public.is_admin_or_medic());

-- 3.7 chat_sessions — parent
DROP POLICY IF EXISTS "chat_parent_own" ON public.chat_sessions;
CREATE POLICY "chat_parent_own" ON public.chat_sessions
  FOR ALL
  USING (prediction_id IN (
    SELECT p.id FROM public.predictions p
    JOIN public.assessments a ON a.id = p.assessment_id
    JOIN public.children c ON c.id = a.child_id
    WHERE c.user_id = (select auth.uid())
  ))
  WITH CHECK (prediction_id IN (
    SELECT p.id FROM public.predictions p
    JOIN public.assessments a ON a.id = p.assessment_id
    JOIN public.children c ON c.id = a.child_id
    WHERE c.user_id = (select auth.uid())
  ));

-- 3.8 chat_sessions — medic/admin
DROP POLICY IF EXISTS "chat_medic_admin_all" ON public.chat_sessions;
CREATE POLICY "chat_medic_admin_all" ON public.chat_sessions
  FOR ALL
  USING (public.is_admin_or_medic())
  WITH CHECK (public.is_admin_or_medic());

-- 3.9 blockchain_anchors — medic/admin
DROP POLICY IF EXISTS "anchors_medic_admin_all" ON public.blockchain_anchors;
CREATE POLICY "anchors_medic_admin_all" ON public.blockchain_anchors
  FOR ALL
  USING (public.is_admin_or_medic())
  WITH CHECK (public.is_admin_or_medic());

-- 3.10 verifiable_credentials — medic/admin
DROP POLICY IF EXISTS "vc_medic_admin_all" ON public.verifiable_credentials;
CREATE POLICY "vc_medic_admin_all" ON public.verifiable_credentials
  FOR ALL
  USING (public.is_admin_or_medic())
  WITH CHECK (public.is_admin_or_medic());

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. Create storage bucket for food-photos
-- ═══════════════════════════════════════════════════════════════════════════
-- Note: Storage RLS policies dibuat manual via Dashboard → Storage → Policies
-- karena storage schema pake auth model khusus (JWT verification required).

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('food-photos', 'food-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;
