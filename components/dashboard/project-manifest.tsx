'use client';

/**
 * 📋 Project Manifest - Left Sidebar Component
 * 
 * Displays project summary, domain badge, and key information
 */

import { motion } from 'framer-motion';
import type { Project } from '@/types';
import { GradientText } from '@/components/proyon';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  ListChecks, 
  Tag,
  Eye,
  Lock,
  FileText,
  ExternalLink
} from 'lucide-react';

interface ProjectManifestProps {
  project: Project;
  totalNodes: number;
}

const domainColors = {
  software: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  hardware: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  construction: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  research: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const statusColors = {
  planning: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  on_hold: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  completed: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  archived: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

export function ProjectManifest({ project, totalNodes }: ProjectManifestProps) {
  const formattedDate = new Date(project.created_at).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wider">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
          Project Manifest
        </div>
        
        <GradientText as="h1" className="text-2xl font-bold leading-tight">
          {project.title}
        </GradientText>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant="outline" 
            className={domainColors[project.domain_type]}
          >
            {project.domain_type.toUpperCase()}
          </Badge>
          
          <Badge 
            variant="outline" 
            className={statusColors[project.status]}
          >
            {project.status.replace('_', ' ').toUpperCase()}
          </Badge>

          {project.is_public ? (
            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
              <Eye className="w-3 h-3 mr-1" />
              Public
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-slate-500/20 text-slate-400 border-slate-500/30">
              <Lock className="w-3 h-3 mr-1" />
              Private
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Abstract */}
      {project.abstract_text && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-lg p-4 space-y-2"
        >
          <h3 className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            Abstract
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            {project.abstract_text}
          </p>
        </motion.div>
      )}

      {/* Uploaded File */}
      {project.uploaded_file_url && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="glass rounded-lg p-4 space-y-2"
        >
          <h3 className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            Yüklenen Dosya
          </h3>
          <a 
            href={project.uploaded_file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors group"
          >
            <FileText className="w-4 h-4" />
            <span className="truncate">{project.uploaded_file_name || 'Proje Dökümanı'}</span>
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </motion.div>
      )}

      {/* Description */}
      {project.description && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <h3 className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            Description
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            {project.description}
          </p>
        </motion.div>
      )}

      {/* Stats */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-2 gap-3"
      >
        <div className="glass rounded-lg p-3 space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ListChecks className="w-3.5 h-3.5" />
            Toplam Adım
          </div>
          <div className="text-xl font-bold text-white">
            {totalNodes}
          </div>
        </div>

        <div className="glass rounded-lg p-3 space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            Oluşturma
          </div>
          <div className="text-xs font-semibold text-slate-300">
            {formattedDate.split(' ').slice(0, 2).join(' ')}
          </div>
        </div>
      </motion.div>

      {/* Tags */}
      {project.tags && project.tags.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider font-semibold">
            <Tag className="w-3.5 h-3.5" />
            Etiketler
          </div>
          <div className="flex flex-wrap gap-1.5">
            {project.tags.map((tag, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="bg-slate-800/50 text-slate-400 border-slate-700/50 text-xs"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </motion.div>
      )}

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

      {/* Footer Info */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-xs text-slate-500 space-y-1"
      >
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3" />
          Son güncelleme: {new Date(project.updated_at).toLocaleDateString('tr-TR')}
        </div>
      </motion.div>
    </div>
  );
}
