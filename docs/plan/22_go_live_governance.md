## Checklist Pra-Rilis (≤30 Butir)
1. Finalisasi konten marketing + proofread.
2. Review aksesibilitas WCAG 2.2 AA.
3. Pastikan Pagefind index ter-update.
4. Verifikasi SEO metadata & schema JSON-LD.
5. Uji lead form & integrasi Supabase (dev/staging).
6. Validasi WhatsApp CTA & template opt-in.
7. Jalankan e2e test suite penuh.
8. Audit keamanan (CSP, headers, RLS sample check).
9. Konfigurasi Cloudflare cache rules & firewall.
10. Enkripsi secrets di GitHub & Cloudflare.
11. Sinkronisasi database prod (migrasi terakhir).
12. Konfirmasi payment sandbox & switch ke production key (cek dua orang).
13. Test webhook payment & retry logic.
14. Review dokumentasi developer & klien.
15. Siapkan status page + monitoring alert aktif.
16. Training internal support (portal & tiket).
17. Training sales (pricing, paket, CTA WA).
18. Upload tutorial video final.
19. Setup analytics & consent banner.
20. Verifikasi backup otomatis berjalan.
21. Pastikan SLA eskalasi WA siap.
22. Review legal: privacy policy & terms.
23. Set feature flags default (canary off).
24. Konfirmasi `.env` per lingkungan.
25. Lakukan smoke test deploy ke staging.
26. Rapat go/no-go dengan stakeholder.
27. Jadwalkan pengumuman peluncuran.
28. Update changelog rilis.
29. Siapkan plan rollback.
30. Freeze code setelah persetujuan.

## Rencana Rollback
- Gunakan build terakhir stabil (Cloudflare) + restore database snapshot (T-1h) jika perlu.
- Nonaktifkan fitur bermasalah via feature flags, publikasikan status update.

## Pelatihan
- Internal: sesi workshop 2 jam (tim dev, support, marketing) sebelum go-live.
- Klien: webinar onboarding mingguan 4 minggu pertama.

## KPI 90 Hari
- Leads marketing: ≥ 150.
- Conversion Rate lead→klien: ≥ 12%.
- Monthly Recurring Revenue (MRR): ≥ IDR 150 juta.
- Churn klien: < 3%.
- Waktu respons tiket kritikal: < 30 menit rata-rata.

## Tata Kelola
- Review mingguan: evaluasi KPI, backlog, incident.
- Retrospektif bulanan: fokus continuous improvement & kebijakan keamanan.
- Quarterly roadmap refresh bersama stakeholder.
