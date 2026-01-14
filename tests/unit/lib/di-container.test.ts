import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DIContainer } from '../../../src/lib/di/container';

describe('DIContainer', () => {
  let container: DIContainer;

  beforeEach(() => {
    container = new DIContainer();
  });

  describe('register', () => {
    it('should register a service with singleton scope by default', () => {
      const factory = vi.fn(() => ({ name: 'test' }));
      container.register('test-service', factory, 'singleton');
      expect(factory).not.toHaveBeenCalled();
    });

    it('should register a service with singleton scope', () => {
      const factory = vi.fn(() => ({ name: 'test' }));
      container.register('test-service', factory, 'singleton');
      const result = container.resolve<{ name: string }>('test-service');
      expect(result.name).toBe('test');
    });

    it('should register a service with transient scope', () => {
      const factory = vi.fn(() => ({ name: 'test' }));
      container.register('test-service', factory, 'transient');
      const result = container.resolve<{ name: string }>('test-service');
      expect(result.name).toBe('test');
    });

    it('should allow registering multiple services', () => {
      container.register('service1', () => ({ id: 1 }), 'singleton');
      container.register('service2', () => ({ id: 2 }), 'singleton');
      container.register('service3', () => ({ id: 3 }), 'transient');
      expect(container.has('service1')).toBe(true);
      expect(container.has('service2')).toBe(true);
      expect(container.has('service3')).toBe(true);
    });

    it('should overwrite existing service registration', () => {
      const factory1 = vi.fn(() => ({ version: 1 }));
      const factory2 = vi.fn(() => ({ version: 2 }));
      
      container.register('test-service', factory1, 'singleton');
      container.register('test-service', factory2, 'singleton');
      
      const result = container.resolve<{ version: number }>('test-service');
      expect(result.version).toBe(2);
      expect(factory1).not.toHaveBeenCalled();
      expect(factory2).toHaveBeenCalledTimes(1);
    });
  });

  describe('resolve - singleton scope', () => {
    it('should resolve singleton service on first call', () => {
      const factory = vi.fn(() => ({ name: 'singleton-service' }));
      container.register('test-service', factory, 'singleton');
      
      const result = container.resolve<{ name: string }>('test-service');
      
      expect(factory).toHaveBeenCalledTimes(1);
      expect(result.name).toBe('singleton-service');
    });

    it('should return same instance for singleton on subsequent calls', () => {
      const factory = vi.fn(() => ({ name: 'singleton-service', id: Math.random() }));
      container.register('test-service', factory, 'singleton');
      
      const instance1 = container.resolve('test-service');
      const instance2 = container.resolve('test-service');
      const instance3 = container.resolve('test-service');
      
      expect(factory).toHaveBeenCalledTimes(1);
      expect(instance1).toBe(instance2);
      expect(instance2).toBe(instance3);
    });

    it('should resolve singleton service with complex factory', () => {
      interface TestService {
        getData: () => string;
        increment: () => void;
        getCount: () => number;
      }
      
      const factory = (): TestService => {
        let count = 0;
        return {
          getData: () => `count: ${count}`,
          increment: () => { count++; },
          getCount: () => count,
        };
      };
      
      container.register('complex-service', factory, 'singleton');
      
      const instance1 = container.resolve<TestService>('complex-service');
      instance1.increment();
      instance1.increment();
      
      const instance2 = container.resolve<TestService>('complex-service');
      
      expect(instance2.getCount()).toBe(2);
      expect(instance1).toBe(instance2);
    });
  });

  describe('resolve - transient scope', () => {
    it('should resolve transient service on first call', () => {
      const factory = vi.fn(() => ({ name: 'transient-service' }));
      container.register('test-service', factory, 'transient');
      const result = container.resolve<{ name: string }>('test-service');
      expect(factory).toHaveBeenCalledTimes(1);
      expect(result.name).toBe('transient-service');
    });

    it('should return new instance for transient on each call', () => {
      const factory = vi.fn(() => ({ name: 'transient-service', id: Math.random() }));
      container.register('test-service', factory, 'transient');
      
      const instance1 = container.resolve('test-service');
      const instance2 = container.resolve('test-service');
      const instance3 = container.resolve('test-service');
      
      expect(factory).toHaveBeenCalledTimes(3);
      expect(instance1).not.toBe(instance2);
      expect(instance2).not.toBe(instance3);
      expect(instance3).not.toBe(instance1);
    });

    it('should create independent instances for transient service', () => {
      interface TestService {
        increment: () => void;
        getCount: () => number;
      }
      
      const factory = (): TestService => {
        let count = 0;
        return {
          increment: () => { count++; },
          getCount: () => count,
        };
      };
      
      container.register('counter-service', factory, 'transient');
      
      const instance1 = container.resolve<TestService>('counter-service');
      const instance2 = container.resolve<TestService>('counter-service');
      
      instance1.increment();
      instance1.increment();
      instance2.increment();
      
      expect(instance1.getCount()).toBe(2);
      expect(instance2.getCount()).toBe(1);
    });
  });

  describe('resolve - mixed scopes', () => {
    it('should handle mixture of singleton and transient services', () => {
      const singletonFactory = vi.fn(() => ({ type: 'singleton' }));
      const transientFactory = vi.fn(() => ({ type: 'transient' }));
      
      container.register('singleton', singletonFactory, 'singleton');
      container.register('transient', transientFactory, 'transient');
      
      const singleton1 = container.resolve('singleton');
      const singleton2 = container.resolve('singleton');
      const transient1 = container.resolve('transient');
      const transient2 = container.resolve('transient');
      
      expect(singletonFactory).toHaveBeenCalledTimes(1);
      expect(transientFactory).toHaveBeenCalledTimes(2);
      expect(singleton1).toBe(singleton2);
      expect(transient1).not.toBe(transient2);
    });
  });

  describe('resolve - error handling', () => {
    it('should throw error when resolving unregistered service', () => {
      expect(() => container.resolve('non-existent-service')).toThrow(
        "Service 'non-existent-service' not registered"
      );
    });

    it('should throw error with descriptive message for unregistered service', () => {
      expect(() => container.resolve('missing-service')).toThrow(
        expect.objectContaining({
          message: expect.stringContaining('missing-service'),
        })
      );
    });
  });

  describe('has', () => {
    it('should return true for registered service', () => {
      container.register('test-service', () => ({}), 'singleton');
      expect(container.has('test-service')).toBe(true);
    });

    it('should return false for unregistered service', () => {
      expect(container.has('non-existent-service')).toBe(false);
    });

    it('should return false after clearing container', () => {
      container.register('test-service', () => ({}), 'singleton');
      expect(container.has('test-service')).toBe(true);
      
      container.clear();
      expect(container.has('test-service')).toBe(false);
    });

    it('should check multiple services', () => {
      container.register('service1', () => ({}), 'singleton');
      container.register('service2', () => ({}), 'singleton');
      
      expect(container.has('service1')).toBe(true);
      expect(container.has('service2')).toBe(true);
      expect(container.has('service3')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all registered services', () => {
      container.register('service1', () => ({ id: 1 }), 'singleton');
      container.register('service2', () => ({ id: 2 }), 'transient');
      container.register('service3', () => ({ id: 3 }), 'singleton');
      
      expect(container.has('service1')).toBe(true);
      expect(container.has('service2')).toBe(true);
      expect(container.has('service3')).toBe(true);
      
      container.clear();
      
      expect(container.has('service1')).toBe(false);
      expect(container.has('service2')).toBe(false);
      expect(container.has('service3')).toBe(false);
    });

    it('should clear singleton cache', () => {
      const factory = vi.fn(() => ({ name: 'test' }));
      container.register('test-service', factory, 'singleton');
      
      container.resolve('test-service');
      expect(factory).toHaveBeenCalledTimes(1);
      
      container.clear();
      
      container.register('test-service', factory, 'singleton');
      container.resolve('test-service');
      expect(factory).toHaveBeenCalledTimes(2);
    });

    it('should allow re-registering after clear', () => {
      const factory1 = vi.fn(() => ({ version: 1 }));
      const factory2 = vi.fn(() => ({ version: 2 }));
      
      container.register('test-service', factory1, 'singleton');
      container.resolve('test-service');
      expect(factory1).toHaveBeenCalledTimes(1);
      
      container.clear();
      
      container.register('test-service', factory2, 'singleton');
      container.resolve('test-service');
      expect(factory2).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge cases', () => {
    it('should handle service names with special characters', () => {
      const factory = vi.fn(() => ({}));
      container.register('service-with-dash', factory, 'singleton');
      container.register('service.with.dots', factory, 'singleton');
      container.register('service_with_underscore', factory, 'singleton');
      
      expect(container.has('service-with-dash')).toBe(true);
      expect(container.has('service.with.dots')).toBe(true);
      expect(container.has('service_with_underscore')).toBe(true);
    });

    it('should handle empty service name', () => {
      const factory = vi.fn(() => ({}));
      container.register('', factory, 'singleton');
      
      expect(container.has('')).toBe(true);
      expect(container.resolve('')).toBeDefined();
    });

    it('should handle factory that returns null', () => {
      container.register('null-service', () => null, 'singleton');
      
      const result = container.resolve('null-service');
      expect(result).toBeNull();
    });

    it('should handle factory that returns undefined', () => {
      container.register('undefined-service', () => undefined, 'singleton');
      
      const result = container.resolve('undefined-service');
      expect(result).toBeUndefined();
    });

    it('should handle factory that throws error', () => {
      const factory = () => {
        throw new Error('Factory error');
      };
      
      container.register('error-service', factory, 'singleton');
      
      expect(() => container.resolve('error-service')).toThrow('Factory error');
    });

    it('should handle factory with side effects (called once for singleton)', () => {
      let callCount = 0;
      const factory = () => {
        callCount++;
        return { callCount };
      };
      
      container.register('side-effect-service', factory, 'singleton');
      
      container.resolve('side-effect-service');
      container.resolve('side-effect-service');
      container.resolve('side-effect-service');
      
      expect(callCount).toBe(1);
    });

    it('should handle many registrations and resolutions', () => {
      const count = 100;
      
      for (let i = 0; i < count; i++) {
        container.register(`service-${i}`, () => ({ id: i }), 'singleton');
      }
      
      for (let i = 0; i < count; i++) {
        const service = container.resolve<{ id: number }>(`service-${i}`);
        expect(service.id).toBe(i);
      }
    });
  });

  describe('integration scenarios', () => {
    it('should support dependency injection pattern', () => {
      interface Logger {
        log: (message: string) => void;
      }
      
      interface Database {
        connect: () => void;
        query: (sql: string) => unknown[];
      }
      
      interface Service {
        execute: () => void;
      }
      
      const loggerFactory = (): Logger => ({
        log: (message: string) => console.log(`[LOG] ${message}`),
      });
      
      const dbFactory = (): Database => ({
        connect: () => console.log('Connecting to database...'),
        query: (sql: string) => [{ id: 1, name: 'test' }],
      });
      
      const serviceFactory = (logger: Logger, db: Database): Service => ({
        execute: () => {
          logger.log('Starting execution');
          db.connect();
          const results = db.query('SELECT * FROM users');
          logger.log(`Query returned ${results.length} results`);
        },
      });
      
      container.register('logger', loggerFactory, 'singleton');
      container.register('database', dbFactory, 'singleton');
      
      container.register('service', () => {
        const logger = container.resolve<Logger>('logger');
        const db = container.resolve<Database>('database');
        return serviceFactory(logger, db);
      }, 'singleton');
      
      const service = container.resolve<Service>('service');
      expect(service).toBeDefined();
      expect(typeof service.execute).toBe('function');
    });

    it('should support resetting container for test isolation', () => {
      const factory = vi.fn(() => ({ data: 'test' }));
      
      container.register('test-service', factory, 'singleton');
      container.resolve('test-service');
      expect(factory).toHaveBeenCalledTimes(1);
      
      container.clear();
      
      container.register('test-service', factory, 'singleton');
      container.resolve('test-service');
      expect(factory).toHaveBeenCalledTimes(2);
    });
  });
});
