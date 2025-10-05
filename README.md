# AstroPro Digital

> Marketing site + client portal built with Astro, Supabase, and Cloudflare Workers.

AstroPro Digital is a monorepo that powers both a high-converting marketing website and a secure client portal. The project combines Astro's hybrid rendering, Supabase authentication/Row-Level Security, and Midtrans payments so agencies can onboard clients quickly while keeping operations automated and observable.

## Features at a Glance

- **Marketing experience** — SSG marketing, portfolio, and blog content backed by MDX collections.
- **Client portal** — SSR-protected dashboard for projects, billing, support tickets, and documentation.
- **Supabase foundation** — Auth + RBAC (Owner/Staff/Client/Viewer), database schema, and RLS-ready migrations.
- **Payments** — Midtrans provider abstraction with checkout session API, webhook validation, and environment toggles.
- **Operational tooling** — WhatsApp CTA/notification scaffolding, analytics consent banner, runbooks, and CI/CD guidance.

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | [Astro 5](https://astro.build) with Islands (Solid) components, Tailwind-inspired custom CSS |
| Auth & Data | [Supabase](https://supabase.com) (Postgres, Auth, Storage) |
| Hosting | [Cloudflare Workers/Pages](https://developers.cloudflare.com/pages) with Cloudflare Images |
| Payments | Midtrans Snap (pluggable provider) |
| Analytics & Consent | Plausible + custom consent banner |
| Tooling | TypeScript, npm scripts, Playwright (planned), GitHub Actions |

## Project Layout

```
.
├── docs/
│   ├── plan/                   # Product, design, and delivery blueprints (01–22)
│   ├── runbooks/               # Incident response procedures
│   ├── templates/notifications # Outbound email templates (tickets, project status)
│   └── testing/                # Visual regression evaluation notes
├── public/                     # Static assets (favicons, fonts)
├── src/
│   ├── components/
│   │   ├── marketing/          # Navigation, footer, CTA components
│   │   ├── portal/             # Portal sidebar/navigation
│   │   └── ui/                 # Shared button, card, pricing table, base head
│   ├── layouts/                # Marketing + Portal shells
│   ├── lib/
│   │   ├── payments/           # Provider factory + Midtrans integration
│   │   └── supabase/           # Server/browser client helpers
│   ├── pages/                  # Marketing + portal routes and API handlers
│   └── content/                # MDX collections configuration
├── supabase/                   # Migrations, seed scaffolding, local setup guide
├── astro.config.mjs            # Astro configuration with Cloudflare adapter
├── wrangler.json               # Cloudflare Workers deployment settings
├── package.json                # Scripts and dependencies
└── todo.md                     # Execution backlog
```

## Prerequisites

- **Node.js 20 LTS** (or >=18.20.8) and npm ≥9.6.5 — Astro 5.x enforces this requirement.
- **Supabase CLI 1.150+** with Docker for local database/Auth emulation.
- **Cloudflare account** with Workers/Pages if you plan to deploy.
- Optional: Midtrans sandbox credentials, Plausible domain, WhatsApp Business Cloud API token.

## Environment Configuration

Duplicate `.env.example` to `.env.local` and fill in values:

```env
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE=...
PAYMENT_PROVIDER=midtrans
PAYMENT_ENV=sandbox
MIDTRANS_SERVER_KEY=...
PUBLIC_PLAUSIBLE_DOMAIN=...
PUBLIC_SUPABASE_URL=...
PUBLIC_SUPABASE_ANON_KEY=...
```

> Tip: keep secrets out of git. Cloudflare secrets can be bound via `wrangler secret put` in CI/CD.

## Local Development

```bash
npm ci                # install dependencies (requires Node 20+)
supabase start        # run Supabase stack locally
npm run dev           # start Astro dev server at http://localhost:4321
```

The portal pages (`/portal/**`) are SSR and honor Supabase auth. When running locally, use the Supabase Studio to create test users and roles that match the policies in `supabase/migrations/0001_core_schema.sql`.

### Payments Sandbox

1. Populate Midtrans sandbox keys in `.env.local`.
2. Hit `POST /api/payments/session` with a payload matching `CheckoutPayload` (see `src/lib/payments/types.ts`).
3. Webhook events are processed by `src/pages/api/payments/webhook.ts`, which now rejects invalid signatures.

### Analytics Consent & WhatsApp CTA

- Consent banner configuration lives in `src/components/analytics/AnalyticsConsent.astro` and respects `PUBLIC_PLAUSIBLE_*` envs.
- WhatsApp numbers/messages are centralized in `src/consts.ts` through `buildWhatsappLink()` for consistent marketing CTAs.

## Testing & Quality

| Command | Description |
| --- | --- |
| `npm run build` | Production build (also validates Astro content collections) |
| `npm run preview` | Preview the built site locally |
| `npm run check` | Build + typecheck + Cloudflare dry-run deploy |

Planned automation:

- Playwright visual regression tests (`docs/testing/visual_regression_options.md`).
- GitHub Actions workflow for lint/build/deploy to Cloudflare (see `docs/plan/15_ci_cd.md`).

## Documentation & Runbooks

- Product and delivery strategy lives under `docs/plan/` (22 sections).
- Operational playbooks under `docs/runbooks/` — start with `incident_response.md`.
- Notification templates ready to plug into email providers under `docs/templates/notifications/`.
- Backlog items tracked in `todo.md` alongside newly discovered tasks.

## Deployment

The default setup targets Cloudflare Workers via `@astrojs/cloudflare`:

```bash
npm run build
npm run deploy   # uses wrangler with config from wrangler.json
```

Adjust `astro.config.mjs` to add optional integrations (image optimization, Partytown, etc.) outlined in `docs/plan/05_astro_architecture.md`.

## Contributing Workflow

1. Create a feature branch from `main` or `develop` (see `docs/plan/15_ci_cd.md`).
2. Commit with conventional messages (`feat:`, `fix:`, etc.).
3. Open a PR — GitHub Actions (to be added) should run build + future Playwright suite.
4. After merge, monitor Cloudflare deployment and Supabase logs per runbook guidance.

---

Happy shipping! Dive into the planning docs for deeper context or run the portal locally to explore the SSR experience.
