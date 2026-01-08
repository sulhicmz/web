import { describe, it, expect, vi } from 'vitest';
import { createAppStateStore, createServerAppState, createClientAppState } from '../../../src/lib/state/factory';
import { ServerStateContext } from '../../../src/lib/state/server-state-context';
import { ClientStateContext } from '../../../src/lib/state/client-state-context';

describe('Factory Functions', () => {
  describe('createAppStateStore', () => {
    it('should create AppStateStore with default ClientStateContext', () => {
      const store = createAppStateStore();

      expect(store).toBeDefined();
      expect(store.sidebarOpen).toBe(false);
      expect(store.theme).toBe('system');
      expect(store.language).toBe('id');
    });

    it('should create AppStateStore with custom StateContext', () => {
      const customContext = new ServerStateContext();
      const store = createAppStateStore(customContext);

      expect(store).toBeDefined();
    });

    it('should allow setting state through custom context', () => {
      const customContext = new ServerStateContext();
      const store = createAppStateStore(customContext);

      store.sidebarOpen = true;

      expect(store.sidebarOpen).toBe(true);
    });
  });

  describe('createServerAppState', () => {
    it('should create AppStateStore with ServerStateContext', () => {
      const store = createServerAppState();

      expect(store).toBeDefined();
      expect(store.sidebarOpen).toBe(false);
      expect(store.theme).toBe('system');
      expect(store.language).toBe('id');
    });

    it('should not be reactive (server-side)', () => {
      const store = createServerAppState();

      const listener = vi.fn();
      store.subscribe('sidebar_open', listener);

      store.sidebarOpen = true;

      expect(listener).not.toHaveBeenCalled();
    });

    it('should support all store operations', () => {
      const store = createServerAppState();

      store.currentUser = { id: '123', email: 'test@example.com' } as any;
      store.theme = 'dark';
      store.sidebarOpen = true;
      store.isLoading = true;
      store.loadingMessage = 'Loading...';

      expect(store.currentUser).not.toBeNull();
      expect(store.theme).toBe('dark');
      expect(store.sidebarOpen).toBe(true);
      expect(store.isLoading).toBe(true);
      expect(store.loadingMessage).toBe('Loading...');
    });

    it('should handle form state management', () => {
      const store = createServerAppState();

      store.setFormState('login', { username: 'john' });
      const formData = store.getFormState<{ username: string }>('login');

      expect(formData).toEqual({ username: 'john' });

      store.clearFormState('login');
      expect(store.getFormState('login')).toBeUndefined();
    });

    it('should handle cache operations', () => {
      const store = createServerAppState();

      store.setCache('test', { value: 'cached' }, 5);
      const cached = store.getCache<{ value: string }>('test');

      expect(cached).toEqual({ value: 'cached' });

      store.clearCache('test');
      expect(store.getCache('test')).toBeUndefined();
    });

    it('should handle notifications', () => {
      const store = createServerAppState();

      const notifications = [
        { id: '1', message: 'Test', type: 'info' as const, isRead: false, timestamp: '2024-01-01' }
      ];
      store.notifications = notifications;

      expect(store.notifications).toHaveLength(1);
      expect(store.unreadCount).toBe(1);
    });

    it('should support reset', () => {
      const store = createServerAppState();

      store.currentUser = { id: '123', email: 'test@example.com' } as any;
      store.theme = 'dark';
      store.setFormState('test', { value: 'test' });

      store.reset();

      expect(store.currentUser).toBeNull();
      expect(store.theme).toBe('system');
      expect(store.getFormState('test')).toBeUndefined();
    });
  });

  describe('createClientAppState', () => {
    it('should create AppStateStore with ClientStateContext', () => {
      const store = createClientAppState();

      expect(store).toBeDefined();
      expect(store.sidebarOpen).toBe(false);
      expect(store.theme).toBe('system');
      expect(store.language).toBe('id');
    });

    it('should be reactive (client-side)', () => {
      const store = createClientAppState();

      const listener = vi.fn();
      store.subscribe('sidebar_open', listener);

      store.sidebarOpen = true;

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(true);
    });

    it('should support all store operations', () => {
      const store = createClientAppState();

      store.currentUser = { id: '123', email: 'test@example.com' } as any;
      store.theme = 'dark';
      store.sidebarOpen = true;
      store.isLoading = true;
      store.loadingMessage = 'Loading...';

      expect(store.currentUser).not.toBeNull();
      expect(store.theme).toBe('dark');
      expect(store.sidebarOpen).toBe(true);
      expect(store.isLoading).toBe(true);
      expect(store.loadingMessage).toBe('Loading...');
    });

    it('should handle form state management', () => {
      const store = createClientAppState();

      store.setFormState('login', { username: 'john' });
      const formData = store.getFormState<{ username: string }>('login');

      expect(formData).toEqual({ username: 'john' });

      store.clearFormState('login');
      expect(store.getFormState('login')).toBeUndefined();
    });

    it('should handle cache operations', () => {
      const store = createClientAppState();

      store.setCache('test', { value: 'cached' }, 5);
      const cached = store.getCache<{ value: string }>('test');

      expect(cached).toEqual({ value: 'cached' });

      store.clearCache('test');
      expect(store.getCache('test')).toBeUndefined();
    });

    it('should handle notifications', () => {
      const store = createClientAppState();

      const notifications = [
        { id: '1', message: 'Test', type: 'info' as const, isRead: false, timestamp: '2024-01-01' }
      ];
      store.notifications = notifications;

      expect(store.notifications).toHaveLength(1);
      expect(store.unreadCount).toBe(1);
    });

    it('should support reset', () => {
      const store = createClientAppState();

      store.currentUser = { id: '123', email: 'test@example.com' } as any;
      store.theme = 'dark';
      store.setFormState('test', { value: 'test' });

      store.reset();

      expect(store.currentUser).toBeNull();
      expect(store.theme).toBe('system');
      expect(store.getFormState('test')).toBeUndefined();
    });
  });

  describe('Factory Behavior Comparison', () => {
    it('server vs client reactivity', () => {
      const serverStore = createServerAppState();
      const clientStore = createClientAppState();

      const serverListener = vi.fn();
      const clientListener = vi.fn();

      serverStore.subscribe('theme', serverListener);
      clientStore.subscribe('theme', clientListener);

      serverStore.theme = 'dark';
      clientStore.theme = 'dark';

      expect(serverListener).not.toHaveBeenCalled();
      expect(clientListener).toHaveBeenCalledTimes(1);
    });

    it('server vs client state isolation', () => {
      const serverStore = createServerAppState();
      const clientStore = createClientAppState();

      serverStore.currentUser = { id: 'server-user', email: 'server@example.com' } as any;
      clientStore.currentUser = { id: 'client-user', email: 'client@example.com' } as any;

      expect(serverStore.currentUser?.email).toBe('server@example.com');
      expect(clientStore.currentUser?.email).toBe('client@example.com');
    });

    it('multiple factory calls create isolated instances', () => {
      const store1 = createServerAppState();
      const store2 = createServerAppState();

      store1.currentUser = { id: 'user1', email: 'user1@example.com' } as any;
      store2.currentUser = { id: 'user2', email: 'user2@example.com' } as any;

      expect(store1.currentUser?.email).toBe('user1@example.com');
      expect(store2.currentUser?.email).toBe('user2@example.com');
    });
  });

  describe('Real-world Usage Scenarios', () => {
    it('should handle server-side rendering flow', () => {
      const serverStore = createServerAppState();

      serverStore.currentUser = { id: '123', email: 'user@example.com' } as any;
      serverStore.theme = 'dark';
      serverStore.setFormState('checkout', { step: 2, data: { items: [1, 2, 3] } });

      const stateSnapshot = {
        currentUser: serverStore.currentUser,
        theme: serverStore.theme,
        checkoutData: serverStore.getFormState('checkout')
      };

      expect(stateSnapshot.currentUser).not.toBeNull();
      expect(stateSnapshot.theme).toBe('dark');
      expect(stateSnapshot.checkoutData).toEqual({ step: 2, data: { items: [1, 2, 3] } });
    });

    it('should handle client-side hydration flow', () => {
      const serverStore = createServerAppState();
      const clientStore = createClientAppState();

      serverStore.currentUser = { id: '123', email: 'user@example.com' } as any;
      serverStore.theme = 'dark';

      const snapshot = {
        currentUser: serverStore.currentUser,
        theme: serverStore.theme
      };

      clientStore.currentUser = snapshot.currentUser;
      clientStore.theme = snapshot.theme as any;

      expect(clientStore.currentUser?.email).toBe('user@example.com');
      expect(clientStore.theme).toBe('dark');
    });

    it('should handle user authentication flow', () => {
      const store = createClientAppState();

      expect(store.currentUser).toBeNull();

      store.currentUser = { id: '123', email: 'user@example.com', user_metadata: { name: 'John Doe' } } as any;

      expect(store.currentUser).not.toBeNull();
      expect(store.currentUser?.email).toBe('user@example.com');

      store.currentUser = null;

      expect(store.currentUser).toBeNull();
    });

    it('should handle multi-step form flow', () => {
      const store = createServerAppState();

      store.setFormState('registration', {
        step1: { firstName: 'John', lastName: 'Doe' },
        step2: { email: 'john@example.com', password: '***' },
        step3: { address: '123 Main St', city: 'Anytown' }
      });

      const formData = store.getFormState<{
        step1: { firstName: string; lastName: string };
        step2: { email: string; password: string };
        step3: { address: string; city: string };
      }>('registration');

      expect(formData?.step1.firstName).toBe('John');
      expect(formData?.step3.city).toBe('Anytown');
    });

    it('should handle cache TTL expiration', () => {
      const store = createClientAppState();
      const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(0);

      store.setCache('test', { value: 'cached' }, 1);

      const initial = store.getCache<{ value: string }>('test');
      expect(initial).toEqual({ value: 'cached' });

      nowSpy.mockReturnValue(65000);

      const expired = store.getCache<{ value: string }>('test');
      expect(expired).toBeUndefined();

      nowSpy.mockRestore();
    });
  });
});
