-- =============================================
-- PUBLIC SHARES ENHANCEMENT
-- =============================================
-- Makale tarzı public paylaşım için yeni alanlar

-- Önce RLS'yi geçici olarak devre dışı bırak
ALTER TABLE public_shares DISABLE ROW LEVEL SECURITY;

-- Yeni alanları ekle
ALTER TABLE public_shares
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS team_members TEXT,
ADD COLUMN IF NOT EXISTS contact_info JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS show_contact BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS project_images TEXT[] DEFAULT '{}';

-- contact_info yapısı:
-- {
--   "linkedin": "https://linkedin.com/in/username",
--   "twitter": "https://twitter.com/username",
--   "instagram": "https://instagram.com/username",
--   "phone": "+90 555 123 45 67",
--   "email": "user@example.com"
-- }

-- Index ekle (JSONB sorguları için)
CREATE INDEX IF NOT EXISTS idx_public_shares_contact_info ON public_shares USING gin(contact_info);

-- Comment ekle
COMMENT ON COLUMN public_shares.description IS 'Proje hakkında detaylı açıklama';
COMMENT ON COLUMN public_shares.team_members IS 'Ekip üyeleri (sözel format)';
COMMENT ON COLUMN public_shares.contact_info IS 'İletişim bilgileri (JSON)';
COMMENT ON COLUMN public_shares.show_contact IS 'İletişim bilgilerini göster';
COMMENT ON COLUMN public_shares.project_images IS 'Proje fotoğrafları (URL array)';

-- Mevcut kayıtlar için default değerler
UPDATE public_shares
SET 
  description = COALESCE(description, ''),
  team_members = COALESCE(team_members, ''),
  contact_info = COALESCE(contact_info, '{}'::jsonb),
  show_contact = COALESCE(show_contact, false),
  project_images = COALESCE(project_images, '{}')
WHERE description IS NULL 
   OR team_members IS NULL 
   OR contact_info IS NULL 
   OR show_contact IS NULL 
   OR project_images IS NULL;

-- RLS politikalarını yeniden oluştur
DROP POLICY IF EXISTS "select_public_shares" ON public_shares;
DROP POLICY IF EXISTS "manage_project_shares" ON public_shares;
DROP POLICY IF EXISTS "insert_project_shares" ON public_shares;
DROP POLICY IF EXISTS "update_project_shares" ON public_shares;
DROP POLICY IF EXISTS "delete_project_shares" ON public_shares;

-- Herkes aktif public shares'leri okuyabilir
CREATE POLICY "select_public_shares"
  ON public_shares FOR SELECT
  USING (is_active = true);

-- Authenticated kullanıcılar INSERT yapabilir
-- (Application katmanında zaten proje sahibi kontrolü var)
CREATE POLICY "insert_project_shares"
  ON public_shares FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Proje sahibi UPDATE yapabilir
CREATE POLICY "update_project_shares"
  ON public_shares FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = public_shares.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = public_shares.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Proje sahibi DELETE yapabilir
CREATE POLICY "delete_project_shares"
  ON public_shares FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = public_shares.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- RLS'yi tekrar aktif et
ALTER TABLE public_shares ENABLE ROW LEVEL SECURITY;

-- Başarı mesajı
DO $$
BEGIN
  RAISE NOTICE '✅ Public shares tablosu güncellendi!';
  RAISE NOTICE '✅ Yeni kolonlar: description, team_members, contact_info, show_contact, project_images';
  RAISE NOTICE '✅ RLS politikaları yenilendi';
END $$;
