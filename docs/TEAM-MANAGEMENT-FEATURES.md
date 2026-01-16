# 👥 Ekip Yönetimi - Gelişmiş Özellikler

## ✅ Yeni Eklenen Özellikler

### 1. **Bekleyen Davetler - Geliştirildi** 🎯

Artık bekleyen davetleri tam kontrol edebilirsiniz!

**Yeni Özellikler**:
- ✅ **Davet Linki Kopyala** - Tek tıkla panoya kopyala
- ✅ **Emaili Yeniden Gönder** - Email gitmediyse veya kayboldu ise tekrar gönder
- ✅ **Son Geçerlilik Tarihi** - 7 günlük süre gösteriliyor
- ✅ **Süresi Doldu Bildirimi** - Expired invitations kırmızı renkte
- ✅ **Detaylı Bilgi** - Oluşturma tarihi, son geçerlilik, rol bilgisi

**Görünüm**:
```
┌─────────────────────────────────────────────┐
│ 🕐 Bekleyen Davetler (2)                   │
├─────────────────────────────────────────────┤
│ dev@example.com                    [X]      │
│ Editor olarak davet edildi                  │
│ 📅 21.12.2025 · ⏰ Son: 28.12.2025         │
│                                             │
│ [📧 Linki Kopyala] [📧 Emaili Yeniden Gönder] │
└─────────────────────────────────────────────┘
```

---

### 2. **Ekip Üyeleri - İyileştirildi** 👤

Ekip üyesi bilgileri daha detaylı!

**Yeni Özellikler**:
- ✅ **Katılma Tarihi** - Üyenin projeye ne zaman katıldığı
- ✅ **Detaylı Bilgi** - Email, rol, izinler
- ✅ **Hızlı Düzenleme** - 3 buton (Kategoriler, Rol, Çıkar)

**Görünüm**:
```
┌─────────────────────────────────────────────┐
│ 👥 Ekip Üyeleri (3)                        │
├─────────────────────────────────────────────┤
│ [A] Ali Veli                               │
│     ali@example.com                         │
│     📅 Katıldı: 20.12.2025                 │
│                    [Editor] [📁][🛡️][🗑️]  │
└─────────────────────────────────────────────┘

Butonlar:
📁 = Kategori İzinleri
🛡️ = Rol Değiştir  
🗑️ = Çıkar
```

---

### 3. **Davet Link Yönetimi** 🔗

**Özellikler**:

1. **Linki Kopyala**:
   ```
   Tıkla → Panoya kopyalanır
   Mesaj: "✅ Davet linki kopyalandı!"
   WhatsApp/Email ile paylaşabilirsiniz
   ```

2. **Emaili Yeniden Gönder**:
   ```
   Email gitmediyse veya kayboldu ise
   Tıkla → Email tekrar gönderilir
   Mesaj: "✅ Davet emaili yeniden gönderildi!"
   ```

3. **Otomatik Süre Kontrolü**:
   ```
   7 günden eski davetler → Kırmızı
   Mesaj: "Bu davet süresi doldu. Yeni bir davet göndermeniz gerekiyor."
   ```

---

## 🎯 Kullanım Senaryoları

### Senaryo 1: Email Gitmeyen Davet

```
Problem: Ekip üyesi "Email gelmedi" diyor

Çözüm:
1. Ekip Yönetimi > Bekleyen Davetler
2. İlgili daveti bul
3. "Emaili Yeniden Gönder" butonuna tıkla
4. ✅ Email tekrar gönderilir
```

### Senaryo 2: Davet Linkini Paylaşma

```
Problem: Email spam'e düştü, kullanıcı bulamıyor

Çözüm:
1. Ekip Yönetimi > Bekleyen Davetler
2. İlgili daveti bul
3. "Linki Kopyala" butonuna tıkla
4. WhatsApp/Telegram ile linki gönder
5. ✅ Kullanıcı direkt linke tıklar
```

### Senaryo 3: Süresi Dolmuş Davet

```
Problem: Kullanıcı 8 gün sonra daveti açmaya çalışıyor

Durum:
1. Ekip Yönetimi > Bekleyen Davetler
2. Davet kırmızı renkte
3. Badge: "Süresi Doldu"
4. Mesaj: "Bu davet süresi doldu..."

Çözüm:
1. Eski daveti iptal et (X butonu)
2. Yeni davet gönder
3. ✅ 7 gün daha geçerli
```

### Senaryo 4: Ekip Üyesi İzinlerini Kontrol

```
Amaç: Bir üyenin hangi kategorilere erişimi var?

Adımlar:
1. Ekip Yönetimi > Ekip Üyeleri
2. İlgili üyeyi bul
3. 📁 (Kategori İzinleri) butonuna tıkla
4. ✅ Tüm kategori izinlerini görürsünüz
5. İsterseniz düzenleyebilirsiniz
```

---

## 📊 UI Detayları

### Bekleyen Davet Renk Kodları

```css
/* Normal Davet (Geçerli) */
background: orange-500/10
border: orange-500/30

/* Süresi Dolmuş Davet */
background: red-500/10
border: red-500/30
badge: "Süresi Doldu" (kırmızı)
```

### Ekip Üyesi Rolleri

```typescript
Owner   → Sarı badge  [👑 Sahip]
Editor  → Mor badge   [✏️ Editor]
Viewer  → Cyan badge  [👁️ Viewer]
```

### Buton İkonları

```
📁 FolderKanban → Kategori İzinleri
🛡️ Shield       → Rol Değiştir
🗑️ Trash2       → Çıkar
📧 Mail         → Email İşlemleri
❌ X            → İptal/Kapat
```

---

## 🔧 Teknik Detaylar

### Davet Link Oluşturma

```typescript
const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invitation?token=${invitation.token}`;

// Örnek:
// http://localhost:3000/invitation?token=abc123...
```

### Süre Kontrolü

```typescript
const expiresDate = new Date(invitation.expires_at);
const isExpired = expiresDate < new Date();

if (isExpired) {
  // Kırmızı badge göster
  // "Emaili Yeniden Gönder" butonunu gizle
}
```

### Email Yeniden Gönderme

```typescript
const result = await inviteToProject({
  projectId,
  email: invitation.email,
  role: invitation.role,
  invitedBy: userId,
});

// Aynı email, aynı rol
// YENİ token oluşturulur
// YENİ 7 günlük süre başlar
```

---

## 🐛 Sorun Giderme

### "Linki Kopyala" Çalışmıyor

**Neden**: Clipboard API desteklenmiyor veya HTTPS gerekiyor

**Çözüm**:
```javascript
// Development'ta HTTP de çalışır
// Production'da HTTPS gerekir
// Alternatif: Manuel kopyala
```

### Email Yeniden Gönderilmiyor

**Kontrol**:
1. Console'da hata var mı?
2. Resend dashboard (resend.com/logs)
3. RESEND_API_KEY doğru mu?
4. Email limiti doldu mu? (100/ay free)

### Süresi Dolmamış Davet "Süresi Doldu" Diyor

**Neden**: Server saat ayarı

**Kontrol**:
```typescript
console.log('Server time:', new Date());
console.log('Expires at:', new Date(invitation.expires_at));
```

---

## 📝 Güncellemeler

**21 Aralık 2025**:
- ✅ Davet linki kopyalama
- ✅ Email yeniden gönderme
- ✅ Süre takibi ve uyarılar
- ✅ Ekip üyesi katılma tarihi
- ✅ Gelişmiş UI/UX

---

## 🎓 Best Practices

1. **Davet Yönetimi**:
   - Süresi dolmadan önce hatırlat
   - Kullanılmayan davetleri iptal et
   - WhatsApp ile de link paylaş

2. **Ekip İzinleri**:
   - Her üyeye sadece gerekli kategorileri ver
   - Düzenli olarak izinleri gözden geçir
   - Test kullanıcıları temizle

3. **Email Spam Önleme**:
   - Çok sık email gönderme
   - Resend limits: 100 email/ay (free)
   - İlk emailde link paylaş, tekrar gerekirse gönder

---

**Hazır!** 🚀 Ekip yönetimi artık çok daha güçlü!
