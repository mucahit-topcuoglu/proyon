-- ProYön Test Kullanıcısı Oluşturma
-- Bu script bir test kullanıcısı oluşturur ve email confirmation'ı bypass eder

-- 1. Email confirmation'ı devre dışı bırak (eğer aktifse)
-- Bu işlemi Supabase Dashboard > Authentication > Providers > Email'den de yapabilirsiniz
-- "Confirm email" seçeneğini devre dışı bırakın

-- 2. Test kullanıcısı için profil oluştur
INSERT INTO profiles (id, email, full_name, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'test@proyon.dev',
  'Test Kullanıcısı',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- NOT: Gerçek kullanıcı auth.users tablosunda Supabase tarafından otomatik oluşturulur
-- Biz sadece profiles tablosunda placeholder oluşturduk

-- Kullanıcı kaydı için /signup sayfasını kullanın:
-- Email: test@proyon.dev
-- Password: TestProyon123! (güçlü şifre)

-- Eğer email confirmation devre dışıysa, hemen giriş yapabilirsiniz
-- Eğer aktifse, Supabase Dashboard > Authentication > Users'dan manuel onaylayın
