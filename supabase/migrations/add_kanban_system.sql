-- =====================================================
-- KANBAN BOARD SYSTEM - JIRA-STYLE TASK MANAGEMENT
-- =====================================================

-- 1. Task Columns/Statuses
CREATE TABLE IF NOT EXISTS task_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tasks/Görevler
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  roadmap_node_id UUID REFERENCES roadmap_nodes(id) ON DELETE SET NULL,
  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  column_id UUID NOT NULL REFERENCES task_columns(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  
  -- Epic/Story/Task/Subtask
  task_type TEXT DEFAULT 'task' CHECK (task_type IN ('epic', 'story', 'task', 'subtask')),
  
  -- Priority
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Assignment
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Position in column
  position INTEGER NOT NULL DEFAULT 0,
  
  -- Metadata
  estimated_hours DECIMAL(10, 2),
  actual_hours DECIMAL(10, 2),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- AI Generated
  ai_generated BOOLEAN DEFAULT false,
  ai_breakdown_from UUID REFERENCES tasks(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Task Comments
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Task Activity Log
CREATE TABLE IF NOT EXISTS task_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'created', 'moved', 'assigned', 'commented', etc.
  from_value TEXT,
  to_value TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_task_columns_project ON task_columns(project_id, position);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_column ON tasks(column_id, position);
CREATE INDEX IF NOT EXISTS idx_tasks_parent ON tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_task_comments_task ON task_comments(task_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_activity_task ON task_activity(task_id, created_at DESC);

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE task_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_activity ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DO $$ 
BEGIN
  -- Task Columns
  EXECUTE 'DROP POLICY IF EXISTS "Users can view project task columns" ON task_columns';
  EXECUTE 'DROP POLICY IF EXISTS "Users can manage project task columns" ON task_columns';
  
  -- Tasks
  EXECUTE 'DROP POLICY IF EXISTS "Users can view project tasks" ON tasks';
  EXECUTE 'DROP POLICY IF EXISTS "Users can manage project tasks" ON tasks';
  
  -- Task Comments
  EXECUTE 'DROP POLICY IF EXISTS "Users can view task comments" ON task_comments';
  EXECUTE 'DROP POLICY IF EXISTS "Users can add task comments" ON task_comments';
  
  -- Task Activity
  EXECUTE 'DROP POLICY IF EXISTS "Users can view task activity" ON task_activity';
  
  -- Service role
  EXECUTE 'DROP POLICY IF EXISTS "Service role full access task_columns" ON task_columns';
  EXECUTE 'DROP POLICY IF EXISTS "Service role full access tasks" ON tasks';
  EXECUTE 'DROP POLICY IF EXISTS "Service role full access task_comments" ON task_comments';
  EXECUTE 'DROP POLICY IF EXISTS "Service role full access task_activity" ON task_activity';
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Task Columns Policies
CREATE POLICY "Users can view project task columns"
  ON task_columns FOR SELECT
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

CREATE POLICY "Users can manage project task columns"
  ON task_columns FOR ALL
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      WHERE p.user_id = auth.uid()
    )
  );

-- Tasks Policies
CREATE POLICY "Users can view project tasks"
  ON tasks FOR SELECT
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

CREATE POLICY "Users can manage project tasks"
  ON tasks FOR ALL
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

-- Task Comments Policies
CREATE POLICY "Users can view task comments"
  ON task_comments FOR SELECT
  USING (
    task_id IN (
      SELECT t.id FROM tasks t
      WHERE t.project_id IN (
        SELECT p.id FROM projects p
        WHERE p.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM project_members pm
          WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can add task comments"
  ON task_comments FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    task_id IN (
      SELECT t.id FROM tasks t
      WHERE t.project_id IN (
        SELECT p.id FROM projects p
        WHERE p.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM project_members pm
          WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
        )
      )
    )
  );

-- Task Activity Policies
CREATE POLICY "Users can view task activity"
  ON task_activity FOR SELECT
  USING (
    task_id IN (
      SELECT t.id FROM tasks t
      WHERE t.project_id IN (
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
CREATE POLICY "Service role full access task_columns"
  ON task_columns FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access tasks"
  ON tasks FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access task_comments"
  ON task_comments FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access task_activity"
  ON task_activity FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Auto-create default columns for new projects
CREATE OR REPLACE FUNCTION create_default_task_columns()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO task_columns (project_id, name, position, color) VALUES
    (NEW.id, 'Yapılacaklar', 0, '#ef4444'),
    (NEW.id, 'Devam Ediyor', 1, '#f59e0b'),
    (NEW.id, 'Tamamlandı', 2, '#10b981');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS create_default_task_columns_trigger ON projects;
CREATE TRIGGER create_default_task_columns_trigger
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION create_default_task_columns();

-- Log task activity
CREATE OR REPLACE FUNCTION log_task_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO task_activity (task_id, user_id, action, to_value)
    VALUES (NEW.id, NEW.created_by, 'created', NEW.title);
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.column_id != NEW.column_id THEN
      INSERT INTO task_activity (task_id, user_id, action, from_value, to_value)
      SELECT NEW.id, auth.uid(), 'moved', 
        (SELECT name FROM task_columns WHERE id = OLD.column_id),
        (SELECT name FROM task_columns WHERE id = NEW.column_id);
    END IF;
    
    IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
      INSERT INTO task_activity (task_id, user_id, action, to_value)
      VALUES (NEW.id, auth.uid(), 'assigned', NEW.assigned_to::TEXT);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS log_task_activity_trigger ON tasks;
CREATE TRIGGER log_task_activity_trigger
  AFTER INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION log_task_activity();

-- Update task updated_at
CREATE OR REPLACE FUNCTION update_task_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  
  -- Mark as completed if moved to last column
  IF OLD.column_id != NEW.column_id THEN
    DECLARE
      last_column_id UUID;
    BEGIN
      SELECT id INTO last_column_id
      FROM task_columns
      WHERE project_id = NEW.project_id
      ORDER BY position DESC
      LIMIT 1;
      
      IF NEW.column_id = last_column_id THEN
        NEW.completed_at = now();
      ELSE
        NEW.completed_at = NULL;
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_task_updated_at_trigger ON tasks;
CREATE TRIGGER update_task_updated_at_trigger
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_task_updated_at();
