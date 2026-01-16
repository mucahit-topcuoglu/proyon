# 🔐 Authentication Test Senaryoları

## ✅ Test 1: Mevcut Kullanıcı ile Giriş

### Adımlar:
1. `http://localhost:3000/login` sayfasına git
2. **"Test Kullanıcısı ile Giriş"** butonuna tıkla
3. **Beklenen:** `/dashboard/projects` sayfasına yönlendirilmeli

### Kullanıcı Bilgileri:
- **Email:** `test@proyon.dev`
- **Şifre:** `Test123456!`

---

## ✅ Test 2: Manuel Giriş

### Adımlar:
1. `http://localhost:3000/login` sayfasına git
2. Email: `test@proyon.dev`
3. Şifre: `Test123456!`
4. **"Giriş Yap"** butonuna tıkla
5. **Beklenen:** Dashboard'a yönlendirilmeli

---

## ✅ Test 3: Yeni Kullanıcı Kaydı

### Adımlar:
1. `http://localhost:3000/signup` sayfasına git
2. **Ad Soyad:** İstediğin bir isim (örn: "Ahmet Yılmaz")
3. **Email:** Yeni bir email (örn: `ahmet@test.com`)
4. **Şifre:** `Test123456!` (en az 8 karakter)
5. **Şifre Tekrar:** `Test123456!`
6. **"Kayıt Ol"** butonuna tıkla
7. **Beklenen:** 
   - ✅ "Kayıt Başarılı! 🎉" mesajı
   - ✅ 1.5 saniye sonra dashboard'a yönlendirilmeli

### ⚠️ HATA ALIRSAN:

**"Database error saving new user"**
→ Supabase'de **email confirmation kapalı değil**
→ Çözüm: `supabase/fix-auth.sql` çalıştır

**"User already registered"**
→ Bu email zaten kullanılmış
→ Çözüm: Farklı bir email dene

---

## ✅ Test 4: Çıkış Yap

### Adımlar:
1. Dashboard'da sağ üstteki **"Çıkış"** butonuna tıkla
2. **Beklenen:** Login sayfasına yönlendirilmeli
3. Tarayıcıyı yenile (F5)
4. **Beklenen:** Hala login sayfasında olmalı (session silinmiş)

---

## ✅ Test 5: Protected Route Kontrolü

### Adımlar:
1. Çıkış yaptıktan sonra (logged out)
2. Manuel olarak `http://localhost:3000/dashboard/projects` git
3. **Beklenen:** Login sayfasına yönlendirilmeli

---

## ✅ Test 6: Şifre Doğrulama

### Adımlar:
1. Signup sayfasında farklı şifreler gir:
   - Şifre: `Test123456!`
   - Şifre Tekrar: `FarklıŞifre!`
2. **Beklenen:** "Şifreler eşleşmiyor" hatası

### Adımlar 2:
1. Signup sayfasında kısa şifre gir:
   - Şifre: `123`
2. **Beklenen:** "Şifre en az 8 karakter olmalıdır" hatası

---

## ✅ Test 7: Yanlış Giriş Bilgileri

### Adımlar:
1. Login sayfasında yanlış şifre gir:
   - Email: `test@proyon.dev`
   - Şifre: `YanlışŞifre123`
2. **Beklenen:** "Invalid login credentials" hatası

---

## 🐛 Sorun Giderme

### Sorun: "Email not confirmed"
**Çözüm:**
```sql
-- SQL Editor'de çalıştır
UPDATE auth.users
SET 
  email_confirmed_at = NOW(),
  confirmed_at = NOW()
WHERE email = 'EMAIL-ADRESİ';
```

### Sorun: "Database error saving new user"
**Çözüm:**
1. Supabase Dashboard → Authentication → Providers
2. Email Provider → "Enable email confirmations" → **KAPAT**
3. Save

### Sorun: Login sonrası yönlendirilmiyor
**Çözüm:**
- Browser console'u aç (F12)
- Hataları kontrol et
- LocalStorage'ı temizle: `localStorage.clear()`
- Sayfayı yenile

### Sorun: "RLS policy violation"
**Çözüm:**
Eğer signup çalışmıyorsa, geçici olarak:
```sql
-- RLS'i kapat (sadece development için)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

---

## 📊 Başarı Kriterleri

✅ Test kullanıcısı ile giriş çalışıyor  
✅ Manuel giriş çalışıyor  
✅ Yeni kullanıcı kaydı çalışıyor  
✅ Çıkış yapma çalışıyor  
✅ Protected routes korunuyor  
✅ Form validasyonları çalışıyor  
✅ Hata mesajları görünüyor  
✅ Başarı mesajları görünüyor  

---

**Test et ve sonuçları bildir!** 🚀
