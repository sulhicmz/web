# 15. CI/CD & Deployment

## Strategi Branch & Deploy
- `main`: produksi → deploy otomatis ke Cloudflare Pages (prod env).
- `develop`: integrasi fitur → deploy ke staging.
- Feature branches → Pull Request → preview deployment otomatis.
- Canary release: gunakan branch `release/canary` untuk subset pelanggan (flag via feature toggles).
- Rollback: `git revert` + redeploy, simpan backup build di Cloudflare.

## GitHub Actions (`.github/workflows/deploy.yml`)
```yaml
name: CI-CD
on:
  push:
    branches: [main, develop, release/canary]
  pull_request:
    branches: [main, develop]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - run: pnpm install --frozen-lockfile
      - run: pnpm run lint
      - run: pnpm run build
      - uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: astro-web-portal
          directory: dist
          branch: ${{ github.ref_name }}
          wranglerVersion: '3'
```

## Caching & Optimasi
- pnpm store cache (`~/.pnpm-store`) menggunakan `actions/cache` (tambahkan di workflow).
- Astro build output dist di-cache per branch preview.

## Variabel Lingkungan
Buat `.env.sample`:
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE=
PAYMENT_PROVIDER=midtrans
PAYMENT_ENV=sandbox
PAYMENT_WEBHOOK_SECRET=
WHATSAPP_BUSINESS_ID=
WHATSAPP_ACCESS_TOKEN=
SENTRY_DSN=
PLAUSIBLE_DOMAIN=
```

### Pembagian Lingkungan
- Dev: gunakan Supabase project dev, Cloudflare preview, payment sandbox.
- Staging: branch `develop`, secrets prefix `STAGING_` di GitHub + Cloudflare staging env vars.
- Prod: branch `main`, secret real; gunakan Cloudflare KV untuk feature flags.

## Release Governance
- PR wajib lulus lint, test, accessibility check.
- Tag rilis `vYYYY.MM.DD`. Simpan changelog di `/docs/changelog.mdx`.
- Monitor deploy via Cloudflare build hooks + Slack notifikasi.
