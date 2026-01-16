'use client';

/**
 * Category Tabs Component
 * Kategorilere göre ayrılmış roadmap'leri TimelineView stilinde gösterir
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GradientText } from '@/components/proyon';
import { 
  Circle,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Play,
  Check,
  Lightbulb,
  ExternalLink,
  ListChecks,
  Wrench,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { RoadmapCategory, RoadmapNode, NodeStatus } from '@/types';
import { NodeStatus as NodeStatusEnum } from '@/types';
import { getProjectCategories, checkCategoryAccess } from '@/actions/roadmapCategories';
import { supabase } from '@/lib/supabase/client';
import { AddNodeModal } from './add-node-modal';
import { DeadlinePicker } from './deadline-picker';
import NodeComments from './node-comments';
import { getProjectMembers } from '@/actions/collaboration';

interface CategoryTabsProps {
  projectId: string;
  userId?: string;
  isOwner?: boolean;
  readOnly?: boolean;
}

export function CategoryTabs({ projectId, userId, isOwner, readOnly = false }: CategoryTabsProps) {
  const [categories, setCategories] = useState<RoadmapCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, [projectId]);

  const loadCategories = async () => {
    setLoading(true);
    const result = await getProjectCategories(projectId);
    console.log('📦 CategoryTabs loadCategories:', result);
    
    if (result.success && result.categories) {
      let visibleCategories = result.categories;
      
      // If not owner and not readOnly, filter categories by permission
      if (!readOnly && !isOwner && userId) {
        const permittedCategories = [];
        
        for (const category of result.categories) {
          const accessResult = await checkCategoryAccess(userId, category.id);
          if (accessResult.success && accessResult.hasAccess) {
            permittedCategories.push(category);
          }
        }
        
        visibleCategories = permittedCategories;
        console.log(`🔒 Kullanıcı ${permittedCategories.length}/${result.categories.length} kategoriye erişebiliyor`);
      }
      
      setCategories(visibleCategories);
      console.log(`✅ ${visibleCategories.length} kategori yüklendi`);
      
      if (visibleCategories.length > 0 && !activeCategory) {
        setActiveCategory(visibleCategories[0].id);
      }
    }
    setLoading(false);
  };

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName] || LucideIcons.Folder;
    return Icon;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500" />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto">
            <Lightbulb className="w-8 h-8 text-slate-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-400">
              Henüz Kategori Yok
            </h3>
            <p className="text-sm text-slate-500">
              Roadmap kategorileri oluşturun veya AI'ya oluşturmasını söyleyin
            </p>
          </div>
        </div>
      </div>
    );
  }

  const activeTab = categories.find((c) => c.id === activeCategory);

  return (
    <div className="py-8 px-6 lg:px-12 max-w-4xl mx-auto">
      {/* Header with Tabs */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8 space-y-4"
      >
        {/* Title */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wider">
            <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
            Multi-Roadmap
          </div>
          <GradientText as="h2" className="text-3xl font-bold">
            Proje Yol Haritaları
          </GradientText>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-800">
          {categories.map((category) => {
            const Icon = getIcon(category.icon);
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-t-lg transition-all
                  whitespace-nowrap font-medium
                  ${isActive 
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/20' 
                    : 'glass-dark text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{category.name}</span>
                {category.ai_generated && (
                  <Badge variant="secondary" className="ml-1 text-xs bg-violet-500/20 text-violet-300 border-violet-500/30">
                    AI
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Category Description */}
        {activeTab?.description && (
          <motion.p
            key={activeTab.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-slate-400"
          >
            {activeTab.description}
          </motion.p>
        )}
      </motion.div>

      {/* Category Content (Timeline Style) */}
      <AnimatePresence mode="wait">
        {activeCategory && (
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <CategoryTimeline
              categoryId={activeCategory}
              projectId={projectId}
              userId={userId}
              isOwner={isOwner}
              readOnly={readOnly}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Category Timeline - TimelineView stilinde kategori içeriği
// ============================================================================

interface CategoryTimelineProps {
  categoryId: string;
  projectId: string;
  userId?: string;
  isOwner?: boolean;
  readOnly?: boolean;
}

function CategoryTimeline({ categoryId, projectId, userId, isOwner = false, readOnly = false }: CategoryTimelineProps) {
  const [nodes, setNodes] = useState<RoadmapNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [userPermissions, setUserPermissions] = useState<{
    can_edit: boolean;
    can_delete: boolean;
    can_manage: boolean;
  } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadNodes();
    loadProjectMembers();
    if (!isOwner) {
      loadPermissions();
    }
  }, [categoryId]);

  const loadProjectMembers = async () => {
    const result = await getProjectMembers(projectId);
    if (result.success && result.members) {
      setProjectMembers(result.members);
    }
  };

  const loadPermissions = async () => {
    if (!userId) {
      setUserPermissions({ can_edit: false, can_delete: false, can_manage: false });
      return;
    }
    const result = await checkCategoryAccess(userId, categoryId);
    if (result.success && result.permissions) {
      setUserPermissions(result.permissions);
    } else {
      // Eğer izin yoksa hiçbir şey yapamaz
      setUserPermissions({ can_edit: false, can_delete: false, can_manage: false });
    }
  };

  useEffect(() => {
    loadNodes();
  }, [categoryId]);

  const loadNodes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('roadmap_nodes')
        .select('*')
        .eq('project_id', projectId)
        .eq('category_id', categoryId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setNodes(data as RoadmapNode[]);
    } catch (error) {
      console.error('Node yükleme hatası:', error);
    }
    setLoading(false);
  };

  const updateNodeStatus = async (nodeId: string, newStatus: NodeStatus) => {
    try {
      // Önce node bilgilerini al
      const node = nodes.find(n => n.id === nodeId);
      
      const { error } = await supabase
        .from('roadmap_nodes')
        // @ts-ignore - Supabase type issue
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', nodeId);

      if (error) throw error;

      // Local state'i güncelle
      setNodes((prev) =>
        prev.map((node) =>
          node.id === nodeId ? { ...node, status: newStatus } : node
        )
      );
      
      // Log activity if completed
      if (newStatus === NodeStatusEnum.DONE && node) {
        const { logNodeCompleted } = await import('@/actions/activityLogs');
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await logNodeCompleted({
            projectId: projectId,
            userId: user.id,
            nodeTitle: node.title,
            nodeId: nodeId,
          });
        }
      }
    } catch (error) {
      console.error('Status update hatası:', error);
      alert('Durum güncellenirken hata oluştu');
    }
  };

  const toggleExpand = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const getStatusIcon = (status: NodeStatus) => {
    switch (status) {
      case 'done':
        return <CheckCircle2 className="w-5 h-5 text-cyan-400" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-violet-400 animate-pulse" />;
      default:
        return <Circle className="w-5 h-5 text-slate-600" />;
    }
  };

  const getStatusColor = (status: NodeStatus) => {
    switch (status) {
      case 'done':
        return 'border-cyan-500/50 bg-cyan-500/5';
      case 'in_progress':
        return 'border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/20';
      default:
        return 'border-slate-800/50 bg-slate-900/30';
    }
  };

  const getDifficultyColor = (priority: number) => {
    if (priority === 2) return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (priority === 1) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  const getDifficultyLabel = (priority: number) => {
    if (priority === 2) return 'KRİTİK';
    if (priority === 1) return 'YÜKSEK';
    return 'NORMAL';
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}s ${mins}dk`;
    return `${mins}dk`;
  };

  // Parse markdown links from text
  const parseMarkdownLinks = (text: string) => {
    if (!text) return null;
    
    const parts: (string | { type: 'link'; text: string; url: string })[] = [];
    const linkRegex = /\[([^\]]+)\]\(([^\)]+)\)/g;
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push({ type: 'link', text: match[1], url: match[2] });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
  };

  // Render text with clickable links
  const renderTextWithLinks = (text: string) => {
    const parts = parseMarkdownLinks(text);
    if (!parts) return text;

    return (
      <>
        {parts.map((part, idx) => {
          if (typeof part === 'string') {
            return <span key={idx}>{part}</span>;
          }
          return (
            <a
              key={idx}
              href={part.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors"
            >
              {part.text}
              <ExternalLink className="w-3 h-3" />
            </a>
          );
        })}
      </>
    );
  };

  // Parse code blocks from text
  const renderTechnicalRequirements = (text: string) => {
    if (!text) return null;

    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeLines: string[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLines = [];
        } else {
          inCodeBlock = false;
          elements.push(
            <div key={`code-${idx}`} className="bg-slate-950 border border-slate-700 rounded-lg p-3 my-2 overflow-x-auto">
              <code className="text-xs text-cyan-300 font-mono whitespace-pre">
                {codeLines.join('\n')}
              </code>
            </div>
          );
          codeLines = [];
        }
        return;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        return;
      }

      if (trimmed.match(/^[🔧📦📁⚙️🔗❌✅]/)) {
        elements.push(
          <div key={idx} className="font-semibold text-cyan-300 mt-3 first:mt-0">
            {renderTextWithLinks(trimmed)}
          </div>
        );
        return;
      }

      if (trimmed.startsWith('•')) {
        elements.push(
          <div key={idx} className="flex gap-2 pl-2">
            <span className="text-violet-400 text-xs mt-0.5">•</span>
            <span>{renderTextWithLinks(trimmed.substring(1).trim())}</span>
          </div>
        );
        return;
      }

      if (trimmed) {
        elements.push(
          <div key={idx} className="pl-2">
            {renderTextWithLinks(trimmed)}
          </div>
        );
      }
    });

    return <div className="space-y-1">{elements}</div>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto">
            <Lightbulb className="w-8 h-8 text-slate-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-400">
              Bu kategoride henüz adım yok
            </h3>
            <p className="text-sm text-slate-500">
              {isOwner ? 'Yeni adımlar ekleyerek başlayın' : 'Proje sahibi henüz adım eklememiş'}
            </p>
          </div>
          {!readOnly && (isOwner || (userPermissions && userPermissions.can_edit)) && (
            <Button
              onClick={() => setShowAddModal(true)}
              className="mt-4"
            >
              <Circle className="w-4 h-4 mr-2" />
              Adım Ekle
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 relative">
      {/* Vertical Line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-slate-800 via-slate-700 to-slate-800" />

      {/* Progress Info */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {nodes.filter((n) => n.status === 'done').length} / {nodes.length} adım tamamlandı
        </p>
        
        {/* Tüm Adımları Zenginleştir Butonu */}
        {!readOnly && isOwner && (
          <Button
            size="sm"
            variant="outline"
            className="gap-2 text-violet-400 border-violet-500/30 hover:bg-violet-500/10"
            onClick={async () => {
              if (!confirm('Tüm adımlar AI ile zenginleştirilecek. Bu işlem birkaç dakika sürebilir. Devam etmek istiyor musunuz?')) return;
              
              try {
                const { enrichAllProjectNodes } = await import('@/actions/generateRoadmap');
                const result = await enrichAllProjectNodes(projectId);
                
                if (result.success) {
                  alert(`✅ ${result.updatedCount} adım başarıyla zenginleştirildi!`);
                  loadNodes(); // Yeniden yükle
                } else {
                  alert('❌ Hata: ' + result.error);
                }
              } catch (error: any) {
                alert('❌ Hata: ' + error.message);
              }
            }}
          >
            <span>🚀</span>
            Tüm Adımları Zenginleştir
          </Button>
        )}
      </div>

      {/* Timeline Items */}
      {nodes.map((node, index) => {
        const isExpanded = expandedNodes.has(node.id);

        return (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative pl-16"
          >
            {/* Node Icon */}
            <div
              className={`
                absolute left-0 w-12 h-12 rounded-full border-2 
                flex items-center justify-center
                ${getStatusColor(node.status as NodeStatus)}
                ${node.status === 'in_progress' ? 'ring-4 ring-violet-500/20' : ''}
              `}
            >
              {getStatusIcon(node.status as NodeStatus)}
            </div>

            {/* Node Card */}
            <div className={`glass rounded-xl border ${getStatusColor(node.status as NodeStatus)} p-5 space-y-4`}>
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  {/* Title */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500">#{index + 1}</span>
                    <h3 className="text-lg font-semibold text-white">{node.title}</h3>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    {/* Status Badge */}
                    <Badge
                      variant="outline"
                      className={`
                        ${node.status === 'done' ? 'border-cyan-500/50 text-cyan-400' : ''}
                        ${node.status === 'in_progress' ? 'border-violet-500 text-violet-400' : ''}
                        ${node.status === 'pending' ? 'border-slate-600 text-slate-400' : ''}
                      `}
                    >
                      {node.status === 'done' && 'Tamamlandı'}
                      {node.status === 'in_progress' && 'Devam Ediyor'}
                      {node.status === 'pending' && 'Bekliyor'}
                    </Badge>

                    {/* Difficulty */}
                    <Badge variant="outline" className={getDifficultyColor(node.priority)}>
                      {getDifficultyLabel(node.priority)}
                    </Badge>

                    {/* Duration */}
                    {node.estimated_duration && (
                      <div className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{formatDuration(node.estimated_duration)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expand Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpand(node.id)}
                  className="text-slate-400 hover:text-white"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-5 pt-4 border-t border-slate-800"
                  >
                    {/* Description - Nasıl Yapılır */}
                    {node.description && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 p-1.5 rounded-lg">
                            <ListChecks className="w-4 h-4 text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-white">Adım Adım Rehber</h3>
                        </div>
                        
                        <div className="grid gap-4">
                          {node.description.split('\n\n').map((section, sectionIdx) => {
                            const lines = section.trim().split('\n');
                            const headerLine = lines[0]?.trim();
                            
                            // Başlık tespit et
                            let sectionType = null;
                            let sectionTitle = '';
                            let sectionIcon = null;
                            let sectionColor = '';
                            let sectionBg = '';
                            let sectionBorder = '';
                            
                            if (headerLine.startsWith('## ')) {
                              sectionTitle = headerLine.replace('## ', '');
                            } else if (/^[🎯📋✅🔧💡📦🛠️💎⚠️]/.test(headerLine)) {
                              sectionTitle = headerLine.replace(/^[🎯📋✅🔧💡📦🛠️💎⚠️]\s*/, '');
                            }
                            
                            // Section type'ı belirle
                            if (sectionTitle.includes('Ne Yapılacak') || sectionTitle.includes('What to Do')) {
                              sectionType = 'what';
                              sectionColor = 'text-blue-400';
                              sectionBg = 'bg-blue-500/10';
                              sectionBorder = 'border-blue-500/30';
                              sectionIcon = '📋';
                            } else if (sectionTitle.includes('Nasıl') || sectionTitle.includes('How')) {
                              sectionType = 'how';
                              sectionColor = 'text-emerald-400';
                              sectionBg = 'bg-emerald-500/10';
                              sectionBorder = 'border-emerald-500/30';
                              sectionIcon = '🔧';
                            } else if (sectionTitle.includes('Neden') || sectionTitle.includes('Why')) {
                              sectionType = 'why';
                              sectionColor = 'text-amber-400';
                              sectionBg = 'bg-amber-500/10';
                              sectionBorder = 'border-amber-500/30';
                              sectionIcon = '💡';
                            } else if (sectionTitle.includes('Çıktı') || sectionTitle.includes('Deliverable')) {
                              sectionType = 'deliverable';
                              sectionColor = 'text-purple-400';
                              sectionBg = 'bg-purple-500/10';
                              sectionBorder = 'border-purple-500/30';
                              sectionIcon = '📦';
                            } else if (sectionTitle.includes('Kaynak') || sectionTitle.includes('Resource')) {
                              sectionType = 'resource';
                              sectionColor = 'text-cyan-400';
                              sectionBg = 'bg-cyan-500/10';
                              sectionBorder = 'border-cyan-500/30';
                              sectionIcon = '🛠️';
                            } else if (sectionTitle.includes('İpuç') || sectionTitle.includes('Tip')) {
                              sectionType = 'tip';
                              sectionColor = 'text-pink-400';
                              sectionBg = 'bg-pink-500/10';
                              sectionBorder = 'border-pink-500/30';
                              sectionIcon = '💎';
                            }
                            
                            if (!sectionType) return null;
                            
                            const contentLines = lines.slice(1);
                            
                            return (
                              <div key={sectionIdx} className={`${sectionBg} ${sectionBorder} border rounded-xl p-5 hover:shadow-lg hover:scale-[1.01] transition-all duration-200`}>
                                <div className="flex items-start gap-3 mb-4">
                                  <span className="text-2xl mt-0.5">{sectionIcon}</span>
                                  <h4 className={`text-base font-semibold ${sectionColor}`}>{sectionTitle}</h4>
                                </div>
                                
                                <div className="space-y-2.5 pl-10">
                                  {contentLines.map((line, lineIdx) => {
                                    const cleanLine = line.trim();
                                    if (!cleanLine) return null;
                                    
                                    // Numaralı listeler
                                    if (/^\d+[\.\)]/.test(cleanLine)) {
                                      const number = cleanLine.match(/^\d+/)?.[0];
                                      const text = cleanLine.replace(/^\d+[\.\)]\s*/, '');
                                      return (
                                        <div key={lineIdx} className="flex gap-3 group">
                                          <div className={`${sectionBg} border ${sectionBorder} rounded-lg w-7 h-7 flex items-center justify-center font-bold text-sm ${sectionColor} flex-shrink-0`}>
                                            {number}
                                          </div>
                                          <p className="text-slate-200 leading-relaxed pt-0.5 flex-1">
                                            {renderTextWithLinks(text)}
                                          </p>
                                        </div>
                                      );
                                    }
                                    
                                    // Alt adımlar
                                    if (/^\d+\.\d+[\.\)]/.test(cleanLine)) {
                                      const text = cleanLine.replace(/^\d+\.\d+[\.\)]\s*/, '');
                                      return (
                                        <div key={lineIdx} className="flex gap-2.5 pl-10">
                                          <span className={`${sectionColor} mt-1.5`}>→</span>
                                          <span className="text-slate-300 text-sm leading-relaxed">
                                            {renderTextWithLinks(text)}
                                          </span>
                                        </div>
                                      );
                                    }
                                    
                                    // Bullet points
                                    if (cleanLine.startsWith('-') || cleanLine.startsWith('•')) {
                                      const text = cleanLine.replace(/^[-•]\s*/, '');
                                      return (
                                        <div key={lineIdx} className="flex gap-2.5">
                                          <span className={`${sectionColor} mt-1`}>•</span>
                                          <span className="text-slate-200 text-sm leading-relaxed flex-1">
                                            {renderTextWithLinks(text)}
                                          </span>
                                        </div>
                                      );
                                    }
                                    
                                    // Normal satır
                                    return (
                                      <p key={lineIdx} className="text-slate-200 text-sm leading-relaxed">
                                        {renderTextWithLinks(cleanLine)}
                                      </p>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Technical Requirements */}
                    {node.technical_requirements && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-1.5 rounded-lg">
                            <Wrench className="w-4 h-4 text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-white">Teknik Dokümantasyon</h3>
                        </div>
                        <div className="bg-slate-900/80 border border-cyan-500/30 rounded-xl p-5 shadow-lg">
                          <div className="text-sm text-slate-200 leading-relaxed font-mono">
                            {renderTechnicalRequirements(node.technical_requirements)}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Rationale */}
                    {node.rationale && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-1.5 rounded-lg">
                            <Lightbulb className="w-4 h-4 text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-white">Neden Gerekli?</h3>
                        </div>
                        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-5 shadow-lg">
                          <p className="text-sm text-slate-200 leading-relaxed">
                            {renderTextWithLinks(node.rationale)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Deadline Picker */}
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Deadline
                      </h4>
                      <DeadlinePicker
                        nodeId={node.id}
                        currentDeadline={node.deadline}
                        nodeStatus={node.status}
                        userId={userId}
                        onUpdate={loadNodes}
                      />
                    </div>

                    {/* Comments Section */}
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                        Yorumlar
                      </h4>
                      <NodeComments
                        nodeId={node.id}
                        projectId={projectId}
                        userId={userId}
                        projectMembers={projectMembers}
                      />
                    </div>

                    {/* Action Buttons */}
                    {!readOnly && (isOwner || (userPermissions && userPermissions.can_edit)) && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {/* Status Actions */}
                        {node.status === 'pending' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="gap-2"
                            onClick={() => updateNodeStatus(node.id, NodeStatusEnum.IN_PROGRESS)}
                          >
                            <Play className="w-3 h-3" />
                            Başla
                          </Button>
                        )}
                        {node.status === 'in_progress' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="gap-2"
                              onClick={() => updateNodeStatus(node.id, NodeStatusEnum.DONE)}
                            >
                              <Check className="w-3 h-3" />
                              Tamamla
                            </Button>
                            <Button size="sm" variant="outline" className="gap-2 text-amber-400">
                              <AlertCircle className="w-3 h-3" />
                              Takıldım
                            </Button>
                          </>
                        )}
                        

                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}
    </div>

    {/* Add Node Modal */}
    {showAddModal && (
      <AddNodeModal
        categoryId={categoryId}
        projectId={projectId}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          loadNodes(); // Reload nodes after adding
        }}
      />
    )}
    </>
  );
}
