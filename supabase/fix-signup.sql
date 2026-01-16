-- ============================================================================
-- SIGNUP SORUNUNU ÇÖZME - Profile Trigger ve Email Confirmation
-- ============================================================================

-- 1. Mevcut trigger'ı kontrol et
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 2. Email confirmation'ı kapat (eğer açıksa)
-- NOT: Bu dashboard'dan yapılmalı, SQL ile yapılamaz
-- Authentication → Providers → Email → "Enable email confirmations" → DISABLE

-- 3. Tüm mevcut kullanıcıların email'lerini confirm et
UPDATE auth.users
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

-- 4. Profile trigger'ını yeniden oluştur (daha robust)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Profile oluştur (duplicate kontrolü ile)
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    'user'
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', profiles.full_name),
    avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', profiles.avatar_url),
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Hata olsa bile kullanıcı oluşturulsun
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger'ı oluştur
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 5. Test kullanıcısının profile'ını düzelt
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  SELECT id INTO test_user_id 
  FROM auth.users 
  WHERE email = 'test@proyon.dev';

  IF test_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, full_name, role, bio)
    VALUES (
      test_user_id,
      'Test Kullanıcı',
      'user',
      'Proyon test hesabı'
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      full_name = 'Test Kullanıcı',
      bio = 'Proyon test hesabı',
      updated_at = NOW();

    RAISE NOTICE 'Test user profile updated: %', test_user_id;
  ELSE
    RAISE NOTICE 'Test user not found!';
  END IF;
END $$;

-- 6. Tüm kullanıcıların profile'larını kontrol et
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.full_name,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 10;

-- BAŞARI MESAJI:
-- Eğer yukarıdaki SELECT'te tüm kullanıcıların profile'ları varsa ✅
-- Yoksa trigger çalışmıyor demektir ⚠️
