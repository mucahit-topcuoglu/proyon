'use server';

/**
 * 🎯 Kanban Board Actions
 * 
 * Jira-style task management with AI breakdown
 */

import { createServiceClient } from '@/lib/supabase/server';

/**
 * Get all columns and tasks for a project
 */
export async function getProjectKanban(projectId: string) {
  try {
    console.log('🔄 [Kanban Action] Getting kanban for project:', projectId);
    const supabase = createServiceClient();
    
    // Get columns
    const { data: columns, error: columnsError } = await supabase
      .from('task_columns')
      .select('*')
      .eq('project_id', projectId)
      .order('position', { ascending: true });
    
    console.log('📊 [Kanban Action] Columns result:', { columns, error: columnsError });
    
    if (columnsError) {
      console.error('❌ [Kanban Action] Columns error:', columnsError);
      throw columnsError;
    }
    
    // Get tasks with subtasks count
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select(`
        *,
        subtasks:tasks!parent_task_id(count)
      `)
      .eq('project_id', projectId)
      .is('parent_task_id', null)
      .order('position', { ascending: true });
    
    console.log('✅ [Kanban Action] Tasks result:', { tasks, error: tasksError });
    
    if (tasksError) {
      console.error('❌ [Kanban Action] Tasks error:', tasksError);
      throw tasksError;
    }
    
    return {
      success: true,
      columns: columns || [],
      tasks: tasks || [],
    };
  } catch (error: any) {
    console.error('❌ [Kanban Action] Get kanban error:', error);
    return {
      success: false,
      error: error.message,
      columns: [],
      tasks: [],
    };
  }
}

/**
 * Create a new task
 */
export async function createTask(input: {
  projectId: string;
  columnId: string;
  title: string;
  description?: string;
  taskType?: 'epic' | 'story' | 'task' | 'subtask';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  parentTaskId?: string;
  roadmapNodeId?: string;
  userId: string;
}) {
  try {
    const supabase = createServiceClient();
    
    // Get next position in column
    const { data: lastTask } = await supabase
      .from('tasks')
      .select('position')
      .eq('column_id', input.columnId)
      .order('position', { ascending: false })
      .limit(1)
      .single();
    
    const position = lastTask ? lastTask.position + 1 : 0;
    
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        project_id: input.projectId,
        column_id: input.columnId,
        title: input.title,
        description: input.description,
        task_type: input.taskType || 'task',
        priority: input.priority || 'medium',
        parent_task_id: input.parentTaskId,
        roadmap_node_id: input.roadmapNodeId,
        created_by: input.userId,
        position,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      success: true,
      task: data,
      message: 'Görev oluşturuldu',
    };
  } catch (error: any) {
    console.error('Create task error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Update task position (drag & drop)
 */
export async function moveTask(input: {
  taskId: string;
  newColumnId: string;
  newPosition: number;
}) {
  try {
    const supabase = createServiceClient();
    
    const { error } = await supabase
      .from('tasks')
      .update({
        column_id: input.newColumnId,
        position: input.newPosition,
      })
      .eq('id', input.taskId);
    
    if (error) throw error;
    
    return {
      success: true,
      message: 'Görev taşındı',
    };
  } catch (error: any) {
    console.error('Move task error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * AI Task Breakdown - Break epic into subtasks
 */
export async function aiBreakdownTask(input: {
  taskId: string;
  userId: string;
}) {
  try {
    const supabase = createServiceClient();
    
    // Get task details
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*, project:projects(*)')
      .eq('id', input.taskId)
      .single();
    
    if (taskError) throw taskError;
    if (!task) throw new Error('Görev bulunamadı');
    
    // Use Groq AI to breakdown task
    const Groq = require('groq-sdk').default;
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    const prompt = `
Bu büyük görevi mantıklı alt görevlere böl:

Görev: ${task.title}
Açıklama: ${task.description || 'Açıklama yok'}

Her alt görev için:
- Kısa ve net başlık (max 50 karakter)
- Detaylı açıklama (1-2 cümle)
- Tahmini süre (saat cinsinden: 1-8 arası)

4-6 alt görev oluştur. JSON formatında döndür:

\`\`\`json
{
  "subtasks": [
    {
      "title": "Alt görev başlığı",
      "description": "Detaylı açıklama",
      "estimated_hours": 4
    }
  ]
}
\`\`\`
`;
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Sen deneyimli bir proje yöneticisisin. Görevleri mantıklı alt görevlere bölme konusunda uzmansın.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 2000,
    });
    
    const aiResponse = completion.choices[0]?.message?.content || '';
    console.log('AI Breakdown Response:', aiResponse);
    
    // Parse AI response
    let subtasksData;
    try {
      // Extract JSON from markdown code blocks
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : aiResponse;
      subtasksData = JSON.parse(jsonStr);
    } catch (e) {
      console.error('JSON parse error:', e);
      throw new Error('AI yanıtı işlenemedi');
    }
    
    if (!subtasksData?.subtasks || !Array.isArray(subtasksData.subtasks)) {
      throw new Error('Geçersiz AI yanıtı');
    }
    
    // Create subtasks
    const createdSubtasks = [];
    const firstColumnId = task.column_id; // Same column as parent
    
    for (const [index, subtask] of subtasksData.subtasks.entries()) {
      const { data: newSubtask, error: createError } = await supabase
        .from('tasks')
        .insert({
          project_id: task.project_id,
          column_id: firstColumnId,
          parent_task_id: task.id,
          title: subtask.title,
          description: subtask.description,
          task_type: 'subtask',
          priority: task.priority,
          estimated_hours: subtask.estimated_hours,
          created_by: input.userId,
          ai_generated: true,
          ai_breakdown_from: task.id,
          position: index,
        })
        .select()
        .single();
      
      if (!createError && newSubtask) {
        createdSubtasks.push(newSubtask);
      }
    }
    
    return {
      success: true,
      subtasks: createdSubtasks,
      message: `${createdSubtasks.length} alt görev oluşturuldu`,
    };
  } catch (error: any) {
    console.error('AI breakdown error:', error);
    return {
      success: false,
      error: error.message || 'Alt görevler oluşturulamadı',
      subtasks: [],
    };
  }
}

/**
 * Convert roadmap node to task
 */
export async function convertRoadmapNodeToTask(input: {
  nodeId: string;
  projectId: string;
  userId: string;
}) {
  try {
    const supabase = createServiceClient();
    
    // Get node details
    const { data: node, error: nodeError } = await supabase
      .from('roadmap_nodes')
      .select('*')
      .eq('id', input.nodeId)
      .single();
    
    if (nodeError) throw nodeError;
    
    // Get first column (Yapılacaklar)
    const { data: firstColumn } = await supabase
      .from('task_columns')
      .select('id')
      .eq('project_id', input.projectId)
      .order('position', { ascending: true })
      .limit(1)
      .single();
    
    if (!firstColumn) throw new Error('Kolon bulunamadı');
    
    // Create task from node
    return await createTask({
      projectId: input.projectId,
      columnId: firstColumn.id,
      title: node.title,
      description: node.description,
      taskType: node.type === 'milestone' ? 'epic' : 'task',
      roadmapNodeId: input.nodeId,
      userId: input.userId,
    });
  } catch (error: any) {
    console.error('Convert node to task error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get task subtasks
 */
export async function getTaskSubtasks(taskId: string) {
  try {
    const supabase = createServiceClient();
    
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assigned_user:assigned_to(id, email)
      `)
      .eq('parent_task_id', taskId)
      .order('position', { ascending: true });
    
    if (error) throw error;
    
    return {
      success: true,
      subtasks: data || [],
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      subtasks: [],
    };
  }
}

/**
 * Update task
 */
export async function updateTask(
  taskId: string,
  updates: {
    title?: string;
    description?: string;
    priority?: string;
    assigned_to?: string;
    estimated_hours?: number;
    due_date?: string;
  }
) {
  try {
    const supabase = createServiceClient();
    
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      success: true,
      task: data,
      message: 'Görev güncellendi',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Delete task
 */
export async function deleteTask(taskId: string) {
  try {
    const supabase = createServiceClient();
    
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);
    
    if (error) throw error;
    
    return {
      success: true,
      message: 'Görev silindi',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}
