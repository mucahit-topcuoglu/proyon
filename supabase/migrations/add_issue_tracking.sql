-- =====================================================
-- ISSUE TRACKING SYSTEM
-- Bug tracking, feature requests, ve önceliklendirme
-- =====================================================

-- 1. Issues (Sorunlar ve Talepler)
CREATE TABLE IF NOT EXISTS issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  roadmap_node_id UUID REFERENCES roadmap_nodes(id) ON DELETE SET NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  
  -- Issue temel bilgileri
  title TEXT NOT NULL,
  description TEXT,
  issue_type TEXT NOT NULL CHECK (issue_type IN ('bug', 'feature', 'improvement', 'task', 'question')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'wont_fix')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  
  -- Kullanıcı bilgileri
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Metadata
  severity TEXT CHECK (severity IN ('minor', 'major', 'blocker', NULL)),
  environment TEXT, -- 'production', 'development', 'staging', etc.
  affected_version TEXT,
  fixed_version TEXT,
  
  -- Voting ve engagement
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  
  -- Timestamps
  due_date TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Issue Labels (Etiketler)
CREATE TABLE IF NOT EXISTS issue_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT unique_label_per_project UNIQUE (project_id, name)
);

-- 3. Issue-Label ilişkisi (Many-to-Many)
CREATE TABLE IF NOT EXISTS issue_label_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES issue_labels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT unique_issue_label UNIQUE (issue_id, label_id)
);

-- 4. Issue Comments
CREATE TABLE IF NOT EXISTS issue_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false, -- Internal notes vs public comments
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Issue Votes (User engagement)
CREATE TABLE IF NOT EXISTS issue_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT unique_vote_per_user UNIQUE (issue_id, user_id)
);

-- 6. Issue Activity Log
CREATE TABLE IF NOT EXISTS issue_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'created', 'status_changed', 'assigned', etc.
  from_value TEXT,
  to_value TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_issues_project ON issues(project_id, status, priority);
CREATE INDEX IF NOT EXISTS idx_issues_reporter ON issues(reporter_id);
CREATE INDEX IF NOT EXISTS idx_issues_assigned ON issues(assigned_to);
CREATE INDEX IF NOT EXISTS idx_issues_type_status ON issues(issue_type, status);
CREATE INDEX IF NOT EXISTS idx_issue_labels_project ON issue_labels(project_id);
CREATE INDEX IF NOT EXISTS idx_issue_label_assignments_issue ON issue_label_assignments(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_comments_issue ON issue_comments(issue_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_issue_votes_issue ON issue_votes(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_activity_issue ON issue_activity(issue_id, created_at DESC);

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_label_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_activity ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DO $$ 
BEGIN
  -- Issues
  EXECUTE 'DROP POLICY IF EXISTS "Users can view project issues" ON issues';
  EXECUTE 'DROP POLICY IF EXISTS "Users can create project issues" ON issues';
  EXECUTE 'DROP POLICY IF EXISTS "Users can manage project issues" ON issues';
  
  -- Labels
  EXECUTE 'DROP POLICY IF EXISTS "Users can view project labels" ON issue_labels';
  EXECUTE 'DROP POLICY IF EXISTS "Users can manage project labels" ON issue_labels';
  
  -- Label Assignments
  EXECUTE 'DROP POLICY IF EXISTS "Users can view label assignments" ON issue_label_assignments';
  EXECUTE 'DROP POLICY IF EXISTS "Users can manage label assignments" ON issue_label_assignments';
  
  -- Comments
  EXECUTE 'DROP POLICY IF EXISTS "Users can view issue comments" ON issue_comments';
  EXECUTE 'DROP POLICY IF EXISTS "Users can add issue comments" ON issue_comments';
  EXECUTE 'DROP POLICY IF EXISTS "Users can edit own comments" ON issue_comments';
  
  -- Votes
  EXECUTE 'DROP POLICY IF EXISTS "Users can view issue votes" ON issue_votes';
  EXECUTE 'DROP POLICY IF EXISTS "Users can manage own votes" ON issue_votes';
  
  -- Activity
  EXECUTE 'DROP POLICY IF EXISTS "Users can view issue activity" ON issue_activity';
  
  -- Service role
  EXECUTE 'DROP POLICY IF EXISTS "Service role full access issues" ON issues';
  EXECUTE 'DROP POLICY IF EXISTS "Service role full access issue_labels" ON issue_labels';
  EXECUTE 'DROP POLICY IF EXISTS "Service role full access issue_label_assignments" ON issue_label_assignments';
  EXECUTE 'DROP POLICY IF EXISTS "Service role full access issue_comments" ON issue_comments';
  EXECUTE 'DROP POLICY IF EXISTS "Service role full access issue_votes" ON issue_votes';
  EXECUTE 'DROP POLICY IF EXISTS "Service role full access issue_activity" ON issue_activity';
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Issues Policies
CREATE POLICY "Users can view project issues"
  ON issues FOR SELECT
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      WHERE p.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM project_members pm
        WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create project issues"
  ON issues FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT p.id FROM projects p
      WHERE p.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM project_members pm
        WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage project issues"
  ON issues FOR UPDATE
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      WHERE p.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM project_members pm
        WHERE pm.project_id = p.id 
        AND pm.user_id = auth.uid()
        AND pm.can_edit = true
      )
    )
  );

-- Labels Policies
CREATE POLICY "Users can view project labels"
  ON issue_labels FOR SELECT
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      WHERE p.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM project_members pm
        WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage project labels"
  ON issue_labels FOR ALL
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      WHERE p.user_id = auth.uid()
    )
  );

-- Label Assignments Policies
CREATE POLICY "Users can view label assignments"
  ON issue_label_assignments FOR SELECT
  USING (
    issue_id IN (
      SELECT i.id FROM issues i
      WHERE i.project_id IN (
        SELECT p.id FROM projects p
        WHERE p.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM project_members pm
          WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can manage label assignments"
  ON issue_label_assignments FOR ALL
  USING (
    issue_id IN (
      SELECT i.id FROM issues i
      WHERE i.project_id IN (
        SELECT p.id FROM projects p
        WHERE p.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM project_members pm
          WHERE pm.project_id = p.id 
          AND pm.user_id = auth.uid()
          AND pm.can_edit = true
        )
      )
    )
  );

-- Comments Policies
CREATE POLICY "Users can view issue comments"
  ON issue_comments FOR SELECT
  USING (
    issue_id IN (
      SELECT i.id FROM issues i
      WHERE i.project_id IN (
        SELECT p.id FROM projects p
        WHERE p.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM project_members pm
          WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can add issue comments"
  ON issue_comments FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    issue_id IN (
      SELECT i.id FROM issues i
      WHERE i.project_id IN (
        SELECT p.id FROM projects p
        WHERE p.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM project_members pm
          WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can edit own comments"
  ON issue_comments FOR UPDATE
  USING (user_id = auth.uid());

-- Votes Policies
CREATE POLICY "Users can view issue votes"
  ON issue_votes FOR SELECT
  USING (
    issue_id IN (
      SELECT i.id FROM issues i
      WHERE i.project_id IN (
        SELECT p.id FROM projects p
        WHERE p.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM project_members pm
          WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can manage own votes"
  ON issue_votes FOR ALL
  USING (user_id = auth.uid());

-- Activity Policies
CREATE POLICY "Users can view issue activity"
  ON issue_activity FOR SELECT
  USING (
    issue_id IN (
      SELECT i.id FROM issues i
      WHERE i.project_id IN (
        SELECT p.id FROM projects p
        WHERE p.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM project_members pm
          WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
        )
      )
    )
  );

-- Service Role Full Access
CREATE POLICY "Service role full access issues"
  ON issues FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access issue_labels"
  ON issue_labels FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access issue_label_assignments"
  ON issue_label_assignments FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access issue_comments"
  ON issue_comments FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access issue_votes"
  ON issue_votes FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access issue_activity"
  ON issue_activity FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Auto-create default labels for new projects
CREATE OR REPLACE FUNCTION create_default_issue_labels()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO issue_labels (project_id, name, color, description) VALUES
    (NEW.id, 'bug', '#ef4444', 'Hata bildirimi'),
    (NEW.id, 'feature', '#3b82f6', 'Yeni özellik talebi'),
    (NEW.id, 'enhancement', '#8b5cf6', 'İyileştirme önerisi'),
    (NEW.id, 'documentation', '#06b6d4', 'Dokümantasyon'),
    (NEW.id, 'duplicate', '#64748b', 'Tekrar eden issue'),
    (NEW.id, 'wontfix', '#6b7280', 'Düzeltilmeyecek');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS create_default_issue_labels_trigger ON projects;
CREATE TRIGGER create_default_issue_labels_trigger
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION create_default_issue_labels();

-- Update issue vote counts
CREATE OR REPLACE FUNCTION update_issue_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'up' THEN
      UPDATE issues SET upvotes = upvotes + 1 WHERE id = NEW.issue_id;
    ELSE
      UPDATE issues SET downvotes = downvotes + 1 WHERE id = NEW.issue_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.vote_type = 'up' AND NEW.vote_type = 'down' THEN
      UPDATE issues SET upvotes = upvotes - 1, downvotes = downvotes + 1 WHERE id = NEW.issue_id;
    ELSIF OLD.vote_type = 'down' AND NEW.vote_type = 'up' THEN
      UPDATE issues SET upvotes = upvotes + 1, downvotes = downvotes - 1 WHERE id = NEW.issue_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'up' THEN
      UPDATE issues SET upvotes = upvotes - 1 WHERE id = OLD.issue_id;
    ELSE
      UPDATE issues SET downvotes = downvotes - 1 WHERE id = OLD.issue_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_issue_vote_counts_trigger ON issue_votes;
CREATE TRIGGER update_issue_vote_counts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON issue_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_issue_vote_counts();

-- Log issue activity
CREATE OR REPLACE FUNCTION log_issue_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO issue_activity (issue_id, user_id, action, to_value)
    VALUES (NEW.id, NEW.reporter_id, 'created', NEW.title);
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      INSERT INTO issue_activity (issue_id, user_id, action, from_value, to_value)
      VALUES (NEW.id, auth.uid(), 'status_changed', OLD.status, NEW.status);
      
      -- Update resolved/closed timestamps
      IF NEW.status = 'resolved' THEN
        NEW.resolved_at = now();
      ELSIF NEW.status = 'closed' THEN
        NEW.closed_at = now();
      END IF;
    END IF;
    
    IF OLD.priority != NEW.priority THEN
      INSERT INTO issue_activity (issue_id, user_id, action, from_value, to_value)
      VALUES (NEW.id, auth.uid(), 'priority_changed', OLD.priority, NEW.priority);
    END IF;
    
    IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
      INSERT INTO issue_activity (issue_id, user_id, action, to_value)
      VALUES (NEW.id, auth.uid(), 'assigned', NEW.assigned_to::TEXT);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS log_issue_activity_trigger ON issues;
CREATE TRIGGER log_issue_activity_trigger
  AFTER INSERT OR UPDATE ON issues
  FOR EACH ROW
  EXECUTE FUNCTION log_issue_activity();

-- Update issues updated_at
CREATE OR REPLACE FUNCTION update_issue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_issue_updated_at_trigger ON issues;
CREATE TRIGGER update_issue_updated_at_trigger
  BEFORE UPDATE ON issues
  FOR EACH ROW
  EXECUTE FUNCTION update_issue_updated_at();
