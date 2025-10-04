## Target Performa
- LCP < 2.5s pada koneksi 4G (Chrome Lighthouse mobile).
- Perf ≥ 90, SEO ≥ 95.
- Gunakan preconnect ke Supabase dan WhatsApp API, lazyload gambar non-hero.

## Halaman & Komponen
### Home (/)
- Komponen: Hero (CTA WA), Value Props Grid, Process Timeline, Feature Highlights, CTA Banner, FAQ Preview, Testimonial Slider, Lead Form Inline.
- schema.org: `Organization` (logo, contactPoint), `WebSite` searchAction.

### Layanan/Pricing (/layanan)
- Komponen: PricingTable (toggle bulanan/tahunan), Feature Comparison Tabs, ROI Calculator (island), CTA section, FAQ.
- schema.org: `Product` untuk tiap paket (name, description, offers, priceSpecification).

### Portofolio/Case Study (/portofolio, /portofolio/studi-kasus/[slug])
- Komponen: Filter Chips, Masonry Grid, Case Study Card, Metrics Highlights, CTA band.
- Detail studi kasus: Hero, Challenge/Solution/Result sections, Tech Stack Badges, Quote Testimonial.
- schema.org: `CreativeWork` atau `Article` per studi kasus.

### Testimonial (/testimoni)
- Komponen: Testimonial Carousel, Rating Summary, Video Testimonial Modal, CTA.
- schema.org: `Review` aggregateRating.

### Blog (/blog)
- Komponen: Featured Posts, Category Filter, Article List, Subscribe CTA.
- schema.org: `Blog`, artikel individual `Article` dengan `BreadcrumbList`.

### FAQ (/faq)
- Komponen: Accordion FAQ, Contact CTA, Support Options.
- schema.org: `FAQPage` entries.

### Kontak (/kontak)
- Komponen: Contact Form, WhatsApp CTA, Map Embed (static image fallback), Office Hours, Trust Badges.
- schema.org: `ContactPage` + `PostalAddress`.

### Lead Form (global)
- Field: nama, email, nomor WA, jenis proyek, anggaran, pesan.
- Validasi: required, format email, phone pattern, consent checkbox.
- Integrasi: Submit ke Supabase Edge function; fallback email.

## SEO Teknis
- Sitemap otomatis via @astrojs/sitemap.
- robots.txt mengizinkan crawling kecuali /portal.
- Gunakan `astro-seo` helper untuk OG/Twitter meta.
- Preload font Inter woff2, prefetch rute /layanan & /portofolio saat hover.
- Implementasikan structured data JSON-LD sesuai schema di atas.
