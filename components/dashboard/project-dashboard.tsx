'use client';

/**
 * 🎯 Project Dashboard - Main Component
 * 
 * Gazla-inspired cyber-professional dashboard with:
 * - Left: Project Manifest (summary, domain badge)
 * - Center: The Timeline (interactive vertical stepper)
 * - Right: Mentor Chat (collapsible drawer)
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import type { Project, RoadmapNode } from '@/types';
import { ProjectManifest } from '@/components/dashboard/project-manifest';
import { TimelineView } from '@/components/dashboard/timeline-view';
import { MentorChat } from '@/components/dashboard/mentor-chat';
import { GenerateRoadmapCTA } from '@/components/dashboard/generate-roadmap-cta';
import { TeamManagement } from '@/components/collaboration/team-management';
import { PublicShare } from '@/components/collaboration/public-share';
import { CategoryTabs } from '@/components/roadmap/category-tabs';
import { KanbanBoard } from '@/components/kanban/kanban-board';
import { TimelineView as GanttTimelineView } from '@/components/timeline/timeline-view';
import { IssueDashboard } from '@/components/issues/issue-dashboard';
import ActivityFeed from '@/components/project/activity-feed';
import type { RoadmapCategory } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { deleteProject } from '@/actions/deleteProject';
import { 
  MessageSquare, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  Users,
  Globe,
  Activity,
  Trash2,
  Kanban,
  ListTree,
  CalendarRange,
  Bug,
} from 'lucide-react';

interface ProjectDashboardProps {
  projectId: string;
}

export function ProjectDashboard({ projectId }: ProjectDashboardProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [nodes, setNodes] = useState<RoadmapNode[]>([]);
  const [categories, setCategories] = useState<RoadmapCategory[]>([]);
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [viewMode, setViewMode] = useState<'roadmap' | 'kanban' | 'timeline' | 'issues'>('roadmap');
  
  // Permission states
  const [isOwner, setIsOwner] = useState(false);
  const [userRole, setUserRole] = useState<'owner' | 'editor' | 'viewer' | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [allowedCategoryIds, setAllowedCategoryIds] = useState<string[] | null>(null);
  
  // Collaboration modals
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Fetch project and roadmap data
  useEffect(() => {
    fetchData();
  }, [projectId]);

  async function fetchData() {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Oturum bulunamadı. Lütfen giriş yapın.');
      }
      
      const currentUserId = session.user.id;
      setUserId(currentUserId);
      
      // Fetch project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single() as { data: Project | null; error: any };
        
      if (projectError) throw projectError;
      if (!projectData) throw new Error('Proje bulunamadı');
      
      setProject(projectData);
      
      // Check permissions
      const isProjectOwner = projectData.user_id === currentUserId;
      setIsOwner(isProjectOwner);
      
      if (isProjectOwner) {
        // Owner has full access
        setUserRole('owner');
        setCanEdit(true);
        setAllowedCategoryIds(null); // null = all categories
        console.log('✅ Project owner - full access granted');
      } else {
        // Check if user is a member (with retry for just-added members)
        console.log('🔍 Checking membership for user:', currentUserId, 'project:', projectId);
        
        let memberData = null;
        let memberError = null;
        let attempts = 0;
        const maxAttempts = 3;
        
        // Retry logic for recently added members
        while (attempts < maxAttempts && !memberData) {
          attempts++;
          
          const result = await supabase
            .from('project_members')
            .select('role, can_edit, category_ids')
            .eq('project_id', projectId)
            .eq('user_id', currentUserId)
            .maybeSingle() as { data: { role: string; can_edit: boolean; category_ids: string[] | null } | null; error: any };
          
          memberData = result.data;
          memberError = result.error;
          
          if (!memberData && attempts < maxAttempts) {
            console.log(`⏳ Attempt ${attempts}/${maxAttempts} - Member not found, retrying in 500ms...`);
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
        
        if (memberError) {
          console.error('❌ Member query error:', memberError);
          throw new Error('Üyelik kontrolü başarısız oldu');
        }
        
        if (!memberData) {
          console.error('❌ User is not a member after', maxAttempts, 'attempts. UserId:', currentUserId, 'ProjectId:', projectId);
          throw new Error('Bu projeye erişim yetkiniz yok. Lütfen proje sahibinden davet isteyiniz.');
        }
        
        console.log('✅ Member found:', memberData);
        setUserRole(memberData.role as 'editor' | 'viewer');
        setCanEdit(memberData.can_edit === true);
        setAllowedCategoryIds(memberData.category_ids || null);
      }
      
      // Fetch roadmap categories first
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('roadmap_categories')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });
        
      if (categoriesError) throw categoriesError;
      
      const allCategories = categoriesData as RoadmapCategory[] || [];
      
      // Filter categories if user has restricted access
      const visibleCategories = allowedCategoryIds && allowedCategoryIds.length > 0
        ? allCategories.filter(cat => allowedCategoryIds.includes(cat.id))
        : allCategories;
      
      setCategories(visibleCategories);
      
      // Fetch roadmap nodes - filter by visible categories
      const { data: nodesData, error: nodesError } = await supabase
        .from('roadmap_nodes')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });
        
      if (nodesError) throw nodesError;
      
      const allNodes = nodesData as RoadmapNode[];
      
      // Filter nodes by allowed categories
      const visibleNodes = allowedCategoryIds && allowedCategoryIds.length > 0
        ? allNodes.filter(node => node.category_id && allowedCategoryIds.includes(node.category_id))
        : allNodes;
      
      setNodes(visibleNodes);
      
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Roadmap oluşturulunca nodes'ları yeniden yükle
  const handleRoadmapGenerated = () => {
    console.log('🎉 Roadmap oluşturuldu, nodes yeniden yükleniyor...');
    fetchData();
  };

  // Handle project deletion
  const handleDeleteProject = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteProject(projectId, userId);
      
      if (result.success) {
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        alert(result.error || 'Proje silinirken hata oluştu');
        setIsDeleting(false);
        setDeleteModalOpen(false);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Beklenmeyen bir hata oluştu');
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  // Real-time subscription for node updates
  useEffect(() => {
    const channel = supabase
      .channel(`project-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'roadmap_nodes',
          filter: `project_id=eq.${projectId}`,
        },
        (payload: any) => {
          console.log('Roadmap node updated:', payload);
          
          if (payload.eventType === 'INSERT') {
            setNodes((prev) => [...prev, payload.new as RoadmapNode]);
          } else if (payload.eventType === 'UPDATE') {
            setNodes((prev) =>
              prev.map((node) =>
                node.id === payload.new.id ? (payload.new as RoadmapNode) : node
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setNodes((prev) => prev.filter((node) => node.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  // Handle node status update
  const handleStatusUpdate = async (nodeId: string, newStatus: string) => {
    if (!canEdit) {
      console.warn('Düzenleme yetkiniz yok');
      return;
    }
    
    try {
      const updates: any = { status: newStatus };
      
      if (newStatus === 'in_progress') {
        updates.started_at = new Date().toISOString();
      } else if (newStatus === 'done') {
        updates.completed_at = new Date().toISOString();
        
        // Calculate actual duration
        const node = nodes.find(n => n.id === nodeId);
        if (node?.started_at) {
          const started = new Date(node.started_at);
          const completed = new Date();
          const durationMinutes = Math.round((completed.getTime() - started.getTime()) / 60000);
          updates.actual_duration = durationMinutes;
        }
      }
      
      const { error } = await supabase
        .from('roadmap_nodes')
        // @ts-ignore - Supabase type issue
        .update(updates)
        .eq('id', nodeId);
        
      if (error) throw error;
      
      // ✅ Nodes state'ini güncelle
      setNodes(prevNodes =>
        prevNodes.map(n =>
          n.id === nodeId ? { ...n, ...updates } : n
        )
      );
      
      console.log(`✅ Node ${nodeId} durumu güncellendi: ${newStatus}`);
      
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  // Handle "I'm Stuck" button
  const handleStuck = (node: RoadmapNode) => {
    setSelectedNode(node);
    setChatOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-slate-400">Proje yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass rounded-lg p-8 max-w-md text-center">
          <h2 className="text-xl font-semibold text-red-400 mb-2">Hata</h2>
          <p className="text-slate-400">{error || 'Proje bulunamadı'}</p>
          <Button 
            onClick={() => window.location.href = '/dashboard'}
            className="mt-4"
          >
            Dashboard'a Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* Left Sidebar - Project Manifest */}
      <motion.aside
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-80 border-r border-slate-800/50 bg-slate-950/50 backdrop-blur-sm overflow-y-auto"
      >
        <ProjectManifest project={project} totalNodes={nodes.length} />
        
        {/* Collaboration Actions */}
        <div className="p-4 space-y-2 border-t border-slate-800">
          <Button
            onClick={() => setTeamModalOpen(true)}
            variant="outline"
            className="w-full border-violet-500/50 text-violet-400 hover:bg-violet-500/10"
          >
            <Users className="w-4 h-4 mr-2" />
            Ekip Yönetimi
          </Button>
          
          <Button
            onClick={() => setShareModalOpen(true)}
            variant="outline"
            className="w-full border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
          >
            <Globe className="w-4 h-4 mr-2" />
            Public Paylaş
          </Button>

          <Button
            onClick={() => setActivityOpen(true)}
            variant="outline"
            className="w-full border-fuchsia-500/50 text-fuchsia-400 hover:bg-fuchsia-500/10"
          >
            <Activity className="w-4 h-4 mr-2" />
            Aktivite Geçmişi
          </Button>

          <Button
            onClick={() => setDeleteModalOpen(true)}
            variant="outline"
            className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Projeyi Sil
          </Button>
        </div>
      </motion.aside>

      {/* Center - Timeline View */}
      <main className="flex-1 overflow-y-auto relative">
        {/* View Mode Toggle */}
        {(nodes.length > 0 || categories.length > 0) && (
          <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/50 p-3 flex gap-2">
            <Button
              variant={viewMode === 'roadmap' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('roadmap')}
              className={viewMode === 'roadmap' 
                ? 'bg-violet-500 text-white hover:bg-violet-600' 
                : 'border-slate-700 text-slate-300 hover:bg-slate-800'
              }
            >
              <ListTree className="w-4 h-4 mr-2" />
              Roadmap
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('kanban')}
              className={viewMode === 'kanban' 
                ? 'bg-violet-500 text-white hover:bg-violet-600' 
                : 'border-slate-700 text-slate-300 hover:bg-slate-800'
              }
            >
              <Kanban className="w-4 h-4 mr-2" />
              Görev Panosu
            </Button>
            <Button
              variant={viewMode === 'timeline' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('timeline')}
              className={viewMode === 'timeline' 
                ? 'bg-violet-500 text-white hover:bg-violet-600' 
                : 'border-slate-700 text-slate-300 hover:bg-slate-800'
              }
            >
              <CalendarRange className="w-4 h-4 mr-2" />
              Zaman Çizelgesi
            </Button>
            <Button
              variant={viewMode === 'issues' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('issues')}
              className={viewMode === 'issues' 
                ? 'bg-violet-500 text-white hover:bg-violet-600' 
                : 'border-slate-700 text-slate-300 hover:bg-slate-800'
              }
            >
              <Bug className="w-4 h-4 mr-2" />
              Issue Tracking
            </Button>
          </div>
        )}

        {/* Content */}
        {nodes.length === 0 && categories.length === 0 ? (
          <GenerateRoadmapCTA 
            projectId={projectId} 
            projectTitle={project.title}
            projectDescription={project.description || ''}
            onRoadmapGenerated={handleRoadmapGenerated}
          />
        ) : viewMode === 'issues' ? (
          <IssueDashboard 
            projectId={projectId} 
            userId={userId}
          />
        ) : viewMode === 'timeline' ? (
          <GanttTimelineView 
            projectId={projectId} 
            userId={userId}
          />
        ) : viewMode === 'kanban' ? (
          <KanbanBoard 
            projectId={projectId} 
            userId={userId}
          />
        ) : categories.length > 0 ? (
          <CategoryTabs
            projectId={projectId}
            userId={userId}
            isOwner={userId === project.user_id}
          />
        ) : (
          <TimelineView
            nodes={nodes}
            selectedNode={selectedNode}
            onNodeSelect={setSelectedNode}
            onStatusUpdate={handleStatusUpdate}
            onStuck={handleStuck}
            canEdit={canEdit}
            userRole={userRole}
          />
        )}
      </main>

      {/* Right Drawer - Mentor Chat */}
      <AnimatePresence>
        {chatOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setChatOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Chat Drawer */}
            <motion.aside
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed lg:relative right-0 top-0 h-full w-full sm:w-96 bg-slate-900/95 backdrop-blur-md border-l border-slate-800/50 z-50 overflow-y-auto"
            >
              {/* Chat Header */}
              <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/50 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-violet-400" />
                  <h2 className="font-semibold text-white">ProYön AI</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setChatOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Chat Content */}
              <MentorChat
                projectId={projectId}
                selectedNode={selectedNode}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Floating Chat Toggle (Mobile/Collapsed) */}
      {!chatOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full shadow-lg shadow-violet-500/50 flex items-center justify-center z-30 neon-glow"
        >
          <MessageSquare className="w-6 h-6 text-white" />
        </motion.button>
      )}

      {/* Collaboration Modals */}
      <TeamManagement
        projectId={projectId}
        userId={userId}
        isOwner={project.user_id === userId}
        open={teamModalOpen}
        onClose={() => setTeamModalOpen(false)}
      />

      <PublicShare
        projectId={projectId}
        userId={userId}
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />

      {/* Activity Feed Modal */}
      <AnimatePresence>
        {activityOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActivityOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => setActivityOpen(false)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ActivityFeed projectId={projectId} maxHeight="70vh" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !isDeleting && setDeleteModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md glass rounded-lg p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Projeyi Sil</h3>
                  <p className="text-sm text-slate-400">Bu işlem geri alınamaz</p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-slate-300">
                <p>
                  <span className="font-semibold text-white">{project?.title}</span> projesini silmek üzeresiniz.
                </p>
                <p className="text-slate-400">
                  Bu işlem şunları kalıcı olarak silecek:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-400 ml-2">
                  <li>Tüm roadmap adımları</li>
                  <li>Tüm yorumlar ve aktiviteler</li>
                  <li>Ekip üyesi atamaları</li>
                  <li>Yüklenen dosyalar</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setDeleteModalOpen(false)}
                  variant="outline"
                  disabled={isDeleting}
                  className="flex-1"
                >
                  İptal
                </Button>
                <Button
                  onClick={handleDeleteProject}
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Siliniyor...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Evet, Sil
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
