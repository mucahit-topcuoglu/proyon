// Supabase Helper Functions
// Proyon - Veritabanı İşlemleri

import { createClient } from '@supabase/supabase-js';

// Admin client - RLS bypass için
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Normal client (eski import)
import { supabase } from './client';
import { 
  NodeStatus,
  MessageSender
} from '@/types';
import type { 
  Project, 
  ProjectInsert, 
  ProjectUpdate,
  RoadmapNode,
  RoadmapNodeInsert,
  RoadmapNodeUpdate,
  MentorLog,
  MentorLogInsert,
  ProjectStats
} from '@/types';

// ============================================================================
// PROJECTS
// ============================================================================

/**
 * Kullanıcının tüm projelerini getir
 */
export async function getUserProjects() {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Project[];
}

/**
 * Tek bir proje getir
 */
export async function getProject(projectId: string) {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();
  
  if (error) throw error;
  return data as Project;
}

/**
 * Yeni proje oluştur
 */
export async function createProject(project: ProjectInsert) {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .insert(project)
    .select()
    .single();
  
  if (error) {
    console.error('❌ createProject hatası:', error);
    throw error;
  }
  console.log('✅ Proje oluşturuldu:', data.id);
  return data as Project;
}

/**
 * Proje güncelle
 */
export async function updateProject(projectId: string, updates: ProjectUpdate) {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single();
  
  if (error) throw error;
  return data as Project;
}

/**
 * Proje sil
 */
export async function deleteProject(projectId: string) {
  const { error } = await supabaseAdmin
    .from('projects')
    .delete()
    .eq('id', projectId);
  
  if (error) throw error;
}

/**
 * Proje istatistiklerini getir
 */
export async function getProjectStats(projectId: string): Promise<ProjectStats> {
  const { data, error } = await supabaseAdmin
    .rpc('get_project_stats', { project_uuid: projectId });
  
  if (error) throw error;
  return data as ProjectStats;
}

// ============================================================================
// ROADMAP NODES
// ============================================================================

/**
 * Projenin tüm node'larını getir
 */
export async function getProjectNodes(projectId: string) {
  const { data, error } = await supabaseAdmin
    .from('roadmap_nodes')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index', { ascending: true });
  
  if (error) throw error;
  return data as RoadmapNode[];
}

/**
 * Tek bir node getir
 */
export async function getNode(nodeId: string) {
  const { data, error } = await supabaseAdmin
    .from('roadmap_nodes')
    .select('*')
    .eq('id', nodeId)
    .single();
  
  if (error) throw error;
  return data as RoadmapNode;
}

/**
 * Yeni node oluştur
 */
export async function createNode(node: RoadmapNodeInsert) {
  const { data, error } = await supabaseAdmin
    .from('roadmap_nodes')
    .insert(node)
    .select()
    .single();
  
  if (error) {
    console.error('❌ createNode hatası:', error);
    throw error;
  }
  return data as RoadmapNode;
}

/**
 * Node güncelle
 */
export async function updateNode(nodeId: string, updates: RoadmapNodeUpdate) {
  const { data, error } = await supabaseAdmin
    .from('roadmap_nodes')
    .update(updates)
    .eq('id', nodeId)
    .select()
    .single();
  
  if (error) throw error;
  return data as RoadmapNode;
}

/**
 * Node sil
 */
export async function deleteNode(nodeId: string) {
  const { error } = await supabaseAdmin
    .from('roadmap_nodes')
    .delete()
    .eq('id', nodeId);
  
  if (error) throw error;
}

/**
 * Node durumunu değiştir
 */
export async function updateNodeStatus(
  nodeId: string, 
  status: NodeStatus
) {
  return updateNode(nodeId, { status });
}

/**
 * Node bağımlılıklarını getir
 */
export async function getNodeDependencies(nodeId: string) {
  const { data, error } = await supabaseAdmin
    .rpc('get_node_dependencies', { node_uuid: nodeId });
  
  if (error) throw error;
  return data;
}

// ============================================================================
// MENTOR LOGS
// ============================================================================

/**
 * Proje sohbet geçmişini getir
 */
export async function getProjectMentorLogs(projectId: string, nodeId?: string) {
  let query = supabaseAdmin
    .from('mentor_logs')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });
  
  if (nodeId) {
    query = query.eq('node_id', nodeId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data as MentorLog[];
}

/**
 * Yeni mentor mesajı ekle
 */
export async function createMentorLog(log: MentorLogInsert) {
  const { data, error } = await supabaseAdmin
    .from('mentor_logs')
    .insert(log)
    .select()
    .single();
  
  if (error) throw error;
  return data as MentorLog;
}

/**
 * Kullanıcı mesajı gönder
 */
export async function sendUserMessage(
  projectId: string, 
  message: string, 
  nodeId?: string
) {
  return createMentorLog({
    project_id: projectId,
    node_id: nodeId,
    sender: MessageSender.USER,
    message,
  });
}

/**
 * AI mesajı ekle
 */
export async function sendAIMessage(
  projectId: string, 
  message: string, 
  nodeId?: string,
  metadata?: {
    embedding?: number[];
    tokens_used?: number;
    model_version?: string;
  }
) {
  return createMentorLog({
    project_id: projectId,
    node_id: nodeId,
    sender: MessageSender.AI,
    message,
    ...metadata,
  });
}

/**
 * Semantic search - benzer konuşmaları bul (RAG için)
 */
export async function findSimilarConversations(
  projectId: string,
  embedding: number[],
  limit: number = 5
) {
  // Vector similarity search
  const { data, error } = await supabaseAdmin
    .from('mentor_logs')
    .select('*')
    .eq('project_id', projectId)
    .order('embedding <=> ' + JSON.stringify(embedding) as any)
    .limit(limit);
  
  if (error) throw error;
  return data as MentorLog[];
}

// ============================================================================
// REAL-TIME SUBSCRIPTIONS
// ============================================================================

/**
 * Proje değişikliklerini dinle
 */
export function subscribeToProject(projectId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`project:${projectId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'projects',
        filter: `id=eq.${projectId}`,
      },
      callback
    )
    .subscribe();
}

/**
 * Node değişikliklerini dinle
 */
export function subscribeToProjectNodes(projectId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`nodes:${projectId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'roadmap_nodes',
        filter: `project_id=eq.${projectId}`,
      },
      callback
    )
    .subscribe();
}

/**
 * Mentor log değişikliklerini dinle (real-time chat)
 */
export function subscribeToMentorLogs(projectId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`chat:${projectId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'mentor_logs',
        filter: `project_id=eq.${projectId}`,
      },
      callback
    )
    .subscribe();
}
