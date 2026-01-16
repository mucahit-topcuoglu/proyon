-- =====================================================
-- TIMELINE & GANTT CHART FEATURES
-- Bağımlılıklar (Dependencies) ve Milestones
-- =====================================================

-- 1. Task Dependencies (Görev Bağımlılıkları)
CREATE TABLE IF NOT EXISTS task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  blocking_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  dependency_type TEXT DEFAULT 'finish_to_start' CHECK (dependency_type IN (
    'finish_to_start',  -- A bitince B başlar (en yaygın)
    'start_to_start',   -- A başlayınca B başlar
    'finish_to_finish', -- A bitince B de biter
    'start_to_finish'   -- A başlayınca B biter
  )),
  lag_days INTEGER DEFAULT 0, -- Gecikme (negatif = önceden başlama)
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Circular dependency prevention
  CONSTRAINT no_self_dependency CHECK (blocked_task_id != blocking_task_id),
  CONSTRAINT unique_dependency UNIQUE (blocked_task_id, blocking_task_id)
);

-- 2. Tasks tablosuna timeline fields ekle
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_milestone BOOLEAN DEFAULT false;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS milestone_icon TEXT; -- '🎯', '🚀', '🏁', etc.

-- 3. Milestones view (kolay erişim için)
CREATE OR REPLACE VIEW project_milestones AS
SELECT 
  t.*,
  p.title as project_title,
  COUNT(DISTINCT dep.blocked_task_id) as blocking_count
FROM tasks t
JOIN projects p ON p.id = t.project_id
LEFT JOIN task_dependencies dep ON dep.blocking_task_id = t.id
WHERE t.is_milestone = true
GROUP BY t.id, p.title;

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_task_dependencies_blocked ON task_dependencies(blocked_task_id);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_blocking ON task_dependencies(blocking_task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_dates ON tasks(start_date, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_milestones ON tasks(is_milestone, due_date) WHERE is_milestone = true;

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DO $$ 
BEGIN
  EXECUTE 'DROP POLICY IF EXISTS "Users can view task dependencies" ON task_dependencies';
  EXECUTE 'DROP POLICY IF EXISTS "Users can manage task dependencies" ON task_dependencies';
  EXECUTE 'DROP POLICY IF EXISTS "Service role full access task_dependencies" ON task_dependencies';
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- View dependencies for accessible tasks
CREATE POLICY "Users can view task dependencies"
  ON task_dependencies FOR SELECT
  USING (
    blocked_task_id IN (
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

-- Manage dependencies for owned projects
CREATE POLICY "Users can manage task dependencies"
  ON task_dependencies FOR ALL
  USING (
    blocked_task_id IN (
      SELECT t.id FROM tasks t
      WHERE t.project_id IN (
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

-- Service role full access
CREATE POLICY "Service role full access task_dependencies"
  ON task_dependencies FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Circular dependency validation
CREATE OR REPLACE FUNCTION check_circular_dependency()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if adding this dependency would create a cycle
  IF EXISTS (
    WITH RECURSIVE dep_chain AS (
      -- Start from the new blocking task
      SELECT blocking_task_id as task_id, 1 as depth
      FROM task_dependencies
      WHERE blocked_task_id = NEW.blocking_task_id
      
      UNION ALL
      
      -- Follow the chain
      SELECT td.blocking_task_id, dc.depth + 1
      FROM task_dependencies td
      JOIN dep_chain dc ON dc.task_id = td.blocked_task_id
      WHERE dc.depth < 100 -- Prevent infinite loop
    )
    SELECT 1 FROM dep_chain WHERE task_id = NEW.blocked_task_id
  ) THEN
    RAISE EXCEPTION 'Circular dependency detected: This would create a dependency loop';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_circular_dependency_trigger ON task_dependencies;
CREATE TRIGGER check_circular_dependency_trigger
  BEFORE INSERT OR UPDATE ON task_dependencies
  FOR EACH ROW
  EXECUTE FUNCTION check_circular_dependency();

-- Auto-adjust start dates based on dependencies
CREATE OR REPLACE FUNCTION auto_adjust_task_dates()
RETURNS TRIGGER AS $$
DECLARE
  max_blocking_date TIMESTAMPTZ;
BEGIN
  -- If this is a finish_to_start dependency and blocking task has a due date
  IF NEW.dependency_type = 'finish_to_start' THEN
    SELECT MAX(t.due_date)
    INTO max_blocking_date
    FROM task_dependencies td
    JOIN tasks t ON t.id = td.blocking_task_id
    WHERE td.blocked_task_id = NEW.blocked_task_id
      AND t.due_date IS NOT NULL;
    
    -- Update blocked task's start date if needed
    IF max_blocking_date IS NOT NULL THEN
      UPDATE tasks
      SET start_date = max_blocking_date + INTERVAL '1 day' * NEW.lag_days
      WHERE id = NEW.blocked_task_id
        AND (start_date IS NULL OR start_date < max_blocking_date);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_adjust_task_dates_trigger ON task_dependencies;
CREATE TRIGGER auto_adjust_task_dates_trigger
  AFTER INSERT OR UPDATE ON task_dependencies
  FOR EACH ROW
  EXECUTE FUNCTION auto_adjust_task_dates();

-- Log dependency changes to activity
CREATE OR REPLACE FUNCTION log_dependency_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO task_activity (task_id, user_id, action, to_value)
    SELECT NEW.blocked_task_id, auth.uid(), 'dependency_added',
      (SELECT title FROM tasks WHERE id = NEW.blocking_task_id);
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO task_activity (task_id, user_id, action, from_value)
    SELECT OLD.blocked_task_id, auth.uid(), 'dependency_removed',
      (SELECT title FROM tasks WHERE id = OLD.blocking_task_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS log_dependency_activity_trigger ON task_dependencies;
CREATE TRIGGER log_dependency_activity_trigger
  AFTER INSERT OR DELETE ON task_dependencies
  FOR EACH ROW
  EXECUTE FUNCTION log_dependency_activity();
