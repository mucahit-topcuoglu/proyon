-- =====================================================
-- MEVCUT PROJELERE KANBAN SÜTUNLARI EKLE
-- =====================================================

-- Tüm mevcut projelere 3 default sütun ekle
INSERT INTO task_columns (project_id, name, position, color)
SELECT 
  p.id,
  'Yapılacaklar',
  0,
  '#ef4444'
FROM projects p
WHERE NOT EXISTS (
  SELECT 1 FROM task_columns tc 
  WHERE tc.project_id = p.id
);

INSERT INTO task_columns (project_id, name, position, color)
SELECT 
  p.id,
  'Devam Ediyor',
  1,
  '#f59e0b'
FROM projects p
WHERE NOT EXISTS (
  SELECT 1 FROM task_columns tc 
  WHERE tc.project_id = p.id AND tc.name = 'Devam Ediyor'
);

INSERT INTO task_columns (project_id, name, position, color)
SELECT 
  p.id,
  'Tamamlandı',
  2,
  '#10b981'
FROM projects p
WHERE NOT EXISTS (
  SELECT 1 FROM task_columns tc 
  WHERE tc.project_id = p.id AND tc.name = 'Tamamlandı'
);
