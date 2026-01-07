// ==========================================================================
// AstroPro Digital - HTTP Client Tests
// Tests for resilient HTTP client with resilience patterns
// ==========================================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ResilientHttpClient, HttpClientError } from '../../../src/lib/integration/http-client';

describe('ResilientHttpClient', () => {
  let httpClient: ResilientHttpClient;
  let mockFetch: ReturnType<typeof vi.fn>;

  function createMockResponse(
    ok: boolean,
    status: number,
    data: unknown,
    contentType = 'application/json'
  ): Response {
    const headers = new Headers({
      'content-type': contentType,
    });

    return {
      ok,
      status,
      statusText: ok ? 'OK' : 'Error',
      headers,
      json: async () => data,
      text: async () => typeof data === 'string' ? data : JSON.stringify(data),
    } as Response;
  }

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch as any;

    httpClient = new ResilientHttpClient({
      baseURL: 'https://api.example.com',
      timeout: 5000,
      maxRetries: 2,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('request', () => {
    it('should make successful GET request', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse(true, 200, { data: 'test' })
      );

      const result = await httpClient.get('/test');

      expect(result).toEqual({ data: 'test' });
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should make successful POST request', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse(true, 200, { created: true })
      );

      const result = await httpClient.post('/test', { name: 'test' });

      expect(result).toEqual({ created: true });
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'test' }),
        })
      );
    });

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse(false, 404, { error: 'Not found' })
      );

      await expect(httpClient.get('/not-found')).rejects.toThrow(HttpClientError);
    });

    it('should include default headers', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse(true, 200, {})
      );

      await httpClient.get('/test');

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[1]?.headers).toHaveProperty('Content-Type', 'application/json');
    });

    it('should merge custom headers', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse(true, 200, {})
      );

      await httpClient.get('/test', {
        headers: {
          Authorization: 'Bearer token',
        },
      });

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[1]?.headers).toMatchObject({
        'Content-Type': 'application/json',
        Authorization: 'Bearer token',
      });
    });
  });

  describe('timeout', () => {
    it('should timeout slow requests', async () => {
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve(
                  createMockResponse(true, 200, {})
                ),
              10000
            )
          )
      );

      const shortTimeoutClient = new ResilientHttpClient({
        baseURL: 'https://api.example.com',
        timeout: 100,
      });

      await expect(shortTimeoutClient.get('/test')).rejects.toThrow('timed out');
    });

    it('should complete fast requests', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse(true, 200, { fast: true })
      );

      const result = await httpClient.get('/test', { timeout: 5000 });

      expect(result).toEqual({ fast: true });
    });
  });

  describe('retry', () => {
    it('should retry on network errors', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('ECONNRESET'))
        .mockResolvedValueOnce(
          createMockResponse(true, 200, { retried: true })
        );

      const result = await httpClient.get('/test');

      expect(result).toEqual({ retried: true });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should retry on 5xx errors', async () => {
      mockFetch
        .mockResolvedValueOnce(
          createMockResponse(false, 503, { error: 'Service unavailable' })
        )
        .mockResolvedValueOnce(
          createMockResponse(true, 200, { success: true })
        );

      const result = await httpClient.get('/test');

      expect(result).toEqual({ success: true });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should not retry on 4xx errors', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse(false, 404, { error: 'Not found' })
      );

      await expect(httpClient.get('/test')).rejects.toThrow(HttpClientError);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should respect maxRetries', async () => {
      mockFetch.mockRejectedValue(new Error('ECONNRESET'));

      await expect(httpClient.get('/test')).rejects.toThrow('ECONNRESET');
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('circuit breaker', () => {
    it('should open circuit after failures', async () => {
      mockFetch.mockRejectedValue(new Error('ECONNRESET'));

      const clientWithCircuitBreaker = new ResilientHttpClient({
        baseURL: 'https://api.example.com',
        circuitBreakerEnabled: true,
        maxRetries: 0,
      });

      for (let i = 0; i < 5; i++) {
        try {
          await clientWithCircuitBreaker.get('/test');
        } catch (error) {
          // Ignore
        }
      }

      const circuitState = clientWithCircuitBreaker.getCircuitBreakerState('http-client');

      expect(circuitState).toContain('open');
    }, 20000);

    it('should skip circuit breaker when disabled', async () => {
      mockFetch.mockRejectedValue(new Error('error'));

      const clientWithoutCircuitBreaker = new ResilientHttpClient({
        baseURL: 'https://api.example.com',
        circuitBreakerEnabled: false,
      });

      await expect(clientWithoutCircuitBreaker.get('/test')).rejects.toThrow('error');

      const circuitState = clientWithoutCircuitBreaker.getCircuitBreakerState();

      expect(circuitState).toMatchObject({});
    });
  });

  describe('GET', () => {
    it('should send GET request', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse(true, 200, { method: 'GET' })
      );

      const result = await httpClient.get('/resource');

      expect(result).toEqual({ method: 'GET' });
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/resource',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });
  });

  describe('POST', () => {
    it('should send POST request with body', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse(true, 200, { method: 'POST' })
      );

      const result = await httpClient.post('/resource', { data: 'test' });

      expect(result).toEqual({ method: 'POST' });
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/resource',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ data: 'test' }),
        })
      );
    });
  });

  describe('PUT', () => {
    it('should send PUT request with body', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse(true, 200, { method: 'PUT' })
      );

      const result = await httpClient.put('/resource/1', { name: 'updated' });

      expect(result).toEqual({ method: 'PUT' });
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/resource/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ name: 'updated' }),
        })
      );
    });
  });

  describe('PATCH', () => {
    it('should send PATCH request with body', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse(true, 200, { method: 'PATCH' })
      );

      const result = await httpClient.patch('/resource/1', { status: 'active' });

      expect(result).toEqual({ method: 'PATCH' });
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/resource/1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ status: 'active' }),
        })
      );
    });
  });

  describe('DELETE', () => {
    it('should send DELETE request', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse(true, 200, { method: 'DELETE' })
      );

      const result = await httpClient.delete('/resource/1');

      expect(result).toEqual({ method: 'DELETE' });
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/resource/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('URL building', () => {
    it('should handle trailing slashes correctly', async () => {
      const client1 = new ResilientHttpClient({ baseURL: 'https://api.example.com/' });
      mockFetch.mockResolvedValueOnce(
        createMockResponse(true, 200, {})
      );

      await client1.get('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.any(Object)
      );
    });

    it('should handle no leading slash', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse(true, 200, {})
      );

      await httpClient.get('test');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.any(Object)
      );
    });
  });

  describe('response parsing', () => {
    it('should parse JSON responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ data: 'json' }),
      });

      const result = await httpClient.get('/test');

      expect(result).toEqual({ data: 'json' });
    });

    it('should parse text responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'text/plain' }),
        text: async () => 'plain text',
      });

      const result = await httpClient.get('/test');

      expect(result).toBe('plain text');
    });
  });

  describe('circuit breaker management', () => {
    it('should get circuit state for specific service', async () => {
      mockFetch.mockRejectedValue(new Error('error'));

      const clientWithCB = new ResilientHttpClient({
        baseURL: 'https://api.example.com',
        circuitBreakerEnabled: true,
      });

      const state = clientWithCB.getCircuitBreakerState('custom-service');

      expect(state).toBe('closed');
    });

    it('should reset circuit breaker for specific service', async () => {
      const clientWithCB = new ResilientHttpClient({
        baseURL: 'https://api.example.com',
        circuitBreakerEnabled: true,
      });

      clientWithCB.resetCircuitBreaker('test-service');

      expect(clientWithCB.getCircuitBreakerState('test-service')).toBe('closed');
    });
  });
});
