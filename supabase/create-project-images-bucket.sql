-- =============================================
-- PROJECT IMAGES STORAGE BUCKET
-- =============================================
-- PC/telefon'dan fotoğraf yüklemek için storage bucket

-- Storage bucket oluştur
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-images',
  'project-images',
  true, -- Public bucket (fotoğraflar herkese açık)
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Mevcut policy'leri temizle
DROP POLICY IF EXISTS "public_read_project_images" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_upload_project_images" ON storage.objects;
DROP POLICY IF EXISTS "user_delete_own_project_images" ON storage.objects;
DROP POLICY IF EXISTS "user_update_own_project_images" ON storage.objects;

-- Storage policies
-- 1. Herkes public bucket'taki resimleri okuyabilir
CREATE POLICY "public_read_project_images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'project-images');

-- 2. Authenticated kullanıcılar upload yapabilir
CREATE POLICY "authenticated_upload_project_images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-images'
  AND auth.uid() IS NOT NULL
);

-- 3. Sadece kendi yüklediği resimleri silebilir
CREATE POLICY "user_delete_own_project_images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Kendi yüklediği resimleri güncelleyebilir
CREATE POLICY "user_update_own_project_images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Başarı mesajı
DO $$
BEGIN
  RAISE NOTICE '✅ project-images storage bucket oluşturuldu!';
  RAISE NOTICE '✅ Dosya limiti: 5MB';
  RAISE NOTICE '✅ İzin verilen formatlar: jpg, png, webp, gif';
  RAISE NOTICE '✅ Storage policies ayarlandı';
END $$;
