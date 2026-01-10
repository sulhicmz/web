# Blueprint

**Purpose**: Architecture & Standards

## System Architecture

### Tech Stack
- Frontend: Astro (SSR for portal, static for marketing)
- Backend: Cloudflare Workers
- Database: Supabase (PostgreSQL)
- Auth: Supabase Auth with RBAC
- Payments: Midtrans integration
- Messaging: WhatsApp Business API
- Styling: Astro default styling with design tokens

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
│   ├── supabase/      # Supabase client & queries
│   ├── auth/          # Authentication & authorization
│   ├── state/         # State management
│   ├── validation/    # Input validation schemas
│   └── integration/   # External service clients
├── content/           # Content collections
│   └── schemas/       # Content schemas in content.config.ts
└── styles/            # Global styles & design tokens

public/                # Static assets
docs/                  # Playbooks & documentation
supabase/              # Database migrations & seeds
```

## Current Architecture Pattern

**Hybrid Layered Architecture with Islands**

```
┌─────────────────────────────────────────┐
│         Presentation Layer               │
│  (Astro Components & Pages)              │
├─────────────────────────────────────────┤
│         Business Logic Layer            │
│  (Services, State Management, Auth)     │
├─────────────────────────────────────────┤
│         Data Access Layer               │
│  (Supabase Queries, External APIs)      │
├─────────────────────────────────────────┤
│         Infrastructure Layer             │
│  (Payment Providers, Messaging, Cache)  │
└─────────────────────────────────────────┘
```

## Identified Architectural Issues

### 1. Global Singleton Anti-Pattern (P0)
**Location**: `src/lib/state/client-state.ts`
**Issue**: `ClientStateManager` singleton creates implicit dependencies and breaks SSR isolation
**Impact**:
- State leaks between users in SSR context
- Difficult to test (global state)
- Hidden dependencies across modules
- Violates dependency inversion principle

### 2. Tight Coupling in Payment Provider (P1) - RESOLVED
**Location**: `src/lib/payments/providers/midtrans.ts`
**Issue**: Provider directly queries database for coupons, packages, addons
**Resolution**: ✅ Repository pattern implemented with dependency injection (ARCH-002, ARCH-003)
- Created repository interfaces for all entities
- Refactored MidtransProvider to use repositories via constructor
- Removed all Supabase-specific code from provider
- Provider now depends on abstractions (interfaces), not concretions
- Testable with mocked repositories

### 3. No Repository Pattern (P1) - RESOLVED
**Location**: Scattered across `src/lib/supabase/queries/`
**Issue**: Direct database queries in service classes, no abstraction layer
**Resolution**: ✅ Complete repository pattern implementation
- Created base repository interface with CRUD operations
- Implemented repository interfaces for: Coupon, Package, Addon, Project, Client, Invoice, UserProfile
- Created Supabase implementations for all repositories
- Created factory functions for dependency injection
- Updated payment provider to use repository pattern
- All data access now goes through repository layer

### 4. Circular Dependency Risk (P1) - IN PROGRESS
**Location**: `MidtransProvider` ↔ `supabase/server`
**Issue**: Potential circular dependency between payment provider and database client
**Impact**:
- Initialization order issues
- Difficult to understand dependency graph
- May cause runtime errors
**Resolution**: 🔄 Dependency injection breaking cycles (ARCH-004)
- Analyzing dependency graph to identify circular paths
- Using DI to break identified cycles
- Adding cycle detection to build process

### 5. Configuration Coupling (P2) - RESOLVED
**Location**: `src/lib/error-handler.ts`
**Issue**: Error handler tightly coupled to `ERROR_MESSAGES` config
**Resolution**: ✅ Implemented message provider pattern with dependency injection (ARCH-005)
- Created `IErrorMessageProvider` interface for error message contracts
- Implemented `DefaultErrorMessageProvider` using current config values
- Refactored error handler to use provider via `getMessageProvider()` helper
- Added `setMessageProvider()` and `resetMessageProvider()` for testing
- Removed direct config import from error handler
- Error handler now testable with mocked providers
- Backward compatible through default provider instance

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

## Target Architecture

### Clean Architecture with Dependency Injection

```
┌─────────────────────────────────────────┐
│         Presentation Layer               │
│  (Astro Components, Pages, UI)          │
├─────────────────────────────────────────┤
│         Application Layer                │
│  (Use Cases, Services, DTOs)             │
├─────────────────────────────────────────┤
│         Domain Layer                     │
│  (Business Rules, Entities, Interfaces)  │
├─────────────────────────────────────────┤
│         Infrastructure Layer             │
│  (Database, External APIs, Config)       │
└─────────────────────────────────────────┘
```

### Refactoring Strategy

#### Phase 1: Repository Pattern (Current Priority)
1. Extract database queries into repository interfaces
2. Implement concrete repositories using Supabase
3. Remove direct database access from service classes
4. Use constructor injection for dependencies

#### Phase 2: State Management Refactor
1. Replace global singleton with context-based state
2. Separate client-side and server-side state
3. Implement proper store pattern
4. Add state hydration from server to client

#### Phase 3: Layer Separation
1. Move business logic to service layer
2. Keep presentation layer pure
3. Extract use cases for complex operations
4. Create proper DTOs for data transfer

#### Phase 4: Dependency Injection
1. Define contracts between layers using interfaces
2. Implement DI container
3. Make all external dependencies swappable
4. Add factory pattern for complex objects

## UI/UX Patterns

### SVG Icon System
- **Location**: `src/components/ui/Icon.astro`
- **Component**: Reusable accessible SVG icon component
- **Available Icons**: user, email, password, phone, company, website, search, calendar, location, error, success, settings, settings-gear, support, logout, notification, eye, add, invoice, book, arrow
- **Features**:
  - Configurable size (number or string)
  - Custom CSS classes
  - Proper ARIA labels
  - Role="img" for screen readers
  - Type-safe icon names
  - 20+ accessible SVG icons
- **Usage**: `<Icon name="user" size={20} class="custom-icon" />`
- **Benefits**:
  - Screen reader compatible
  - Professional SVG-based icons (no emojis)
  - Consistent styling across components
  - Scalable and performant
  - Aligns with design system

### Accessibility Patterns
- **Keyboard Navigation**: All interactive elements support keyboard navigation
- **Focus Indicators**: Visible focus states with 3px outlines
- **ARIA Attributes**: Proper aria-labels, aria-expanded, aria-haspopup, role attributes
- **Screen Reader Support**: Icons have role="img" and aria-label
- **Reduced Motion**: Respects prefers-reduced-motion preference
- **High Contrast**: Respects prefers-contrast preference with increased border widths

## Integration Patterns

### Resilience Patterns
- Location: `src/lib/integration/resilience.ts`
- **RetryManager**: Exponential backoff with configurable attempts
- **CircuitBreaker**: State machine (closed/open/half-open) for service degradation
- **TimeoutManager**: Operation timeout enforcement
- **ResilienceManager**: Combines all resilience patterns
- **ResilientHttpClient**: HTTP client with built-in resilience (timeout, retry, circuit breaker)
- Usage: Payment and WhatsApp integrations use ResilientHttpClient
- Benefits: Graceful degradation, automatic recovery, predictable failures

### Webhook Infrastructure
- **Deduplication**: `WebhookDeduplicationService` prevents duplicate webhook processing
- **Retry Queue**: Automatic retry with exponential backoff (5, 15, 60, 120, 240 minutes)
- **Dead-Letter Queue**: Permanently failed webhooks stored for manual intervention
- **Metrics**: `WebhookMetricsService` provides observability for webhook health
- Tables: `payment_webhook_dedup`, `payment_webhook_retry_queue`, `webhook_dead_letter_queue`
- WhatsApp Tables: `whatsapp_events`, `whatsapp_retry_queue`
- Benefits: At-least-once processing, no duplicate payments, monitoring support

### Rate Limiting
- Location: `src/lib/integration/rate-limiter.ts`
- **PersistentRateLimiter**: Database-backed rate limiting (persists across instances)
- Per-endpoint configuration: Different limits for payment, webhook, auth, API endpoints
- Auto-cleanup: Expired records automatically removed
- Tables: `rate_limits` with atomic operations
- Benefits: Works across multiple instances, no rate limit evasion, persistent state

### Monitoring & Debugging
- Metrics endpoint: `GET /api/webhook/metrics?type=summary|health|retry-queue|dead-letter`
- Replay endpoint: `POST /api/webhook/replay` for manual retry of failed webhooks
- Health status: Calculates webhook system health (healthy/degraded/unhealthy)
- Admin authentication: Requires `ADMIN_API_TOKEN` header
- Benefits: Observability, debugging capability, manual intervention

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
- Provider interface: `PaymentProvider`
- Concrete implementation: `MidtransProvider`
- Uses: ResilientHttpClient, repository pattern
- Webhook: Deduplicated with retry queue
- Never commit credentials to git

### Messaging
- Integration: `src/lib/whatsapp.ts`
- Uses: ResilientHttpClient
- Webhook: Tracked with retry queue
- Template sending with retry logic

### State Management
- Current: Context-based with dependency injection (v2.1)
- Separation: Server state vs Client state
- Hydration: Server → client state transfer
- Factory: `createServerAppState`, `createClientAppState`

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

### Unit Testing Strategy
- Isolated modules with mocked dependencies
- Repository pattern enables easy mocking
- Dependency injection for testability
- Contract tests for interfaces

## Security Principles

- Never commit secrets or keys
- Load credentials from environment variables
- Scrub local `.env` before sharing logs
- Rotate compromised credentials
- Review `supabase/README.md` before database changes

## Architectural Principles

### SOLID Principles
- **Single Responsibility**: Each module has one reason to change
- **Open/Closed**: Modules open for extension, closed for modification
- **Liskov Substitution**: Subtypes must be substitutable for base types
- **Interface Segregation**: Clients shouldn't depend on unused interfaces
- **Dependency Inversion**: Depend on abstractions, not concretions

### Clean Code Principles
- DRY (Don't Repeat Yourself)
- KISS (Keep It Simple, Stupid)
- YAGNI (You Aren't Gonna Need It)
- Composition over inheritance
- Explicit over implicit

### Design Patterns to Apply
1. **Repository Pattern**: Abstract data access
2. **Factory Pattern**: Create complex objects
3. **Strategy Pattern**: Swappable algorithms
4. **Observer Pattern**: Reactive state management
5. **Decorator Pattern**: Cross-cutting concerns
6. **Dependency Injection**: Loose coupling, testability
7. **Adapter Pattern**: Third-party integrations

## Module Boundaries

### Allowed Dependencies
```
Presentation → Application → Domain → Infrastructure
                ↑               ↑
                └───────────────┘
```

### Forbidden Patterns
- ❌ Infrastructure → Domain (no database in domain)
- ❌ Presentation → Domain (use application layer)
- ❌ Circular dependencies between modules
- ❌ Global state (except for truly singletons)
- ❌ Direct database access from presentation/application layers

## Architecture History

| Date | Version | Changes |
|------|---------|---------|
| 2025-01-10 | 2.5 | Configuration coupling resolved - Implemented message provider pattern for error handler decoupling (ARCH-005) |
| 2025-01-10 | 2.4 | Planning phase updates - Unblocked ARCH-004/006, updated roadmap, reflected progress |
| 2025-01-08 | 2.3 | Integration hardening - Added webhook deduplication, retry queues, persistent rate limiting, metrics service, dead-letter queue handler |
| 2025-01-08 | 2.2 | Repository pattern implementation - Added data access abstraction layer with DI, refactored payment provider (ARCH-002, ARCH-003) |
| 2025-01-08 | 2.1 | State management refactoring - Replaced global singleton with context-based DI, added SSR isolation (ARCH-001) |
| 2025-01-08 | 2.0 | Comprehensive architectural analysis, identified 5 major issues, defined refactoring roadmap |
| 2025-01-07 | 1.5 | Error handler refactoring - Eliminated duplicate instanceof checks with type-safe error discriminator |
| 2025-01-07 | 1.0 | Initial blueprint creation |

### Architecture Improvements (v2.1)

#### State Management Refactoring
- **Before**: Global singleton `ClientStateManager` with implicit dependencies
- **After**: Context-based state management with dependency injection
- **Implementation**:
  - Created `StateContext` interface defining state management contract
  - Implemented `ServerStateContext` for server-side state (no reactivity needed)
  - Implemented `ClientStateContext` for client-side reactive state (subscriptions)
  - Refactored `AppStateStore` to accept `StateContext` via constructor
  - Created factory functions for easy instantiation: `createAppStateStore`, `createServerAppState`, `createClientAppState`
  - Added state hydration utilities: `hydrateClientState`, `extractServerState`, `createInitialStateScript`, `parseServerStateScript`
  - Maintained backward compatibility through `ClientStateManager.getInstance()` wrapper
- **Benefits**:
  - SSR context isolation (no state leaks between users)
  - Explicit dependencies via constructor injection
  - Testable with mocked dependencies
  - Server → client state hydration support
  - Clean separation of server and client concerns
  - Follows SOLID principles (Dependency Inversion)
   - **Breaking Changes**: None (backward compatible)

### Architecture Improvements (v2.5)

#### Error Handler Decoupling
- **Before**: Error handler tightly coupled to `ERROR_MESSAGES` config, directly imported and used throughout
- **After**: Message provider pattern with dependency injection using `IErrorMessageProvider` interface
- **Implementation**:
  - Created `IErrorMessageProvider` interface defining all error message contracts
  - Implemented `DefaultErrorMessageProvider` with current config values
  - Refactored `ErrorHandler` to use `getMessageProvider()` helper function
  - Added `setMessageProvider()` for custom provider injection (testing)
  - Added `resetMessageProvider()` for test cleanup
  - Updated all error classes and validation helpers to use provider
  - Removed direct `ERROR_MESSAGES` import from error handler
- **Benefits**:
  - Error handler decoupled from config module
  - Error handler now testable with mocked message providers
  - Error message configuration can be swapped without code changes
  - Follows SOLID principles (Dependency Inversion, Interface Segregation)
  - Backward compatible through default provider instance
- **Breaking Changes**: None (backward compatible)

### Architecture Improvements (v2.2)

#### Repository Pattern Implementation
- **Before**: Direct database queries in service classes, no abstraction layer
- **After**: Repository pattern with dependency injection and factory functions
- **Implementation**:
  - Created `IRepository<T>` base interface with standard CRUD operations
  - Implemented entity-specific repository interfaces:
    - `ICouponRepository` for coupon operations
    - `IPackageRepository` for package operations
    - `IAddonRepository` for addon operations
    - `IProjectRepository` for project operations
    - `IClientRepository` for client operations
    - `IInvoiceRepository` for invoice operations
    - `IUserProfileRepository` for user profile operations
  - Implemented Supabase concrete implementations for all repositories
  - Created factory functions: `createRepositories()`, `createCouponRepository()`, etc.
  - Refactored `MidtransProvider` to accept repositories via constructor injection
  - Removed all direct Supabase queries from `MidtransProvider`
  - Updated payment provider factory to work with repositories
  - Updated webhook endpoint to use repository pattern
- **Benefits**:
  - Decoupled payment provider from Supabase implementation
  - Payment provider now testable with mocked repositories
  - Database implementation can be swapped without changing payment provider
  - All data access goes through abstraction layer (repositories)
  - Follows SOLID principles (Dependency Inversion, Single Responsibility)
  - Clear separation of concerns (business logic vs data access)
  - **Breaking Changes**: None (backward compatible)

### Architecture Improvements (v2.1)

#### Architectural Analysis
- **Completed**: Comprehensive codebase analysis
- **Identified Issues**:
  1. Global singleton anti-pattern in state management (P0)
  2. Tight coupling in payment provider (P1)
  3. No repository pattern for data access (P1)
  4. Circular dependency risk (P1)
  5. Configuration coupling in error handler (P2)
- **Defined**: Target architecture (Clean Architecture with DI)
- **Planned**: 4-phase refactoring strategy

#### Migration Path
- Incremental refactoring approach
- Create new architecture alongside existing code
- Gradually migrate modules one by one
- Keep old and new code compatible
- Delete old code after migration is complete

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
