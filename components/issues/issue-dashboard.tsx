'use client';

/**
 * 🐛 Issue Dashboard
 * Bug tracking ve feature request yönetimi
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bug, Sparkles, Wrench, CheckCircle2, HelpCircle, Plus,
  ThumbsUp, ThumbsDown, MessageSquare, Filter, Search,
  AlertCircle, ArrowUp, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getProjectIssues, voteOnIssue, getIssueStats } from '@/actions/issues';
import { toast } from 'sonner';
import { CreateIssueDialog } from './create-issue-dialog';

interface Issue {
  id: string;
  title: string;
  description?: string;
  issue_type: string;
  status: string;
  priority: string;
  upvotes: number;
  downvotes: number;
  created_at: string;
  reporter_id?: string;
  assigned_to?: string;
  labels?: Array<{ label: { name: string; color: string } }>;
}

interface IssueDashboardProps {
  projectId: string;
  userId: string;
}

export function IssueDashboard({ projectId, userId }: IssueDashboardProps) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    loadIssues();
  }, [projectId]);

  useEffect(() => {
    applyFilters();
  }, [issues, searchQuery, typeFilter, statusFilter, priorityFilter]);

  async function loadIssues() {
    setLoading(true);
    const result = await getProjectIssues(projectId);
    console.log('🔍 IssueDashboard loadIssues:', {
      projectId,
      success: result.success,
      issueCount: result.issues?.length || 0,
      issues: result.issues
    });
    if (result.success) {
      setIssues(result.issues);
    }
    
    // Load stats
    const statsResult = await getIssueStats(projectId);
    if (statsResult.success) {
      setStats(statsResult.stats);
    }
    
    setLoading(false);
  }

  function applyFilters() {
    let filtered = [...issues];
    console.log('🔎 Applying filters:', {
      totalIssues: issues.length,
      searchQuery,
      typeFilter,
      statusFilter,
      priorityFilter
    });
    
    // Search
    if (searchQuery) {
      filtered = filtered.filter(issue => 
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(issue => issue.issue_type === typeFilter);
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(issue => issue.status === statusFilter);
    }
    
    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(issue => issue.priority === priorityFilter);
    }
    
    console.log('✅ Filtered result:', {
      filteredCount: filtered.length,
      filtered: filtered
    });
    
    setFilteredIssues(filtered);
  }

  async function handleVote(issueId: string, voteType: 'up' | 'down') {
    const result = await voteOnIssue({ issueId, userId, voteType });
    if (result.success) {
      loadIssues();
    } else {
      toast.error(result.error);
    }
  }

  const typeIcons: Record<string, any> = {
    bug: { icon: Bug, color: 'text-red-500', bg: 'bg-red-500/10' },
    feature: { icon: Sparkles, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    improvement: { icon: Wrench, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    task: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
    question: { icon: HelpCircle, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  };

  const priorityColors: Record<string, string> = {
    low: 'bg-slate-500',
    medium: 'bg-blue-500',
    high: 'bg-orange-500',
    critical: 'bg-red-500 animate-pulse',
  };

  const statusLabels: Record<string, string> = {
    open: 'Açık',
    in_progress: 'Devam Ediyor',
    resolved: 'Çözüldü',
    closed: 'Kapatıldı',
    wont_fix: 'Düzeltilmeyecek',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Issue'lar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-lg">Issue Tracking</h2>
            <Badge variant="secondary">{issues.length} toplam</Badge>
          </div>
          
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Issue
          </Button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Bug className="w-4 h-4 text-red-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.byType.bug}</div>
                  <div className="text-xs text-muted-foreground">Bug</div>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.byType.feature}</div>
                  <div className="text-xs text-muted-foreground">Feature</div>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.byStatus.open}</div>
                  <div className="text-xs text-muted-foreground">Açık</div>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.byStatus.in_progress}</div>
                  <div className="text-xs text-muted-foreground">Devam Ediyor</div>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.byStatus.resolved}</div>
                  <div className="text-xs text-muted-foreground">Çözüldü</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Issue ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Tip" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Tipler</SelectItem>
              <SelectItem value="bug">🐛 Bug</SelectItem>
              <SelectItem value="feature">✨ Feature</SelectItem>
              <SelectItem value="improvement">🔧 Improvement</SelectItem>
              <SelectItem value="task">✓ Task</SelectItem>
              <SelectItem value="question">❓ Question</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="open">Açık</SelectItem>
              <SelectItem value="in_progress">Devam Ediyor</SelectItem>
              <SelectItem value="resolved">Çözüldü</SelectItem>
              <SelectItem value="closed">Kapatıldı</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Öncelik" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Öncelikler</SelectItem>
              <SelectItem value="low">Düşük</SelectItem>
              <SelectItem value="medium">Orta</SelectItem>
              <SelectItem value="high">Yüksek</SelectItem>
              <SelectItem value="critical">🚨 Kritik</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Issues List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-12">
            <Bug className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Issue Bulunamadı</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Filtreleri değiştirin veya yeni bir issue oluşturun
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              İlk Issue'yu Oluştur
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredIssues.map((issue) => {
              const typeConfig = typeIcons[issue.issue_type];
              const Icon = typeConfig?.icon || Bug;
              
              return (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group"
                >
                  <Card className="p-4 hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="flex items-start gap-4">
                      {/* Vote Section */}
                      <div className="flex flex-col items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleVote(issue.id, 'up')}
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </Button>
                        <span className="text-sm font-semibold">
                          {issue.upvotes - issue.downvotes}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleVote(issue.id, 'down')}
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </Button>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-2">
                          <div className={`p-2 rounded-lg ${typeConfig?.bg}`}>
                            <Icon className={`w-4 h-4 ${typeConfig?.color}`} />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{issue.title}</h3>
                              <div className={`w-2 h-2 rounded-full ${priorityColors[issue.priority]}`} />
                            </div>
                            
                            {issue.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {issue.description}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {statusLabels[issue.status]}
                              </Badge>
                              
                              {issue.labels && issue.labels.map((l: any, idx) => (
                                <Badge
                                  key={idx}
                                  style={{ backgroundColor: l.label.color + '20', color: l.label.color }}
                                  className="text-xs"
                                >
                                  {l.label.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Priority Indicator */}
                      {issue.priority === 'critical' && (
                        <div className="flex items-center gap-1 text-red-500">
                          <ArrowUp className="w-4 h-4" />
                          <AlertCircle className="w-4 h-4 animate-pulse" />
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <CreateIssueDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        projectId={projectId}
        userId={userId}
        onSuccess={loadIssues}
      />
    </div>
  );
}
