// ==========================================================================
// AstroPro Digital - Authentication Utilities
// Utilitas untuk autentikasi dan manajemen session
// ==========================================================================

import { getBrowserClient, getServerClient, getServiceClient } from './supabase/index';
import type { User, Session } from '@supabase/supabase-js';
import type { AuthUser, UserProfile } from '../types';

// Browser-side authentication
export const auth = {
  /**
   * Login dengan email dan password
   */
  async signIn(email: string, password: string) {
    const supabase = getBrowserClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  /**
   * Register pengguna baru
   */
  async signUp(email: string, password: string, metadata: { full_name: string; company?: string; phone?: string }) {
    const supabase = getBrowserClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  /**
   * Logout pengguna
   */
  async signOut() {
    const supabase = getBrowserClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Reset password
   */
  async resetPassword(email: string) {
    const supabase = getBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321'}/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Update password
   */
  async updatePassword(password: string) {
    const supabase = getBrowserClient();
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Update profile
   */
  async updateProfile(updates: Partial<UserProfile>) {
    const supabase = getBrowserClient();
    const { error } = await supabase
      .from('user_profiles')
      .upsert(updates)
      .eq('id', (await supabase.auth.getUser()).data.user?.id);

    if (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    const supabase = getBrowserClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      ...user,
      profile: profile || undefined,
    };
  },

  /**
   * Get current session
   */
  async getCurrentSession(): Promise<Session | null> {
    const supabase = getBrowserClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return null;
    }

    return session;
  },

  /**
   * Listen to auth changes
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    const supabase = getBrowserClient();
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Server-side authentication utilities
export const serverAuth = {
  /**
   * Get user from request (server-side)
   */
  async getUserFromRequest(request: Request): Promise<AuthUser | null> {
    try {
      const token = request.headers.get('Authorization')?.replace('Bearer ', '');

      if (!token) {
        return null;
      }

      const supabase = getServerClient({ accessToken: token });
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        return null;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return {
        ...user,
        profile: profile || undefined,
      };
    } catch (error) {
      console.error('Error getting user from request:', error);
      return null;
    }
  },

  /**
   * Create user profile (admin only)
   */
  async createUserProfile(userData: {
    id: string;
    full_name: string;
    phone?: string;
    role: string;
    client_id?: string;
  }) {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(userData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  /**
   * Update user profile (admin only)
   */
  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  /**
   * Delete user profile (admin only)
   */
  async deleteUserProfile(userId: string) {
    const supabase = getServiceClient();
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Get all users with profiles (admin only)
   */
  async getAllUsers() {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },
};

// Session management utilities
export const sessionUtils = {
  /**
   * Create session cookie
   */
  createSessionCookie(session: Session) {
    return {
      'sb-access-token': session.access_token,
      'sb-refresh-token': session.refresh_token,
      'sb-expires-at': session.expires_at?.toString(),
    };
  },

  /**
   * Clear session cookies
   */
  clearSessionCookies() {
    return {
      'sb-access-token': '',
      'sb-refresh-token': '',
      'sb-expires-at': '',
    };
  },

  /**
   * Check if session is valid
   */
  isSessionValid(session: Session | null): boolean {
    if (!session) return false;

    const now = Math.floor(Date.now() / 1000);
    return (session.expires_at || 0) > now;
  },
};

// Role-based access control utilities
export const rbac = {
  /**
   * Check if user has required role
   */
  hasRole(user: AuthUser | null, allowedRoles: string[]): boolean {
    if (!user?.profile?.role) return false;
    return allowedRoles.includes(user.profile.role);
  },

  /**
   * Check if user is admin
   */
  isAdmin(user: AuthUser | null): boolean {
    const role = user?.profile?.role;
    return role === 'admin' || role === 'owner' || role === 'staff' || role === 'manager';
  },

  /**
   * Check if user is client
   */
  isClient(user: AuthUser | null): boolean {
    return user?.profile?.role === 'client';
  },

  /**
   * Check if user can manage specific client
   */
  canManageClient(user: AuthUser | null, clientId: string): boolean {
    if (!user?.profile) return false;

    // Admins can manage all clients
    if (this.isAdmin(user)) return true;

    // Clients can only manage their own client
    return user.profile.client_id === clientId;
  },
};

// Export combined utilities
export const AuthUtils = {
  auth,
  serverAuth,
  sessionUtils,
  rbac,
};