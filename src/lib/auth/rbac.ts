// ==========================================================================
// AstroPro Digital - Role-Based Access Control
// Utilitas RBAC untuk authorization dan permission checking
// ==========================================================================

import type { AuthUser } from '../../types';

export const rbac = {
  hasRole(user: AuthUser | null, allowedRoles: string[]): boolean {
    if (!user?.profile?.role) return false;
    return allowedRoles.includes(user.profile.role);
  },

  isAdmin(user: AuthUser | null): boolean {
    const role = user?.profile?.role;
    return role === 'admin' || role === 'owner' || role === 'staff' || role === 'manager';
  },

  isClient(user: AuthUser | null): boolean {
    return user?.profile?.role === 'client';
  },

  canManageClient(user: AuthUser | null, clientId: string): boolean {
    if (!user?.profile) return false;

    if (this.isAdmin(user)) return true;

    return user.profile.client_id === clientId;
  },
};
