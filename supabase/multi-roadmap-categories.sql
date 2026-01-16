-- ============================================================================
-- MULTI-ROADMAP CATEGORIES SYSTEM
-- Projeler için çoklu roadmap desteği (Backend, Frontend, Database, vb.)
-- ============================================================================

-- 1. ROADMAP CATEGORIES TABLE
-- Her proje birden fazla roadmap kategorisine sahip olabilir
CREATE TABLE IF NOT EXISTS roadmap_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Kategori bilgileri
  name TEXT NOT NULL, -- 'Backend', 'Frontend', 'Database', 'Mobile', 'DevOps', etc.
  description TEXT,
  color TEXT DEFAULT '#3b82f6', -- Kategori rengi (hex)
  icon TEXT DEFAULT 'folder', -- İkon adı (lucide-react)
  
  -- Sıralama
  order_index INTEGER DEFAULT 0,
  
  -- Kategori AI tarafından mı oluşturuldu?
  ai_generated BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT category_name_min_length CHECK (char_length(name) >= 2),
  CONSTRAINT unique_category_per_project UNIQUE(project_id, name)
);

-- Index for faster lookups
CREATE INDEX idx_roadmap_categories_project_id ON roadmap_categories(project_id);
CREATE INDEX idx_roadmap_categories_order ON roadmap_categories(project_id, order_index);

-- Update trigger
CREATE TRIGGER update_roadmap_categories_updated_at
  BEFORE UPDATE ON roadmap_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. UPDATE ROADMAP_NODES TABLE - Add category_id
-- ============================================================================

-- Add category_id column to roadmap_nodes
ALTER TABLE roadmap_nodes 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES roadmap_categories(id) ON DELETE SET NULL;

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_roadmap_nodes_category_id ON roadmap_nodes(category_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_nodes_project_category ON roadmap_nodes(project_id, category_id);

-- ============================================================================
-- 3. PROJECT MEMBER CATEGORY PERMISSIONS
-- Hangi team member hangi kategorileri yönetebilir?
-- ============================================================================

CREATE TABLE IF NOT EXISTS project_member_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES roadmap_categories(id) ON DELETE CASCADE,
  
  -- Yetki seviyesi
  can_edit BOOLEAN DEFAULT true, -- Düğümleri düzenleyebilir mi?
  can_delete BOOLEAN DEFAULT false, -- Düğümleri silebilir mi?
  can_manage BOOLEAN DEFAULT false, -- Kategoriyi yönetebilir mi? (isim değiştirme, silme)
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT unique_member_category UNIQUE(project_id, user_id, category_id)
);

-- Indexes
CREATE INDEX idx_member_categories_project ON project_member_categories(project_id);
CREATE INDEX idx_member_categories_user ON project_member_categories(user_id);
CREATE INDEX idx_member_categories_category ON project_member_categories(category_id);
CREATE INDEX idx_member_categories_composite ON project_member_categories(project_id, user_id);

-- Update trigger
CREATE TRIGGER update_project_member_categories_updated_at
  BEFORE UPDATE ON project_member_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. ROW LEVEL SECURITY (Şu an disabled, ama hazır)
-- ============================================================================

-- Enable RLS (şu an kapalı, gerekirse açılacak)
-- ALTER TABLE roadmap_categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE project_member_categories ENABLE ROW LEVEL SECURITY;

-- Policies (şu an disabled)
/*
-- Users can see categories of projects they're members of
CREATE POLICY "view_own_project_categories"
  ON roadmap_categories FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid()
    )
  );

-- Users can edit categories if they have permission
CREATE POLICY "edit_categories_with_permission"
  ON roadmap_categories FOR UPDATE
  USING (
    id IN (
      SELECT category_id FROM project_member_categories
      WHERE user_id = auth.uid() AND can_manage = true
    )
  );
*/

-- ============================================================================
-- 5. HELPER FUNCTIONS
-- ============================================================================

-- Function to create default categories for a project
CREATE OR REPLACE FUNCTION create_default_categories(p_project_id UUID)
RETURNS void AS $$
DECLARE
  category_names TEXT[] := ARRAY['General', 'Documentation'];
BEGIN
  INSERT INTO roadmap_categories (project_id, name, description, order_index, ai_generated)
  VALUES 
    (p_project_id, 'General', 'Ana roadmap adımları', 0, false),
    (p_project_id, 'Documentation', 'Dokümantasyon ve raporlama', 1, false);
END;
$$ LANGUAGE plpgsql;

-- Function to give user access to all categories
CREATE OR REPLACE FUNCTION grant_all_categories_access(
  p_project_id UUID,
  p_user_id UUID,
  p_can_manage BOOLEAN DEFAULT false
)
RETURNS void AS $$
BEGIN
  INSERT INTO project_member_categories (project_id, user_id, category_id, can_edit, can_delete, can_manage)
  SELECT 
    p_project_id,
    p_user_id,
    id,
    true,
    p_can_manage,
    p_can_manage
  FROM roadmap_categories
  WHERE project_id = p_project_id
  ON CONFLICT (project_id, user_id, category_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. SAMPLE DATA (Test için - production'da silinecek)
-- ============================================================================

-- Test kategorileri oluşturmak için örnek:
/*
-- Bir proje ID'si için kategoriler oluştur
INSERT INTO roadmap_categories (project_id, name, description, color, order_index, ai_generated)
VALUES 
  ('your-project-id', 'Backend', 'Backend geliştirme adımları', '#ef4444', 0, true),
  ('your-project-id', 'Frontend', 'Frontend geliştirme adımları', '#3b82f6', 1, true),
  ('your-project-id', 'Database', 'Veritabanı tasarımı ve migration', '#10b981', 2, true),
  ('your-project-id', 'DevOps', 'Deployment ve CI/CD', '#f59e0b', 3, true);
*/

-- ============================================================================
-- NOTES
-- ============================================================================

/*
KULLANIM SENARYOLARI:

1. MANUEL ROADMAP - Kategorisiz:
   - Kullanıcı roadmap'i kendisi oluşturur
   - Kategori girmez
   - Sistem "General" kategorisi oluşturur
   - Tüm node'lar "General" kategorisine atanır

2. MANUEL ROADMAP - Kategorili:
   - Kullanıcı kategori isimlerini girer: ["Backend", "Frontend", "Mobile"]
   - Sistem bu kategorileri oluşturur
   - Kullanıcı her kategoriye manuel node ekler

3. AI ROADMAP - Kategori isimleri verildi:
   - Kullanıcı: ["Backend", "Frontend", "Database"]
   - AI bu kategorilere uygun node'lar oluşturur
   - Her kategori altında kendi roadmap'i var

4. AI ROADMAP - Sadece kategori sayısı:
   - Kullanıcı: "3 kategoriye böl"
   - AI kategori isimlerini + node'ları oluşturur
   - Örnek: "API Development", "UI/UX Design", "Testing"

5. AI ROADMAP - Tam otomatik:
   - Kullanıcı hiçbir şey girmez
   - AI projeyi analiz eder
   - En uygun kategori sayısını belirler (2-5 arası)
   - Kategorileri + node'ları oluşturur

YETKİLENDİRME:
- Proje sahibi: Tüm kategorilere tam yetki
- Team member davet ederken: Hangi kategorileri göreceği seçilir
- Örnek: Backend developer → sadece "Backend" kategorisini görür
- "Tüm kategoriler" seçeneği ile hepsine erişim verilebilir
*/
