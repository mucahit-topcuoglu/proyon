'use server';

/**
 * 🐛 Issue Tracking Actions
 * Bug reports, feature requests, ve önceliklendirme
 */

import { createServiceClient } from '@/lib/supabase/server';

/**
 * Get all issues for a project
 */
export async function getProjectIssues(projectId: string, filters?: {
  type?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
}) {
  try {
    const supabase = createServiceClient();
    
    let query = supabase
      .from('issues')
      .select(`
        *,
        labels:issue_label_assignments(
          label:label_id(id, name, color)
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    // Apply filters
    if (filters?.type) query = query.eq('issue_type', filters.type);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.priority) query = query.eq('priority', filters.priority);
    if (filters?.assignedTo) query = query.eq('assigned_to', filters.assignedTo);
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    console.log('📋 getProjectIssues result:', {
      projectId,
      issueCount: data?.length || 0,
      issues: data
    });
    
    return {
      success: true,
      issues: data || [],
    };
  } catch (error: any) {
    console.error('Get issues error:', error);
    return {
      success: false,
      error: error.message,
      issues: [],
    };
  }
}

/**
 * Create new issue
 */
export async function createIssue(input: {
  projectId: string;
  title: string;
  description?: string;
  issueType: 'bug' | 'feature' | 'improvement' | 'task' | 'question';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  severity?: 'minor' | 'major' | 'blocker';
  reporterId: string;
  assignedTo?: string;
  dueDate?: string;
  labels?: string[]; // Label IDs
}) {
  try {
    const supabase = createServiceClient();
    
    // Create issue
    const { data: issue, error: issueError } = await supabase
      .from('issues')
      .insert({
        project_id: input.projectId,
        title: input.title,
        description: input.description,
        issue_type: input.issueType,
        priority: input.priority || 'medium',
        severity: input.severity,
        reporter_id: input.reporterId,
        assigned_to: input.assignedTo,
        due_date: input.dueDate,
      })
      .select()
      .single();
    
    if (issueError) throw issueError;
    
    // Add labels if provided
    if (input.labels && input.labels.length > 0) {
      const labelAssignments = input.labels.map(labelId => ({
        issue_id: issue.id,
        label_id: labelId,
      }));
      
      await supabase
        .from('issue_label_assignments')
        .insert(labelAssignments);
    }
    
    return { success: true, issue };
  } catch (error: any) {
    console.error('Create issue error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update issue
 */
export async function updateIssue(input: {
  issueId: string;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  dueDate?: string;
}) {
  try {
    const supabase = createServiceClient();
    
    const updates: any = {};
    if (input.title !== undefined) updates.title = input.title;
    if (input.description !== undefined) updates.description = input.description;
    if (input.status) updates.status = input.status;
    if (input.priority) updates.priority = input.priority;
    if (input.assignedTo !== undefined) updates.assigned_to = input.assignedTo;
    if (input.dueDate !== undefined) updates.due_date = input.dueDate;
    
    const { data, error } = await supabase
      .from('issues')
      .update(updates)
      .eq('id', input.issueId)
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, issue: data };
  } catch (error: any) {
    console.error('Update issue error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete issue
 */
export async function deleteIssue(issueId: string) {
  try {
    const supabase = createServiceClient();
    
    const { error } = await supabase
      .from('issues')
      .delete()
      .eq('id', issueId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('Delete issue error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Vote on issue (upvote/downvote)
 */
export async function voteOnIssue(input: {
  issueId: string;
  userId: string;
  voteType: 'up' | 'down';
}) {
  try {
    const supabase = createServiceClient();
    
    // Upsert vote (update if exists, insert if not)
    const { error } = await supabase
      .from('issue_votes')
      .upsert({
        issue_id: input.issueId,
        user_id: input.userId,
        vote_type: input.voteType,
      }, {
        onConflict: 'issue_id,user_id',
      });
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('Vote issue error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Remove vote
 */
export async function removeVote(issueId: string, userId: string) {
  try {
    const supabase = createServiceClient();
    
    const { error } = await supabase
      .from('issue_votes')
      .delete()
      .eq('issue_id', issueId)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('Remove vote error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Add comment to issue
 */
export async function addIssueComment(input: {
  issueId: string;
  userId: string;
  content: string;
  isInternal?: boolean;
}) {
  try {
    const supabase = createServiceClient();
    
    const { data, error } = await supabase
      .from('issue_comments')
      .insert({
        issue_id: input.issueId,
        user_id: input.userId,
        content: input.content,
        is_internal: input.isInternal || false,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, comment: data };
  } catch (error: any) {
    console.error('Add comment error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get project labels
 */
export async function getProjectLabels(projectId: string) {
  try {
    const supabase = createServiceClient();
    
    const { data, error } = await supabase
      .from('issue_labels')
      .select('*')
      .eq('project_id', projectId)
      .order('name');
    
    if (error) throw error;
    
    return {
      success: true,
      labels: data || [],
    };
  } catch (error: any) {
    console.error('Get labels error:', error);
    return {
      success: false,
      error: error.message,
      labels: [],
    };
  }
}

/**
 * Create custom label
 */
export async function createLabel(input: {
  projectId: string;
  name: string;
  color: string;
  description?: string;
}) {
  try {
    const supabase = createServiceClient();
    
    const { data, error } = await supabase
      .from('issue_labels')
      .insert({
        project_id: input.projectId,
        name: input.name,
        color: input.color,
        description: input.description,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, label: data };
  } catch (error: any) {
    console.error('Create label error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Add label to issue
 */
export async function addLabelToIssue(issueId: string, labelId: string) {
  try {
    const supabase = createServiceClient();
    
    const { error } = await supabase
      .from('issue_label_assignments')
      .insert({
        issue_id: issueId,
        label_id: labelId,
      });
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('Add label error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Remove label from issue
 */
export async function removeLabelFromIssue(issueId: string, labelId: string) {
  try {
    const supabase = createServiceClient();
    
    const { error } = await supabase
      .from('issue_label_assignments')
      .delete()
      .eq('issue_id', issueId)
      .eq('label_id', labelId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('Remove label error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get issue statistics
 */
export async function getIssueStats(projectId: string) {
  try {
    const supabase = createServiceClient();
    
    const { data: issues, error } = await supabase
      .from('issues')
      .select('issue_type, status, priority')
      .eq('project_id', projectId);
    
    if (error) throw error;
    
    const stats = {
      total: issues?.length || 0,
      byType: {
        bug: issues?.filter(i => i.issue_type === 'bug').length || 0,
        feature: issues?.filter(i => i.issue_type === 'feature').length || 0,
        improvement: issues?.filter(i => i.issue_type === 'improvement').length || 0,
        task: issues?.filter(i => i.issue_type === 'task').length || 0,
        question: issues?.filter(i => i.issue_type === 'question').length || 0,
      },
      byStatus: {
        open: issues?.filter(i => i.status === 'open').length || 0,
        in_progress: issues?.filter(i => i.status === 'in_progress').length || 0,
        resolved: issues?.filter(i => i.status === 'resolved').length || 0,
        closed: issues?.filter(i => i.status === 'closed').length || 0,
      },
      byPriority: {
        low: issues?.filter(i => i.priority === 'low').length || 0,
        medium: issues?.filter(i => i.priority === 'medium').length || 0,
        high: issues?.filter(i => i.priority === 'high').length || 0,
        critical: issues?.filter(i => i.priority === 'critical').length || 0,
      },
    };
    
    return { success: true, stats };
  } catch (error: any) {
    console.error('Get stats error:', error);
    return { success: false, error: error.message, stats: null };
  }
}

/**
 * AI: Optimize roadmap based on issue priorities
 */
export async function optimizeRoadmapByIssues(projectId: string) {
  try {
    const supabase = createServiceClient();
    
    // Get high priority open issues
    const { data: criticalIssues, error } = await supabase
      .from('issues')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', 'open')
      .in('priority', ['high', 'critical'])
      .order('priority', { ascending: false })
      .order('upvotes', { ascending: false });
    
    if (error) throw error;
    
    // Return prioritized list for AI to process
    return {
      success: true,
      criticalIssues: criticalIssues || [],
      recommendation: `${criticalIssues?.length || 0} kritik issue bulundu. Roadmap'te öncelik verilmeli.`,
    };
  } catch (error: any) {
    console.error('Optimize roadmap error:', error);
    return {
      success: false,
      error: error.message,
      criticalIssues: [],
    };
  }
}
