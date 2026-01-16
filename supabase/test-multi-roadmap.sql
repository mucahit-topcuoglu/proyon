-- ============================================================================
-- TEST QUERY - Yeni tabloları kontrol et
-- ============================================================================

-- 1. roadmap_categories tablosunu kontrol et
SELECT COUNT(*) as category_count FROM roadmap_categories;

-- 2. roadmap_nodes tablosunda yeni category_id kolonu var mı?
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'roadmap_nodes' 
  AND column_name = 'category_id';

-- 3. project_member_categories tablosunu kontrol et
SELECT COUNT(*) as permission_count FROM project_member_categories;

-- 4. Helper fonksiyonları kontrol et
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('create_default_categories', 'grant_all_categories_access');

-- ============================================================================
-- TEST DATA - İlk kategoriyi oluştur (opsiyonel)
-- ============================================================================

-- Mevcut bir projen varsa, o projeye kategoriler ekle:
/*
-- Önce bir proje ID'si al:
SELECT id, title FROM projects LIMIT 1;

-- Sonra o proje için kategoriler oluştur:
INSERT INTO roadmap_categories (project_id, name, description, color, icon, order_index)
VALUES 
  ('PROJE-ID-BURAYA', 'Backend', 'Backend geliştirme adımları', '#ef4444', 'server', 0),
  ('PROJE-ID-BURAYA', 'Frontend', 'Frontend geliştirme adımları', '#3b82f6', 'layout', 1),
  ('PROJE-ID-BURAYA', 'Database', 'Veritabanı tasarımı', '#10b981', 'database', 2);

-- Oluşan kategorileri gör:
SELECT * FROM roadmap_categories WHERE project_id = 'PROJE-ID-BURAYA';
*/
