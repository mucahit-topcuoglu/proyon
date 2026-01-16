# 📧 Proyon AI - Nodemailer E-posta Yönetim Sistemi

Profesyonel e-posta yönetim sistemi başarıyla entegre edildi! Resend yerine Nodemailer ile tamamen kontrol sizde.

## ✨ Özellikler

- ✅ **Nodemailer tabanlı** - Kendi SMTP sunucunuz
- ✅ **Tip güvenli** - TypeScript interface'leri
- ✅ **6 farklı şablon** - Doğrulama, rapor, bildirim, hoş geldin, şifre sıfırlama
- ✅ **Responsive tasarım** - Tüm e-posta istemcilerinde mükemmel görünüm
- ✅ **Base64 logo** - E-posta istemcilerinde engellenmez
- ✅ **Retry mekanizması** - Hata durumunda otomatik yeniden deneme
- ✅ **Toplu gönderim** - Promise.allSettled ile güvenli toplu e-posta
- ✅ **API endpoint** - REST API üzerinden e-posta gönderimi

## 📁 Dosya Yapısı

```
lib/email/
├── types.ts         # Tip tanımlamaları
├── transporter.ts   # SMTP yapılandırması
├── templates.ts     # HTML şablonları
└── actions.ts       # Gönderim fonksiyonları

app/api/email/send/
└── route.ts         # API endpoint
```

## 🔧 Kurulum

### 1. SMTP Ayarları

[.env.local](.env.local) dosyasını düzenleyin:

```env
# Gmail kullanıyorsanız
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=sizin-email@gmail.com
SMTP_PASS=uygulama-sifreniz
EMAIL_FROM_NAME=Proyon AI
```

### 2. Gmail Uygulama Şifresi Oluşturma

1. Google Hesabı → Güvenlik
2. 2 Adımlı Doğrulama'yı aktifleştirin
3. Uygulama Şifreleri → "Posta" seçin
4. Oluşturulan şifreyi `SMTP_PASS`'e yapıştırın

🔗 [Uygulama Şifresi Oluştur](https://myaccount.google.com/apppasswords)

### 3. Diğer SMTP Sağlayıcılar

**Outlook/Hotmail:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

**Yahoo:**
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

**Özel Domain (cPanel/Plesk):**
```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=465
SMTP_SECURE=true
```

## 🚀 Kullanım

### Kod İçinde Kullanım

```typescript
import {
  sendVerificationCode,
  sendProjectReport,
  sendSystemAlert,
  sendWelcomeEmail,
} from '@/lib/email/actions';

// Doğrulama kodu gönder
await sendVerificationCode({
  to: 'user@example.com',
  code: '123456',
  userName: 'Ahmet',
  expiresIn: '10 dakika',
});

// Proje raporu gönder
await sendProjectReport({
  to: 'user@example.com',
  projectName: 'Web Projesi',
  reportSummary: 'Proje %85 tamamlandı. 3 görev kaldı.',
  reportUrl: 'https://proyon.ai/reports/123',
});

// Sistem bildirimi
await sendSystemAlert({
  to: ['admin@example.com', 'user@example.com'],
  alertTitle: 'Önemli Güncelleme',
  alertMessage: 'Sistem bakıma alınacak.',
  severity: 'warning',
  actionUrl: 'https://proyon.ai/status',
});

// Hoş geldin e-postası
await sendWelcomeEmail({
  to: 'newuser@example.com',
  userName: 'Mehmet',
  loginUrl: 'https://proyon.ai/login',
});
```

### API Üzerinden Kullanım

```bash
# Health Check
curl http://localhost:3000/api/email/send

# Doğrulama kodu gönder
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "type": "verification",
    "data": {
      "to": "user@example.com",
      "code": "123456",
      "userName": "Ahmet"
    }
  }'

# Proje raporu gönder
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "type": "project-report",
    "data": {
      "to": "user@example.com",
      "projectName": "Web Projesi",
      "reportSummary": "Proje tamamlandı!",
      "reportUrl": "https://proyon.ai/reports/123"
    }
  }'

# Özel e-posta
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "type": "custom",
    "data": {
      "to": "user@example.com",
      "subject": "Test E-postası",
      "html": "<h1>Merhaba</h1><p>Bu bir test.</p>",
      "text": "Merhaba, Bu bir test."
    }
  }'
```

## 📧 Mevcut E-posta Şablonları

1. **verification** - Doğrulama kodu
2. **project-report** - AI proje raporu
3. **system-alert** - Sistem bildirimleri (info/warning/critical)
4. **welcome** - Hoş geldin mesajı
5. **password-reset** - Şifre sıfırlama
6. **custom** - Özel e-posta (tam kontrol)

## 🎨 Tasarım Özellikleri

- **Proyon marka renkleri** (#3b82f6 mavi gradient)
- **Responsive** - Mobil ve masaüstü uyumlu
- **Base64 logo** - Harici görsel engellenmez
- **Inline CSS** - Tüm e-posta istemcilerinde çalışır
- **Dark mode hazır** - Koyu temada da okunabilir

## 🔒 Güvenlik

- ❌ SMTP bilgileri asla hardcoded değil
- ✅ Environment variables kullanımı
- ✅ Try-catch ile hata yönetimi
- ✅ Alıcı sayısı limiti (50 kişi)
- ✅ Attachment boyut limiti (25MB)
- ✅ Rate limiting (saniyede 5 e-posta)

## 🧪 Test

```typescript
// Test e-postası gönder
import { sendEmail } from '@/lib/email/actions';

const result = await sendEmail({
  to: 'test@example.com',
  subject: 'Test E-postası',
  html: '<h1>Merhaba Dünya!</h1>',
});

console.log(result.success ? '✅ Başarılı' : '❌ Hata:', result);
```

## 📊 Loglama

Tüm e-posta işlemleri console'a loglanır:

```
✅ SMTP sunucusu hazır
✅ E-posta gönderildi: <message-id>
❌ E-posta gönderilemedi: Hata mesajı
📧 Toplu gönderim: 5 başarılı, 0 başarısız
```

## 🔄 Resend'den Geçiş

Mevcut Resend sistemi bozulmadı, ancak yeni Nodemailer sistemi daha esnek:

| Özellik | Resend | Nodemailer |
|---------|--------|------------|
| **Maliyet** | Ücretli (limit sonrası) | Ücretsiz |
| **Domain** | Doğrulama gerekli | Gerekli değil |
| **Limit** | Plana göre sınırlı | Yok |
| **SMTP** | API | Kendi sunucunuz |
| **Kontrol** | Kısıtlı | Tam kontrol |

## 🚨 Sorun Giderme

### SMTP bağlantı hatası

```
❌ SMTP bağlantı testi başarısız
```

**Çözüm:**
- Gmail için "Uygulama Şifresi" kullanın (normal şifre çalışmaz)
- 2 Adımlı Doğrulama aktif olmalı
- "Daha az güvenli uygulamalar" ayarını kontrol edin

### E-posta gönderilmiyor

```
❌ E-posta gönderilemedi: Authentication failed
```

**Çözüm:**
- `SMTP_USER` ve `SMTP_PASS` doğru mu?
- Port doğru mu? (587 genelde çalışır)
- `SMTP_SECURE=false` ayarını deneyin

## 📝 Yeni Şablon Ekleme

`lib/email/templates.ts` dosyasına yeni fonksiyon ekleyin:

```typescript
export function getCustomTemplate(data: CustomData): EmailTemplate {
  const content = `
    <h1>Başlık</h1>
    <p>${data.message}</p>
  `;

  return {
    subject: data.subject,
    html: getBaseTemplate(content),
    text: data.message,
  };
}
```

## 🎯 Sonraki Adımlar

1. ✅ [.env.local](.env.local) dosyasını SMTP bilgileriyle güncelleyin
2. ✅ Sunucuyu yeniden başlatın: `npm run dev`
3. ✅ Test e-postası gönderin
4. ✅ Supabase Edge Function'larla entegre edin (opsiyonel)

## 🔗 Faydalı Linkler

- [Nodemailer Dokümantasyonu](https://nodemailer.com/)
- [Gmail Uygulama Şifresi](https://myaccount.google.com/apppasswords)
- [SMTP Port Rehberi](https://www.sparkpost.com/blog/smtp-ports/)

---

**Hazır!** Artık Proyon AI'da profesyonel e-posta sistemi var. 🚀
