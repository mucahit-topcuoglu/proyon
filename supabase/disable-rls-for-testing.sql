-- =====================================================
-- 🔓 TEMPORARY: DISABLE RLS FOR TESTING
-- =====================================================
-- Bu dosyayı Supabase SQL Editor'de çalıştır
-- Test sonrası RLS'yi tekrar aktive edebilirsin
-- =====================================================

-- 1. Disable RLS temporarily
ALTER TABLE project_invitations DISABLE ROW LEVEL SECURITY;

-- 2. Success message
DO $$
BEGIN
  RAISE NOTICE '⚠️ RLS disabled for project_invitations table';
  RAISE NOTICE '✅ You can now test invitations';
  RAISE NOTICE '';
  RAISE NOTICE '⚡ To re-enable RLS after testing, run:';
  RAISE NOTICE '   ALTER TABLE project_invitations ENABLE ROW LEVEL SECURITY;';
END $$;
