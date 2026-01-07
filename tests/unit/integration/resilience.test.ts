// ==========================================================================
// AstroPro Digital - Integration Resilience Tests
// Tests for resilience patterns: timeout, retry, circuit breaker
// ==========================================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  RetryManager,
  CircuitBreaker,
  TimeoutManager,
  ResilienceManager,
  CircuitBreakerError,
  TimeoutError,
  RetryExhaustedError,
} from '../../../src/lib/integration/resilience';

describe('RetryManager', () => {
  describe('retry', () => {
    it('should succeed on first attempt', async () => {
      const retryManager = new RetryManager();
      const operation = vi.fn().mockResolvedValue('success');

      const result = await retryManager.retry(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on network error', async () => {
      const retryManager = new RetryManager({ maxAttempts: 3 });
      const operation = vi
        .fn()
        .mockRejectedValueOnce(new Error('ECONNRESET'))
        .mockResolvedValue('success');

      const result = await retryManager.retry(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should respect maxAttempts and fail after exhausted', async () => {
      const retryManager = new RetryManager({ maxAttempts: 2, retryNonRetryableErrors: true });
      const operation = vi
        .fn()
        .mockRejectedValue(new Error('permanent error'));

      await expect(retryManager.retry(operation)).rejects.toThrow(RetryExhaustedError);
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should not retry on non-retryable errors', async () => {
      const retryManager = new RetryManager({ maxAttempts: 3 });
      const operation = vi.fn().mockRejectedValue(new Error('validation error'));

      await expect(retryManager.retry(operation)).rejects.toThrow('validation error');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should implement exponential backoff', async () => {
      const retryManager = new RetryManager({
        maxAttempts: 3,
        baseDelayMs: 100,
        backoffMultiplier: 2,
      });

      const delays: number[] = [];
      const originalDelay = (retryManager as unknown as { delay: (ms: number) => Promise<void> }).delay;
      (retryManager as unknown as { delay: (ms: number) => Promise<void> }).delay = (ms: number) => {
        delays.push(ms);
        return originalDelay.call(retryManager, ms);
      };

      const operation = vi
        .fn()
        .mockRejectedValueOnce(new Error('network'))
        .mockRejectedValueOnce(new Error('network'))
        .mockResolvedValue('success');

      await retryManager.retry(operation);

      expect(delays).toEqual([100, 200]);
    });

    it('should cap delay at maxDelayMs', async () => {
      const retryManager = new RetryManager({
        maxAttempts: 5,
        baseDelayMs: 100,
        maxDelayMs: 200,
        backoffMultiplier: 10,
      });

      const delays: number[] = [];
      const originalDelay = (retryManager as unknown as { delay: (ms: number) => Promise<void> }).delay;
      (retryManager as unknown as { delay: (ms: number) => Promise<void> }).delay = (ms: number) => {
        delays.push(ms);
        return originalDelay.call(retryManager, ms);
      };

      const operation = vi
        .fn()
        .mockRejectedValueOnce(new Error('network'))
        .mockRejectedValueOnce(new Error('network'))
        .mockRejectedValueOnce(new Error('network'))
        .mockResolvedValue('success');

      await retryManager.retry(operation);

      expect(delays).toEqual([100, 200, 200]);
    });

    it('should retry on retryable HTTP status codes', async () => {
      const retryManager = new RetryManager({
        maxAttempts: 3,
        retryableStatuses: [503],
      });

      const operation = vi
        .fn()
        .mockRejectedValueOnce({ status: 503, message: 'Service Unavailable' })
        .mockResolvedValue('success');

      const result = await retryManager.retry(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });
  });

  describe('isRetryableError', () => {
    it('should identify retryable error patterns', () => {
      const retryManager = new RetryManager();

      expect(retryManager.isRetryableError(new Error('ECONNRESET'))).toBe(true);
      expect(retryManager.isRetryableError(new Error('ETIMEDOUT'))).toBe(true);
      expect(retryManager.isRetryableError(new Error('network failure'))).toBe(true);
      expect(retryManager.isRetryableError(new Error('validation error'))).toBe(false);
    });
  });

  describe('isRetryableStatus', () => {
    it('should identify retryable status codes', () => {
      const retryManager = new RetryManager({
        retryableStatuses: [408, 429, 500, 502, 503, 504],
      });

      expect(retryManager.isRetryableStatus(408)).toBe(true);
      expect(retryManager.isRetryableStatus(429)).toBe(true);
      expect(retryManager.isRetryableStatus(500)).toBe(true);
      expect(retryManager.isRetryableStatus(503)).toBe(true);
      expect(retryManager.isRetryableStatus(404)).toBe(false);
      expect(retryManager.isRetryableStatus(400)).toBe(false);
    });
  });
});

describe('CircuitBreaker', () => {
  let circuitBreaker: CircuitBreaker;

  beforeEach(() => {
    circuitBreaker = new CircuitBreaker('test-service', {
      failureThreshold: 3,
      successThreshold: 2,
      timeoutMs: 10000,
      halfOpenMaxCalls: 1,
    });
  });

  afterEach(() => {
    circuitBreaker.reset();
  });

  describe('execute', () => {
    it('should execute successfully in closed state', async () => {
      const operation = vi.fn().mockResolvedValue('success');

      const result = await circuitBreaker.execute(operation);

      expect(result).toBe('success');
      expect(circuitBreaker.getState()).toBe('closed');
    });

    it('should open after failure threshold', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('failed'));

      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(operation);
        } catch {
          // Ignore
        }
      }

      expect(circuitBreaker.getState()).toBe('open');

      await expect(circuitBreaker.execute(operation)).rejects.toThrow(CircuitBreakerError);
    });

    it('should transition to half-open after timeout', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('failed'));

      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(operation);
        } catch {
          // Ignore
        }
      }

      expect(circuitBreaker.getState()).toBe('open');

      vi.spyOn(Date, 'now').mockReturnValueOnce(Date.now() + 15000);

      const successOperation = vi.fn().mockResolvedValue('success');
      const result = await circuitBreaker.execute(successOperation);

      expect(result).toBe('success');
      expect(circuitBreaker.getState()).toBe('half-open');
    });

    it('should close after success threshold in half-open', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('failed'));

      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(operation);
        } catch {
          // Ignore
        }
      }

      expect(circuitBreaker.getState()).toBe('open');

      vi.spyOn(Date, 'now').mockReturnValueOnce(Date.now() + 15000);

      const successOperation = vi.fn().mockResolvedValue('success');

      for (let i = 0; i < 2; i++) {
        await circuitBreaker.execute(successOperation);
      }

      expect(circuitBreaker.getState()).toBe('closed');
    });

    it('should reopen on failure in half-open state', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('failed'));

      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(operation);
        } catch {
          // Ignore
        }
      }

      expect(circuitBreaker.getState()).toBe('open');

      vi.spyOn(Date, 'now').mockReturnValueOnce(Date.now() + 15000);

      const successOperation = vi.fn().mockResolvedValue('success');
      const failOperation = vi.fn().mockRejectedValue(new Error('failed'));

      await circuitBreaker.execute(successOperation);

      try {
        await circuitBreaker.execute(failOperation);
      } catch {
        // Ignore
      }

      expect(circuitBreaker.getState()).toBe('open');
    });
  });

  describe('reset', () => {
    it('should reset circuit breaker to closed state', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('failed'));

      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(operation);
        } catch {
          // Ignore
        }
      }

      expect(circuitBreaker.getState()).toBe('open');

      circuitBreaker.reset();

      expect(circuitBreaker.getState()).toBe('closed');
      expect(circuitBreaker.getFailureCount()).toBe(0);
    });
  });
});

describe('TimeoutManager', () => {
  describe('execute', () => {
    it('should complete operation before timeout', async () => {
      const timeoutManager = new TimeoutManager({ timeoutMs: 1000 });
      const operation = vi.fn().mockResolvedValue('success');

      const result = await timeoutManager.execute(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should timeout on slow operation', async () => {
      const timeoutManager = new TimeoutManager({ timeoutMs: 100 });
      const operation = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 500))
      );

      await expect(timeoutManager.execute(operation)).rejects.toThrow(TimeoutError);
    });

    it('should call onTimeout callback', async () => {
      const onTimeout = vi.fn();
      const timeoutManager = new TimeoutManager({ timeoutMs: 100, onTimeout });
      const operation = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 500))
      );

      await expect(timeoutManager.execute(operation)).rejects.toThrow(TimeoutError);
      expect(onTimeout).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors from operation', async () => {
      const timeoutManager = new TimeoutManager({ timeoutMs: 1000 });
      const operation = vi.fn().mockRejectedValue(new Error('operation error'));

      await expect(timeoutManager.execute(operation)).rejects.toThrow('operation error');
    });
  });
});

describe('ResilienceManager', () => {
  let resilienceManager: ResilienceManager;

  beforeEach(() => {
    resilienceManager = new ResilienceManager(
      { maxAttempts: 2 },
      { failureThreshold: 2 },
      { timeoutMs: 500 }
    );
  });

  describe('execute', () => {
    it('should combine retry, circuit breaker, and timeout', async () => {
      const operation = vi.fn().mockResolvedValue('success');

      const result = await resilienceManager.execute(operation, {
        serviceName: 'test-service',
        operationName: 'test-operation',
      });

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on transient failures', async () => {
      const operation = vi
        .fn()
        .mockRejectedValueOnce(new Error('ECONNRESET'))
        .mockResolvedValue('success');

      const result = await resilienceManager.execute(operation, {
        serviceName: 'test-service',
        operationName: 'test-operation',
      });

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should respect timeout', async () => {
      const operation = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      await expect(
        resilienceManager.execute(operation, {
          serviceName: 'test-service',
          operationName: 'test-operation',
        })
      ).rejects.toThrow(TimeoutError);
    });

    it('should open circuit after failures', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('failed'));

      for (let i = 0; i < 2; i++) {
        try {
          await resilienceManager.execute(operation, {
            serviceName: 'test-service',
            operationName: 'test-operation',
          });
        } catch {
          // Ignore
        }
      }

      expect(
        resilienceManager.getCircuitBreakerState('test-service')
      ).toBe('open');
    });
  });

  describe('getCircuitBreakerState', () => {
    it('should return closed state initially', () => {
      const state = resilienceManager.getCircuitBreakerState('new-service');

      expect(state).toBe('closed');
    });

    it('should return current state of existing circuit breaker', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('failed'));

      for (let i = 0; i < 2; i++) {
        try {
          await resilienceManager.execute(operation, {
            serviceName: 'test-service',
            operationName: 'test-operation',
          });
        } catch {
          // Ignore
        }
      }

      const state = resilienceManager.getCircuitBreakerState('test-service');

      expect(state).toBe('open');
    });
  });

  describe('resetCircuitBreaker', () => {
    it('should reset circuit breaker state', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('failed'));

      for (let i = 0; i < 2; i++) {
        try {
          await resilienceManager.execute(operation, {
            serviceName: 'test-service',
            operationName: 'test-operation',
          });
        } catch {
          // Ignore
        }
      }

      expect(
        resilienceManager.getCircuitBreakerState('test-service')
      ).toBe('open');

      resilienceManager.resetCircuitBreaker('test-service');

      expect(
        resilienceManager.getCircuitBreakerState('test-service')
      ).toBe('closed');
    });
  });

  describe('getAllCircuitStates', () => {
    it('should return all circuit states', async () => {
      const operation1 = vi.fn().mockRejectedValue(new Error('failed'));
      const operation2 = vi.fn().mockResolvedValue('success');

      for (let i = 0; i < 2; i++) {
        try {
          await resilienceManager.execute(operation1, {
            serviceName: 'service-1',
            operationName: 'test-operation',
          });
        } catch {
          // Ignore
        }
      }

      await resilienceManager.execute(operation2, {
        serviceName: 'service-2',
        operationName: 'test-operation',
      });

      const states = resilienceManager.getAllCircuitStates();

      expect(states).toEqual({
        'service-1': 'open',
        'service-2': 'closed',
      });
    });
  });
});
