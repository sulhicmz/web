import type { SupabaseClient } from '@supabase/supabase-js';

import type {
  ICouponRepository,
  Coupon,
  CouponInsert,
  CouponUpdate,
} from '../coupon.repository';
import type { RepositoryResult } from '../base';

export class SupabaseCouponRepository implements ICouponRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findById(id: string): Promise<RepositoryResult<Coupon>> {
    const { data, error } = await this.client
      .from('coupons')
      .select('*')
      .eq('code', id)
      .maybeSingle();

    return { data: data as Coupon | null, error };
  }

  async findAll(options?: { select?: string }): Promise<{ data: Coupon[]; count: number | null; error: any }> {
    const { data, error, count } = await this.client
      .from('coupons')
      .select(options?.select ?? '*', { count: 'exact' });

    return { data: data as unknown as Coupon[], count, error };
  }

  async create(data: CouponInsert): Promise<RepositoryResult<Coupon>> {
    const { data: result, error } = await this.client
      .from('coupons')
      .insert(data)
      .select()
      .single();

    return { data: result as Coupon | null, error };
  }

  async update(id: string, data: CouponUpdate): Promise<RepositoryResult<Coupon>> {
    const { data: result, error } = await this.client
      .from('coupons')
      .update(data)
      .eq('code', id)
      .select()
      .single();

    return { data: result as Coupon | null, error };
  }

  async delete(id: string): Promise<RepositoryResult<void>> {
    const { error } = await this.client
      .from('coupons')
      .delete()
      .eq('code', id);

    return { data: null, error };
  }

  async findByCode(code: string): Promise<Coupon | null> {
    const { data, error } = await this.client
      .from('coupons')
      .select('code, amount_off, percent_off, is_active, expires_at, max_redemptions, redemption_count, metadata')
      .eq('code', code)
      .maybeSingle();

    if (error) {
      console.error('[SupabaseCouponRepository] failed to fetch coupon', error.message);
      return null;
    }

    return data as Coupon | null;
  }

  async incrementRedemptionCount(code: string): Promise<void> {
    const { error } = await this.client.rpc('increment_coupon_redemption', { coupon_code: code });

    if (error) {
      console.error('[SupabaseCouponRepository] failed to increment redemption count', error.message);
    }
  }
}
