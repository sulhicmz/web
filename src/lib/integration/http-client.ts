// ==========================================================================
// AstroPro Digital - Resilient HTTP Client
// HTTP client with built-in resilience patterns (timeout, retry, circuit breaker)
// ==========================================================================

import { ResilienceManager, type RetryConfig, type CircuitBreakerConfig } from './resilience';

export interface HttpClientConfig {
  baseURL?: string;
  timeout?: number;
  maxRetries?: number;
  circuitBreakerEnabled?: boolean;
  defaultHeaders?: Record<string, string>;
}

export interface RequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  skipCircuitBreaker?: boolean;
  context?: {
    serviceName?: string;
    operationName?: string;
  };
}

export class HttpClientError extends Error {
  public readonly statusCode: number;
  public readonly responseBody?: unknown;

  constructor(
    message: string,
    statusCode: number,
    responseBody?: unknown
  ) {
    super(message);
    this.name = 'HttpClientError';
    this.statusCode = statusCode;
    this.responseBody = responseBody;
  }
}

export class ResilientHttpClient {
  private readonly resilienceManager: ResilienceManager;
  private readonly baseURL: string;
  private readonly defaultHeaders: Record<string, string>;

  constructor(config: HttpClientConfig = {}) {
    this.baseURL = config.baseURL || '';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.defaultHeaders,
    };

    const retryConfig: Partial<RetryConfig> = config.maxRetries
      ? { maxAttempts: config.maxRetries + 1 }
      : {};

    const circuitBreakerConfig: Partial<CircuitBreakerConfig> =
      config.circuitBreakerEnabled === false
        ? { failureThreshold: Infinity }
        : {};

    this.resilienceManager = new ResilienceManager(
      retryConfig,
      circuitBreakerConfig,
      { timeoutMs: config.timeout }
    );
  }

  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = this.buildURL(endpoint);
    const headers = this.buildHeaders(options);
    const serviceName = options.context?.serviceName || 'http-client';
    const operationName = options.context?.operationName || endpoint;

    const fetchWithTimeout = async (): Promise<T> => {
      const timeout = options.timeout || 30000;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const responseBody = await this.parseErrorBody(response);
          throw new HttpClientError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            responseBody
          );
        }

        return this.parseResponse<T>(response);
      } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof Error && error.name === 'AbortError') {
          const timeoutError = new Error(
            `Request to ${url} timed out after ${timeout}ms`
          );
          timeoutError.name = 'TimeoutError';
          throw timeoutError;
        }

        throw error;
      }
    };

    if (options.skipCircuitBreaker) {
      return fetchWithTimeout();
    }

    return this.resilienceManager.execute(fetchWithTimeout, {
      serviceName,
      operationName,
    });
  }

  async get<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(
    endpoint: string,
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }

  private buildURL(endpoint: string): string {
    if (!this.baseURL) return endpoint;

    const cleanEndpoint = endpoint.startsWith('/')
      ? endpoint.slice(1)
      : endpoint;

    const cleanBaseURL = this.baseURL.endsWith('/')
      ? this.baseURL.slice(0, -1)
      : this.baseURL;

    return `${cleanBaseURL}/${cleanEndpoint}`;
  }

  private buildHeaders(options: RequestOptions): Record<string, string> {
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
    };

    if (options.headers) {
      const headerEntries = Object.entries(options.headers);
      for (const [key, value] of headerEntries) {
        if (typeof value === 'string') {
          headers[key] = value;
        } else if (value !== undefined && value !== null) {
          headers[key] = String(value);
        }
      }
    }

    return headers;
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      return response.json() as Promise<T>;
    }

    if (contentType?.includes('text/')) {
      return response.text() as unknown as Promise<T>;
    }

    return response.blob() as unknown as Promise<T>;
  }

  private async parseErrorBody(response: Response): Promise<unknown> {
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      try {
        return await response.json();
      } catch {
        return undefined;
      }
    }

    try {
      const text = await response.text();
      return text ? { message: text } : undefined;
    } catch {
      return undefined;
    }
  }

  getCircuitBreakerState(serviceName?: string): string {
    if (serviceName) {
      return this.resilienceManager.getCircuitBreakerState(serviceName);
    }

    const states = this.resilienceManager.getAllCircuitStates();
    return JSON.stringify(states, null, 2);
  }

  resetCircuitBreaker(serviceName: string): void {
    this.resilienceManager.resetCircuitBreaker(serviceName);
  }
}

export const HttpClientUtils = {
  ResilientHttpClient,
  HttpClientError,
};
