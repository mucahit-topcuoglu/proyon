# 🔍 Visual Troubleshooting Engine

Gemini 1.5 Flash Vision ile fiziksel proje fotoğraflarını analiz ederek hata tespiti yapan AI sistemi.

## 🎯 Ne İçin Kullanılır?

Kullanıcı fiziksel projelerinde (breadboard devreler, ahşap işler, 3D baskılar) **sorun yaşadığında** fotoğraf çekerek AI'ya "Ne yanlış?" diye sorar. AI, proje context'ini bilerek **spesifik hatalar** tespit eder.

### Use Cases:

1. **Electronics**: "Arduino'ma LED bağladım ama yanmıyor"
2. **Hardware**: "Robot kolum hareket etmiyor"
3. **Construction**: "Ahşap birleştirme noktası sağlam değil"
4. **Prototyping**: "Lehim bağlantım soğuk kaynağa benziyor mu?"

## ✨ Özellikler

✅ **Context-Aware**: Proje bilgilerini ve aktif adımı bilir
✅ **Multimodal Vision**: Fotoğraf + Soru analizi
✅ **Spesifik Hatalar**: "Kırmızı kablo pin 5V'den GND'ye taşınmalı" gibi detaylı tespit
✅ **Teşvik Edici**: Doğru yapılanları da övüyor
✅ **Güvenlik Uyarıları**: Tehlikeli durumları belirtiyor (kısa devre vb.)
✅ **Streaming Desteği**: Gerçek zamanlı analiz (opsiyonel)

## 📦 Kurulum

Zaten yüklü! Gemini SDK `generateRoadmap.ts` için kurulmuştu:

```bash
npm install @google/generative-ai  # ✅ Zaten yüklü
```

`.env.local` dosyanızda `GEMINI_API_KEY` olduğundan emin olun.

## 🚀 Kullanım

### 1. Basit Kullanım (Promise)

```typescript
'use client';

import { analyzeIssue } from '@/actions/analyzeIssue';
import { useState } from 'react';

export function TroubleshootForm({ projectId }: { projectId: string }) {
  const [question, setQuestion] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const base64Data = base64.split(',')[1]; // MIME prefix'i kaldır
      setImage(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!image || !question) return;

    setLoading(true);
    const result = await analyzeIssue({
      projectId,
      userQuery: question,
      imageBase64: image,
      imageMimeType: 'image/jpeg',
    });

    if (result.success && result.analysis) {
      setAnalysis(result.analysis);
    } else {
      alert(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
      />

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Sorunuzu yazın (örn: LED yanmıyor, neden?)"
        className="w-full h-24 p-4"
      />

      <button
        onClick={handleAnalyze}
        disabled={loading || !image || !question}
        className="px-6 py-3 bg-primary text-white rounded-lg"
      >
        {loading ? 'Analiz Ediliyor...' : 'Hatayı Bul'}
      </button>

      {analysis && (
        <div className="prose prose-invert">
          <div dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br />') }} />
        </div>
      )}
    </div>
  );
}
```

### 2. İleri Seviye: Streaming (Gerçek Zamanlı)

```typescript
'use client';

import { analyzeIssueStream } from '@/actions/analyzeIssue';
import { useState } from 'react';

export function StreamingTroubleshoot({ projectId }: { projectId: string }) {
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (imageBase64: string, question: string) => {
    setLoading(true);
    setAnalysis('');

    try {
      for await (const chunk of analyzeIssueStream({
        projectId,
        userQuery: question,
        imageBase64,
      })) {
        setAnalysis((prev) => prev + chunk);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Form bileşenleri */}
      
      {loading && <p>AI analiz ediyor...</p>}
      
      <div className="prose prose-invert">
        {analysis}
      </div>
    </div>
  );
}
```

## 📝 Örnek Senaryolar

### Senaryo 1: Arduino LED Sorunu

**Kullanıcı:**
- 📸 Breadboard fotoğrafı yükler
- ❓ Soru: "LED yanmıyor, sorun ne?"

**AI Analizi:**
```markdown
### 🔍 Görsel Analizi
Breadboard üzerinde Arduino Uno, kırmızı LED, 220Ω direnç görüyorum. 
LED'in anot bacağı pin 13'e, katot bacağı GND'ye bağlı. 
Ancak direnç LED ile seri bağlı değil.

### ✅ Doğru Yapılanlar
- Arduino doğru yerleştirilmiş
- LED polaritesi doğru
- Kablo bağlantıları temiz

### ❌ Tespit Edilen Hatalar

**Hata 1: Akım Sınırlama Direnci Eksik**
- **Sorun**: 220Ω direnç breadboard'da var ama LED ile seri değil. 
  LED doğrudan Arduino pin 13'ten besleniyor. Bu LED'i yakabilir!
- **Çözüm**: 
  1. LED'in anot bacağını pin 13'ten çıkar
  2. 220Ω direnci pin 13 ile LED anot bacağı arasına bağla
  3. LED katot bacağı GND'de kalsın
- **Öncelik**: KRİTİK (donanım hasarı riski)

### 💡 Öneriler
- Direnç değeri 220Ω doğru seçilmiş (5V için standart)
- İleride daha fazla LED eklemek için breadboard'ın sağında yer var

### 🎯 Sıradaki Adım
Direnci ekledikten sonra Arduino'ya Blink sketch'i yükle:
```cpp
void setup() {
  pinMode(13, OUTPUT);
}
void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}
```

LED yanıp sönmeye başlamalı! 🚀
```

### Senaryo 2: Ahşap Birleştirme Sorunu

**Kullanıcı:**
- 📸 Vida birleştirmesi fotoğrafı
- ❓ Soru: "Birleştirme sağlam değil, sallanıyor"

**AI Analizi:**
```markdown
### 🔍 Görsel Analizi
Ahşap çerçevede 90° köşe birleştirmesi görüyorum. 
3mm çap vida kullanılmış, ancak vida başları yüzeyin üstünde.

### ✅ Doğru Yapılanlar
- Dik açı korunmuş
- Vida sayısı yeterli (2 adet)

### ❌ Tespit Edilen Hatalar

**Hata 1: Ön Delik Açılmamış**
- **Sorun**: Vidalar ahşabı yarabilir, bu yüzden tam sıkılmamış
- **Çözüm**: 
  1. Vidaları çıkar
  2. 2mm matkap ucu ile ön delik aç
  3. Vidaları tekrar sık (başlar ahşap yüzeyine gömülmeli)
- **Öncelik**: Yüksek

**Hata 2: Tutkal Kullanılmamış**
- **Sorun**: Sadece vida ile birleştirme uzun vadede gevşeyecek
- **Çözüm**: 
  1. Vidaları çıkar
  2. Ahşap tutkalı sür (D3 veya D4 sınıfı)
  3. Birleştir ve mengene ile sıkıştır
  4. 24 saat bekle
  5. Tutkal kuruduktan sonra vidaları tak
- **Öncelik**: Orta

### 💡 Öneriler
- Mengeneleme sırasında koruyucu tahta parçası kullan (iz kalmasın)
- Vida uzunluğu minimum 2x ahşap kalınlığı olmalı

### 🎯 Sıradaki Adım
Tutkal + vida kombinasyonu profesyonel seviye dayanıklılık sağlar!
```

## 🧠 AI Prompt Stratejisi

### System Instruction Özellikleri:

1. **Rol**: Teknik Mentor ve Görsel Hata Tespit Uzmanı
2. **Kapsam**: Electronics, Hardware, Construction, Prototyping
3. **Analiz Adımları**:
   - Görsel inceleme (detaylı)
   - Proje context karşılaştırması
   - Spesifik hata tespiti
   - Çözüm önerileri
   - Teşvik ve motivasyon

4. **Çıktı Formatı**:
   - 🔍 Görsel Analizi
   - ✅ Doğru Yapılanlar
   - ❌ Tespit Edilen Hatalar (SPESİFİK)
   - 💡 Öneriler
   - 🎯 Sıradaki Adım

### Context-Aware Analiz:

AI, sadece fotoğrafa bakmıyor, aynı zamanda:

- ✅ **Proje bilgilerini** biliyor (abstract_text, domain_type)
- ✅ **Aktif adımı** biliyor (hangi roadmap_node'da?)
- ✅ **Kullanıcının ne yapması gerektiğini** biliyor

Bu sayede **"Devre çalışmıyor"** yerine **"Adım 3'te DHT22 sensörünü bağlamalıydın ama görsel resistor gösteriyor"** gibi detaylı analiz yapar.

## ⚡ Performans

### Gemini 1.5 Flash Vision:

- **Hız**: Çok hızlı (3-5 saniye)
- **Görsel Kalitesi**: Orta kaliteli fotoğraflar bile yeterli
- **Context Window**: 1 milyon token (çok uzun prompt'lar desteklenir)
- **Ücretsiz Tier**: Günde 1,500 request

### Best Practices:

1. **Fotoğraf Kalitesi**:
   - ✅ Net, iyi ışıklandırılmış
   - ✅ Yeterli yakınlık (detaylar görünmeli)
   - ❌ Bulanık, karanlık
   - ❌ Çok uzak (bileşenler seçilemiyor)

2. **Soru Kalitesi**:
   - ✅ "LED yanmıyor, sorun ne?"
   - ✅ "Servo motor neden 90° yerine 45°'de duruyor?"
   - ❌ "Çalışmıyor" (çok genel)

3. **Context Kullanımı**:
   - AI'ya proje ID verin (aktif adımı bilsin)
   - Rastgele fotoğraf yerine, ilgili proje fotoğrafı

## 🔒 Güvenlik ve Hata Yönetimi

### API Key Güvenliği:

```typescript
// ✅ DOĞRU - Server Action (server-side)
const apiKey = process.env.GEMINI_API_KEY;
```

### Content Safety:

Gemini otomatik güvenlik filtresi:

- 🚫 Tehlikeli içerik (patlayıcı, silah vb.) reddedilir
- 🚫 Uygunsuz görseller (cinsellik, şiddet) reddedilir

### Error Handling:

```typescript
if (!result.success) {
  // Kullanıcı dostu mesajlar:
  
  // "API key geçersiz" 
  // "Günlük kota doldu"
  // "Görsel formatı hatalı"
  // "İçerik güvenlik filtrelerini tetikledi"
}
```

## 🎨 UI Önerileri

### Fotoğraf Upload:

```tsx
<div className="glass rounded-lg p-6">
  <input
    type="file"
    accept="image/*"
    capture="environment" // Mobilde kamerayı açar
    className="hidden"
    id="photo-upload"
  />
  <label htmlFor="photo-upload" className="cursor-pointer">
    📸 Fotoğraf Çek / Yükle
  </label>
</div>
```

### Analiz Sonucu (Markdown):

```tsx
import Markdown from 'react-markdown';

<Markdown className="prose prose-invert prose-sm">
  {analysis}
</Markdown>
```

### Loading State:

```tsx
{loading && (
  <div className="flex items-center gap-2">
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
    <span>AI fotoğrafınızı analiz ediyor...</span>
  </div>
)}
```

## 🐛 Hata Ayıklama

### Console Logları:

```
🔍 Visual Troubleshooting başlatılıyor...
📁 Proje ID: abc-123-def
❓ Kullanıcı sorusu: LED yanmıyor, sorun ne?
📊 Proje bilgileri getiriliyor...
✅ Proje context hazır
📍 Aktif adım: Arduino Bağlantılarını Yap
🤖 Gemini Vision API çağrısı yapılıyor...
✅ AI analizi tamamlandı
📝 Analiz uzunluğu: 1247 karakter
```

### Yaygın Hatalar:

| Hata | Çözüm |
|------|-------|
| "API key geçersiz" | .env.local'de GEMINI_API_KEY kontrol et |
| "Proje bulunamadı" | projectId doğru mu? Supabase'de var mı? |
| "Görsel formatı hatalı" | Base64 doğru encode edilmiş mi? MIME prefix kaldırıldı mı? |
| "quota doldu" | 24 saat bekle veya ücretli plana geç |

## 🚀 İleri Seviye Özellikler

### 1. Karşılaştırmalı Analiz

Kullanıcı **ÖNCESİ** ve **SONRASI** fotoğrafları yükler:

```typescript
const beforeResult = await analyzeIssue({
  projectId,
  userQuery: 'İlk deneme, çalışmıyor',
  imageBase64: beforeImage,
});

// Kullanıcı düzeltme yapar

const afterResult = await analyzeIssue({
  projectId,
  userQuery: 'Düzelttim, şimdi nasıl?',
  imageBase64: afterImage,
});

// AI: "Harika! Direnci eklemişsin. Artık güvenli. Şimdi kodu yükle!"
```

### 2. Multi-Image Analiz

Birden fazla açıdan fotoğraf:

```typescript
// Gelecek versiyonda:
// images: [topView, sideView, closeUp]
```

### 3. Video Analiz

Kısa video clip'leri (örn: servo motor hareket ediyor ama titriyor):

```typescript
// Gemini 1.5 Flash video da destekler
// Gelecek özellik
```

## 📊 Response Formatı

```typescript
interface AnalyzeIssueResponse {
  success: boolean;
  analysis?: string;  // Markdown formatında detaylı analiz
  error?: string;     // Hata durumunda mesaj
}
```

### Örnek Success Response:

```json
{
  "success": true,
  "analysis": "### 🔍 Görsel Analizi\n\nBreadboard üzerinde Arduino Uno...\n\n### ✅ Doğru Yapılanlar\n- LED polaritesi doğru\n\n### ❌ Tespit Edilen Hatalar\n\n**Hata 1: Direnç Eksik**..."
}
```

### Örnek Error Response:

```json
{
  "success": false,
  "error": "Gemini API günlük kullanım kotası doldu. Lütfen yarın tekrar deneyin."
}
```

## ✅ Checklist

Visual Troubleshooting kullanmadan önce:

- [ ] Gemini API key ayarlandı (.env.local)
- [ ] Supabase bağlantısı çalışıyor
- [ ] Proje oluşturulmuş (projectId var)
- [ ] Roadmap oluşturulmuş (en az 1 node var)
- [ ] Kaliteli fotoğraf çekildi (net, iyi ışık)
- [ ] Spesifik soru hazırlandı

## 🎯 Kullanım Senaryoları

### Ne Zaman Kullanılır?

✅ **İDEAL:**
- Kullanıcı fiziksel implementasyonda takıldı
- "Çalışmıyor" ama neden bilmiyor
- Görsel inspeksiyon gerekli (kablolama, montaj)

❌ **UYGUN DEĞİL:**
- Kod hataları (bunun için Code Review AI kullan)
- Soyut sorular ("Hangi framework kullanmalıyım?")
- Tasarım tavsiyeleri

### Workflow:

1. Kullanıcı roadmap'te **Adım 5: Arduino Bağlantılarını Yap** kısmında
2. Breadboard'unu kurdu ama **LED yanmıyor**
3. 📸 Fotoğraf çeker
4. ❓ "LED yanmıyor, sorun ne?" diye sorar
5. 🤖 AI analiz eder:
   - Proje context'ini bilir (Arduino projesi, şu anda bağlantı aşaması)
   - Fotoğrafı inceler (direnç eksik!)
   - Spesifik çözüm verir
6. ✅ Kullanıcı hatayı düzeltir
7. 🎯 Sıradaki adıma geçer

## 📚 Kaynaklar

- [Gemini Vision API Docs](https://ai.google.dev/docs/vision)
- [Multimodal Prompting Guide](https://ai.google.dev/docs/multimodal_concepts)
- [Google AI Studio](https://makersuite.google.com/)
- [Safety Settings](https://ai.google.dev/docs/safety_setting_gemini)

---

**Hazır!** Artık kullanıcılar fiziksel projelerinde AI desteği alabilir! 🔍🤖
