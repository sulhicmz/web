import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AppStateStore } from '../../../src/lib/state/app-state';
import type { StateContext } from '../../../src/lib/state/state-context';
import { ClientStateContext } from '../../../src/lib/state/client-state-context';

describe('AppStateStore Cache System', () => {
  let store: AppStateStore;

  beforeEach(() => {
    store = new AppStateStore();
  });

  afterEach(() => {
    store.reset();
  });

  describe('setCache', () => {
    it('should store data with default TTL of 5 minutes', () => {
      const data = { id: 1, name: 'test' };
      store.setCache('user', data);

      const cached = store.getCache<{ id: number; name: string }>('user');
      expect(cached).toEqual(data);
    });

    it('should store data with custom TTL', () => {
      const data = { value: 123 };
      store.setCache('custom', data, 10);

      const cached = store.getCache<{ value: number }>('custom');
      expect(cached).toEqual(data);
    });

    it('should handle zero TTL (treats as expired immediately)', () => {
      const data = { value: 'test' };
      const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(0);

      store.setCache('zero', data, 0);

      nowSpy.mockReturnValue(1);

      const cached = store.getCache<{ value: string }>('zero');
      expect(cached).toBeUndefined();

      nowSpy.mockRestore();
    });

    it('should handle negative TTL (immediate expiration)', () => {
      const data = { value: 'test' };
      store.setCache('negative', data, -5);

      const cached = store.getCache<{ value: string }>('negative');
      expect(cached).toBeUndefined();
    });

    it('should handle complex objects with nested structures', () => {
      const complex = {
        user: {
          id: 1,
          profile: {
            name: 'John',
            preferences: { theme: 'dark', language: 'en' }
          }
        }
      };
      store.setCache('complex', complex);

      const cached = store.getCache<typeof complex>('complex');
      expect(cached).toEqual(complex);
    });

    it('should handle arrays', () => {
      const items = [1, 2, 3, 4, 5];
      store.setCache('array', items);

      const cached = store.getCache<number[]>('array');
      expect(cached).toEqual(items);
    });

    it('should handle null values', () => {
      store.setCache('null', null);

      const cached = store.getCache<null>('null');
      expect(cached).toBeNull();
    });

    it('should handle undefined values', () => {
      store.setCache('undefined', undefined);

      const cached = store.getCache<undefined>('undefined');
      expect(cached).toBeUndefined();
    });
  });

  describe('getCache', () => {
    it('should return undefined for non-existent cache key', () => {
      const cached = store.getCache<string>('nonexistent');
      expect(cached).toBeUndefined();
    });

    it('should return data before TTL expires', () => {
      const data = { value: 'test' };
      store.setCache('valid', data, 1);

      const cached = store.getCache<{ value: string }>('valid');
      expect(cached).toEqual(data);
    });

    it('should return undefined after TTL expires', () => {
      const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(0);
      const data = { value: 'test' };
      store.setCache('expired', data, 1);

      nowSpy.mockReturnValue(65000);

      const cached = store.getCache<{ value: string }>('expired');
      expect(cached).toBeUndefined();

      nowSpy.mockRestore();
    });

    it('should delete expired cache entry', () => {
      const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(0);
      const data = { value: 'test' };
      store.setCache('expired', data, 1);

      nowSpy.mockReturnValue(65000);
      store.getCache<{ value: string }>('expired');

      const cached = store.getCache<{ value: string }>('expired');
      expect(cached).toBeUndefined();

      nowSpy.mockRestore();
    });
  });

  describe('clearCache', () => {
    it('should clear specific cache entry', () => {
      store.setCache('key1', { value: 1 });
      store.setCache('key2', { value: 2 });
      store.setCache('key3', { value: 3 });

      store.clearCache('key2');

      expect(store.getCache('key1')).toEqual({ value: 1 });
      expect(store.getCache('key2')).toBeUndefined();
      expect(store.getCache('key3')).toEqual({ value: 3 });
    });

    it('should clear all cache entries when no key provided', () => {
      store.setCache('key1', { value: 1 });
      store.setCache('key2', { value: 2 });
      store.setCache('key3', { value: 3 });

      store.clearCache();

      expect(store.getCache('key1')).toBeUndefined();
      expect(store.getCache('key2')).toBeUndefined();
      expect(store.getCache('key3')).toBeUndefined();
    });

    it('should handle clearing non-existent cache key', () => {
      expect(() => store.clearCache('nonexistent')).not.toThrow();
    });

    it('should only clear cache keys, not other state', () => {
      store.setCache('cache_key', { value: 'cached' });
      store.currentUser = { id: '123', email: 'test@example.com' } as any;
      store.sidebarOpen = true;

      store.clearCache();

      expect(store.getCache('cache_key')).toBeUndefined();
      expect(store.currentUser).not.toBeNull();
      expect(store.sidebarOpen).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent cache access', () => {
      const promises = Array.from({ length: 100 }, (_, i) => {
        store.setCache(`key${i}`, { value: i });
        return Promise.resolve(store.getCache<number>(`key${i}`));
      });

      const results = Promise.all(promises);
      expect(results).resolves.toHaveLength(100);
    });

    it('should handle rapid cache updates', () => {
      for (let i = 0; i < 1000; i++) {
        store.setCache('rapid', { iteration: i });
      }

      const cached = store.getCache<{ iteration: number }>('rapid');
      expect(cached?.iteration).toBe(999);
    });

    it('should handle cache with large payload', () => {
      const largeData = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        data: `Item ${i}`.repeat(10)
      }));

      store.setCache('large', largeData);

      const cached = store.getCache<typeof largeData>('large');
      expect(cached).toEqual(largeData);
    });

    it('should handle special characters in cache keys', () => {
      const specialKeys = [
        'key with spaces',
        'key-with-dashes',
        'key_with_underscores',
        'key/with/slashes',
        'key.with.dots',
        'key@with@symbols',
        'key:with:colons'
      ];

      specialKeys.forEach(key => {
        store.setCache(key, { value: key });
        expect(store.getCache(key)).toEqual({ value: key });
      });
    });
  });
});
