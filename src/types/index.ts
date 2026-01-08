// ==========================================================================
// AstroPro Digital - Consolidated Type Definitions
// Menggabungkan semua type definitions dalam satu tempat terpusat
// ==========================================================================

import type { User } from '@supabase/supabase-js';

// Base Types
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// User Types
export interface UserProfile extends BaseEntity {
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  company?: string;
  phone?: string;
  is_active: boolean;
  client_id?: string;
}

export interface AuthUser extends User {
  profile?: UserProfile;
}

// Project Types
export interface Project extends BaseEntity {
  title: string;
  description: string;
  status: ProjectStatus;
  priority: PriorityLevel;
  progress: number;
  due_date: string;
  client_id: string;
  client?: Client;
  budget: number;
  tags: string[];
  team_members: TeamMember[];
  deliverables?: Deliverable[];
}

export interface Client extends BaseEntity {
  name: string;
  email: string;
  company: string;
  phone?: string;
  avatar_url?: string;
  projects?: Project[];
}

export interface TeamMember {
  user_id: string;
  role: string;
  joined_at: string;
  user?: UserProfile;
}

export interface Deliverable {
  id: string;
  name: string;
  description?: string;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delivered';
  file_url?: string;
}

// Payment Types
export interface Payment extends BaseEntity {
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method: string;
  transaction_id?: string;
  project_id?: string;
  client_id: string;
  invoice_url?: string;
  paid_at?: string;
}

export interface PaymentSession {
  id: string;
  amount: number;
  currency: string;
  payment_url: string;
  status: 'pending' | 'paid' | 'failed' | 'expired';
  expires_at: string;
}

// Support Types
export interface SupportTicket extends BaseEntity {
  title: string;
  description: string;
  status: SupportTicketStatus;
  priority: PriorityLevel;
  category: string;
  client_id: string;
  assigned_to?: string;
  tags: string[];
  messages: TicketMessage[];
  resolved_at?: string;
  closed_at?: string;
}

export interface TicketMessage extends BaseEntity {
  ticket_id: string;
  sender_id: string;
  message: string;
  is_internal: boolean;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  filename: string;
  file_url: string;
  file_size: number;
  mime_type: string;
}

// WhatsApp Types
export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  message: string;
  timestamp: string;
  type: 'text' | 'image' | 'document' | 'audio' | 'video';
  media_url?: string;
  file_name?: string;
}

export interface WhatsAppWebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: {
            name: string;
          };
          wa_id: string;
        }>;
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          type: string;
          text?: {
            body: string;
          };
        }>;
      };
      field: string;
    }>;
  }>;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirm_password: string;
  full_name: string;
  company?: string;
  phone?: string;
}

export interface ProjectForm {
  title: string;
  description: string;
  client_id: string;
  budget: number;
  due_date: string;
  priority: PriorityLevel;
  tags: string[];
  team_member_ids: string[];
}

export interface SupportTicketForm {
  title: string;
  description: string;
  category: string;
  priority: PriorityLevel;
  tags: string[];
}

// Dashboard Types
export interface DashboardStats {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  total_revenue: number;
  pending_payments: number;
  open_tickets: number;
  client_satisfaction: number;
}

export interface ActivityItem {
  id: string;
  type: 'project' | 'payment' | 'ticket' | 'user';
  action: string;
  description: string;
  timestamp: string;
  user_id?: string;
  metadata?: Record<string, unknown>;
}

// Navigation Types
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavItem[];
  requiresAuth?: boolean;
  roles?: UserRole[];
}

// Component Props Types
export interface ComponentBaseProps {
  class?: string;
  id?: string;
  'data-testid'?: string;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// Environment Types
export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  PUBLIC_SITE_URL?: string;
  PUBLIC_API_URL?: string;
  PUBLIC_SUPABASE_URL?: string;
  PUBLIC_SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  PUBLIC_MIDTRANS_CLIENT_KEY?: string;
  MIDTRANS_SERVER_KEY?: string;
  PUBLIC_MIDTRANS_IS_PRODUCTION?: string;
  PUBLIC_ENABLE_ANALYTICS?: string;
  PUBLIC_ENABLE_PAYMENTS?: string;
  PUBLIC_ENABLE_WHATSAPP?: string;
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
} & {};

// Constants Types (from consts.ts)
export type ProjectStatus = 'active' | 'completed' | 'on_hold' | 'cancelled';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';
export type UserRole = 'admin' | 'client' | 'team_member' | 'owner' | 'staff' | 'manager';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type SupportTicketStatus = 'open' | 'in_progress' | 'waiting_for_response' | 'resolved' | 'closed';

// Export untuk kemudahan penggunaan
export * from './payments';
export * from './supabase';
export * from './whatsapp';