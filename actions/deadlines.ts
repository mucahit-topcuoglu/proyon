'use server';

/**
 * ⏰ Deadline Actions
 * 
 * Node deadline yönetimi
 * - Deadline ekleme/güncelleme/silme
 * - Upcoming/overdue deadline'ları getirme
 * - Reminder oluşturma
 * - Deadline status hesaplama
 */

import { supabase } from '@/lib/supabase/client';
import { DeadlineNode, DeadlineStatus } from '@/types';
import { logActivity } from './activityLogs';
import { ActivityType } from '@/types';
import { createNotification } from './notifications';
import { NotificationType } from '@/types';

// =============================================
// SET DEADLINE
// =============================================

/**
 * Set or update deadline for a node
 */
export async function setNodeDeadline(
  nodeId: string,
  deadline: string | null,
  userId: string
) {
  try {
    // Update node deadline
    // @ts-ignore - deadline column will be added with SQL migration
    const { data, error } = await supabase
      .from('roadmap_nodes')
      // @ts-ignore
      .update({ deadline })
      .eq('id', nodeId)
      .select('*, projects(id, title)')
      .single();

    if (error) throw error;

    // Get node info
    const nodeData = data as any;

    if (deadline) {
      // Create reminders
      // @ts-ignore
      await supabase.rpc('create_deadline_reminders', {
        p_node_id: nodeId,
        p_project_id: nodeData.project_id,
        p_user_id: userId,
        p_deadline: deadline,
      });

      // Log activity
      await logActivity({
        project_id: nodeData.project_id,
        user_id: userId,
        type: ActivityType.NODE_UPDATED,
        action: `"${nodeData.title}" için deadline eklendi: ${new Date(deadline).toLocaleDateString('tr-TR')}`,
        entity_type: 'node',
        entity_id: nodeId,
        metadata: { deadline },
      });
    } else {
      // Remove reminders
      await (supabase
        .from('deadline_reminders') as any)
        .delete()
        .eq('node_id', nodeId);

      // Log activity
      await logActivity({
        project_id: nodeData.project_id,
        user_id: userId,
        type: ActivityType.NODE_UPDATED,
        action: `"${nodeData.title}" deadline'ı kaldırıldı`,
        entity_type: 'node',
        entity_id: nodeId,
      });
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error('Set deadline error:', error);
    return {
      success: false,
      error: error.message || 'Deadline ayarlanamadı',
    };
  }
}

// =============================================
// GET DEADLINES
// =============================================

/**
 * Get upcoming deadlines (next 7 days by default)
 */
export async function getUpcomingDeadlines(
  userId: string,
  projectId?: string,
  daysAhead: number = 7
) {
  try {
    // @ts-ignore
    const { data, error } = await supabase.rpc('get_upcoming_deadlines', {
      p_user_id: userId,
      p_project_id: projectId || null,
      p_days_ahead: daysAhead,
    });

    if (error) throw error;

    return {
      success: true,
      deadlines: data as DeadlineNode[],
    };
  } catch (error: any) {
    console.error('Get upcoming deadlines error:', error);
    return {
      success: false,
      error: error.message || 'Deadline\'lar yüklenemedi',
      deadlines: [],
    };
  }
}

/**
 * Get overdue nodes
 */
export async function getOverdueNodes(userId: string, projectId?: string) {
  try {
    // @ts-ignore
    const { data, error } = await supabase.rpc('get_overdue_nodes', {
      p_user_id: userId,
      p_project_id: projectId || null,
    });

    if (error) throw error;

    return {
      success: true,
      overdue: data as DeadlineNode[],
    };
  } catch (error: any) {
    console.error('Get overdue nodes error:', error);
    return {
      success: false,
      error: error.message || 'Gecikmiş görevler yüklenemedi',
      overdue: [],
    };
  }
}

// =============================================
// DEADLINE STATUS
// =============================================

// =============================================
// REMINDERS
// =============================================

/**
 * Send deadline reminder notifications
 * (This should be called by a cron job/scheduled function)
 */
export async function sendDeadlineReminders() {
  try {
    // Get unsent reminders that are due
    const { data: reminders, error } = await (supabase
      .from('deadline_reminders') as any)
      .select(`
        *,
        roadmap_nodes(id, title, project_id),
        profiles(id, email, full_name)
      `)
      .eq('sent', false)
      .lte('deadline', new Date().toISOString());

    if (error) throw error;

    for (const reminder of reminders || []) {
      const node = (reminder as any).roadmap_nodes;
      const user = (reminder as any).profiles;

      // Create notification
      await createNotification({
        user_id: reminder.user_id,
        type: NotificationType.DEADLINE_APPROACHING,
        title: 'Deadline Yaklaşıyor',
        message: `"${node.title}" görevinin deadline'ı yaklaşıyor!`,
        link: `/projects/${node.project_id}?node=${node.id}`,
        metadata: {
          node_id: node.id,
          project_id: node.project_id,
          deadline: reminder.deadline,
          reminder_type: reminder.reminder_type,
        },
      });

      // Mark reminder as sent
      await (supabase
        .from('deadline_reminders') as any)
        .update({
          sent: true,
          sent_at: new Date().toISOString(),
        })
        .eq('id', reminder.id);
    }

    return {
      success: true,
      sent: reminders?.length || 0,
    };
  } catch (error: any) {
    console.error('Send deadline reminders error:', error);
    return {
      success: false,
      error: error.message || 'Reminder\'lar gönderilemedi',
      sent: 0,
    };
  }
}

/**
 * Check for overdue reminders and create them
 * (This should be called daily by a cron job)
 */
export async function createOverdueReminders() {
  try {
    // Get overdue nodes without overdue reminders
    // @ts-ignore - deadline column will be added with SQL migration
    const { data: overdueNodes, error } = await supabase
      .from('roadmap_nodes')
      .select(`
        id,
        title,
        project_id,
        deadline,
        status,
        projects(user_id)
      `)
      .not('deadline', 'is', null)
      .lt('deadline', new Date().toISOString())
      .neq('status', 'completed');

    if (error) throw error;

    for (const node of overdueNodes || []) {
      const nodeData = node as any;
      const daysSinceDeadline = Math.floor(
        (new Date().getTime() - new Date(nodeData.deadline!).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Create 1 day overdue reminder
      if (daysSinceDeadline === 1) {
        await (supabase.from('deadline_reminders') as any).insert({
          node_id: nodeData.id,
          project_id: nodeData.project_id,
          user_id: nodeData.projects.user_id,
          deadline: nodeData.deadline,
          reminder_type: '1_day_overdue',
          sent: false,
        });
      }

      // Create 3 days overdue reminder
      if (daysSinceDeadline === 3) {
        await (supabase.from('deadline_reminders') as any).insert({
          node_id: nodeData.id,
          project_id: nodeData.project_id,
          user_id: nodeData.projects.user_id,
          deadline: nodeData.deadline,
          reminder_type: '3_days_overdue',
          sent: false,
        });
      }
    }

    return {
      success: true,
      created: overdueNodes?.length || 0,
    };
  } catch (error: any) {
    console.error('Create overdue reminders error:', error);
    return {
      success: false,
      error: error.message || 'Overdue reminder\'lar oluşturulamadı',
      created: 0,
    };
  }
}
