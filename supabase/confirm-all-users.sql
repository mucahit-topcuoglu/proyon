-- Acil Email Confirmation Fix - Tüm Kullanıcıları Onayla
-- Çalıştırmak için: Supabase SQL Editor'de çalıştırın

-- 1. Tüm onaylanmamış kullanıcıları göster
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NULL THEN '❌ Onaylanmamış'
    ELSE '✅ Onaylı'
  END as durum
FROM auth.users
ORDER BY created_at DESC;

-- 2. Tüm kullanıcıları otomatik onayla
UPDATE auth.users
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  updated_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 3. Sonucu kontrol et
SELECT 
  COUNT(*) as toplam_kullanici,
  COUNT(email_confirmed_at) as onaylı_kullanici
FROM auth.users;

-- Beklenen: Her iki sayı da eşit olmalı (tüm kullanıcılar onaylı)
