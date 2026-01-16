'use client';

/**
 * 📊 Analytics Dashboard
 * 
 * Proje ilerlemelerini ve istatistikleri görselleştirir
 * - Genel istatistikler
 * - Proje bazlı ilerleme
 * - Zaman takibi
 * - Son aktiviteler
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { auth, supabase } from '@/lib/auth';
import type { Project, RoadmapNode } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GradientText } from '@/components/proyon';
import {
  ArrowLeft,
  TrendingUp,
  CheckCircle2,
  Clock,
  Target,
  Zap,
  Calendar,
  Activity,
  BarChart3,
  Flame,
  Award,
  Timer,
} from 'lucide-react';

interface ProjectStats {
  id: string;
  title: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  completionRate: number;
  totalTimeSpent: number; // minutes
  createdAt: string;
}

interface OverallStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  totalTimeSpent: number;
  averageCompletionRate: number;
  activeStreak: number; // gün
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [projectStats, setProjectStats] = useState<ProjectStats[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      setLoading(true);

      // Get user session
      const { data: sessionData } = await auth.getSession();
      if (!sessionData.session) {
        router.push('/login');
        return;
      }

      const userId = sessionData.session.user.id;
      setUser(sessionData.session.user);

      // Fetch all projects
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      // Fetch all nodes for all projects
      const { data: allNodes, error: nodesError } = await supabase
        .from('roadmap_nodes')
        .select('*')
        .in('project_id', projects?.map(p => p.id) || [])
        .order('completed_at', { ascending: false });

      if (nodesError) throw nodesError;

      // Calculate project stats
      const stats: ProjectStats[] = (projects || []).map(project => {
        const projectNodes = allNodes?.filter(n => n.project_id === project.id) || [];
        const completed = projectNodes.filter(n => n.status === 'done').length;
        const inProgress = projectNodes.filter(n => n.status === 'in_progress').length;
        const pending = projectNodes.filter(n => n.status === 'pending').length;
        const totalTime = projectNodes.reduce((sum, n) => sum + (n.actual_duration || 0), 0);

        return {
          id: project.id,
          title: project.title,
          totalTasks: projectNodes.length,
          completedTasks: completed,
          inProgressTasks: inProgress,
          pendingTasks: pending,
          completionRate: projectNodes.length > 0 ? (completed / projectNodes.length) * 100 : 0,
          totalTimeSpent: totalTime,
          createdAt: project.created_at,
        };
      });

      setProjectStats(stats);

      // Calculate overall stats
      const totalTasks = allNodes?.length || 0;
      const completedTasks = allNodes?.filter(n => n.status === 'done').length || 0;
      const inProgressTasks = allNodes?.filter(n => n.status === 'in_progress').length || 0;
      const totalTimeSpent = allNodes?.reduce((sum, n) => sum + (n.actual_duration || 0), 0) || 0;
      const avgCompletionRate = stats.length > 0
        ? stats.reduce((sum, s) => sum + s.completionRate, 0) / stats.length
        : 0;

      // Calculate streak (simplified - count days with completed tasks)
      const completedDates = allNodes
        ?.filter(n => n.completed_at)
        .map(n => new Date(n.completed_at!).toDateString()) || [];
      const uniqueDates = new Set(completedDates);
      const activeStreak = uniqueDates.size;

      setOverallStats({
        totalProjects: projects?.length || 0,
        totalTasks,
        completedTasks,
        inProgressTasks,
        totalTimeSpent,
        averageCompletionRate: avgCompletionRate,
        activeStreak,
      });

      // Recent activities (last 10 completed tasks)
      const recentCompleted = allNodes
        ?.filter(n => n.status === 'done' && n.completed_at)
        .slice(0, 10)
        .map(node => {
          const project = projects?.find(p => p.id === node.project_id);
          return {
            nodeTitle: node.title,
            projectTitle: project?.title || 'Unknown',
            completedAt: node.completed_at,
            duration: node.actual_duration || 0,
          };
        }) || [];

      setRecentActivities(recentCompleted);

    } catch (error) {
      console.error('Analytics load error:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes}dk`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}s ${mins}dk`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 animate-pulse text-violet-500" />
          <span className="text-slate-400">İstatistikler yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950/10 to-slate-950">
      {/* Page Header */}
      <div className="border-b border-slate-800 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <GradientText as="h1" className="text-3xl font-bold">
            📊 İstatistikler
          </GradientText>
          <p className="text-slate-400 mt-2">
            Proje ilerlemenizi ve performansınızı takip edin
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Overall Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-violet-500/10 to-violet-600/5 border border-violet-500/20 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <Target className="w-8 h-8 text-violet-400" />
              <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30">
                Projeler
              </Badge>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {overallStats?.totalProjects || 0}
            </div>
            <div className="text-sm text-slate-400">Toplam Proje</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <CheckCircle2 className="w-8 h-8 text-cyan-400" />
              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                Tamamlandı
              </Badge>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {overallStats?.completedTasks || 0}
              <span className="text-lg text-slate-400">
                /{overallStats?.totalTasks || 0}
              </span>
            </div>
            <div className="text-sm text-slate-400">Tamamlanan Görevler</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <Zap className="w-8 h-8 text-orange-400" />
              <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                Devam Eden
              </Badge>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {overallStats?.inProgressTasks || 0}
            </div>
            <div className="text-sm text-slate-400">Aktif Görevler</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <Flame className="w-8 h-8 text-green-400" />
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                Seri
              </Badge>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {overallStats?.activeStreak || 0}
            </div>
            <div className="text-sm text-slate-400">Gün Aktiflik</div>
          </motion.div>
        </div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Average Completion Rate */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-violet-400" />
              <h3 className="text-lg font-semibold text-white">Ortalama Tamamlanma Oranı</h3>
            </div>
            <div className="flex items-end gap-3">
              <div className="text-5xl font-bold text-white">
                {overallStats?.averageCompletionRate.toFixed(0)}%
              </div>
              <div className="pb-2">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  İyi gidiyorsun!
                </Badge>
              </div>
            </div>
            <div className="mt-4 bg-slate-800/50 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallStats?.averageCompletionRate}%` }}
                transition={{ duration: 1, delay: 0.6 }}
                className="h-full bg-gradient-to-r from-violet-500 to-cyan-500"
              />
            </div>
          </div>

          {/* Total Time Spent */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Timer className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-white">Toplam Harcanan Süre</h3>
            </div>
            <div className="flex items-end gap-3">
              <div className="text-5xl font-bold text-white">
                {formatDuration(overallStats?.totalTimeSpent || 0)}
              </div>
              <div className="pb-2">
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                  <Clock className="w-3 h-3 mr-1" />
                  Verimli!
                </Badge>
              </div>
            </div>
            <p className="text-sm text-slate-400 mt-3">
              Ortalama görev süresi:{' '}
              {overallStats?.completedTasks && overallStats.completedTasks > 0
                ? formatDuration(Math.round(overallStats.totalTimeSpent / overallStats.completedTasks))
                : '0dk'}
            </p>
          </div>
        </motion.div>

        {/* Project Progress Cards */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-5 h-5 text-violet-400" />
            <h2 className="text-xl font-semibold text-white">Proje İlerlemeleri</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {projectStats.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                className="bg-slate-900/50 border border-slate-800 hover:border-violet-500/50 rounded-xl p-6 cursor-pointer group transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white group-hover:text-violet-400 transition-colors mb-2">
                      {project.title}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-slate-700/50 text-slate-300">
                        {project.totalTasks} görev
                      </Badge>
                      <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                        {project.completedTasks} tamamlandı
                      </Badge>
                      {project.inProgressTasks > 0 && (
                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                          {project.inProgressTasks} devam ediyor
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white mb-1">
                      {project.completionRate.toFixed(0)}%
                    </div>
                    <div className="text-xs text-slate-400">
                      {formatDuration(project.totalTimeSpent)}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-slate-800/50 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${project.completionRate}%` }}
                    transition={{ duration: 1, delay: 0.7 + index * 0.1 }}
                    className="h-full bg-gradient-to-r from-violet-500 to-cyan-500"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-semibold text-white">Son Aktiviteler</h2>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
            {recentActivities.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                Henüz tamamlanmış görev yok
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {recentActivities.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.05 }}
                    className="p-4 hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-cyan-400 mt-0.5" />
                        <div>
                          <div className="text-white font-medium">{activity.nodeTitle}</div>
                          <div className="text-sm text-slate-400">{activity.projectTitle}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500">
                          {new Date(activity.completedAt).toLocaleDateString('tr-TR')}
                        </div>
                        {activity.duration > 0 && (
                          <Badge className="bg-slate-700/50 text-slate-300 text-xs mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDuration(activity.duration)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Achievement Badge (if 100% completion) */}
        {projectStats.some(p => p.completionRate === 100) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
            className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/30 rounded-xl p-6 text-center"
          >
            <Award className="w-16 h-16 text-yellow-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-white mb-2">
              🎉 Tebrikler!
            </h3>
            <p className="text-slate-300">
              {projectStats.filter(p => p.completionRate === 100).length} projenizi tamamladınız!
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
