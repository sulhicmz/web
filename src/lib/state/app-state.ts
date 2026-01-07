// ==========================================================================
// AstroPro Digital - App State Store
// Manajemen state aplikasi dengan reactive subscriptions
// ==========================================================================

import type { User } from '@supabase/supabase-js';
import { ClientStateManager } from './client-state';

export class AppStateStore {
  private clientState = ClientStateManager.getInstance();

  get currentUser() {
    return this.clientState.get<User>('current_user');
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
    return this.clientState.get<any[]>('notifications') || [];
  }

  set notifications(notifications: any[]) {
    this.clientState.set('notifications', notifications);
  }

  get unreadCount() {
    return this.notifications.filter(n => !n.isRead).length;
  }

  get currentProject() {
    return this.clientState.get<any>('current_project');
  }

  set currentProject(project: any) {
    this.clientState.set('current_project', project);
  }

  setFormState(formName: string, state: any) {
    this.clientState.set(`form_${formName}`, state);
  }

  getFormState(formName: string) {
    return this.clientState.get(`form_${formName}`);
  }

  clearFormState(formName: string) {
    this.clientState.delete(`form_${formName}`);
  }

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
      const keys = Array.from(this.clientState['state'].keys());
      keys.forEach(k => {
        if (k.startsWith('cache_')) {
          this.clientState.delete(k);
        }
      });
    }
  }

  subscribe(key: string, callback: (value: any) => void) {
    return this.clientState.subscribe(key, callback);
  }

  reset() {
    this.clientState.clear();
  }
}
