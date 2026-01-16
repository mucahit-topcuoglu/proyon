'use server';

/**
 * Proyon - Project Architect AI Engine
 * Groq Llama 3.3 70B ile otomatik proje yol haritası oluşturma
 * 
 * Bu Server Action, proje raporlarını analiz eder
 * ve detaylı bir roadmap oluşturarak Supabase'e kaydeder.
 */

import Groq from 'groq-sdk';
import { createProject, createNode } from '@/lib/supabase/helpers';
import { DomainType, ProjectStatus, NodeStatus } from '@/types';
import { logRoadmapGenerated } from './activityLogs';

// ============================================================================
// TYPES
// ============================================================================

interface RoadmapStep {
  title: string;
  technical_details: string;
  rationale: string;
  what_to_do: string;           // Ne yapılacak - adım adım talimatlar
  how_to_do: string;            // Nasıl yapılacak - teknik rehber
  deliverables: string;         // Çıktılar - bu adım bitince ne elde edilecek
  resources: string;            // Gerekli kaynaklar - araçlar, kütüphaneler, malzemeler
  tips: string;                 // İpuçları ve dikkat edilecekler
  common_mistakes: string;      // Sık yapılan hatalar
  success_criteria: string;     // Başarı kriterleri - ne zaman tamamlanmış sayılır
  estimated_difficulty: 'kolay' | 'orta' | 'zor' | 'çok zor';
  estimated_duration_minutes: number;
  order: number;
  dependencies?: number[];
}

interface GeminiRoadmapResponse {
  project_title: string;
  project_abstract: string;
  project_overview: string;     // Projenin genel açıklaması
  prerequisites: string;        // Ön koşullar
  domain: 'software' | 'hardware' | 'construction' | 'research';
  total_estimated_duration_days: number;
  steps: RoadmapStep[];
}

interface GenerateRoadmapInput {
  userId: string;
  projectId?: string; // Mevcut proje varsa, ona roadmap ekle
  projectText?: string;
  imageBase64?: string;
  imageMimeType?: string; // 'image/png', 'image/jpeg', etc.
}

interface GenerateRoadmapResponse {
  success: boolean;
  projectId?: string;
  error?: string;
  message?: string;
  nodeCount?: number;
}

// ============================================================================
// MASTER PROMPT - CTO & Academic Mentor Sistemi
// ============================================================================

const SYSTEM_INSTRUCTION = `Sen dünya çapında tanınan bir Chief Technology Officer (CTO), Proje Yönetim Uzmanı ve Eğitimcisin. 20+ yıllık deneyiminle binlerce projeyi başarıya ulaştırdın.

## 🎯 ANA GÖREV:
Kullanıcının verdiği proje açıklamasını veya görselini analiz et ve **HİÇBİR ŞEY BİLMEYEN BİRİ BİLE ANLAYACAK ŞEKİLDE** son derece detaylı, adım adım, profesyonel bir proje yol haritası oluştur.

## 📋 TEMEL PRENSİPLER:

### 1. AÇIKLIK VE ANLAŞILIRLIK
- Her adımı **yeni başlayan biri bile anlayacak** şekilde yaz
- Teknik terimleri kullandığında **parantez içinde açıkla**
- Soyut kavramları somut örneklerle anlat
- "Bu şekilde yapın" yerine "Önce X'i açın, sonra Y butonuna tıklayın" gibi detay ver

### 2. EYLEM ODAKLI YAPILAR
- Her adım için **somut, uygulanabilir talimatlar** ver
- "Ne yapacağını bil" değil "Şu adımları takip et" yaklaşımı
- Check-list formatında madde madde görevler
- Doğrulama noktaları ekle (bunu yaptıysan şunu görmelisin)

### 3. KAPSAMLI DETAY
- Her adım için EN AZ 8-10 alt madde içeren detaylı açıklama
- Kullanılacak araçların, kütüphanelerin, malzemelerin tam listesi
- Potansiyel sorunlar ve çözümleri
- Başarı göstergeleri

## 📊 ANALİZ SÜRECİ:

### Adım 1: Alan Tespiti
Projenin alanını belirle:
- **software**: Web/mobil/masaüstü uygulamalar, API'ler, sistemler
- **hardware**: Elektronik, IoT, robotik, mekanik sistemler  
- **construction**: İnşaat, mimari, mobilya, fiziksel yapılar
- **research**: Bilimsel araştırma, veri analizi, akademik projeler

### Adım 2: Karmaşıklık Analizi
Proje büyüklüğüne göre adım sayısı:
- **Basit projeler**: 10-15 detaylı adım
- **Orta projeler**: 15-22 detaylı adım
- **Karmaşık projeler**: 22-30 detaylı adım

### Adım 3: Ön Koşul Tespiti
Projeye başlamadan önce gerekenleri listele:
- Gerekli bilgi/beceri seviyesi
- Kurulması gereken araçlar
- Temin edilmesi gereken malzemeler
- Öğrenilmesi gereken kavramlar

## 📝 HER ADIM İÇİN DOLDURULACAK ALANLAR:

### title (Başlık)
Açıklayıcı, spesifik başlık. Örnek: "React Projesi Oluşturma ve Temel Konfigürasyon" ✅
Kötü örnek: "Başlangıç" ❌

### technical_details (Teknik Detaylar)
Kullanılacak teknolojilerin, araçların, malzemelerin **tam ve detaylı** listesi:
- Yazılım: Paket adları, versiyonlar, konfigürasyon dosyaları
- Donanım: Parça numaraları, pin bağlantıları, voltaj değerleri
- İnşaat: Malzeme boyutları, markalar, standartlar

### what_to_do (Ne Yapılacak)
**Madde madde, check-list formatında** yapılacak işler:
1. İlk olarak şunu yap...
2. Sonra şunu kontrol et...
3. Ardından şu dosyayı oluştur...
4. Bu komutu çalıştır...
5. Sonucu doğrula...

### how_to_do (Nasıl Yapılacak)
**Adım adım, detaylı talimatlar** - birisi telefondan okurken bile yapabilmeli:
- Hangi programı aç
- Hangi butona tıkla
- Hangi komutu yaz
- Ne görmeni bekle
- Hata alırsan ne yap

### rationale (Neden Bu Adım Gerekli)
Bu adımın projeye katkısı:
- Hangi problemi çözüyor
- Yapılmazsa ne olur
- Projenin neresinde konumlanıyor

### deliverables (Çıktılar)
Bu adım tamamlandığında elde edilecekler:
- Oluşan dosyalar/belgeler
- Çalışır durumda olan özellikler
- Doğrulama kontrolleri

### resources (Gerekli Kaynaklar)
Bu adım için gerekli her şey:
- İndirilecek programlar
- Kurulacak paketler
- Satın alınacak malzemeler
- Okunması gereken dokümantasyon linkleri

### tips (İpuçları)
Deneyimli birinin vereceği tavsiyeler:
- Zaman kazandıran kısayollar
- En iyi pratikler (best practices)
- Performans önerileri

### common_mistakes (Sık Yapılan Hatalar)
Yeni başlayanların düştüğü tuzaklar:
- "Şunu yapmayı unutma"
- "Şu hatayı görürsen sebebi şudur"
- "Şu yanlış anlaşılıyor, doğrusu şu"

### success_criteria (Başarı Kriterleri)
Adımın tamamlandığının kanıtları:
- "Şunu görüyorsan doğru yaptın"
- "Şu test geçiyorsa devam edebilirsin"
- "Şu sonucu alıyorsan bu adım tamam"

## 🔢 JSON ÇIKTI FORMATI:

**MUTLAKA** aşağıdaki formatta, sadece JSON olarak yanıt ver (markdown yok!):

{
  "project_title": "Profesyonel ve Açıklayıcı Proje Başlığı",
  "project_abstract": "2-3 cümlelik proje özeti. Ne yapılacak, hangi teknolojiler kullanılacak, sonuç ne olacak.",
  "project_overview": "Projenin kapsamlı açıklaması. Hedefler, kullanım senaryoları, beklenen faydalar. 4-5 cümle.",
  "prerequisites": "Bu projeye başlamadan önce bilinmesi/yapılması gerekenler. Temel bilgisayar kullanımı, X programının kurulumu, Y kavramının anlaşılması vs.",
  "domain": "software",
  "total_estimated_duration_days": 14,
  "steps": [
    {
      "title": "Geliştirme Ortamının Hazırlanması",
      "technical_details": "Node.js v18+, npm v9+, Visual Studio Code (veya tercih edilen IDE), Git versiyon kontrol sistemi. Windows için: Node.js'i nodejs.org'dan indir. Mac için: brew install node komutu ile kur.",
      "what_to_do": "1. Node.js'in kurulu olduğunu kontrol et (node --version)\\n2. npm'in kurulu olduğunu kontrol et (npm --version)\\n3. VS Code'u kur ve aç\\n4. Terminal'i VS Code içinden aç (Ctrl+\`)\\n5. Proje klasörü oluştur (mkdir proje-adi)\\n6. Klasöre gir (cd proje-adi)",
      "how_to_do": "Adım adım:\\n\\n1. Node.js Kurulumu:\\n   - nodejs.org adresine git\\n   - LTS (Long Term Support) versiyonunu indir\\n   - Kurulum sihirbazını çalıştır, tüm varsayılanları kabul et\\n   - Bilgisayarı yeniden başlat\\n\\n2. Kurulum Doğrulama:\\n   - Komut istemini aç (Windows: cmd veya PowerShell)\\n   - 'node --version' yaz, v18.x.x gibi bir çıktı görmelisin\\n   - 'npm --version' yaz, 9.x.x gibi bir çıktı görmelisin\\n\\n3. VS Code Kurulumu:\\n   - code.visualstudio.com adresine git\\n   - İşletim sistemine uygun versiyonu indir ve kur",
      "rationale": "Modern JavaScript/TypeScript projelerinin temelini oluşturur. Node.js runtime ortamı, npm paket yöneticisi ve VS Code editörü endüstri standardıdır.",
      "deliverables": "- Çalışan Node.js kurulumu\\n- Çalışan npm kurulumu\\n- Yapılandırılmış VS Code editörü\\n- Boş proje klasörü",
      "resources": "- Node.js: https://nodejs.org\\n- VS Code: https://code.visualstudio.com\\n- Git: https://git-scm.com",
      "tips": "- LTS versiyonunu tercih et, daha stabil\\n- VS Code'da ESLint ve Prettier eklentilerini kur\\n- Terminal'i VS Code içinden kullanmak iş akışını hızlandırır",
      "common_mistakes": "- Node.js kurmadan npm kullanmaya çalışmak\\n- Eski Node.js versiyonu kullanmak (v16 altı sorun çıkarabilir)\\n- PATH değişkeninin güncellenmemesi (yeniden başlatma gerekir)",
      "success_criteria": "- Terminal'de 'node --version' komutu versiyon numarası döndürüyorsa\\n- Terminal'de 'npm --version' komutu versiyon numarası döndürüyorsa\\n- VS Code açılıyor ve terminal çalışıyorsa\\nBu adım TAMAMDIR ✓",
      "estimated_difficulty": "kolay",
      "estimated_duration_minutes": 45,
      "order": 1
    }
  ]
}

## 🌟 KALİTE STANDARTLARI:

1. **Her adım kendi başına anlaşılır olmalı** - Önceki adımları okumadan da ne yapılacağı net olmalı
2. **Teknik terimler açıklanmalı** - "API" yazdıysan "(Application Programming Interface - uygulamalar arası iletişim arayüzü)" ekle
3. **Somut örnekler ver** - Soyut kavramlar yerine gerçek kod/komut/malzeme örnekleri
4. **Hata senaryolarını düşün** - "Bu hatayı alırsan şunu yap" bilgisi kritik
5. **Görsel talimatlar** - "Sağ üst köşedeki yeşil butona tıkla" gibi detaylar

## 🚀 ÖRNEK KARŞILAŞTIRMA:

### ❌ KÖTÜ (Yetersiz) Adım:
"Projeyi başlat ve gerekli paketleri kur"

### ✅ İYİ (Detaylı) Adım:
{
  "title": "Next.js Projesi Oluşturma ve Temel Paketlerin Kurulumu",
  "what_to_do": "1. Terminal'i aç\\n2. Proje oluşturmak istediğin klasöre git\\n3. 'npx create-next-app@latest proje-adi' komutunu çalıştır\\n4. Sorulan sorulara şu cevapları ver:\\n   - TypeScript: Yes\\n   - ESLint: Yes\\n   - Tailwind CSS: Yes\\n   - src/ directory: Yes\\n   - App Router: Yes\\n   - Import alias: @/*\\n5. 'cd proje-adi' ile proje klasörüne gir\\n6. 'npm run dev' ile geliştirme sunucusunu başlat\\n7. Tarayıcıda localhost:3000'i aç",
  "success_criteria": "Tarayıcıda localhost:3000 adresinde Next.js karşılama sayfasını görüyorsan, terminalde 'Ready in X ms' mesajını görüyorsan, bu adım TAMAMDIR ✓"
}

## ⚠️ KRİTİK UYARILAR:

1. **TÜM ALANLAR ZORUNLUDUR** - Her step için şu alanları MUTLAKA doldur:
   - title (başlık)
   - technical_details (en az 3 cümle)
   - what_to_do (en az 5 madde, numaralı liste)
   - how_to_do (en az 10 satır, detaylı adımlar)
   - rationale (en az 2 cümle)
   - deliverables (en az 3 madde)
   - resources (en az 2 kaynak)
   - tips (en az 3 ipucu)
   - common_mistakes (en az 3 hata)
   - success_criteria (en az 3 kriter)

2. **BOŞ ALAN BIRAKMA** - Hiçbir alan boş, null veya undefined olamaz!

3. **KISA CEVAP VERME** - Her alan için EN AZ belirtilen miktarda içerik yaz.

Şimdi verilen projeyi analiz et ve PROFESYONEL, DETAYLI, ANLAŞILIR bir yol haritası oluştur!`;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Gemini AI'dan gelen yanıtı parse et
 */
function parseGeminiResponse(text: string): GeminiRoadmapResponse {
  // Markdown code block'larını temizle
  let cleanText = text.trim();
  
  // ```json ... ``` formatını temizle
  cleanText = cleanText.replace(/```json\s*/g, '');
  cleanText = cleanText.replace(/```\s*/g, '');
  
  // Parse JSON
  const parsed = JSON.parse(cleanText);
  
  // Validation
  if (!parsed.project_title || !parsed.domain || !parsed.steps) {
    throw new Error('Geçersiz AI yanıtı: Gerekli alanlar eksik');
  }
  
  if (!Array.isArray(parsed.steps) || parsed.steps.length === 0) {
    throw new Error('Geçersiz AI yanıtı: Steps array boş veya geçersiz');
  }
  
  return parsed as GeminiRoadmapResponse;
}

/**
 * Domain string'ini DomainType enum'a çevir
 */
function mapDomain(domain: string): DomainType {
  const domainMap: Record<string, DomainType> = {
    'software': DomainType.SOFTWARE,
    'hardware': DomainType.HARDWARE,
    'construction': DomainType.CONSTRUCTION,
    'research': DomainType.RESEARCH,
  };
  
  return domainMap[domain.toLowerCase()] || DomainType.SOFTWARE;
}

/**
 * Zorluk seviyesine göre priority hesapla
 */
function calculatePriority(difficulty: string): number {
  const priorityMap: Record<string, number> = {
    'kolay': 0,
    'orta': 1,
    'zor': 2,
    'çok zor': 2,
  };
  
  return priorityMap[difficulty.toLowerCase()] || 0;
}

// ============================================================================
// MAIN SERVER ACTION
// ============================================================================

/**
 * Proje Mimarı AI - Otomatik Roadmap Oluşturma
 * 
 * @param input - Kullanıcı ID'si, proje metni veya görsel
 * @returns Success durumu ve oluşturulan proje ID'si
 */
export async function generateRoadmap(
  input: GenerateRoadmapInput
): Promise<GenerateRoadmapResponse> {
  try {
    // ========================================================================
    // 1. VALIDATION
    // ========================================================================
    
    if (!input.userId) {
      return {
        success: false,
        error: 'Kullanıcı ID\'si gerekli',
      };
    }
    
    if (!input.projectText && !input.imageBase64) {
      return {
        success: false,
        error: 'Proje metni veya görsel gerekli',
      };
    }
    
    // API Key kontrolü
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        error: 'Groq API key yapılandırılmamış',
      };
    }
    
    // ========================================================================
    // 2. GROQ AI INITIALIZATION  
    // ========================================================================
    
    const groq = new Groq({ apiKey });
    
    // ========================================================================
    // 3. PREPARE PROMPT
    // ========================================================================
    
    let prompt: string;
    
    if (input.imageBase64) {
      // Groq doesn't support images yet, use text only
      prompt = `Bir proje görseli analiz edilmek isteniyor ama şu an sadece metin destekleniyor. Lütfen proje açıklamasını metin olarak girin.`;
      return {
        success: false,
        error: 'Görsel analizi şu anda desteklenmiyor. Lütfen proje açıklamasını metin olarak girin.',
      };
    } else {
      // Metin analizi - Token limiti kontrolü
      // Groq free tier: 12,000 tokens/request
      // System instruction: ~2,000 tokens
      // Response buffer: ~3,000 tokens
      // Safe input limit: ~7,000 tokens (~5,250 chars)
      let projectText = input.projectText || '';
      const MAX_INPUT_CHARS = 5000;
      const originalLength = projectText.length;
      
      if (projectText.length > MAX_INPUT_CHARS) {
        projectText = projectText.substring(0, MAX_INPUT_CHARS) + '\n\n[... Metin AI token limiti nedeniyle kısaltıldı]';
        console.warn(`⚠️ Proje açıklaması ${originalLength} karakterden ${MAX_INPUT_CHARS} karaktere kısaltıldı`);
      }
      
      prompt = `${SYSTEM_INSTRUCTION}\n\nProje Açıklaması:\n\n${projectText}\n\nYukarıdaki proje için detaylı roadmap oluştur.`;
    }
    
    // ========================================================================
    // 4. GENERATE ROADMAP WITH AI
    // ========================================================================
    
    console.log('🤖 Groq Llama 3.3 70B ile roadmap oluşturuluyor...');
    
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 16384, // Daha detaylı içerik için artırıldı
    });
    
    const aiText = chatCompletion.choices[0]?.message?.content || '';
    
    console.log('✅ AI yanıtı alındı:', aiText.substring(0, 200) + '...');
    
    // ========================================================================
    // 5. PARSE AI RESPONSE
    // ========================================================================
    
    let roadmapData: GeminiRoadmapResponse;
    
    try {
      roadmapData = parseGeminiResponse(aiText);
    } catch (parseError: any) {
      console.error('❌ JSON parse hatası:', parseError);
      return {
        success: false,
        error: 'AI yanıtı işlenemedi: ' + parseError.message,
      };
    }
    
    console.log('✅ Roadmap parse edildi:', roadmapData.project_title);
    console.log(`📊 ${roadmapData.steps.length} adım oluşturuldu`);
    
    // DEBUG: İlk adımın içeriğini kontrol et
    if (roadmapData.steps.length > 0) {
      const firstStep = roadmapData.steps[0];
      console.log('🔍 DEBUG - İlk adım detayları:');
      console.log('  - title:', firstStep.title);
      console.log('  - what_to_do length:', firstStep.what_to_do?.length || 0);
      console.log('  - how_to_do length:', firstStep.how_to_do?.length || 0);
      console.log('  - rationale length:', firstStep.rationale?.length || 0);
      console.log('  - deliverables length:', firstStep.deliverables?.length || 0);
      console.log('  - resources length:', firstStep.resources?.length || 0);
      console.log('  - tips length:', firstStep.tips?.length || 0);
      console.log('  - common_mistakes length:', firstStep.common_mistakes?.length || 0);
      console.log('  - success_criteria length:', firstStep.success_criteria?.length || 0);
    }
    
    // ========================================================================
    // 6. SAVE TO SUPABASE - PROJECT HANDLING
    // ========================================================================
    
    let projectId: string;
    
    if (input.projectId) {
      // Mevcut projeye roadmap ekle
      projectId = input.projectId;
      console.log('✅ Mevcut projeye roadmap ekleniyor:', projectId);
      
      // Projeyi güncelle (status ve abstract)
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = await createClient();
      
      await supabase
        .from('projects')
        .update({
          abstract_text: roadmapData.project_abstract,
          status: ProjectStatus.PLANNING,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId);
        
    } else {
      // Yeni proje oluştur
      const project = await createProject({
        user_id: input.userId,
        title: roadmapData.project_title,
        abstract_text: roadmapData.project_abstract,
        description: input.projectText || 'Görsel analizi ile oluşturuldu',
        domain_type: mapDomain(roadmapData.domain),
        status: ProjectStatus.PLANNING,
        tags: [
          roadmapData.domain,
          `${roadmapData.total_estimated_duration_days} gün`,
          `${roadmapData.steps.length} adım`,
        ],
        is_public: false,
      });
      
      projectId = project.id;
      console.log('✅ Yeni proje oluşturuldu:', projectId);
    }
    
    // ========================================================================
    // 7. SAVE TO SUPABASE - CREATE ROADMAP NODES
    // ========================================================================
    
    const nodePromises = roadmapData.steps.map(async (step) => {
      // Parent node ID'yi bul (eğer dependency varsa)
      let parentNodeId: string | undefined;
      
      if (step.dependencies && step.dependencies.length > 0) {
        // İlk dependency'yi parent olarak al
        const parentIndex = step.dependencies[0];
        // Not: Bu basit bir yaklaşım, gerçek uygulamada tüm dependency'leri handle etmek gerekebilir
      }
      
      // Helper: Escaped newlines'ı gerçek newlines'a çevir ve temizle
      const formatContent = (content: string | undefined, fallback: string = '') => {
        if (!content) return fallback;
        return content
          .replace(/\\n/g, '\n')  // \\n -> \n
          .replace(/\\t/g, '  ')  // \\t -> 2 space
          .trim();
      };
      
      // Zengin içerikli description oluştur
      const richDescription = `## 📋 Ne Yapılacak
${formatContent(step.what_to_do, step.rationale)}

## 🔧 Nasıl Yapılacak
${formatContent(step.how_to_do, 'Teknik detayları takip edin.')}

## 💡 Neden Bu Adım Gerekli
${formatContent(step.rationale)}

## 📦 Çıktılar (Deliverables)
${formatContent(step.deliverables, 'Bu adım tamamlandığında ilgili özellik hazır olacak.')}

## 🛠️ Gerekli Kaynaklar
${formatContent(step.resources, step.technical_details)}

## 💎 İpuçları
${formatContent(step.tips, 'Dikkatli ve sabırlı olun.')}

## ⚠️ Sık Yapılan Hatalar
${formatContent(step.common_mistakes, 'Adımları atlamayın.')}

## ✅ Başarı Kriterleri
${formatContent(step.success_criteria, 'Tüm alt görevler tamamlandığında bu adım bitmiş sayılır.')}`;

      // DEBUG: İlk node için richDescription'ı logla
      if (step.order === 1) {
        console.log('🔍 DEBUG - İlk node richDescription (ilk 500 karakter):');
        console.log(richDescription.substring(0, 500));
        console.log('...');
        console.log('🔍 DEBUG - richDescription total length:', richDescription.length);
      }

      return createNode({
        project_id: projectId,
        title: step.title,
        description: richDescription,
        technical_requirements: step.technical_details,
        rationale: step.rationale,
        status: NodeStatus.PENDING,
        parent_node_id: parentNodeId,
        order_index: step.order,
        priority: calculatePriority(step.estimated_difficulty),
        estimated_duration: step.estimated_duration_minutes,
      });
    });
    
    const nodes = await Promise.all(nodePromises);
    
    console.log(`✅ ${nodes.length} roadmap node oluşturuldu`);
    
    // ========================================================================
    // 8. LOG ACTIVITY
    // ========================================================================
    
    await logRoadmapGenerated({
      projectId: projectId,
      userId: input.userId,
      categoryName: roadmapData.project_title,
      nodeCount: nodes.length,
    });
    
    console.log('✅ Activity logged');
    
    // ========================================================================
    // 9. SUCCESS RESPONSE
    // ========================================================================
    
    return {
      success: true,
      projectId: projectId,
      nodeCount: nodes.length,
      message: `"${roadmapData.project_title}" projesi için ${nodes.length} adımlık roadmap hazır!`,
    };
    
  } catch (error: any) {
    // ========================================================================
    // ERROR HANDLING
    // ========================================================================
    
    console.error('❌ generateRoadmap hatası:', error);
    
    // Gemini API hataları
    if (error.message?.includes('API key')) {
      return {
        success: false,
        error: 'Gemini API key geçersiz veya eksik',
      };
    }
    
    if (error.message?.includes('quota')) {
      return {
        success: false,
        error: 'Gemini API kotası doldu. Lütfen daha sonra tekrar deneyin.',
      };
    }
    
    if (error.message?.includes('SAFETY')) {
      return {
        success: false,
        error: 'İçerik güvenlik filtrelerini tetikledi. Lütfen farklı bir açıklama deneyin.',
      };
    }
    
    // Supabase hataları
    if (error.message?.includes('auth')) {
      return {
        success: false,
        error: 'Kimlik doğrulama hatası. Lütfen giriş yapın.',
      };
    }
    
    // Genel hata
    return {
      success: false,
      error: 'Roadmap oluşturulurken bir hata oluştu: ' + error.message,
    };
  }
}

// ============================================================================
// EXPORT TYPES FOR CLIENT USAGE
// ============================================================================

export type { GenerateRoadmapInput, GenerateRoadmapResponse };

// ============================================================================
// SINGLE NODE REGENERATION
// ============================================================================

interface GenerateNodeContentResponse {
  success: boolean;
  content?: string;
  error?: string;
}

/**
 * Tek bir roadmap node'unu AI ile yeniden oluştur
 */
export async function generateNodeContent(
  nodeTitle: string,
  projectId: string
): Promise<GenerateNodeContentResponse> {
  try {
    // Groq istemcisini oluştur
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const SINGLE_NODE_PROMPT = `Sen uzman bir proje mentorü ve CTO'sun. Verilen adım başlığını son derece detaylı, adım adım rehbere çevir.

GÖREV: "${nodeTitle}" başlıklı proje adımı için kapsamlı rehber oluştur.

ÇIKTI FORMATI (markdown):
## 📋 Ne Yapılacak
1. Açık ve anlaşılır adımlar
2. Check-list formatında
3. Her madde eylem odaklı

## 🔧 Nasıl Yapılacak
1. Detaylı, adım adım talimatlar
2. Hangi araçları kullan
3. Hangi komutları çalıştır
4. Nelere dikkat et

## 💡 Neden Bu Adım Gerekli
Bu adımın projeye katkısını açıkla

## 📦 Çıktılar (Deliverables)
Bu adım bittiğinde ne elde edilecek

## 🛠️ Gerekli Kaynaklar
- İndirme linkleri
- Kurulacak paketler
- Gerekli araçlar

## 💎 İpuçları
- Best practice'ler
- Zaman kazandıran yöntemler
- Optimizasyon önerileri

## ⚠️ Sık Yapılan Hatalar
- "Şunu yapmayı unutma"
- "Bu hatayı görürsen..."
- Yaygın tuzaklar

## ✅ Başarı Kriterleri
- "Bunu görüyorsan doğru yaptın"
- Doğrulama kontrolleri
- Test yöntemleri

HER BÖLÜMÜ DETAYLI YAZ. Bu kişi hiçbir şey bilmiyor varsay.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: SINGLE_NODE_PROMPT,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 4096,
    });

    const aiContent = chatCompletion.choices[0]?.message?.content || '';
    
    if (!aiContent) {
      throw new Error('AI yanıt üretemedi');
    }

    return {
      success: true,
      content: aiContent,
    };

  } catch (error: any) {
    console.error('❌ generateNodeContent hatası:', error);
    return {
      success: false,
      error: error.message || 'AI içerik oluşturulamadı',
    };
  }
}

/**
 * Bir projedeki TÜM node'ları AI ile zenginleştir
 * Bu fonksiyon eski projeleri yeni detaylı formata güncellemek için kullanılır
 */
export async function enrichAllProjectNodes(projectId: string): Promise<{
  success: boolean;
  updatedCount?: number;
  error?: string;
}> {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    
    // Projedeki tüm node'ları al
    const { data: nodes, error: fetchError } = await supabase
      .from('roadmap_nodes')
      .select('id, title, description')
      .eq('project_id', projectId)
      .order('order_index');
    
    if (fetchError) throw fetchError;
    if (!nodes || nodes.length === 0) {
      return { success: false, error: 'Bu projede node bulunamadı' };
    }
    
    console.log(`🚀 ${nodes.length} node zenginleştiriliyor...`);
    
    let updatedCount = 0;
    
    // Her node için AI ile zengin içerik oluştur
    for (const node of nodes) {
      try {
        // Eğer description zaten zengin ise (## ile başlıyorsa) atla
        if (node.description?.includes('## 📋 Ne Yapılacak')) {
          console.log(`⏭️ Node "${node.title}" zaten zengin, atlanıyor`);
          continue;
        }
        
        const result = await generateNodeContent(node.title, projectId);
        
        if (result.success && result.content) {
          const { error: updateError } = await supabase
            .from('roadmap_nodes')
            .update({ 
              description: result.content,
              updated_at: new Date().toISOString()
            })
            .eq('id', node.id);
          
          if (updateError) {
            console.error(`❌ Node "${node.title}" güncellenemedi:`, updateError);
          } else {
            updatedCount++;
            console.log(`✅ Node "${node.title}" zenginleştirildi`);
          }
        }
        
        // Rate limiting için kısa bekle
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (nodeError) {
        console.error(`❌ Node "${node.title}" hatası:`, nodeError);
      }
    }
    
    return {
      success: true,
      updatedCount,
    };
    
  } catch (error: any) {
    console.error('❌ enrichAllProjectNodes hatası:', error);
    return {
      success: false,
      error: error.message || 'Zenginleştirme başarısız',
    };
  }
}
