'use client';

/**
 * ⏱️ Timeline View - Center Component
 * 
 * Interactive vertical stepper with roadmap nodes
 * Features:
 * - Pending (Grey/Opacity 50%)
 * - In Progress (Neon Purple Border + Pulse)
 * - Done (Green/Cyan)
 * - Expandable details
 * - "I'm Stuck" button on active nodes
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RoadmapNode } from '@/types';
import { NodeStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Wrench,
  ExternalLink,
  ListChecks,
} from 'lucide-react';

interface TimelineViewProps {
  nodes: RoadmapNode[];
  selectedNode: RoadmapNode | null;
  onNodeSelect: (node: RoadmapNode | null) => void;
  onStatusUpdate: (nodeId: string, status: string) => void;
  onStuck: (node: RoadmapNode) => void;
  canEdit?: boolean;
  userRole?: 'owner' | 'editor' | 'viewer' | null;
}

export function TimelineView({
  nodes,
  selectedNode,
  onNodeSelect,
  onStatusUpdate,
  onStuck,
  canEdit = true,
  userRole = 'owner',
}: TimelineViewProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

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
      // Add text before link
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      // Add link
      parts.push({ type: 'link', text: match[1], url: match[2] });
      lastIndex = match.index + match[0].length;
    }
    // Add remaining text
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
    let currentLanguage = '';

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      
      // Code block başlangıcı (```bash, ```sql, etc)
      if (trimmed.startsWith('```')) {
        if (!inCodeBlock) {
          // Code block başlıyor
          inCodeBlock = true;
          currentLanguage = trimmed.substring(3);
          codeLines = [];
        } else {
          // Code block bitiyor
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

      // Başlıklar (🔧, 📦, 📁, ⚙️, 🔗, ❌, ✅)
      if (trimmed.match(/^[🔧📦📁⚙️🔗❌✅]/)) {
        elements.push(
          <div key={idx} className="font-semibold text-cyan-300 mt-3 first:mt-0">
            {renderTextWithLinks(trimmed)}
          </div>
        );
        return;
      }

      // Bullet points (•)
      if (trimmed.startsWith('•')) {
        elements.push(
          <div key={idx} className="flex gap-2 pl-2">
            <span className="text-violet-400 text-xs mt-0.5">•</span>
            <span>{renderTextWithLinks(trimmed.substring(1).trim())}</span>
          </div>
        );
        return;
      }

      // Normal lines
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

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto">
            <Lightbulb className="w-8 h-8 text-slate-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-400">
              Henüz Roadmap Oluşturulmamış
            </h3>
            <p className="text-sm text-slate-500">
              AI ile otomatik roadmap oluşturmak için proje ayarlarına gidin.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-6 lg:px-12 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8 space-y-2"
      >
        <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wider">
          <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
          The Timeline
        </div>
        <GradientText as="h2" className="text-3xl font-bold">
          Proje Yol Haritası
        </GradientText>
        <p className="text-sm text-slate-400">
          {nodes.filter(n => n.status === 'done').length} / {nodes.length} adım tamamlandı
        </p>
      </motion.div>

      {/* Timeline Items */}
      <div className="space-y-4 relative">
        {/* Vertical Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-slate-800 via-slate-700 to-slate-800" />

        {nodes.map((node, index) => {
          const isExpanded = expandedNodes.has(node.id);
          const isActive = node.status === 'in_progress';

          return (
            <motion.div
              key={node.id}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="relative"
            >
              {/* Timeline Dot */}
              <div className="absolute left-6 top-6 -translate-x-1/2 z-10">
                {getStatusIcon(node.status)}
              </div>

              {/* Node Card */}
              <motion.div
                whileHover={{ scale: 1.02, x: 4 }}
                className={`ml-12 glass rounded-lg border-2 transition-all duration-300 ${getStatusColor(
                  node.status
                )} ${node.status === 'pending' ? 'opacity-50' : 'opacity-100'}`}
              >
                {/* Card Header */}
                <button
                  onClick={() => toggleExpand(node.id)}
                  className="w-full p-4 text-left hover:bg-white/5 transition-colors rounded-t-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="bg-slate-800/50 text-slate-400 border-slate-700/50 text-xs"
                        >
                          Adım {node.order_index}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getDifficultyColor(node.priority)}`}
                        >
                          {getDifficultyLabel(node.priority)}
                        </Badge>
                      </div>

                      <h3
                        className={`text-lg font-semibold ${
                          node.status === 'done'
                            ? 'text-cyan-400'
                            : node.status === 'in_progress'
                            ? 'text-white'
                            : 'text-slate-400'
                        }`}
                      >
                        {node.title}
                      </h3>

                      {node.description && (
                        <p className="text-sm text-slate-400 line-clamp-2">
                          {node.description}
                        </p>
                      )}

                      {/* Duration */}
                      {node.estimated_duration && (
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Tahmini: {formatDuration(node.estimated_duration)}
                          </div>
                          {node.actual_duration && (
                            <div className="flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Gerçek: {formatDuration(node.actual_duration)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="w-5 h-5 text-slate-500" />
                    </motion.div>
                  </div>
                </button>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 space-y-5 border-t border-slate-800/50">
                        {/* Description - Nasıl Yapılır */}
                        {node.description && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-violet-400 uppercase tracking-wider font-semibold">
                              <ListChecks className="w-3.5 h-3.5" />
                              Adım Adım Rehber
                            </div>
                            <div className="bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 rounded-lg p-4">
                              <div className="text-sm text-slate-200 leading-relaxed space-y-2">
                                {node.description.split('\n').map((line, idx) => {
                                  // Remove markdown formatting for display
                                  const cleanLine = line.trim();
                                  
                                  // Başlıklar (🎯, 📋, ✅)
                                  if (cleanLine.startsWith('🎯') || cleanLine.startsWith('📋') || cleanLine.startsWith('✅')) {
                                    return (
                                      <div key={idx} className="font-semibold text-violet-300 mt-3 first:mt-0">
                                        {renderTextWithLinks(cleanLine)}
                                      </div>
                                    );
                                  }
                                  
                                  // Alt adımlar (1.1), 1.2) gibi)
                                  if (/^\d+\.\d+\)/.test(cleanLine)) {
                                    return (
                                      <div key={idx} className="flex gap-2 pl-2">
                                        <span className="text-cyan-400 font-mono text-xs mt-0.5">•</span>
                                        <span>{renderTextWithLinks(cleanLine)}</span>
                                      </div>
                                    );
                                  }
                                  
                                  // Normal satırlar
                                  if (cleanLine) {
                                    return (
                                      <div key={idx} className="pl-2">
                                        {renderTextWithLinks(cleanLine)}
                                      </div>
                                    );
                                  }
                                  
                                  return null;
                                })}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Technical Requirements */}
                        {node.technical_requirements && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-cyan-400 uppercase tracking-wider font-semibold">
                              <Wrench className="w-3.5 h-3.5" />
                              Teknik Dokümantasyon
                            </div>
                            <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-4">
                              <div className="text-sm text-slate-300 leading-relaxed">
                                {renderTechnicalRequirements(node.technical_requirements)}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Rationale */}
                        {node.rationale && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-amber-400 uppercase tracking-wider font-semibold">
                              <Lightbulb className="w-3.5 h-3.5" />
                              Neden Gerekli?
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                              {renderTextWithLinks(node.rationale)}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        {canEdit && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {node.status === 'pending' && (
                              <Button
                                onClick={() => onStatusUpdate(node.id, 'in_progress')}
                                size="sm"
                                className="bg-violet-600 hover:bg-violet-700 text-white"
                              >
                                <Play className="w-3.5 h-3.5 mr-1.5" />
                                Başla
                              </Button>
                            )}

                            {node.status === 'in_progress' && (
                              <>
                                <Button
                                  onClick={() => onStatusUpdate(node.id, 'done')}
                                  size="sm"
                                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                                >
                                  <Check className="w-3.5 h-3.5 mr-1.5" />
                                  Tamamla
                                </Button>

                                <Button
                                  onClick={() => onStuck(node)}
                                  size="sm"
                                  variant="outline"
                                  className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 neon-glow"
                                >
                                  <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                                  Takıldım
                                </Button>
                              </>
                            )}
                          </div>
                        )}
                        
                        {!canEdit && (
                          <div className="pt-2">
                            <Badge variant="outline" className="text-amber-400 border-amber-500/50">
                              Görüntüleme Modu - {userRole === 'viewer' ? 'İzleyici' : 'Düzenleyici (Salt Okunur)'}
                            </Badge>
                          </div>
                        )}

                        {/* Status Badge for completed nodes */}
                        {node.status === 'done' && (
                          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 mt-2">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Tamamlandı
                          </Badge>
                        )}

                        {/* Timestamps */}
                        {(node.started_at || node.completed_at) && (
                          <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-800/30">
                            {node.started_at && (
                              <div>
                                Başlangıç:{' '}
                                {new Date(node.started_at).toLocaleString('tr-TR')}
                              </div>
                            )}
                            {node.completed_at && (
                              <div>
                                Bitiş:{' '}
                                {new Date(node.completed_at).toLocaleString('tr-TR')}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Completion Message */}
      {nodes.every(n => n.status === 'done') && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className="mt-8 glass rounded-lg p-6 text-center border-2 border-cyan-500/50"
        >
          <div className="text-4xl mb-3">🎉</div>
          <GradientText as="h3" className="text-xl font-bold mb-2">
            Tebrikler!
          </GradientText>
          <p className="text-slate-400">
            Tüm adımları başarıyla tamamladınız!
          </p>
        </motion.div>
      )}
    </div>
  );
}
