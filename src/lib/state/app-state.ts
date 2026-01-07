// ==========================================================================
// AstroPro Digital - App State Store
// Manajemen state aplikasi dengan reactive subscriptions
// ==========================================================================

import type { User } from '@supabase/supabase-js';
import { ClientStateManager } from './client-state';

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
  private clientState = ClientStateManager.getInstance();

  get currentUser() {
    return this.clientState.get<User>('current_user') || null;
  }

  set currentUser(user: User | null) {
    this.clientState.set('current_user', user);
  }

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

  get notifications() {
    return this.clientState.get<Notification[]>('notifications') || [];
  }

  set notifications(notifications: Notification[]) {
    this.clientState.set('notifications', notifications);
  }

  get unreadCount() {
    return this.notifications.filter(n => !n.isRead).length;
  }

  get currentProject() {
    const project = this.clientState.get<Record<string, unknown>>('current_project');
    return project || undefined;
  }

  set currentProject(project: Record<string, unknown> | undefined | null) {
    this.clientState.set('current_project', project);
  }

  setFormState<T>(formName: string, state: T) {
    this.clientState.set(`form_${formName}`, state);
  }

  getFormState<T>(formName: string): T | undefined {
    return this.clientState.get<T>(`form_${formName}`);
  }

  clearFormState(formName: string) {
    this.clientState.delete(`form_${formName}`);
  }

  setCache<T>(key: string, data: T, ttlMinutes: number = 5) {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    };
    this.clientState.set(`cache_${key}`, entry);
  }

  getCache<T>(key: string): T | undefined {
    const cached = this.clientState.get<CacheEntry<T>>(`cache_${key}`);
    if (!cached) return undefined;

    if (Date.now() > cached.timestamp + cached.ttl) {
      this.clientState.delete(`cache_${key}`);
      return undefined;
    }

    return cached.data;
  }

  clearCache(key?: string) {
    if (key) {
      this.clientState.delete(`cache_${key}`);
    } else {
      const keys = Array.from(this.clientState['state'].keys());
      keys.forEach(k => {
        if (k.startsWith('cache_')) {
          this.clientState.delete(k);
        }
      });
    }
  }

  subscribe<T>(key: string, callback: (value: T) => void) {
    return this.clientState.subscribe(key, (value: unknown) => callback(value as T));
  }

  reset() {
    this.clientState.clear();
  }
}
