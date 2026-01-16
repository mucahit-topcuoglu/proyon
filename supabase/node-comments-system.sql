-- ============================================
-- NODE COMMENTS & DISCUSSIONS SYSTEM
-- ============================================

-- Node comments table
CREATE TABLE IF NOT EXISTS node_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  node_id UUID NOT NULL REFERENCES roadmap_nodes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES node_comments(id) ON DELETE CASCADE, -- For threaded replies
  content TEXT NOT NULL,
  mentioned_users UUID[], -- Array of user IDs mentioned with @
  reactions JSONB DEFAULT '{}', -- {user_id: emoji} format
  edited BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_node_comments_node_id ON node_comments(node_id);
CREATE INDEX IF NOT EXISTS idx_node_comments_user_id ON node_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_node_comments_parent_id ON node_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_node_comments_created_at ON node_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_node_comments_node_created ON node_comments(node_id, created_at DESC);

-- RLS Policies
ALTER TABLE node_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view project comments" ON node_comments;
DROP POLICY IF EXISTS "Users can insert comments" ON node_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON node_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON node_comments;

-- Users can view comments of nodes in their projects
CREATE POLICY "Users can view project comments"
  ON node_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM roadmap_nodes rn
      JOIN projects p ON rn.project_id = p.id
      WHERE rn.id = node_comments.node_id
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

-- Project members can insert comments
CREATE POLICY "Users can insert comments"
  ON node_comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM roadmap_nodes rn
      JOIN projects p ON rn.project_id = p.id
      WHERE rn.id = node_comments.node_id
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

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
  ON node_comments FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON node_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Function to get comments with user info and reply counts
CREATE OR REPLACE FUNCTION get_node_comments(
  p_node_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  node_id UUID,
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  parent_comment_id UUID,
  content TEXT,
  mentioned_users UUID[],
  reactions JSONB,
  edited BOOLEAN,
  reply_count BIGINT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.node_id,
    c.user_id,
    p.full_name as user_name,
    p.email as user_email,
    c.parent_comment_id,
    c.content,
    c.mentioned_users,
    c.reactions,
    c.edited,
    (SELECT COUNT(*) FROM node_comments replies WHERE replies.parent_comment_id = c.id) as reply_count,
    c.created_at,
    c.updated_at
  FROM node_comments c
  LEFT JOIN profiles p ON c.user_id = p.id
  WHERE c.node_id = p_node_id
  ORDER BY c.created_at ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get comment replies
CREATE OR REPLACE FUNCTION get_comment_replies(
  p_parent_comment_id UUID,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  node_id UUID,
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  parent_comment_id UUID,
  content TEXT,
  mentioned_users UUID[],
  reactions JSONB,
  edited BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.node_id,
    c.user_id,
    p.full_name as user_name,
    p.email as user_email,
    c.parent_comment_id,
    c.content,
    c.mentioned_users,
    c.reactions,
    c.edited,
    c.created_at,
    c.updated_at
  FROM node_comments c
  LEFT JOIN profiles p ON c.user_id = p.id
  WHERE c.parent_comment_id = p_parent_comment_id
  ORDER BY c.created_at ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add reaction to comment
CREATE OR REPLACE FUNCTION toggle_comment_reaction(
  p_comment_id UUID,
  p_user_id UUID,
  p_emoji TEXT
)
RETURNS JSONB AS $$
DECLARE
  current_reactions JSONB;
  updated_reactions JSONB;
BEGIN
  -- Get current reactions
  SELECT reactions INTO current_reactions
  FROM node_comments
  WHERE id = p_comment_id;

  -- Toggle reaction (add if not exists, remove if exists)
  IF current_reactions ? p_user_id::TEXT THEN
    IF current_reactions->p_user_id::TEXT = to_jsonb(p_emoji) THEN
      -- Remove reaction
      updated_reactions := current_reactions - p_user_id::TEXT;
    ELSE
      -- Update reaction
      updated_reactions := jsonb_set(current_reactions, ARRAY[p_user_id::TEXT], to_jsonb(p_emoji));
    END IF;
  ELSE
    -- Add new reaction
    updated_reactions := jsonb_set(
      COALESCE(current_reactions, '{}'::JSONB),
      ARRAY[p_user_id::TEXT],
      to_jsonb(p_emoji)
    );
  END IF;

  -- Update comment
  UPDATE node_comments
  SET reactions = updated_reactions
  WHERE id = p_comment_id;

  RETURN updated_reactions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE node_comments IS 'Node-level comments and discussions with threading support';
COMMENT ON COLUMN node_comments.parent_comment_id IS 'Parent comment ID for threaded replies';
COMMENT ON COLUMN node_comments.mentioned_users IS 'Array of user IDs mentioned with @ in the comment';
COMMENT ON COLUMN node_comments.reactions IS 'JSON object with user_id as key and emoji as value';
