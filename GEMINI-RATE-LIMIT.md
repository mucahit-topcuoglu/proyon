# ⚠️ Gemini API - 429 Too Many Requests Hatası

## Sorun
API key çalışıyor ama **429 Too Many Requests** hatası alıyorsunuz.

## Neden?
Google Gemini ücretsiz kotası:
- **15 istek/dakika**
- **1,500 istek/gün**
- **1 milyon token/ay**

Muhtemelen test sırasında çok fazla istek gönderildi.

## Çözümler

### 1. ⏰ Bekleyin (En Kolay)
- 1 dakika bekleyin
- Sonra tekrar deneyin
- Dakikalık limit sıfırlanacak

### 2. 🔄 Yeni API Key Alın
1. [Google AI Studio](https://aistudio.google.com/app/apikey) → API Keys
2. Mevcut key'i silin
3. **"Create API key"** ile yeni key oluşturun
4. `.env.local` dosyasını güncelleyin:
   ```bash
   NEXT_PUBLIC_GEMINI_API_KEY=yeni-api-key-buraya
   ```
5. Sunucuyu yeniden başlatın

### 3. 🎯 Alternatif Model Kullanın
Eğer `gemini-2.0-flash-exp` limit aşıldıysa, `gemini-1.5-flash` deneyin:

**lib/gemini.ts ve actions/generateRoadmap.ts'de:**
```typescript
model: 'gemini-1.5-flash'  // 2.0 yerine 1.5
```

### 4. 💰 Ücretli Plana Geçin
- [Google Cloud Console](https://console.cloud.google.com)
- Faturalandırma etkinleştirin
- Daha yüksek kotalar:
  - 360 istek/dakika
  - Sınırsız günlük istek
  - İlk 1 milyon token ücretsiz

## Şu Anki Durum Kontrolü

Terminalde şunu çalıştırın (1 dakika sonra):

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=AIzaSyA-MWtDGssrt1Hca_SRHgqm_x-A3pL1HU8" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Test"}]}]}'
```

Eğer başarılı olursa, limit sıfırlanmış demektir.

## Uygulama İçinde Rate Limiting Ekleyelim

Proyon'a otomatik retry ve bekleme mekanizması ekleyelim:

**lib/gemini.ts'de:**
```typescript
async function retryWithBackoff(fn: () => Promise<any>, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.message?.includes('429') && i < maxRetries - 1) {
        const waitTime = Math.pow(2, i) * 1000; // Exponential backoff
        console.log(`Rate limit hit, waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        throw error;
      }
    }
  }
}
```

## Test İçin Öneriler
1. Her roadmap oluşturma arasında 5 saniye bekleyin
2. Bir günde maksimum 10-15 roadmap test edin
3. Development sırasında mock data kullanın

## Hata Mesajı Çevirileri
- **429 Too Many Requests** → Çok fazla istek, limitiniz doldu
- **403 Forbidden** → API key geçersiz veya kısıtlanmış
- **400 Bad Request** → İstek formatı hatalı
- **500 Internal Server Error** → Google'ın sorunu

---

**Önerim:** 1 dakika bekleyin, sonra tekrar deneyin. Eğer devam ederse yeni API key alın.
