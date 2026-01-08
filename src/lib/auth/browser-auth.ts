// ==========================================================================
// AstroPro Digital - Browser-Side Authentication
// Autentikasi client-side untuk user interactions
// ==========================================================================

import { getBrowserClient } from '../supabase';
import type { Session } from '@supabase/supabase-js';
import type { AuthUser, UserProfile } from '../../types';

export const auth = {
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

  async signOut() {
    const supabase = getBrowserClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  },

  async resetPassword(email: string) {
    const supabase = getBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321'}/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }
  },

  async updatePassword(password: string) {
    const supabase = getBrowserClient();
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      throw new Error(error.message);
    }
  },

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

  async getCurrentUser(): Promise<AuthUser | null> {
    const supabase = getBrowserClient();
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
  },

  async getCurrentSession(): Promise<Session | null> {
    const supabase = getBrowserClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return null;
    }

    return session;
  },

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    const supabase = getBrowserClient();
    return supabase.auth.onAuthStateChange(callback);
  },
};
