'use server';

/**
 * 🗓️ Timeline & Gantt Chart Actions
 * Dependencies ve Milestones yönetimi
 */

import { createServiceClient } from '@/lib/supabase/server';

/**
 * Get timeline data for Gantt chart
 */
export async function getProjectTimeline(projectId: string) {
  try {
    const supabase = createServiceClient();
    
    // Get tasks with dates and dependencies
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select(`
        *,
        dependencies_blocking:task_dependencies!blocked_task_id(*),
        dependencies_blocked_by:task_dependencies!blocking_task_id(*)
      `)
      .eq('project_id', projectId)
      .order('start_date', { ascending: true });
    
    if (tasksError) throw tasksError;
    
    // Get milestones
    const { data: milestones, error: milestonesError } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_milestone', true)
      .order('due_date', { ascending: true });
    
    if (milestonesError) throw milestonesError;
    
    return {
      success: true,
      tasks: tasks || [],
      milestones: milestones || [],
    };
  } catch (error: any) {
    console.error('Get timeline error:', error);
    return {
      success: false,
      error: error.message,
      tasks: [],
      milestones: [],
    };
  }
}

/**
 * Add task dependency
 */
export async function addTaskDependency(input: {
  blockedTaskId: string;
  blockingTaskId: string;
  dependencyType?: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
  lagDays?: number;
}) {
  try {
    const supabase = createServiceClient();
    
    const { data, error } = await supabase
      .from('task_dependencies')
      .insert({
        blocked_task_id: input.blockedTaskId,
        blocking_task_id: input.blockingTaskId,
        dependency_type: input.dependencyType || 'finish_to_start',
        lag_days: input.lagDays || 0,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, dependency: data };
  } catch (error: any) {
    console.error('Add dependency error:', error);
    
    // User-friendly error messages
    if (error.message?.includes('Circular dependency')) {
      return { success: false, error: 'Bu bağımlılık döngüsel bir bağımlılık oluşturur!' };
    }
    if (error.message?.includes('unique_dependency')) {
      return { success: false, error: 'Bu bağımlılık zaten mevcut' };
    }
    
    return { success: false, error: error.message };
  }
}

/**
 * Remove task dependency
 */
export async function removeTaskDependency(dependencyId: string) {
  try {
    const supabase = createServiceClient();
    
    const { error } = await supabase
      .from('task_dependencies')
      .delete()
      .eq('id', dependencyId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('Remove dependency error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update task dates (for Gantt drag)
 */
export async function updateTaskDates(input: {
  taskId: string;
  startDate?: string;
  dueDate?: string;
}) {
  try {
    const supabase = createServiceClient();
    
    const updates: any = {};
    if (input.startDate) updates.start_date = input.startDate;
    if (input.dueDate) updates.due_date = input.dueDate;
    
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', input.taskId)
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, task: data };
  } catch (error: any) {
    console.error('Update task dates error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Convert task to milestone
 */
export async function toggleMilestone(input: {
  taskId: string;
  isMilestone: boolean;
  milestoneIcon?: string;
}) {
  try {
    const supabase = createServiceClient();
    
    const { data, error } = await supabase
      .from('tasks')
      .update({
        is_milestone: input.isMilestone,
        milestone_icon: input.milestoneIcon || '🎯',
      })
      .eq('id', input.taskId)
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, task: data };
  } catch (error: any) {
    console.error('Toggle milestone error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get task dependencies (for displaying arrows)
 */
export async function getTaskDependencies(taskId: string) {
  try {
    const supabase = createServiceClient();
    
    const { data, error } = await supabase
      .from('task_dependencies')
      .select(`
        *,
        blocked_task:blocked_task_id(id, title),
        blocking_task:blocking_task_id(id, title)
      `)
      .or(`blocked_task_id.eq.${taskId},blocking_task_id.eq.${taskId}`);
    
    if (error) throw error;
    
    return { success: true, dependencies: data || [] };
  } catch (error: any) {
    console.error('Get dependencies error:', error);
    return { success: false, error: error.message, dependencies: [] };
  }
}

/**
 * Auto-schedule project tasks based on dependencies
 */
export async function autoScheduleProject(projectId: string) {
  try {
    const supabase = createServiceClient();
    
    // Get all tasks with dependencies
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select(`
        *,
        dependencies_blocking:task_dependencies!blocked_task_id(*)
      `)
      .eq('project_id', projectId)
      .order('position');
    
    if (tasksError) throw tasksError;
    if (!tasks) return { success: false, error: 'No tasks found' };
    
    // Topological sort to schedule tasks
    const scheduled: any[] = [];
    const taskMap = new Map(tasks.map(t => [t.id, t]));
    
    function scheduleTask(task: any, currentDate: Date = new Date()) {
      // If already scheduled, skip
      if (scheduled.includes(task.id)) return;
      
      // Schedule blocking tasks first
      const blockingDeps = task.dependencies_blocking || [];
      let latestBlockingDate = currentDate;
      
      for (const dep of blockingDeps) {
        const blockingTask = taskMap.get(dep.blocking_task_id);
        if (blockingTask) {
          scheduleTask(blockingTask, currentDate);
          if (blockingTask.due_date) {
            const depDate = new Date(blockingTask.due_date);
            if (depDate > latestBlockingDate) {
              latestBlockingDate = depDate;
            }
          }
        }
      }
      
      // Set start date after blocking tasks
      const startDate = new Date(latestBlockingDate);
      startDate.setDate(startDate.getDate() + 1);
      
      // Set due date based on estimated hours (default 1 day per 8 hours)
      const durationDays = Math.ceil((task.estimated_hours || 8) / 8);
      const dueDate = new Date(startDate);
      dueDate.setDate(dueDate.getDate() + durationDays - 1);
      
      // Update task dates
      supabase
        .from('tasks')
        .update({
          start_date: startDate.toISOString(),
          due_date: dueDate.toISOString(),
        })
        .eq('id', task.id)
        .then(() => {});
      
      scheduled.push(task.id);
    }
    
    // Schedule all tasks
    for (const task of tasks) {
      scheduleTask(task);
    }
    
    return { success: true, scheduledCount: scheduled.length };
  } catch (error: any) {
    console.error('Auto schedule error:', error);
    return { success: false, error: error.message };
  }
}
