-- =====================================================
-- 🚀 COMPLETE INVITATION SYSTEM SETUP
-- =====================================================
-- Bu dosya davet sistemi için gerekli tüm tabloları oluşturur
-- Sırayla çalıştırılmalı: Önce tablolar, sonra email tracking
-- =====================================================

-- =============================================
-- 1. PROJECT MEMBERS TABLE
-- =============================================
-- Projeye eklenen ekip üyeleri
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer', -- owner, editor, viewer
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Permissions
  can_edit BOOLEAN DEFAULT false,        -- Proje detaylarını düzenleyebilir
  can_manage_tasks BOOLEAN DEFAULT false, -- Görevleri yönetebilir
  can_invite BOOLEAN DEFAULT false,       -- Başkalarını davet edebilir
  
  UNIQUE(project_id, user_id)
);

-- =============================================
-- 2. PROJECT INVITATIONS TABLE (BASE)
-- =============================================
-- Bekleyen davetler
CREATE TABLE IF NOT EXISTS project_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  role TEXT NOT NULL DEFAULT 'viewer',
  token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, accepted, rejected, expired
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days',
  
  UNIQUE(project_id, email)
);

-- =============================================
-- 3. ADD EMAIL TRACKING COLUMNS
-- =============================================
-- Email gönderim ve izleme için ek kolonlar
ALTER TABLE project_invitations
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_opened_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_click_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS accepted_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS category_ids TEXT[] DEFAULT '{}';

-- =============================================
-- 4. PUBLIC SHARES TABLE
-- =============================================
-- Public paylaşım linkleri ve istatistikleri
CREATE TABLE IF NOT EXISTS public_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  share_token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  
  -- Settings
  is_active BOOLEAN DEFAULT true,
  allow_comments BOOLEAN DEFAULT false,
  show_timeline BOOLEAN DEFAULT true,
  show_stats BOOLEAN DEFAULT true,
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(project_id)
);

-- =============================================
-- 5. PUBLIC SHARE VIEWS TABLE
-- =============================================
-- Public paylaşım görüntülenme kayıtları
CREATE TABLE IF NOT EXISTS public_share_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID NOT NULL REFERENCES public_shares(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT
);

-- =============================================
-- 6. INDEXES
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
-- 7. ENABLE ROW LEVEL SECURITY
-- =============================================
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_share_views ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 8. RLS POLICIES - PROJECT MEMBERS
-- =============================================

-- Members can view their own memberships
CREATE POLICY "select_own_memberships"
  ON project_members FOR SELECT
  USING (auth.uid() = user_id);

-- Project owners can view all members
CREATE POLICY "select_project_members"
  ON project_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_members.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Project owners can add members
CREATE POLICY "insert_project_members"
  ON project_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_members.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Project owners can remove members
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
-- 9. RLS POLICIES - INVITATIONS
-- =============================================

-- Users can view invitations sent to them
CREATE POLICY "select_own_invitations"
  ON project_invitations FOR SELECT
  USING (email = auth.email());

-- Project owners can view all invitations
CREATE POLICY "select_project_invitations"
  ON project_invitations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_invitations.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Project owners and members with can_invite permission can create invitations
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

-- Recipients can update their invitations (accept/reject)
CREATE POLICY "update_own_invitations"
  ON project_invitations FOR UPDATE
  USING (email = auth.email());

-- Project owners can cancel invitations
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
-- 10. RLS POLICIES - PUBLIC SHARES
-- =============================================

-- Anyone can view active public shares (by token)
CREATE POLICY "select_public_shares"
  ON public_shares FOR SELECT
  USING (is_active = true);

-- Project owners can create/update/delete shares
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
-- 11. COMMENTS
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
-- 12. SUCCESS MESSAGE
-- =============================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ INVITATION SYSTEM SETUP COMPLETED!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Tables Created:';
  RAISE NOTICE '   ✓ project_members - Ekip üyeleri';
  RAISE NOTICE '   ✓ project_invitations - Davet sistemi';
  RAISE NOTICE '   ✓ public_shares - Public paylaşım';
  RAISE NOTICE '   ✓ public_share_views - Görüntülenme istatistikleri';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Security:';
  RAISE NOTICE '   ✓ Row Level Security enabled';
  RAISE NOTICE '   ✓ Policies configured';
  RAISE NOTICE '';
  RAISE NOTICE '📧 Email Tracking:';
  RAISE NOTICE '   ✓ email_sent_at - Gönderim zamanı';
  RAISE NOTICE '   ✓ email_opened_at - Açılma zamanı';
  RAISE NOTICE '   ✓ email_click_count - Tıklama sayısı';
  RAISE NOTICE '   ✓ category_ids - Kategori kısıtlaması';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next Steps:';
  RAISE NOTICE '   1. npm run dev';
  RAISE NOTICE '   2. Dashboard → Project → Team → Invite Member';
  RAISE NOTICE '   3. Test email delivery';
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;
