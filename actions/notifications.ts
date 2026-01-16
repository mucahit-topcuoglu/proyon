'use server';

/**
 * 🔔 Notification System Actions
 * 
 * Kullanıcı bildirimlerini yönetir
 * - Bildirim oluşturma
 * - Bildirimleri getirme
 * - Okundu işaretleme
 * - Silme
 */

import { createClient } from '@supabase/supabase-js';
import type { Notification, NotificationCreate, NotificationType } from '@/types';

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
// CREATE NOTIFICATION
// =============================================

export async function createNotification(input: NotificationCreate) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert(input as any)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      notification: data as Notification,
    };
  } catch (error: any) {
    console.error('Create notification error:', error);
    return {
      success: false,
      error: error.message || 'Bildirim oluşturulamadı',
    };
  }
}

// =============================================
// GET NOTIFICATIONS
// =============================================

export async function getNotifications(userId: string, limit = 50) {
  try {
    const { data, error } = await (supabase
      .from('notifications') as any)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return {
      success: true,
      notifications: (data || []) as Notification[],
    };
  } catch (error: any) {
    console.error('Get notifications error:', error);
    return {
      success: false,
      error: error.message || 'Bildirimler yüklenemedi',
      notifications: [],
    };
  }
}

// =============================================
// GET UNREAD COUNT
// =============================================

export async function getUnreadCount(userId: string) {
  try {
    const { count, error } = await (supabase
      .from('notifications') as any)
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;

    return {
      success: true,
      count: count || 0,
    };
  } catch (error: any) {
    console.error('Get unread count error:', error);
    return {
      success: false,
      count: 0,
    };
  }
}

// =============================================
// MARK AS READ
// =============================================

export async function markAsRead(notificationId: string) {
  try {
    const { error } = await (supabase
      .from('notifications') as any)
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;

    return {
      success: true,
      message: 'Bildirim okundu olarak işaretlendi',
    };
  } catch (error: any) {
    console.error('Mark as read error:', error);
    return {
      success: false,
      error: error.message || 'İşlem başarısız',
    };
  }
}

// =============================================
// MARK ALL AS READ
// =============================================

export async function markAllAsRead(userId: string) {
  try {
    const { error } = await (supabase
      .from('notifications') as any)
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;

    return {
      success: true,
      message: 'Tüm bildirimler okundu olarak işaretlendi',
    };
  } catch (error: any) {
    console.error('Mark all as read error:', error);
    return {
      success: false,
      error: error.message || 'İşlem başarısız',
    };
  }
}

// =============================================
// DELETE NOTIFICATION
// =============================================

export async function deleteNotification(notificationId: string) {
  try {
    const { error } = await (supabase
      .from('notifications') as any)
      .delete()
      .eq('id', notificationId);

    if (error) throw error;

    return {
      success: true,
      message: 'Bildirim silindi',
    };
  } catch (error: any) {
    console.error('Delete notification error:', error);
    return {
      success: false,
      error: error.message || 'Silme başarısız',
    };
  }
}

// =============================================
// HELPER: CREATE INVITATION NOTIFICATION
// =============================================

export async function notifyInvitation(params: {
  recipientUserId: string;
  projectId: string;
  projectTitle: string;
  inviterName: string;
  role: string;
}) {
  return createNotification({
    user_id: params.recipientUserId,
    type: 'invitation_received' as NotificationType,
    title: 'Yeni proje daveti',
    message: `${params.inviterName} sizi "${params.projectTitle}" projesine ${params.role} olarak davet etti`,
    link: `/dashboard/projects/${params.projectId}`,
    metadata: {
      project_id: params.projectId,
      role: params.role,
    },
  });
}
