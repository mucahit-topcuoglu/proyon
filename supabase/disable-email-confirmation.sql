-- ============================================================================
-- Supabase Email Confirmation'ı Devre Dışı Bırakma
-- ============================================================================
-- Email doğrulama olmadan kullanıcıların giriş yapabilmesi için

-- 1. Mevcut tüm kullanıcıları email confirmed yap
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 2. Confirmation gerektirmeyen trigger oluştur
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Yeni kullanıcı oluşturulduğunda otomatik confirm et
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = NEW.id
  AND email_confirmed_at IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger'ı auth.users tablosuna ekle
DROP TRIGGER IF EXISTS on_auth_user_created_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_created_auto_confirm
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_user();

-- Sonuç: Artık email confirmation gerekmeyecek
-- Yeni kayıtlar otomatik onaylanacak
