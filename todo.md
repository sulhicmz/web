# TODO

## Prioritas Tinggi
- [x] Susun ulang dokumen perencanaan agar mengikuti panduan terbaru dan verifikasi konsistensi format.
- [x] Implementasikan struktur awal proyek Astro sesuai arsitektur yang telah dirancang dalam dokumen plan.
- [x] Siapkan konfigurasi Supabase (auth, RLS, skema) di lingkungan pengembangan.
- [x] Validasi signature webhook Midtrans sebelum mengembalikan 200 (lihat `src/pages/api/payments/webhook.ts`).

## Prioritas Menengah
- [x] Membuat komponen UI dasar (Button, Card, PricingTable) di codebase Astro.
- [x] Mengintegrasikan analitik ringan (mis. Plausible) dengan menghormati consent pengguna.
- [x] Mendesain alur checkout dengan antarmuka abstraksi gateway pembayaran.
- [x] Perbaiki logika active state `NavLink` agar menu portal tersorot sesuai halaman (cek `src/components/marketing/NavLink.astro`).

## Prioritas Rendah
- [x] Dokumentasikan runbook insiden detail dan lampirkan di `docs/`.
- [x] Menyusun template email notifikasi untuk tiket dukungan dan status proyek.
- [x] Mengevaluasi opsi pengujian regresi visual untuk komponen utama.
- [x] Konsolidasikan detail kontak (email/WhatsApp) yang tersebar ke satu sumber konfigurasi sehingga mudah diganti.
