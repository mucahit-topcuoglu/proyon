-- =====================================================
-- 🔧 FIX INVITATION POLICY - RLS ERROR
-- =====================================================
-- Problem: Sadece proje sahibi davet gönderebiliyor
-- Solution: Ekip üyeleri de (can_invite=true) gönderebilsin
-- =====================================================

-- 1. Drop existing policy
DROP POLICY IF EXISTS "insert_project_invitations" ON project_invitations;

-- 2. Create updated policy
CREATE POLICY "insert_project_invitations"
  ON project_invitations FOR INSERT
  WITH CHECK (
    -- Project owner can invite
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_invitations.project_id
      AND projects.user_id = auth.uid()
    )
    OR
    -- Team members with can_invite permission can invite
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = project_invitations.project_id
      AND project_members.user_id = auth.uid()
      AND project_members.can_invite = true
    )
  );

-- 3. Verify
DO $$
BEGIN
  RAISE NOTICE '✅ Invitation policy updated successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Who can send invitations now:';
  RAISE NOTICE '   ✓ Project owners (always)';
  RAISE NOTICE '   ✓ Team members with can_invite = true';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 Test: Go to Dashboard → Project → Team → Invite Member';
END $$;
