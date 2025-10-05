import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type BrowserClientOptions = {
        accessToken?: string;
};

/**
 * Membuat instance Supabase client di browser dengan anon key.
 */
export function getBrowserClient(options: BrowserClientOptions = {}): SupabaseClient {
        const url = import.meta.env.PUBLIC_SUPABASE_URL ?? import.meta.env.SUPABASE_URL;
        const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? import.meta.env.SUPABASE_ANON_KEY;

        if (!url || !anonKey) {
                throw new Error('Supabase URL atau anon key belum dikonfigurasi. Cek .env lokal Anda.');
        }

        return createClient(url, anonKey, {
                global: {
                        headers: options.accessToken
                                ? {
                                          Authorization: `Bearer ${options.accessToken}`,
                                  }
                                : undefined,
                },
        });
}
