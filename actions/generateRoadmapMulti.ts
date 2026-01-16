'use server';

/**
 * MULTI-ROADMAP AI GENERATOR
 * Triple AI Architecture: Free (Gemini) + Premium (DeepSeek)
 */

import { createClient } from '@supabase/supabase-js';
import { createProject, createNode } from '@/lib/supabase/helpers';
import { analyzeWithAI } from '@/lib/ai/ai-service-router';
import { UserTier, AnalysisType } from '@/types/ai';

// Admin client - RLS bypass
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
import { DomainType, ProjectStatus, NodeStatus, RoadmapCreationMode, CategoryInputMode } from '@/types';
import type { RoadmapCategory } from '@/types';
import {
  AI_WITH_MANUAL_CATEGORIES,
  AI_WITH_CATEGORY_COUNT,
  AI_FULL_AUTO_PROMPT,
  CATEGORY_PRESETS,
} from '@/lib/ai/multi-roadmap-prompts';

// ============================================================================
// TYPES
// ============================================================================

interface CategoryInput {
  mode: CategoryInputMode;
  names?: string[]; // MODE 2, 3: Kullanıcı kategori isimlerini verdi
  count?: number; // MODE 4: Sadece sayı verildi
  // MODE 5: Hiçbir şey yok, AI belirler
}

interface GenerateMultiRoadmapInput {
  userId: string;
  projectId?: string; // Mevcut projeye ekle
  projectText: string;
  uploadedFileUrl?: string | null; // Yüklenen dosya URL'i
  uploadedFileName?: string | null; // Dosya adı
  mode: RoadmapCreationMode;
  categoryInput?: CategoryInput;
}

interface GenerateMultiRoadmapResponse {
  success: boolean;
  projectId?: string;
  categoryCount?: number;
  nodeCount?: number;
  categories?: RoadmapCategory[];
  error?: string;
  message?: string;
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

export async function generateMultiRoadmap(
  input: GenerateMultiRoadmapInput
): Promise<GenerateMultiRoadmapResponse> {
  try {
    console.log('🚀 Multi-Roadmap Generator başlatılıyor...');
    console.log('📋 Mod:', input.mode);
    console.log('📂 Kategori Input:', input.categoryInput);

    // Mod kontrolü
    if (input.mode === RoadmapCreationMode.MANUAL) {
      return await handleManualMode(input);
    } else if (input.mode === RoadmapCreationMode.AI_ASSISTED || input.mode === RoadmapCreationMode.AI_AUTO) {
      return await handleAIMode(input);
    } else {
      return {
        success: false,
        error: 'Geçersiz roadmap oluşturma modu',
      };
    }
  } catch (error: any) {
    console.error('❌ generateMultiRoadmap hatası:', error);
    return {
      success: false,
      error: error.message || 'Roadmap oluşturulamadı',
    };
  }
}

// ============================================================================
// MANUAL MODE HANDLER
// ============================================================================

async function handleManualMode(
  input: GenerateMultiRoadmapInput
): Promise<GenerateMultiRoadmapResponse> {
  try {
    let projectId = input.projectId;

    // Proje yoksa oluştur
    if (!projectId) {
      const project = await createProject({
        user_id: input.userId,
        title: 'Yeni Proje',
        description: input.projectText,
        domain_type: DomainType.SOFTWARE,
        status: ProjectStatus.PLANNING,
        tags: [],
        is_public: false,
      });
      projectId = project.id;
    }

    // Kategorileri oluştur
    let categories: RoadmapCategory[] = [];

    if (input.categoryInput?.mode === CategoryInputMode.MANUAL_NAMES && input.categoryInput.names) {
      // Kullanıcı kategori isimlerini verdi
      const categoryInserts = input.categoryInput.names.map((name, index) => {
        const preset = (CATEGORY_PRESETS as any)[name] || { color: '#3b82f6', icon: 'folder' };
        return {
          project_id: projectId!,
          name,
          description: `${name} için roadmap adımları`,
          color: preset.color,
          icon: preset.icon,
          order_index: index,
          ai_generated: false,
        };
      });

      const { data, error } = await supabaseAdmin
        .from('roadmap_categories')
        .insert(categoryInserts)
        .select();

      if (error) {
        console.error('❌ Category insert hatası:', error);
        throw error;
      }
      categories = data as RoadmapCategory[];
    } else {
      // Default "General" kategorisi
      const { data, error } = await supabaseAdmin
        .from('roadmap_categories')
        .insert({
          project_id: projectId,
          name: 'General',
          description: 'Ana roadmap adımları',
          color: '#3b82f6',
          icon: 'folder',
          order_index: 0,
          ai_generated: false,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Default category insert hatası:', error);
        throw error;
      }
      categories = [data as RoadmapCategory];
    }

    return {
      success: true,
      projectId,
      categoryCount: categories.length,
      categories,
      nodeCount: 0,
      message: `Proje oluşturuldu. ${categories.length} kategori hazır. Manuel olarak adım ekleyebilirsiniz.`,
    };
  } catch (error: any) {
    console.error('❌ handleManualMode hatası:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// ============================================================================
// AI MODE HANDLER
// ============================================================================

async function handleAIMode(
  input: GenerateMultiRoadmapInput
): Promise<GenerateMultiRoadmapResponse> {
  try {
    // AI prompt hazırla
    let prompt = '';
    let categoryNames: string[] | undefined;
    let categoryCount: number | undefined;

    if (input.categoryInput?.mode === CategoryInputMode.MANUAL_NAMES) {
      // MODE 3: Kategoriler verildi, AI roadmap oluştur
      categoryNames = input.categoryInput.names;
      prompt = AI_WITH_MANUAL_CATEGORIES.replace('{CATEGORIES}', categoryNames?.join(', ') || '');
    } else if (input.categoryInput?.mode === CategoryInputMode.AI_WITH_COUNT) {
      // MODE 4: Sadece kategori sayısı verildi
      categoryCount = input.categoryInput.count;
      prompt = AI_WITH_CATEGORY_COUNT
        .replace(/{CATEGORY_COUNT}/g, String(categoryCount || 3));
    } else {
      // MODE 5: Tam otomatik
      prompt = AI_FULL_AUTO_PROMPT;
    }

    // Proje açıklamasını ekle (maksimum 1000 karakter)
    const truncatedProject = input.projectText.length > 1000 
      ? input.projectText.substring(0, 1000) + '...'
      : input.projectText;

    prompt += `\n\n## PROJE:\n${truncatedProject}\n\n**KRİTİK KURALLAR:**\n- SADECE JSON döndür\n- Her kategoride 6-10 detaylı adım\n- MAKSIMUM 6 kategori\n- technical_details: 150-250 karakter (çok detaylı)\n- rationale: 60-100 karakter\n- Her adım kurulumdan deployment'a tüm detayları içersin\n\n**ADIM İÇERİĞİ:**\n- Kurulum: Hangi tool'lar, nasıl indirilir, environment setup\n- Geliştirme: Kod dosyaları, config'ler, API entegrasyonları\n- Test: Unit test, integration test, hangi framework\n- Deploy: Build komutu, platform, config detayları`;

    console.log('🤖 AI ile roadmap oluşturuluyor...');
    console.log('📊 Prompt uzunluğu:', prompt.length, 'karakter');

    // Get user tier from database
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('tier')
      .eq('id', input.userId)
      .single();

    const userTier = (profile?.tier as UserTier) || UserTier.FREE;
    console.log('👤 Kullanıcı tier:', userTier);

    try {
      // Use AI router with tier-based model selection
      const aiResponse = await analyzeWithAI({
        prompt,
        analysisType: AnalysisType.ROADMAP,
        userTier,
        maxTokens: 8000,
        temperature: 0.3,
        context: {
          projectName: input.projectText.split('\n')[0] || 'Proje',
          description: input.projectText,
          uploadedFileText: input.uploadedFileUrl ? 'File uploaded' : undefined,
          categories: categoryNames
        }
      });

      let aiMessage = aiResponse.content;

      // DeepSeek-R1 düşünme sürecini kaldır (eski SambaNova response'u için)
      aiMessage = aiMessage.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

      console.log('✅ AI yanıtı alındı:', aiMessage.substring(0, 200) + '...');
      console.log('🔧 Kullanılan model:', aiResponse.model, '(', aiResponse.provider, ')');
      console.log('⏱️ İşlem süresi:', aiResponse.processingTime, 'ms');

      // JSON parse
      const aiData = parseAIResponse(aiMessage);
      console.log('📊 Parse edilen data:', JSON.stringify(aiData, null, 2).substring(0, 500));

      // Supabase'e kaydet
      return await saveMultiRoadmap(
        input.userId, 
        input.projectId, 
        aiData,
        input.uploadedFileUrl,
        input.uploadedFileName
      );
    } catch (aiError: any) {
      console.error('❌ AI hatası:', aiError);
      throw new Error(`AI roadmap oluşturulamadı: ${aiError.message}`);
    }
  } catch (error: any) {
    console.error('❌ handleAIMode hatası:', error);
    return {
      success: false,
      error: error.message || 'AI roadmap oluşturulamadı',
    };
  }
}

// ============================================================================
// AI RESPONSE PARSER
// ============================================================================

function parseAIResponse(aiText: string): any {
  try {
    // 1. Sadece JSON kısmını çıkar - ilk { ile son } arası
    const firstBrace = aiText.indexOf('{');
    const lastBrace = aiText.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
      throw new Error('JSON bulunamadı');
    }

    let jsonText = aiText.substring(firstBrace, lastBrace + 1);
    
    // 2. Kontrol karakterlerini temizle
    jsonText = jsonText
      .replace(/[\n\r\t]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // 3. Trailing comma temizle
    jsonText = jsonText.replace(/,(\s*[}\]])/g, '$1');
    
    // 4. Parse et
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e) {
      // Parse başarısız, parantez dengesini kontrol et
      const openBraces = (jsonText.match(/\{/g) || []).length;
      const closeBraces = (jsonText.match(/\}/g) || []).length;
      
      if (openBraces > closeBraces) {
        jsonText += '}'.repeat(openBraces - closeBraces);
      }
      
      const openBrackets = (jsonText.match(/\[/g) || []).length;
      const closeBrackets = (jsonText.match(/\]/g) || []).length;
      
      if (openBrackets > closeBrackets) {
        jsonText += ']'.repeat(openBrackets - closeBrackets);
      }
      
      // Tekrar dene
      parsed = JSON.parse(jsonText);
    }

    // 5. Validasyon
    if (!parsed.categories || !Array.isArray(parsed.categories)) {
      throw new Error('categories array bulunamadı');
    }
    
    // 6. Her kategorideki adımları logla
    parsed.categories.forEach((cat: any) => {
      console.log(`✅ Kategori: ${cat.name} - ${(cat.steps || []).length} adım`);
    });

    console.log('✅ JSON parse başarılı:', parsed.categories.length, 'kategori');
    return parsed;
    
  } catch (error: any) {
    console.error('❌ JSON parse hatası:', error.message);
    console.error('🔍 AI Yanıtı (ilk 500):', aiText.substring(0, 500));
    console.error('🔍 AI Yanıtı (son 500):', aiText.substring(Math.max(0, aiText.length - 500)));
    throw new Error('AI yanıtı parse edilemedi: ' + error.message);
  }
}

// ============================================================================
// SAVE TO SUPABASE
// ============================================================================

async function saveMultiRoadmap(
  userId: string,
  existingProjectId: string | undefined,
  aiData: any,
  uploadedFileUrl?: string | null,
  uploadedFileName?: string | null
): Promise<GenerateMultiRoadmapResponse> {
  try {
    let projectId = existingProjectId;

    // Proje yoksa oluştur
    if (!projectId) {
      const project = await createProject({
        user_id: userId,
        title: aiData.project_title || 'AI Generated Project',
        abstract_text: aiData.project_abstract,
        description: aiData.project_abstract || '',
        domain_type: mapDomain(aiData.domain),
        status: ProjectStatus.PLANNING,
        tags: [
          aiData.domain,
          `${aiData.total_estimated_duration_days || 30} gün`,
          `${aiData.categories?.length || 0} kategori`,
        ],
        is_public: false,
        uploaded_file_url: uploadedFileUrl,
        uploaded_file_name: uploadedFileName,
      });
      projectId = project.id;
    }

    // Kategorileri oluştur
    const categories: RoadmapCategory[] = [];
    let totalNodeCount = 0;

    console.log('📦 Kaydedilecek kategori sayısı:', aiData.categories?.length);

    for (const categoryData of aiData.categories) {
      console.log('➕ Kategori oluşturuluyor:', categoryData.name);
      
      // Kategori oluştur
      const preset = (CATEGORY_PRESETS as any)[categoryData.name] || { color: '#3b82f6', icon: 'folder' };
      const { data: category, error: catError } = await supabaseAdmin
        .from('roadmap_categories')
        // @ts-ignore - Supabase type issue
        .insert({
          project_id: projectId,
          name: categoryData.name,
          description: categoryData.description || '',
          color: categoryData.color || preset.color,
          icon: categoryData.icon || preset.icon,
          order_index: categoryData.order_index || categories.length,
          ai_generated: true,
        })
        .select()
        .single();

      if (catError) {
        console.error('❌ Kategori oluşturma hatası:', catError);
        continue;
      }

      console.log('✅ Kategori oluşturuldu:', category.name);
      categories.push(category as RoadmapCategory);

      // Bu kategoriye node'ları ekle
      if (categoryData.steps && Array.isArray(categoryData.steps)) {
        for (const step of categoryData.steps) {
          await createNode({
            project_id: projectId,
            category_id: category.id,
            title: step.title,
            description: `${step.rationale || ''}\n\n**Teknik Detaylar:**\n${step.technical_details || ''}`,
            technical_requirements: step.technical_details,
            rationale: step.rationale,
            status: NodeStatus.PENDING,
            order_index: step.order || 0,
            priority: calculatePriority(step.estimated_difficulty),
            estimated_duration: step.estimated_duration_minutes || 120,
          });

          totalNodeCount++;
        }
      }
    }

    console.log(`✅ ${categories.length} kategori ve ${totalNodeCount} node oluşturuldu`);

    // 🌟 OTOMATİK ZENGİNLEŞTİRME - Her proje oluşturulduğunda adımlar otomatik zenginleştiriliyor
    console.log('🎯 Adımlar otomatik zenginleştiriliyor...');
    try {
      const { enrichAllProjectNodes } = await import('./generateRoadmap');
      const enrichResult = await enrichAllProjectNodes(projectId);
      
      if (enrichResult.success) {
        console.log(`✨ ${enrichResult.updatedCount} adım otomatik zenginleştirildi!`);
      } else {
        console.warn('⚠️ Zenginleştirme tamamlanamadı:', enrichResult.error);
      }
    } catch (enrichError) {
      console.error('⚠️ Zenginleştirme hatası (proje yine de oluşturuldu):', enrichError);
    }

    return {
      success: true,
      projectId,
      categoryCount: categories.length,
      nodeCount: totalNodeCount,
      categories,
      message: `"${aiData.project_title}" projesi için ${categories.length} kategoride ${totalNodeCount} zenginleştirilmiş adım hazır!`,
    };
  } catch (error: any) {
    console.error('❌ saveMultiRoadmap hatası:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function mapDomain(domain: string): DomainType {
  const mapping: Record<string, DomainType> = {
    software: DomainType.SOFTWARE,
    hardware: DomainType.HARDWARE,
    construction: DomainType.CONSTRUCTION,
    research: DomainType.RESEARCH,
  };
  return mapping[domain?.toLowerCase()] || DomainType.SOFTWARE;
}

function calculatePriority(difficulty: string): number {
  const priorityMap: Record<string, number> = {
    kolay: 0,
    orta: 1,
    zor: 2,
    'çok zor': 2,
  };
  return priorityMap[difficulty?.toLowerCase()] || 0;
}

// ============================================================================
// EXPORT
// ============================================================================

export type { GenerateMultiRoadmapInput, GenerateMultiRoadmapResponse, CategoryInput };
