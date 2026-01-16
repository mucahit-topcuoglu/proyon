'use server';

/**
 * 💬 Node Comments Actions
 * 
 * Node-level yorumlar ve tartışmalar
 * - Yorum ekleme/düzenleme/silme
 * - Thread desteği (reply)
 * - @mention desteği
 * - Reaction ekleme/çıkarma
 * - Real-time updates
 */

import { supabase } from '@/lib/supabase/client';
import { Comment, CommentCreate, CommentUpdate } from '@/types';
import { logActivity } from './activityLogs';
import { ActivityType } from '@/types';
import { createNotification } from './notifications';
import { NotificationType } from '@/types';

// =============================================
// CREATE COMMENT
// =============================================

/**
 * Create a new comment on a node
 */
export async function createComment(params: CommentCreate) {
  try {
    const { data, error } = await (supabase
      .from('node_comments') as any)
      .insert({
        node_id: params.node_id,
        user_id: params.user_id,
        parent_comment_id: params.parent_comment_id,
        content: params.content,
        mentioned_users: params.mentioned_users || [],
      })
      .select()
      .single();

    if (error) throw error;

    // Get node info for activity log
    const { data: nodeData } = await supabase
      .from('roadmap_nodes')
      .select('title, project_id')
      .eq('id', params.node_id)
      .single() as { data: { title: string; project_id: string } | null };

    if (nodeData) {
      // Log activity
      await logActivity({
        project_id: nodeData.project_id,
        user_id: params.user_id,
        type: ActivityType.COMMENT_ADDED,
        action: `"${nodeData.title}" adımına yorum eklendi`,
        entity_type: 'comment',
        entity_id: data.id,
      });

      // Send notifications to mentioned users
      if (params.mentioned_users && params.mentioned_users.length > 0) {
        const { data: userData } = await supabase.auth.admin.getUserById(params.user_id);
        const userName = userData?.user?.user_metadata?.full_name || 'Kullanıcı';

        for (const mentionedUserId of params.mentioned_users) {
          await createNotification({
            user_id: mentionedUserId,
            type: NotificationType.COMMENT_MENTION,
            title: 'Yorumda Bahsedildiniz',
            message: `${userName} sizi bir yorumda bahsetti: "${nodeData.title}"`,
            link: `/projects/${nodeData.project_id}?node=${params.node_id}`,
            metadata: {
              comment_id: data.id,
              node_id: params.node_id,
              project_id: nodeData.project_id,
            },
          });
        }
      }
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error('Create comment error:', error);
    return {
      success: false,
      error: error.message || 'Yorum eklenemedi',
    };
  }
}

// =============================================
// GET COMMENTS
// =============================================

/**
 * Get all comments for a node
 */
export async function getNodeComments(nodeId: string, limit: number = 50) {
  try {
    // @ts-ignore
    const { data, error } = await supabase.rpc('get_node_comments', {
      p_node_id: nodeId,
      p_limit: limit,
      p_offset: 0,
    });

    if (error) throw error;

    return {
      success: true,
      comments: data as Comment[],
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
 * Get replies for a comment
 */
export async function getCommentReplies(parentCommentId: string, limit: number = 20) {
  try {
    // @ts-ignore
    const { data, error } = await supabase.rpc('get_comment_replies', {
      p_parent_comment_id: parentCommentId,
      p_limit: limit,
    });

    if (error) throw error;

    return {
      success: true,
      replies: data as Comment[],
    };
  } catch (error: any) {
    console.error('Get replies error:', error);
    return {
      success: false,
      error: error.message || 'Yanıtlar yüklenemedi',
      replies: [],
    };
  }
}

// =============================================
// UPDATE COMMENT
// =============================================

/**
 * Update comment content
 */
export async function updateComment(commentId: string, params: CommentUpdate) {
  try {
    const { data, error } = await (supabase
      .from('node_comments') as any)
      .update({
        content: params.content,
        mentioned_users: params.mentioned_users || [],
        edited: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', commentId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error('Update comment error:', error);
    return {
      success: false,
      error: error.message || 'Yorum güncellenemedi',
    };
  }
}

// =============================================
// DELETE COMMENT
// =============================================

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string) {
  try {
    const { error } = await (supabase
      .from('node_comments') as any)
      .delete()
      .eq('id', commentId);

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

// =============================================
// REACTIONS
// =============================================

/**
 * Toggle reaction on a comment
 */
export async function toggleReaction(commentId: string, userId: string, emoji: string) {
  try {
    // @ts-ignore
    const { data, error } = await supabase.rpc('toggle_comment_reaction', {
      p_comment_id: commentId,
      p_user_id: userId,
      p_emoji: emoji,
    });

    if (error) throw error;

    return {
      success: true,
      reactions: data,
    };
  } catch (error: any) {
    console.error('Toggle reaction error:', error);
    return {
      success: false,
      error: error.message || 'Reaction eklenemedi',
    };
  }
}

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Get comment count for a node
 */
export async function getCommentCount(nodeId: string) {
  try {
    const { count, error } = await (supabase
      .from('node_comments') as any)
      .select('*', { count: 'exact', head: true })
      .eq('node_id', nodeId);

    if (error) throw error;

    return {
      success: true,
      count: count || 0,
    };
  } catch (error: any) {
    console.error('Get comment count error:', error);
    return {
      success: false,
      count: 0,
    };
  }
}
