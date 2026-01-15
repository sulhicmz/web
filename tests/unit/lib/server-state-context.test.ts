import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ServerStateContext } from '../../../src/lib/state/server-state-context';
import type { StateContext } from '../../../src/lib/state/state-context';

describe('ServerStateContext', () => {
  let serverState: ServerStateContext;

  beforeEach(() => {
    serverState = new ServerStateContext();
  });

  describe('get and set', () => {
    it('should set and get string value', () => {
      serverState.set('key', 'value');
      expect(serverState.get('key')).toBe('value');
    });

    it('should set and get number value', () => {
      serverState.set('count', 42);
      expect(serverState.get('count')).toBe(42);
    });

    it('should set and get object value', () => {
      const obj = { name: 'test', value: 123 };
      serverState.set('obj', obj);
      expect(serverState.get('obj')).toEqual(obj);
    });

    it('should set and get array value', () => {
      const arr = [1, 2, 3, 4, 5];
      serverState.set('arr', arr);
      expect(serverState.get('arr')).toEqual(arr);
    });

    it('should return undefined for non-existent key', () => {
      expect(serverState.get('nonexistent')).toBeUndefined();
    });

    it('should overwrite existing value', () => {
      serverState.set('key', 'value1');
      serverState.set('key', 'value2');
      expect(serverState.get('key')).toBe('value2');
    });
  });

  describe('update', () => {
    it('should update value with function', () => {
      serverState.set('count', 5);
      serverState.update('count', (prev) => (prev as number) + 10);
      expect(serverState.get('count')).toBe(15);
    });

    it('should update object with function', () => {
      serverState.set('obj', { count: 5 });
      serverState.update('obj', (prev) => {
        const obj = prev as { count: number };
        return { ...obj, count: obj.count + 10 };
      });
      expect(serverState.get('obj')).toEqual({ count: 15 });
    });

    it('should handle undefined previous value', () => {
      serverState.update('newKey', () => 'default');
      expect(serverState.get('newKey')).toBe('default');
    });
  });

  describe('delete', () => {
    it('should delete existing key', () => {
      serverState.set('key', 'value');
      serverState.delete('key');
      expect(serverState.get('key')).toBeUndefined();
    });

    it('should handle deleting non-existent key', () => {
      expect(() => serverState.delete('nonexistent')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all values', () => {
      serverState.set('key1', 'value1');
      serverState.set('key2', 'value2');
      serverState.set('key3', 'value3');

      serverState.clear();

      expect(serverState.get('key1')).toBeUndefined();
      expect(serverState.get('key2')).toBeUndefined();
      expect(serverState.get('key3')).toBeUndefined();
    });
  });

  describe('subscribe (no-op)', () => {
    it('should return empty function for subscribe', () => {
      const listener = vi.fn();
      const unsubscribe = serverState.subscribe('key', listener);

      expect(unsubscribe).toBeInstanceOf(Function);
      expect(unsubscribe()).toBeUndefined();
    });

    it('should not call listeners (no reactivity on server)', () => {
      const listener = vi.fn();
      serverState.subscribe('key', listener);

      serverState.set('key', 'value');
      serverState.set('key', 'value2');

      expect(listener).not.toHaveBeenCalled();
    });

    it('should handle multiple listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const listener3 = vi.fn();

      serverState.subscribe('key1', listener1);
      serverState.subscribe('key2', listener2);
      serverState.subscribe('key3', listener3);

      serverState.set('key1', 'value1');
      serverState.set('key2', 'value2');
      serverState.set('key3', 'value3');

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
      expect(listener3).not.toHaveBeenCalled();
    });
  });

  describe('computed', () => {
    it('should compute value and set it in state', () => {
      const result = serverState.computed('sum', () => 5 + 10);

      expect(result).toBe(15);
      expect(serverState.get('sum')).toBe(15);
    });

    it('should compute complex value', () => {
      serverState.set('count', 5);

      const result = serverState.computed('doubled', () => {
        const count = serverState.get<number>('count');
        return count ? count * 2 : 0;
      });

      expect(result).toBe(10);
    });
  });

  describe('type safety', () => {
    it('should handle type-safe operations', () => {
      interface User {
        name: string;
        email: string;
        age?: number;
      }

      serverState.set<User>('user', { name: 'John', email: 'john@example.com' });
      const user = serverState.get<User>('user');

      expect(user?.name).toBe('John');
      expect(user?.email).toBe('john@example.com');
      expect(user?.age).toBeUndefined();
    });

    it('should handle union types', () => {
      type Status = 'pending' | 'approved' | 'rejected';

      serverState.set<Status>('status', 'pending');
      const status = serverState.get<Status>('status');

      expect(status).toBe('pending');
    });
  });

  describe('Integration', () => {
    it('should handle complex state flow', () => {
      serverState.set('user', { name: 'John', age: 30 });
      serverState.update('user', (prev) => {
        const user = prev as { name: string; age: number };
        return { ...user, age: user.age + 1 };
      });

      expect(serverState.get('user')).toEqual({ name: 'John', age: 31 });
    });

    it('should handle multiple independent keys', () => {
      serverState.set('user', { id: 1, name: 'Alice' });
      serverState.set('settings', { theme: 'dark' });
      serverState.set('count', 42);

      expect(serverState.get('user')).toEqual({ id: 1, name: 'Alice' });
      expect(serverState.get('settings')).toEqual({ theme: 'dark' });
      expect(serverState.get('count')).toBe(42);
    });

    it('should handle state isolation between instances', () => {
      const serverState1 = new ServerStateContext();
      const serverState2 = new ServerStateContext();

      serverState1.set('key', 'value1');
      serverState2.set('key', 'value2');

      expect(serverState1.get('key')).toBe('value1');
      expect(serverState2.get('key')).toBe('value2');
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in keys', () => {
      serverState.set('key with spaces', 'value1');
      serverState.set('key-with-dashes', 'value2');
      serverState.set('key_with_underscores', 'value3');
      serverState.set('key/with/slashes', 'value4');

      expect(serverState.get('key with spaces')).toBe('value1');
      expect(serverState.get('key-with-dashes')).toBe('value2');
      expect(serverState.get('key_with_underscores')).toBe('value3');
      expect(serverState.get('key/with/slashes')).toBe('value4');
    });

    it('should handle very large state', () => {
      const largeData = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        data: `Item ${i}`.repeat(10)
      }));

      serverState.set('large', largeData);

      expect(serverState.get('large')).toEqual(largeData);
    });

    it('should handle null and undefined values', () => {
      serverState.set('nullKey', null);
      serverState.set('undefinedKey', undefined);

      expect(serverState.get('nullKey')).toBeNull();
      expect(serverState.get('undefinedKey')).toBeUndefined();
    });

    it('should handle nested objects with null values', () => {
      const nested = {
        level1: {
          level2: {
            value: null,
            other: 'value'
          }
        }
      };

      serverState.set('nested', nested);

      expect(serverState.get('nested')).toEqual(nested);
    });

    it('should handle rapid updates', () => {
      for (let i = 0; i < 1000; i++) {
        serverState.set('rapid', { iteration: i });
      }

      const finalState = serverState.get<{ iteration: number }>('rapid');
      expect(finalState?.iteration).toBe(999);
    });

    it('should handle Maps and Sets', () => {
      const map = new Map([['key1', 'value1'], ['key2', 'value2']]);
      const set = new Set([1, 2, 3]);

      serverState.set('myMap', map);
      serverState.set('mySet', set);

      const retrievedMap = serverState.get<Map<string, string>>('myMap');
      const retrievedSet = serverState.get<Set<number>>('mySet');

      expect(retrievedMap).toEqual(map);
      expect(retrievedSet).toEqual(set);
    });
  });

  describe('Comparison with ClientStateContext', () => {
    it('should have same interface as StateContext', () => {
      const stateContext: StateContext = serverState;

      expect(stateContext.get).toBeInstanceOf(Function);
      expect(stateContext.set).toBeInstanceOf(Function);
      expect(stateContext.update).toBeInstanceOf(Function);
      expect(stateContext.delete).toBeInstanceOf(Function);
      expect(stateContext.clear).toBeInstanceOf(Function);
      expect(stateContext.subscribe).toBeInstanceOf(Function);
      expect(stateContext.computed).toBeInstanceOf(Function);
    });

    it('should not be reactive (subscribe is no-op)', () => {
      const listener = vi.fn();
      serverState.subscribe('key', listener);

      serverState.set('key', 'value');

      expect(listener).not.toHaveBeenCalled();
    });
  });
});
