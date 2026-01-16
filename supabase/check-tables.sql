-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('project_members', 'project_invitations', 'public_shares', 'public_share_views')
ORDER BY table_name;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('project_members', 'project_invitations', 'public_shares', 'public_share_views')
ORDER BY tablename, policyname;
