// ==========================================================================
// AstroPro Digital - Server-Side Authentication
// Autentikasi server-side untuk API routes dan middleware
// ==========================================================================

import { getServerClient, getServiceClient } from '../supabase';
import type { AuthUser, UserProfile } from '../../types';

export const serverAuth = {
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
