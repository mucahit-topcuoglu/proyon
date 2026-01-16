'use client';

/**
 * 📜 Activity Feed Component
 * 
 * Proje aktivite timeline'ı
 * - Son aktiviteleri gösterir
 * - Kullanıcı avatarları ile
 * - Zaman grupları (Bugün, Dün, vs.)
 * - Filter seçenekleri
 * - Real-time updates
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  User, 
  Users, 
  FolderPlus, 
  FileText, 
  CheckCircle2,
  UserPlus,
  UserMinus,
  Sparkles,
  Clock,
  Filter,
  RefreshCw
} from 'lucide-react';
import { ActivityLog, ActivityType } from '@/types';
import { getGroupedActivities } from '@/actions/activityLogs';
import { supabase } from '@/lib/supabase/client';

interface ActivityFeedProps {
  projectId: string;
  className?: string;
  maxHeight?: string;
}

// Activity icon mapping
const activityIcons: Record<ActivityType, any> = {
  [ActivityType.PROJECT_CREATED]: FolderPlus,
  [ActivityType.PROJECT_UPDATED]: FileText,
  [ActivityType.PROJECT_DELETED]: FileText,
  [ActivityType.CATEGORY_CREATED]: FolderPlus,
  [ActivityType.CATEGORY_UPDATED]: FileText,
  [ActivityType.CATEGORY_DELETED]: FileText,
  [ActivityType.NODE_CREATED]: FileText,
  [ActivityType.NODE_UPDATED]: FileText,
  [ActivityType.NODE_COMPLETED]: CheckCircle2,
  [ActivityType.NODE_DELETED]: FileText,
  [ActivityType.MEMBER_INVITED]: UserPlus,
  [ActivityType.MEMBER_JOINED]: UserPlus,
  [ActivityType.MEMBER_LEFT]: UserMinus,
  [ActivityType.MEMBER_REMOVED]: UserMinus,
  [ActivityType.MEMBER_ROLE_CHANGED]: Users,
  [ActivityType.ROADMAP_GENERATED]: Sparkles,
  [ActivityType.ROADMAP_REGENERATED]: Sparkles,
  [ActivityType.COMMENT_ADDED]: FileText,
  [ActivityType.FILE_UPLOADED]: FileText,
  [ActivityType.PROJECT_SHARED]: Users,
};

// Activity color mapping
const activityColors: Record<ActivityType, string> = {
  [ActivityType.PROJECT_CREATED]: 'text-violet-400',
  [ActivityType.PROJECT_UPDATED]: 'text-cyan-400',
  [ActivityType.PROJECT_DELETED]: 'text-red-400',
  [ActivityType.CATEGORY_CREATED]: 'text-fuchsia-400',
  [ActivityType.CATEGORY_UPDATED]: 'text-cyan-400',
  [ActivityType.CATEGORY_DELETED]: 'text-red-400',
  [ActivityType.NODE_CREATED]: 'text-blue-400',
  [ActivityType.NODE_UPDATED]: 'text-cyan-400',
  [ActivityType.NODE_COMPLETED]: 'text-green-400',
  [ActivityType.NODE_DELETED]: 'text-red-400',
  [ActivityType.MEMBER_INVITED]: 'text-violet-400',
  [ActivityType.MEMBER_JOINED]: 'text-green-400',
  [ActivityType.MEMBER_LEFT]: 'text-orange-400',
  [ActivityType.MEMBER_REMOVED]: 'text-red-400',
  [ActivityType.MEMBER_ROLE_CHANGED]: 'text-cyan-400',
  [ActivityType.ROADMAP_GENERATED]: 'text-fuchsia-400',
  [ActivityType.ROADMAP_REGENERATED]: 'text-violet-400',
  [ActivityType.COMMENT_ADDED]: 'text-blue-400',
  [ActivityType.FILE_UPLOADED]: 'text-cyan-400',
  [ActivityType.PROJECT_SHARED]: 'text-violet-400',
};

export default function ActivityFeed({ 
  projectId, 
  className = '',
  maxHeight = '600px' 
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<{
    today: ActivityLog[];
    yesterday: ActivityLog[];
    lastWeek: ActivityLog[];
    older: ActivityLog[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'team' | 'ai'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load activities
  const loadActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading activities for project:', projectId);
      
      const result = await getGroupedActivities(projectId, {
        limit: 50,
        // Filter by AI activities (roadmap generation)
        ...(filter === 'ai' && { 
          type: ActivityType.ROADMAP_GENERATED 
        }),
      });

      console.log('📥 Activities result:', result);

      if (result.success && 'grouped' in result && result.grouped) {
        setActivities(result.grouped);
        console.log('✅ Activities loaded:', {
          today: result.grouped.today.length,
          yesterday: result.grouped.yesterday.length,
          lastWeek: result.grouped.lastWeek.length,
          older: result.grouped.older.length,
        });
      } else {
        const errorMsg = result.error || 'Aktiviteler yüklenemedi';
        console.error('❌ Failed to load activities:', errorMsg);
        setError(errorMsg);
      }
    } catch (err: any) {
      console.error('❌ CRITICAL: Activity load error:', err);
      setError(err.message || 'Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [projectId, filter]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`activity_logs:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activity_logs',
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          loadActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  // Manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadActivities();
    setTimeout(() => setRefreshing(false), 500);
  };

  // Time ago helper
  const timeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Az önce';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} dakika önce`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} saat önce`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  // Activity item component
  const ActivityItem = ({ activity }: { activity: ActivityLog }) => {
    const Icon = activityIcons[activity.type] || Activity;
    const color = activityColors[activity.type] || 'text-slate-400';

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors group"
      >
        {/* Icon */}
        <div className={`w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 ${color}`}>
          <Icon className="w-4 h-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-200">
            <span className="font-medium text-white">{activity.user_name}</span>
            {' '}
            <span className="text-slate-400">{activity.action}</span>
          </p>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeAgo(activity.created_at)}
          </p>
        </div>
      </motion.div>
    );
  };

  // Group header component
  const GroupHeader = ({ title }: { title: string }) => (
    <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
      <div className="w-8 h-px bg-slate-700"></div>
      {title}
      <div className="flex-1 h-px bg-slate-700"></div>
    </div>
  );

  return (
    <div className={`bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-violet-400" />
            <h3 className="text-lg font-semibold text-white">Aktivite Geçmişi</h3>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Filter */}
            <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-violet-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tümü
              </button>
              <button
                onClick={() => setFilter('team')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  filter === 'team'
                    ? 'bg-violet-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3 h-3 inline mr-1" />
                Ekip
              </button>
              <button
                onClick={() => setFilter('ai')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  filter === 'ai'
                    ? 'bg-violet-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3 h-3 inline mr-1" />
                AI
              </button>
            </div>

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div 
        className="overflow-y-auto"
        style={{ maxHeight }}
      >
        {loading ? (
          // Loading skeleton
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3 p-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-800 rounded animate-pulse w-3/4"></div>
                  <div className="h-3 bg-slate-800 rounded animate-pulse w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Error state
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <Activity className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-red-400 text-sm font-medium">Aktiviteler yüklenemedi</p>
            <p className="text-slate-500 text-xs mt-1">{error}</p>
            <button
              onClick={() => loadActivities()}
              className="mt-4 px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white text-sm rounded-lg transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        ) : activities && (
          activities.today.length === 0 &&
          activities.yesterday.length === 0 &&
          activities.lastWeek.length === 0 &&
          activities.older.length === 0
        ) ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
              <Activity className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400 text-sm">Henüz aktivite yok</p>
            <p className="text-slate-600 text-xs mt-1">
              İlk aktivite gerçekleştiğinde burada görünecek
            </p>
          </div>
        ) : (
          <div className="p-2">
            <AnimatePresence mode="popLayout">
              {/* Today */}
              {activities && activities.today.length > 0 && (
                <div key="today">
                  <GroupHeader title="Bugün" />
                  {activities.today.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              )}

              {/* Yesterday */}
              {activities && activities.yesterday.length > 0 && (
                <div key="yesterday">
                  <GroupHeader title="Dün" />
                  {activities.yesterday.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              )}

              {/* Last Week */}
              {activities && activities.lastWeek.length > 0 && (
                <div key="lastWeek">
                  <GroupHeader title="Son 7 Gün" />
                  {activities.lastWeek.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              )}

              {/* Older */}
              {activities && activities.older.length > 0 && (
                <div key="older">
                  <GroupHeader title="Daha Eski" />
                  {activities.older.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
