# Incident Response Runbook

## Purpose
Panduan operasional ketika portal klien, marketing site, atau layanan backend mengalami insiden yang berdampak pada pengguna. Runbook ini memetakan alur deteksi, eskalasi, mitigasi, dan pemulihan untuk tim lintas fungsi.

## Scope
- Astro marketing site (`*.web`) yang dibangun dengan halaman SSG/SSR.
- Portal klien (route `src/pages/portal`) dengan autentikasi Supabase.
- Layanan pembayaran Midtrans (`src/lib/payments`) dan webhook.
- Infrastruktur Supabase (database, storage, Edge functions) yang digunakan aplikasi.

## Roles
- **Incident Commander (IC)**: Menyetir alur respons, mengambil keputusan prioritas, memastikan dokumentasi real-time.
- **Comms Lead**: Menyiapkan komunikasi pelanggan, menulis notifikasi status, menjawab tiket.
- **Ops Engineer**: Menangani Supabase, Astro build/deploy, Cloudflare konfigurasi.
- **Feature Owner**: Memberi konteks domain (mis. pembayaran, tiket support) untuk mitigasi.

## Severity Levels
| Level | Dampak | Target Respon | Contoh |
|-------|--------|---------------|--------|
| SEV1 | Portal/marketing tidak bisa diakses >15 menit | 5 menit | HTTP 500 global, autentikasi gagal total |
| SEV2 | Degradasi mayor pada fitur inti | 15 menit | Pembayaran Midtrans gagal, data portal stale >30 menit |
| SEV3 | Bug minor, workaround tersedia | 60 menit | Laporan analytics terlambat, UI glitch non-blocking |

## Detection
1. **Alert otomatis** dari Cloudflare (uptime), Supabase (availability), atau webhook failure.
2. **Laporan klien** lewat tiket/support WhatsApp.
3. **Monitoring manual**: dashboard Supabase, logs `wrangler tail`, analitik error Sentry (jika aktif).

## Response Workflow
1. **Acknowledge** alert, tetapkan IC & severity.
2. **Stabilize**: aktifkan mode read-only jika perlu (putuskan fitur yang bisa dinonaktifkan cepat via feature flag/Cloudflare workers).
3. **Gather Context**:
   - Periksa status Supabase (`npx supabase status`, dashboard).
   - Run `wrangler tail` untuk melihat error edge/Workers.
   - Audit deploy terakhir (`git log -5 --oneline`, `wrangler deploy --dry-run`).
4. **Mitigate** sesuai jenis insiden:
   - **Platform down**: rollback ke build stabil (`git checkout <tag>` lalu `wrangler deploy`).
   - **Supabase issue**: aktifkan backup, jalankan `supabase db reset` hanya bila ada snapshot, koordinasi restore.
   - **Midtrans**: cek credentials `.env`, validasi response handler `src/lib/payments/providers/midtrans.ts`.
5. **Communicate** status ke pelanggan (lihat templat email di `docs/templates/notifications/`).
6. **Verify** pemulihan:
   - `npm run build` secara lokal.
   - `npx supabase db lint` (opsional) dan tes endpoint pembayaran (`curl` POST ke `/api/payments/session`).
7. **Close** insiden saat metrik normal, catat waktu, analisis akar masalah.

## Runbook Checklists
### IC Checklist
- [ ] Severity ditetapkan dan dicatat di tiket.
- [ ] Timeline insiden dibuat (Google Doc / Notion / tiket).
- [ ] Komunikasi internal 15 menit sekali.

### Ops Checklist
- [ ] Logs Cloudflare & Supabase diarsipkan.
- [ ] Konfigurasi `.env` diverifikasi dengan `.env.example` yang terbaru.
- [ ] Backup post-incident di-trigger (Supabase PITR atau export).

## Post-Incident Review
1. Schedule retro max 48 jam setelah insiden.
2. Lengkapi laporan RCA (Root Cause Analysis) dengan bagian: ringkasan, garis waktu, akar masalah, tindakan perbaikan jangka pendek/panjang.
3. Tambahkan tindakan perbaikan ke backlog (gunakan `todo.md`).
4. Update dokumentasi atau automasi (mis. menambah monitoring pada endpoint bermasalah).

## References
- `supabase/README.md` untuk setup lokal dan koneksi.
- `wrangler.json` dan `package.json` untuk script deploy.
- `docs/plan/` untuk konteks arsitektur dan dependensi fitur.
