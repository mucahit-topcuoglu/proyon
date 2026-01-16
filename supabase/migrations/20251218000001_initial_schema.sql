-- ============================================================================
-- PROYON - Initial Database Schema
-- "Git for Projects" - Proje Yönetim Platformu
-- Date: 2025-12-18
-- ============================================================================

-- Enable necessary extensions
-- ============================================================================

-- pgvector for future RAG (AI embeddings)
CREATE EXTENSION IF NOT EXISTS vector;

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS (Type Definitions)
-- ============================================================================

-- Proje alanları (domain types)
CREATE TYPE domain_type AS ENUM (
  'software',
  'hardware', 
  'construction',
  'research'
);

-- Proje durumları
CREATE TYPE project_status AS ENUM (
  'planning',      -- Planlama aşamasında
  'active',        -- Aktif çalışılıyor
  'on_hold',       -- Beklemede
  'completed',     -- Tamamlandı
  'archived'       -- Arşivlendi
);

-- Roadmap node durumları
CREATE TYPE node_status AS ENUM (
  'pending',       -- Bekliyor
  'in_progress',   -- Devam ediyor
  'done'           -- Tamamlandı
);

-- Mentor log mesaj göndereni
CREATE TYPE message_sender AS ENUM (
  'user',          -- Kullanıcı mesajı
  'ai'             -- AI mentor mesajı
);

-- Kullanıcı rolleri
CREATE TYPE user_role AS ENUM (
  'user',          -- Normal kullanıcı
  'admin',         -- Yönetici
  'mentor'         -- Mentor (gelecekte ekip üyeleri için)
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- 1. PROFILES (Kullanıcı Profilleri)
-- ============================================================================
-- auth.users tablosunu genişletir
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role user_role DEFAULT 'user' NOT NULL,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Profil güncelleme zamanını otomatik ayarla
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. PROJECTS (Projeler)
-- ============================================================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  abstract_text TEXT,
  description TEXT,
  status project_status DEFAULT 'planning' NOT NULL,
  domain_type domain_type NOT NULL,
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT title_min_length CHECK (char_length(title) >= 3),
  CONSTRAINT title_max_length CHECK (char_length(title) <= 200)
);

-- Proje güncelleme trigger
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. ROADMAP_NODES (Yol Haritası Düğümleri)
-- ============================================================================
-- "Git for Projects" - Her node bir commit/milestone gibi
CREATE TABLE roadmap_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Node bilgileri
  title TEXT NOT NULL,
  description TEXT,
  technical_requirements TEXT,
  rationale TEXT, -- Neden bu node gerekli?
  
  -- Durum
  status node_status DEFAULT 'pending' NOT NULL,
  
  -- Bağımlılık grafiği (DAG - Directed Acyclic Graph)
  parent_node_id UUID REFERENCES roadmap_nodes(id) ON DELETE SET NULL,
  
  -- Sıralama ve öncelik
  order_index INTEGER DEFAULT 0,
  priority INTEGER DEFAULT 0, -- 0: normal, 1: yüksek, 2: kritik
  
  -- Tahmini süre (dakika cinsinden)
  estimated_duration INTEGER,
  actual_duration INTEGER,
  
  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT title_min_length CHECK (char_length(title) >= 3),
  CONSTRAINT prevent_self_reference CHECK (id != parent_node_id)
);

-- Roadmap node güncelleme trigger
CREATE TRIGGER update_roadmap_nodes_updated_at
  BEFORE UPDATE ON roadmap_nodes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Node durumu değiştiğinde tarihleri otomatik güncelle
CREATE OR REPLACE FUNCTION update_node_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- Eğer status 'in_progress' olursa started_at'i ayarla
  IF NEW.status = 'in_progress' AND OLD.status != 'in_progress' THEN
    NEW.started_at = NOW();
  END IF;
  
  -- Eğer status 'done' olursa completed_at'i ayarla
  IF NEW.status = 'done' AND OLD.status != 'done' THEN
    NEW.completed_at = NOW();
    -- Actual duration hesapla (eğer started_at varsa)
    IF NEW.started_at IS NOT NULL THEN
      NEW.actual_duration = EXTRACT(EPOCH FROM (NOW() - NEW.started_at))::INTEGER / 60;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_node_status_timestamps
  BEFORE UPDATE ON roadmap_nodes
  FOR EACH ROW
  EXECUTE FUNCTION update_node_timestamps();

-- ============================================================================
-- 4. MENTOR_LOGS (AI Mentor Sohbet Kayıtları)
-- ============================================================================
-- Her node için AI mentor ile yapılan konuşmaları saklar
CREATE TABLE mentor_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  node_id UUID REFERENCES roadmap_nodes(id) ON DELETE SET NULL,
  
  -- Mesaj bilgileri
  sender message_sender NOT NULL,
  message TEXT NOT NULL,
  
  -- AI metadata (gelecekte RAG için)
  embedding vector(1536), -- OpenAI ada-002 embedding boyutu
  tokens_used INTEGER,
  model_version TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT message_not_empty CHECK (char_length(message) > 0)
);

-- ============================================================================
-- INDEXES (Performance Optimization)
-- ============================================================================

-- Profiles indexes
CREATE INDEX idx_profiles_role ON profiles(role);

-- Projects indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_domain_type ON projects(domain_type);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_projects_user_status ON projects(user_id, status);

-- Roadmap nodes indexes
CREATE INDEX idx_roadmap_nodes_project_id ON roadmap_nodes(project_id);
CREATE INDEX idx_roadmap_nodes_parent_id ON roadmap_nodes(parent_node_id);
CREATE INDEX idx_roadmap_nodes_status ON roadmap_nodes(status);
CREATE INDEX idx_roadmap_nodes_project_status ON roadmap_nodes(project_id, status);
CREATE INDEX idx_roadmap_nodes_order ON roadmap_nodes(project_id, order_index);

-- Mentor logs indexes
CREATE INDEX idx_mentor_logs_project_id ON mentor_logs(project_id);
CREATE INDEX idx_mentor_logs_node_id ON mentor_logs(node_id);
CREATE INDEX idx_mentor_logs_created_at ON mentor_logs(created_at DESC);
CREATE INDEX idx_mentor_logs_project_created ON mentor_logs(project_id, created_at DESC);

-- Vector similarity search index (AI RAG için)
CREATE INDEX idx_mentor_logs_embedding ON mentor_logs 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- CRITICAL: Tüm tablolarda RLS'i etkinleştir
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Herkes kendi profilini görebilir
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Kullanıcılar kendi profillerini güncelleyebilir
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Yeni kullanıcı kaydında profil oluşturma (signup trigger için)
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Public profilleri herkes görebilir (gelecekte community özelliği için)
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- ============================================================================
-- PROJECTS POLICIES
-- ============================================================================

-- Kullanıcılar sadece kendi projelerini görebilir
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

-- Kullanıcılar kendi projelerini oluşturabilir
CREATE POLICY "Users can create their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Kullanıcılar kendi projelerini güncelleyebilir
CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Kullanıcılar kendi projelerini silebilir
CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- Public projeler herkes tarafından görülebilir
CREATE POLICY "Public projects are viewable by everyone"
  ON projects FOR SELECT
  USING (is_public = true);

-- ============================================================================
-- ROADMAP_NODES POLICIES
-- ============================================================================

-- Kullanıcılar sadece kendi projelerinin node'larını görebilir
CREATE POLICY "Users can view nodes of their own projects"
  ON roadmap_nodes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = roadmap_nodes.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Kullanıcılar kendi projelerine node ekleyebilir
CREATE POLICY "Users can create nodes in their own projects"
  ON roadmap_nodes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = roadmap_nodes.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Kullanıcılar kendi projelerinin node'larını güncelleyebilir
CREATE POLICY "Users can update nodes in their own projects"
  ON roadmap_nodes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = roadmap_nodes.project_id 
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = roadmap_nodes.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Kullanıcılar kendi projelerinin node'larını silebilir
CREATE POLICY "Users can delete nodes in their own projects"
  ON roadmap_nodes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = roadmap_nodes.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- ============================================================================
-- MENTOR_LOGS POLICIES
-- ============================================================================

-- Kullanıcılar sadece kendi projelerinin mentor loglarını görebilir
CREATE POLICY "Users can view mentor logs of their own projects"
  ON mentor_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = mentor_logs.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Kullanıcılar kendi projelerine mentor log ekleyebilir
CREATE POLICY "Users can create mentor logs in their own projects"
  ON mentor_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = mentor_logs.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Mentor logları silinemez (audit trail için), sadece görüntülenir
-- Eğer silme gerekirse, admin rolü için ek policy eklenebilir

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Proje istatistikleri
CREATE OR REPLACE FUNCTION get_project_stats(project_uuid UUID)
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'total_nodes', COUNT(*),
    'pending_nodes', COUNT(*) FILTER (WHERE status = 'pending'),
    'in_progress_nodes', COUNT(*) FILTER (WHERE status = 'in_progress'),
    'completed_nodes', COUNT(*) FILTER (WHERE status = 'done'),
    'completion_percentage', 
      CASE 
        WHEN COUNT(*) > 0 THEN 
          ROUND((COUNT(*) FILTER (WHERE status = 'done')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
        ELSE 0 
      END
  ) INTO stats
  FROM roadmap_nodes
  WHERE project_id = project_uuid;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Node bağımlılık zincirini getir (parent'lardan child'lara)
CREATE OR REPLACE FUNCTION get_node_dependencies(node_uuid UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  status node_status,
  depth INTEGER
) AS $$
  WITH RECURSIVE node_tree AS (
    -- Base case: seçili node
    SELECT 
      n.id,
      n.title,
      n.status,
      0 as depth
    FROM roadmap_nodes n
    WHERE n.id = node_uuid
    
    UNION ALL
    
    -- Recursive case: parent node'lar
    SELECT 
      n.id,
      n.title,
      n.status,
      nt.depth + 1
    FROM roadmap_nodes n
    INNER JOIN node_tree nt ON n.id = nt.id
    WHERE n.parent_node_id IS NOT NULL
  )
  SELECT * FROM node_tree ORDER BY depth;
$$ LANGUAGE sql STABLE;

-- ============================================================================
-- INITIAL DATA / SEED (Optional)
-- ============================================================================

-- Trigger: Yeni kullanıcı auth.users'a eklendiğinde otomatik profil oluştur
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Kullanıcı'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

COMMENT ON SCHEMA public IS 'Proyon - Git for Projects Schema';
COMMENT ON TABLE profiles IS 'Kullanıcı profil bilgileri';
COMMENT ON TABLE projects IS 'Kullanıcı projeleri - Git repository benzeri';
COMMENT ON TABLE roadmap_nodes IS 'Proje milestone/commit node''ları - DAG yapısı';
COMMENT ON TABLE mentor_logs IS 'AI mentor sohbet kayıtları - RAG için embedding''li';
