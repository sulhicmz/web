import type { User } from '@supabase/supabase-js';
import type { StateContext } from './state-context';
import { ClientStateContext } from './client-state-context';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  isRead: boolean;
  timestamp: string;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class AppStateStore {
  private stateContext: StateContext;

  constructor(stateContext?: StateContext) {
    this.stateContext = stateContext ?? new ClientStateContext();
  }

  get currentUser() {
    return this.stateContext.get<User>('current_user') || null;
  }

  set currentUser(user: User | null) {
    this.stateContext.set('current_user', user);
  }

  get sidebarOpen() {
    return this.stateContext.get<boolean>('sidebar_open') || false;
  }

  set sidebarOpen(open: boolean) {
    this.stateContext.set('sidebar_open', open);
  }

  get theme() {
    return this.stateContext.get<'light' | 'dark' | 'system'>('theme') || 'system';
  }

  set theme(theme: 'light' | 'dark' | 'system') {
    this.stateContext.set('theme', theme);
  }

  get language() {
    return this.stateContext.get<string>('language') || 'id';
  }

  set language(lang: string) {
    this.stateContext.set('language', lang);
  }

  get isLoading() {
    return this.stateContext.get<boolean>('is_loading') || false;
  }

  set isLoading(loading: boolean) {
    this.stateContext.set('is_loading', loading);
  }

  get loadingMessage() {
    return this.stateContext.get<string>('loading_message') || '';
  }

  set loadingMessage(message: string) {
    this.stateContext.set('loading_message', message);
  }

  get notifications() {
    return this.stateContext.get<Notification[]>('notifications') || [];
  }

  set notifications(notifications: Notification[]) {
    this.stateContext.set('notifications', notifications);
  }

  get unreadCount() {
    return this.notifications.filter(n => !n.isRead).length;
  }

  get currentProject() {
    const project = this.stateContext.get<Record<string, unknown>>('current_project');
    return project || undefined;
  }

  set currentProject(project: Record<string, unknown> | undefined | null) {
    this.stateContext.set('current_project', project);
  }

  setFormState<T>(formName: string, state: T) {
    this.stateContext.set(`form_${formName}`, state);
  }

  getFormState<T>(formName: string): T | undefined {
    return this.stateContext.get<T>(`form_${formName}`);
  }

  clearFormState(formName: string) {
    this.stateContext.delete(`form_${formName}`);
  }

  setCache<T>(key: string, data: T, ttlMinutes: number = 5) {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    };
    this.stateContext.set(`cache_${key}`, entry);
  }

  getCache<T>(key: string): T | undefined {
    const cached = this.stateContext.get<CacheEntry<T>>(`cache_${key}`);
    if (!cached) return undefined;

    if (Date.now() > cached.timestamp + cached.ttl) {
      this.stateContext.delete(`cache_${key}`);
      return undefined;
    }

    return cached.data;
  }

  clearCache(key?: string) {
    if (key) {
      this.stateContext.delete(`cache_${key}`);
    } else {
      const state = this.stateContext as unknown as { state: Map<string, unknown> };
      const keys = Array.from(state.state.keys());
      keys.forEach(k => {
        if (k.startsWith('cache_')) {
          this.stateContext.delete(k);
        }
      });
    }
  }

  subscribe<T>(key: string, callback: (value: T) => void) {
    return this.stateContext.subscribe(key, (value: unknown) => callback(value as T));
  }

  reset() {
    this.stateContext.clear();
  }
}
