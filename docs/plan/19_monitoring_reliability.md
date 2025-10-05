# 19. Monitoring & Reliabilitas

## Observability Stack
- Error Tracking: Sentry (frontend + server). Alert jika error rate > 1% dalam 5 menit.
- Uptime: Better Stack ping + Cloudflare health checks tiap 1 menit. Alert jika 2 kegagalan beruntun.
- Logging: Supabase Edge function kirim log JSON ke Logflare/Better Stack; gunakan field request_id, client_id.
- Metrics: Cloudflare Analytics + Supabase pg_stat_monitor untuk query berat.
- Status Page: static `/status` dengan data dari Better Stack API + manual incident updates.

## Alert Threshold
- LCP field data > 2.5s untuk 3 hari berturut → buka ticket performa.
- Payment webhook gagal 3x dalam 30 menit → eskalasi ke on-call.
- Database CPU > 70% selama 15 menit → auto scale up atau rollback job.
- SLA tiket high priority terlewat → notifikasi WA manajer support.

## Runbook Insiden (Target Pemulihan < 30 Menit)
**Identifikasi (0-5m)**
1. Terima alert (Sentry/Uptime). Cek status `status` page & logs.
2. Tentukan scope (marketing vs portal vs payment).

**Stabilisasi (5-15m)**
3. Aktifkan banner incident di `/status` + notifikasi klien via email jika berdampak luas.
4. Rollback ke build sebelumnya (Cloudflare) atau nonaktifkan feature flag bermasalah.
5. Jika payment webhook, queue ulang event dari `payment_events`.

**Pemulihan (15-25m)**
6. Verifikasi layanan pulih (monitor, manual check portal login & checkout).
7. Tutup incident sementara setelah 2 siklus monitoring sukses.

**Postmortem (25-30m)**
8. Catat timeline, akar masalah, tindakan korektif di `docs/incidents/YYYY-MM-DD.md`.
9. Jadwalkan review mingguan + retrospektif bulanan.
