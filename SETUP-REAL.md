# 🚀 Gerçek Supabase Kurulum Rehberi

Bu rehberi takip ederek Proyon'u **tamamen çalışır** hale getirin.

## ✅ ÖNCELİKLE YAPILACAKLAR

### Adım 1: Supabase Projesi Oluştur (5 dakika)

1. **Supabase'e Git**
   ```
   https://supabase.com
   ```

2. **Giriş Yap / Kayıt Ol**
   - GitHub hesabınızla giriş yapabilirsiniz (önerilen)

3. **Yeni Proje Oluştur**
   - "New Project" veya "Start your project" butonuna tıklayın
   - **Organization:** Varsa seçin, yoksa "New organization" → İsim verin
   - **Project Name:** `proyon`
   - **Database Password:** Güçlü bir şifre belirleyin 
     - ⚠️ **ÖNEMLİ:** Bu şifreyi bir yere not alın!
     - Örnek: `Pr0y0n2024!SecurePass`
   - **Region:** `Europe (Frankfurt)` (Türkiye'ye en yakın)
   - **Pricing Plan:** Free (Başlangıç için yeterli)

4. **Create Project'e Tıklayın**
   - ⏳ 1-2 dakika bekleyin (proje hazırlanıyor)

---

## Adım 2: API Keys Alma (2 dakika)

Proje hazır olunca:

1. **Sol menüden:** `Project Settings` (dişli ikonu)
2. **API** sekmesine tıklayın
3. **Şu bilgileri kopyalayın:**

```
Project URL: https://xxxxxxxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
```

⚠️ **DİKKAT:** 
- `anon public` key'i kopyalayın (service_role DEĞİL!)
- Bu bilgileri bir metin belgesine yapıştırın

---

## Adım 3: Environment Variables Ayarla (1 dakika)

1. **Projenizde `.env.local` dosyasını açın** (zaten var)

2. **Şu satırları değiştirin:**

```env
# ÖNCESİ (demo):
NEXT_PUBLIC_SUPABASE_URL=https://demo-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=demo-anon-key-replace-with-real-key

# SONRASI (gerçek):
NEXT_PUBLIC_SUPABASE_URL=https://SIZIN-PROJECT-ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
```

3. **Dosyayı kaydedin** (Ctrl+S)

---

## Adım 4: Database Migration Çalıştır (3 dakika)

**ÖNEMLİ:** Bu adım veritabanı tablolarını oluşturur.

### Yöntem 1: SQL Editor (Kolay)

1. **Supabase Dashboard'da:**
   - Sol menüden `SQL Editor` seçin
   - "New Query" butonuna tıklayın

2. **Migration SQL'i Kopyala:**
   - `supabase/migrations/20251218000001_initial_schema.sql` dosyasını açın
   - **TÜM içeriği kopyalayın** (Ctrl+A, Ctrl+C)

3. **SQL Editor'e Yapıştır:**
   - Kopyaladığınız SQL'i yapıştırın (Ctrl+V)
   - **RUN** butonuna basın (veya Ctrl+Enter)

4. **Başarı Kontrolü:**
   ```
   ✅ Success. No rows returned
   ```
   görmelisiniz.

5. **Tabloları Kontrol Edin:**
   - Sol menüden `Table Editor` seçin
   - Şu tabloları görmelisiniz:
     - `profiles`
     - `projects`
     - `roadmap_nodes`
     - `mentor_logs`

---

## Adım 5: Authentication Ayarları (2 dakika)

1. **Supabase Dashboard:**
   - Sol menüden `Authentication` → `Providers`

2. **Email Provider:**
   - Zaten açık olmalı
   - "Confirm email" **KAPALI** olmalı (development için)
   - "Enable email confirmations" → **DISABLE**

3. **Redirect URLs (Opsiyonel):**
   - `Authentication` → `URL Configuration`
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/**`

---

## Adım 6: Row Level Security (RLS) Kontrolü

Migration otomatik RLS politikaları ekledi. Kontrol:

1. **Table Editor'de bir tabloya tıklayın** (örn: `projects`)
2. **RLS** sekmesine gidin
3. **Policies** görmelisiniz:
   - ✅ "Users can view own projects"
   - ✅ "Users can create own projects"
   - ✅ "Users can update own projects"
   - ✅ "Users can delete own projects"

Hepsi varsa ✅ **BAŞARILI!**

---

## Adım 7: Test Kullanıcısı Oluştur (2 dakika)

1. **Supabase Dashboard:**
   - `Authentication` → `Users`
   - "Add user" → "Create new user"

2. **Bilgileri Girin:**
   - Email: `test@proyon.dev`
   - Password: `Test123456!`
   - "Auto Confirm User" ✅ **İŞARETLEYİN**
   - "Create user"

3. **User ID'yi Kopyalayın:**
   - Oluşturulan kullanıcının ID'sini kopyalayın
   - Örnek: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

---

## Adım 8: Test Verisi Ekle (3 dakika)

### SQL Editor'de çalıştırın:

```sql
-- Test user ID'nizi buraya yazın
DO $$
DECLARE
  test_user_id UUID := 'BURAYA-USER-ID-YAPIŞTIRIN'; -- ÖRN: 'a1b2c3d4-e5f6-7890...'
  test_project_id UUID;
  node1_id UUID;
  node2_id UUID;
BEGIN
  -- Profile oluştur
  INSERT INTO profiles (id, full_name, role, bio)
  VALUES (
    test_user_id,
    'Test Kullanıcı',
    'user',
    'Proyon test kullanıcısı'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Test projesi oluştur
  INSERT INTO projects (
    id, user_id, title, abstract_text, description,
    status, domain_type, tags, is_public
  ) VALUES (
    uuid_generate_v4(),
    test_user_id,
    'Modern E-Ticaret Platformu',
    'Next.js, TypeScript, Stripe ve Supabase ile modern e-ticaret',
    'Sıfırdan profesyonel bir e-ticaret sitesi oluşturma projesi.',
    'active',
    'software',
    ARRAY['Next.js', 'TypeScript', 'E-commerce'],
    true
  )
  RETURNING id INTO test_project_id;

  -- Roadmap node 1
  INSERT INTO roadmap_nodes (
    id, project_id, title, description,
    technical_requirements, rationale,
    status, order_index, priority, estimated_duration
  ) VALUES (
    uuid_generate_v4(),
    test_project_id,
    'Proje Yapısını Oluştur',
    'Next.js projesi başlat, TypeScript yapılandır',
    'Next.js 14.x, TypeScript 5.x, Tailwind CSS',
    'Sağlam bir temel gereklidir',
    'done',
    1, 0, 60
  )
  RETURNING id INTO node1_id;

  -- Roadmap node 2
  INSERT INTO roadmap_nodes (
    id, project_id, title, description,
    technical_requirements, rationale,
    status, parent_node_id, order_index, priority, estimated_duration
  ) VALUES (
    uuid_generate_v4(),
    test_project_id,
    'Supabase Kurulumu',
    'Database schema oluştur, RLS politikaları ekle',
    'Supabase PostgreSQL, Row Level Security, Migrations',
    'Güvenli backend altyapısı',
    'in_progress',
    node1_id,
    2, 1, 120
  )
  RETURNING id INTO node2_id;

  -- Roadmap node 3
  INSERT INTO roadmap_nodes (
    project_id, title, description,
    technical_requirements, rationale,
    status, parent_node_id, order_index, priority, estimated_duration
  ) VALUES (
    test_project_id,
    'Authentication Sistemi',
    'Kullanıcı girişi, kayıt, OAuth',
    'Supabase Auth, NextAuth.js, JWT',
    'Güvenli kullanıcı yönetimi',
    'pending',
    node2_id,
    3, 2, 180
  );

  -- Test AI message
  INSERT INTO mentor_logs (project_id, sender, message)
  VALUES (
    test_project_id,
    'ai',
    'Merhaba! Projenize hoş geldiniz. Size nasıl yardımcı olabilirim? 🚀'
  );

  RAISE NOTICE 'Test verisi oluşturuldu! Project ID: %', test_project_id;
END $$;
```

**ÇIKTI:**
```
NOTICE: Test verisi oluşturuldu! Project ID: xxxxxxxx-xxxx-xxxx...
```

---

## Adım 9: Uygulamayı Çalıştır ve Test Et

### Terminal'de:

```bash
# Dev server'ı yeniden başlat
npm run dev
```

### Tarayıcıda:

1. **Ana Sayfa:** `http://localhost:3000`
   - "Dashboard Demo" butonu artık çalışıyor ✅

2. **Gerçek Dashboard:**
   ```
   http://localhost:3000/dashboard/projects/PROJE-ID-BURAYA
   ```
   - SQL çıktısındaki Project ID'yi yapıştırın

3. **Test Edin:**
   - ✅ Sol sidebar: Proje bilgileri
   - ✅ Timeline: 3 adım (1 done, 1 in progress, 1 pending)
   - ✅ Chat: AI mesajı görünüyor
   - ✅ "Başla" butonuna tıklayın → Durum değişir
   - ✅ "Takıldım" → Chat açılır
   - ✅ Real-time updates çalışıyor

---

## Adım 10: Google Gemini AI (Opsiyonel)

AI özelliklerini aktifleştirmek için:

### 1. API Key Al:
```
https://makersuite.google.com/app/apikey
```

### 2. .env.local'e Ekle:
```env
GEMINI_API_KEY=AIzaSy...
```

### 3. Test Et:

**Roadmap Oluşturma:**
```typescript
import { generateRoadmap } from '@/actions/generateRoadmap';

const result = await generateRoadmap({
  userId: 'user-id',
  projectText: 'Next.js ile blog platformu'
});
```

**Görsel Troubleshooting:**
```typescript
import { analyzeIssue } from '@/actions/analyzeIssue';

const result = await analyzeIssue({
  projectId: 'project-id',
  userQuery: 'LED yanmıyor',
  imageBase64: '...'
});
```

---

## ✅ BAŞARI KONTROL LİSTESİ

- [ ] Supabase projesi oluşturuldu
- [ ] API keys alındı ve .env.local'e eklendi
- [ ] Database migration çalıştırıldı
- [ ] 4 tablo oluşturuldu (profiles, projects, roadmap_nodes, mentor_logs)
- [ ] RLS politikaları aktif
- [ ] Test kullanıcısı oluşturuldu
- [ ] Test verisi eklendi
- [ ] Dashboard açılıyor ve çalışıyor
- [ ] Timeline interaktif (durum değiştirme çalışıyor)
- [ ] Chat mesajları görünüyor
- [ ] (Opsiyonel) Gemini API key eklendi

---

## 🎉 TAMAMLANDI!

Artık **tamamen çalışan** bir Proyon uygulamanız var!

### Sıradaki Adımlar:

1. **Authentication Sayfaları:**
   - Login/Signup formu oluştur
   - Supabase Auth entegrasyonu

2. **Project Listesi:**
   - `/dashboard` sayfası
   - Tüm projeleri listele
   - Yeni proje oluştur butonu

3. **AI Roadmap Generator:**
   - `/projects/new` sayfası
   - Gemini ile otomatik roadmap

4. **Visual Troubleshooting:**
   - Chat'e fotoğraf upload
   - AI analiz göster

---

## 🐛 Sorun mu var?

### "RLS policy violation"
- Test kullanıcısıyla giriş yapmadınız
- User ID yanlış

### "Table doesn't exist"
- Migration çalıştırılmadı
- SQL Editor'de hata olmuş (tekrar deneyin)

### "Invalid API key"
- .env.local yanlış
- Server'ı yeniden başlatın

### "Can't connect to Supabase"
- URL/key kontrol edin
- Network problemi olabilir

---

**Yardım:** `README.md` ve diğer dokümantasyonlara bakın!
