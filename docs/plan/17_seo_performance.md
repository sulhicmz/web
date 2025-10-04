## KPI
- Lighthouse Performance ≥ 90 (mobile), SEO ≥ 95, Accessibility ≥ 95.
- LCP < 2.5s, CLS < 0.1, TBT < 200ms.

## Implementasi Teknis
- Generate `sitemap.xml` otomatis + `robots.txt` blok `/portal`.
- Metadata OG/Twitter via `SEO` component; update per halaman.
- Preload hero image (webp) & critical fonts; prefetch rute populer (/layanan, /portofolio) pada hover/viewport.
- Gunakan `astro-imagetools` untuk responsive images + `loading="lazy"` default.
- Enable HTTP/2 push? (prefetch) via Cloudflare `Early Hints`.
- Prerender rute marketing & blog top 20; portal SSR.
- Implement schema JSON-LD per halaman (Organization, Product, FAQ, Article, BreadcrumbList).
- Setup 404 & 410 pages dengan link internal.
- Monitor core web vitals via Cloudflare Web Analytics + field data.

## Rencana Pengujian Halaman Kritis
| Halaman | Tujuan Tes | Alat |
|---------|------------|------|
| Home | Lighthouse mobile & desktop, WebPageTest (3G Fast) | GitHub Actions, WebPageTest API |
| Layanan | Validasi structured data Product & FAQ, check ROI calculator lazy load | Google Rich Results Test, Playwright |
| Portofolio Detail | Pastikan prefetch case study & LCP image optimized | Lighthouse, Squoosh QA |
| Blog Artikel | Periksa Pagefind indexing, TOC anchor, metadata | Playwright, Pagefind CLI |
| Portal Dashboard | TTFB SSR < 500ms, auth guard redirect | k6 smoke, Playwright auth |
| Kontak | Validasi form, WA CTA, spam protection | Playwright, hCaptcha staging |

## Pemeliharaan
- Jalankan audit bulanan (Lighthouse CI) pada branch `main`.
- Gunakan Cloudflare cache rules: bypass untuk portal, cache 1h untuk marketing.
- Log search query Pagefind untuk menemukan peluang konten.
