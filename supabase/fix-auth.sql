-- ============================================================================
-- SUPABASE AUTHENTICATION AYARLARI
-- Email confirmation'ı kapat (Development için)
-- ============================================================================

-- 1. Supabase Dashboard'da:
--    Authentication → Providers → Email
--    "Confirm email" → DISABLE

-- 2. Authentication → Email Templates
--    "Confirm signup" template'ini kontrol et

-- 3. Test kullanıcısının email'ini confirm et:

DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Test kullanıcısının ID'sini bul
  SELECT id INTO test_user_id 
  FROM auth.users 
  WHERE email = 'test@proyon.dev';

  IF test_user_id IS NOT NULL THEN
    -- Email'i confirm et (confirmed_at otomatik generate edilir)
    UPDATE auth.users
    SET 
      email_confirmed_at = NOW()
    WHERE id = test_user_id;

    RAISE NOTICE 'Test user email confirmed: %', test_user_id;
  ELSE
    RAISE NOTICE 'Test user not found!';
  END IF;
END $$;
