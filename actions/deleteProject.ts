'use server';

/**
 * 🗑️ Delete Project Action
 * 
 * Permanently deletes a project and all related data:
 * - Project record
 * - Roadmap nodes
 * - Roadmap categories
 * - Comments
 * - Activity logs
 * - Team members
 * - Uploaded files (if any)
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Admin client - RLS bypass için
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

interface DeleteProjectResult {
  success: boolean;
  error?: string;
}

export async function deleteProject(
  projectId: string,
  userId: string
): Promise<DeleteProjectResult> {
  try {
    if (!userId || !projectId) {
      return { success: false, error: 'Geçersiz parametreler' };
    }

    // Check if user owns the project
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('user_id, uploaded_file_url')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return { success: false, error: 'Proje bulunamadı' };
    }

    if (project.user_id !== userId) {
      return { success: false, error: 'Bu projeyi silme yetkiniz yok' };
    }

    // Delete uploaded file from storage if exists
    if (project.uploaded_file_url) {
      try {
        // Extract file path from URL
        const url = new URL(project.uploaded_file_url);
        const pathParts = url.pathname.split('/');
        const fileName = pathParts[pathParts.length - 1];
        const filePath = `project-files/${fileName}`;

        await supabaseAdmin.storage
          .from('project-uploads')
          .remove([filePath]);
      } catch (storageError) {
        console.error('File deletion error:', storageError);
        // Continue with project deletion even if file deletion fails
      }
    }

    // Delete all related data in correct order (respecting foreign keys)
    // 1. Get all roadmap node IDs for this project
    const { data: nodeIds } = await supabaseAdmin
      .from('roadmap_nodes')
      .select('id')
      .eq('project_id', projectId);

    // 2. Delete node comments if there are any nodes
    if (nodeIds && nodeIds.length > 0) {
      const nodeIdArray = nodeIds.map(n => n.id);
      await supabaseAdmin
        .from('node_comments')
        .delete()
        .in('roadmap_node_id', nodeIdArray);
    }

    // 3. Delete roadmap nodes
    const { error: nodesError } = await supabaseAdmin
      .from('roadmap_nodes')
      .delete()
      .eq('project_id', projectId);

    // 4. Delete roadmap categories
    const { error: categoriesError } = await supabaseAdmin
      .from('roadmap_categories')
      .delete()
      .eq('project_id', projectId);

    // 5. Delete activity logs
    const { error: activityError } = await supabaseAdmin
      .from('activity_logs')
      .delete()
      .eq('project_id', projectId);

    // 6. Delete team members
    const { error: membersError } = await supabaseAdmin
      .from('project_members')
      .delete()
      .eq('project_id', projectId);

    // 7. Delete comments
    const { error: projectCommentsError } = await supabaseAdmin
      .from('comments')
      .delete()
      .eq('project_id', projectId);

    // 8. Finally delete the project
    const { error: deleteError } = await supabaseAdmin
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (deleteError) {
      console.error('Project deletion error:', deleteError);
      return { success: false, error: 'Proje silinirken hata oluştu' };
    }

    // Revalidate dashboard page
    revalidatePath('/dashboard');
    
    return { success: true };
  } catch (error) {
    console.error('Delete project error:', error);
    return { 
      success: false, 
      error: 'Beklenmeyen bir hata oluştu' 
    };
  }
}
