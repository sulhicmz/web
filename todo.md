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

## Prioritas Menengah
- [x] Membuat komponen UI dasar (Button, Card, PricingTable) di codebase Astro.
- [x] Mengintegrasikan analitik ringan (mis. Plausible) dengan menghormati consent pengguna.
- [x] Mendesain alur checkout dengan antarmuka abstraksi gateway pembayaran.
- [x] Perbaiki logika active state `NavLink` agar menu portal tersorot sesuai halaman (cek `src/components/marketing/NavLink.astro`).
- [x] Implementasikan webhook & template WhatsApp Business API sesuai `docs/plan/12_whatsapp_integration.md` (notifikasi invoice/tiket/deploy).

## Prioritas Rendah
- [x] Dokumentasikan runbook insiden detail dan lampirkan di `docs/`.
- [x] Menyusun template email notifikasi untuk tiket dukungan dan status proyek.
- [x] Mengevaluasi opsi pengujian regresi visual untuk komponen utama.
- [x] Konsolidasikan detail kontak (email/WhatsApp) yang tersebar ke satu sumber konfigurasi sehingga mudah diganti.
