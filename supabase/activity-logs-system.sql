-- ============================================
-- ACTIVITY LOGS SYSTEM
-- ============================================

-- Activity types enum (create only if not exists)
DO $$ BEGIN
  CREATE TYPE activity_type AS ENUM (
    'project_created',
    'project_updated',
    'project_deleted',
    'category_created',
    'category_updated',
    'category_deleted',
    'node_created',
    'node_updated',
    'node_completed',
    'node_deleted',
    'member_invited',
    'member_joined',
    'member_left',
    'member_removed',
    'member_role_changed',
    'roadmap_generated',
    'roadmap_regenerated',
    'comment_added',
    'file_uploaded',
    'project_shared'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type activity_type NOT NULL,
  action TEXT NOT NULL, -- Human-readable description: "John created Backend API category"
  entity_type TEXT, -- 'project', 'category', 'node', 'member', etc.
  entity_id UUID, -- ID of the affected entity
  metadata JSONB, -- Additional context (old_value, new_value, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_project_id ON activity_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON activity_logs(type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_project_created ON activity_logs(project_id, created_at DESC);

-- RLS Policies
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view project activities" ON activity_logs;
DROP POLICY IF EXISTS "System can insert activity logs" ON activity_logs;

-- Users can view activities of projects they're members of
CREATE POLICY "Users can view project activities"
  ON activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = activity_logs.project_id
      AND project_members.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = activity_logs.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- System can insert activity logs
CREATE POLICY "System can insert activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (true);

-- Function to get recent activities with pagination
CREATE OR REPLACE FUNCTION get_project_activities(
  p_project_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0,
  p_activity_type activity_type DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  project_id UUID,
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  type activity_type,
  action TEXT,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.project_id,
    al.user_id,
    p.full_name as user_name,
    p.email as user_email,
    al.type,
    al.action,
    al.entity_type,
    al.entity_id,
    al.metadata,
    al.created_at
  FROM activity_logs al
  LEFT JOIN profiles p ON al.user_id = p.id
  WHERE al.project_id = p_project_id
    AND (p_activity_type IS NULL OR al.type = p_activity_type)
    AND (p_user_id IS NULL OR al.user_id = p_user_id)
  ORDER BY al.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get activity count by type
CREATE OR REPLACE FUNCTION get_activity_stats(p_project_id UUID)
RETURNS TABLE (
  type activity_type,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    activity_logs.type,
    COUNT(*) as count
  FROM activity_logs
  WHERE activity_logs.project_id = p_project_id
  GROUP BY activity_logs.type
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE activity_logs IS 'Project activity timeline for audit and transparency';
COMMENT ON COLUMN activity_logs.action IS 'Human-readable description of the activity';
COMMENT ON COLUMN activity_logs.metadata IS 'Additional context stored as JSON (old_value, new_value, etc.)';
