# 🚀 Proyön - Production Deployment Guide

## ✅ Production Checklist

### 1. **Logo Dosyası**
```bash
# public/logo.png ekleyin
# Önerilen boyut: 180x60px veya orantılı
# Format: PNG (transparan arka plan)
```

### 2. **Supabase Konfigürasyonu**

#### a) Email Settings
- Dashboard → Authentication → Providers → Email
- ✅ **"Enable email provider"** → AÇIK
- ❌ **"Confirm email"** → KAPALI (bizim verification sistemimiz var)

#### b) Database Migration
```sql
-- Supabase SQL Editor'da çalıştır:

-- verification_codes tablosunu oluştur
CREATE TABLE IF NOT EXISTS verification_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  attempts INTEGER DEFAULT 0,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT code_length CHECK (char_length(code) = 6),
  CONSTRAINT valid_type CHECK (type IN ('signup', 'password_reset', 'email_change'))
);

CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_verification_codes_code ON verification_codes(code);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires ON verification_codes(expires_at);

ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role has full access" ON verification_codes;
CREATE POLICY "Service role has full access"
  ON verification_codes FOR ALL
  USING (true);

-- Profile RLS policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Enable insert for authentication"
  ON profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable read for users"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Enable update for users based on user_id"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

### 3. **SMTP Configuration**

#### Gmail Kullanıyorsanız:
1. Google Account → Security → 2-Step Verification (etkinleştirin)
2. https://myaccount.google.com/apppasswords
3. "App passwords" → Mail seçin → Generate
4. Oluşan 16 haneli şifreyi kopyalayın
5. `.env.production` dosyasına ekleyin:
```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=16-haneli-app-password
```

#### Custom SMTP:
```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-password
```

### 4. **Environment Variables**

`.env.production` dosyası oluşturun:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=https://proyon.com.tr

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=proyon.info@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM_NAME=Proyön

GEMINI_API_KEY=your-api-key
GROQ_API_KEY=your-api-key
```

### 5. **Vercel Deployment**

```bash
# 1. Vercel CLI install
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod

# 4. Environment variables ekle (Vercel Dashboard)
# Settings → Environment Variables
# Her değişkeni tek tek ekleyin
```

**Vercel Settings:**
- Framework Preset: Next.js
- Build Command: `next build`
- Output Directory: `.next`
- Install Command: `npm install`
- Node.js Version: 18.x

### 6. **Domain Configuration**

#### Vercel'de:
1. Settings → Domains
2. Custom domain ekleyin: `proyon.com.tr`
3. DNS kayıtlarını domain provider'da ayarlayın:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

#### .env.production güncelleyin:
```env
NEXT_PUBLIC_APP_URL=https://proyon.com.tr
```

### 7. **Post-Deployment Tests**

#### a) Email Test:
```bash
# Kayıt ol
# Email gelip gelmediğini kontrol et
# Kod doğrulaması yap
# Login başarılı mı?
```

#### b) Supabase Connection:
```bash
# Profil oluştu mu?
# Projects tablosuna erişim var mı?
```

### 8. **Monitoring & Logs**

#### Vercel:
- Dashboard → Your Project → Deployments → Functions
- Real-time logs görüntüle

#### Supabase:
- Dashboard → Logs → Auth Logs
- Email gönderme hatalarını kontrol et

---

## 🔧 Troubleshooting

### Email Gönderilmiyor
1. Supabase → Authentication → Providers → Email → **Enable AÇIK mı?**
2. SMTP credentials doğru mu?
3. Gmail App Password yeniden oluştur
4. Vercel env variables kaydedildi mi?

### Profile Oluşturulmuyor
1. Supabase SQL Editor'da trigger'ı kontrol et:
```sql
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

### Production'da Logo Görünmüyor
1. `public/logo.png` dosyası var mı?
2. `NEXT_PUBLIC_APP_URL` doğru mu?
3. Vercel'de redeploy yapın

---

## 📊 Production Ready Features

✅ Custom email verification (6-digit code)  
✅ Nodemailer SMTP integration  
✅ Supabase Auth bypass (bizim sistem)  
✅ Logo-based email templates  
✅ Rate limiting (60s cooldown)  
✅ Code expiration (10 min)  
✅ RLS policies (secure)  
✅ Error handling  
✅ Production env config  

---

**Proyön © 2025** - Yapay Zeka Destekli Proje Yönetimi
