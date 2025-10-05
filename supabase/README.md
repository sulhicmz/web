# Supabase Development Setup

Dokumen ini menjelaskan cara menyiapkan lingkungan Supabase lokal untuk pengembangan dan pengujian portal klien.

## Prasyarat
- [Supabase CLI](https://supabase.com/docs/guides/cli) versi 1.150+.
- Docker Desktop atau kompatibel untuk menjalankan layanan lokal.
- Node.js 20+ (sudah menjadi requirement proyek Astro).

## Langkah Cepat
1. **Inisialisasi**: jalankan `supabase init` (jika belum pernah) sehingga CLI membuat folder `.supabase` internal.
2. **Salin variabel lingkungan**: duplikasi file `.env.example` menjadi `.env.local` lalu isi `SUPABASE_URL`, `SUPABASE_ANON_KEY`, dan `SUPABASE_SERVICE_ROLE` sesuai proyek lokal atau kredensial hosted.
3. **Menjalankan layanan lokal**:
   ```bash
   supabase start
   supabase db reset --file supabase/migrations/0001_core_schema.sql
   ```
   Perintah di atas akan menjalankan database, autentikasi, dan storage lokal serta menerapkan skema + kebijakan RLS yang telah ditulis.
4. **Menerapkan data awal (opsional)**: tempatkan skrip seeding di folder `supabase/seed/` lalu jalankan `supabase db execute --file supabase/seed/<nama-file>.sql`.
5. **Deploy ke Supabase hosted** (opsional):
   ```bash
   supabase link --project-ref <project-ref>
   supabase db push --file supabase/migrations/0001_core_schema.sql
   ```
   Setelah push, salin `anon key`, `service role`, dan `project url` dari dashboard ke `.env`/secrets Cloudflare.

## Struktur Folder
- `migrations/0001_core_schema.sql` – definisi skema inti, fungsi helper, dan kebijakan RLS.
- `seed/` – ruang untuk data awal (contoh role default, paket harga, dll).

## Integrasi dengan Aplikasi Astro
- Gunakan helper `src/lib/supabase/server.ts` untuk membuat client Supabase sisi server dengan service role.
- Gunakan helper `src/lib/supabase/browser.ts` untuk client publik (anon key) pada island interaktif.
- Middleware portal dapat membaca klaim JWT (`role`, `client_id`) untuk menerapkan guard halaman sesuai kebijakan RLS.

## Pengujian RLS Cepat
```bash
supabase db remote commit --dry-run
supabase db diff --linked
```
Gunakan `psql` lokal atau Supabase Studio untuk memastikan user dengan `role` berbeda hanya melihat baris dengan `client_id` yang relevan.

## Catatan Keamanan
- Jangan pernah menyimpan service role key di repo. Gunakan `.env.local` atau secret di CI/CD.
- Fungsi helper `public.allow_write_for_staff` memastikan hanya `owner`/`staff` yang dapat menulis. Pastikan klaim JWT di Edge Function mengisi `role` dan `client_id` secara konsisten.
