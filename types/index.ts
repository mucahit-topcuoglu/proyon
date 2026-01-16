// Proyon Type Definitions - Supabase Database Schema
// Auto-generated types from database schema

// ============================================================================
// ENUMS
// ============================================================================

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MENTOR = 'mentor',
}

export enum DomainType {
  SOFTWARE = 'software',
  HARDWARE = 'hardware',
  CONSTRUCTION = 'construction',
  RESEARCH = 'research',
}

export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export enum NodeStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

export enum MessageSender {
  USER = 'user',
  AI = 'ai',
}

// ============================================================================
// COLLABORATION & SHARING ENUMS
// ============================================================================

export enum MemberRole {
  OWNER = 'owner',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum NotificationType {
  INVITATION_RECEIVED = 'invitation_received',
  INVITATION_ACCEPTED = 'invitation_accepted',
  INVITATION_REJECTED = 'invitation_rejected',
  MEMBER_ADDED = 'member_added',
  MEMBER_REMOVED = 'member_removed',
  NODE_COMPLETED = 'node_completed',
  NODE_ASSIGNED = 'node_assigned',
  COMMENT_MENTION = 'comment_mention',
  DEADLINE_APPROACHING = 'deadline_approaching',
  DEADLINE_PASSED = 'deadline_passed',
  PROJECT_SHARED = 'project_shared',
}

export enum ActivityType {
  PROJECT_CREATED = 'project_created',
  PROJECT_UPDATED = 'project_updated',
  PROJECT_DELETED = 'project_deleted',
  CATEGORY_CREATED = 'category_created',
  CATEGORY_UPDATED = 'category_updated',
  CATEGORY_DELETED = 'category_deleted',
  NODE_CREATED = 'node_created',
  NODE_UPDATED = 'node_updated',
  NODE_COMPLETED = 'node_completed',
  NODE_DELETED = 'node_deleted',
  MEMBER_INVITED = 'member_invited',
  MEMBER_JOINED = 'member_joined',
  MEMBER_LEFT = 'member_left',
  MEMBER_REMOVED = 'member_removed',
  MEMBER_ROLE_CHANGED = 'member_role_changed',
  ROADMAP_GENERATED = 'roadmap_generated',
  ROADMAP_REGENERATED = 'roadmap_regenerated',
  COMMENT_ADDED = 'comment_added',
  FILE_UPLOADED = 'file_uploaded',
  PROJECT_SHARED = 'project_shared',
}

// ============================================================================
// DATABASE TABLES
// ============================================================================

export interface Profile {
  id: string; // UUID, references auth.users
  full_name: string;
  avatar_url?: string | null;
  role: UserRole;
  bio?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string; // UUID
  user_id: string; // UUID, references profiles
  title: string;
  abstract_text?: string | null;
  description?: string | null;
  status: ProjectStatus;
  domain_type: DomainType;
  tags: string[];
  is_public: boolean;
  uploaded_file_url?: string | null; // Yüklenen PDF/DOCX URL'i
  uploaded_file_name?: string | null; // Dosya adı
  created_at: string;
  updated_at: string;
}

export interface SubStep {
  task: string;
  detail: string;
  completed?: boolean;
}

export interface RoadmapNode {
  id: string; // UUID
  project_id: string; // UUID, references projects
  category_id?: string | null; // UUID, references roadmap_categories - NEW!
  title: string;
  description?: string | null;
  technical_requirements?: string | null;
  rationale?: string | null;
  sub_steps?: SubStep[] | null; // Alt adımlar (checklist) - NEW!
  status: NodeStatus;
  parent_node_id?: string | null; // UUID, references roadmap_nodes
  order_index: number;
  priority: number; // 0: normal, 1: high, 2: critical
  estimated_duration?: number | null; // minutes
  actual_duration?: number | null; // minutes
  deadline?: string | null; // Deadline for node completion
  started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// MULTI-ROADMAP CATEGORIES (NEW!)
// ============================================================================

export interface RoadmapCategory {
  id: string; // UUID
  project_id: string; // UUID, references projects
  name: string; // 'Backend', 'Frontend', 'Database', etc.
  description?: string | null;
  color: string; // Hex color code
  icon: string; // Lucide icon name
  order_index: number;
  ai_generated: boolean; // AI tarafından mı oluşturuldu?
  created_at: string;
  updated_at: string;
}

export interface ProjectMemberCategory {
  id: string; // UUID
  project_id: string; // UUID, references projects
  user_id: string; // UUID, references profiles
  category_id: string; // UUID, references roadmap_categories
  can_edit: boolean; // Node'ları düzenleyebilir mi?
  can_delete: boolean; // Node'ları silebilir mi?
  can_manage: boolean; // Kategoriyi yönetebilir mi?
  created_at: string;
  updated_at: string;
}

export type RoadmapCategoryInsert = Omit<RoadmapCategory, 'id' | 'created_at' | 'updated_at'>;
export type ProjectMemberCategoryInsert = Omit<ProjectMemberCategory, 'id' | 'created_at' | 'updated_at'>;

// ============================================================================
// ROADMAP CREATION MODES (NEW!)
// ============================================================================

export enum RoadmapCreationMode {
  MANUAL = 'manual', // Kullanıcı kendisi oluşturur
  AI_ASSISTED = 'ai_assisted', // AI yardımıyla
  AI_AUTO = 'ai_auto', // Tam otomatik AI
}

export enum CategoryInputMode {
  NONE = 'none', // Kategori yok, default "General"
  MANUAL_NAMES = 'manual_names', // Kullanıcı kategori isimlerini girer
  AI_WITH_COUNT = 'ai_with_count', // AI kategori isimleri oluşturur, kullanıcı sadece sayı verir
  AI_AUTO = 'ai_auto', // AI hem sayı hem isimleri belirler
}

export interface MentorLog {
  id: string; // UUID
  project_id: string; // UUID, references projects
  node_id?: string | null; // UUID, references roadmap_nodes
  sender: MessageSender;
  message: string;
  embedding?: number[] | null; // vector(1536) for AI RAG
  tokens_used?: number | null;
  model_version?: string | null;
  created_at: string;
}

// ============================================================================
// INSERT TYPES (for creating new records)
// ============================================================================

export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'>;
export type ProjectInsert = Omit<Project, 'id' | 'created_at' | 'updated_at'>;
export type RoadmapNodeInsert = Omit<RoadmapNode, 'id' | 'created_at' | 'updated_at'>;
export type MentorLogInsert = Omit<MentorLog, 'id' | 'created_at'>;

// ============================================================================
// UPDATE TYPES (for updating existing records)
// ============================================================================

export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
export type ProjectUpdate = Partial<Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
export type RoadmapNodeUpdate = Partial<Omit<RoadmapNode, 'id' | 'project_id' | 'created_at' | 'updated_at'>>;

// ============================================================================
// EXTENDED TYPES (with relations)
// ============================================================================

export interface ProjectWithStats extends Project {
  total_nodes: number;
  pending_nodes: number;
  in_progress_nodes: number;
  completed_nodes: number;
  completion_percentage: number;
}

export interface RoadmapNodeWithParent extends RoadmapNode {
  parent?: RoadmapNode | null;
}

export interface RoadmapNodeWithChildren extends RoadmapNode {
  children: RoadmapNode[];
}

export interface MentorLogWithContext extends MentorLog {
  project: Project;
  node?: RoadmapNode | null;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export interface ProjectStats {
  total_nodes: number;
  pending_nodes: number;
  in_progress_nodes: number;
  completed_nodes: number;
  completion_percentage: number;
}

export interface NodeDependency {
  id: string;
  title: string;
  status: NodeStatus;
  depth: number;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface CreateProjectForm {
  title: string;
  abstract_text?: string;
  description?: string;
  domain_type: DomainType;
  tags?: string[];
  is_public?: boolean;
}

export interface CreateNodeForm {
  project_id: string;
  title: string;
  description?: string;
  technical_requirements?: string;
  rationale?: string;
  parent_node_id?: string;
  order_index?: number;
  priority?: number;
  estimated_duration?: number;
}

export interface CreateMentorMessageForm {
  project_id: string;
  node_id?: string;
  message: string;
}

// ============================================================================
// COLLABORATION & SHARING TYPES
// ============================================================================

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: MemberRole;
  invited_by?: string | null;
  joined_at: string;
  can_edit: boolean;
  can_manage_tasks: boolean;
  can_invite: boolean;
  // Joined user data
  user?: {
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface ProjectInvitation {
  id: string;
  project_id: string;
  email: string;
  invited_by: string;
  role: MemberRole;
  token: string;
  status: InvitationStatus;
  created_at: string;
  expires_at: string;
  // Joined data
  project?: Project;
  inviter?: {
    email: string;
    full_name?: string;
  };
}

export interface PublicShare {
  id: string;
  project_id: string;
  share_token: string;
  created_at: string;
  created_by: string;
  is_active: boolean;
  allow_comments: boolean;
  show_timeline: boolean;
  show_stats: boolean;
  view_count: number;
  last_viewed_at?: string | null;
}

export interface PublicShareView {
  id: string;
  share_id: string;
  viewed_at: string;
  ip_address?: string | null;
  user_agent?: string | null;
  referrer?: string | null;
}

// ============================================================================
// INSERT TYPES (for creating new records)
// ============================================================================

export interface CreateMemberForm {
  project_id: string;
  user_id: string;
  role: MemberRole;
  can_edit?: boolean;
  can_manage_tasks?: boolean;
  can_invite?: boolean;
}

export interface CreateInvitationForm {
  project_id: string;
  email: string;
  role: MemberRole;
}

export interface CreatePublicShareForm {
  project_id: string;
  allow_comments?: boolean;
  show_timeline?: boolean;
  show_stats?: boolean;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface NotificationCreate {
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// ACTIVITY LOGS
// ============================================================================

export interface ActivityLog {
  id: string;
  project_id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  type: ActivityType;
  action: string;
  entity_type?: string;
  entity_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ActivityLogCreate {
  project_id: string;
  user_id: string;
  type: ActivityType;
  action: string;
  entity_type?: string;
  entity_id?: string;
  metadata?: Record<string, any>;
}

export interface ActivityFilter {
  type?: ActivityType;
  user_id?: string;
  limit?: number;
  offset?: number;
}

// ============================================================================
// COMMENTS
// ============================================================================

export interface Comment {
  id: string;
  node_id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  parent_comment_id?: string;
  content: string;
  mentioned_users?: string[];
  reactions?: Record<string, string>; // {user_id: emoji}
  edited: boolean;
  reply_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CommentCreate {
  node_id: string;
  user_id: string;
  parent_comment_id?: string;
  content: string;
  mentioned_users?: string[];
}

export interface CommentUpdate {
  content: string;
  mentioned_users?: string[];
}

// ============================================================================
// DEADLINES
// ============================================================================

export type DeadlineStatus = 
  | 'no_deadline' 
  | 'completed' 
  | 'overdue' 
  | 'due_today' 
  | 'due_this_week' 
  | 'future';

export interface DeadlineNode {
  node_id: string;
  node_title: string;
  project_id: string;
  project_title: string;
  deadline: string;
  status: string;
  days_until_deadline?: number;
  days_overdue?: number;
}

export interface DeadlineReminder {
  id: string;
  node_id: string;
  project_id: string;
  user_id: string;
  deadline: string;
  reminder_type: '1_day_before' | 'same_day' | '1_day_overdue' | '3_days_overdue';
  sent: boolean;
  sent_at?: string;
  created_at: string;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface ProjectFilters {
  status?: ProjectStatus;
  domain_type?: DomainType;
  is_public?: boolean;
  search?: string;
}

export interface NodeFilters {
  status?: NodeStatus;
  priority?: number;
  has_parent?: boolean;
}
