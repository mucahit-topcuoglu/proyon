'use server';

/**
 * MULTI-ROADMAP SYSTEM - Server Actions
 * Çoklu kategori destekli roadmap yönetimi
 */

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { logCategoryCreated } from './activityLogs';
import type {
  RoadmapCategory,
  RoadmapCategoryInsert,
  ProjectMemberCategory,
  ProjectMemberCategoryInsert,
  RoadmapCreationMode,
  CategoryInputMode,
} from '@/types';

// ============================================================================
// ROADMAP CATEGORY MANAGEMENT
// ============================================================================

/**
 * Proje için kategorileri al
 */
export async function getProjectCategories(projectId: string): Promise<{
  success: boolean;
  categories?: RoadmapCategory[];
  error?: string;
}> {
  try {
    // Use admin client to bypass RLS for category reading
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { data, error } = await supabaseAdmin
      .from('roadmap_categories')
      .select('*')
      .eq('project_id', projectId)
      .order('order_index', { ascending: true });

    if (error) throw error;

    console.log(`✅ getProjectCategories: ${data?.length || 0} kategori bulundu (projectId: ${projectId})`);

    return {
      success: true,
      categories: data as RoadmapCategory[],
    };
  } catch (error: any) {
    console.error('❌ getProjectCategories hatası:', error);
    return {
      success: false,
      error: error.message || 'Kategoriler yüklenemedi',
    };
  }
}

/**
 * Yeni kategori oluştur
 */
export async function createCategory(category: RoadmapCategoryInsert): Promise<{
  success: boolean;
  category?: RoadmapCategory;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('roadmap_categories')
      .insert(category)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    if (data && category.project_id) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await logCategoryCreated({
          projectId: category.project_id,
          userId: user.id,
          categoryName: category.name,
          categoryId: data.id,
        });
      }
    }

    return {
      success: true,
      category: data as RoadmapCategory,
    };
  } catch (error: any) {
    console.error('❌ createCategory hatası:', error);
    return {
      success: false,
      error: error.message || 'Kategori oluşturulamadı',
    };
  }
}

/**
 * Kategoriyi güncelle
 */
export async function updateCategory(
  categoryId: string,
  updates: Partial<RoadmapCategoryInsert>
): Promise<{
  success: boolean;
  category?: RoadmapCategory;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('roadmap_categories')
      .update(updates)
      .eq('id', categoryId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      category: data as RoadmapCategory,
    };
  } catch (error: any) {
    console.error('❌ updateCategory hatası:', error);
    return {
      success: false,
      error: error.message || 'Kategori güncellenemedi',
    };
  }
}

/**
 * Kategoriyi sil
 */
export async function deleteCategory(categoryId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Önce bu kategoriye ait node'ları kontrol et
    const { data: nodes } = await supabase
      .from('roadmap_nodes')
      .select('id')
      .eq('category_id', categoryId)
      .limit(1);

    if (nodes && nodes.length > 0) {
      return {
        success: false,
        error: 'Bu kategoriye ait roadmap adımları var. Önce onları taşıyın veya silin.',
      };
    }

    const { error } = await supabase
      .from('roadmap_categories')
      .delete()
      .eq('id', categoryId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('❌ deleteCategory hatası:', error);
    return {
      success: false,
      error: error.message || 'Kategori silinemedi',
    };
  }
}

// ============================================================================
// CATEGORY PERMISSIONS
// ============================================================================

/**
 * Kullanıcının kategoriye erişim yetkisini kontrol et
 */
export async function checkCategoryAccess(
  userId: string,
  categoryId: string
): Promise<{
  success: boolean;
  hasAccess: boolean;
  permissions?: {
    can_edit: boolean;
    can_delete: boolean;
    can_manage: boolean;
  };
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Önce proje sahibi mi kontrol et
    const { data: category } = await supabase
      .from('roadmap_categories')
      .select('project_id, projects!inner(user_id)')
      .eq('id', categoryId)
      .single();

    if (category && (category as any).projects?.user_id === userId) {
      // Proje sahibi - tam yetki
      return {
        success: true,
        hasAccess: true,
        permissions: {
          can_edit: true,
          can_delete: true,
          can_manage: true,
        },
      };
    }

    // Team member permission kontrolü
    const { data: permission } = await supabase
      .from('project_member_categories')
      .select('*')
      .eq('user_id', userId)
      .eq('category_id', categoryId)
      .maybeSingle();

    if (!permission) {
      return {
        success: true,
        hasAccess: false,
      };
    }

    return {
      success: true,
      hasAccess: true,
      permissions: {
        can_edit: permission.can_edit,
        can_delete: permission.can_delete,
        can_manage: permission.can_manage,
      },
    };
  } catch (error: any) {
    console.error('❌ checkCategoryAccess hatası:', error);
    return {
      success: false,
      hasAccess: false,
      error: error.message,
    };
  }
}

/**
 * Kullanıcıya kategori erişimi ver
 */
export async function grantCategoryAccess(
  permission: ProjectMemberCategoryInsert
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('project_member_categories')
      .insert(permission);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('❌ grantCategoryAccess hatası:', error);
    return {
      success: false,
      error: error.message || 'Kategori yetkisi verilemedi',
    };
  }
}

/**
 * Kullanıcının tüm kategorilere erişimi ver
 */
export async function grantAllCategoriesAccess(
  projectId: string,
  userId: string,
  canManage: boolean = false
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Tüm kategorileri al
    const { data: categories } = await supabase
      .from('roadmap_categories')
      .select('id')
      .eq('project_id', projectId);

    if (!categories || categories.length === 0) {
      return { success: true }; // Kategori yoksa hata vermeden devam et
    }

    // Her kategoriye erişim ver
    const permissions: ProjectMemberCategoryInsert[] = categories.map((cat) => ({
      project_id: projectId,
      user_id: userId,
      category_id: cat.id,
      can_edit: true,
      can_delete: canManage,
      can_manage: canManage,
    }));

    const { error } = await supabase
      .from('project_member_categories')
      .upsert(permissions, {
        onConflict: 'project_id,user_id,category_id',
      });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('❌ grantAllCategoriesAccess hatası:', error);
    return {
      success: false,
      error: error.message || 'Kategori yetkileri verilemedi',
    };
  }
}

/**
 * Kullanıcının kategori yetkilerini güncelle
 */
export async function updateCategoryPermission(
  projectId: string,
  userId: string,
  categoryId: string,
  permissions: {
    can_edit?: boolean;
    can_delete?: boolean;
    can_manage?: boolean;
  }
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('project_member_categories')
      .update(permissions)
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .eq('category_id', categoryId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('❌ updateCategoryPermission hatası:', error);
    return {
      success: false,
      error: error.message || 'Yetki güncellenemedi',
    };
  }
}

/**
 * Kullanıcının kategori yetkisini kaldır
 */
export async function revokeCategoryAccess(
  projectId: string,
  userId: string,
  categoryId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('project_member_categories')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .eq('category_id', categoryId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('❌ revokeCategoryAccess hatası:', error);
    return {
      success: false,
      error: error.message || 'Yetki kaldırılamadı',
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Proje için default kategoriler oluştur
 */
export async function createDefaultCategories(projectId: string): Promise<{
  success: boolean;
  categories?: RoadmapCategory[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const defaultCategories: RoadmapCategoryInsert[] = [
      {
        project_id: projectId,
        name: 'General',
        description: 'Ana roadmap adımları',
        color: '#3b82f6',
        icon: 'folder',
        order_index: 0,
        ai_generated: false,
      },
    ];

    const { data, error } = await supabase
      .from('roadmap_categories')
      .insert(defaultCategories)
      .select();

    if (error) throw error;

    return {
      success: true,
      categories: data as RoadmapCategory[],
    };
  } catch (error: any) {
    console.error('❌ createDefaultCategories hatası:', error);
    return {
      success: false,
      error: error.message || 'Default kategoriler oluşturulamadı',
    };
  }
}

/**
 * Kullanıcının erişebildiği kategorileri al
 */
export async function getUserCategories(
  userId: string,
  projectId: string
): Promise<{
  success: boolean;
  categories?: Array<RoadmapCategory & { permissions?: ProjectMemberCategory }>;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Önce proje sahibi mi kontrol et
    const { data: project } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .single();

    if (project?.user_id === userId) {
      // Proje sahibi - tüm kategorileri göster
      const { data: categories } = await supabase
        .from('roadmap_categories')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index');

      return {
        success: true,
        categories: categories as RoadmapCategory[],
      };
    }

    // Team member - sadece erişebildiği kategorileri göster
    const { data: permissions } = await supabase
      .from('project_member_categories')
      .select(`
        *,
        roadmap_categories (*)
      `)
      .eq('user_id', userId)
      .eq('project_id', projectId);

    if (!permissions || permissions.length === 0) {
      return {
        success: true,
        categories: [],
      };
    }

    const categories = permissions.map((p: any) => ({
      ...p.roadmap_categories,
      permissions: {
        can_edit: p.can_edit,
        can_delete: p.can_delete,
        can_manage: p.can_manage,
      },
    }));

    return {
      success: true,
      categories,
    };
  } catch (error: any) {
    console.error('❌ getUserCategories hatası:', error);
    return {
      success: false,
      error: error.message || 'Kategoriler yüklenemedi',
    };
  }
}
