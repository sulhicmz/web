# Deployment Guide

This guide walks you through deploying AstroPro Digital to Cloudflare Workers/Pages with all required services.

## Prerequisites

- Cloudflare account with Workers/Pages enabled
- Supabase project (production)
- Midtrans account (production keys when ready)
- Domain name (optional)

## Infrastructure Setup

### 1. Supabase Production Setup

1. Create a new project in the [Supabase dashboard](https://supabase.com/dashboard)
2. In the project SQL editor, run the migration file:
   ```sql
   -- Run the migration from supabase/migrations/0001_core_schema.sql
   ```

3. Configure authentication settings:
   - Enable email/password login
   - (Optional) Enable OAuth providers as needed

4. In **Project Settings → API**, copy the required values:
   - `anon` public key → `PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret → `SUPABASE_SERVICE_ROLE` (store securely – never commit)
   - Project URL → `SUPABASE_URL` & `PUBLIC_SUPABASE_URL`

5. Set up Row-Level Security roles according to the schema.

### 2. Payment Provider Setup (Midtrans)

1. Log in to the [Midtrans dashboard](https://dashboard.midtrans.com)
2. Create a project (Snap integration) and capture:
   - **Server Key** → `MIDTRANS_SERVER_KEY`
   - **Client Key** → `MIDTRANS_CLIENT_KEY` (optional for future use)

3. Set environment mode via env var `PAYMENT_ENV` (`sandbox` or `production`)

4. Add the payment webhook URL in Midtrans Dashboard → Settings → Configuration:
   - URL: `https://<your-domain>/api/payments/webhook`

### 3. Analytics Setup (Optional)

1. Sign up for [Plausible Analytics](https://plausible.io) or your preferred analytics provider
2. Configure the domain and get the required environment variables:
   - `PUBLIC_PLAUSIBLE_DOMAIN`
   - `PUBLIC_PLAUSIBLE_SCRIPT_URL`

## Environment Configuration

Create your environment configuration by copying the example:

```bash
cp .env.example .env
```

Set the following variables for production:

| Variable | Purpose | Location |
|----------|---------|----------|
| `PUBLIC_SUPABASE_URL` | Public URL for client-side Supabase | Cloudflare environment |
| `PUBLIC_SUPABASE_ANON_KEY` | Public anon key for client-side Supabase | Cloudflare environment |
| `SUPABASE_URL` | Supabase service URL (for server-side use) | Cloudflare secret |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for server-side Supabase | Cloudflare secret |
| `PAYMENT_PROVIDER` | Payment provider identifier (e.g., `midtrans`) | Cloudflare environment |
| `PAYMENT_ENV` | Payment environment (`sandbox` or `production`) | Cloudflare environment |
| `MIDTRANS_SERVER_KEY` | Midtrans server key for API calls | Cloudflare secret |

## Cloudflare Configuration

### 1. Authentication

1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

### 2. Set Secrets

Configure secrets in Cloudflare:

```bash
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put MIDTRANS_SERVER_KEY
```

Note: Public keys like `PUBLIC_SUPABASE_ANON_KEY` and non-sensitive configuration like `PAYMENT_ENV` should be set as plain environment variables in Cloudflare, not as secrets.

### 3. Deploy Configuration

Verify your `wrangler.json`:

```json
{
  "name": "web",
  "main": "./dist/_worker.js/index.js",
  "assets": { "directory": "./dist", "binding": "ASSETS" }
}
```

## Build and Deploy

### 1. Local Build Test

Test the build process locally:

```bash
npm run build
```

### 2. Deploy to Cloudflare

Deploy to production:

```bash
npm run deploy
```

This runs `wrangler deploy` using the configuration in `wrangler.json`.

### 3. Verify Deployment

1. Check the deployment URL provided by Cloudflare
2. Verify that all pages load correctly
3. Test authentication and portal functionality
4. Confirm payment integration works (in sandbox mode initially)

## Post-Deployment Tasks

### 1. Payment Webhook Verification

After deploying:

1. Trigger a test transaction from the Midtrans dashboard
2. Ensure the webhook call reaches `https://<domain>/api/payments/webhook`
3. Check Cloudflare logs for `[payments/webhook]` entries to confirm signature validation
4. Inspect storage/logic where you persist payment events

### 2. Supabase Security Checklist

- Confirm RLS policies are active
- Create test users with roles `owner`, `staff`, `client`, `viewer` and verify portal route access
- Enable rate limiting or add API protection if exposed to public signup flows

### 3. Analytics Verification

- If using Plausible, verify consent banner loads the script only after approval
- Check that analytics are tracking properly

### 4. Domain Configuration

- Configure custom domain via Cloudflare Pages/Workers dashboard if required
- Set up SSL certificate
- Configure DNS settings

## GitHub Actions (Optional)

To automate deployments:

1. Copy the CI/CD workflow template from `docs/plan/15_ci_cd.md`
2. Add to `.github/workflows/ci.yml`
3. Add the following secrets to your GitHub repository:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
   - Supabase and Midtrans secrets

4. The workflow should run `npm ci`, `npm run build`, and deploy via `cloudflare/pages-action`

## Troubleshooting

### Common Deployment Issues

| Symptom | Possible Fix |
|---------|--------------|
| Build fails with Node version error | Ensure Node 20+ is used |
| Supabase client throws "not configured" | Check environment variables and Cloudflare secrets |
| Payments return 500 | Inspect Cloudflare logs for `[payments/session]` errors, validate Midtrans credentials |
| Webhook signature invalid | Ensure Midtrans points to the production HTTPS URL and server key matches |
| Portal routes redirect unexpectedly | Verify Supabase session handling |

### Cloudflare Logs

Monitor deployment with:

```bash
wrangler tail
```

This provides real-time logs from your deployed application.