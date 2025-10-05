# TODO

## Prioritas Tinggi
- [x] Susun ulang dokumen perencanaan agar mengikuti panduan terbaru dan verifikasi konsistensi format.
- [x] Implementasikan struktur awal proyek Astro sesuai arsitektur yang telah dirancang dalam dokumen plan.
- [x] Siapkan konfigurasi Supabase (auth, RLS, skema) di lingkungan pengembangan.
- [x] Validasi signature webhook Midtrans sebelum mengembalikan 200 (lihat `src/pages/api/payments/webhook.ts`).
- [ ] Implementasikan middleware `authGuard` untuk portal sesuai desain RBAC di `docs/plan/05_astro_architecture.md`.

## Prioritas Menengah
- [x] Membuat komponen UI dasar (Button, Card, PricingTable) di codebase Astro.
- [x] Mengintegrasikan analitik ringan (mis. Plausible) dengan menghormati consent pengguna.
- [x] Mendesain alur checkout dengan antarmuka abstraksi gateway pembayaran.
- [x] Perbaiki logika active state `NavLink` agar menu portal tersorot sesuai halaman (cek `src/components/marketing/NavLink.astro`).
- [ ] Samakan kontrak `PaymentProvider` dengan spesifikasi di `docs/plan/11_payment_integration.md` (checkout/subscription/idempotensi).
- [ ] Tambahkan pipeline GitHub Actions untuk lint/build/deploy seperti blueprint `docs/plan/15_ci_cd.md`.

## Prioritas Rendah
- [x] Dokumentasikan runbook insiden detail dan lampirkan di `docs/`.
- [x] Menyusun template email notifikasi untuk tiket dukungan dan status proyek.
- [x] Mengevaluasi opsi pengujian regresi visual untuk komponen utama.
- [x] Konsolidasikan detail kontak (email/WhatsApp) yang tersebar ke satu sumber konfigurasi sehingga mudah diganti.
- [ ] Lengkapi modul notifikasi WhatsApp (API webhook + template mapping) sesuai `docs/plan/12_whatsapp_integration.md`.
