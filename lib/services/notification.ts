// ============================================================================
// NOTIFICATION SERVICE
// In-app notifications stored in Supabase
// ============================================================================

import { supabaseAdmin } from '@/lib/supabase/admin';
import type { PlanType } from '@/lib/constants/pricing';
import { getPlanDisplayName } from '@/lib/constants/pricing';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  actionUrl?: string;
  actionLabel?: string;
}

export async function createNotification(params: CreateNotificationParams): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.from('notifications').insert({
      user_id: params.userId,
      title: params.title,
      message: params.message,
      type: params.type || 'info',
      action_url: params.actionUrl,
      action_label: params.actionLabel,
    });

    if (error) {
      console.error('[NOTIFICATION] Create failed:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('[NOTIFICATION] Create error:', error);
    return false;
  }
}

// ============================================================================
// PRESET NOTIFICATIONS
// ============================================================================

export async function notifyPaymentSuccess(
  userId: string,
  plan: PlanType,
  amount: number,
  currency: 'TRY' | 'USD'
): Promise<boolean> {
  const planName = getPlanDisplayName(plan);
  const formattedAmount = currency === 'TRY' ? `${amount}₺` : `$${amount}`;

  return createNotification({
    userId,
    title: '🎉 Ödeme Başarılı!',
    message: `${planName} planı için ${formattedAmount} ödemeniz alındı. Premium özellikleriniz aktif!`,
    type: 'success',
    actionUrl: '/dashboard',
    actionLabel: 'Dashboard\'a Git',
  });
}

export async function notifyFreePlanActivated(userId: string): Promise<boolean> {
  return createNotification({
    userId,
    title: '✅ Free Plan Aktif',
    message: 'Free planınız başarıyla aktifleştirildi. İstediğiniz zaman yükseltebilirsiniz.',
    type: 'success',
    actionUrl: '/pricing',
    actionLabel: 'Planları Gör',
  });
}

export async function notifySubscriptionCancelled(userId: string, plan: PlanType, endDate: Date): Promise<boolean> {
  const planName = getPlanDisplayName(plan);
  const formattedDate = endDate.toLocaleDateString('tr-TR');

  return createNotification({
    userId,
    title: '⚠️ Abonelik İptal Edildi',
    message: `${planName} aboneliğiniz iptal edildi. ${formattedDate} tarihine kadar erişiminiz devam edecek.`,
    type: 'warning',
    actionUrl: '/pricing',
    actionLabel: 'Tekrar Abone Ol',
  });
}

export async function notifySubscriptionExpiring(userId: string, plan: PlanType, daysLeft: number): Promise<boolean> {
  const planName = getPlanDisplayName(plan);

  return createNotification({
    userId,
    title: '⏰ Abonelik Sona Eriyor',
    message: `${planName} planınızın süresinin dolmasına ${daysLeft} gün kaldı. Yenilemek için tıklayın.`,
    type: 'warning',
    actionUrl: '/pricing',
    actionLabel: 'Yenile',
  });
}

export async function notifyPaymentFailed(userId: string, plan: PlanType): Promise<boolean> {
  const planName = getPlanDisplayName(plan);

  return createNotification({
    userId,
    title: '❌ Ödeme Başarısız',
    message: `${planName} planı için ödeme alınamadı. Lütfen ödeme bilgilerinizi güncelleyin.`,
    type: 'error',
    actionUrl: '/dashboard/settings',
    actionLabel: 'Ödeme Bilgileri',
  });
}

// ============================================================================
// NOTIFICATION QUERIES
// ============================================================================

export async function getUserNotifications(userId: string, limit = 20) {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[NOTIFICATION] Fetch failed:', error);
    return [];
  }

  return data || [];
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  return !error;
}

export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  return !error;
}

export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) return 0;
  return count || 0;
}
