import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { StateContext } from '../../../src/lib/state/state-context';
import { ClientStateContext } from '../../../src/lib/state/client-state-context';

describe('Client State Manager', () => {
  let stateManager: StateContext;

  beforeEach(() => {
    stateManager = new ClientStateContext();
    stateManager.clear();
  });

  describe('set and get', () => {
    it('should set and get string value', () => {
      stateManager.set('key', 'value');
      expect(stateManager.get('key')).toBe('value');
    });

    it('should set and get number value', () => {
      stateManager.set('count', 42);
      expect(stateManager.get('count')).toBe(42);
    });

    it('should set and get object value', () => {
      const obj = { name: 'test', value: 123 };
      stateManager.set('obj', obj);
      expect(stateManager.get('obj')).toEqual(obj);
    });

    it('should set and get array value', () => {
      const arr = [1, 2, 3, 4, 5];
      stateManager.set('arr', arr);
      expect(stateManager.get('arr')).toEqual(arr);
    });

    it('should return undefined for non-existent key', () => {
      expect(stateManager.get('nonexistent')).toBeUndefined();
    });

    it('should overwrite existing value', () => {
      stateManager.set('key', 'value1');
      stateManager.set('key', 'value2');
      expect(stateManager.get('key')).toBe('value2');
    });
  });

  describe('update', () => {
    it('should update value with function', () => {
      stateManager.set('count', 5);
      stateManager.update('count', (prev) => (prev as number) + 10);
      expect(stateManager.get('count')).toBe(15);
    });

    it('should update object with function', () => {
      stateManager.set('obj', { count: 5 });
      stateManager.update('obj', (prev) => {
        const obj = prev as { count: number };
        return { ...obj, count: obj.count + 10 };
      });
      expect(stateManager.get('obj')).toEqual({ count: 15 });
    });

    it('should handle undefined previous value', () => {
      stateManager.update('newKey', () => 'default');
      expect(stateManager.get('newKey')).toBe('default');
    });
  });

  describe('delete', () => {
    it('should delete existing key', () => {
      stateManager.set('key', 'value');
      stateManager.delete('key');
      expect(stateManager.get('key')).toBeUndefined();
    });

    it('should handle deleting non-existent key', () => {
      expect(() => stateManager.delete('nonexistent')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all values', () => {
      stateManager.set('key1', 'value1');
      stateManager.set('key2', 'value2');
      stateManager.set('key3', 'value3');

      stateManager.clear();

      expect(stateManager.get('key1')).toBeUndefined();
      expect(stateManager.get('key2')).toBeUndefined();
      expect(stateManager.get('key3')).toBeUndefined();
    });

    it('should clear all listeners', () => {
      const listener = vi.fn();
      stateManager.subscribe('key', listener);

      stateManager.clear();

      stateManager.set('key', 'value');
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('subscribe', () => {
    it('should call listener when value is set', () => {
      const listener = vi.fn();
      stateManager.subscribe('key', listener);

      stateManager.set('key', 'value');

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith('value');
    });

    it('should call listener multiple times when value is updated', () => {
      const listener = vi.fn();
      stateManager.subscribe('key', listener);

      stateManager.set('key', 'value1');
      stateManager.set('key', 'value2');
      stateManager.set('key', 'value3');

      expect(listener).toHaveBeenCalledTimes(3);
      expect(listener).toHaveBeenNthCalledWith(1, 'value1');
      expect(listener).toHaveBeenNthCalledWith(2, 'value2');
      expect(listener).toHaveBeenNthCalledWith(3, 'value3');
    });

    it('should call listener when value is deleted', () => {
      const listener = vi.fn();
      stateManager.set('key', 'value');
      stateManager.subscribe('key', listener);

      stateManager.delete('key');

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(undefined);
    });

    it('should return unsubscribe function', () => {
      const listener = vi.fn();
      const unsubscribe = stateManager.subscribe('key', listener);

      unsubscribe();
      stateManager.set('key', 'value');

      expect(listener).not.toHaveBeenCalled();
    });

    it('should handle multiple listeners for same key', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const listener3 = vi.fn();

      stateManager.subscribe('key', listener1);
      stateManager.subscribe('key', listener2);
      stateManager.subscribe('key', listener3);

      stateManager.set('key', 'value');

      expect(listener1).toHaveBeenCalledWith('value');
      expect(listener2).toHaveBeenCalledWith('value');
      expect(listener3).toHaveBeenCalledWith('value');
    });

    it('should not call listener when different key is set', () => {
      const listener = vi.fn();
      stateManager.subscribe('key1', listener);

      stateManager.set('key2', 'value');

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('computed', () => {
    it('should compute value and set it in state', () => {
      const result = stateManager.computed('sum', () => 5 + 10);

      expect(result).toBe(15);
      expect(stateManager.get('sum')).toBe(15);
    });

    it('should compute complex value', () => {
      stateManager.set('count', 5);

      const result = stateManager.computed('doubled', () => {
        const count = stateManager.get<number>('count');
        return count ? count * 2 : 0;
      });

      expect(result).toBe(10);
    });
  });

  describe('Integration', () => {
    it('should handle complex state flow', () => {
      const listener = vi.fn();

      stateManager.subscribe('user', listener);
      stateManager.set('user', { name: 'John', age: 30 });
      stateManager.update('user', (prev) => {
        const user = prev as { name: string; age: number };
        return { ...user, age: user.age + 1 };
      });

      expect(stateManager.get('user')).toEqual({ name: 'John', age: 31 });
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it('should handle type-safe operations', () => {
      interface User {
        name: string;
        email: string;
        age?: number;
      }

      stateManager.set<User>('user', { name: 'John', email: 'john@example.com' });
      const user = stateManager.get<User>('user');

      expect(user?.name).toBe('John');
      expect(user?.email).toBe('john@example.com');
      expect(user?.age).toBeUndefined();
    });
  });
});
