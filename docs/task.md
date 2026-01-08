# Task Backlog

**Purpose**: Task Backlog & Status

## Legend
- **Status**: Backlog | In Progress | Complete | Blocked
- **Priority**: P0 (Critical) | P1 (High) | P2 (Medium) | P3 (Low)
- **Agent**: 01-11 (see Agent Assignment table)

---

## Tasks

### ARCH-001: Replace Global Singleton with Context-Based State Management
- **Status**: Complete
- **Priority**: P0
- **Agent**: 01 (Architect)
- **Description**: Replace `ClientStateManager` global singleton with context-based state management to fix SSR isolation issues and implicit dependencies
- **Impact**: Fixes state leaks between users in SSR, enables proper testing, follows dependency inversion principle
- **Implementation**:
  - Created `StateContext` interface for dependency injection
  - Implemented `ServerStateContext` for server-side state (no subscriptions)
  - Implemented `ClientStateContext` for client-side reactive state
  - Refactored `AppStateStore` to accept `StateContext` via constructor
  - Removed singleton pattern from `ClientStateManager` (now a thin wrapper)
  - Added factory functions: `createAppStateStore`, `createServerAppState`, `createClientAppState`
  - Added state hydration mechanism (server → client)
  - Updated all consumers and tests to use dependency injection
- **Files**: `src/lib/state/state-context.ts`, `src/lib/state/server-state-context.ts`, `src/lib/state/client-state-context.ts`, `src/lib/state/app-state.ts`, `src/lib/state/factory.ts`, `src/lib/state/hydration.ts`, `src/lib/state/index.ts`, `tests/unit/lib/client-state.test.ts`
- **Benefits**:
  - SSR context isolation (no state leaks between users)
  - Explicit dependencies via constructor injection
  - Testable with mocked dependencies
  - Backward compatible through `ClientStateManager.getInstance()` wrapper
  - Server → client state hydration support
- **Success Criteria**:
  - ✅ No global singleton pattern for new code
  - ✅ SSR context isolation achieved (separate contexts)
  - ✅ All dependencies explicit (constructor injection)
  - ✅ Unit tests pass with mocked dependencies
  - ✅ Build passes: `npm run check`

### TEST-001: Comprehensive Testing of Refactored State Management
- **Status**: Complete
- **Priority**: P0
- **Agent**: 11 (Test Engineer)
- **Description**: Create comprehensive unit tests for critical, untested business logic in refactored state management system
- **Impact**: Ensures correctness of P0 state management refactoring (ARCH-001), provides test coverage for critical paths
- **Implementation**:
  - Created tests for `AppStateStore` cache system with TTL expiration edge cases (20 tests)
  - Created tests for `AppStateStore` notification system including unreadCount computed property (21 tests)
  - Created tests for `AppStateStore` form state management with real-world scenarios (24 tests)
  - Created tests for hydration utilities (`hydrateClientState`, `extractServerState`, `createInitialStateScript`, `parseServerStateScript`) for SSR (30 tests)
  - Created tests for `ServerStateContext` non-reactive server-side state (30 tests)
  - Created tests for factory functions (`createAppStateStore`, `createServerAppState`, `createClientAppState`) (25 tests)
  - All tests follow AAA pattern (Arrange-Act-Assert)
  - Tests cover happy paths, sad paths, edge cases, and boundary conditions
- **Files**: `tests/unit/lib/app-state-cache.test.ts`, `tests/unit/lib/app-state-notifications.test.ts`, `tests/unit/lib/app-state-form.test.ts`, `tests/unit/lib/hydration.test.ts`, `tests/unit/lib/server-state-context.test.ts`, `tests/unit/lib/factory.test.ts`
- **Benefits**:
  - 150 new tests covering critical business logic
  - Tests ensure SSR isolation works correctly
  - Cache TTL edge cases covered (zero, negative, expired)
  - Notification system thoroughly tested including computed properties
  - Form state isolation and concurrent operations tested
  - Full hydration cycle (server → client) tested end-to-end
- **Success Criteria**:
  - ✅ Critical paths covered (cache, notifications, forms, hydration)
  - ✅ All 150 new tests pass consistently
  - ✅ Edge cases tested (TTL expiration, concurrent access, large payloads)
  - ✅ Tests readable and maintainable (AAA pattern, descriptive names)
  - ✅ Breaking code causes test failure (integration testing)
  - ✅ All existing tests still pass (376 total tests)
  - ✅ Build passes: `npm run check`

### ARCH-002: Implement Repository Pattern for Data Access
- **Status**: Complete
- **Priority**: P1
- **Agent**: 01 (Architect)
- **Description**: Create repository interfaces to abstract data access layer, removing direct database queries from service classes
- **Impact**: Decouples business logic from database, enables testing with mocks, allows database implementation swaps
- **Implementation**:
  - Created `IRepository<T>` base interface with CRUD operations
  - Created specific repository interfaces: `ICouponRepository`, `IPackageRepository`, `IAddonRepository`, `IProjectRepository`, `IClientRepository`, `IInvoiceRepository`, `IUserProfileRepository`
  - Implemented concrete Supabase repositories: `SupabaseCouponRepository`, `SupabasePackageRepository`, `SupabaseAddonRepository`, `SupabaseProjectRepository`, `SupabaseClientRepository`, `SupabaseInvoiceRepository`, `SupabaseUserProfileRepository`
  - Refactored `MidtransProvider` to accept repositories via constructor injection
  - Removed all Supabase-specific code from `MidtransProvider`
  - Created factory functions for dependency injection: `createRepositories()`, `createCouponRepository()`, etc.
  - Updated payment provider factory to work with repositories
  - Updated webhook endpoint to use repository pattern
- **Files**: `src/lib/repositories/`, `src/lib/payments/providers/midtrans.ts`, `src/lib/payments/factory.ts`, `src/pages/api/payments/webhook.ts`
- **Success Criteria**:
  - ✅ No direct database queries in service classes
  - ✅ All data access through repository interfaces
  - ✅ Dependencies injected via constructor
  - ✅ Build passes: `npm run check`
- **Benefits**:
  - Decoupled payment provider from Supabase implementation
  - Payment provider now testable with mocked repositories
  - Database implementation can be swapped without changing payment provider
  - Follows SOLID principles (Dependency Inversion, Single Responsibility)

### ARCH-003: Refactor Payment Provider to Remove Database Dependencies
- **Status**: Backlog (Blocked by ARCH-002)
- **Priority**: P1
- **Agent**: 01 (Architect)
- **Description**: Remove direct database access from `MidtransProvider`, delegating to repository interfaces
- **Impact**: Separates concerns, improves testability, follows single responsibility principle
- **Implementation**:
  - Define constructor parameters: `couponRepository`, `packageRepository`, `addonRepository`
  - Remove `getSupabaseClient()` method
  - Replace `fetchCouponRow()` with `this.couponRepository.findByCode()`
  - Replace `fetchPackageRow()` with `this.packageRepository.findByIdentifier()`
  - Replace `fetchAddonRows()` with `this.addonRepository.findByIds()`
  - Remove all Supabase-specific code from provider
  - Create factory function for provider instantiation with dependencies
- **Files**: `src/lib/payments/providers/midtrans.ts`
- **Success Criteria**:
  - No Supabase imports in provider
  - All database access through repositories
  - Provider tested with mocked repositories
  - Build passes: `npm run check`

### ARCH-004: Resolve Circular Dependency Risk
- **Status**: Backlog (Blocked by ARCH-002)
- **Priority**: P1
- **Agent**: 01 (Architect)
- **Description**: Resolve circular dependency between `MidtransProvider` and Supabase client initialization
- **Impact**: Eliminates initialization order issues, makes dependency graph clear
- **Implementation**:
  - Analyze dependency graph
  - Identify circular dependency points
  - Use dependency injection to break cycles
  - Consider lazy initialization where appropriate
  - Add dependency cycle detection in build process
- **Files**: `src/lib/payments/providers/midtrans.ts`, `src/lib/supabase/server.ts`
- **Success Criteria**:
  - No circular dependencies detected
  - Dependency graph is acyclic
  - Initialization order deterministic
  - Build passes: `npm run check`

### ARCH-005: Decouple Error Handler from Configuration
- **Status**: Backlog
- **Priority**: P2
- **Agent**: 01 (Architect)
- **Description**: Remove tight coupling between `ErrorHandler` and `ERROR_MESSAGES` config, enabling independent testing and usage
- **Impact**: Improves testability, follows dependency inversion principle, allows different error message configurations
- **Implementation**:
  - Create `ErrorMessageProvider` interface
  - Implement `DefaultErrorMessageProvider` using current config
  - Refactor `ErrorHandler` to accept provider via constructor
  - Add factory function for handler instantiation
  - Update all consumers to use dependency injection
- **Files**: `src/lib/error-handler.ts`, `src/config.ts`
- **Success Criteria**:
  - No direct config import in error handler
  - Error handler tested with mock provider
  - Build passes: `npm run check`

### ARCH-006: Implement Dependency Injection Container
- **Status**: Backlog (Blocked by ARCH-001, ARCH-002)
- **Priority**: P2
- **Agent**: 01 (Architect)
- **Description**: Create a simple dependency injection container to manage service lifetimes and resolve dependencies
- **Impact**: Centralized dependency management, easier testing, clearer dependency graph
- **Implementation**:
  - Design container API (register, resolve, singleton/transient scopes)
  - Implement lightweight DI container (avoid over-engineering)
  - Register services: repositories, providers, state contexts
  - Add factory functions for complex object creation
  - Update initialization code to use container
- **Files**: `src/lib/di/`, `src/lib/` (various initialization points)
- **Success Criteria**:
  - Container resolves all dependencies
  - Singleton/transient scoping works correctly
  - No manual dependency construction in application code
  - Build passes: `npm run check`

---

## Integration Engineering Tasks

### INT-001: Create Webhook Deduplication Table Migration
- **Status**: Complete
- **Priority**: High
- **Agent**: Integration Engineer
- **Description**: Create database tables for webhook deduplication to prevent duplicate processing
- **Impact**: Ensures at-least-once webhook processing, prevents duplicate payments
- **Implementation**:
  - Created `payment_webhook_dedup` table with unique constraint on (webhook_id, signature)
  - Created `payment_webhook_retry_queue` table for retrying failed webhooks
  - Created `whatsapp_events` and `whatsapp_retry_queue` tables for WhatsApp webhook tracking
  - Created `webhook_dead_letter_queue` table for permanently failed webhooks
  - Created `rate_limits` table for persistent rate limiting
  - Added RLS policies for all tables
  - Created triggers for auto-updating timestamps
- **Files**: `supabase/migrations/0003_webhook_infrastructure.sql`
- **Success Criteria**:
  - ✅ All webhook tables created with proper constraints
  - ✅ RLS policies configured for service access
  - ✅ Migration passes successfully

### INT-002: Implement Webhook Deduplication Service
- **Status**: Complete
- **Priority**: High
- **Agent**: Integration Engineer
- **Description**: Create service to manage webhook deduplication and retry logic
- **Impact**: Provides at-least-once processing semantics, prevents duplicate webhook execution
- **Implementation**:
  - Implemented `WebhookDeduplicationService` class
  - Added `checkAndMarkProcessed()` for idempotent webhook processing
  - Added `enqueueRetry()` for queueing failed webhooks with exponential backoff
  - Added `getRetryableWebhooks()` for fetching webhooks ready for retry
  - Added `moveToDeadLetter()` for permanently failed webhooks
  - Added `cleanupOldRecords()` for maintenance
  - Added retry statistics and dead-letter queue methods
- **Files**: `src/lib/integration/webhook-deduplication.ts`
- **Success Criteria**:
  - ✅ Webhooks deduplicated based on signature
  - ✅ Failed webhooks queued with exponential backoff (5, 15, 60, 120, 240 minutes)
  - ✅ Dead-letter queue implemented for exhausted retries
  - ✅ Cleanup mechanism for old records
  - ✅ Race condition handling with database constraints

### INT-003: Refactor Payment Webhook with Deduplication
- **Status**: Complete
- **Priority**: High
- **Agent**: Integration Engineer
- **Description**: Update payment webhook endpoint to use deduplication service and retry queue
- **Impact**: Eliminates duplicate payment processing, ensures reliability
- **Implementation**:
  - Refactored `/api/payments/webhook` to check deduplication table
  - Added retry queue enqueue on processing failures
  - Returns appropriate status codes (200 for success, 202 for queued)
  - Maintains backward compatibility
- **Files**: `src/pages/api/payments/webhook.ts`
- **Success Criteria**:
  - ✅ Duplicate webhooks detected and skipped
  - ✅ Failed webhooks queued for retry
  - ✅ Signature validation preserved
  - ✅ Response format standardized

### INT-004: Create Persistent Rate Limiter
- **Status**: Complete
- **Priority**: Medium
- **Agent**: Integration Engineer
- **Description**: Implement persistent rate limiting using Supabase instead of in-memory storage
- **Impact**: Enables rate limiting across multiple instances, persistent across restarts
- **Implementation**:
  - Created `PersistentRateLimiter` class using Supabase
  - Implemented per-endpoint configuration support
  - Added rate limit check with automatic expiration
  - Added rate limit reset functionality
  - Added cleanup for expired records
  - Configured default limits for different endpoint types (payment, webhook, auth, api)
- **Files**: `src/lib/integration/rate-limiter.ts`, `supabase/migrations/0003_webhook_infrastructure.sql`
- **Success Criteria**:
  - ✅ Rate limits stored persistently in database
  - ✅ Per-endpoint configuration supported
  - ✅ Atomic operations prevent race conditions
  - ✅ Expired records automatically cleaned up

### INT-005: Create Dead-Letter Queue Handler
- **Status**: Complete
- **Priority**: Medium
- **Agent**: Integration Engineer
- **Description**: Create service to process and retry failed webhooks from dead-letter queue
- **Impact**: Enables manual intervention and retry of permanently failed webhooks
- **Implementation**:
  - Implemented `DeadLetterQueueHandler` class
  - Added processing for payment and WhatsApp dead-letter webhooks
  - Added dead-letter queue statistics
  - Added manual retry functionality for specific webhooks
  - Added archiving for processed dead-letter records
- **Files**: `src/lib/integration/dead-letter-handler.ts`
- **Success Criteria**:
  - ✅ Dead-letter webhooks can be processed
  - ✅ Manual retry available for individual webhooks
  - ✅ Statistics and monitoring support
  - ✅ Archive mechanism for processed records

### INT-006: Create Webhook Metrics Service
- **Status**: Complete
- **Priority**: Low
- **Agent**: Integration Engineer
- **Description**: Create service to provide metrics for webhook processing health monitoring
- **Impact**: Enables observability and debugging of webhook processing issues
- **Implementation**:
  - Implemented `WebhookMetricsService` class
  - Added metrics for processed webhooks, duplicates, retry queue, dead-letter queue
  - Added detailed retry queue information
  - Added health status calculation (healthy/degraded/unhealthy)
  - Created metrics API endpoint with multiple views
- **Files**: `src/lib/integration/webhook-metrics.ts`, `src/pages/api/webhook/metrics.ts`
- **Success Criteria**:
  - ✅ Comprehensive metrics available
  - ✅ Health status calculation based on queue sizes
  - ✅ Multiple metric views (summary, health, retry-queue, dead-letter)
  - ✅ Admin API endpoint for metrics access

### INT-007: Create Webhook Replay Endpoint
- **Status**: Complete
- **Priority**: Low
- **Agent**: Integration Engineer
- **Description**: Create admin endpoint to replay failed webhooks from dead-letter queue
- **Impact**: Enables manual debugging and recovery from webhook failures
- **Implementation**:
  - Created `/api/webhook/replay` endpoint
  - Added admin token authentication
  - Implemented retry logic for specific dead-letter webhooks
  - Added proper error handling and response formatting
- **Files**: `src/pages/api/webhook/replay.ts`
- **Success Criteria**:
  - ✅ Dead-letter webhooks can be replayed manually
  - ✅ Admin authentication required
  - ✅ Clear success/failure feedback

---

## Completed Tasks

### REFACTOR-001: Extract Error Handler Type Discrimination
- **Status**: Complete
- **Priority**: P1
- **Agent**: 01 (Architect)
- **Description**: Create type-safe error type discriminator utility that maps error instances to their properties (statusCode, errorCode, message), eliminating repetitive instanceof chains
- **Implementation**:
  - Created `ErrorTypeMetadata` interface with statusCode, errorCode, isRetryable
  - Implemented `getErrorType(error: unknown)` function for type-safe error discrimination
  - Refactored handleApiError to use error discriminator (eliminated 7 instanceof checks)
  - Refactored handleMiddlewareError to use error discriminator (eliminated 3 instanceof checks)
  - Refactored isRetryableError to use error discriminator (eliminated 2 instanceof checks)
  - Refactored getStatusCode to use error discriminator (eliminated 7 instanceof checks)
- **Benefits**:
  - DRY principle: Eliminated 60+ lines of duplicate instanceof chains
  - Single source of truth for error type mapping
  - Adding new error types now requires only one location change
  - Type-safe error handling with reduced maintenance burden
  - Improved code readability and maintainability

---

## Agent Assignment

| Agent | Role | Specialization |
|-------|------|----------------|
| 01 | Architect | System architecture, refactoring, design patterns |
| 02-11 | TBD | Future agents |

---

## Notes

### Task Dependencies
- ARCH-003 (Payment Provider Refactor) blocked by ARCH-002 (Repository Pattern)
- ARCH-004 (Circular Dependency) blocked by ARCH-002 (Repository Pattern)
- ARCH-006 (DI Container) blocked by ARCH-001 (State Management) and ARCH-002 (Repository Pattern)

### Recommended Task Order
1. ARCH-001 (P0) - Critical state management issue
2. ARCH-002 (P1) - Foundation for other refactoring tasks
3. ARCH-003 (P1) - Unblocked after ARCH-002
4. ARCH-004 (P1) - Unblocked after ARCH-002
5. ARCH-005 (P2) - Independent, can be done anytime
6. ARCH-006 (P2) - Unblocked after ARCH-001 and ARCH-002

### Testing Strategy
- Each task must include unit tests
- Integration tests for data layer
- Manual verification for UI changes
- Run `npm run check` before marking complete

### Success Metrics
- Reduced code complexity
- Improved test coverage
- Fewer circular dependencies
- Clearer separation of concerns
- Easier to add new features
