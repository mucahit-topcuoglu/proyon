'use client';

/**
 * 📊 Timeline / Gantt Chart View
 * Görevleri zaman çizelgesinde gösterir, bağımlılıkları okla çizer
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Plus, Link2, Target, ChevronLeft, ChevronRight,
  Zap, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  getProjectTimeline,
  addTaskDependency,
  toggleMilestone,
  autoScheduleProject,
} from '@/actions/timeline';
import { toast } from 'sonner';
import { format, addDays, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Task {
  id: string;
  title: string;
  task_type: string;
  priority: string;
  start_date?: string;
  due_date?: string;
  is_milestone?: boolean;
  milestone_icon?: string;
  estimated_hours?: number;
  column_id: string;
  dependencies_blocking?: any[];
  dependencies_blocked_by?: any[];
}

interface TimelineViewProps {
  projectId: string;
  userId: string;
}

export function TimelineView({ projectId, userId }: TimelineViewProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewStart, setViewStart] = useState(startOfMonth(new Date()));
  const [viewEnd, setViewEnd] = useState(endOfMonth(new Date()));
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [dependencyMode, setDependencyMode] = useState(false);
  const [dependencyFrom, setDependencyFrom] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    loadTimeline();
  }, [projectId]);

  async function loadTimeline() {
    setLoading(true);
    const result = await getProjectTimeline(projectId);
    if (result.success) {
      setTasks(result.tasks);
      setMilestones(result.milestones);
      
      // Auto-adjust view range to fit tasks
      if (result.tasks.length > 0) {
        const dates = result.tasks
          .filter((t: Task) => t.start_date || t.due_date)
          .flatMap((t: Task) => [t.start_date, t.due_date].filter(Boolean) as string[])
          .map(d => new Date(d));
        
        if (dates.length > 0) {
          const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
          const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
          setViewStart(startOfMonth(minDate));
          setViewEnd(endOfMonth(addDays(maxDate, 30)));
        }
      }
    }
    setLoading(false);
  }

  async function handleAutoSchedule() {
    const result = await autoScheduleProject(projectId);
    if (result.success) {
      toast.success(`${result.scheduledCount} görev otomatik planlandı`);
      loadTimeline();
    } else {
      toast.error(result.error);
    }
  }

  async function handleAddDependency(blockedId: string, blockingId: string) {
    const result = await addTaskDependency({
      blockedTaskId: blockedId,
      blockingTaskId: blockingId,
    });
    
    if (result.success) {
      toast.success('Bağımlılık eklendi');
      loadTimeline();
    } else {
      toast.error(result.error);
    }
    
    setDependencyMode(false);
    setDependencyFrom(null);
  }

  async function handleToggleMilestone(taskId: string, isMilestone: boolean) {
    const result = await toggleMilestone({
      taskId,
      isMilestone,
      milestoneIcon: '🎯',
    });
    
    if (result.success) {
      toast.success(isMilestone ? 'Milestone olarak işaretlendi' : 'Milestone kaldırıldı');
      loadTimeline();
    } else {
      toast.error(result.error);
    }
  }

  function handleTaskClick(taskId: string) {
    if (dependencyMode) {
      if (!dependencyFrom) {
        setDependencyFrom(taskId);
        toast.info('Şimdi bağımlı görev seçin');
      } else if (dependencyFrom !== taskId) {
        handleAddDependency(taskId, dependencyFrom);
      }
    } else {
      setSelectedTask(taskId);
    }
  }

  // Calculate task position in timeline
  function getTaskPosition(task: Task) {
    if (!task.start_date || !task.due_date) return null;
    
    const start = new Date(task.start_date);
    const end = new Date(task.due_date);
    const totalDays = differenceInDays(viewEnd, viewStart);
    const dayWidth = 100 / totalDays;
    
    const startOffset = differenceInDays(start, viewStart);
    const duration = differenceInDays(end, start) + 1;
    
    return {
      left: `${startOffset * dayWidth}%`,
      width: `${duration * dayWidth}%`,
      duration,
    };
  }

  // Priority colors
  const priorityColors = {
    low: 'bg-slate-500',
    medium: 'bg-blue-500',
    high: 'bg-orange-500',
    urgent: 'bg-red-500',
  };

  const typeIcons: Record<string, string> = {
    epic: '🎯',
    story: '📖',
    task: '✓',
    subtask: '└',
  };

  // Draw dependency arrows (SVG)
  function renderDependencyArrows() {
    if (!svgRef.current) return null;
    
    const arrows: React.ReactElement[] = [];
    
    tasks.forEach((task) => {
      const blockedByDeps = task.dependencies_blocked_by || [];
      
      blockedByDeps.forEach((dep: any, idx: number) => {
        const blockingTask = tasks.find(t => t.id === dep.blocking_task_id);
        if (!blockingTask) return;
        
        const fromPos = getTaskPosition(blockingTask);
        const toPos = getTaskPosition(task);
        
        if (!fromPos || !toPos) return;
        
        // Calculate arrow coordinates (simplified)
        const fromX = parseFloat(fromPos.left) + parseFloat(fromPos.width);
        const toX = parseFloat(toPos.left);
        const fromY = tasks.indexOf(blockingTask) * 60 + 30;
        const toY = tasks.indexOf(task) * 60 + 30;
        
        arrows.push(
          <g key={`dep-${dep.id}-${idx}`}>
            <line
              x1={`${fromX}%`}
              y1={fromY}
              x2={`${toX}%`}
              y2={toY}
              stroke="#8b5cf6"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />
          </g>
        );
      });
    });
    
    return arrows;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Timeline yükleniyor...</p>
        </div>
      </div>
    );
  }

  const days = eachDayOfInterval({ start: viewStart, end: viewEnd });

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="border-b p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-lg">Timeline Görünümü</h2>
          <Badge variant="secondary">{tasks.length} görev</Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={dependencyMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setDependencyMode(!dependencyMode);
              setDependencyFrom(null);
            }}
          >
            <Link2 className="w-4 h-4 mr-2" />
            {dependencyMode ? 'İptal' : 'Bağımlılık Ekle'}
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleAutoSchedule}>
            <Zap className="w-4 h-4 mr-2" />
            Otomatik Planla
          </Button>
          
          <div className="flex border rounded-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setViewStart(addDays(viewStart, -30));
                setViewEnd(addDays(viewEnd, -30));
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="px-3 py-1 text-sm border-x flex items-center">
              {format(viewStart, 'MMM yyyy', { locale: tr })}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setViewStart(addDays(viewStart, 30));
                setViewEnd(addDays(viewEnd, 30));
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="flex-1 overflow-auto">
        <div className="relative min-w-[1200px]">
          {/* Timeline Header (Days) */}
          <div className="sticky top-0 z-10 bg-muted/50 backdrop-blur border-b">
            <div className="flex h-12">
              <div className="w-64 flex-shrink-0 border-r px-4 flex items-center font-medium">
                Görev
              </div>
              <div className="flex-1 flex">
                {days.map((day, idx) => (
                  <div
                    key={idx}
                    className="flex-1 border-r px-1 text-center text-xs flex flex-col justify-center"
                  >
                    <div className="font-medium">{format(day, 'd')}</div>
                    <div className="text-muted-foreground">{format(day, 'EEE', { locale: tr })}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="relative">
            {/* Grid lines */}
            <div className="absolute inset-0 flex">
              <div className="w-64 flex-shrink-0" />
              <div className="flex-1 flex">
                {days.map((_, idx) => (
                  <div key={idx} className="flex-1 border-r border-muted" />
                ))}
              </div>
            </div>

            {/* Task rows */}
            {tasks.filter(t => t.start_date && t.due_date).map((task, rowIdx) => {
              const pos = getTaskPosition(task);
              if (!pos) return null;

              return (
                <div
                  key={task.id}
                  className="relative flex border-b hover:bg-muted/30 transition-colors"
                  style={{ height: 60 }}
                >
                  {/* Task name */}
                  <div className="w-64 flex-shrink-0 border-r px-4 py-2 flex items-center gap-2">
                    <span className="text-lg">{typeIcons[task.task_type] || '✓'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{task.title}</div>
                      {task.is_milestone && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          <Target className="w-3 h-3 mr-1" />
                          Milestone
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Timeline bar */}
                  <div className="flex-1 relative py-2">
                    <motion.div
                      layoutId={`task-${task.id}`}
                      className={`absolute h-8 rounded-lg ${
                        priorityColors[task.priority as keyof typeof priorityColors]
                      } ${
                        selectedTask === task.id ? 'ring-2 ring-white' : ''
                      } ${
                        dependencyFrom === task.id ? 'ring-2 ring-violet-500' : ''
                      } cursor-pointer hover:opacity-90 transition-opacity flex items-center px-2 text-white text-xs font-medium`}
                      style={{
                        left: pos.left,
                        width: pos.width,
                        top: '8px',
                      }}
                      onClick={() => handleTaskClick(task.id)}
                    >
                      {pos.duration}d
                      {task.is_milestone && <span className="ml-1">{task.milestone_icon || '🎯'}</span>}
                    </motion.div>
                  </div>
                </div>
              );
            })}

            {/* Dependency arrows (SVG overlay) */}
            <svg
              ref={svgRef}
              className="absolute inset-0 pointer-events-none"
              style={{ zIndex: 5 }}
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#8b5cf6" />
                </marker>
              </defs>
              {renderDependencyArrows()}
            </svg>
          </div>

          {/* Empty state */}
          {tasks.filter(t => t.start_date && t.due_date).length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Tarih Atanmamış Görevler</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Görevlere başlangıç ve bitiş tarihi atayın
              </p>
              <Button onClick={handleAutoSchedule}>
                <Zap className="w-4 h-4 mr-2" />
                Otomatik Planla
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Milestones Panel */}
      {milestones.length > 0 && (
        <div className="border-t p-4 bg-muted/30">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-violet-500" />
            <span className="font-medium text-sm">Milestone'lar</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {milestones.map((milestone) => (
              <Card key={milestone.id} className="px-3 py-2 flex items-center gap-2">
                <span className="text-lg">{milestone.milestone_icon || '🎯'}</span>
                <div>
                  <div className="font-medium text-sm">{milestone.title}</div>
                  {milestone.due_date && (
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(milestone.due_date), 'd MMM yyyy', { locale: tr })}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
