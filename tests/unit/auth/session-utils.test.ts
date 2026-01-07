import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { sessionUtils } from '../../../src/lib/auth/session-utils';
import type { Session } from '@supabase/supabase-js';

function createMockSession(overrides: Omit<Partial<Session>, 'expires_in'> & { expires_in?: number } = {}): Session {
  const now = Math.floor(Date.now() / 1000);
  return {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: overrides.expires_in ?? 3600,
    expires_at: now + (overrides.expires_in ?? 3600),
    token_type: 'bearer',
    user: {
      id: 'user-id',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    },
    ...overrides,
  };
}

describe('Session Utils', () => {
  describe('createSessionCookie', () => {
    it('should create session cookies with correct values', () => {
      const session = createMockSession({
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        expires_at: 1704067200,
      });

      const cookies = sessionUtils.createSessionCookie(session);

      expect(cookies).toEqual({
        'sb-access-token': 'test-access-token',
        'sb-refresh-token': 'test-refresh-token',
        'sb-expires-at': '1704067200',
      });
    });

    it('should handle missing expires_at', () => {
      const session = createMockSession({
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        expires_at: undefined,
      });

      const cookies = sessionUtils.createSessionCookie(session);

      expect(cookies).toEqual({
        'sb-access-token': 'test-access-token',
        'sb-refresh-token': 'test-refresh-token',
        'sb-expires-at': undefined,
      });
    });
  });

  describe('clearSessionCookies', () => {
    it('should clear all session cookies', () => {
      const cookies = sessionUtils.clearSessionCookies();

      expect(cookies).toEqual({
        'sb-access-token': '',
        'sb-refresh-token': '',
        'sb-expires-at': '',
      });
    });
  });

  describe('isSessionValid', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return true for valid session', () => {
      const now = Math.floor(Date.now() / 1000);
      const session = createMockSession({
        expires_at: now + 3600,
      });

      expect(sessionUtils.isSessionValid(session)).toBe(true);
    });

    it('should return false for expired session', () => {
      const now = Math.floor(Date.now() / 1000);
      const session = createMockSession({
        expires_at: now - 3600,
      });

      expect(sessionUtils.isSessionValid(session)).toBe(false);
    });

    it('should return false for session expiring now', () => {
      const now = Math.floor(Date.now() / 1000);
      const session = createMockSession({
        expires_at: now,
      });

      expect(sessionUtils.isSessionValid(session)).toBe(false);
    });

    it('should return false when session is null', () => {
      expect(sessionUtils.isSessionValid(null)).toBe(false);
    });

    it('should return false when expires_at is 0', () => {
      const session = createMockSession({
        expires_at: 0,
      });

      expect(sessionUtils.isSessionValid(session)).toBe(false);
    });

    it('should return false when expires_at is undefined', () => {
      const session = createMockSession({
        expires_at: undefined,
      });

      expect(sessionUtils.isSessionValid(session)).toBe(false);
    });

    it('should handle future expiration correctly', () => {
      vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
      const now = Math.floor(Date.now() / 1000);
      const session = createMockSession({
        expires_at: now + 86400,
      });

      expect(sessionUtils.isSessionValid(session)).toBe(true);
    });

    it('should handle past expiration correctly', () => {
      vi.setSystemTime(new Date('2024-01-02T00:00:00Z'));
      const now = Math.floor(Date.now() / 1000);
      const session = createMockSession({
        expires_at: now - 86400,
      });

      expect(sessionUtils.isSessionValid(session)).toBe(false);
    });
  });
});
