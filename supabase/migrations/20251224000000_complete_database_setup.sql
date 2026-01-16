-- ============================================================================
-- COMPLETE DATABASE SETUP - RUN THIS IN ORDER
-- ============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create projects table (if not exists)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  abstract_text TEXT,
  domain_type TEXT NOT NULL DEFAULT 'software',
  status TEXT NOT NULL DEFAULT 'planning',
  tags TEXT[],
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_file_url TEXT,
  uploaded_file_name TEXT
);

-- 3. Create roadmap_categories table
CREATE TABLE IF NOT EXISTS roadmap_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  icon TEXT DEFAULT 'folder',
  order_index INTEGER NOT NULL DEFAULT 0,
  ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create roadmap_nodes table
CREATE TABLE IF NOT EXISTS roadmap_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category_id UUID REFERENCES roadmap_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  order_index INTEGER NOT NULL,
  dependencies TEXT[],
  estimated_duration INTEGER,
  actual_duration INTEGER,
  technical_details TEXT,
  rationale TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_domain ON projects(domain_type);
CREATE INDEX IF NOT EXISTS idx_projects_uploaded_file ON projects(uploaded_file_url) WHERE uploaded_file_url IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_roadmap_categories_project ON roadmap_categories(project_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_categories_order ON roadmap_categories(project_id, order_index);

CREATE INDEX IF NOT EXISTS idx_roadmap_nodes_project ON roadmap_nodes(project_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_nodes_category ON roadmap_nodes(category_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_nodes_status ON roadmap_nodes(status);
CREATE INDEX IF NOT EXISTS idx_roadmap_nodes_order ON roadmap_nodes(project_id, order_index);

-- 6. Create RLS policies (Row Level Security)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_nodes ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Categories policies
CREATE POLICY "Users can view categories of their projects" ON roadmap_categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = roadmap_categories.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert categories for their projects" ON roadmap_categories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = roadmap_categories.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update categories of their projects" ON roadmap_categories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = roadmap_categories.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete categories of their projects" ON roadmap_categories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = roadmap_categories.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Nodes policies
CREATE POLICY "Users can view nodes of their projects" ON roadmap_nodes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = roadmap_nodes.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert nodes for their projects" ON roadmap_nodes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = roadmap_nodes.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update nodes of their projects" ON roadmap_nodes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = roadmap_nodes.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete nodes of their projects" ON roadmap_nodes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = roadmap_nodes.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- 7. Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roadmap_nodes_updated_at BEFORE UPDATE ON roadmap_nodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
