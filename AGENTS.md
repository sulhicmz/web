# Repository Guidelines

## Project Structure & Module Organization
The Astro app lives in `src/`. `src/pages/` holds route-level Astro files that separate marketing and portal surfaces. Shared UI sits in `src/components/` (grouped into `marketing/`, `portal/`, and `ui/`), while reusable integrations live in `src/lib/` (`payments/`, `supabase/`). Content collections stay under `src/content/` with schemas in `content.config.ts`, and global styles live in `src/styles/`. Place static assets in `public/`, track playbooks in `docs/`, and manage database migrations plus seeds through `supabase/`.

## Build, Test, and Development Commands
- `npm run dev` — start the Astro dev server with hot reload at http://localhost:4321.
- `npm run build` — compile the static marketing site and SSR portal output; run before every PR.
- `npm run preview` — serve the production build locally to smoke-test routes and assets.
- `npm run check` — run `astro build`, `tsc`, and `wrangler deploy --dry-run` to validate the app and worker config.
- `npm run cf-typegen` — refresh Cloudflare worker type definitions after changing bindings.
- `npm run deploy` — publish via Wrangler once reviews finish and checks pass.

## Coding Style & Naming Conventions
Stick to Astro/TypeScript formatter defaults (two-space indentation, single quotes where tooling applies). Name components and layouts with `PascalCase`, keep functions and variables `camelCase`, and reserve `SCREAMING_SNAKE_CASE` for shared constants in `consts.ts`. Keep CSS classes in kebab-case and extract complex logic into `src/lib/` modules instead of inline frontmatter blocks.

## Testing Guidelines
Treat `npm run check` as the required baseline before opening or updating a PR. Use the manual QA checklist in `docs/plan/20_testing_qa.md` to cover marketing hero animations, responsive layouts, and portal auth flows. When modifying Supabase features, run migrations from `supabase/migrations/` against a disposable instance and confirm seeds still apply. Capture before/after screenshots or recordings for any visual adjustments.

## Commit & Pull Request Guidelines
Follow conventional commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`) and keep messages in the imperative voice. Branch off `main` with prefixes such as `feat/<scope>` or `fix/<scope>`; avoid multi-purpose branches. PRs must link an issue (`Closes #123`), include a short summary plus test notes, and attach UI evidence when visuals change. Ensure CI stays green (`npm run build`) and call out known limitations directly in the description.

## Security & Configuration Tips
Load Supabase keys, Cloudflare tokens, and payment credentials from environment variables or Wrangler secrets—never check them into git. Review `supabase/README.md` before altering database artifacts, and coordinate migration ordering so CI seeds match production. Scrub local `.env` files before sharing logs, and rotate any credential that appears in terminal output or discussion threads.
