-- ============================================================================
-- TEST KULLANICISINI TAMİR ET
-- ============================================================================

-- 1. Mevcut test kullanıcısını kontrol et
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data
FROM auth.users
WHERE email = 'test@proyon.dev';

-- 2. Email'i confirm et
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'test@proyon.dev' 
AND email_confirmed_at IS NULL;

-- 3. Eğer kullanıcı yoksa veya şifre yanlışsa, YENİDEN OLUŞTUR
DO $$
DECLARE
  existing_user_id UUID;
  new_user_id UUID;
BEGIN
  -- Mevcut kullanıcıyı kontrol et
  SELECT id INTO existing_user_id
  FROM auth.users
  WHERE email = 'test@proyon.dev';

  IF existing_user_id IS NULL THEN
    -- Kullanıcı yoksa oluştur
    RAISE NOTICE 'Test user does not exist, creating...';
    
    -- Manuel kullanıcı oluşturma (şifre: Test123456!)
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    SELECT
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'test@proyon.dev',
      crypt('Test123456!', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Test Kullanıcı"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    RETURNING id INTO new_user_id;

    -- Profile oluştur
    INSERT INTO public.profiles (id, full_name, role, bio)
    VALUES (
      new_user_id,
      'Test Kullanıcı',
      'user',
      'Proyon test hesabı'
    );

    RAISE NOTICE 'New test user created: %', new_user_id;
  ELSE
    -- Kullanıcı varsa sadece email confirm et
    RAISE NOTICE 'Test user exists: %, confirming email...', existing_user_id;
    
    UPDATE auth.users
    SET email_confirmed_at = NOW()
    WHERE id = existing_user_id;
  END IF;
END $$;

-- 4. Profile'ı kontrol et
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.full_name,
  p.role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'test@proyon.dev';

-- BAŞARI MESAJI:
-- Eğer email_confirmed_at dolu ve profile var ise ✅
-- Şimdi login'i dene: test@proyon.dev / Test123456!
