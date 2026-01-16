# 🧪 ProYön Davet Sistemi Test Rehberi

## 📋 Hazırlık Adımları

### 1. Database Migration'ı Çalıştır

Supabase Dashboard'a git ve SQL Editor'de bu dosyayı çalıştır:
```bash
supabase/invitation-email-tracking.sql
```

**Veya direkt SQL:**
```sql
ALTER TABLE project_invitations
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_opened_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_click_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS accepted_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS category_ids TEXT[] DEFAULT '{}';
```

### 2. Environment Variables Kontrol

`.env.local` dosyasında şunlar olmalı:
```bash
# Email Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Dev Server'ı Başlat

```bash
npm run dev
```

---

## 🧪 Test Senaryoları

### ✅ TEST 1: YENİ KULLANICI DAVETI (Kayıtsız Email)

**Amaç:** Sistemde hesabı olmayan birine davet gönder

**Adımlar:**

1. **Proje Sayfasına Git**
   ```
   http://localhost:3000/dashboard
   ```

2. **Bir Projeye Tıkla**
   - Proje detay sayfasına git

3. **"Team Management" veya "Ekip" Sekmesine Tıkla**

4. **"Invite Member" Butonuna Tıkla**

5. **Formu Doldur:**
   - **Email:** `test-new-user@gmail.com` (henüz kayıtlı OLMAYAN bir email)
   - **Role:** `Editor` veya `Viewer` seç
   - **(Opsiyonel) Categories:** Kategorileri seç veya boş bırak (tüm kategoriler için)

6. **"Send Invitation" Butonuna Bas**

7. **Konsolu Kontrol Et**
   ```
   ✅ Davet emaili gönderildi: test-new-user@gmail.com
   📧 DAVET OLUŞTURULDU
   Alıcı: test-new-user@gmail.com
   Rol: editor
   Davet Linki: http://localhost:3000/invitation?token=xxxxx
   ```

8. **Email Kutusunu Kontrol Et**
   - `test-new-user@gmail.com` adresine gelen emaili aç
   - Email şöyle görünmeli:
     - **Başlık:** "🎯 [Kullanıcı Adı] seni [Proje Adı] projesine davet etti"
     - **Gradient tasarım** (mor-mavi-pembe)
     - **"Sign Up & Accept Invitation" butonu** (yeşil)
     - Proje detayları, rol badge'i, kategori listesi

9. **Email'deki Butona Tıkla**
   - Signup sayfasına yönlendirilmeli
   - Email otomatik dolu olmalı: `test-new-user@gmail.com`

10. **Kayıt Ol:**
    - Adını gir: `Test User`
    - Şifre gir: `Test123456!`
    - "Sign Up" butonuna bas

11. **Email Doğrulama**
    - Email kutusuna gelen doğrulama linkine tıkla
    - Hesap aktif olmalı

12. **Davet Linkini Tekrar Aç**
    ```
    http://localhost:3000/invitation?token=xxxxx
    ```

13. **Otomatik Kabul Edilmeli:**
    - "Invitation Accepted!" mesajı
    - 2 saniye sonra proje sayfasına yönlendirme
    - Proje ekibine eklenmiş olmalı

---

### ✅ TEST 2: MEVCUT KULLANICI DAVETI (Kayıtlı Email)

**Amaç:** Sistemde hesabı olan birine davet gönder

**Adımlar:**

1. **İkinci Bir Hesap Oluştur** (eğer yoksa)
   ```
   Email: test-existing@gmail.com
   Password: Test123456!
   ```

2. **İlk Hesapla Giriş Yap**
   - Ana hesabınla proje sahibi olarak giriş yap

3. **Proje Sayfasına Git → Team Management**

4. **"Invite Member" Butonuna Tıkla**

5. **Formu Doldur:**
   - **Email:** `test-existing@gmail.com` (KAYITLI email)
   - **Role:** `Viewer` seç
   - **Categories:** 1-2 kategori seç (kısıtlı erişim için)

6. **"Send Invitation" Butonuna Bas**

7. **Email Kutusunu Kontrol Et**
   - `test-existing@gmail.com` adresine gelen emaili aç
   - Email şöyle görünmeli:
     - **Başlık:** "🎯 [Kullanıcı Adı] seni [Proje Adı] projesine davet etti"
     - **"Accept Invitation" butonu** (yeşil)
     - **Kategori listesi:** Sadece seçilen kategoriler
     - **Viewer badge'i** (mavi)

8. **Email'deki Butona Tıkla**
   - Login sayfasına yönlendirilmeli (yeni kullanıcı değil)

9. **Giriş Yap:**
   - Email: `test-existing@gmail.com`
   - Password: `Test123456!`

10. **Otomatik Kabul Edilmeli:**
    - Proje sayfasına yönlendirme
    - Sadece seçilen kategorileri görebilmeli
    - Viewer rolü olduğu için düzenleme yapamamalı

---

### ✅ TEST 3: KATEGORİ KISITLAMA TESTİ

**Amaç:** Kategori bazlı erişim kontrolünü test et

**Adımlar:**

1. **Projeye 3-4 Kategori Ekle:**
   - Frontend Development
   - Backend Development
   - Database Design
   - DevOps Setup

2. **Kullanıcıyı Sadece 2 Kategoriye Davet Et:**
   - Email: `test-category@gmail.com`
   - Role: `Editor`
   - Categories: Sadece "Frontend Development" ve "Backend Development" seç

3. **Davet Gönder ve Kabul Et**

4. **Proje Sayfasına Girdiğinde:**
   - ✅ Görmeli: Frontend Development, Backend Development
   - ❌ GÖRMEMELİ: Database Design, DevOps Setup

5. **URL ile Direkt Erişim Dene:**
   ```
   http://localhost:3000/projects/[project-id]?category=[hidden-category-id]
   ```
   - Erişim reddedilmeli veya 404 dönmeli

---

### ✅ TEST 4: ROL BAZLI YETKİ TESTİ

**Amaç:** Editor ve Viewer rollerinin farklarını test et

**Test A: Editor Rolü**

1. **Kullanıcıyı Editor Olarak Davet Et:**
   - Email: `test-editor@gmail.com`
   - Role: `Editor`

2. **Daveti Kabul Et ve Projeye Gir**

3. **Yapabilmesi Gerekenler:**
   - ✅ Task ekleme/düzenleme
   - ✅ Roadmap node'larını değiştirme
   - ✅ Comment yapma
   - ✅ Dosya yükleme

**Test B: Viewer Rolü**

1. **Kullanıcıyı Viewer Olarak Davet Et:**
   - Email: `test-viewer@gmail.com`
   - Role: `Viewer`

2. **Daveti Kabul Et ve Projeye Gir**

3. **Yapabilmesi Gerekenler:**
   - ✅ Projeyi görüntüleme
   - ✅ Comment yapma
   - ❌ Task ekleme/düzenleme (buton disabled olmalı)
   - ❌ Roadmap değişikliği (read-only)
   - ❌ Ekip yönetimi

---

### ✅ TEST 5: DAVET SÜRECİ EDGE CASE'LER

**Test A: Süresi Dolmuş Davet**

1. **Database'de Manuel Olarak Daveti Geçersiz Kıl:**
   ```sql
   UPDATE project_invitations
   SET expires_at = NOW() - INTERVAL '1 day'
   WHERE token = 'test-token';
   ```

2. **Davet Linkine Tıkla**
   - Hata mesajı görünmeli: "Bu davet süresi dolmuş"

**Test B: Aynı Kullanıcıyı İki Kez Davet Etme**

1. **İlk Davet:** `test@gmail.com` → Gönder
2. **İkinci Davet:** `test@gmail.com` → Gönder
3. **Sonuç:** "Bu kullanıcı zaten davet edilmiş" hatası

**Test C: Zaten Ekip Üyesi Olan Kullanıcı**

1. **Kullanıcı Ekibe Eklenmiş**
2. **Tekrar Davet Et**
3. **Sonuç:** "Bu kullanıcı zaten proje üyesi" hatası

**Test D: Geçersiz Token**

1. **Manuel Token Oluştur:**
   ```
   http://localhost:3000/invitation?token=invalid-token-12345
   ```

2. **Sonuç:** "Geçersiz davet linki" hatası

---

### ✅ TEST 6: EMAIL TASARIMI TESTİ

**Amaç:** Emailin farklı email istemcilerinde düzgün görünmesini kontrol et

**Test A: Gmail Web**
1. Gmail web arayüzünde aç
2. Gradient arka plan düzgün görünmeli
3. Butonlar tıklanabilir olmalı
4. Mobilde responsive olmalı

**Test B: Outlook**
1. Outlook'ta aç
2. Inline CSS düzgün yüklenmeli
3. Alternatif text linki görünmeli

**Test C: Mail.app (macOS)**
1. Mail uygulamasında aç
2. Tasarım bozulmamalı

**Test D: Mobile (iOS/Android)**
1. Telefonda Gmail uygulamasında aç
2. Responsive tasarım çalışmalı
3. Butona tıklanabilmeli

---

## 🐛 Yaygın Hatalar ve Çözümleri

### ❌ "Email gönderilemedi"

**Sebep:** Gmail App Password yanlış

**Çözüm:**
```bash
# .env.local dosyasını kontrol et
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx  # 16 karakter, tire ile
```

[Gmail App Password Alma](https://myaccount.google.com/apppasswords)

---

### ❌ "Kategori yok" hatası

**Sebep:** `category_ids` kolonu yok

**Çözüm:**
```sql
-- Migration'ı çalıştır
ALTER TABLE project_invitations
ADD COLUMN IF NOT EXISTS category_ids TEXT[] DEFAULT '{}';
```

---

### ❌ Email gelmiyor

**Kontrol Listesi:**
1. ✅ Spam klasörünü kontrol et
2. ✅ `GMAIL_USER` doğru email mi?
3. ✅ `GMAIL_APP_PASSWORD` 16 karakter mi?
4. ✅ Dev server çalışıyor mu?
5. ✅ Konsol logları ne diyor?

**Debug:**
```bash
# Terminal'de konsol loglarını izle
# Şunu görmeli:
✅ Profesyonel davet emaili gönderildi: test@gmail.com
```

---

### ❌ Davet kabul edilmiyor

**Sebep:** `accepted_at`, `accepted_by` kolonları yok

**Çözüm:**
```sql
ALTER TABLE project_invitations
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS accepted_by UUID REFERENCES auth.users(id);
```

---

## 📊 Başarı Kriterleri

### ✅ Test Başarılı Sayılır Eğer:

1. **Email Gönderimi:**
   - [ ] Email 5 saniyede içinde ulaşıyor
   - [ ] Tasarım düzgün görünüyor
   - [ ] Butonlar tıklanabilir
   - [ ] Gradient arka plan çalışıyor

2. **Yeni Kullanıcı Akışı:**
   - [ ] Signup sayfasına yönlendirme yapılıyor
   - [ ] Email otomatik dolu geliyor
   - [ ] Kayıt olduktan sonra otomatik kabul ediliyor
   - [ ] Proje sayfasına yönlendiriliyor

3. **Mevcut Kullanıcı Akışı:**
   - [ ] Login sayfasına yönlendirme yapılıyor
   - [ ] Giriş yaptıktan sonra otomatik kabul ediliyor
   - [ ] Proje sayfasına yönlendiriliyor

4. **Kategori Kısıtlaması:**
   - [ ] Sadece seçilen kategoriler görünüyor
   - [ ] Diğer kategorilere erişim engelleniyor
   - [ ] URL ile direkt erişim engelleniyor

5. **Rol Kontrolü:**
   - [ ] Editor: Düzenleme yapabiliyor
   - [ ] Viewer: Sadece görüntülüyor, düzenleme butonu yok

6. **Edge Cases:**
   - [ ] Süresi dolmuş davet reddediliyor
   - [ ] Aynı kullanıcı tekrar davet edilemiyor
   - [ ] Geçersiz token reddediliyor
   - [ ] Zaten üye olan kullanıcı davet edilemiyor

---

## 🎯 Sonraki Adımlar

Test başarılı olduysa:

1. **Production'a Deploy:**
   ```bash
   # Vercel'e deploy et
   vercel deploy --prod
   ```

2. **Real Email Testi:**
   - Production URL ile gerçek email adresleriyle test et

3. **Monitoring:**
   - Supabase Dashboard'dan davet istatistiklerini takip et
   - Email açılma/tıklama oranlarını analiz et

4. **Ekstra Özellikler:**
   - [ ] Davet linkini kopyalama butonu
   - [ ] Toplu davet gönderme
   - [ ] Davet geçmişi sayfası
   - [ ] Email şablonu özelleştirme

---

## 📞 Destek

Sorun yaşarsan:
1. Konsol loglarını kontrol et
2. Supabase Dashboard'dan hataları kontrol et
3. `.env.local` dosyasını tekrar gözden geçir

**Hata Mesajlarını Paylaş:**
```bash
# Terminal'deki son 50 satırı kopyala
npm run dev
# ... loglar ...
```
