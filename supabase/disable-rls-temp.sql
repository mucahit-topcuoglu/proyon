-- ============================================================================
-- TEMPORARY FIX: Disable RLS for Testing (Without Auth)
-- UYARI: Bu sadece development için! Production'da authentication eklenecek
-- ============================================================================

-- Geçici olarak RLS'i devre dışı bırak (Development Only)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_nodes DISABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_logs DISABLE ROW LEVEL SECURITY;

-- Collaboration tables için de devre dışı bırak
ALTER TABLE IF EXISTS project_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS project_invitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public_shares DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public_share_views DISABLE ROW LEVEL SECURITY;

-- Comments table için de devre dışı bırak
ALTER TABLE IF EXISTS project_comments DISABLE ROW LEVEL SECURITY;

SELECT 'RLS disabled for all tables - ready for testing' as status;

-- NOT: Authentication eklenince RLS tekrar aktifleştirilecek
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE roadmap_nodes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE mentor_logs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE project_invitations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public_shares ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public_share_views ENABLE ROW LEVEL SECURITY;
