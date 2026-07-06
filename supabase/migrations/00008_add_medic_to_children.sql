-- ============================================================
-- NutriCare — Migration 00008: Add medic_id to children
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Add medic_id column (nullable — anak bisa belum punya dokter)
ALTER TABLE public.children
  ADD COLUMN IF NOT EXISTS medic_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Index for performance (filter patients by medic)
CREATE INDEX IF NOT EXISTS idx_children_medic_id ON public.children(medic_id);

-- ─── DONE ─────────────────────────────────────────────────────
-- Jalankan ini di Supabase SQL Editor SEBELUM deploy kode baru.
