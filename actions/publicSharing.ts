'use server';

/**
 * 🌐 Public Sharing Actions
 * 
 * Projeleri herkese açık paylaşma
 * - Public link oluşturma
 * - Paylaşım ayarları
 * - Görüntülenme istatistikleri
 */

import { createServiceClient } from '@/lib/supabase/server';
import crypto from 'crypto';

// Admin client for RLS bypass
const supabase = createServiceClient();

/**
 * Get existing public share for a project
 */
export async function getProjectShare(projectId: string) {
  try {
    const { data, error } = await supabase
      .from('public_shares')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found

    return {
      success: true,
      share: data,
    };
  } catch (error: any) {
    console.error('Get project share error:', error);
    return {
      success: false,
      error: error.message || 'Paylaşım bilgisi alınamadı',
      share: null,
    };
  }
}

/**
 * Create or get public share link for project
 */
export async function createPublicShare(input: {
  projectId: string;
  userId: string;
  description?: string;
  teamMembers?: string;
  projectImages?: string[];
  contactInfo?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    phone?: string;
    email?: string;
  };
  showContact?: boolean;
  allowComments?: boolean;
  showTimeline?: boolean;
  showStats?: boolean;
}) {
  try {
    // Check if share already exists
    const { data: existing }: { data: any } = await supabase
      .from('public_shares')
      .select('*')
      .eq('project_id', input.projectId)
      .single();

    if (existing) {
      // Update existing share
      const { data, error } = await supabase
        .from('public_shares')
        // @ts-ignore - Supabase type issue
        .update({
          is_active: true,
          description: input.description ?? existing.description,
          team_members: input.teamMembers ?? existing.team_members,
          project_images: input.projectImages ?? existing.project_images,
          contact_info: input.contactInfo ?? existing.contact_info,
          show_contact: input.showContact ?? existing.show_contact,
          allow_comments: input.allowComments ?? existing.allow_comments,
          show_timeline: input.showTimeline ?? existing.show_timeline,
          show_stats: input.showStats ?? existing.show_stats,
          created_by: input.userId,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Public share updated:', data);

      return {
        success: true,
        data,
        shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/share/${(data as any).share_token}`,
      };
    }

    // Create new share
    const shareToken = crypto.randomBytes(16).toString('hex');

    const { data, error }: { data: any; error: any } = await supabase
      .from('public_shares')
      // @ts-ignore - Supabase type issue
      .insert({
        project_id: input.projectId,
        created_by: input.userId,
        share_token: shareToken,
        is_active: true,
        description: input.description || '',
        team_members: input.teamMembers || '',
        project_images: input.projectImages || [],
        contact_info: input.contactInfo || {},
        show_contact: input.showContact ?? false,
        allow_comments: input.allowComments ?? false,
        show_timeline: input.showTimeline ?? true,
        show_stats: input.showStats ?? true,
      })
      .select()
      .single();

    if (error) throw error;

    console.log('✅ New public share created:', data);

    // Also mark project as public
    await supabase
      .from('projects')
      // @ts-ignore - Supabase type issue
      .update({ is_public: true })
      .eq('id', input.projectId);

    return {
      success: true,
      data,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/share/${shareToken}`,
    };
  } catch (error: any) {
    console.error('Create share error:', error);
    return {
      success: false,
      error: error.message || 'Paylaşım oluşturulamadı',
    };
  }
}

/**
 * Get public share by token
 */
export async function getPublicShare(token: string) {
  try {
    const { data, error } = await supabase
      .from('public_shares')
      .select('*')
      .eq('share_token', token)
      .eq('is_active', true)
      .single();

    if (error) throw error;

    if (!data) {
      return {
        success: false,
        error: 'Paylaşım bulunamadı veya devre dışı',
      };
    }

    // Get project details separately
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, title, abstract_text, description, domain_type, tags, status, created_at, user_id')
      .eq('id', data.project_id)
      .single();

    if (projectError) {
      console.error('Get project error:', projectError);
    }

    return {
      success: true,
      data: {
        ...data,
        project: project || null,
      },
    };
  } catch (error: any) {
    console.error('Get share error:', error);
    return {
      success: false,
      error: error.message || 'Paylaşım yüklenemedi',
    };
  }
}

/**
 * Get public roadmap nodes
 */
export async function getPublicRoadmapNodes(projectId: string) {
  try {
    const { data, error } = await supabase
      .from('roadmap_nodes')
      .select('*')
      .eq('project_id', projectId)
      .order('order_index', { ascending: true });

    if (error) throw error;

    return {
      success: true,
      nodes: data || [],
    };
  } catch (error: any) {
    console.error('Get public nodes error:', error);
    return {
      success: false,
      error: error.message || 'Yol haritası yüklenemedi',
    };
  }
}

/**
 * Record public share view
 */
export async function recordShareView(input: {
  shareId: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
}) {
  try {
    // Insert view record
    await supabase
      .from('public_share_views')
      // @ts-ignore - Supabase type issue
      .insert({
        share_id: input.shareId,
        ip_address: input.ipAddress,
        user_agent: input.userAgent,
        referrer: input.referrer,
      });

    // Update view count and last viewed
    // @ts-ignore - Supabase RPC type issue
    await supabase.rpc('increment_share_views', {
      share_id: input.shareId
    });

    return { success: true };
  } catch (error: any) {
    console.error('Record view error:', error);
    return { success: false };
  }
}

/**
 * Update public share settings
 */
export async function updateShareSettings(input: {
  shareId: string;
  description?: string;
  teamMembers?: string;
  projectImages?: string[];
  contactInfo?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    phone?: string;
    email?: string;
  };
  showContact?: boolean;
  allowComments?: boolean;
  showTimeline?: boolean;
  showStats?: boolean;
  isActive?: boolean;
}) {
  try {
    const updates: any = {};
    if (input.description !== undefined) updates.description = input.description;
    if (input.teamMembers !== undefined) updates.team_members = input.teamMembers;
    if (input.projectImages !== undefined) updates.project_images = input.projectImages;
    if (input.contactInfo !== undefined) updates.contact_info = input.contactInfo;
    if (input.showContact !== undefined) updates.show_contact = input.showContact;
    if (input.allowComments !== undefined) updates.allow_comments = input.allowComments;
    if (input.showTimeline !== undefined) updates.show_timeline = input.showTimeline;
    if (input.showStats !== undefined) updates.show_stats = input.showStats;
    if (input.isActive !== undefined) updates.is_active = input.isActive;

    const { data, error } = await supabase
      .from('public_shares')
      // @ts-ignore - Supabase type issue
      .update(updates)
      .eq('id', input.shareId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: 'Ayarlar güncellendi',
    };
  } catch (error: any) {
    console.error('Update share settings error:', error);
    return {
      success: false,
      error: error.message || 'Ayarlar güncellenemedi',
    };
  }
}

/**
 * Disable/delete public share
 */
export async function disablePublicShare(projectId: string) {
  try {
    // Deactivate share
    await supabase
      .from('public_shares')
      // @ts-ignore - Supabase type issue
      .update({ is_active: false })
      .eq('project_id', projectId);

    // Mark project as private
    await supabase
      .from('projects')
      // @ts-ignore - Supabase type issue
      .update({ is_public: false })
      .eq('id', projectId);

    return {
      success: true,
      message: 'Paylaşım devre dışı bırakıldı',
    };
  } catch (error: any) {
    console.error('Disable share error:', error);
    return {
      success: false,
      error: error.message || 'Paylaşım kapatılamadı',
    };
  }
}

/**
 * Get share analytics
 */
export async function getShareAnalytics(shareId: string) {
  try {
    const { data: share, error: shareError }: { data: any; error: any } = await supabase
      .from('public_shares')
      .select('view_count, last_viewed_at, created_at')
      .eq('id', shareId)
      .single();

    if (shareError) throw shareError;

    const { data: views, error: viewsError } = await supabase
      .from('public_share_views')
      .select('viewed_at, referrer')
      .eq('share_id', shareId)
      .order('viewed_at', { ascending: false })
      .limit(100);

    if (viewsError) throw viewsError;

    // Calculate daily views for last 7 days
    const dailyViews = views?.reduce((acc: any, view: any) => {
      const date = new Date(view.viewed_at).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return {
      success: true,
      analytics: {
        totalViews: share?.view_count || 0,
        lastViewed: share?.last_viewed_at,
        createdAt: share?.created_at,
        dailyViews,
        recentViews: views?.slice(0, 10) || [],
      },
    };
  } catch (error: any) {
    console.error('Get analytics error:', error);
    return {
      success: false,
      error: error.message || 'İstatistikler yüklenemedi',
    };
  }
}

/**
 * Toggle like on a public share
 */
export async function toggleLike(shareId: string) {
  try {
    // Get or create anonymous user ID from cookie/localStorage
    const userId = typeof window !== 'undefined' 
      ? localStorage.getItem('anonymous_user_id') || crypto.randomBytes(16).toString('hex')
      : crypto.randomBytes(16).toString('hex');
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('anonymous_user_id', userId);
    }

    // Check if already liked
    const { data: existing } = await supabase
      .from('public_share_likes')
      .select('*')
      .eq('share_id', shareId)
      .eq('user_identifier', userId)
      .single();

    if (existing) {
      // Unlike
      await supabase
        .from('public_share_likes')
        .delete()
        .eq('id', existing.id);

      // Decrement like count
      const { data: share } = await supabase
        .from('public_shares')
        .select('likes_count')
        .eq('id', shareId)
        .single();

      const newCount = Math.max(0, (share?.likes_count || 0) - 1);
      
      await supabase
        .from('public_shares')
        .update({ likes_count: newCount })
        .eq('id', shareId);

      return {
        success: true,
        isLiked: false,
        likesCount: newCount,
      };
    } else {
      // Like
      await supabase
        .from('public_share_likes')
        .insert({
          share_id: shareId,
          user_identifier: userId,
        });

      // Increment like count
      const { data: share } = await supabase
        .from('public_shares')
        .select('likes_count')
        .eq('id', shareId)
        .single();

      const newCount = (share?.likes_count || 0) + 1;
      
      await supabase
        .from('public_shares')
        .update({ likes_count: newCount })
        .eq('id', shareId);

      return {
        success: true,
        isLiked: true,
        likesCount: newCount,
      };
    }
  } catch (error: any) {
    console.error('Toggle like error:', error);
    return {
      success: false,
      error: error.message || 'Beğeni işlemi başarısız',
    };
  }
}

/**
 * Get like status for current user
 */
export async function getLikeStatus(shareId: string) {
  try {
    if (typeof window === 'undefined') {
      return { success: true, isLiked: false };
    }

    const userId = localStorage.getItem('anonymous_user_id');
    if (!userId) {
      return { success: true, isLiked: false };
    }

    const { data } = await supabase
      .from('public_share_likes')
      .select('*')
      .eq('share_id', shareId)
      .eq('user_identifier', userId)
      .single();

    return {
      success: true,
      isLiked: !!data,
    };
  } catch (error: any) {
    return {
      success: true,
      isLiked: false,
    };
  }
}

