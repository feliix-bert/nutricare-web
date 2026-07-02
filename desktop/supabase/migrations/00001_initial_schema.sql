-- ============================================================================
-- GiziChain — Migration 00001: Initial Schema
-- ============================================================================
-- Target: Supabase PostgreSQL
-- Description: Enum types, tables, triggers, indexes, and RLS policies
-- ============================================================================

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. ENUM TYPES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TYPE role_enum AS ENUM ('PARENT', 'MEDIC', 'POSYANDU', 'ADMIN');
CREATE TYPE gender_enum AS ENUM ('MALE', 'FEMALE');
CREATE TYPE stunt_enum AS ENUM ('NORMAL', 'AT_RISK', 'STUNTED', 'SEVERELY_STUNTED');
CREATE TYPE pred_status_enum AS ENUM ('PENDING', 'COMPLETED', 'FAILED');
CREATE TYPE anchor_enum AS ENUM ('PENDING', 'CONFIRMED', 'FAILED');
CREATE TYPE vc_type_enum AS ENUM ('IMMUNIZATION_COMPLETE', 'NUTRITION_STATUS', 'GROWTH_MILESTONE');

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. TABLES
-- ═══════════════════════════════════════════════════════════════════════════

-- 2.1 public.users — profile extending auth.users
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role role_enum NOT NULL DEFAULT 'PARENT',
  wallet_address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.2 children
CREATE TABLE public.children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  gender gender_enum NOT NULL,
  anon_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.3 assessments
CREATE TABLE public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  weight DOUBLE PRECISION NOT NULL,
  height DOUBLE PRECISION NOT NULL,
  head_circumference DOUBLE PRECISION,
  bf_exclusive BOOLEAN NOT NULL DEFAULT false,
  mpasi_age INTEGER,
  meal_freq INTEGER,
  illness_history TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.4 predictions
CREATE TABLE public.predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL UNIQUE REFERENCES public.assessments(id) ON DELETE CASCADE,
  stunt_status stunt_enum NOT NULL DEFAULT 'NORMAL',
  prediction_status pred_status_enum NOT NULL DEFAULT 'PENDING',
  zscore_wa DOUBLE PRECISION,
  zscore_ha DOUBLE PRECISION,
  zscore_wh DOUBLE PRECISION,
  risk_level INTEGER,
  summary TEXT,
  recommendations JSONB,
  next_assessment_date DATE,
  disclaimer TEXT NOT NULL DEFAULT 'Hasil ini bersifat skrining awal dan bukan diagnosis medis. Konsultasikan dengan dokter atau tenaga kesehatan.',
  gemini_raw JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.5 nutrition_logs
CREATE TABLE public.nutrition_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  photo_url TEXT,
  food_detected TEXT[],
  portion_estimate TEXT,
  calories DOUBLE PRECISION,
  protein DOUBLE PRECISION,
  carbs DOUBLE PRECISION,
  fat DOUBLE PRECISION,
  fiber DOUBLE PRECISION,
  adequacy_note TEXT,
  mpasi_recommendation TEXT,
  gemini_raw JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.6 chat_sessions
CREATE TABLE public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id UUID NOT NULL REFERENCES public.predictions(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.7 blockchain_anchors
CREATE TABLE public.blockchain_anchors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL UNIQUE REFERENCES public.assessments(id) ON DELETE CASCADE,
  record_hash TEXT NOT NULL,
  tx_hash TEXT,
  block_number INTEGER,
  contract_address TEXT,
  anchor_status anchor_enum NOT NULL DEFAULT 'PENDING',
  anchored_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.8 verifiable_credentials
CREATE TABLE public.verifiable_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  issuer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  vc_type vc_type_enum NOT NULL,
  ipfs_cid TEXT NOT NULL,
  tx_hash TEXT,
  is_revoked BOOLEAN NOT NULL DEFAULT false,
  revoke_tx_hash TEXT,
  expires_at TIMESTAMPTZ,
  wallet_address TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. TRIGGER: handle_new_user
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, name, role, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    'PARENT',
    true
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. INDEXES
-- ═══════════════════════════════════════════════════════════════════════════

-- users
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_is_active ON public.users(is_active);

-- children
CREATE INDEX idx_children_user_id ON public.children(user_id);
CREATE INDEX idx_children_anon_id ON public.children(anon_id);
CREATE INDEX idx_children_birth_date ON public.children(birth_date);

-- assessments
CREATE INDEX idx_assessments_child_id ON public.assessments(child_id);
CREATE INDEX idx_assessments_created_at ON public.assessments(created_at DESC);

-- predictions
CREATE INDEX idx_predictions_assessment_id ON public.predictions(assessment_id);
-- Partial index: most queries only care about PENDING predictions (polling)
CREATE INDEX idx_predictions_pending ON public.predictions(prediction_status)
  WHERE prediction_status = 'PENDING';
-- Composite: status + stunt_status sering dipakai bareng di dashboard
CREATE INDEX idx_predictions_status_stunt ON public.predictions(prediction_status, stunt_status);

-- nutrition_logs
CREATE INDEX idx_nutrition_logs_child_id ON public.nutrition_logs(child_id);
-- BRIN lebih efisien buat time-series (10-100x lebih kecil dari BTREE)
CREATE INDEX idx_nutrition_logs_created_at ON public.nutrition_logs USING brin(created_at)
  WITH (pages_per_range = 32);

-- chat_sessions
CREATE INDEX idx_chat_sessions_prediction_id ON public.chat_sessions(prediction_id);
-- Composite untuk RLS policy yang JOIN 3 tabel
CREATE INDEX idx_children_user_id_id ON public.children(user_id, id);

-- blockchain_anchors
CREATE INDEX idx_blockchain_anchors_assessment_id ON public.blockchain_anchors(assessment_id);
-- Partial index: queries mostly check PENDING anchors (retry queue)
CREATE INDEX idx_anchors_pending ON public.blockchain_anchors(anchor_status)
  WHERE anchor_status = 'PENDING';

-- verifiable_credentials
CREATE INDEX idx_vc_child_id ON public.verifiable_credentials(child_id);
CREATE INDEX idx_vc_issuer_id ON public.verifiable_credentials(issuer_id);
CREATE INDEX idx_vc_type ON public.verifiable_credentials(vc_type);
-- Partial index: most queries filter non-revoked VCs
CREATE INDEX idx_vc_active ON public.verifiable_credentials(is_revoked)
  WHERE is_revoked = false;

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════

-- 5.1 users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own" ON public.users
  FOR SELECT USING ((select auth.uid()) = id);

CREATE POLICY "users_admin_all" ON public.users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = (select auth.uid()) AND role = 'ADMIN')
  );

-- 5.2 children
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "children_parent_own" ON public.children
  FOR ALL USING (user_id = (select auth.uid()));

CREATE POLICY "children_medic_admin_all" ON public.children
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = (select auth.uid()) AND role IN ('MEDIC', 'ADMIN'))
  );

-- 5.3 assessments
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assessments_parent_own" ON public.assessments
  FOR ALL USING (
    child_id IN (SELECT id FROM public.children WHERE user_id = (select auth.uid()))
  );

CREATE POLICY "assessments_medic_admin_all" ON public.assessments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = (select auth.uid()) AND role IN ('MEDIC', 'ADMIN'))
  );

-- 5.4 predictions
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "predictions_parent_own" ON public.predictions
  FOR SELECT USING (
    assessment_id IN (
      SELECT a.id FROM public.assessments a
      JOIN public.children c ON c.id = a.child_id
      WHERE c.user_id = (select auth.uid())
    )
  );

CREATE POLICY "predictions_medic_admin_all" ON public.predictions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = (select auth.uid()) AND role IN ('MEDIC', 'ADMIN'))
  );

-- 5.5 nutrition_logs
ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nutrition_parent_own" ON public.nutrition_logs
  FOR ALL USING (
    child_id IN (SELECT id FROM public.children WHERE user_id = (select auth.uid()))
  );

CREATE POLICY "nutrition_medic_admin_all" ON public.nutrition_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = (select auth.uid()) AND role IN ('MEDIC', 'ADMIN'))
  );

-- 5.6 chat_sessions
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

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
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = (select auth.uid()) AND role IN ('MEDIC', 'ADMIN'))
  );

-- 5.7 blockchain_anchors
ALTER TABLE public.blockchain_anchors ENABLE ROW LEVEL SECURITY;

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
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = (select auth.uid()) AND role IN ('MEDIC', 'ADMIN'))
  );

-- 5.8 verifiable_credentials
ALTER TABLE public.verifiable_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vc_medic_insert" ON public.verifiable_credentials
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = (select auth.uid()) AND role = 'MEDIC')
  );

CREATE POLICY "vc_parent_read_own" ON public.verifiable_credentials
  FOR SELECT USING (
    child_id IN (SELECT id FROM public.children WHERE user_id = (select auth.uid()))
  );

CREATE POLICY "vc_medic_admin_all" ON public.verifiable_credentials
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = (select auth.uid()) AND role IN ('MEDIC', 'ADMIN'))
  );

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. AUTO-UPDATE updated_at TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at_users
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_children
  BEFORE UPDATE ON public.children
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_predictions
  BEFORE UPDATE ON public.predictions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_chat_sessions
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
