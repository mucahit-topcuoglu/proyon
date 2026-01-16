'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { generateRoadmap } from './generateRoadmap';
import { logProjectCreated } from './activityLogs';

// Server-side için service role key kullan
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

interface CreateProjectInput {
  userId: string;
  title: string;
  description: string;
  domainType: 'software' | 'hardware' | 'construction' | 'research';
  tags?: string[];
  abstractText?: string;
  generateAIRoadmap?: boolean; // AI roadmap oluşturulsun mu?
}

export async function createProject(input: CreateProjectInput) {
  try {
    // Validate input
    if (!input.title || input.title.length < 3) {
      return {
        success: false,
        error: 'Proje başlığı en az 3 karakter olmalıdır',
      };
    }

    if (!input.description || input.description.length < 10) {
      return {
        success: false,
        error: 'Proje açıklaması en az 10 karakter olmalıdır',
      };
    }

    // Create project
    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert({
        user_id: input.userId,
        title: input.title,
        description: input.description,
        abstract_text: input.abstractText || input.description.substring(0, 200),
        domain_type: input.domainType,
        tags: input.tags || [],
        status: 'planning',
        is_public: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return {
        success: false,
        error: 'Proje oluşturulurken bir hata oluştu',
      };
    }

    // Log activity
    await logProjectCreated({
      projectId: data.id,
      userId: input.userId,
      projectTitle: data.title,
    });

    // Revalidate the projects list page
    revalidatePath('/dashboard/projects');

    // AI roadmap oluştur (eğer istendiyse)
    if (input.generateAIRoadmap && data.id) {
      console.log('🤖 AI Roadmap oluşturuluyor...');
      
      const roadmapResult = await generateRoadmap({
        userId: input.userId,
        projectId: data.id, // Mevcut projeye ekle
        projectText: input.description,
      });
      
      if (roadmapResult.success) {
        console.log(`✅ ${roadmapResult.nodeCount} adımlık roadmap eklendi`);
      } else {
        console.error('❌ Roadmap oluşturulamadı:', roadmapResult.error);
        // Hata olsa bile projeyi döndür
      }
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      success: false,
      error: 'Beklenmeyen bir hata oluştu',
    };
  }
}
