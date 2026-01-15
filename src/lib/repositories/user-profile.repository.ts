import type { IRepository, QueryOptions } from './base';

export interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  client_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfileInsert {
  id: string;
  full_name?: string | null;
  phone?: string | null;
  role: string;
  client_id?: string | null;
}

export interface UserProfileUpdate {
  full_name?: string | null;
  phone?: string | null;
  role?: string;
  client_id?: string | null;
}

export interface IUserProfileRepository extends IRepository<UserProfile, UserProfileInsert, UserProfileUpdate> {
  getByClient(clientId: string, options?: QueryOptions): Promise<UserProfile[]>;
  getByRole(role: string, options?: QueryOptions): Promise<UserProfile[]>;
  getAdmins(options?: QueryOptions): Promise<UserProfile[]>;
  getClients(options?: QueryOptions): Promise<UserProfile[]>;
  getTeamMembers(clientId: string, options?: QueryOptions): Promise<UserProfile[]>;
  withClient(userId: string): Promise<UserProfile | null>;
}
