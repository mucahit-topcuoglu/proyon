# Vercel Environment Variables Setup

## 🔧 Production URL Sorunu Çözümü

Davet emaillerinde localhost yerine production URL'i göstermek için:

## 1. Vercel Dashboard'a Git
```
https://vercel.com/[your-username]/[project-name]/settings/environment-variables
```

## 2. Bu Environment Variable'ı Ekle

**Key:** `NEXT_PUBLIC_APP_URL`  
**Value:** `https://your-production-domain.vercel.app`  
**Environment:** Production, Preview, Development (hepsini seç)

## 3. Örnek Değer

Eğer Vercel URL'in `https://proyon-master.vercel.app` ise:

```
NEXT_PUBLIC_APP_URL=https://proyon-master.vercel.app
```

veya custom domain kullanıyorsan:

```
NEXT_PUBLIC_APP_URL=https://proyon.com.tr
```

## 4. Redeploy

Environment variable ekledikten sonra:

```bash
vercel --prod
```

veya Vercel Dashboard'da "Redeploy" butonuna tıkla.

## 5. Test Et

Deployment tamamlandıktan sonra:
- Bir kullanıcıya davet gönder
- Email'i kontrol et
- Davet linki artık production URL'ini kullanmalı

## ✅ Kodda Yapılan Değişiklikler

Aşağıdaki dosyalarda `VERCEL_URL` fallback eklendi:

1. **lib/email/invitation-service.ts** - Email'deki davet linki
2. **actions/collaboration.ts** - Console'da gösterilen link
3. **lib/email/templates/invitation-template.ts** - Footer linkleri

Bu sayede:
- `NEXT_PUBLIC_APP_URL` varsa onu kullanır
- Yoksa `VERCEL_URL` kullanır (Vercel otomatik sağlar)
- İkisi de yoksa `localhost:3000` fallback

## 📝 Not

`.env.local` dosyası sadece local development içindir ve Vercel'e push edilmez. Production environment variables'ları Vercel Dashboard'dan yönetilir.
