// ==========================================================================
// AstroPro Digital - Session Utilities
// Utilitas manajemen session untuk cookie handling dan validasi
// ==========================================================================

import type { Session } from '@supabase/supabase-js';

export const sessionUtils = {
  createSessionCookie(session: Session) {
    return {
      'sb-access-token': session.access_token,
      'sb-refresh-token': session.refresh_token,
      'sb-expires-at': session.expires_at?.toString(),
    };
  },

  clearSessionCookies() {
    return {
      'sb-access-token': '',
      'sb-refresh-token': '',
      'sb-expires-at': '',
    };
  },

  isSessionValid(session: Session | null): boolean {
    if (!session) return false;

    const now = Math.floor(Date.now() / 1000);
    return (session.expires_at || 0) > now;
  },
};
