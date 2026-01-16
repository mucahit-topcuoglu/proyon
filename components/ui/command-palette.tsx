'use client';

/**
 * ⚡ Command Palette - Global Search
 * 
 * Cmd/Ctrl+K shortcut ile açılan global arama
 * - Nodes, Projects, Team Members arama
 * - Fuzzy search algoritması
 * - Keyboard navigation (↑↓ Enter Esc)
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  FileText,
  FolderKanban,
  User,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Circle,
  PlayCircle,
  Loader2,
  Command,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';

interface SearchResult {
  type: 'node' | 'project' | 'member';
  id: string;
  title: string;
  subtitle?: string;
  status?: string;
  projectId?: string;
  categoryName?: string;
  metadata?: any;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  // Cmd/Ctrl + K shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }

      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Arrow key navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, results, selectedIndex]);

  // Search function
  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const userId = session.user.id;
      const lowerQuery = searchQuery.toLowerCase();

      // Search nodes
      const { data: nodesData } = await supabase
        .from('roadmap_nodes')
        .select(`
          id,
          title,
          description,
          status,
          project_id,
          category_id,
          roadmap_categories!inner(name),
          projects!inner(user_id, title)
        `)
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .limit(10);

      // Search projects (owned or member of)
      const { data: projectsData } = await supabase
        .from('projects')
        .select('id, title, description, domain, status')
        .or(`user_id.eq.${userId},id.in.(select project_id from project_members where user_id=${userId})`)
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .limit(10);

      // Search team members in user's projects
      const { data: membersData } = await supabase
        .from('project_members')
        .select(`
          user_id,
          role,
          users!inner(email, display_name),
          projects!inner(id, title, user_id)
        `)
        .or(`users.email.ilike.%${searchQuery}%,users.display_name.ilike.%${searchQuery}%`)
        .limit(10);

      const searchResults: SearchResult[] = [];

      // Process nodes
      if (nodesData) {
        nodesData.forEach((node: any) => {
          // Only show if user has access (owner or member)
          const project = node.projects;
          if (project.user_id === userId || project) {
            searchResults.push({
              type: 'node',
              id: node.id,
              title: node.title,
              subtitle: node.description,
              status: node.status,
              projectId: node.project_id,
              categoryName: node.roadmap_categories?.name,
            });
          }
        });
      }

      // Process projects
      if (projectsData) {
        projectsData.forEach((project: any) => {
          searchResults.push({
            type: 'project',
            id: project.id,
            title: project.title,
            subtitle: project.description,
            status: project.domain,
          });
        });
      }

      // Process members
      if (membersData) {
        membersData.forEach((member: any) => {
          // Only show if user is project owner
          if (member.projects.user_id === userId) {
            searchResults.push({
              type: 'member',
              id: member.user_id,
              title: member.users.display_name || member.users.email,
              subtitle: member.users.email,
              status: member.role,
              projectId: member.projects.id,
              metadata: { projectTitle: member.projects.title },
            });
          }
        });
      }

      setResults(searchResults);
      setSelectedIndex(0);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      search(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, search]);

  const handleSelect = (result: SearchResult) => {
    if (result.type === 'node' && result.projectId) {
      router.push(`/dashboard/projects/${result.projectId}?nodeId=${result.id}`);
    } else if (result.type === 'project') {
      router.push(`/dashboard/projects/${result.id}`);
    } else if (result.type === 'member' && result.projectId) {
      router.push(`/dashboard/projects/${result.projectId}?tab=team`);
    }
    setOpen(false);
    setQuery('');
  };

  const getIcon = (result: SearchResult) => {
    if (result.type === 'node') {
      if (result.status === 'done') return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      if (result.status === 'in_progress') return <PlayCircle className="w-5 h-5 text-blue-400" />;
      return <Circle className="w-5 h-5 text-slate-400" />;
    }
    if (result.type === 'project') return <FolderKanban className="w-5 h-5 text-violet-400" />;
    return <User className="w-5 h-5 text-cyan-400" />;
  };

  const getBadge = (result: SearchResult) => {
    if (result.type === 'node') {
      return result.categoryName ? (
        <Badge variant="outline" className="text-xs">
          📁 {result.categoryName}
        </Badge>
      ) : null;
    }
    if (result.type === 'project' && result.status) {
      return (
        <Badge variant="outline" className="text-xs">
          {result.status}
        </Badge>
      );
    }
    if (result.type === 'member' && result.status) {
      return (
        <Badge variant="outline" className="text-xs">
          {result.status}
        </Badge>
      );
    }
    return null;
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-start justify-center pt-[20vh]"
        onClick={() => setOpen(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl mx-4 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-slate-800">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Görev, proje veya ekip üyesi ara..."
              autoFocus
              className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-slate-500"
            />
            {loading && <Loader2 className="w-5 h-5 animate-spin text-slate-400" />}
            <button
              onClick={() => setOpen(false)}
              className="p-1 hover:bg-slate-800 rounded-md transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto">
            {results.length === 0 && query && !loading && (
              <div className="p-8 text-center text-slate-500">
                Sonuç bulunamadı
              </div>
            )}

            {results.length === 0 && !query && !loading && (
              <div className="p-8 text-center space-y-4">
                <Command className="w-12 h-12 mx-auto text-slate-600" />
                <div className="space-y-2">
                  <p className="text-slate-400">Global arama ile başla</p>
                  <p className="text-sm text-slate-500">
                    Görevler, projeler ve ekip üyeleri arasında arama yap
                  </p>
                </div>
              </div>
            )}

            {results.map((result, index) => (
              <button
                key={`${result.type}-${result.id}`}
                onClick={() => handleSelect(result)}
                className={`w-full flex items-center gap-3 p-4 border-b border-slate-800 transition-colors ${
                  index === selectedIndex
                    ? 'bg-slate-800/50'
                    : 'hover:bg-slate-800/30'
                }`}
              >
                <div className="flex-shrink-0">
                  {getIcon(result)}
                </div>

                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-medium truncate">
                      {result.title}
                    </h3>
                    {getBadge(result)}
                  </div>
                  {result.subtitle && (
                    <p className="text-sm text-slate-400 truncate">
                      {result.subtitle}
                    </p>
                  )}
                  {result.metadata?.projectTitle && (
                    <p className="text-xs text-slate-500 mt-1">
                      📁 {result.metadata.projectTitle}
                    </p>
                  )}
                </div>

                <div className="flex-shrink-0 text-xs text-slate-500">
                  {result.type === 'node' && 'Görev'}
                  {result.type === 'project' && 'Proje'}
                  {result.type === 'member' && 'Üye'}
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-3 border-t border-slate-800 bg-slate-900/50 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span>↑↓ gezin</span>
              <span>↵ aç</span>
              <span>esc kapat</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700">
                {typeof navigator !== 'undefined' && navigator.platform.indexOf('Mac') !== -1 ? '⌘' : 'Ctrl'}
              </kbd>
              <span>+</span>
              <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700">K</kbd>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
