import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../../config';

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
         if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.serviceRoleKey) {
                 throw new Error('SUPABASE_URL atau SUPABASE_SERVICE_ROLE belum dikonfigurasi.');
         }

         return createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.serviceRoleKey, {
                 global: {
                         headers: options.accessToken
                                 ? {
                                           Authorization: `Bearer ${options.accessToken}`,
                                   }
                                 : undefined,
                 },
                 auth: {
                         persistSession: false,
                 },
         });
 }

/**
 * Client Supabase sisi server menggunakan anon key untuk operasi baca publik.
 */
export function getServerClient(options: ServerClientOptions = {}): SupabaseClient {
         if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
                 throw new Error('SUPABASE_URL atau SUPABASE_ANON_KEY belum dikonfigurasi.');
         }

         return createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
                 global: {
                         headers: options.accessToken
                                 ? {
                                           Authorization: `Bearer ${options.accessToken}`,
                                   }
                                 : undefined,
                 },
                 auth: {
                         persistSession: false,
                 },
         });
 }
