-- ============================================================================
-- GiziChain — Migration 00005: Restore RLS Helper Function Privileges
-- ============================================================================
-- Masalah: Di migrasi 00004, fungsi is_admin_or_medic(), is_admin(), dan 
-- is_medic() dicabut hak EXECUTE-nya dari 'authenticated', sehingga saat
-- user PARENT atau MEDIC mencoba memanggil data, policy yang memanggil
-- fungsi-fungsi ini gagal dieksekusi oleh PostgreSQL.
-- Solusi: Kembalikan hak EXECUTE hanya ke role 'authenticated' dan 'service_role'.
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.is_admin_or_medic() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_medic() TO authenticated, service_role;
