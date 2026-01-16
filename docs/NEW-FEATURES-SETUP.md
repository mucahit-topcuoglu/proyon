# 🚀 Yeni Özellikler - Setup Rehberi

## ✅ Eklenen Özellikler

### 1. **Manuel Adım Ekleme** ✅
- Manuel projelerde kategorilere adım ekleyebilirsiniz
- "Adım Ekle" butonu ile basit modal
- Başlık ve açıklama eklenebilir
- Adımlar "Bekliyor" durumunda oluşturulur

**Kullanım**:
```
Manuel Proje > Kategori Seç > Adım Ekle Butonu
```

### 2. **Email Davet Sistemi** ✅
- Davet edilen kişinin mailine otomatik email gider
- Güzel HTML template
- Davet linki emailde
- 7 gün geçerlilik süresi

**Gereksinimler**:
- Resend API Key

### 3. **Email Kontrolü** ✅
- Davet sadece belirtilen email adresine
- Başka email ile giriş yapılamaz
- Hata mesajı: "Bu davet x@gmail.com adresine gönderilmiş"

### 4. **Kategori Bazlı Erişim Kontrolü** ✅
- Ekip üyesi sadece izinli kategorileri görür
- Diğer kategoriler gizlenir
- Owner tüm kategorileri görür

---

## 🔧 Kurulum Adımları

### 1. Resend API Key Al

1. [resend.com](https://resend.com) adresine git
2. Ücretsiz hesap aç (ayda 100 email free)
3. API Keys > Create API Key
4. Key'i kopyala

### 2. .env.local Dosyasına Ekle

`.env.local` dosyanızı açın ve ekleyin:

```env
# Resend Email Service
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx

# App URL (production için değiştirin)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Resend'de Domain Doğrula (Opsiyonel - Production için)

**Development için**: `noreply@resend.dev` kullanabilirsiniz (varsayılan)

**Production için**:
1. Resend Dashboard > Domains
2. Add Domain
3. DNS kayıtlarını ekle
4. `lib/email.ts` dosyasındaki `from:` kısmını güncelle:
   ```typescript
   from: 'Proyon <noreply@yourdomain.com>',
   ```

---

## 📝 Kullanım Örnekleri

### Manuel Adım Ekleme

```typescript
// Kategori seç > Adım Ekle

Başlık: "API endpoint'leri oluştur"
Açıklama: "User authentication ve CRUD endpoints"

// Otomatik olarak "Bekliyor" durumunda eklenir
// "Başla" ile "Devam Ediyor" yapılabilir
```

### Ekip Daveti

```typescript
// Ekip Yönetimi > Yeni Üye Davet Et

Email: dev@example.com
Rol: Editor
Kategoriler: ✓ Backend  ✓ Database  ✗ Frontend

// Email gönderilir:
// "Merhaba! Ali sizi Proyon projeine davet etti..."
```

### Email Kontrolü

```typescript
// Davet: dev@example.com
// Kullanıcı: other@example.com ile giriş yapar

// ❌ Hata: "Bu davet dev@example.com adresine gönderilmiş. 
//           Lütfen dev@example.com hesabıyla giriş yapın."
```

### Kategori Görünürlüğü

```typescript
// Owner: Tüm kategorileri görür (Backend, Frontend, Database)

// Ekip Üyesi (sadece Backend izni):
// - Backend ✓ (görünür)
// - Frontend ✗ (gizli)
// - Database ✗ (gizli)
```

---

## 🐛 Sorun Giderme

### Email Gitmiyor

1. **API Key kontrol et**:
   ```bash
   # .env.local dosyasında
   RESEND_API_KEY=re_... # Doğru mu?
   ```

2. **Console'da log var mı**:
   ```
   ✅ Davet emaili gönderildi: user@example.com
   ```

3. **Resend Dashboard**:
   - resend.com > Logs
   - Email gönderildi mi kontrol et

### Kategori Görünmüyor

1. **Console kontrol**:
   ```javascript
   📦 CategoryTabs loadCategories: {...}
   🔒 Kullanıcı 2/5 kategoriye erişebiliyor
   ✅ 2 kategori yüklendi
   ```

2. **Ekip Yönetimi > Kategori İzinleri**:
   - 📁 butonuna tıkla
   - İzinleri kontrol et

### Davet Kabul Edilemiyor

1. **Email eşleşiyor mu**:
   ```
   Davet Email: dev@example.com
   Giriş Email: dev@example.com ✓
   ```

2. **Token geçerli mi**:
   - 7 günden eski davetler iptal olur
   - Yeni davet gönder

---

## 📊 Test Checklist

- [ ] Manuel proje oluştur
- [ ] Kategori ekle
- [ ] "Adım Ekle" butonu görünüyor mu?
- [ ] Adım eklenebiliyor mu?
- [ ] Ekip üyesi davet et
- [ ] Email gitti mi? (Resend Logs)
- [ ] Davet linki çalışıyor mu?
- [ ] Başka email ile giriş engelliyor mu?
- [ ] Kategori izni ver
- [ ] Ekip üyesi sadece izinli kategorileri görüyor mu?

---

## 🎯 Sonraki İyileştirmeler

- [ ] Adım düzenleme modal'ı
- [ ] Adım silme özelliği
- [ ] Toplu adım ekleme
- [ ] Kategori renk/ikon düzenleme
- [ ] Real-time collaboration (WebSocket)
- [ ] Bildirim sistemi

---

## 💡 İpuçları

1. **Development'ta email test**:
   - Resend free plan: 100 email/ay
   - Test için kendi emailinizi kullanın

2. **Production'a geçerken**:
   - Domain ekleyin (SPF, DKIM)
   - `NEXT_PUBLIC_APP_URL` güncellyin
   - Email template'i özelleştirin

3. **Güvenlik**:
   - API key'i asla commit'lemeyin
   - .gitignore'da .env.local olmalı
   - Production'da environment variables kullanın

---

**Hazırlayan**: GitHub Copilot
**Tarih**: 21 Aralık 2025
**Versiyon**: 1.0.0
