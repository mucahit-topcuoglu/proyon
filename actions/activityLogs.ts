'use server';

/**
 * 📜 Activity Logs Actions
 * 
 * Proje aktivitelerini kaydetme ve görüntüleme
 * - Activity log oluşturma
 * - Aktivite geçmişini getirme
 * - Filter ve pagination
 * - İstatistikler
 */

import { createClient } from '@supabase/supabase-js';
import { ActivityType, ActivityLog, ActivityLogCreate, ActivityFilter } from '@/types';

// Admin client for server actions
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// =============================================
// CREATE ACTIVITY LOG
// =============================================

/**
 * Log an activity in the project
 */
export async function logActivity(params: ActivityLogCreate) {
  try {
    const { data, error } = await (supabase
      .from('activity_logs') as any)
      .insert({
        project_id: params.project_id,
        user_id: params.user_id,
        type: params.type,
        action: params.action,
        entity_type: params.entity_type,
        entity_id: params.entity_id,
        metadata: params.metadata || {},
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error('Log activity error:', error);
    return {
      success: false,
      error: error.message || 'Aktivite kaydedilemedi',
    };
  }
}

// =============================================
// GET ACTIVITIES
// =============================================

/**
 * Get project activities with filters and pagination
 */
export async function getProjectActivities(
  projectId: string,
  filters: ActivityFilter = {}
) {
  try {
    const { limit = 50, offset = 0, type, user_id } = filters;

    // Build query - simplified join, only get what we need
    let query = (supabase
      .from('activity_logs') as any)
      .select(`
        id,
        project_id,
        user_id,
        type,
        action,
        entity_type,
        entity_id,
        metadata,
        created_at
      `)
      .eq('project_id', projectId);

    // Apply filters
    if (type) {
      query = query.eq('type', type);
    }
    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    // Order and paginate
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    // Get user names from auth.users via admin client
    const userIds = [...new Set((data || []).map((a: any) => a.user_id).filter(Boolean))];
    const userNames: Record<string, string> = {};
    
    // Fetch user details for all unique user IDs
    for (const userId of userIds) {
      try {
        const { data: userData } = await supabase.auth.admin.getUserById(userId as string);
        if (userData?.user) {
          userNames[userId as string] = userData.user.user_metadata?.full_name || 
                              userData.user.email?.split('@')[0] || 
                              'Kullanıcı';
        }
      } catch (err) {
        console.warn('Could not fetch user:', userId);
        userNames[userId as string] = 'Kullanıcı';
      }
    }

    // Transform to ActivityLog format with user info
    const activities: ActivityLog[] = (data || []).map((activity: any) => ({
      id: activity.id,
      project_id: activity.project_id,
      user_id: activity.user_id,
      user_name: userNames[activity.user_id] || 'Kullanıcı',
      user_email: '', // Not needed for display
      type: activity.type,
      action: activity.action,
      entity_type: activity.entity_type,
      entity_id: activity.entity_id,
      metadata: activity.metadata,
      created_at: activity.created_at,
    }));

    return {
      success: true,
      activities,
      total: count || 0,
    };
  } catch (error: any) {
    console.error('Get activities error:', error);
    return {
      success: false,
      error: error.message || 'Aktiviteler yüklenemedi',
      activities: [],
      total: 0,
    };
  }
}

/**
 * Get activities grouped by date (Today, Yesterday, Last 7 days, etc.)
 */
export async function getGroupedActivities(projectId: string, filters: ActivityFilter = {}) {
  try {
    const result = await getProjectActivities(projectId, filters);
    
    if (!result.success || !result.activities) {
      return result;
    }

    // Group by date
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const grouped: {
      today: ActivityLog[];
      yesterday: ActivityLog[];
      lastWeek: ActivityLog[];
      older: ActivityLog[];
    } = {
      today: [],
      yesterday: [],
      lastWeek: [],
      older: [],
    };

    result.activities.forEach((activity) => {
      const activityDate = new Date(activity.created_at);
      
      if (activityDate >= today) {
        grouped.today.push(activity);
      } else if (activityDate >= yesterday) {
        grouped.yesterday.push(activity);
      } else if (activityDate >= lastWeek) {
        grouped.lastWeek.push(activity);
      } else {
        grouped.older.push(activity);
      }
    });

    return {
      success: true,
      grouped,
      total: result.total,
    };
  } catch (error: any) {
    console.error('Get grouped activities error:', error);
    return {
      success: false,
      error: error.message || 'Aktiviteler yüklenemedi',
    };
  }
}

// =============================================
// GET ACTIVITY STATS
// =============================================

/**
 * Get activity statistics by type
 */
export async function getActivityStats(projectId: string) {
  try {
    // @ts-ignore - Table doesn't exist yet, will be created with SQL migration
    const { data, error } = await supabase.rpc('get_activity_stats', { p_project_id: projectId });

    if (error) throw error;

    return {
      success: true,
      stats: data || [],
    };
  } catch (error: any) {
    console.error('Get activity stats error:', error);
    return {
      success: false,
      error: error.message || 'İstatistikler yüklenemedi',
      stats: [],
    };
  }
}

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Log project creation
 */
export async function logProjectCreated(params: {
  projectId: string;
  userId: string;
  projectTitle: string;
}) {
  return logActivity({
    project_id: params.projectId,
    user_id: params.userId,
    type: ActivityType.PROJECT_CREATED,
    action: `Proje oluşturuldu: ${params.projectTitle}`,
    entity_type: 'project',
    entity_id: params.projectId,
  });
}

/**
 * Log member invitation
 */
export async function logMemberInvited(params: {
  projectId: string;
  userId: string;
  invitedEmail: string;
  role: string;
}) {
  return logActivity({
    project_id: params.projectId,
    user_id: params.userId,
    type: ActivityType.MEMBER_INVITED,
    action: `${params.invitedEmail} davet edildi (${params.role})`,
    entity_type: 'invitation',
    metadata: { email: params.invitedEmail, role: params.role },
  });
}

/**
 * Log member joined
 */
export async function logMemberJoined(params: {
  projectId: string;
  userId: string;
  userName: string;
}) {
  return logActivity({
    project_id: params.projectId,
    user_id: params.userId,
    type: ActivityType.MEMBER_JOINED,
    action: `${params.userName} projeye katıldı`,
    entity_type: 'member',
    entity_id: params.userId,
  });
}

/**
 * Log node completion
 */
export async function logNodeCompleted(params: {
  projectId: string;
  userId: string;
  nodeTitle: string;
  nodeId: string;
}) {
  return logActivity({
    project_id: params.projectId,
    user_id: params.userId,
    type: ActivityType.NODE_COMPLETED,
    action: `"${params.nodeTitle}" tamamlandı`,
    entity_type: 'node',
    entity_id: params.nodeId,
  });
}

/**
 * Log roadmap generation
 */
export async function logRoadmapGenerated(params: {
  projectId: string;
  userId: string;
  categoryName: string;
  nodeCount: number;
}) {
  return logActivity({
    project_id: params.projectId,
    user_id: params.userId,
    type: ActivityType.ROADMAP_GENERATED,
    action: `AI ${params.categoryName} için ${params.nodeCount} adım oluşturdu`,
    entity_type: 'category',
    metadata: { category: params.categoryName, count: params.nodeCount },
  });
}

/**
 * Log category creation
 */
export async function logCategoryCreated(params: {
  projectId: string;
  userId: string;
  categoryName: string;
  categoryId: string;
}) {
  return logActivity({
    project_id: params.projectId,
    user_id: params.userId,
    type: ActivityType.CATEGORY_CREATED,
    action: `"${params.categoryName}" kategorisi eklendi`,
    entity_type: 'category',
    entity_id: params.categoryId,
  });
}
