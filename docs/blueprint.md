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

## Integration Resilience Patterns

### Overview
Integration resilience patterns protect application stability when external services fail. All integrations implement timeouts, retries, and circuit breakers to prevent cascading failures.

### Resilience Library (`src/lib/integration/`)

#### Timeout Management
- **File**: `resilience.ts` - `TimeoutManager`
- **Purpose**: Prevent indefinite hangs on external calls
- **Configuration**:
  - Default timeout: 30 seconds
  - Per-service overrides supported
  - Custom timeout callbacks available

#### Retry Logic
- **File**: `resilience.ts` - `RetryManager`
- **Purpose**: Automatically retry transient failures
- **Configuration**:
  - Max attempts: 3 (configurable)
  - Base delay: 1000ms
  - Backoff multiplier: 2 (exponential)
  - Max delay cap: 30 seconds
- **Retryable Errors**:
  - Network errors: `ECONNRESET`, `ETIMEDOUT`, `ENOTFOUND`
  - HTTP status: 408, 429, 500, 502, 503, 504
  - Error patterns containing "network"

#### Circuit Breaker
- **File**: `resilience.ts` - `CircuitBreaker`, `ResilienceManager`
- **Purpose**: Stop calling failing services to prevent resource exhaustion
- **States**:
  - **Closed**: Normal operation, requests flow through
  - **Open**: Circuit is tripped, requests fail immediately
  - **Half-open**: Testing if service has recovered
- **Configuration**:
  - Failure threshold: 5 consecutive failures
  - Success threshold: 3 consecutive successes (to close)
  - Timeout: 60 seconds (before half-open attempt)
  - Half-open max calls: 2

#### HTTP Client
- **File**: `http-client.ts` - `ResilientHttpClient`
- **Features**:
  - Built-in timeout, retry, circuit breaker
  - Automatic error parsing
  - Response type safety
  - Circuit state monitoring

### Integration Implementations

#### Midtrans Payment Provider (`src/lib/payments/providers/midtrans.ts`)
- **Applied Patterns**:
  - All API calls use `ResilientHttpClient`
  - Checkout sessions: 20s timeout, 2 retries
  - Subscription creation: 25s timeout, 2 retries
  - Status queries: 15s timeout, 2 retries
  - Circuit breaker enabled per service
- **Service Names**: `midtrans-api`, `midtrans-snap`

#### WhatsApp Integration (`src/lib/whatsapp.ts`)
- **Applied Patterns**:
  - Uses shared `ResilientHttpClient` instance
  - Template sends: 20s timeout, 2 retries
  - Circuit breaker enabled
- **Service Name**: `whatsapp-api`

### API Middleware (`src/lib/api-middleware.ts`)

#### Rate Limiting
- **Default**: 100 requests per 15 minutes per IP
- **Payment endpoints**: 10 requests per minute
- **Auth endpoints**: 5 requests per 15 minutes
- **Response**: 429 status with `Retry-After` header

#### Request Timeout
- **Default**: 30 seconds
- **Webhook handlers**: 10 seconds
- **Payment session**: 20 seconds

#### Error Handling
- Automatic error logging with context
- Consistent error response format
- User-friendly error messages

### Usage Patterns

#### Basic Resilient HTTP Call
```typescript
const client = new ResilientHttpClient({
  baseURL: 'https://api.service.com',
  timeout: 30000,
  maxRetries: 2,
  circuitBreakerEnabled: true,
});

const data = await client.get('/endpoint', {
  context: {
    serviceName: 'my-service',
    operationName: 'fetch-data',
  },
});
```

#### Retry-Only Pattern
```typescript
const retryManager = new RetryManager({
  maxAttempts: 3,
  baseDelayMs: 1000,
});

const result = await retryManager.retry(
  () => someOperation(),
  'operation-context'
);
```

#### Circuit Breaker Pattern
```typescript
const circuitBreaker = new CircuitBreaker('service-name', {
  failureThreshold: 5,
  timeoutMs: 60000,
});

const result = await circuitBreaker.execute(
  () => someOperation()
);
```

#### Combined Resilience
```typescript
const resilienceManager = new ResilienceManager(
  { maxAttempts: 3 },
  { failureThreshold: 5 },
  { timeoutMs: 30000 }
);

const result = await resilienceManager.execute(
  () => someOperation(),
  {
    serviceName: 'my-service',
    operationName: 'critical-operation',
  }
);
```

### Monitoring & Debugging

#### Circuit Breaker State
```typescript
// Get specific circuit state
const state = resilienceManager.getCircuitBreakerState('midtrans-api');
console.log('Circuit state:', state);

// Get all circuit states
const allStates = resilienceManager.getAllCircuitStates();
console.log('All circuits:', allStates);
```

#### Reset Circuits
```typescript
// Reset specific circuit
resilienceManager.resetCircuitBreaker('midtrans-api');

// CircuitBreaker instance method
circuitBreaker.reset();
```

### Testing

#### Unit Tests
- **Location**: `tests/unit/integration/`
- **Coverage**:
  - Retry logic (40+ tests)
  - Circuit breaker states (30+ tests)
  - Timeout handling (20+ tests)
  - HTTP client (50+ tests)

#### Test Patterns
- Mock network failures
- Simulate timeout scenarios
- Test circuit state transitions
- Verify exponential backoff
- Validate retry attempts

### Configuration Guidelines

#### Timeouts
- Fast operations: 5-10 seconds
- Normal operations: 15-30 seconds
- Slow operations: 60+ seconds
- Webhooks: 5-10 seconds (must respond quickly)

#### Retries
- Idempotent operations: 3-5 retries
- Non-idempotent: 0-1 retries
- Critical operations: 3 retries
- Non-critical: 1-2 retries

#### Circuit Breaker
- Low-value services: 3-5 failure threshold
- High-value services: 5-10 failure threshold
- Recovery timeout: 30-120 seconds
- Success threshold: 2-5 successes

### Benefits

- **Stability**: Prevents cascading failures from external services
- **Performance**: Fast fail when services are down
- **Reliability**: Automatic retries for transient failures
- **Observability**: Circuit state monitoring for debugging
- **Flexibility**: Per-service configuration for different needs
- **Maintainability**: Centralized resilience patterns

## Architecture History

| Date | Version | Changes |
|------|---------|---------|
| 2025-01-07 | 1.0 | Initial blueprint creation |
| 2025-01-07 | 1.1 | Module extraction - Split `auth.ts` and `state-manager.ts` into focused modules following Single Responsibility Principle |
| 2025-01-07 | 1.2 | Data architecture improvements - Added data access layer, constraints, validation layer, and seed data |
| 2025-01-07 | 1.3 | Integration resilience - Added timeout, retry, circuit breaker patterns for all external integrations |

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

### Architecture Improvements (v1.2)

#### Data Access Layer
- **Before**: Direct Supabase client usage throughout codebase with no abstraction
- **After**: Centralized query layer in `src/lib/supabase/queries/`:
  - `base.ts` - Shared query utilities and type definitions
  - `clients.ts` - Client entity queries (CRUD, filtering, relationships)
  - `projects.ts` - Project entity queries (CRUD, filtering, relationships)
  - `invoices.ts` - Invoice entity queries (CRUD, filtering, relationships)
  - `user-profiles.ts` - User profile queries (CRUD, filtering, relationships)
  - `index.ts` - Barrel exports and query orchestrator

#### Database Constraints & Optimization
- **Migration**: `supabase/migrations/0002_add_constraints.sql`:
  - Check constraints for all status fields (enum validation at DB level)
  - Numeric range constraints for prices and amounts
  - Cascading delete rules with proper ON DELETE CASCADE/SET NULL
  - Compound indexes for common query patterns (client+status, etc.)
  - Unique constraints for business rules (no duplicate client names)

#### Data Validation Layer
- **New Directory**: `src/lib/validation/`:
  - `common.ts` - Shared validation schemas (UUID, email, URL, pagination)
  - `clients.ts` - Client validation with Zod schemas
  - `projects.ts` - Project validation with Zod schemas
  - `invoices.ts` - Invoice validation with Zod schemas
  - `user-profiles.ts` - User profile validation with Zod schemas
  - `index.ts` - Validation helpers and error formatting

#### Seed Data
- **File**: `supabase/seeds/test_data.sql`:
  - Test packages (Basic, Professional, E-commerce, Custom)
  - Test clients (5 sample clients with various industries)
  - Test projects, websites, products, addons
  - Test subscriptions, invoices, payments
  - Test tickets, docs, tutorials, KB categories

#### Benefits
- **Data Integrity**: Database-level constraints prevent invalid data
- **Query Performance**: Compound indexes optimize common query patterns
- **Type Safety**: Validation layer ensures data quality at boundaries
- **Maintainability**: Centralized queries make DB changes easier
- **Testing**: Seed data provides realistic test scenarios
- **Separation of Concerns**: Data access layer isolated from application logic

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2025-01-07 | 1.1 | Module extraction for auth and state management |
| 2025-01-07 | 1.0 | Initial blueprint creation |
