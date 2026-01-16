# Google Gemini API Kurulumu

Proyon'un yapay zeka özelliklerini kullanabilmek için Google Gemini API anahtarına ihtiyacınız var.

## Adım 1: Google AI Studio'ya Giriş Yapın

1. [Google AI Studio](https://aistudio.google.com/app/apikey) adresine gidin
2. Google hesabınızla giriş yapın

## Adım 2: API Anahtarı Oluşturun

1. "Get API Key" veya "Create API Key" butonuna tıklayın
2. Yeni bir API anahtarı oluşturun
3. Anahtarı kopyalayın (örnek: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)

## Adım 3: .env.local Dosyasını Güncelleyin

1. Projenizin kök dizinindeki `.env.local` dosyasını açın
2. `NEXT_PUBLIC_GEMINI_API_KEY` değişkenini güncelleyin:

```bash
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## Adım 4: Uygulamayı Yeniden Başlatın

```bash
# Ctrl+C ile durdurun
# Sonra tekrar başlatın
npm run dev
```

## ÜCRETSİZ KOTA

Google Gemini API ücretsiz katmanı:
- **60 istek/dakika**
- **1500 istek/gün**
- **1 milyon token/ay**

Bu, günlük kullanım için yeterlidir. Sınırlar hakkında daha fazla bilgi için [Google AI Pricing](https://ai.google.dev/pricing) sayfasını ziyaret edin.

## Hata Durumlarında

### "API key geçersiz" Hatası
- API anahtarınızı doğru kopyaladığınızdan emin olun
- Tırnak işaretleri olmadan yapıştırın
- `.env.local` dosyasını kaydettikten sonra uygulamayı yeniden başlatın

### "Quota aşıldı" Hatası
- Günlük limitinizi aştınız
- Yarın tekrar deneyin veya ücretli plana geçin

### "Safety filters" Hatası
- Proje açıklamanız güvenlik filtrelerini tetiklemiş olabilir
- Daha nötr bir dil kullanarak tekrar deneyin

## Test Etme

Bir proje oluşturun ve "Yol Haritası Oluştur" butonuna basın. 10-30 saniye içinde AI destekli bir roadmap görmelisiniz.

---

**Not:** API anahtarınızı asla GitHub'a yüklemeyin! `.env.local` dosyası `.gitignore` içinde olmalıdır.
