-- ============================================================
-- NutriCare — Doctor Portal Tables Migration (FIXED)
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- ─── 0. Cleanup (safe drop in correct dependency order) ──────
DROP TABLE IF EXISTS public.consultation_messages CASCADE;
DROP TABLE IF EXISTS public.consultations CASCADE;

-- ─── 1. consultations ────────────────────────────────────────
CREATE TABLE public.consultations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id    UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  medic_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consultations_medic_id  ON public.consultations(medic_id);
CREATE INDEX idx_consultations_parent_id ON public.consultations(parent_id);
CREATE INDEX idx_consultations_status    ON public.consultations(status);

-- ─── 2. consultation_messages ────────────────────────────────
CREATE TABLE public.consultation_messages (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id   UUID        NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  sender_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content           TEXT        NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cm_consultation_id ON public.consultation_messages(consultation_id);
CREATE INDEX idx_cm_created_at      ON public.consultation_messages(created_at);

-- ─── 3. Row Level Security ────────────────────────────────────

ALTER TABLE public.consultations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_messages ENABLE ROW LEVEL SECURITY;

-- Consultations: medic atau parent yang terlibat bisa akses
CREATE POLICY "consult_rls"
  ON public.consultations
  FOR ALL
  TO authenticated
  USING (
    medic_id  = auth.uid()
    OR parent_id = auth.uid()
  )
  WITH CHECK (
    medic_id  = auth.uid()
    OR parent_id = auth.uid()
  );

-- Messages: peserta konsultasi bisa baca & tulis pesan
CREATE POLICY "messages_rls"
  ON public.consultation_messages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.consultations c
      WHERE c.id = consultation_messages.consultation_id
        AND (c.medic_id = auth.uid() OR c.parent_id = auth.uid())
    )
  )
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.consultations c
      WHERE c.id = consultation_messages.consultation_id
        AND (c.medic_id = auth.uid() OR c.parent_id = auth.uid())
    )
  );

-- ─── 4. Enable Realtime ───────────────────────────────────────
-- Setelah run SQL ini, lakukan di Supabase Dashboard:
--   Database → Replication → supabase_realtime
--   Centang tabel: consultation_messages dan consultations

-- ─── DONE ─────────────────────────────────────────────────────
