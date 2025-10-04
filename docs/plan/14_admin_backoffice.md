## Modul Admin Internal
- **Dashboard Operasional**: overview MRR, invoice overdue, tiket kritikal.
- **Manajemen Produk/Paket**: CRUD packages, products, addons; track versi harga dengan audit.
- **Manajemen Klien & Proyek**: edit profil klien, assign paket, impersonasi read-only.
- **Orders & Kupon**: generate invoice manual, atur kupon, validasi masa berlaku.
- **Feature Toggle**: kontrol rollout (PWA, ROI calculator) via tabel `feature_flags`.
- **Ekspor Data**: CSV untuk invoices, payments, tickets (dengan filter tanggal).

## RBAC & Keamanan
- Akses admin dibatasi ke peran `owner` dan `staff` tertentu (flag `is_admin`).
- Impersonasi: hanya `owner`, membutuhkan MFA re-auth dan log alasan; default read-only, escalate write dengan persetujuan kedua.
- Setiap aksi sensitif (update harga, hapus proyek, refund) dicatat di `audit_logs` dengan diff payload.
- UI admin dilindungi passwordless login + 2FA.

## Logging & Monitoring
- Notifikasi Slack/Email untuk perubahan harga, impersonasi dimulai, dan kegagalan ekspor.
- Rate limit endpoint admin via Cloudflare rules (100 req/5m per IP).

## Ekspor CSV
- Endpoint `GET /api/admin/export?entity=invoices&from&to` menghasilkan file signed URL; expire 15 menit.
- File CSV disimpan di bucket `exports` dengan enkripsi server-side.
