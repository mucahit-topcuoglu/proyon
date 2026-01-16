# 🤖 Proyon AI - Project Architect Engine

Google Gemini 1.5 Flash ile otomatik proje yol haritası oluşturma sistemi.

## 🎯 Özellikler

✅ **Metin Analizi** - Proje açıklamalarından roadmap oluşturma
✅ **Görsel Analizi** - El çizimi diyagramları okuma (ev planı, devre şeması)
✅ **Çoklu Alan Desteği** - Software, Hardware, Construction, Research
✅ **Detaylı Adımlar** - Teknik detaylar, araçlar, kütüphaneler
✅ **Akıllı Bağımlılıklar** - Adımlar arası ilişki tespiti
✅ **Otomatik Kayıt** - Supabase'e doğrudan kaydetme
✅ **Ücretsiz** - Gemini 1.5 Flash Free Tier

## 📦 Kurulum

### 1. Gemini AI SDK
```bash
npm install @google/generative-ai
```

### 2. API Key Alma
1. [Google AI Studio](https://makersuite.google.com/app/apikey) adresine git
2. "Create API Key" butonuna tıkla
3. API key'i kopyala

### 3. Environment Variables
```env
# .env.local
GEMINI_API_KEY=your-api-key-here
```

## 🚀 Kullanım

### Metin ile Roadmap Oluşturma

```typescript
'use client';

import { generateRoadmap } from '@/actions/generateRoadmap';
import { useState } from 'react';

export function CreateProjectForm() {
  const [projectText, setProjectText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    
    const result = await generateRoadmap({
      userId: 'user-uuid-here', // auth.uid() kullan
      projectText: projectText,
    });
    
    if (result.success) {
      console.log('✅ Proje oluşturuldu:', result.projectId);
      console.log(`📊 ${result.nodeCount} adım eklendi`);
      alert(result.message);
    } else {
      console.error('❌ Hata:', result.error);
      alert(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <textarea
        value={projectText}
        onChange={(e) => setProjectText(e.target.value)}
        placeholder="Proje açıklamanızı yazın..."
        className="w-full h-48 p-4 rounded-lg"
      />
      
      <button
        onClick={handleGenerate}
        disabled={loading || !projectText}
        className="px-6 py-3 bg-primary text-white rounded-lg"
      >
        {loading ? 'Roadmap Oluşturuluyor...' : 'AI ile Roadmap Oluştur'}
      </button>
    </div>
  );
}
```

### Görsel ile Roadmap Oluşturma

```typescript
'use client';

import { generateRoadmap } from '@/actions/generateRoadmap';
import { useState } from 'react';

export function ImageUploadForm() {
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    
    // Dosyayı base64'e çevir
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const base64Data = base64.split(',')[1]; // Data kısmını al
      
      const result = await generateRoadmap({
        userId: 'user-uuid-here',
        imageBase64: base64Data,
        imageMimeType: file.type,
      });
      
      if (result.success) {
        alert(`✅ ${result.message}`);
      } else {
        alert(`❌ ${result.error}`);
      }
      
      setLoading(false);
    };
    
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        disabled={loading}
      />
      {loading && <p>AI görselinizi analiz ediyor...</p>}
    </div>
  );
}
```

## 📝 Örnek Senaryolar

### 1. Yazılım Projesi

**Girdi:**
```
Modern bir e-ticaret platformu yapmak istiyorum. 
Next.js ve Stripe kullanacağım. 
Kullanıcı girişi, ürün kataloğu ve ödeme sistemi olacak.
```

**AI Çıktısı:**
- ✅ Proje: "Modern E-Ticaret Platformu"
- ✅ Alan: Software
- ✅ 8-12 detaylı adım
- ✅ Teknik stack: Next.js 14, Stripe, NextAuth, Prisma, PostgreSQL
- ✅ Her adım için süre tahmini

### 2. Donanım Projesi

**Girdi:**
```
Arduino ile akıllı ev sistemi. 
Sıcaklık kontrolü, aydınlatma otomasyonu ve kapı kilidi.
```

**AI Çıktısı:**
- ✅ Proje: "Arduino Akıllı Ev Otomasyonu"
- ✅ Alan: Hardware
- ✅ 6-10 adım
- ✅ Parçalar: Arduino Uno, DHT22, Röle modülü, Servo motor
- ✅ Devre şeması önerileri

### 3. İnşaat Projesi (Görsel)

**Girdi:**
- 📸 Ahşap ev planı fotoğrafı (el çizimi)

**AI Çıktısı:**
- ✅ Görseli analiz eder
- ✅ Yapı ölçülerini çıkarır
- ✅ Malzeme listesi oluşturur
- ✅ İnşaat adımlarını sıralar

## 🧠 AI Prompt Stratejisi

### System Instruction Özellikleri:

1. **Rol Tanımı**: "CTO ve Akademik Mentor"
2. **Alan Tespiti**: Otomatik domain belirleme
3. **Görsel Okuma**: El çizimi diyagram analizi
4. **Detaylı Çıktı**: Her adım için:
   - Başlık
   - Teknik detaylar (spesifik araçlar)
   - Gerekçe (neden bu adım?)
   - Zorluk seviyesi
   - Süre tahmini
   - Bağımlılıklar

5. **JSON Format**: Saf JSON çıktısı (markdown yok)

### Örnek AI Yanıtı:

```json
{
  "project_title": "IoT Sıcaklık İzleme Sistemi",
  "project_abstract": "ESP32 tabanlı, MQTT protokolü ile buluta bağlanan gerçek zamanlı sıcaklık izleme sistemi.",
  "domain": "hardware",
  "total_estimated_duration_days": 7,
  "steps": [
    {
      "title": "Donanım Bileşenlerini Temin Et",
      "technical_details": "ESP32-WROOM-32 development board, DHT22 digital temperature-humidity sensor, 0.96 inch OLED display (SSD1306), breadboard, jumper wires, 5V power supply (micro USB)",
      "rationale": "Proje için gerekli tüm donanım bileşenlerini önceden temin etmek, geliştirme sürecini kesintisiz hale getirir.",
      "estimated_difficulty": "kolay",
      "estimated_duration_minutes": 120,
      "order": 1
    },
    {
      "title": "Arduino IDE ve ESP32 Board Manager Kurulumu",
      "technical_details": "Arduino IDE 2.x, ESP32 board support package (Espressif Systems), CH340 USB driver (Windows için)",
      "rationale": "ESP32'yi programlamak için gerekli geliştirme ortamını hazırlar.",
      "estimated_difficulty": "kolay",
      "estimated_duration_minutes": 60,
      "order": 2,
      "dependencies": [1]
    }
  ]
}
```

## ⚡ Performans ve Limitler

### Gemini 1.5 Flash Özellikleri:

- **Ücretsiz Tier**: Günde 1,500 request
- **Context Window**: 1 milyon token
- **Hız**: Çok hızlı (Flash modeli)
- **Görsel Desteği**: Evet (fotoğraf analizi)
- **Çoklu Dil**: Türkçe dahil

### Rate Limiting:

```typescript
// Hata yönetimi örneği
if (error.message?.includes('quota')) {
  return {
    success: false,
    error: 'Gemini API kotası doldu. Lütfen daha sonra tekrar deneyin.',
  };
}
```

## 🔒 Güvenlik

### API Key Güvenliği:

```typescript
// ❌ YANLIŞ - Client-side
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY; // Public!

// ✅ DOĞRU - Server Action
const apiKey = process.env.GEMINI_API_KEY; // Server-only
```

### Content Filtering:

Gemini otomatik olarak zararlı içeriği filtreler:

```typescript
if (error.message?.includes('SAFETY')) {
  return {
    success: false,
    error: 'İçerik güvenlik filtrelerini tetikledi.',
  };
}
```

## 🎯 Best Practices

### 1. Detaylı Girdi Ver

❌ **Kötü:**
```
Bir web sitesi yapmak istiyorum
```

✅ **İyi:**
```
Next.js 14 ile modern bir blog platformu yapmak istiyorum.
Kullanıcı girişi (NextAuth), Markdown desteği, yorum sistemi,
ve admin paneli olacak. Supabase kullanacağım.
```

### 2. Görsel Kalitesi

- ✅ Net fotoğraflar kullan
- ✅ İyi aydınlatma
- ✅ Yazıları okunaklı yap
- ❌ Bulanık/karanlık fotoğraflar

### 3. Hata Yönetimi

```typescript
const result = await generateRoadmap({...});

if (!result.success) {
  // Kullanıcıya friendly mesaj göster
  toast.error(result.error);
  
  // Hataları logla
  console.error('Roadmap generation failed:', result.error);
}
```

## 📊 Response Formatı

```typescript
interface GenerateRoadmapResponse {
  success: boolean;          // İşlem başarılı mı?
  projectId?: string;        // Oluşturulan proje ID'si
  nodeCount?: number;        // Oluşturulan adım sayısı
  message?: string;          // Başarı mesajı
  error?: string;            // Hata mesajı
}
```

## 🐛 Hata Ayıklama

### Console Logları:

```
🤖 Gemini AI ile roadmap oluşturuluyor...
✅ AI yanıtı alındı: {"project_title":"...
✅ Roadmap parse edildi: Modern E-Ticaret Platformu
📊 8 adım oluşturuldu
✅ Proje oluşturuldu: abc-123-def
✅ 8 roadmap node oluşturuldu
```

### Yaygın Hatalar:

| Hata | Çözüm |
|------|-------|
| "API key geçersiz" | .env.local'de GEMINI_API_KEY kontrolü |
| "quota doldu" | 24 saat bekle veya ücretli plana geç |
| "JSON parse hatası" | AI yanıtı temizleme fonksiyonunu kontrol et |
| "auth hatası" | Supabase oturumu kontrol et |

## 🚀 İleri Seviye Kullanım

### Batch Processing

```typescript
// Birden fazla proje için roadmap oluştur
const projects = [
  'E-ticaret platformu',
  'Mobil uygulama',
  'IoT cihazı'
];

for (const project of projects) {
  await generateRoadmap({
    userId,
    projectText: project,
  });
  
  // Rate limiting için bekle
  await new Promise(r => setTimeout(r, 1000));
}
```

### Custom Prompts

Farklı use case'ler için prompt'u özelleştir:

```typescript
// Akademik proje için
const academicPrompt = `
${SYSTEM_INSTRUCTION}

EK: Bu bir akademik projedir. Bilimsel metodoloji ve 
referans kaynaklara özel önem ver.
`;
```

## 📚 Kaynaklar

- [Gemini API Docs](https://ai.google.dev/docs)
- [Google AI Studio](https://makersuite.google.com/)
- [Pricing](https://ai.google.dev/pricing)
- [Safety Settings](https://ai.google.dev/docs/safety_setting_gemini)

## ✅ Checklist

Roadmap oluşturmadan önce kontrol et:

- [ ] Gemini API key ayarlandı
- [ ] Supabase bağlantısı çalışıyor
- [ ] User authentication aktif
- [ ] Detaylı proje açıklaması hazır
- [ ] (Görsel için) Kaliteli fotoğraf çekildi

---

**Hazır!** Artık AI ile otomatik proje yol haritaları oluşturabilirsiniz! 🚀
