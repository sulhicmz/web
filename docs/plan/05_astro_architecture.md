# 05. Arsitektur Astro

## Strategi Rendering
- Marketing, portfolio, blog, knowledge base: **SSG** dengan incremental revalidate via Cloudflare cache purge.
- Client portal dashboard & billing routes: **SSR** menggunakan Astro server output dengan Supabase auth middleware.
- Interactive widgets (pricing toggle, testimonials carousel, ROI calculator): **Astro Islands** dengan partial hydration (solid-js components).
- Webhook-driven data (invoices, tickets) memanfaatkan **hybrid**: server endpoints (`src/pages/api/*`) untuk data fetch + client hydration di portal.

## Struktur Direktori Awal
```
src/
  components/
    marketing/
    portal/
    ui/
  layouts/
    MarketingLayout.astro
    PortalLayout.astro
  pages/
    index.astro
    layanan/
    portofolio/
    blog/
    knowledge-base/
    faq.astro
    kontak.astro
    portal/
      dashboard.astro
      projects/index.astro
      projects/[projectId].astro
      packages.astro
      billing.astro
      support/
        index.astro
        tickets/index.astro
        tickets/[ticketId].astro
      knowledge-base.astro
      tutorials.astro
      account/
        index.astro
        api-keys.astro
        activity.astro
    api/
      auth/
        callback.ts
      payments/
        webhook.ts
  content/
    blog/
    docs/
    case-studies/
    tutorials/
  middleware/
    authGuard.ts
  lib/
    supabase/
      browser.ts
      server.ts
    paymentProvider.ts
``` 

## File Konfigurasi Kunci
- `astro.config.mjs`: aktifkan `integrations: [mdx(), sitemap(), image(), pagefind(), partytown()]`, output `server` untuk Cloudflare adapter.
- `src/content/config.ts`: definisi schema collections MDX.
- `wrangler.json`: binding lingkungan Cloudflare + secrets.
- `supabase/README.md`: panduan konfigurasi lingkungan Supabase lokal & variabel env.
- `package.json`: script build `astro build`, `astro sync`, `pnpm run lint`.

## Integrasi
- **MDX** untuk blog/docs.
- **Astro-i18n (opsional)** siap diaktifkan (flag).
- **@astrojs/sitemap** untuk sitemap otomatis.
- **@astrojs/image** + Cloudflare Images untuk optimasi.
- **pagefind** untuk pencarian statis.
- **Supabase client** sisi server + edge (service role via env Cloudflare).

## Guard Rute Portal
- Middleware `authGuard.ts` memeriksa cookie Supabase, verifikasi JWT, injeksi klaim peran.
- Gunakan `astro:page` hooks untuk redirect ke `/login` jika tidak autentik.
- RBAC: Owner & Staff akses penuh; Client akses paket & billing; Viewer read-only.
- SSR portal memanfaatkan `setSession` + `locals.role` untuk gating komponen.
