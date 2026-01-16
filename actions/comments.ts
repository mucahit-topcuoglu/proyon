'use server';

/**
 * 💬 Comments Actions
 * 
 * Public proje yorumları
 */

import { createServiceClient } from '@/lib/supabase/server';

/**
 * Get comments for a project
 */
export async function getProjectComments(projectId: string) {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('project_comments')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_approved', true)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      comments: data || [],
    };
  } catch (error: any) {
    console.error('Get comments error:', error);
    return {
      success: false,
      error: error.message || 'Yorumlar yüklenemedi',
      comments: [],
    };
  }
}

/**
 * Add a comment (authenticated user)
 */
export async function addComment(input: {
  projectId: string;
  shareId?: string;
  userId: string;
  content: string;
}) {
  try {
    console.log('Adding comment:', input);
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('project_comments')
      .insert({
        project_id: input.projectId,
        share_id: input.shareId || null,
        user_id: input.userId,
        content: input.content.trim(),
        is_approved: true,
        is_deleted: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    console.log('Comment added successfully:', data);
    return {
      success: true,
      comment: data,
      message: 'Yorum eklendi',
    };
  } catch (error: any) {
    console.error('Add comment error:', error);
    return {
      success: false,
      error: error.message || 'Yorum eklenemedi',
    };
  }
}

/**
 * Add anonymous comment
 */
export async function addAnonymousComment(input: {
  projectId: string;
  shareId?: string;
  authorName: string;
  authorEmail: string;
  content: string;
}) {
  try {
    console.log('Adding anonymous comment:', input);
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('project_comments')
      .insert({
        project_id: input.projectId,
        share_id: input.shareId || null,
        author_name: input.authorName.trim(),
        author_email: input.authorEmail.trim(),
        content: input.content.trim(),
        is_approved: true,
        is_deleted: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    console.log('Anonymous comment added successfully:', data);
    return {
      success: true,
      comment: data,
      message: 'Yorum eklendi',
    };
  } catch (error: any) {
    console.error('Add anonymous comment error:', error);
    return {
      success: false,
      error: error.message || 'Yorum eklenemedi',
    };
  }
}

/**
 * Update comment
 */
export async function updateComment(commentId: string, content: string, userId: string) {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('project_comments')
      .update({ content: content.trim() })
      .eq('id', commentId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      comment: data,
      message: 'Yorum güncellendi',
    };
  } catch (error: any) {
    console.error('Update comment error:', error);
    return {
      success: false,
      error: error.message || 'Yorum güncellenemedi',
    };
  }
}

/**
 * Delete comment
 */
export async function deleteComment(commentId: string, userId: string) {
  try {
    const supabase = createServiceClient();
    const { error } = await supabase
      .from('project_comments')
      .update({ is_deleted: true })
      .eq('id', commentId)
      .eq('user_id', userId);

    if (error) throw error;

    return {
      success: true,
      message: 'Yorum silindi',
    };
  } catch (error: any) {
    console.error('Delete comment error:', error);
    return {
      success: false,
      error: error.message || 'Yorum silinemedi',
    };
  }
}
