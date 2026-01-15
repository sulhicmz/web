// Local type definitions to avoid importing Supabase types
// This prevents the Supabase SDK from being bundled unnecessarily

export interface User {
  id: string;
  email: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  token_type?: string;
  user?: User;
}

export interface SupabaseClient {
  auth: {
    getSession(): Promise<{ data: { session: Session | null }, error: Error | null }>;
    signOut(): Promise<{ error: Error | null }>;
  };
}
