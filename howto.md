# AstroPro Digital – Deployment How-To

This guide walks through everything you need to take the AstroPro Digital mono-repo from a fresh clone to a production deployment on Cloudflare Workers, complete with Supabase, Midtrans payments, analytics consent, and operational runbooks. Use it as a living checklist for new environments.

> ℹ️ For day-to-day development instructions see the [README](./README.md). For product plans or runbooks, refer to the files under `docs/`.

## 1. Prepare Infrastructure

| Component | Purpose | Links |
| --- | --- | --- |
| Supabase | Database, Auth, Row-Level Security | [supabase.com](https://supabase.com) |
| Cloudflare Workers/Pages | Hosting + edge execution for Astro | [developers.cloudflare.com](https://developers.cloudflare.com) |
| Midtrans Snap | Payments (one-time & subscription scaffolding) | [midtrans.com](https://dashboard.midtrans.com) |
| Plausible (optional) | Privacy-friendly analytics | [plausible.io](https://plausible.io) |

### Local prerequisites

- **Node.js 20 LTS** (Astro 5 requires `18.20.8 || ^20.3 || >=22` – use 20 to keep CLI parity).
- **npm ≥ 9.6.5** (bundled with Node 20) or compatible package manager.
- **Supabase CLI 1.150+** (`brew install supabase/tap/supabase` or follow Supabase docs) and Docker for local Postgres/Auth.
- **Cloudflare Wrangler 3+** (`npm install -g wrangler`).
- **GitHub CLI** (`gh`) optional but recommended for PR automation.

Verify versions:

```bash
node -v
npm -v
wrangler --version
supabase --version
```

## 2. Clone & Install

```bash
git clone https://github.com/sulhicmz/web astropro-digital
cd astropro-digital
cp .env.example .env.local
npm ci
```

> If `npm ci` fails with `ERR_SOCKET_TIMEOUT`, retry once network connectivity is stable. Ensure Node meets the minimum version.

## 3. Configure Supabase

### 3.1 Local development environment

1. Install Docker Desktop (or compatible runtime) and sign in.
2. Initialise Supabase (creates `.supabase/` metadata). Only needed once per machine:
   ```bash
   supabase init
   ```
3. Start the local stack and apply database schema:
   ```bash
   supabase start
   supabase db reset --file supabase/migrations/0001_core_schema.sql
   ```
4. Optional: seed data by adding SQL files under `supabase/seed/` and running `supabase db execute --file supabase/seed/<file>.sql`.
5. Open Supabase Studio (`http://localhost:54323`) to manage tables, roles, and policies.

Update `.env.local` (and `.env`) with the values emitted by `supabase status`:

```env
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE=...
PUBLIC_SUPABASE_URL=http://localhost:54321
PUBLIC_SUPABASE_ANON_KEY=...
```

### 3.2 Hosted Supabase project

For production/staging:

1. Create a new project in the Supabase dashboard (choose a strong password).
2. In the project SQL editor, run the migration file:
   ```sql
   -- Upload via SQL editor or CLI
   -- Option A: Supabase CLI (requires `supabase link`)
   supabase link --project-ref <your-project-ref>
   supabase db push --file supabase/migrations/0001_core_schema.sql
   ```
3. Configure authentication settings:
   - Enable email/password login.
   - (Optional) Enable OAuth providers as needed.
4. In **Project Settings → API**, copy:
   - `anon` public key → `PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret → `SUPABASE_SERVICE_ROLE` (store securely – never commit).
   - Project URL → `SUPABASE_URL` & `PUBLIC_SUPABASE_URL`.
5. Set up Row-Level Security roles according to `supabase/migrations/0001_core_schema.sql`. Test with Supabase Studio to ensure Owner/Staff/Client/Viewer policies behave as expected.

## 4. Configure Midtrans Snap

The repository ships with a Midtrans provider (`src/lib/payments/providers/midtrans.ts`) and API routes under `src/pages/api/payments/`.

1. Sign up / log in to the [Midtrans dashboard](https://dashboard.midtrans.com).
2. Create a project (Snap integration) and capture:
   - **Server Key** → `MIDTRANS_SERVER_KEY`
   - **Client Key** (optional future use) → `MIDTRANS_CLIENT_KEY`
3. Set environment mode via env var `PAYMENT_ENV` (`sandbox` or `production`).
4. Add the payment webhook URL in Midtrans Dashboard → Settings → Configuration:
   - URL: `https://<your-domain>/api/payments/webhook`
   - Ensure HTTPS is reachable (Cloudflare deployment required first).
5. In `.env.local` and Cloudflare secrets, configure:

```env
PAYMENT_PROVIDER=midtrans
PAYMENT_ENV=sandbox
MIDTRANS_SERVER_KEY=SB-Mid-server-...
# Optional: MIDTRANS_CLIENT_KEY=SB-Mid-client-...
```

> The webhook handler validates Midtrans signatures before acknowledging events. Check Cloudflare logs (`wrangler tail`) if you see signature errors.

6. (Optional) Implement coupon logic by extending `PaymentProvider` in `src/lib/payments/types.ts` and `src/lib/payments/index.ts`.

## 5. Optional Integrations

- **Plausible Analytics** – `PUBLIC_PLAUSIBLE_DOMAIN` & `PUBLIC_PLAUSIBLE_SCRIPT_URL` feed the consent banner in `src/components/analytics/AnalyticsConsent.astro`.
- **WhatsApp notifications** – Documented under `docs/plan/12_whatsapp_integration.md`. Current code centralises CTA links via `buildWhatsappLink()` in `src/consts.ts`.
- **Analytics/GTM alternatives** – Add scripts via `src/components/ui/BaseHead.astro`.

## 6. Set Environment Variables

Use the following reference when populating `.env.local` and when setting Cloudflare secrets:

| Variable | Purpose | Location |
| --- | --- | --- |
| `SUPABASE_URL` | Supabase service URL (server-side) | local `.env`, Cloudflare secret |
| `SUPABASE_ANON_KEY` | Public key for client-side Supabase | local `.env`, Cloudflare environment (if exposed) |
| `SUPABASE_SERVICE_ROLE` | Service role key for server-side Supabase client | secrets only |
| `PUBLIC_SUPABASE_URL` | Client-side Supabase URL | `.env` (public) |
| `PUBLIC_SUPABASE_ANON_KEY` | Public anon key | `.env` (public) |
| `PAYMENT_PROVIDER` | `midtrans` | `.env`, Cloudflare |
| `PAYMENT_ENV` | `sandbox` or `production` | `.env`, Cloudflare |
| `MIDTRANS_SERVER_KEY` | Server key for API | secrets only |
| `PUBLIC_PLAUSIBLE_DOMAIN` | Optional analytics domain | `.env` |
| `PUBLIC_PLAUSIBLE_SCRIPT_URL` | Optional analytics script URL | `.env` |
| `WHATSAPP_*` | Optional Business API values | `.env` |

### Cloudflare secrets

Login and configure secrets:

```bash
wrangler login
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_ANON_KEY
wrangler secret put SUPABASE_SERVICE_ROLE
wrangler secret put MIDTRANS_SERVER_KEY
wrangler secret put PAYMENT_PROVIDER
wrangler secret put PAYMENT_ENV
# Add optional ones as needed
```

All secrets become available in Workers at runtime (via `process.env`), matching the usage in `src/lib/supabase/server.ts` and payment modules.

## 7. Cloudflare Deployment

1. Authenticate Wrangler: `wrangler login` and select the desired account.
2. Verify `wrangler.json`:
   ```json
   {
     "name": "web",
     "main": "./dist/_worker.js/index.js",
     "assets": { "directory": "./dist", "binding": "ASSETS" }
   }
   ```
3. Build locally:
   ```bash
   npm run build
   ```
4. Deploy to Workers:
   ```bash
   npm run deploy   # wrapper for `wrangler deploy`
   ```
5. Tail logs (optional): `wrangler tail`.
6. Configure custom domain via Cloudflare Pages/Workers dashboard if required.

### GitHub Actions (optional)

`docs/plan/15_ci_cd.md` contains a starter workflow that can be adapted. Once ready:

1. Copy the sample workflow into `.github/workflows/ci.yml`.
2. Add `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, and secret Supabase/Midtrans keys to the repository secrets.
3. The workflow should run `npm ci`, `npm run build`, and deploy via `cloudflare/pages-action` (or Workers deploy step).

## 8. Payment Webhook Verification

After deploying:

1. Trigger a test transaction from the Midtrans dashboard (Snap simulator).
2. Ensure the webhook call reaches `https://<domain>/api/payments/webhook`.
3. Check Cloudflare logs for `[payments/webhook]` entries to confirm signature validation.
4. Inspect storage/logic where you persist payment events (extend tables once Supabase schema includes payments).

## 9. Supabase Security Checklist

- Confirm RLS policies in `supabase/migrations/0001_core_schema.sql` are active.
- Create test users with roles `owner`, `staff`, `client`, `viewer` and verify portal route access.
- Rotate the service role key and update Cloudflare secrets if credentials leak.
- Enable rate limiting or add API protection (e.g., Cloudflare Turnstile) if exposed to public signup flows.

## 10. Post-Deployment Checklist

1. Update Midtrans production keys and switch `PAYMENT_ENV=production` when ready.
2. Configure Plausible (or alternate analytics) and verify consent banner loads the script only after approval.
3. Complete the operational runbooks in `docs/runbooks/` with environment-specific contacts.
4. Schedule backups & monitoring:
   - Supabase PITR / backups.
   - Cloudflare analytics + error alerts.
   - Optional uptime pings (Cron triggers or external services).
5. Review `todo.md` for outstanding engineering tasks (auth middleware, GitHub Actions pipeline, WhatsApp notifications).

## 11. Troubleshooting

| Symptom | Possible Fix |
| --- | --- |
| `npm run build` fails with Node version error | Upgrade to Node 20+ |
| Supabase client throws “not configured” | Check `.env` values and Cloudflare secrets |
| Payments return 500 | Inspect Cloudflare logs for `[payments/session]` errors, validate Midtrans credentials |
| Webhook signature invalid | Ensure Midtrans points to the production HTTPS URL and server key matches |
| Portal routes redirect unexpectedly | Implement `authGuard` middleware (see `todo.md`) and verify Supabase session handling |

---

Happy shipping! Keep this guide updated as the stack evolves—PRs that add features should update both `README.md` and `howto.md` to stay in sync.
