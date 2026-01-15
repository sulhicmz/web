import type { IRepository } from './base';

export interface Package {
  id: string;
  code: string | null;
  name: string | null;
  price_monthly?: number | null;
  price_setup?: number | null;
  is_active?: boolean | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface PackageInsert {
  name: string;
  code: string;
  description?: string | null;
  price_monthly?: number | null;
  price_setup?: number | null;
  is_active?: boolean | null;
  metadata?: Record<string, unknown> | null;
}

export interface PackageUpdate {
  name?: string;
  code?: string;
  description?: string | null;
  price_monthly?: number | null;
  price_setup?: number | null;
  is_active?: boolean | null;
  metadata?: Record<string, unknown> | null;
  deleted_at?: string | null;
}

export interface IPackageRepository extends IRepository<Package, PackageInsert, PackageUpdate> {
  findByIdentifier(identifier: string): Promise<Package | null>;
  findByCode(code: string): Promise<Package | null>;
  getActivePackages(): Promise<Package[]>;
}
