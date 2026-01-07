# Blueprint

**Purpose**: Architecture & Standards

## System Architecture

### Tech Stack
- Frontend: Astro (SSR for portal, static for marketing)
- Backend: Cloudflare Workers
- Database: Supabase (PostgreSQL)
- Auth: Supabase Auth
- Payments: Integrated payment provider
- Styling: Astro default styling

### Project Structure

```
src/
├── pages/              # Route-level Astro files (marketing + portal)
├── components/         # Shared UI
│   ├── marketing/      # Marketing-specific components
│   ├── portal/         # Portal-specific components
│   └── ui/            # Reusable base components
├── lib/               # Reusable integrations
│   ├── payments/      # Payment integration logic
│   └── supabase/      # Supabase client & queries
├── content/           # Content collections
│   └── schemas/       # Content schemas in content.config.ts
└── styles/            # Global styles

public/                # Static assets
docs/                  # Playbooks & documentation
supabase/              # Database migrations & seeds
```

## Coding Standards

### Code Style
- Two-space indentation
- Single quotes for strings (where tooling applies)
- Components & Layouts: `PascalCase`
- Functions & Variables: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- CSS Classes: `kebab-case`

### File Organization
- Extract complex logic into `src/lib/` modules
- Keep frontmatter blocks minimal
- Content collection schemas in `content.config.ts`
- Static assets in `public/`

### Build & Deploy
- Required check: `npm run check` (astro build + tsc + wrangler dry-run)
- Preview locally: `npm run preview`
- Deploy: `npm run deploy` (via Wrangler)
- Typegen: `npm run cf-typegen` after binding changes

## Integration Patterns

### Supabase
- Client configuration: `src/lib/supabase/client.ts`
- Queries: Centralized in `src/lib/supabase/`
- Migrations: `supabase/migrations/`
- Seeds: `supabase/seeds/`

### Cloudflare Workers
- Config: `wrangler.toml`
- Secrets: Load from environment or wrangler secrets
- Types: Auto-generated via `npm run cf-typegen`

### Payments
- Integration: `src/lib/payments/`
- Never commit credentials to git
- Use environment variables

## Testing Guidelines

### Required Checks
- Run `npm run check` before PRs
- Manual QA: `docs/plan/20_testing_qa.md`
- Test Supabase migrations on disposable instance
- Verify seeds apply correctly

### Coverage Areas
- Marketing hero animations
- Responsive layouts
- Portal auth flows
- Payment flows
- Database operations

## Security Principles

- Never commit secrets or keys
- Load credentials from environment variables
- Scrub local `.env` before sharing logs
- Rotate compromised credentials
- Review `supabase/README.md` before database changes

## Architecture History

| Date | Version | Changes |
|------|---------|---------|
| 2025-01-07 | 1.0 | Initial blueprint creation |
| 2025-01-07 | 1.1 | Module extraction - Split `auth.ts` and `state-manager.ts` into focused modules following Single Responsibility Principle |

### Architecture Improvements (v1.1)

#### Auth Module Refactoring
- **Before**: Single 344-line `auth.ts` with 4 mixed concerns
- **After**: Focused modules in `src/lib/auth/`:
  - `browser-auth.ts` - Client-side auth operations
  - `server-auth.ts` - Server-side auth operations
  - `session-utils.ts` - Session management utilities
  - `rbac.ts` - Role-based access control
  - `index.ts` - Barrel exports with `AuthUtils` compatibility

#### State Management Refactoring
- **Before**: Single 428-line `state-manager.ts` with 4 mixed responsibilities
- **After**: Focused modules in `src/lib/state/`:
  - `server-state.ts` - Server-side state with TTL
  - `client-state.ts` - Client-side state with reactivity
  - `session-manager.ts` - Session lifecycle management
  - `app-state.ts` - Application state store
  - `hooks.ts` - React-like hooks for components
  - `index.ts` - Barrel exports with singleton instances

#### Benefits
- **Modularity**: Each module has single responsibility
- **Testability**: Smaller, focused modules easier to test
- **Maintainability**: Changes isolated to specific concerns
- **Reusability**: Modules can be imported independently

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2025-01-07 | 1.1 | Module extraction for auth and state management |
| 2025-01-07 | 1.0 | Initial blueprint creation |
