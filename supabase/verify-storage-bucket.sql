-- =============================================
-- STORAGE BUCKET VERIFICATION
-- =============================================
-- Bucket'ın var olduğunu ve public olduğunu doğrula

-- 1. Bucket bilgilerini kontrol et
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'project-images';

-- Beklenen sonuç:
-- id: project-images
-- name: project-images
-- public: true (ÖNEMLI!)
-- file_size_limit: 5242880 (5MB)
-- allowed_mime_types: {image/jpeg, image/jpg, image/png, image/webp, image/gif}

-- 2. Policies'leri kontrol et
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%project_images%';

-- Beklenen: 4 policy görmelisin:
-- - public_read_project_images (SELECT)
-- - authenticated_upload_project_images (INSERT)
-- - user_delete_own_project_images (DELETE)
-- - user_update_own_project_images (UPDATE)

-- 3. Bucket'ta dosya var mı kontrol et
SELECT 
  name,
  bucket_id,
  owner,
  created_at,
  updated_at,
  last_accessed_at,
  metadata
FROM storage.objects
WHERE bucket_id = 'project-images'
ORDER BY created_at DESC
LIMIT 10;

-- 4. Public URL formatını test et
-- Eğer dosya varsa, URL'yi browser'da test et:
-- https://jhoyaapjtzsojnklqywm.supabase.co/storage/v1/object/public/project-images/{path}
