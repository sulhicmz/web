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

### 2. Tight Coupling in Payment Provider (P1)
**Location**: `src/lib/payments/providers/midtrans.ts`
**Issue**: Provider directly queries database for coupons, packages, addons
**Impact**:
- Violates separation of concerns
- Difficult to test (database dependency)
- Can't swap data source without changing provider
- Business logic mixed with data access

### 3. No Repository Pattern (P1)
**Location**: Scattered across `src/lib/supabase/queries/`
**Issue**: Direct database queries in service classes, no abstraction layer
**Impact**:
- Tight coupling to Supabase
- Difficult to mock for testing
- Can't swap database implementation
- Query logic scattered across codebase

### 4. Circular Dependency Risk (P1)
**Location**: `MidtransProvider` ↔ `supabase/server`
**Issue**: Potential circular dependency between payment provider and database client
**Impact**:
- Initialization order issues
- Difficult to understand dependency graph
- May cause runtime errors

### 5. Configuration Coupling (P2)
**Location**: `src/lib/error-handler.ts`
**Issue**: Error handler tightly coupled to `ERROR_MESSAGES` config
**Impact**:
- Difficult to test in isolation
- Can't use error handler with different configs
- Violates dependency inversion

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
- Provider interface: `PaymentProvider`
- Concrete implementation: `MidtransProvider`
- Never commit credentials to git

### State Management
- Current: Global singleton (`ClientStateManager`)
- Target: Context-based with proper lifecycle
- Separation: Server state vs Client state

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
| 2025-01-08 | 2.1 | State management refactoring - Replaced global singleton with context-based DI, added SSR isolation |
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

### Architecture Improvements (v2.0)

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
