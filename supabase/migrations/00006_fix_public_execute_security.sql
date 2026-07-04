-- ============================================================================
-- GiziChain — Migration 00006: Lock down PUBLIC/anon EXECUTE on functions
-- ============================================================================
-- Menindaklanjuti advisory dari Supabase advisors:
-- Function SECURITY DEFINER di public bisa dipanggil anon/authenticated via RPC.
-- Pastikan hanya yang genuinely butuh yang punya akses.
-- ============================================================================

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. handle_new_user — cuma trigger internal, ga perlu dipanggil siapapun
-- ═══════════════════════════════════════════════════════════════════════════
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon;
-- Trigger on_auth_user_created jalan sebagai owner (postgres), tetap jalan.

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. is_admin, is_medic, is_admin_or_medic — anon ga boleh execute
-- ═══════════════════════════════════════════════════════════════════════════
-- Tetap GRANT ke authenticated (dibutuhkan RLS policies).
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_medic() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin_or_medic() FROM PUBLIC, anon;

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. set_updated_at — trigger internal, anon ga boleh execute
-- ═══════════════════════════════════════════════════════════════════════════
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon;
-- Tetap GRANT ke authenticated & service_role karena dipanggil trigger
-- yang jalan sebagai user yg execute UPDATE statement.
GRANT EXECUTE ON FUNCTION public.set_updated_at() TO authenticated, service_role;
