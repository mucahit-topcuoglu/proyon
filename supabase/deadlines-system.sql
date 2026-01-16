-- ============================================
-- DEADLINE SYSTEM
-- ============================================

-- Add deadline column to roadmap_nodes if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'roadmap_nodes' AND column_name = 'deadline'
  ) THEN
    ALTER TABLE roadmap_nodes ADD COLUMN deadline TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Deadline reminders table
CREATE TABLE IF NOT EXISTS deadline_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  node_id UUID NOT NULL REFERENCES roadmap_nodes(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  reminder_type TEXT NOT NULL, -- '1_day_before', 'same_day', '1_day_overdue', '3_days_overdue'
  sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_deadline_reminders_node_id ON deadline_reminders(node_id);
CREATE INDEX IF NOT EXISTS idx_deadline_reminders_user_id ON deadline_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_deadline_reminders_deadline ON deadline_reminders(deadline);
CREATE INDEX IF NOT EXISTS idx_deadline_reminders_sent ON deadline_reminders(sent);

-- RLS Policies
ALTER TABLE deadline_reminders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own reminders" ON deadline_reminders;
DROP POLICY IF EXISTS "System can insert reminders" ON deadline_reminders;
DROP POLICY IF EXISTS "System can update reminders" ON deadline_reminders;

-- Users can view their own reminders
CREATE POLICY "Users can view own reminders"
  ON deadline_reminders FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert reminders
CREATE POLICY "System can insert reminders"
  ON deadline_reminders FOR INSERT
  WITH CHECK (true);

-- System can update reminders
CREATE POLICY "System can update reminders"
  ON deadline_reminders FOR UPDATE
  USING (true);

-- Function to get nodes with upcoming deadlines
CREATE OR REPLACE FUNCTION get_upcoming_deadlines(
  p_user_id UUID,
  p_project_id UUID DEFAULT NULL,
  p_days_ahead INTEGER DEFAULT 7
)
RETURNS TABLE (
  node_id UUID,
  node_title TEXT,
  project_id UUID,
  project_title TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  status TEXT,
  days_until_deadline INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rn.id as node_id,
    rn.title as node_title,
    p.id as project_id,
    p.title as project_title,
    rn.deadline,
    rn.status,
    EXTRACT(DAY FROM (rn.deadline - NOW()))::INTEGER as days_until_deadline
  FROM roadmap_nodes rn
  JOIN projects p ON rn.project_id = p.id
  WHERE rn.deadline IS NOT NULL
    AND rn.status != 'completed'
    AND (p.user_id = p_user_id OR EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = p.id AND pm.user_id = p_user_id
    ))
    AND (p_project_id IS NULL OR p.id = p_project_id)
    AND rn.deadline <= NOW() + INTERVAL '1 day' * p_days_ahead
  ORDER BY rn.deadline ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get overdue nodes
CREATE OR REPLACE FUNCTION get_overdue_nodes(
  p_user_id UUID,
  p_project_id UUID DEFAULT NULL
)
RETURNS TABLE (
  node_id UUID,
  node_title TEXT,
  project_id UUID,
  project_title TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  status TEXT,
  days_overdue INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rn.id as node_id,
    rn.title as node_title,
    p.id as project_id,
    p.title as project_title,
    rn.deadline,
    rn.status,
    EXTRACT(DAY FROM (NOW() - rn.deadline))::INTEGER as days_overdue
  FROM roadmap_nodes rn
  JOIN projects p ON rn.project_id = p.id
  WHERE rn.deadline IS NOT NULL
    AND rn.deadline < NOW()
    AND rn.status != 'completed'
    AND (p.user_id = p_user_id OR EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = p.id AND pm.user_id = p_user_id
    ))
    AND (p_project_id IS NULL OR p.id = p_project_id)
  ORDER BY rn.deadline ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get deadline status
CREATE OR REPLACE FUNCTION get_deadline_status(p_deadline TIMESTAMP WITH TIME ZONE, p_status TEXT)
RETURNS TEXT AS $$
DECLARE
  days_diff INTEGER;
BEGIN
  IF p_deadline IS NULL THEN
    RETURN 'no_deadline';
  END IF;

  IF p_status = 'completed' THEN
    RETURN 'completed';
  END IF;

  days_diff := EXTRACT(DAY FROM (p_deadline - NOW()))::INTEGER;

  IF days_diff < 0 THEN
    RETURN 'overdue';
  ELSIF days_diff = 0 THEN
    RETURN 'due_today';
  ELSIF days_diff <= 7 THEN
    RETURN 'due_this_week';
  ELSE
    RETURN 'future';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to create reminder for a deadline
CREATE OR REPLACE FUNCTION create_deadline_reminders(
  p_node_id UUID,
  p_project_id UUID,
  p_user_id UUID,
  p_deadline TIMESTAMP WITH TIME ZONE
)
RETURNS VOID AS $$
BEGIN
  -- Delete existing reminders for this node
  DELETE FROM deadline_reminders WHERE node_id = p_node_id;

  -- Create 1 day before reminder (if deadline is more than 1 day away)
  IF p_deadline > NOW() + INTERVAL '1 day' THEN
    INSERT INTO deadline_reminders (node_id, project_id, user_id, deadline, reminder_type)
    VALUES (p_node_id, p_project_id, p_user_id, p_deadline - INTERVAL '1 day', '1_day_before');
  END IF;

  -- Create same day reminder
  INSERT INTO deadline_reminders (node_id, project_id, user_id, deadline, reminder_type)
  VALUES (p_node_id, p_project_id, p_user_id, p_deadline, 'same_day');

  -- Note: Overdue reminders are created by a scheduled job
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE deadline_reminders IS 'Email reminders for node deadlines';
COMMENT ON COLUMN deadline_reminders.reminder_type IS 'Types: 1_day_before, same_day, 1_day_overdue, 3_days_overdue';
COMMENT ON FUNCTION get_upcoming_deadlines IS 'Get nodes with deadlines in the next X days';
COMMENT ON FUNCTION get_overdue_nodes IS 'Get nodes with passed deadlines';
