// Supabase Database Types
// Auto-generated from Supabase schema
// Bu dosya Supabase CLI ile otomatik oluşturulmalıdır:
// npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          avatar_url: string | null
          role: 'user' | 'admin' | 'mentor'
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          avatar_url?: string | null
          role?: 'user' | 'admin' | 'mentor'
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          avatar_url?: string | null
          role?: 'user' | 'admin' | 'mentor'
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          title: string
          abstract_text: string | null
          description: string | null
          status: 'planning' | 'active' | 'on_hold' | 'completed' | 'archived'
          domain_type: 'software' | 'hardware' | 'construction' | 'research'
          tags: string[]
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          abstract_text?: string | null
          description?: string | null
          status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'archived'
          domain_type: 'software' | 'hardware' | 'construction' | 'research'
          tags?: string[]
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          abstract_text?: string | null
          description?: string | null
          status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'archived'
          domain_type?: 'software' | 'hardware' | 'construction' | 'research'
          tags?: string[]
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      roadmap_nodes: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          technical_requirements: string | null
          rationale: string | null
          status: 'pending' | 'in_progress' | 'done'
          parent_node_id: string | null
          order_index: number
          priority: number
          estimated_duration: number | null
          actual_duration: number | null
          started_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          technical_requirements?: string | null
          rationale?: string | null
          status?: 'pending' | 'in_progress' | 'done'
          parent_node_id?: string | null
          order_index?: number
          priority?: number
          estimated_duration?: number | null
          actual_duration?: number | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          technical_requirements?: string | null
          rationale?: string | null
          status?: 'pending' | 'in_progress' | 'done'
          parent_node_id?: string | null
          order_index?: number
          priority?: number
          estimated_duration?: number | null
          actual_duration?: number | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      mentor_logs: {
        Row: {
          id: string
          project_id: string
          node_id: string | null
          sender: 'user' | 'ai'
          message: string
          embedding: number[] | null
          tokens_used: number | null
          model_version: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          node_id?: string | null
          sender: 'user' | 'ai'
          message: string
          embedding?: number[] | null
          tokens_used?: number | null
          model_version?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          node_id?: string | null
          sender?: 'user' | 'ai'
          message?: string
          embedding?: number[] | null
          tokens_used?: number | null
          model_version?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_project_stats: {
        Args: {
          project_uuid: string
        }
        Returns: Json
      }
      get_node_dependencies: {
        Args: {
          node_uuid: string
        }
        Returns: {
          id: string
          title: string
          status: 'pending' | 'in_progress' | 'done'
          depth: number
        }[]
      }
    }
    Enums: {
      domain_type: 'software' | 'hardware' | 'construction' | 'research'
      project_status: 'planning' | 'active' | 'on_hold' | 'completed' | 'archived'
      node_status: 'pending' | 'in_progress' | 'done'
      message_sender: 'user' | 'ai'
      user_role: 'user' | 'admin' | 'mentor'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
