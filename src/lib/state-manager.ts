// ==========================================================================
// AstroPro Digital - State Management Utilities
// Strategi terpusat untuk state management antara client dan server components
// ==========================================================================

import type { User, Session } from '@supabase/supabase-js';

// Server State Management
export class ServerStateManager {
  private static instance: ServerStateManager;
  private state: Map<string, any> = new Map();

  static getInstance(): ServerStateManager {
    if (!ServerStateManager.instance) {
      ServerStateManager.instance = new ServerStateManager();
    }
    return ServerStateManager.instance;
  }

  set(key: string, value: any): void {
    this.state.set(key, {
      value,
      timestamp: Date.now(),
      ttl: null // No TTL by default
    });
  }

  get<T>(key: string): T | null {
    const item = this.state.get(key);
    if (!item) return null;

    // Check if expired
    if (item.ttl && Date.now() > item.timestamp + item.ttl) {
      this.state.delete(key);
      return null;
    }

    return item.value as T;
  }

  setWithTTL(key: string, value: any, ttlMs: number): void {
    this.state.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  delete(key: string): void {
    this.state.delete(key);
  }

  clear(): void {
    this.state.clear();
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }
}

// Client State Management
export class ClientStateManager {
  private static instance: ClientStateManager;
  private state: Map<string, any> = new Map();
  private listeners: Map<string, Set<(value: any) => void>> = new Map();

  static getInstance(): ClientStateManager {
    if (!ClientStateManager.instance) {
      ClientStateManager.instance = new ClientStateManager();
    }
    return ClientStateManager.instance;
  }

  // Reactive state management
  set(key: string, value: any): void {
    this.state.set(key, value);
    this.notifyListeners(key, value);
  }

  get<T>(key: string): T | null {
    return this.state.get(key) || null;
  }

  update(key: string, updater: (prev: any) => any): void {
    const current = this.get(key);
    const next = updater(current);
    this.set(key, next);
  }

  delete(key: string): void {
    this.state.delete(key);
    this.notifyListeners(key, undefined);
  }

  clear(): void {
    this.state.clear();
    this.listeners.clear();
  }

  // Reactive subscriptions
  subscribe(key: string, listener: (value: any) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    this.listeners.get(key)!.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.get(key)?.delete(listener);
    };
  }

  private notifyListeners(key: string, value: any): void {
    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      keyListeners.forEach(listener => listener(value));
    }
  }

  // Computed values
  computed<T>(key: string, computeFn: () => T): T {
    const value = computeFn();
    this.set(key, value);
    return value;
  }
}

// User Session Management
export class SessionManager {
  private static instance: SessionManager;

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  // Server-side session management
  static createServerSession(user: User, session: Session) {
    const serverState = ServerStateManager.getInstance();

    serverState.set('user', user);
    serverState.set('session', session);
    serverState.setWithTTL('session_expires', session.expires_at, 24 * 60 * 60 * 1000); // 24 hours
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

  // Client-side session management
  static createClientSession(user: User, accessToken: string, refreshToken: string) {
    const clientState = ClientStateManager.getInstance();

    clientState.set('user', user);
    clientState.set('access_token', accessToken);
    clientState.set('refresh_token', refreshToken);

    // Store in localStorage for persistence
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

    // Try to load from localStorage if not in memory
    if (typeof window !== 'undefined' && (!user || !accessToken)) {
      try {
        const storedUser = localStorage.getItem('astropro_user');
        const storedAccessToken = localStorage.getItem('astropro_access_token');
        const storedRefreshToken = localStorage.getItem('astropro_refresh_token');

        if (storedUser && storedAccessToken) {
          user = JSON.parse(storedUser);
          accessToken = storedAccessToken;
          refreshToken = storedRefreshToken || '';

          // Update memory state
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

    // Clear localStorage
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

      // In a real implementation, you would call your auth API here
      // For now, we'll just resolve true if we have a session
      resolve(!!session);
    });
  }
}

// Application State Store
export class AppStateStore {
  private clientState = ClientStateManager.getInstance();

  // User state
  get currentUser() {
    return this.clientState.get<User>('current_user');
  }

  set currentUser(user: User | null) {
    this.clientState.set('current_user', user);
  }

  // UI state
  get sidebarOpen() {
    return this.clientState.get<boolean>('sidebar_open') || false;
  }

  set sidebarOpen(open: boolean) {
    this.clientState.set('sidebar_open', open);
  }

  get theme() {
    return this.clientState.get<'light' | 'dark' | 'system'>('theme') || 'system';
  }

  set theme(theme: 'light' | 'dark' | 'system') {
    this.clientState.set('theme', theme);
  }

  get language() {
    return this.clientState.get<string>('language') || 'id';
  }

  set language(lang: string) {
    this.clientState.set('language', lang);
  }

  // Loading states
  get isLoading() {
    return this.clientState.get<boolean>('is_loading') || false;
  }

  set isLoading(loading: boolean) {
    this.clientState.set('is_loading', loading);
  }

  get loadingMessage() {
    return this.clientState.get<string>('loading_message') || '';
  }

  set loadingMessage(message: string) {
    this.clientState.set('loading_message', message);
  }

  // Notification state
  get notifications() {
    return this.clientState.get<any[]>('notifications') || [];
  }

  set notifications(notifications: any[]) {
    this.clientState.set('notifications', notifications);
  }

  get unreadCount() {
    return this.notifications.filter(n => !n.isRead).length;
  }

  // Project state
  get currentProject() {
    return this.clientState.get<any>('current_project');
  }

  set currentProject(project: any) {
    this.clientState.set('current_project', project);
  }

  // Form state management
  setFormState(formName: string, state: any) {
    this.clientState.set(`form_${formName}`, state);
  }

  getFormState(formName: string) {
    return this.clientState.get(`form_${formName}`);
  }

  clearFormState(formName: string) {
    this.clientState.delete(`form_${formName}`);
  }

  // Cache management
  setCache(key: string, data: any, ttlMinutes: number = 5) {
    this.clientState.set(`cache_${key}`, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    });
  }

  getCache(key: string) {
    const cached = this.clientState.get<any>(`cache_${key}`);
    if (!cached) return null;

    if (Date.now() > cached.timestamp + cached.ttl) {
      this.clientState.delete(`cache_${key}`);
      return null;
    }

    return cached.data;
  }

  clearCache(key?: string) {
    if (key) {
      this.clientState.delete(`cache_${key}`);
    } else {
      // Clear all cache entries
      const keys = Array.from(this.clientState['state'].keys());
      keys.forEach(k => {
        if (k.startsWith('cache_')) {
          this.clientState.delete(k);
        }
      });
    }
  }

  // Reactive subscriptions
  subscribe(key: string, callback: (value: any) => void) {
    return this.clientState.subscribe(key, callback);
  }

  // Reset all state
  reset() {
    this.clientState.clear();
  }
}

// Export singleton instances
export const serverState = ServerStateManager.getInstance();
export const clientState = ClientStateManager.getInstance();
export const sessionManager = SessionManager.getInstance();
export const appState = new AppStateStore();

// Utility functions for components
export function useState<T>(key: string, initialValue: T) {
  const state = clientState.get<T>(key) ?? initialValue;

  const setState = (value: T | ((prev: T) => T)) => {
    const newValue = typeof value === 'function' ? (value as (prev: T) => T)(state) : value;
    clientState.set(key, newValue);
  };

  return [state, setState] as const;
}

export function useReactiveState<T>(key: string, initialValue: T) {
  const state = clientState.get<T>(key) ?? initialValue;

  const setState = (value: T | ((prev: T) => T)) => {
    const newValue = typeof value === 'function' ? (value as (prev: T) => T)(state) : value;
    clientState.set(key, newValue);
  };

  const subscribe = (callback: (value: T) => void) => {
    return clientState.subscribe(key, callback);
  };

  return { state, setState, subscribe };
}