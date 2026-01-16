'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { auth, supabase } from '@/lib/auth';
import type { Project } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { deleteProject } from '@/actions/deleteProject';
import { 
  Plus, 
  Loader2, 
  FolderKanban,
  Calendar,
  Tag,
  ChevronRight,
  FileText,
  Trash2,
} from 'lucide-react';

export default function ProjectsListPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserAndProjects() {
      try {
        const { data: sessionData } = await auth.getSession();
        
        if (!sessionData.session) {
          // Not logged in, redirect to login
          window.location.href = '/login';
          return;
        }

        const user = sessionData.session.user;
        setUser(user);

        // Load user's projects (owned + member of)
        // First get owned projects
        const { data: ownedProjects, error: ownedError } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (ownedError) throw ownedError;

        // Then get projects user is a member of
        const { data: memberProjects, error: memberError } = await supabase
          .from('project_members')
          .select(`
            project_id,
            role,
            projects (*)
          `)
          .eq('user_id', user.id);

        if (memberError) throw memberError;

        // Combine both lists (owned + member)
        const allProjects = [
          ...(ownedProjects || []),
          ...(memberProjects || []).map((m: any) => ({
            ...m.projects,
            role: m.role, // Add role info for UI
            is_member: true, // Flag to show it's not owned
          }))
        ];

        // Remove duplicates (if user is both owner and member somehow)
        const uniqueProjects = allProjects.filter((project, index, self) =>
          index === self.findIndex((p) => p.id === project.id)
        );

        setProjects(uniqueProjects || []);
      } catch (err) {
        console.error('Error loading projects:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUserAndProjects();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    window.location.href = '/login';
  };

  const handleDeleteProject = async (projectId: string, projectTitle: string, e: React.MouseEvent) => {
    e.preventDefault(); // Link'in çalışmasını engelle
    e.stopPropagation();
    
    if (!confirm(`"${projectTitle}" projesini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }
    
    setDeletingId(projectId);
    
    try {
      const result = await deleteProject(projectId, user.id);
      
      if (result.success) {
        // Projeyi listeden kaldır
        setProjects(projects.filter(p => p.id !== projectId));
      } else {
        alert(result.error || 'Proje silinirken hata oluştu');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Beklenmeyen bir hata oluştu');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950/10 to-slate-950">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Projelerim</h2>
            <p className="text-slate-400">
              {projects.length > 0
                ? `${projects.length} proje`
                : 'Henüz bir proje oluşturmadınız'}
            </p>
          </div>

          <Link href="/projects/new">
            <Button className="bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Proje
            </Button>
          </Link>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-slate-900/30 border border-slate-800 rounded-2xl"
          >
            <FolderKanban className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              İlk projenizi oluşturun
            </h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Yeni bir proje başlatın ve AI yardımıyla adım adım ilerleyin
            </p>
            <Link href="/projects/new">
              <Button className="bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Yeni Proje Oluştur
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/dashboard/projects/${project.id}`}>
                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-violet-500/50 transition-all cursor-pointer group relative">
                    {/* Silme Butonu */}
                    <button
                      onClick={(e) => handleDeleteProject(project.id, project.title, e)}
                      disabled={deletingId === project.id}
                      className="absolute top-4 right-4 p-2 bg-slate-800/50 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/50 rounded-lg transition-all opacity-0 group-hover:opacity-100 z-10"
                      title="Projeyi Sil"
                    >
                      {deletingId === project.id ? (
                        <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-400 transition-colors" />
                      )}
                    </button>

                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">
                        {project.domain_type}
                      </Badge>
                      <Badge
                        className={
                          project.status === 'active'
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                        }
                      >
                        {project.status}
                      </Badge>
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-violet-400 transition-colors">
                      {project.title}
                    </h3>
                    
                    <div className="relative">
                      <p className="text-sm text-slate-400 mb-2 line-clamp-3">
                        {project.abstract_text || project.description}
                      </p>
                      
                      {/* Devamını Oku Link - Her zaman göster eğer 3 satırdan fazlaysa */}
                      <div className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors cursor-pointer">
                        <FileText className="w-3 h-3" />
                        <span>Devamını oku</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(project.created_at).toLocaleDateString('tr-TR')}
                      </div>
                      {project.tags && project.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {project.tags.length} tag
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-sm text-slate-400">
                        Dashboard'ı Aç
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-violet-400 transition-colors" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
