-- =====================================================
-- 🔄 CLEAN INVITATION SYSTEM SETUP
-- =====================================================
-- Önce tüm policy'leri temizle, sonra tekrar oluştur
-- =====================================================

-- =============================================
-- 1. DROP EXISTING POLICIES
-- =============================================
DROP POLICY IF EXISTS "select_own_memberships" ON project_members;
DROP POLICY IF EXISTS "select_project_members" ON project_members;
DROP POLICY IF EXISTS "insert_project_members" ON project_members;
DROP POLICY IF EXISTS "delete_project_members" ON project_members;
DROP POLICY IF EXISTS "update_project_members" ON project_members;

DROP POLICY IF EXISTS "select_own_invitations" ON project_invitations;
DROP POLICY IF EXISTS "select_project_invitations" ON project_invitations;
DROP POLICY IF EXISTS "insert_project_invitations" ON project_invitations;
DROP POLICY IF EXISTS "update_own_invitations" ON project_invitations;
DROP POLICY IF EXISTS "delete_project_invitations" ON project_invitations;

DROP POLICY IF EXISTS "select_public_shares" ON public_shares;
DROP POLICY IF EXISTS "manage_project_shares" ON public_shares;

-- =============================================
-- 2. CREATE TABLES (IF NOT EXISTS)
-- =============================================

CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer',
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  can_edit BOOLEAN DEFAULT false,
  can_manage_tasks BOOLEAN DEFAULT false,
  can_invite BOOLEAN DEFAULT false,
  UNIQUE(project_id, user_id)
);

CREATE TABLE IF NOT EXISTS project_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  role TEXT NOT NULL DEFAULT 'viewer',
  token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days',
  UNIQUE(project_id, email)
);

CREATE TABLE IF NOT EXISTS public_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  share_token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  allow_comments BOOLEAN DEFAULT false,
  show_timeline BOOLEAN DEFAULT true,
  show_stats BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(project_id)
);

CREATE TABLE IF NOT EXISTS public_share_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID NOT NULL REFERENCES public_shares(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT
);

-- =============================================
-- 3. ADD EMAIL TRACKING COLUMNS
-- =============================================
ALTER TABLE project_invitations
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_opened_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_click_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS accepted_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS category_ids TEXT[] DEFAULT '{}';

-- =============================================
-- 4. CREATE INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_project ON project_invitations(project_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON project_invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON project_invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email_sent ON project_invitations(email_sent_at) WHERE email_sent_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invitations_accepted ON project_invitations(accepted_at) WHERE accepted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_public_shares_token ON public_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_public_shares_project ON public_shares(project_id);

-- =============================================
-- 5. ENABLE ROW LEVEL SECURITY
-- =============================================
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_share_views ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 6. CREATE FRESH POLICIES - PROJECT MEMBERS
-- =============================================

CREATE POLICY "select_own_memberships"
  ON project_members FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "select_project_members"
  ON project_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_members.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "insert_project_members"
  ON project_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_members.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "delete_project_members"
  ON project_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_members.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- =============================================
-- 7. CREATE FRESH POLICIES - INVITATIONS
-- =============================================

CREATE POLICY "select_own_invitations"
  ON project_invitations FOR SELECT
  USING (email = auth.email());

CREATE POLICY "select_project_invitations"
  ON project_invitations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_invitations.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "insert_project_invitations"
  ON project_invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_invitations.project_id
      AND projects.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = project_invitations.project_id
      AND project_members.user_id = auth.uid()
      AND project_members.can_invite = true
    )
  );

CREATE POLICY "update_own_invitations"
  ON project_invitations FOR UPDATE
  USING (email = auth.email());

CREATE POLICY "delete_project_invitations"
  ON project_invitations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_invitations.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- =============================================
-- 8. CREATE FRESH POLICIES - PUBLIC SHARES
-- =============================================

CREATE POLICY "select_public_shares"
  ON public_shares FOR SELECT
  USING (is_active = true);

CREATE POLICY "manage_project_shares"
  ON public_shares FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = public_shares.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- =============================================
-- 9. COMMENTS
-- =============================================
COMMENT ON TABLE project_members IS 'Proje ekip üyeleri';
COMMENT ON TABLE project_invitations IS 'Bekleyen proje davetleri';
COMMENT ON TABLE public_shares IS 'Public paylaşım linkleri';
COMMENT ON TABLE public_share_views IS 'Public paylaşım görüntülenmeleri';

COMMENT ON COLUMN project_invitations.email_sent_at IS 'Email gönderim zamanı';
COMMENT ON COLUMN project_invitations.email_opened_at IS 'Email ilk açılma zamanı';
COMMENT ON COLUMN project_invitations.email_click_count IS 'Link tıklama sayısı';
COMMENT ON COLUMN project_invitations.accepted_at IS 'Davet kabul edilme zamanı';
COMMENT ON COLUMN project_invitations.accepted_by IS 'Daveti kabul eden kullanıcı';
COMMENT ON COLUMN project_invitations.category_ids IS 'Erişim kısıtlaması olan kategoriler (boşsa tüm kategoriler)';

-- =============================================
-- 10. SUCCESS MESSAGE
-- =============================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ INVITATION SYSTEM SETUP COMPLETED!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Tables: Ready';
  RAISE NOTICE '🔐 Security: Enabled';
  RAISE NOTICE '📧 Email Tracking: Configured';
  RAISE NOTICE '✨ Policies: Fresh & Updated';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Test Now:';
  RAISE NOTICE '   → http://localhost:3000/dashboard';
  RAISE NOTICE '   → Project → Team → Invite Member';
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;
