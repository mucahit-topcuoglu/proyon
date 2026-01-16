-- =============================================
-- FIX: BUCKET MIME TYPES - DOCUMENT SUPPORT
-- =============================================

-- Bucket'ın mime type limitini kaldır (tüm dosya tiplerini kabul et)
UPDATE storage.buckets
SET allowed_mime_types = NULL
WHERE id = 'project-images';

-- Doğrulama
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'project-images';

-- Beklenen sonuç:
-- allowed_mime_types: NULL (tüm dosya tipleri kabul edilir)
