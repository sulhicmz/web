import type { IRepository } from './base';

export interface Coupon {
  code: string;
  amount_off?: number | null;
  percent_off?: number | null;
  is_active?: boolean | null;
  expires_at?: string | null;
  max_redemptions?: number | null;
  redemption_count?: number | null;
  metadata?: Record<string, unknown> | null;
}

export interface CouponInsert {
  code: string;
  amount_off?: number | null;
  percent_off?: number | null;
  is_active?: boolean | null;
  expires_at?: string | null;
  max_redemptions?: number | null;
  redemption_count?: number | null;
  metadata?: Record<string, unknown> | null;
}

export interface CouponUpdate {
  is_active?: boolean | null;
  max_redemptions?: number | null;
  redemption_count?: number | null;
  metadata?: Record<string, unknown> | null;
}

export interface ICouponRepository extends IRepository<Coupon, CouponInsert, CouponUpdate> {
  findByCode(code: string): Promise<Coupon | null>;
  incrementRedemptionCount(code: string): Promise<void>;
}
