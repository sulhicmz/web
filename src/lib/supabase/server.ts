import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type ServerClientOptions = {
        /**
         * Digunakan ketika ingin memalsukan identitas pengguna tertentu (misal impersonasi read-only).
         */
        accessToken?: string;
};

/**
 * Client Supabase sisi server menggunakan service role agar dapat menjalankan operasi administratif.
 * Pastikan kredensial hanya di-load di lingkungan tepercaya (server atau edge function).
 */
export function getServiceClient(options: ServerClientOptions = {}): SupabaseClient {
        const url = process.env.SUPABASE_URL ?? import.meta.env.SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE ?? import.meta.env.SUPABASE_SERVICE_ROLE;

        if (!url || !serviceKey) {
                throw new Error('SUPABASE_URL atau SUPABASE_SERVICE_ROLE belum dikonfigurasi.');
        }

        return createClient(url, serviceKey, {
                global: {
                        headers: options.accessToken
                                ? {
                                          Authorization: `Bearer ${options.accessToken}`,
                                  }
                                : undefined,
                },
        });
}
