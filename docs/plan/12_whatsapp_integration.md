# 12. Integrasi WhatsApp

## CTA WhatsApp
- Pattern tombol utama: `https://wa.me/6281234567890?text=` + encoded pesan.
- Contoh pesan pra-isi (lead):
  - "Halo, saya ingin konsultasi pembuatan website Astro untuk [jenis bisnis]. Jadwal call tersedia: [tanggal]."
- Gunakan `encodeURIComponent` sebelum menyusun URL.

## WhatsApp Business Cloud API (Notifikasi)
- Event notifikasi: invoice issued, payment received, tiket update, deploy complete.
- Syarat opt-in: checkbox pada form + email konfirmasi. Simpan consent timestamp di `notifications_opt_in`.
- Webhook Cloud API → Edge function `POST /api/notifications/whatsapp` untuk logging & retry.

### Template Pesan
1. **Invoice Issued**
   - Bahasa: id
   - Template: `invoice_alert`
   - Body: "Halo {{1}}, invoice #{{2}} sebesar {{3}} jatuh tempo pada {{4}}. Bayar sekarang: {{5}}"
2. **Project Update**
   - Template: `project_status`
   - Body: "Status proyek {{1}} kini {{2}}. Detail sprint: {{3}}"
3. **Ticket Reply**
   - Template: `ticket_update`
   - Body: "Balasan terbaru untuk tiket {{1}} oleh {{2}}. Lihat detail: {{3}}"

## Pencatatan Event
- Simpan log di tabel `whatsapp_events` (event_id, client_id, template, status, response_code, created_at).
- Retry maksimum 3x dengan eksponensial backoff (5m, 15m, 60m).
- Hormati opt-out: bila user membalas STOP, tandai `notifications_opt_in = false` dan hentikan broadcast.

## Kepatuhan Privasi
- Cantumkan kebijakan privasi & cara berhenti pada setiap pesan pertama.
- Jangan kirim data sensitif (password, kartu) melalui WhatsApp.
