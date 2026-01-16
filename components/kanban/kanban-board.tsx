'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, GripVertical, MoreVertical, Edit, Trash, CheckCircle2, 
  Circle, Clock, AlertCircle, User, Calendar, Sparkles, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  getProjectKanban, 
  moveTask, 
  aiBreakdownTask,
  getTaskSubtasks,
  convertRoadmapNodeToTask 
} from '@/actions/kanban';
import { toast } from 'sonner';
import { CreateTaskDialog } from './create-task-dialog';
import { TaskDetailsDialog } from './task-details-dialog';

interface Task {
  id: string;
  title: string;
  description?: string;
  task_type: 'epic' | 'story' | 'task' | 'subtask';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  column_id: string;
  position: number;
  assigned_to?: string;
  due_date?: string;
  estimated_hours?: number;
  ai_generated?: boolean;
  subtasks?: { count: number }[];
}

interface Column {
  id: string;
  name: string;
  position: number;
  color: string;
}

interface KanbanBoardProps {
  projectId: string;
  userId: string;
}

function TaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [subtasks, setSubtasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColors = {
    low: 'bg-slate-500',
    medium: 'bg-blue-500',
    high: 'bg-orange-500',
    urgent: 'bg-red-500',
  };

  const typeIcons = {
    epic: '🎯',
    story: '📖',
    task: '✓',
    subtask: '└',
  };

  async function handleAIBreakdown(e: React.MouseEvent) {
    e.stopPropagation();
    setLoading(true);
    
    const result = await aiBreakdownTask({
      taskId: task.id,
      userId: task.assigned_to || '',
    });
    
    if (result.success) {
      toast.success(result.message);
      setSubtasks(result.subtasks as Task[]);
      setShowSubtasks(true);
    } else {
      toast.error(result.error || 'Alt görevler oluşturulamadı');
    }
    
    setLoading(false);
  }

  async function loadSubtasks() {
    if (subtasks.length > 0) {
      setShowSubtasks(!showSubtasks);
      return;
    }
    
    const result = await getTaskSubtasks(task.id);
    if (result.success) {
      setSubtasks(result.subtasks as Task[]);
      setShowSubtasks(true);
    }
  }

  const hasSubtasks = task.subtasks && task.subtasks[0]?.count > 0;

  return (
    <div ref={setNodeRef} style={style}>
      <Card 
        className="p-4 mb-3 cursor-pointer hover:shadow-lg transition-all group"
        onClick={onClick}
      >
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="mt-1 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-4 h-4" />
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{typeIcons[task.task_type]}</span>
                <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleAIBreakdown} disabled={loading}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {loading ? 'AI Çalışıyor...' : 'AI ile Alt Görevlere Böl'}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="w-4 h-4 mr-2" />
                    Düzenle
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash className="w-4 h-4 mr-2" />
                    Sil
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Description */}
            {task.description && (
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${priorityColors[task.priority]}`} />
                
                {task.estimated_hours && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {task.estimated_hours}h
                  </Badge>
                )}
                
                {task.ai_generated && (
                  <Badge variant="outline" className="text-xs">
                    <Sparkles className="w-3 h-3" />
                  </Badge>
                )}
              </div>

              {hasSubtasks && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    loadSubtasks();
                  }}
                >
                  <ChevronDown className={`w-3 h-3 mr-1 transition-transform ${showSubtasks ? 'rotate-180' : ''}`} />
                  {task.subtasks![0].count}
                </Button>
              )}
            </div>

            {/* Subtasks */}
            <AnimatePresence>
              {showSubtasks && subtasks.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-3 pt-3 border-t space-y-2"
                >
                  {subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Circle className="w-3 h-3" />
                      <span>{subtask.title}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Card>
    </div>
  );
}

function KanbanColumn({ column, tasks, onAddTask }: { 
  column: Column; 
  tasks: Task[]; 
  onAddTask: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: column.color }} />
          <h3 className="font-semibold">{column.name}</h3>
          <Badge variant="secondary">{tasks.length}</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={onAddTask}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto p-4">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => {}} />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Görev yok
          </div>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ projectId, userId }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);

  useEffect(() => {
    loadKanban();
  }, [projectId]);

  async function loadKanban() {
    console.log('🔄 Loading kanban for project:', projectId);
    setLoading(true);
    try {
      const result = await getProjectKanban(projectId);
      console.log('📦 Kanban result:', result);
      
      if (result.success) {
        console.log('✅ Columns:', result.columns);
        console.log('✅ Tasks:', result.tasks);
        setColumns(result.columns);
        setTasks(result.tasks as Task[]);
      } else {
        console.error('❌ Failed to load kanban:', result.error);
        toast.error(result.error || 'Kanban yüklenemedi');
      }
    } catch (error) {
      console.error('❌ Error loading kanban:', error);
      toast.error('Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeTask = tasks.find(t => t.id === active.id);
    if (!activeTask) return;
    
    // Find target column
    let targetColumnId: string;
    if (over.id in columns.reduce((acc, col) => ({ ...acc, [col.id]: true }), {})) {
      targetColumnId = over.id as string;
    } else {
      const overTask = tasks.find(t => t.id === over.id);
      targetColumnId = overTask?.column_id || activeTask.column_id;
    }
    
    // Optimistic update
    setTasks(prevTasks => {
      const updated = prevTasks.map(t => 
        t.id === active.id 
          ? { ...t, column_id: targetColumnId }
          : t
      );
      return updated;
    });
    
    // Server update
    await moveTask({
      taskId: active.id as string,
      newColumnId: targetColumnId,
      newPosition: 0,
    });
    
    setActiveId(null);
  }

  function openCreateDialog(columnId: string) {
    setSelectedColumnId(columnId);
    setCreateDialogOpen(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Görev panosu yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (columns.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-semibold mb-2">Kanban Sütunları Bulunamadı</h3>
          <p className="text-muted-foreground mb-4">
            Supabase SQL Editor'da aşağıdaki komutu çalıştırın:
          </p>
          <code className="block bg-muted p-4 rounded text-sm text-left overflow-x-auto">
            INSERT INTO task_columns (project_id, name, position, color)<br/>
            VALUES<br/>
            &nbsp;&nbsp;('{projectId}', 'Yapılacaklar', 0, '#ef4444'),<br/>
            &nbsp;&nbsp;('{projectId}', 'Devam Ediyor', 1, '#f59e0b'),<br/>
            &nbsp;&nbsp;('{projectId}', 'Tamamlandı', 2, '#10b981');
          </code>
          <Button onClick={loadKanban} className="mt-4">
            Yeniden Yükle
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="h-full flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => (
            <div key={column.id} className="flex-shrink-0 w-80 bg-muted/30 rounded-lg border">
              <KanbanColumn
                column={column}
                tasks={tasks.filter(t => t.column_id === column.id)}
                onAddTask={() => openCreateDialog(column.id)}
              />
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeId && (
            <Card className="p-4 rotate-3 shadow-2xl">
              <div className="font-medium">
                {tasks.find(t => t.id === activeId)?.title}
              </div>
            </Card>
          )}
        </DragOverlay>
      </DndContext>

      <CreateTaskDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        projectId={projectId}
        columnId={selectedColumnId || ''}
        userId={userId}
        onSuccess={loadKanban}
      />
    </>
  );
}
