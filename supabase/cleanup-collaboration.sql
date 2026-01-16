-- Drop all existing policies and tables for collaboration system
-- Run this first to clean up

-- Disable RLS first to avoid conflicts
ALTER TABLE IF EXISTS project_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS project_invitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public_shares DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public_share_views DISABLE ROW LEVEL SECURITY;

-- Drop ALL policies with simplified names
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on project_members
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'project_members') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON project_members', r.policyname);
    END LOOP;
    
    -- Drop all policies on project_invitations
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'project_invitations') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON project_invitations', r.policyname);
    END LOOP;
    
    -- Drop all policies on public_shares
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'public_shares') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public_shares', r.policyname);
    END LOOP;
    
    -- Drop all policies on public_share_views
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'public_share_views') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public_share_views', r.policyname);
    END LOOP;
END $$;

-- Drop tables
DROP TABLE IF EXISTS public_share_views CASCADE;
DROP TABLE IF EXISTS public_shares CASCADE;
DROP TABLE IF EXISTS project_invitations CASCADE;
DROP TABLE IF EXISTS project_members CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS user_has_project_access(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS get_user_project_role(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS increment_share_views(uuid, text, text) CASCADE;

-- Verify cleanup
SELECT 'All collaboration tables, policies, and functions dropped successfully' as status;
