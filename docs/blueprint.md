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
| 2025-01-07 | 1.5 | Error handler refactoring - Eliminated duplicate instanceof checks with type-safe error discriminator |
| 2025-01-07 | 1.0 | Initial blueprint creation |

### Architecture Improvements (v1.5)

#### Error Handler Refactoring
- **Before**: 60+ lines of duplicate instanceof checks across 5 methods (handleApiError, handleMiddlewareError, getUserFriendlyMessage, isRetryableError, getStatusCode)
- **After**: Type-safe error discriminator utility (`getErrorType()`) that maps error instances to their metadata
- **Implementation**:
  - Created `ErrorTypeMetadata` interface with statusCode, errorCode, isRetryable
  - Implemented `getErrorType(error: unknown)` function for type-safe error discrimination
  - Refactored all error handling methods to use single source of truth
- **Benefits**:
  - DRY principle: Eliminated 60+ lines of duplicate instanceof chains
  - Single source of truth for error type mapping
  - Adding new error types now requires only one location change
  - Type-safe error handling with reduced maintenance burden
  - Improved code readability and maintainability
