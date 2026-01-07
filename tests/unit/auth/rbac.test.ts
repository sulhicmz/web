import { describe, it, expect } from 'vitest';
import { rbac } from '../../../src/lib/auth/rbac';
import type { AuthUser } from '../../../src/types';
import type { UserProfile } from '../../../src/types';

function createMockUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 'user-id',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

function createMockUserProfile(role: string, additional: Partial<UserProfile> = {}): UserProfile {
  return {
    id: 'profile-id',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    email: 'test@example.com',
    full_name: 'Test User',
    role: role as any,
    is_active: true,
    ...additional,
  };
}

describe('RBAC - Role-Based Access Control', () => {
  describe('hasRole', () => {
    it('should return true when user has one of the allowed roles', () => {
      const user = createMockUser({
        email: 'admin@example.com',
        profile: createMockUserProfile('admin'),
      });

      expect(rbac.hasRole(user, ['admin'])).toBe(true);
      expect(rbac.hasRole(user, ['admin', 'client'])).toBe(true);
      expect(rbac.hasRole(user, ['client', 'admin'])).toBe(true);
    });

    it('should return false when user does not have any of the allowed roles', () => {
      const user = createMockUser({
        email: 'client@example.com',
        profile: createMockUserProfile('client'),
      });

      expect(rbac.hasRole(user, ['admin'])).toBe(false);
      expect(rbac.hasRole(user, ['manager', 'staff'])).toBe(false);
    });

    it('should return false when user is null', () => {
      expect(rbac.hasRole(null, ['admin'])).toBe(false);
    });

    it('should return false when user.profile is null', () => {
      const user = createMockUser({ email: 'user@example.com' });
      expect(rbac.hasRole(user, ['admin'])).toBe(false);
    });

    it('should return false when user.profile.role is undefined', () => {
      const user = createMockUser({
        email: 'user@example.com',
        profile: createMockUserProfile(undefined as any),
      });

      expect(rbac.hasRole(user, ['admin'])).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin role', () => {
      const user = createMockUser({
        email: 'admin@example.com',
        profile: createMockUserProfile('admin'),
      });
      expect(rbac.isAdmin(user)).toBe(true);
    });

    it('should return true for owner role', () => {
      const user = createMockUser({
        email: 'owner@example.com',
        profile: createMockUserProfile('owner'),
      });
      expect(rbac.isAdmin(user)).toBe(true);
    });

    it('should return true for staff role', () => {
      const user = createMockUser({
        email: 'staff@example.com',
        profile: createMockUserProfile('staff'),
      });
      expect(rbac.isAdmin(user)).toBe(true);
    });

    it('should return true for manager role', () => {
      const user = createMockUser({
        email: 'manager@example.com',
        profile: createMockUserProfile('manager'),
      });
      expect(rbac.isAdmin(user)).toBe(true);
    });

    it('should return false for client role', () => {
      const user = createMockUser({
        email: 'client@example.com',
        profile: createMockUserProfile('client'),
      });
      expect(rbac.isAdmin(user)).toBe(false);
    });

    it('should return false for team_member role', () => {
      const user = createMockUser({
        email: 'team@example.com',
        profile: createMockUserProfile('team_member'),
      });
      expect(rbac.isAdmin(user)).toBe(false);
    });

    it('should return false when user is null', () => {
      expect(rbac.isAdmin(null)).toBe(false);
    });

    it('should return false when user.profile is null', () => {
      const user = createMockUser({ email: 'user@example.com' });
      expect(rbac.isAdmin(user)).toBe(false);
    });
  });

  describe('isClient', () => {
    it('should return true for client role', () => {
      const user = createMockUser({
        email: 'client@example.com',
        profile: createMockUserProfile('client'),
      });
      expect(rbac.isClient(user)).toBe(true);
    });

    it('should return false for admin role', () => {
      const user = createMockUser({
        email: 'admin@example.com',
        profile: createMockUserProfile('admin'),
      });
      expect(rbac.isClient(user)).toBe(false);
    });

    it('should return false when user is null', () => {
      expect(rbac.isClient(null)).toBe(false);
    });

    it('should return false when user.profile is null', () => {
      const user = createMockUser({ email: 'user@example.com' });
      expect(rbac.isClient(user)).toBe(false);
    });
  });

  describe('canManageClient', () => {
    const clientId = 'client-123';

    it('should return true for admin users regardless of client_id', () => {
      const adminUser = createMockUser({
        id: 'admin-1',
        email: 'admin@example.com',
        profile: createMockUserProfile('admin'),
      });
      expect(rbac.canManageClient(adminUser, clientId)).toBe(true);
    });

    it('should return true for owner users regardless of client_id', () => {
      const ownerUser = createMockUser({
        id: 'owner-1',
        email: 'owner@example.com',
        profile: createMockUserProfile('owner'),
      });
      expect(rbac.canManageClient(ownerUser, clientId)).toBe(true);
    });

    it('should return true for staff users regardless of client_id', () => {
      const staffUser = createMockUser({
        id: 'staff-1',
        email: 'staff@example.com',
        profile: createMockUserProfile('staff'),
      });
      expect(rbac.canManageClient(staffUser, clientId)).toBe(true);
    });

    it('should return true for manager users regardless of client_id', () => {
      const managerUser = createMockUser({
        id: 'manager-1',
        email: 'manager@example.com',
        profile: createMockUserProfile('manager'),
      });
      expect(rbac.canManageClient(managerUser, clientId)).toBe(true);
    });

    it('should return true for client user matching client_id', () => {
      const clientUser = createMockUser({
        id: 'user-1',
        email: 'client@example.com',
        profile: createMockUserProfile('client', { client_id: clientId }),
      });
      expect(rbac.canManageClient(clientUser, clientId)).toBe(true);
    });

    it('should return false for client user not matching client_id', () => {
      const clientUser = createMockUser({
        id: 'user-1',
        email: 'client@example.com',
        profile: createMockUserProfile('client', { client_id: 'different-client-id' }),
      });
      expect(rbac.canManageClient(clientUser, clientId)).toBe(false);
    });

    it('should return false for client user without client_id', () => {
      const clientUser = createMockUser({
        id: 'user-1',
        email: 'client@example.com',
        profile: createMockUserProfile('client'),
      });
      expect(rbac.canManageClient(clientUser, clientId)).toBe(false);
    });

    it('should return false when user is null', () => {
      expect(rbac.canManageClient(null, clientId)).toBe(false);
    });

    it('should return false when user.profile is null', () => {
      const user = createMockUser({ email: 'user@example.com' });
      expect(rbac.canManageClient(user, clientId)).toBe(false);
    });

    it('should return true for team_member with matching client_id', () => {
      const teamUser = createMockUser({
        id: 'team-1',
        email: 'team@example.com',
        profile: createMockUserProfile('team_member', { client_id: clientId }),
      });

      expect(rbac.canManageClient(teamUser, clientId)).toBe(true);
    });

    it('should return true for team_member with matching client_id', () => {
      const teamUser = createMockUser({
        id: 'team-1',
        email: 'team@example.com',
        profile: createMockUserProfile('team_member', { client_id: clientId }),
      });

      expect(rbac.canManageClient(teamUser, clientId)).toBe(true);
    });

    it('should return false for team_member without matching client_id', () => {
      const teamUser = createMockUser({
        id: 'team-1',
        email: 'team@example.com',
        profile: createMockUserProfile('team_member', { client_id: 'different-client-id' }),
      });

      expect(rbac.canManageClient(teamUser, clientId)).toBe(false);
    });
  });
});
