// ==========================================================================
// AstroPro Digital - Integration Resilience Patterns
// Resilience patterns for external service integrations: timeouts, retries, circuit breakers
// ==========================================================================

export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableStatuses?: number[];
  retryableErrors?: string[];
  retryNonRetryableErrors?: boolean;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  timeoutMs: number;
  halfOpenMaxCalls: number;
}

export interface TimeoutConfig {
  timeoutMs: number;
  onTimeout?: () => void;
}

export type CircuitState = 'closed' | 'open' | 'half-open';

export class CircuitBreakerError extends Error {
  public readonly state: CircuitState;
  public readonly failureCount: number;

  constructor(service: string, state: CircuitState, failureCount: number) {
    super(`Circuit breaker is ${state} for service: ${service}`);
    this.name = 'CircuitBreakerError';
    this.state = state;
    this.failureCount = failureCount;
  }
}

export class TimeoutError extends Error {
  constructor(operation: string, timeoutMs: number) {
    super(`Operation "${operation}" timed out after ${timeoutMs}ms`);
    this.name = 'TimeoutError';
  }
}

export class RetryExhaustedError extends Error {
  constructor(attempts: number, lastError: Error) {
    super(`Retry attempts exhausted after ${attempts} attempts. Last error: ${lastError.message}`);
    this.name = 'RetryExhaustedError';
    this.cause = lastError;
  }
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'network'],
  retryNonRetryableErrors: false,
};

export const DEFAULT_CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  successThreshold: 3,
  timeoutMs: 60000,
  halfOpenMaxCalls: 2,
};

export const DEFAULT_TIMEOUT_CONFIG: TimeoutConfig = {
  timeoutMs: 30000,
};

export class RetryManager {
  constructor(private config: Partial<RetryConfig> = {}) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config };
  }

  isRetryableError(error: unknown): boolean {
    const config = this.config as RetryConfig;

    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();

      for (const retryablePattern of config.retryableErrors || []) {
        if (errorMessage.includes(retryablePattern.toLowerCase())) {
          return true;
        }
      }
    }

    return false;
  }

  isRetryableStatus(status?: number): boolean {
    if (!status) return false;

    const config = this.config as RetryConfig;
    return config.retryableStatuses?.includes(status) ?? false;
  }

  async retry<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T> {
    const config = this.config as RetryConfig;
    let lastError: Error | undefined;
    let currentDelay = config.baseDelayMs;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        const originalError = error;
        lastError = error instanceof Error ? error : new Error(String(error));

        const isTimeoutError = lastError.name === 'TimeoutError';
        const status =
          (originalError as unknown as { status?: number; statusCode?: number })?.status ||
          (originalError as unknown as { status?: number; statusCode?: number })?.statusCode;
        const isRetryable =
          !isTimeoutError && (
            this.isRetryableError(lastError) ||
            this.isRetryableStatus(status)
          );

        if (attempt === config.maxAttempts) {
          throw new RetryExhaustedError(
            config.maxAttempts,
            lastError || new Error('Unknown error')
          );
        }

        if (!isRetryable) {
          if (!config.retryNonRetryableErrors) {
            throw lastError;
          }
          continue;
        }

        if (!isRetryable) {
          if (!config.retryNonRetryableErrors) {
            throw lastError;
          }
          continue;
        }

        console.warn(
          `[RetryManager] Attempt ${attempt}/${config.maxAttempts} failed for ${context || 'operation'}`,
          {
            error: lastError.message,
            retryIn: `${currentDelay}ms`,
          }
        );

        await this.delay(currentDelay);

        currentDelay = Math.min(
          currentDelay * config.backoffMultiplier,
          config.maxDelayMs
        );
      }
    }

    throw new RetryExhaustedError(
      config.maxAttempts,
      lastError || new Error('Unknown error')
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failureCount = 0;
  private successCount = 0;
  private halfOpenCallCount = 0;
  private nextAttemptTime = 0;

  constructor(
    private readonly serviceName: string,
    private config: Partial<CircuitBreakerConfig> = {}
  ) {
    this.config = { ...DEFAULT_CIRCUIT_BREAKER_CONFIG, ...config };
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    const config = this.config as CircuitBreakerConfig;

    if (this.state === 'open') {
      if (Date.now() < this.nextAttemptTime) {
        throw new CircuitBreakerError(this.serviceName, this.state, this.failureCount);
      }

      this.state = 'half-open';
      this.halfOpenCallCount = 0;
      console.info(
        `[CircuitBreaker] Entering half-open state for ${this.serviceName}`
      );
    }

    if (this.state === 'half-open' && this.halfOpenCallCount >= Math.max(config.halfOpenMaxCalls, config.successThreshold)) {
      throw new CircuitBreakerError(this.serviceName, this.state, this.failureCount);
    }

    try {
      this.halfOpenCallCount++;
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    const config = this.config as CircuitBreakerConfig;

    this.failureCount = 0;

    if (this.state === 'half-open') {
      this.successCount++;

      if (this.successCount >= config.successThreshold) {
        this.state = 'closed';
        this.successCount = 0;
        this.halfOpenCallCount = 0;
        console.info(
          `[CircuitBreaker] Circuit closed for ${this.serviceName}`
        );
      }
    }
  }

  private onFailure(): void {
    const config = this.config as CircuitBreakerConfig;

    this.failureCount++;
    this.successCount = 0;

    if (this.state === 'half-open') {
      this.state = 'open';
      this.halfOpenCallCount = 0;
      this.setNextAttemptTime(config);
      console.warn(
        `[CircuitBreaker] Circuit opened for ${this.serviceName}`,
        { failureCount: this.failureCount }
      );
    } else if (this.state === 'closed' && this.failureCount >= config.failureThreshold) {
      this.state = 'open';
      this.setNextAttemptTime(config);
      console.warn(
        `[CircuitBreaker] Circuit opened for ${this.serviceName}`,
        { failureCount: this.failureCount }
      );
    }
  }

  private setNextAttemptTime(config: CircuitBreakerConfig): void {
    this.nextAttemptTime = Date.now() + config.timeoutMs;
  }

  getState(): CircuitState {
    return this.state;
  }

  getFailureCount(): number {
    return this.failureCount;
  }

  reset(): void {
    this.state = 'closed';
    this.failureCount = 0;
    this.successCount = 0;
    this.halfOpenCallCount = 0;
    this.nextAttemptTime = 0;
    console.info(`[CircuitBreaker] Circuit reset for ${this.serviceName}`);
  }
}

export class TimeoutManager {
  constructor(private config: Partial<TimeoutConfig> = {}) {
    this.config = { ...DEFAULT_TIMEOUT_CONFIG, ...this.config };
  }

  async execute<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T> {
    const config = this.config as TimeoutConfig;

    try {
      return await Promise.race([
        operation(),
        this.createTimeout(config.timeoutMs, context || 'operation'),
      ]);
    } catch (error) {
      if (error instanceof TimeoutError) {
        config.onTimeout?.();
        throw error;
      }
      throw error;
    }
  }

  private createTimeout(timeoutMs: number, operation: string): Promise<never> {
    return new Promise((_, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new TimeoutError(operation, timeoutMs));
      }, timeoutMs);

      timeoutId.unref?.();
    });
  }
}

export class ResilienceManager {
  private readonly circuitBreakers: Map<string, CircuitBreaker> = new Map();

  constructor(
    private readonly retryConfig?: Partial<RetryConfig>,
    private readonly circuitBreakerConfig?: Partial<CircuitBreakerConfig>,
    private readonly timeoutConfig?: Partial<TimeoutConfig>
  ) {}

  async execute<T>(
    operation: () => Promise<T>,
    context: {
      serviceName: string;
      operationName?: string;
    }
  ): Promise<T> {
    const circuitBreaker = this.getCircuitBreaker(context.serviceName);
    const retryManager = new RetryManager(this.retryConfig);
    const timeoutManager = new TimeoutManager(this.timeoutConfig);

    return circuitBreaker.execute(async () => {
      return retryManager.retry(
        () =>
          timeoutManager.execute(operation, context.operationName || context.serviceName),
        `${context.serviceName}:${context.operationName || 'operation'}`
      );
    });
  }

  private getCircuitBreaker(serviceName: string): CircuitBreaker {
    if (!this.circuitBreakers.has(serviceName)) {
      this.circuitBreakers.set(
        serviceName,
        new CircuitBreaker(serviceName, this.circuitBreakerConfig)
      );
    }

    return this.circuitBreakers.get(serviceName)!;
  }

  getCircuitBreakerState(serviceName: string): CircuitState {
    const circuitBreaker = this.circuitBreakers.get(serviceName);
    return circuitBreaker?.getState() ?? 'closed';
  }

  resetCircuitBreaker(serviceName: string): void {
    const circuitBreaker = this.circuitBreakers.get(serviceName);
    if (circuitBreaker) {
      circuitBreaker.reset();
    }
  }

  getAllCircuitStates(): Record<string, CircuitState> {
    const states: Record<string, CircuitState> = {};

    for (const [serviceName, circuitBreaker] of this.circuitBreakers.entries()) {
      states[serviceName] = circuitBreaker.getState();
    }

    return states;
  }
}

export const ResilienceUtils = {
  RetryManager,
  CircuitBreaker,
  TimeoutManager,
  ResilienceManager,
  DEFAULT_RETRY_CONFIG,
  DEFAULT_CIRCUIT_BREAKER_CONFIG,
  DEFAULT_TIMEOUT_CONFIG,
};
