'use server';

/**
 * 🔍 Visual Troubleshooting Engine
 * 
 * Kullanıcının fiziksel proje fotoğrafını analiz ederek hata tespiti yapar.
 * Gemini 1.5 Flash Vision ile breadboard devreler, maket yapılar, donanım
 * montajları gibi fiziksel implementasyonları inceler.
 * 
 * @example
 * const result = await analyzeIssue({
 *   projectId: 'abc-123',
 *   userQuery: 'LED yanmıyor, sorun ne?',
 *   imageBase64: base64EncodedImage
 * });
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/lib/supabase/client';
import type { Project, RoadmapNode } from '@/types';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface AnalyzeIssueInput {
  /** Proje ID'si (Supabase UUID) */
  projectId: string;
  
  /** Kullanıcının sorduğu soru (örn: "Neden çalışmıyor?") */
  userQuery: string;
  
  /** Fotoğrafın base64 encoded versiyonu (MIME prefix olmadan) */
  imageBase64: string;
  
  /** Görsel MIME tipi (örn: 'image/jpeg', 'image/png') */
  imageMimeType?: string;
}

export interface AnalyzeIssueResponse {
  success: boolean;
  
  /** AI'ın hata analizi ve önerileri */
  analysis?: string;
  
  /** Hata durumunda mesaj */
  error?: string;
}

// ============================================================================
// GEMINI AI CONFIGURATION
// ============================================================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn('⚠️ GEMINI_API_KEY bulunamadı. analyzeIssue fonksiyonu çalışmayacak.');
}

// Gemini 1.5 Flash (Vision) - Görsel analizi için optimize
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const model = genAI?.getGenerativeModel({ 
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.7, // Yaratıcı ama tutarlı
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 2048,
  },
});

// ============================================================================
// SYSTEM PROMPT - VISUAL TROUBLESHOOTING EXPERT
// ============================================================================

const VISUAL_TROUBLESHOOTING_PROMPT = `
Sen deneyimli bir **Teknik Mentor ve Görsel Hata Tespit Uzmanı**sın.

## GÖREV:
Kullanıcının fiziksel proje fotoğrafını analiz et ve hataları tespit et.

## KAPSAM:
- **Electronics**: Breadboard devreleri, Arduino/Raspberry Pi projeleri, kablo bağlantıları
- **Hardware**: Mekanik montajlar, 3D baskılar, robot montajları
- **Construction**: Ahşap/metal işler, maket yapılar, inşaat çerçeveleri
- **Prototyping**: PCB montajları, lehim işleri, prototip devreler

## ANALİZ ADIMLARINI:

1. **Görsel İnceleme**:
   - Fotoğraftaki fiziksel implementasyonu detaylı incele
   - Bileşenleri, bağlantıları, yapıyı tespit et
   - Görsel kaliteyi değerlendir (bulanıksa belirt)

2. **Proje Bağlamı Karşılaştırması**:
   - Kullanıcının ne yapmaya çalıştığını anla (proje özeti)
   - Şu anki adımın gereksinimlerini kontrol et (aktif roadmap node)
   - Beklenen durumla gerçek durum arasındaki farkları bul

3. **Hata Tespiti** (SPESİFİK OL):
   - ❌ "Kablo yanlış bağlanmış" DEĞİL
   - ✅ "Kırmızı kablo Arduino pin 5V'den pin GND'ye taşınmalı" DE
   - ❌ "Montaj hatalı" DEĞİL
   - ✅ "Servo motor kolunun 90° yerine 180° açıda olması gerekiyor" DE
   - Hataları numaralandır ve önceliklendir

4. **Çözüm Önerileri**:
   - Her hata için spesifik çözüm ver
   - Adım adım düzeltme talimatları
   - Varsa alternatif yaklaşımlar öner

5. **Teşvik ve Motivasyon**:
   - Doğru yapılan şeyleri de belirt
   - "Neredeyse tamam, şu küçük detayı düzeltelim" yaklaşımı
   - Cesaretlendirici ama teknik açıdan kesin ol

## ÇIKTI FORMATI:

### 🔍 Görsel Analizi
[Fotoğrafta ne görüyorsun - detaylı açıklama]

### ✅ Doğru Yapılanlar
- [Pozitif gözlemler]

### ❌ Tespit Edilen Hatalar

**Hata 1: [Başlık]**
- **Sorun**: [Detaylı açıklama - spesifik bileşenler/konumlar]
- **Çözüm**: [Adım adım düzeltme]
- **Öncelik**: [Kritik/Orta/Düşük]

**Hata 2: [Başlık]**
...

### 💡 Öneriler
- [Ek tavsiyeler, iyileştirme fikirleri]

### 🎯 Sıradaki Adım
[Kullanıcının şimdi ne yapması gerektiği]

## ÖNEMLI KURALLAR:
- **Türkçe** cevap ver
- **SPESİFİK** ol (bileşen adları, pin numaraları, renk kodları)
- **TEŞVİK EDİCİ** ol (ama hatalardan kaçınma)
- **TEKNİK** terimler kullan (doğru terminoloji)
- Fotoğraf **BULANIKSA** veya **ANLAŞILMAZSA** bunu belirt
- **TAHMİN** yapma - göremediğin şeyleri açıkça söyle
- **GÜVENLİK** uyarıları yap (kısa devre, yanlış voltaj vb.)

## ÖRNEK ANALİZ:

**Kullanıcı Sorusu**: "LED yanmıyor, sorun ne?"

**Senin Analiz**:
### 🔍 Görsel Analizi
Breadboard üzerinde bir Arduino Uno, kırmızı LED, 220Ω direnç ve jumper kablolar görüyorum. LED'in anot bacağı (uzun bacak) Arduino pin 13'e, katot bacağı GND'ye bağlanmış. Direnç ise LED ile seri bağlı değil.

### ✅ Doğru Yapılanlar
- Arduino doğru şekilde breadboard'a yerleştirilmiş
- LED polaritesi doğru (anot pin 13, katot GND)
- Jumper kablolar temiz bağlanmış

### ❌ Tespit Edilen Hatalar

**Hata 1: Akım Sınırlama Direnci Eksik**
- **Sorun**: 220Ω direnç breadboard üzerinde görünüyor ancak LED ile seri bağlantıda değil. LED doğrudan Arduino pin 13'ten besleniyor. Bu LED'i yakabilir veya Arduino çıkışını korumaya alabilir.
- **Çözüm**: 
  1. LED'in anot bacağını pin 13'ten çıkar
  2. 220Ω direncin bir ucunu pin 13'e bağla
  3. Direncin diğer ucunu LED'in anot bacağına bağla
  4. LED'in katot bacağı GND'de kalsın
- **Öncelik**: KRİTİK (donanım hasarı riski)

### 💡 Öneriler
- Direnç değeri 220Ω doğru seçilmiş (standart 5V için)
- İleride daha fazla LED eklemek istersen breadboard'ın sağ tarafında boş alan var

### 🎯 Sıradaki Adım
Direnci devreye ekledikten sonra, Arduino'ya basit bir Blink sketch'i yükle:
\`\`\`cpp
void setup() {
  pinMode(13, OUTPUT);
}
void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}
\`\`\`

Şimdi LED yanıp sönmeye başlamalı! 🚀
`;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Supabase'den proje bilgilerini ve aktif roadmap node'unu getirir
 */
async function getProjectContext(projectId: string) {
  // Proje bilgisini al
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();
    
  if (projectError || !project) {
    throw new Error(`Proje bulunamadı: ${projectError?.message}`);
  }
  
  // Aktif roadmap node'u bul (in_progress durumunda olan ilk node)
  const { data: activeNode, error: nodeError } = await supabase
    .from('roadmap_nodes')
    .select('*')
    .eq('project_id', projectId)
    .eq('status', 'in_progress')
    .order('order_index', { ascending: true })
    .limit(1)
    .single();
    
  // Aktif node yoksa, pending durumundaki ilk node'u al
  let currentNode = activeNode;
  
  if (!currentNode) {
    const { data: pendingNode } = await supabase
      .from('roadmap_nodes')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', 'pending')
      .order('order_index', { ascending: true })
      .limit(1)
      .single();
      
    currentNode = pendingNode;
  }
  
  return {
    project: project as Project,
    currentNode: currentNode as RoadmapNode | null,
  };
}

/**
 * Proje context'ini AI için formatlı string'e çevirir
 */
function formatProjectContext(project: Project, currentNode: RoadmapNode | null): string {
  let context = `## PROJE BİLGİLERİ\n\n`;
  context += `**Proje Adı**: ${project.title}\n`;
  context += `**Alan**: ${project.domain_type}\n`;
  context += `**Açıklama**: ${project.abstract_text}\n\n`;
  
  if (currentNode) {
    context += `## AKTİF ADIM (Kullanıcının Şu An Yapması Gereken)\n\n`;
    context += `**Adım ${currentNode.order_index}**: ${currentNode.title}\n`;
    context += `**Teknik Detaylar**: ${currentNode.technical_requirements || 'Belirtilmemiş'}\n`;
    context += `**Açıklama**: ${currentNode.description || ''}\n`;
    
    if (currentNode.parent_node_id) {
      context += `**Önceki Adım**: ${currentNode.parent_node_id} tamamlanmış olmalı\n`;
    }
  } else {
    context += `## AKTİF ADIM\n\nHenüz aktif adım yok (proje yeni başlamış olabilir).\n`;
  }
  
  return context;
}

// ============================================================================
// MAIN FUNCTION - VISUAL TROUBLESHOOTING
// ============================================================================

export async function analyzeIssue(
  input: AnalyzeIssueInput
): Promise<AnalyzeIssueResponse> {
  console.log('🔍 Visual Troubleshooting başlatılıyor...');
  console.log(`📁 Proje ID: ${input.projectId}`);
  console.log(`❓ Kullanıcı sorusu: ${input.userQuery}`);
  
  try {
    // 1. API key kontrolü
    if (!genAI || !model) {
      return {
        success: false,
        error: 'Gemini API key ayarlanmamış. Lütfen .env.local dosyasına GEMINI_API_KEY ekleyin.',
      };
    }
    
    // 2. Proje context'ini al
    console.log('📊 Proje bilgileri getiriliyor...');
    const { project, currentNode } = await getProjectContext(input.projectId);
    const projectContext = formatProjectContext(project, currentNode);
    
    console.log('✅ Proje context hazır');
    console.log(`📍 Aktif adım: ${currentNode?.title || 'Henüz başlanmamış'}`);
    
    // 3. Multimodal prompt oluştur
    const userPrompt = `
${projectContext}

---

## KULLANICI SORUSU
${input.userQuery}

---

## GÖREV
Yukarıdaki proje bilgilerini ve kullanıcının sorusunu göz önünde bulundurarak,
fotoğraftaki fiziksel implementasyonu analiz et ve hataları tespit et.
`;

    console.log('🤖 Gemini Vision API çağrısı yapılıyor...');
    
    // 4. Gemini Vision API'ye istek at
    const result = await model.generateContent([
      VISUAL_TROUBLESHOOTING_PROMPT,
      userPrompt,
      {
        inlineData: {
          mimeType: input.imageMimeType || 'image/jpeg',
          data: input.imageBase64,
        },
      },
    ]);
    
    const response = result.response;
    const analysis = response.text();
    
    console.log('✅ AI analizi tamamlandı');
    console.log(`📝 Analiz uzunluğu: ${analysis.length} karakter`);
    
    // 5. Yanıtı döndür
    return {
      success: true,
      analysis,
    };
    
  } catch (error: any) {
    console.error('❌ Visual troubleshooting hatası:', error);
    
    // Gemini API hata mesajlarını kullanıcı dostu hale getir
    if (error.message?.includes('API key')) {
      return {
        success: false,
        error: 'Geçersiz Gemini API key. Lütfen .env.local dosyasını kontrol edin.',
      };
    }
    
    if (error.message?.includes('quota')) {
      return {
        success: false,
        error: 'Gemini API günlük kullanım kotası doldu. Lütfen yarın tekrar deneyin.',
      };
    }
    
    if (error.message?.includes('SAFETY')) {
      return {
        success: false,
        error: 'Görsel içeriği güvenlik filtrelerini tetikledi. Lütfen farklı bir fotoğraf deneyin.',
      };
    }
    
    if (error.message?.includes('image')) {
      return {
        success: false,
        error: 'Görsel formatı hatalı. Lütfen JPG, PNG veya WebP formatında fotoğraf yükleyin.',
      };
    }
    
    // Genel hata
    return {
      success: false,
      error: `Hata: ${error.message || 'Bilinmeyen bir hata oluştu'}`,
    };
  }
}

// ============================================================================
// STREAMING VERSION (Optional - Advanced Usage)
// ============================================================================

/**
 * Stream edilebilir versiyonu (gerçek zamanlı analiz için)
 * 
 * @example
 * for await (const chunk of analyzeIssueStream(input)) {
 *   console.log(chunk);
 * }
 */
export async function* analyzeIssueStream(
  input: AnalyzeIssueInput
): AsyncGenerator<string, void, unknown> {
  if (!genAI || !model) {
    yield 'Hata: Gemini API key ayarlanmamış.';
    return;
  }
  
  try {
    const { project, currentNode } = await getProjectContext(input.projectId);
    const projectContext = formatProjectContext(project, currentNode);
    
    const userPrompt = `
${projectContext}

---

## KULLANICI SORUSU
${input.userQuery}

---

## GÖREV
Yukarıdaki proje bilgilerini ve kullanıcının sorusunu göz önünde bulundurarak,
fotoğraftaki fiziksel implementasyonu analiz et ve hataları tespit et.
`;

    const result = await model.generateContentStream([
      VISUAL_TROUBLESHOOTING_PROMPT,
      userPrompt,
      {
        inlineData: {
          mimeType: input.imageMimeType || 'image/jpeg',
          data: input.imageBase64,
        },
      },
    ]);
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      yield chunkText;
    }
    
  } catch (error: any) {
    yield `Hata: ${error.message}`;
  }
}
