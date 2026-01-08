import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AppStateStore } from '../../../src/lib/state/app-state';

describe('AppStateStore Form State Management', () => {
  let store: AppStateStore;

  beforeEach(() => {
    store = new AppStateStore();
  });

  afterEach(() => {
    store.reset();
  });

  describe('setFormState and getFormState', () => {
    it('should store and retrieve form state', () => {
      const formData = { username: 'john', email: 'john@example.com' };
      store.setFormState('login', formData);

      const retrieved = store.getFormState<typeof formData>('login');
      expect(retrieved).toEqual(formData);
    });

    it('should handle complex form data', () => {
      const complexForm = {
        user: { name: 'John', age: 30 },
        preferences: { theme: 'dark', notifications: true },
        tags: ['tag1', 'tag2', 'tag3']
      };
      store.setFormState('profile', complexForm);

      const retrieved = store.getFormState<typeof complexForm>('profile');
      expect(retrieved).toEqual(complexForm);
    });

    it('should handle empty form data', () => {
      store.setFormState('empty', {});

      const retrieved = store.getFormState<{}>('empty');
      expect(retrieved).toEqual({});
    });

    it('should handle null form data', () => {
      store.setFormState('null', null);

      const retrieved = store.getFormState<null>('null');
      expect(retrieved).toBeNull();
    });

    it('should return undefined for non-existent form state', () => {
      const retrieved = store.getFormState('nonexistent');
      expect(retrieved).toBeUndefined();
    });

    it('should handle special characters in form name', () => {
      const formData = { value: 'test' };
      store.setFormState('form with spaces', formData);
      store.setFormState('form-with-dashes', formData);
      store.setFormState('form_with_underscores', formData);
      store.setFormState('form/with/slashes', formData);

      expect(store.getFormState('form with spaces')).toEqual(formData);
      expect(store.getFormState('form-with-dashes')).toEqual(formData);
      expect(store.getFormState('form_with_underscores')).toEqual(formData);
      expect(store.getFormState('form/with/slashes')).toEqual(formData);
    });
  });

  describe('updateFormState through get/set pattern', () => {
    it('should update form state using get/set pattern', () => {
      store.setFormState('counter', { count: 0 });
      const current = store.getFormState<{ count: number }>('counter');
      store.setFormState('counter', { count: (current?.count ?? 0) + 1 });

      const updated = store.getFormState<{ count: number }>('counter');
      expect(updated?.count).toBe(1);
    });

    it('should handle nested field updates', () => {
      const initialUser = { profile: { name: 'John', age: 30 } };
      store.setFormState('user', initialUser);
      const current = store.getFormState<{ profile: { name: string; age: number } }>('user');
      const updatedUser = {
        ...current!,
        profile: { ...current!.profile, age: 31 }
      };
      store.setFormState('user', updatedUser);

      const updated = store.getFormState<{ profile: { name: string; age: number } }>('user');
      expect(updated?.profile.age).toBe(31);
    });
  });

  describe('clearFormState', () => {
    it('should clear specific form state', () => {
      store.setFormState('form1', { data: 'test1' });
      store.setFormState('form2', { data: 'test2' });
      store.setFormState('form3', { data: 'test3' });

      store.clearFormState('form2');

      expect(store.getFormState('form1')).toEqual({ data: 'test1' });
      expect(store.getFormState('form2')).toBeUndefined();
      expect(store.getFormState('form3')).toEqual({ data: 'test3' });
    });

    it('should handle clearing non-existent form state', () => {
      expect(() => store.clearFormState('nonexistent')).not.toThrow();
    });

    it('should only clear form state, not other state', () => {
      store.setFormState('login', { username: 'john' });
      store.currentUser = { id: '123', email: 'test@example.com' } as any;
      store.notifications = [{ id: '1', message: 'Test', type: 'info' as const, isRead: false, timestamp: '2024-01-01' }];

      store.clearFormState('login');

      expect(store.getFormState('login')).toBeUndefined();
      expect(store.currentUser).not.toBeNull();
      expect(store.notifications).toHaveLength(1);
    });
  });

  describe('form state isolation', () => {
    it('should keep form states separate from each other', () => {
      store.setFormState('login', { username: 'john' });
      store.setFormState('register', { username: 'jane', email: 'jane@example.com' });
      store.setFormState('profile', { name: 'John Doe', bio: 'Developer' });

      expect(store.getFormState('login')).toEqual({ username: 'john' });
      expect(store.getFormState('register')).toEqual({ username: 'jane', email: 'jane@example.com' });
      expect(store.getFormState('profile')).toEqual({ name: 'John Doe', bio: 'Developer' });
    });

    it('should keep form states separate from app state', () => {
      store.setFormState('formData', { field1: 'value1' });
      store.currentUser = { id: '123', email: 'test@example.com' } as any;

      expect(store.getFormState('formData')).toEqual({ field1: 'value1' });
      expect(store.currentUser).not.toBeNull();

      store.clearFormState('formData');

      expect(store.getFormState('formData')).toBeUndefined();
      expect(store.currentUser).not.toBeNull();
    });
  });

  describe('form state with subscriptions', () => {
    it('should notify subscribers when form state changes', () => {
      const listener = vi.fn();
      store.subscribe('form_test', listener);

      store.setFormState('test', { value: 'initial' });
      expect(listener).toHaveBeenCalledTimes(1);

      store.setFormState('test', { value: 'updated' });
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it('should notify subscribers when form state is cleared', () => {
      const listener = vi.fn();
      store.setFormState('test', { value: 'initial' });
      store.subscribe('form_test', listener);

      store.clearFormState('test');
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(undefined);
    });

    it('should unsubscribe from form state changes', () => {
      const listener = vi.fn();
      const unsubscribe = store.subscribe('form_test', listener);

      unsubscribe();
      store.setFormState('test', { value: 'test' });

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('real-world form scenarios', () => {
    it('should handle login form flow', () => {
      const loginData = { username: '', password: '' };
      store.setFormState('login', loginData);

      const loginForm = store.getFormState<{ username: string; password: string }>('login');
      expect(loginForm).toEqual({ username: '', password: '' });

      store.setFormState('login', { username: 'john@example.com', password: 'password123' });

      const updatedForm = store.getFormState<{ username: string; password: string }>('login');
      expect(updatedForm?.username).toBe('john@example.com');
      expect(updatedForm?.password).toBe('password123');

      store.clearFormState('login');
      expect(store.getFormState('login')).toBeUndefined();
    });

    it('should handle multi-step form', () => {
      const step1 = { firstName: 'John', lastName: 'Doe' };
      const step2 = { address: '123 Main St', city: 'Anytown', zip: '12345' };
      const step3 = { creditCard: '**** **** **** 1234', expiry: '12/25' };

      store.setFormState('checkout', { step1, step2, step3 });

      const checkoutForm = store.getFormState<{ step1: typeof step1; step2: typeof step2; step3: typeof step3 }>('checkout');
      expect(checkoutForm).toEqual({ step1, step2, step3 });
    });

    it('should handle form with validation state', () => {
      const formData = {
        email: 'test@example.com',
        errors: { email: '', password: 'Password is required' },
        touched: { email: true, password: false }
      };

      store.setFormState('registration', formData);

      const formWithValidation = store.getFormState<typeof formData>('registration');
      expect(formWithValidation?.errors.password).toBe('Password is required');
      expect(formWithValidation?.touched.email).toBe(true);
    });

    it('should handle form with file uploads', () => {
      const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' });
      const file2 = new File(['content2'], 'file2.txt', { type: 'text/plain' });

      const uploadData = { files: [file1, file2], maxSize: 1024 * 1024 };
      store.setFormState('upload', uploadData);

      const uploadForm = store.getFormState<typeof uploadData>('upload');
      expect(uploadForm?.files).toHaveLength(2);
      expect(uploadForm?.files[0].name).toBe('file1.txt');
    });
  });

  describe('edge cases', () => {
    it('should handle very large form data', () => {
      const largeData = {
        items: Array.from({ length: 10000 }, (_, i) => ({
          id: i,
          name: `Item ${i}`,
          description: `Description ${i}`.repeat(10)
        }))
      };

      store.setFormState('large', largeData);

      const retrieved = store.getFormState<typeof largeData>('large');
      expect(retrieved?.items).toHaveLength(10000);
    });

    it('should handle circular references carefully', () => {
      const data: any = { name: 'test' };
      data.self = data;

      expect(() => store.setFormState('circular', data)).not.toThrow();
    });

    it('should handle rapid form state updates', () => {
      for (let i = 0; i < 100; i++) {
        store.setFormState('rapid', { iteration: i });
      }

      const finalState = store.getFormState<{ iteration: number }>('rapid');
      expect(finalState?.iteration).toBe(99);
    });

    it('should handle concurrent form operations', () => {
      const promises = Array.from({ length: 100 }, (_, i) => {
        store.setFormState(`form${i}`, { id: i });
        return Promise.resolve(store.getFormState(`form${i}`));
      });

      const results = Promise.all(promises);
      expect(results).resolves.toHaveLength(100);
    });
  });
});
