# 08. Spesifikasi Portal Klien

| Halaman | Tujuan | Data Kunci | Aksi Utama | Guard |
|---------|--------|------------|------------|-------|
| Dashboard | Memberi ringkasan status proyek, billing, dan tiket terbaru | Ringkasan proyek aktif, invoice jatuh tempo, notifikasi penting, skor kesehatan | Navigasi cepat ke proyek, bayar invoice, buka tiket | owner, staff, client |
| Projects & URLs | Menampilkan daftar proyek, environment, progres sprint | projects (status, staging_url, production_url), activity_events | Lihat detail, salin URL, ajukan perubahan, request deploy | owner, staff, client |
| Project Detail | Detail timeline, checklist deliverables, commit terbaru | project metadata, milestones, deploy history, docs terkait | Update status (staff), upload asset, unduh dokumentasi | owner, staff (edit); client, viewer (read) |
| Packages & Upgrades | Kelola paket aktif, add-on, dan upgrade | subscriptions, packages, addons, rekomendasi upsell | Ajukan upgrade, tambahkan add-on, lihat perbandingan paket | owner, staff, client |
| Invoices & Payments | Akses riwayat invoice, status pembayaran, kwitansi | invoices, payments, kupon aktif, metode pembayaran | Bayar invoice, unduh PDF, ajukan dispute | owner, staff, client |
| Support Tickets | Lacak tiket dukungan dan SLA | tickets, komentar terbaru, lampiran, SLA timer | Buat tiket, balas tiket, tutup tiket, unggah lampiran (≤10MB) | owner, staff, client |
| Ticket Detail | Detail percakapan, timeline aktivitas | ticket thread, activity_events, audit_logs | Tambah komentar, ubah prioritas (staff), escalate | owner, staff (penuh); client (komentar); viewer (read) |
| Knowledge Base | Akses artikel bantuan khusus klien | docs (visibility=private), kb_categories, pencarian | Buka artikel, tandai membantu/tidak, request artikel | owner, staff, client, viewer |
| Tutorials | Konsumsi tutorial dan video onboarding | tutorials (steps, video_url), progress | Tandai selesai, download template, kirim feedback | owner, staff, client, viewer |
| Account & Security | Kelola profil, 2FA, sesi aktif | user_profiles, auth factors, API keys, audit_logs | Update profil, aktifkan 2FA, rotasi API key, logout sesi | owner, staff, client (profil); viewer (read) |
