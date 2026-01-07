// ==========================================================================
// AstroPro Digital - Session Manager
// Manajemen session user untuk client dan server
// ==========================================================================

import type { User, Session } from '@supabase/supabase-js';
import { ServerStateManager } from './server-state';
import { ClientStateManager } from './client-state';

export class SessionManager {
  private static instance: SessionManager;

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  static createServerSession(user: User, session: Session) {
    const serverState = ServerStateManager.getInstance();

    serverState.set('user', user);
    serverState.set('session', session);
    serverState.setWithTTL('session_expires', session.expires_at, 24 * 60 * 60 * 1000);
  }

  static getServerSession() {
    const serverState = ServerStateManager.getInstance();

    const user = serverState.get<User>('user');
    const session = serverState.get<Session>('session');
    const expiresAt = serverState.get<number>('session_expires');

    if (!user || !session || !expiresAt) {
      return null;
    }

    if (Date.now() > expiresAt * 1000) {
      serverState.delete('user');
      serverState.delete('session');
      serverState.delete('session_expires');
      return null;
    }

    return { user, session };
  }

  static destroyServerSession() {
    const serverState = ServerStateManager.getInstance();
    serverState.delete('user');
    serverState.delete('session');
    serverState.delete('session_expires');
  }

  static createClientSession(user: User, accessToken: string, refreshToken: string) {
    const clientState = ClientStateManager.getInstance();

    clientState.set('user', user);
    clientState.set('access_token', accessToken);
    clientState.set('refresh_token', refreshToken);

    if (typeof window !== 'undefined') {
      localStorage.setItem('astropro_user', JSON.stringify(user));
      localStorage.setItem('astropro_access_token', accessToken);
      localStorage.setItem('astropro_refresh_token', refreshToken);
    }
  }

  static getClientSession() {
    const clientState = ClientStateManager.getInstance();

    let user = clientState.get<User>('user');
    let accessToken = clientState.get<string>('access_token');
    let refreshToken = clientState.get<string>('refresh_token');

    if (typeof window !== 'undefined' && (!user || !accessToken)) {
      try {
        const storedUser = localStorage.getItem('astropro_user');
        const storedAccessToken = localStorage.getItem('astropro_access_token');
        const storedRefreshToken = localStorage.getItem('astropro_refresh_token');

        if (storedUser && storedAccessToken) {
          user = JSON.parse(storedUser);
          accessToken = storedAccessToken;
          refreshToken = storedRefreshToken || '';

          clientState.set('user', user);
          clientState.set('access_token', accessToken);
          clientState.set('refresh_token', refreshToken);
        }
      } catch (error) {
        console.error('Error loading session from localStorage:', error);
      }
    }

    if (!user || !accessToken) {
      return null;
    }

    return { user, accessToken, refreshToken };
  }

  static destroyClientSession() {
    const clientState = ClientStateManager.getInstance();

    clientState.delete('user');
    clientState.delete('access_token');
    clientState.delete('refresh_token');

    if (typeof window !== 'undefined') {
      localStorage.removeItem('astropro_user');
      localStorage.removeItem('astropro_access_token');
      localStorage.removeItem('astropro_refresh_token');
    }
  }

  static refreshClientSession(): Promise<boolean> {
    return new Promise((resolve) => {
      const session = this.getClientSession();

      if (!session) {
        resolve(false);
        return;
      }

      resolve(!!session);
    });
  }
}
