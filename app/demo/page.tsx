'use client';

/**
 * 🎯 Demo Dashboard - Works Without Supabase
 * 
 * Mock project data for testing the dashboard UI
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Project, RoadmapNode } from '@/types';
import { DomainType, ProjectStatus, NodeStatus } from '@/types';
import { 
  ProjectManifest, 
  TimelineView, 
  MentorChatDemo 
} from '@/components/dashboard';
import { Button } from '@/components/ui/button';
import { MessageSquare, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Mock Project Data
const mockProject: Project = {
  id: 'demo-project-1',
  user_id: 'demo-user',
  title: 'Modern E-Ticaret Platformu',
  abstract_text: 'Next.js 14, TypeScript, Stripe ve Supabase kullanarak modern, ölçeklenebilir bir e-ticaret platformu geliştirme projesi. Kullanıcı girişi, ürün yönetimi, ödeme sistemi ve admin paneli içerir.',
  description: 'Bu proje, sıfırdan profesyonel bir e-ticaret sitesi oluşturmayı hedefliyor. Modern web teknolojileri kullanarak hızlı, güvenli ve kullanıcı dostu bir alışveriş deneyimi sunacağız.',
  status: ProjectStatus.ACTIVE,
  domain_type: DomainType.SOFTWARE,
  tags: ['Next.js', 'TypeScript', 'E-commerce', 'Stripe', 'Supabase'],
  is_public: true,
  created_at: '2024-12-15T10:00:00Z',
  updated_at: '2024-12-18T14:30:00Z',
};

// Mock Roadmap Nodes
const mockNodes: RoadmapNode[] = [
  {
    id: 'node-1',
    project_id: 'demo-project-1',
    title: 'Proje Yapısını Oluştur',
    description: 'Next.js 14 projesi başlat, TypeScript yapılandır, temel klasör yapısını oluştur.',
    technical_requirements: 'Next.js 14.x, TypeScript 5.x, ESLint, Prettier, Tailwind CSS v4',
    rationale: 'Modern bir web uygulaması için sağlam bir temel gereklidir. Next.js App Router en güncel özellikleri sunar.',
    status: NodeStatus.DONE,
    parent_node_id: null,
    order_index: 1,
    priority: 0,
    estimated_duration: 60,
    actual_duration: 45,
    started_at: '2024-12-15T10:00:00Z',
    completed_at: '2024-12-15T10:45:00Z',
    created_at: '2024-12-15T10:00:00Z',
    updated_at: '2024-12-15T10:45:00Z',
  },
  {
    id: 'node-2',
    project_id: 'demo-project-1',
    title: 'Supabase Veritabanını Kur',
    description: 'Supabase projesi oluştur, PostgreSQL şeması tasarla (users, products, orders), RLS politikaları ekle.',
    technical_requirements: 'Supabase (PostgreSQL), Row Level Security, Database migrations, Realtime subscriptions',
    rationale: 'Güvenli ve ölçeklenebilir bir backend için Supabase ideal çözümdür. RLS ile veri güvenliği sağlanır.',
    status: NodeStatus.IN_PROGRESS,
    parent_node_id: 'node-1',
    order_index: 2,
    priority: 1,
    estimated_duration: 120,
    actual_duration: null,
    started_at: '2024-12-18T10:00:00Z',
    completed_at: null,
    created_at: '2024-12-15T10:00:00Z',
    updated_at: '2024-12-18T10:00:00Z',
  },
  {
    id: 'node-3',
    project_id: 'demo-project-1',
    title: 'Authentication Sistemi',
    description: 'Kullanıcı girişi, kayıt, şifre sıfırlama ve sosyal medya login (Google, GitHub) entegrasyonu.',
    technical_requirements: 'NextAuth.js veya Supabase Auth, OAuth providers, JWT tokens, Session management',
    rationale: 'Güvenli kullanıcı yönetimi e-ticaret platformunun temelidir. Sosyal login UX\'i iyileştirir.',
    status: NodeStatus.PENDING,
    parent_node_id: 'node-2',
    order_index: 3,
    priority: 2,
    estimated_duration: 180,
    actual_duration: null,
    started_at: null,
    completed_at: null,
    created_at: '2024-12-15T10:00:00Z',
    updated_at: '2024-12-15T10:00:00Z',
  },
  {
    id: 'node-4',
    project_id: 'demo-project-1',
    title: 'Ürün Yönetimi Modülü',
    description: 'Ürün ekleme, düzenleme, silme, kategorilendirme ve görsel yükleme özellikleri.',
    technical_requirements: 'CRUD operations, Image upload (Supabase Storage), Categories & tags, Search & filtering',
    rationale: 'E-ticaret platformunun kalbi ürün yönetimidir. Esnek ve ölçeklenebilir olmalıdır.',
    status: NodeStatus.PENDING,
    parent_node_id: 'node-3',
    order_index: 4,
    priority: 1,
    estimated_duration: 240,
    actual_duration: null,
    started_at: null,
    completed_at: null,
    created_at: '2024-12-15T10:00:00Z',
    updated_at: '2024-12-15T10:00:00Z',
  },
  {
    id: 'node-5',
    project_id: 'demo-project-1',
    title: 'Alışveriş Sepeti',
    description: 'Sepete ekleme/çıkarma, miktar güncelleme, sepet özeti ve local storage entegrasyonu.',
    technical_requirements: 'React Context API veya Zustand, Local storage, Real-time updates, Cart calculations',
    rationale: 'Kullanıcı deneyiminin kritik bir parçası. Hızlı ve responsive olmalı.',
    status: NodeStatus.PENDING,
    parent_node_id: 'node-4',
    order_index: 5,
    priority: 0,
    estimated_duration: 150,
    actual_duration: null,
    started_at: null,
    completed_at: null,
    created_at: '2024-12-15T10:00:00Z',
    updated_at: '2024-12-15T10:00:00Z',
  },
  {
    id: 'node-6',
    project_id: 'demo-project-1',
    title: 'Stripe Ödeme Entegrasyonu',
    description: 'Stripe Checkout, ödeme doğrulama, sipariş onayı ve webhook yönetimi.',
    technical_requirements: 'Stripe SDK, Checkout Sessions, Webhooks, Payment intents, Test mode',
    rationale: 'Güvenli ödeme altyapısı e-ticaretin olmazsa olmazıdır. Stripe endüstri standardıdır.',
    status: NodeStatus.PENDING,
    parent_node_id: 'node-5',
    order_index: 6,
    priority: 2,
    estimated_duration: 200,
    actual_duration: null,
    started_at: null,
    completed_at: null,
    created_at: '2024-12-15T10:00:00Z',
    updated_at: '2024-12-15T10:00:00Z',
  },
];

export default function DemoPage() {
  const [nodes, setNodes] = useState<RoadmapNode[]>(mockNodes);
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  // Handle node status update
  const handleStatusUpdate = (nodeId: string, newStatus: string) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id !== nodeId) return node;

        const updates: Partial<RoadmapNode> = { 
          status: newStatus as NodeStatus,
          updated_at: new Date().toISOString(),
        };

        if (newStatus === 'in_progress') {
          updates.started_at = new Date().toISOString();
        } else if (newStatus === 'done') {
          updates.completed_at = new Date().toISOString();
          
          if (node.started_at) {
            const started = new Date(node.started_at);
            const completed = new Date();
            const durationMinutes = Math.round((completed.getTime() - started.getTime()) / 60000);
            updates.actual_duration = durationMinutes;
          }
        }

        return { ...node, ...updates };
      })
    );
  };

  // Handle "I'm Stuck" button
  const handleStuck = (node: RoadmapNode) => {
    setSelectedNode(node);
    setChatOpen(true);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* Back to Home Button */}
      <div className="absolute top-4 left-4 z-50">
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Ana Sayfa
          </Button>
        </Link>
      </div>

      {/* Left Sidebar - Project Manifest */}
      <motion.aside
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-80 border-r border-slate-800/50 bg-slate-950/50 backdrop-blur-sm overflow-y-auto"
      >
        <ProjectManifest project={mockProject} totalNodes={nodes.length} />
      </motion.aside>

      {/* Center - Timeline View */}
      <main className="flex-1 overflow-y-auto relative">
        <TimelineView
          nodes={nodes}
          selectedNode={selectedNode}
          onNodeSelect={setSelectedNode}
          onStatusUpdate={handleStatusUpdate}
          onStuck={handleStuck}
        />
      </main>

      {/* Right Drawer - Mentor Chat Demo */}
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
                  <MessageSquare className="w-5 h-5 text-cyan-400" />
                  <h2 className="font-semibold text-white">AI Mentor (Demo)</h2>
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
              <MentorChatDemo
                projectId={mockProject.id}
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

      {/* Demo Badge */}
      <div className="fixed top-4 right-4 z-50">
        <div className="glass rounded-lg px-4 py-2 border border-cyan-500/30">
          <span className="text-xs text-cyan-400 font-semibold">
            🎯 DEMO MODE (No Database Required)
          </span>
        </div>
      </div>
    </div>
  );
}
