-- ============================================
-- 💬 Node Comments System - Database Schema
-- ============================================
-- Creates table for node-level comments with threading support

-- Drop existing table if exists (for fresh install)
DROP TABLE IF EXISTS node_comments CASCADE;

-- Create node_comments table
CREATE TABLE IF NOT EXISTS node_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id UUID NOT NULL REFERENCES roadmap_nodes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Comment content
  content TEXT NOT NULL,
  
  -- Threading support
  parent_comment_id UUID REFERENCES node_comments(id) ON DELETE CASCADE,
  
  -- Mentions (array of user IDs)
  mentioned_users UUID[] DEFAULT ARRAY[]::UUID[],
  
  -- Metadata
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_node_comments_node_id ON node_comments(node_id);
CREATE INDEX idx_node_comments_user_id ON node_comments(user_id);
CREATE INDEX idx_node_comments_project_id ON node_comments(project_id);
CREATE INDEX idx_node_comments_parent_id ON node_comments(parent_comment_id);
CREATE INDEX idx_node_comments_created_at ON node_comments(created_at DESC);

-- Enable Row Level Security
ALTER TABLE node_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view comments in their projects" ON node_comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON node_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON node_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON node_comments;

-- RLS Policies
-- SELECT: Users can view comments in projects they have access to
CREATE POLICY "Users can view comments in their projects"
ON node_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = node_comments.project_id
    AND (
      p.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM project_members pm
        WHERE pm.project_id = p.id
        AND pm.user_id = auth.uid()
      )
    )
  )
);

-- INSERT: Authenticated users can create comments in projects they have access to
CREATE POLICY "Authenticated users can create comments"
ON node_comments
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = node_comments.project_id
    AND (
      p.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM project_members pm
        WHERE pm.project_id = p.id
        AND pm.user_id = auth.uid()
      )
    )
  )
);

-- UPDATE: Users can only update their own comments
CREATE POLICY "Users can update their own comments"
ON node_comments
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- DELETE: Users can delete their own comments OR project owners can delete any comment
CREATE POLICY "Users can delete their own comments"
ON node_comments
FOR DELETE
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = node_comments.project_id
    AND p.user_id = auth.uid()
  )
);

-- ============================================
-- Notification trigger for mentions
-- ============================================

-- Function to send notifications for mentions
CREATE OR REPLACE FUNCTION notify_comment_mentions()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notifications for each mentioned user
  IF NEW.mentioned_users IS NOT NULL AND array_length(NEW.mentioned_users, 1) > 0 THEN
    INSERT INTO notifications (user_id, type, title, message, link, metadata)
    SELECT 
      unnest(NEW.mentioned_users),
      'comment_mention',
      'Bir yorumda etiketlendiniz',
      'Bir görevdeki yorumda sizden bahsedildi',
      '/dashboard/projects/' || NEW.project_id || '?nodeId=' || NEW.node_id,
      jsonb_build_object(
        'comment_id', NEW.id,
        'node_id', NEW.node_id,
        'project_id', NEW.project_id,
        'mentioned_by', NEW.user_id
      )
    WHERE unnest(NEW.mentioned_users) != NEW.user_id; -- Don't notify yourself
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for comment mentions
DROP TRIGGER IF EXISTS trigger_comment_mentions ON node_comments;
CREATE TRIGGER trigger_comment_mentions
AFTER INSERT ON node_comments
FOR EACH ROW
EXECUTE FUNCTION notify_comment_mentions();

-- ============================================
-- Activity log trigger for comments
-- ============================================

CREATE OR REPLACE FUNCTION log_comment_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity_logs (
      project_id,
      user_id,
      action_type,
      metadata
    ) VALUES (
      NEW.project_id,
      NEW.user_id,
      'comment_added',
      jsonb_build_object(
        'comment_id', NEW.id,
        'node_id', NEW.node_id,
        'content_preview', LEFT(NEW.content, 100),
        'is_reply', NEW.parent_comment_id IS NOT NULL
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_log_comment_activity ON node_comments;
CREATE TRIGGER trigger_log_comment_activity
AFTER INSERT ON node_comments
FOR EACH ROW
EXECUTE FUNCTION log_comment_activity();

-- ============================================
-- Success Message
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Node comments table created successfully!';
  RAISE NOTICE '📋 Features enabled:';
  RAISE NOTICE '   - Threaded comments (replies)';
  RAISE NOTICE '   - User mentions with notifications';
  RAISE NOTICE '   - Activity logging';
  RAISE NOTICE '   - RLS policies';
END $$;
