-- =============================================
-- COMMENTS SYSTEM for Public Projects
-- =============================================

CREATE TABLE IF NOT EXISTS project_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  share_id UUID REFERENCES public_shares(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Comment content
  content TEXT NOT NULL,
  author_name TEXT, -- For anonymous/non-auth users
  author_email TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_edited BOOLEAN DEFAULT FALSE,
  
  -- Moderation
  is_approved BOOLEAN DEFAULT TRUE,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_project_comments_project ON project_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_share ON project_comments(share_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_created ON project_comments(created_at DESC);

-- RLS Policies
ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved comments
CREATE POLICY "select_project_comments"
  ON project_comments FOR SELECT
  TO authenticated, anon
  USING (is_approved = TRUE AND is_deleted = FALSE);

-- Authenticated users can create comments
CREATE POLICY "insert_project_comments"
  ON project_comments FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Anonymous users can also comment (if enabled)
CREATE POLICY "insert_project_comments_anon"
  ON project_comments FOR INSERT
  TO anon
  WITH CHECK (author_name IS NOT NULL AND author_email IS NOT NULL);

-- Users can update their own comments
CREATE POLICY "update_project_comments"
  ON project_comments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Project owners can delete any comment
CREATE POLICY "delete_project_comments"
  ON project_comments FOR DELETE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_comment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.is_edited = TRUE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_project_comments_timestamp
BEFORE UPDATE ON project_comments
FOR EACH ROW
EXECUTE FUNCTION update_comment_timestamp();

SELECT 'Comments system created successfully' as status;
