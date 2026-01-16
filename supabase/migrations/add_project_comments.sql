-- Create project_comments table if not exists
CREATE TABLE IF NOT EXISTS project_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  share_id UUID REFERENCES public_shares(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT,
  author_email TEXT,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_project_comments_project_id ON project_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_share_id ON project_comments(share_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_created_at ON project_comments(created_at DESC);

-- Enable RLS
ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DO $$ 
BEGIN
  -- Drop policies if they exist (ignoring errors)
  EXECUTE 'DROP POLICY IF EXISTS "Anyone can read approved comments" ON project_comments';
  EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can insert comments" ON project_comments';
  EXECUTE 'DROP POLICY IF EXISTS "Anonymous users can insert comments" ON project_comments';
  EXECUTE 'DROP POLICY IF EXISTS "Users can update own comments" ON project_comments';
  EXECUTE 'DROP POLICY IF EXISTS "Users can delete own comments" ON project_comments';
  EXECUTE 'DROP POLICY IF EXISTS "Enable read for all" ON project_comments';
  EXECUTE 'DROP POLICY IF EXISTS "Enable insert for authenticated" ON project_comments';
  EXECUTE 'DROP POLICY IF EXISTS "Enable insert for anonymous" ON project_comments';
EXCEPTION WHEN OTHERS THEN
  NULL; -- Ignore errors
END $$;

-- Create policies
-- 1. Anyone can read approved, non-deleted comments
CREATE POLICY "Anyone can read approved comments"
  ON project_comments
  FOR SELECT
  USING (is_approved = true AND is_deleted = false);

-- 2. Authenticated users can insert comments (no user_id check for server actions)
CREATE POLICY "Authenticated users can insert comments"
  ON project_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 3. Service role can do everything (for server actions)
CREATE POLICY "Service role full access"
  ON project_comments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 4. Anonymous users can insert comments with author info
CREATE POLICY "Anonymous users can insert comments"
  ON project_comments
  FOR INSERT
  TO anon
  WITH CHECK (
    author_name IS NOT NULL 
    AND author_email IS NOT NULL
  );

-- 4. Users can update their own comments
CREATE POLICY "Users can update own comments"
  ON project_comments
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 5. Users can delete their own comments (hard delete)
CREATE POLICY "Users can delete own comments"
  ON project_comments
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_project_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  IF NEW.content IS DISTINCT FROM OLD.content THEN
    NEW.is_edited = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_project_comments_updated_at_trigger ON project_comments;
CREATE TRIGGER update_project_comments_updated_at_trigger
  BEFORE UPDATE ON project_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_project_comments_updated_at();
