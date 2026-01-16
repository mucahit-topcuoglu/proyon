# 🖼️ Storage Bucket Kurulum Rehberi

## Sorun
Public share sayfasında yüklediğiniz fotoğraflar gözükmüyor çünkü:
- ❌ `project-images` storage bucket'ı henüz Supabase'de oluşturulmamış
- ❌ Public read policy'leri aktif değil

## ✅ Çözüm: Supabase Console'da Bucket Oluştur

### Adım 1: Supabase Console'a Git
1. **https://supabase.com** → Dashboard
2. Projenizi seçin: `jhoyaapjtzsojnklqywm`
3. Sol menüden **Storage** → **Buckets** seçin

### Adım 2: SQL Editor ile Bucket Oluştur (ÖNERİLEN)
1. Sol menüden **SQL Editor** seçin
2. "New query" butonuna tıklayın
3. Aşağıdaki SQL'i yapıştırın ve **Run** edin:

```sql
-- =============================================
-- PROJECT IMAGES STORAGE BUCKET
-- =============================================

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
```

### Adım 3: Doğrulama
SQL çalıştırdıktan sonra:
1. **Storage** → **Buckets** sayfasına geri dönün
2. `project-images` bucket'ının listelendiğini görmelisiniz
3. Bucket'a tıklayın → **Policies** tab → 4 policy görmeli

### Adım 4: Public URL Testi
```bash
# Storage URL formatı:
https://jhoyaapjtzsojnklqywm.supabase.co/storage/v1/object/public/project-images/{userId}/{projectId}/{fileName}
```

## 🔄 Alternatif: Manuel UI ile Oluştur

1. **Storage** → **New Bucket**
2. Name: `project-images`
3. ✅ **Public bucket** seçeneğini işaretle
4. Create bucket

Sonra **Policies** tab'ında yukarıdaki 4 policy'yi manuel ekle.

## ✅ Test Etme

1. Dashboard'da yeni proje oluştur
2. Proje detaylarına fotoğraf yükle
3. Public share linkini oluştur
4. Share linkini açınca fotoğrafı görmeli

## 🚨 Troubleshooting

### Resimler hala gözükmüyor?
- Browser console'u aç (F12)
- Network tab'ına bak
- Resim URL'leri 403/404 mu?
- Console'da hata mesajı var mı?

### CORS Hatası?
SQL'deki `public` policy'nin doğru çalıştığından emin ol:
```sql
-- Test sorgusu:
SELECT * FROM storage.buckets WHERE id = 'project-images';
-- public = true olmalı!
```

### Policy Hatası?
```sql
-- Policy'leri kontrol et:
SELECT * FROM storage.objects WHERE bucket_id = 'project-images';
```

---

**✅ Frontend'de eklenen CORS ve error handling sayesinde resimler yüklenememişse de kullanıcı bilgilendirilecek.**
