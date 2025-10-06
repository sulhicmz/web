# TODO

## Prioritas Tinggi
- [x] Susun ulang dokumen perencanaan agar mengikuti panduan terbaru dan verifikasi konsistensi format.
- [x] Implementasikan struktur awal proyek Astro sesuai arsitektur yang telah dirancang dalam dokumen plan.
- [x] Siapkan konfigurasi Supabase (auth, RLS, skema) di lingkungan pengembangan.
- [x] Validasi signature webhook Midtrans sebelum mengembalikan 200 (lihat `src/pages/api/payments/webhook.ts`).
- [x] Implementasikan middleware `authGuard` untuk portal sesuai desain RBAC di `docs/plan/05_astro_architecture.md`.
- [x] Buat fungsionalitas logout untuk portal.
- [x] Lengkapi implementasi `PaymentProvider` agar mendukung skenario checkout + langganan, kupon, dan idempotensi sesuai `docs/plan/11_payment_integration.md`.
- [x] Tambahkan validasi webhook lanjutan (secret/timestamp) agar sejalan dengan blueprint `docs/plan/11_payment_integration.md`.
- [x] Bangun pipeline GitHub Actions (lint/build/deploy) sebagaimana digariskan di `docs/plan/15_ci_cd.md`.
- [x] (HIGH) Perbaiki `verifyWebhook` di `src/lib/payments/providers/midtrans.ts` agar menggunakan algoritme signature Midtrans (`order_id + status_code + gross_amount + server_key`).
- [x] (HIGH) Sesuaikan ekspor handler HTTP di `src/pages/api/payments/session.ts` dan `src/pages/api/payments/webhook.ts` menjadi `POST` agar route Astro berfungsi.
- [x] (HIGH) Implementasikan `applyCoupon` di `MidtransProvider` agar memvalidasi kupon sesungguhnya dan tidak selalu mengembalikan diskon tetap.
- [x] (HIGH) Selesaikan logika `createSubscription` di `MidtransProvider` (ambil harga paket, tipe pembayaran, token pelanggan) agar permintaan tidak gagal.

## Prioritas Menengah
- [x] Membuat komponen UI dasar (Button, Card, PricingTable) di codebase Astro.
- [x] Mengintegrasikan analitik ringan (mis. Plausible) dengan menghormati consent pengguna.
- [x] Mendesain alur checkout dengan antarmuka abstraksi gateway pembayaran.
- [x] Perbaiki logika active state `NavLink` agar menu portal tersorot sesuai halaman (cek `src/components/marketing/NavLink.astro`).
- [x] Implementasikan webhook & template WhatsApp Business API sesuai `docs/plan/12_whatsapp_integration.md` (notifikasi invoice/tiket/deploy).
- [x] (MEDIUM) Lengkapi handler WhatsApp Business API (`src/pages/api/notifications/whatsapp.ts`) dengan logging, retry, dan opt-out.
- [x] (MEDIUM) Tambahkan validasi body untuk `POST /api/payments/subscription` agar hanya payload sah yang diteruskan ke provider.
- [x] (MEDIUM) Tambahkan fallback ketika Supabase tidak tersedia pada `MidtransProvider.createSubscription` agar error lebih informatif.
- [x] (MEDIUM) Jalankan `npm run check` pada workflow CI (`.github/workflows/ci.yml`) agar build, TypeScript, dan wrangler dry-run tervalidasi.
- [ ] (MEDIUM) Perbarui `.github/workflows/deploy.yml` untuk memakai `actions/setup-node@v4` + `npm ci` dan hilangkan cache `node_modules` yang rapuh.
- [ ] (LOW) Audit perubahan visual besar (Cyberpunk Noir) dengan screenshot regression test manual.

## Prioritas Rendah
- [x] Dokumentasikan runbook insiden detail dan lampirkan di `docs/`.
- [x] Menyusun template email notifikasi untuk tiket dukungan dan status proyek.
- [x] Mengevaluasi opsi pengujian regresi visual untuk komponen utama.
- [x] Konsolidasikan detail kontak (email/WhatsApp) yang tersebar ke satu sumber konfigurasi sehingga mudah diganti.
- [ ] (LOW) Tambahkan `dependabot.yml` untuk memantau pembaruan npm dan GitHub Actions.
