-- =============================================
-- 🤝 COLLABORATION & SHARING UPDATE
-- =============================================
-- Proje işbirliği ve paylaşım özellikleri
-- - Ekip üyeleri (project members)
-- - Davet sistemi (invitations)
-- - Roller ve izinler (roles & permissions)
-- - Public sharing

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
-- 2. PROJECT INVITATIONS TABLE
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
-- 3. PUBLIC SHARES TABLE
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
-- 4. PUBLIC SHARE VIEWS TABLE
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
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_project ON project_invitations(project_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON project_invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON project_invitations(token);
CREATE INDEX IF NOT EXISTS idx_public_shares_token ON public_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_public_shares_project ON public_shares(project_id);

-- =============================================
-- RLS POLICIES
-- =============================================

-- Project Members Policies
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view members of their projects
CREATE POLICY "select_project_members"
  ON project_members FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Allow project owners to insert members
CREATE POLICY "insert_project_members"
  ON project_members FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Allow project owners and members themselves to delete
CREATE POLICY "delete_project_members"
  ON project_members FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Allow role updates by project owners
CREATE POLICY "update_project_members"
  ON project_members FOR UPDATE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Project Invitations Policies
ALTER TABLE project_invitations ENABLE ROW LEVEL SECURITY;

-- Allow viewing invitations for project owners and inviter
CREATE POLICY "select_project_invitations"
  ON project_invitations FOR SELECT
  TO authenticated
  USING (
    invited_by = auth.uid()
    OR
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Allow project owners to create invitations
CREATE POLICY "insert_project_invitations"
  ON project_invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Allow project owners to delete invitations
CREATE POLICY "delete_project_invitations"
  ON project_invitations FOR DELETE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Allow updating invitation status
CREATE POLICY "update_project_invitations"
  ON project_invitations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Public Shares Policies
ALTER TABLE public_shares ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view active public shares
CREATE POLICY "select_public_shares"
  ON public_shares FOR SELECT
  TO authenticated, anon
  USING (
    is_active = true
    OR
    created_by = auth.uid()
  );

-- Allow project owners to create shares
CREATE POLICY "insert_public_shares"
  ON public_shares FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Allow creators to update their shares
CREATE POLICY "update_public_shares"
  ON public_shares FOR UPDATE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Allow creators to delete shares
CREATE POLICY "delete_public_shares"
  ON public_shares FOR DELETE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Public Share Views Policies
ALTER TABLE public_share_views ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create view records (for tracking)
CREATE POLICY "insert_public_share_views"
  ON public_share_views FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Allow share creators to view analytics
CREATE POLICY "select_public_share_views"
  ON public_share_views FOR SELECT
  TO authenticated
  USING (
    share_id IN (
      SELECT ps.id FROM public_shares ps
      JOIN projects p ON p.id = ps.project_id
      WHERE p.user_id = auth.uid()
    )
  );

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to check if user has access to project
CREATE OR REPLACE FUNCTION user_has_project_access(p_project_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM projects WHERE id = p_project_id AND user_id = p_user_id
  ) OR EXISTS (
    SELECT 1 FROM project_members WHERE project_id = p_project_id AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user role in project
CREATE OR REPLACE FUNCTION get_user_project_role(p_project_id UUID, p_user_id UUID)
RETURNS TEXT AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM projects WHERE id = p_project_id AND user_id = p_user_id) THEN
    RETURN 'owner';
  ELSE
    RETURN (
      SELECT role FROM project_members 
      WHERE project_id = p_project_id AND user_id = p_user_id
      LIMIT 1
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- UTILITY FUNCTIONS
-- =============================================

-- Increment share view count
CREATE OR REPLACE FUNCTION increment_share_views(share_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public_shares
  SET 
    view_count = view_count + 1,
    last_viewed_at = NOW()
  WHERE id = share_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- UPDATE EXISTING TABLES
-- =============================================

-- Update projects table to support public sharing
ALTER TABLE projects 
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS allow_collaboration BOOLEAN DEFAULT false;

-- Update projects RLS to allow public access
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;

CREATE POLICY "Users can view their own projects or public projects"
  ON projects FOR SELECT
  USING (
    user_id = auth.uid() 
    OR is_public = true
    OR id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
  );

-- =============================================
-- SAMPLE DATA (for testing)
-- =============================================

-- Note: Run this only in development
-- INSERT INTO project_members (project_id, user_id, role, can_edit, can_manage_tasks)
-- VALUES 
--   ('project-uuid', 'user-uuid', 'editor', true, true);

COMMENT ON TABLE project_members IS 'Proje ekip üyeleri ve rolleri';
COMMENT ON TABLE project_invitations IS 'Bekleyen proje davetleri';
COMMENT ON TABLE public_shares IS 'Public paylaşım linkleri ve ayarları';
COMMENT ON TABLE public_share_views IS 'Public paylaşım görüntülenme istatistikleri';
