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

### TEST-002: Comprehensive Testing of Dependency Injection Container
- **Status**: Complete
- **Priority**: P1
- **Agent**: 11 (Test Engineer)
- **Description**: Create comprehensive unit tests for DIContainer to ensure correct service lifecycle management and dependency resolution
- **Impact**: Ensures correctness of ARCH-006 DI container implementation, provides test coverage for critical infrastructure
- **Implementation**:
  - Created tests for `DIContainer` service registration with default singleton scope
  - Created tests for singleton scoping to ensure same instance returned on multiple resolves
  - Created tests for transient scoping to ensure new instance returned on each resolve
  - Created tests for service registration, resolution, and checking existence with `has()` method
  - Created tests for container reset with `clear()` method
  - Created tests for mixed singleton and transient services
  - Created tests for error handling (resolving unregistered services)
  - Created tests for edge cases (special characters, empty names, null returns, factory errors)
  - Created integration scenario tests (dependency injection pattern, test isolation)
- **Files**: `tests/unit/lib/di-container.test.ts`
- **Benefits**:
  - 30 new tests covering DIContainer functionality
  - Tests ensure singleton/transient scoping works correctly
  - Service lifecycle and registration tested
  - Container reset functionality tested for test isolation
  - Edge cases handled (special characters, factory errors, null returns)
- **Success Criteria**:
  - ✅ DIContainer methods tested (register, resolve, has, clear)
  - ✅ Singleton/transient scoping tested
  - ✅ All 30 new tests pass consistently
  - ✅ Edge cases tested (factory errors, null returns, special characters)
  - ✅ Tests readable and maintainable (AAA pattern, descriptive names)
  - ✅ All existing tests still pass (406 total tests)
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
- **Status**: Complete
- **Priority**: P1
- **Agent**: 01 (Architect)
- **Description**: Remove direct database access from `MidtransProvider`, delegating to repository interfaces
- **Impact**: Separates concerns, improves testability, follows single responsibility principle
- **Implementation**:
   - Defined constructor parameters: `couponRepository`, `packageRepository`, `addonRepository`
   - Removed `getSupabaseClient()` method
   - Replaced `fetchCouponRow()` with `this.couponRepository.findByCode()`
   - Replaced `fetchPackageRow()` with `this.packageRepository.findByIdentifier()`
   - Replaced `fetchAddonRows()` with `this.addonRepository.findByIds()`
   - Removed all Supabase-specific code from provider
   - Created factory function for provider instantiation with dependencies
- **Files**: `src/lib/payments/providers/midtrans.ts`, `src/lib/payments/factory.ts`
- **Benefits**:
   - Payment provider now decoupled from Supabase
   - Testable with mocked repositories
   - Database implementation swappable without changes
- **Success Criteria**:
   - ✅ No Supabase imports in provider
   - ✅ All database access through repositories
   - ✅ Build passes: `npm run check`

### ARCH-004: Resolve Circular Dependency Risk
- **Status**: Complete
- **Priority**: P1
- **Agent**: 01 (Architect)
- **Description**: Resolve circular dependency between repository module exports
- **Impact**: Eliminates initialization order issues, makes dependency graph clear
- **Implementation**:
  - Analyzed dependency graph using madge
  - Identified circular dependency: `repositories/index.ts → factory.ts → index.ts`
  - Root cause: `factory.ts` importing types from `index.ts` which re-exports from `factory.ts`
  - Solution: Updated `factory.ts` to import repository interfaces directly from individual files
  - Removed duplicate `QueryOptions` definitions across multiple files
  - Centralized `QueryOptions` in `base.ts`
  - Updated Supabase implementations to import from `base.ts`
- **Files**: `src/lib/repositories/factory.ts`, `src/lib/repositories/index.ts`, `src/lib/repositories/project.repository.ts`, `src/lib/repositories/client.repository.ts`, `src/lib/repositories/user-profile.repository.ts`, `src/lib/repositories/invoice.repository.ts`, `src/lib/repositories/supabase/client.repository.ts`, `src/lib/repositories/supabase/invoice.repository.ts`, `src/lib/repositories/supabase/project.repository.ts`, `src/lib/repositories/supabase/user-profile.repository.ts`
- **Benefits**:
  - Acyclic dependency graph (verified with madge)
  - Deterministic initialization order
  - No duplicate type definitions
  - Clearer module boundaries
  - Follows SOLID principles (Single Responsibility, Dependency Inversion)
- **Success Criteria**:
   - ✅ No circular dependencies detected (madge verified)
   - ✅ Dependency graph is acyclic
   - ✅ Initialization order deterministic
   - ✅ Build passes: `npm run check`

### ARCH-005: Decouple Error Handler from Configuration
- **Status**: Complete
- **Priority**: P2
- **Agent**: 01 (Architect)
- **Description**: Remove tight coupling between `ErrorHandler` and `ERROR_MESSAGES` config, enabling independent testing and usage
- **Impact**: Improves testability, follows dependency inversion principle, allows different error message configurations
- **Implementation**:
  - Created `IErrorMessageProvider` interface for error message contracts
  - Implemented `DefaultErrorMessageProvider` using current config values
  - Refactored error handler to use provider via `getMessageProvider()` helper
  - Added `setMessageProvider()` and `resetMessageProvider()` for testing
  - Removed all direct config imports from error handler
- **Files**: `src/lib/error-handler/error-message-provider.interface.ts`, `src/lib/error-handler/default-error-message-provider.ts`, `src/lib/error-handler/provider-instance.ts`, `src/lib/error-handler.ts`
- **Benefits**:
  - Error handler decoupled from config module
  - Error handler now testable with mocked message providers
  - Error messages can be swapped without changing error handler
  - Backward compatible through default provider instance
  - Follows SOLID principles (Dependency Inversion)
- **Success Criteria**:
  - ✅ No direct config import in error handler
  - ✅ All error messages accessed through provider interface
  - ✅ Provider can be swapped for testing
  - ✅ Build passes: `npm run check`

### ARCH-006: Implement Dependency Injection Container
- **Status**: Complete
- **Priority**: P2
- **Agent**: 01 (Architect)
- **Description**: Create a simple dependency injection container to manage service lifetimes and resolve dependencies
- **Impact**: Centralized dependency management, easier testing, clearer dependency graph
- **Implementation**:
  - Designed container API (register, resolve, has, clear, singleton/transient scopes)
  - Implemented lightweight DIContainer class
  - Created registry module with `initializeContainer()`, `getContainer()`, `resetContainer()`
  - Registered services: repositories, providers, state contexts, error message provider
  - Added `ServiceScope` type (singleton, transient)
  - Added `ServiceFactory<T>` type for complex object creation
- **Files**: `src/lib/di/container.ts`, `src/lib/di/registry.ts`, `src/lib/di/index.ts`
- **Benefits**:
  - Centralized service registration and resolution
  - Singleton/transient scoping for service lifetimes
  - Testable with reset functionality
  - Clearer dependency graph
  - Lightweight implementation (avoiding over-engineering)
- **Success Criteria**:
  - ✅ Container resolves all dependencies
  - ✅ Singleton/transient scoping works correctly
  - ✅ Factory functions for complex objects
  - ✅ Reset functionality for testing
  - ✅ Build passes: `npm run check`

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

## UI/UX Engineering Tasks

### UIUX-001: Fix FormInput Component Accessibility
- **Status**: Complete
- **Priority**: High
- **Agent**: 12 (UI/UX Engineer)
- **Description**: Replace emoji icons with accessible SVG icons in FormInput component
- **Impact**: Improves accessibility for screen readers, aligns with professional design system
- **Implementation**:
  - Created reusable Icon component with accessible SVG icons
  - Replaced emoji icons (👤, 📧, 🔒, 📱, 🏢, 🌐, 🔍, 📅, 📍) with proper SVG icons
  - Added error and success icon variants with proper ARIA labels
  - Removed redundant emoji pseudo-elements
  - Ensured proper keyboard navigation and focus states
- **Files**: `src/components/ui/Icon.astro`, `src/components/ui/FormInput.astro`
- **Benefits**:
  - Screen reader compatible with proper aria-labels
  - Professional SVG-based icons that scale properly
  - Consistent icon sizing and styling
  - Better semantic HTML and ARIA attributes
- **Success Criteria**:
  - ✅ No emoji icons in FormInput component
  - ✅ All icons have proper aria-labels
  - ✅ SVG icons accessible to screen readers
  - ✅ Focus states visible and working
  - ✅ Build passes: `npm run check`

### UIUX-002: Fix PortalHeader User Menu Accessibility
- **Status**: Complete
- **Priority**: High
- **Agent**: 12 (UI/UX Engineer)
- **Description**: Make user menu dropdown keyboard accessible with click pattern instead of hover
- **Impact**: Enables keyboard navigation for all users, improves accessibility
- **Implementation**:
  - Replaced hover-triggered dropdown with click pattern
  - Added ARIA attributes (aria-haspopup, aria-expanded, role="menu")
  - Implemented keyboard navigation (Enter/Space to open, Escape to close)
  - Added focus trap within dropdown with Tab navigation
  - Click outside to close functionality
  - Replaced emoji icons with Icon component
- **Files**: `src/components/portal/PortalHeader.astro`, `src/components/ui/Icon.astro`
- **Benefits**:
  - Keyboard accessible dropdown navigation
  - Proper ARIA attributes for screen readers
  - Focus trap ensures keyboard users don't lose focus
  - Click outside improves UX
  - Consistent with accessibility best practices
- **Success Criteria**:
  - ✅ Dropdown opens on click (not hover)
  - ✅ Keyboard navigation works (Enter, Space, Arrow keys, Tab, Escape)
  - ✅ Proper ARIA attributes
  - ✅ Focus management working
  - ✅ Build passes: `npm run check`

### UIUX-004: Create SVG Icon System
- **Status**: Complete
- **Priority**: High
- **Agent**: 12 (UI/UX Engineer)
- **Description**: Create reusable SVG icon component to replace emoji usage throughout components
- **Impact**: Provides consistent, accessible icon system across all UI components
- **Implementation**:
  - Created Icon.astro component with 20+ accessible SVG icons
  - Icons include: user, email, password, phone, company, website, search, calendar, location, error, success, settings, support, logout, notification, eye, add, invoice, book, arrow
  - All icons have proper aria-labels
  - Configurable size and CSS classes
  - Role="img" for screen readers
  - TypeScript types for icon names
- **Files**: `src/components/ui/Icon.astro`
- **Benefits**:
  - Reusable, accessible icon system
  - Consistent icon styling across components
  - Screen reader compatible
  - Professional SVG-based icons
  - Scalable and performant
  - Type-safe with TypeScript
- **Success Criteria**:
  - ✅ Comprehensive icon set created
  - ✅ All icons have aria-labels
  - ✅ Reusable across components
  - ✅ Type-safe implementation
  - ✅ Build passes: `npm run check`

### UIUX-005: Fix Dashboard Action Cards
- **Status**: Complete
- **Priority**: Medium
- **Agent**: 12 (UI/UX Engineer)
- **Description**: Replace emoji icons and improve focus states in dashboard action cards
- **Impact**: Improves accessibility and visual consistency
- **Implementation**:
  - Replaced emoji icons (➕, 🎫, 🧾, 📚, 👁, ⚙) with Icon component
  - Added visible focus indicators (3px outline)
  - Improved button icon styling
  - Enhanced hover and focus states
- **Files**: `src/pages/portal/dashboard.astro`, `src/components/ui/Icon.astro`
- **Benefits**:
  - Accessible icons with proper aria-labels
  - More visible focus states for keyboard navigation
  - Consistent icon styling with design system
  - Better visual feedback on interaction
- **Success Criteria**:
  - ✅ No emoji icons in action cards
  - ✅ Focus indicators clearly visible
  - ✅ Icons properly styled
  - ✅ Build passes: `npm run check`

---

## Security Engineering Tasks

### SEC-001: Update Outdated Dependencies
- **Status**: Complete
- **Priority**: Medium
- **Agent**: Security Specialist
- **Description**: Update all outdated npm packages to latest versions
- **Implementation**:
  - Updated @supabase/supabase-js: 2.90.0 → 2.90.1
  - Updated @vitest/coverage-v8: 4.0.16 → 4.0.17
  - Updated @vitest/ui: 4.0.16 → 4.0.17
  - Updated vitest: 4.0.16 → 4.0.17
  - Updated astro: 5.16.7 → 5.16.9
  - Updated typescript-eslint: 8.52.0 → 8.53.0
  - Updated wrangler: 4.57.0 → 4.59.1
- **Benefits**: Latest security patches, bug fixes, performance improvements
- **Success Criteria**:
  - ✅ No outdated packages
  - ✅ npm audit passes (0 vulnerabilities)
  - ✅ All tests pass (420 tests)
  - ✅ Build passes: `npm run check`

### SEC-002: Enhance Content Security Policy
- **Status**: Complete
- **Priority**: High
- **Agent**: Security Specialist
- **Description**: Strengthen CSP configuration to prevent XSS attacks
- **Implementation**:
  - Removed `unsafe-inline` from script-src directive
  - Added Supabase domain to connect-src
  - Added Plausible and Google Analytics to connect-src
  - Added `require-trusted-types-for 'script'` directive
  - Configured Supabase domain dynamically based on env variable
- **Files**: `src/middleware/auth-guard.ts`
- **Benefits**:
  - Prevents inline script execution (XSS protection)
  - Enables Trusted Types API for secure DOM manipulation
  - Restricts external resource loading
  - Comprehensive CSP violation reporting
- **Success Criteria**:
  - ✅ No `unsafe-inline` in script-src
  - ✅ Trusted Types enabled
  - ✅ Dynamic domain configuration
  - ✅ Security headers tests passing

### SEC-003: Implement DOMPurify for HTML Sanitization
- **Status**: Complete
- **Priority**: Medium
- **Agent**: Security Specialist
- **Description**: Create HTML sanitization utilities for user-generated content
- **Implementation**:
  - Created `src/lib/security/sanitize.ts` with sanitization utilities
  - Implemented `sanitizeHtml()` using DOMPurify with strict config
  - Implemented `sanitizeText()` for plain text escaping
  - Configured allowed HTML tags and attributes
  - Updated security documentation with usage guidelines
- **Files**: `src/lib/security/sanitize.ts`, `docs/security.md`
- **Benefits**:
  - Safe HTML rendering for user content
  - XSS prevention through sanitization
  - Clear guidelines for developers
  - Support for rich text with security constraints
- **Success Criteria**:
  - ✅ Sanitization utilities created
  - ✅ DOMPurify configuration strict
  - ✅ Documentation updated with usage examples
  - ✅ No direct innerHTML without sanitization (except escapeHtml)

### SEC-004: Implement Persistent Rate Limiting
- **Status**: Complete
- **Priority**: High
- **Agent**: Security Specialist
- **Description**: Replace in-memory rate limiting with persistent database-backed rate limiting
- **Implementation**:
  - Created `src/middleware/rate-limit.ts` for persistent rate limit middleware
  - Updated `/api/payments/webhook` to use persistent rate limiter
  - Updated `/api/webhook/replay` to use persistent rate limiter
  - Added rate limit headers to responses (X-RateLimit-*, Retry-After)
  - Configured per-endpoint rate limits (webhook, api, replay)
- **Files**: `src/middleware/rate-limit.ts`, `src/pages/api/payments/webhook.ts`, `src/pages/api/webhook/replay.ts`
- **Benefits**:
  - Rate limits persist across instances (distributed systems)
  - Rate limits survive server restarts
  - Prevents rate limit evasion by rotating IPs
  - Consistent rate limiting across infrastructure
- **Success Criteria**:
  - ✅ Persistent rate limiter used in endpoints
  - ✅ Rate limit headers added to responses
  - ✅ Per-endpoint configuration
  - ✅ Error handling for rate limit failures

### SEC-005: Add Security Tests
- **Status**: Complete
- **Priority**: Low
- **Agent**: Security Specialist
- **Description**: Create tests to validate security headers and configurations
- **Implementation**:
  - Created `tests/unit/security/security-headers.test.ts` with 14 tests
  - Tests for CSP directives (script-src, frame-src, object-src)
  - Tests for security headers (X-Frame-Options, X-Content-Type-Options, etc.)
  - Tests for rate limiting logic
  - Tests for input validation (email, URL, UUID)
  - Tests for secrets management (no hardcoded secrets)
- **Files**: `tests/unit/security/security-headers.test.ts`
- **Benefits**:
  - Automated security validation
  - Regression prevention for security changes
  - Clear security requirements documented in tests
  - Coverage of critical security patterns
- **Success Criteria**:
  - ✅ 14 security tests created
  - ✅ All security tests passing
  - ✅ Tests cover headers, rate limiting, validation
  - ✅ Integration with existing test suite

---

## Notes

### Task Dependencies
- ✅ ARCH-003 (Payment Provider Refactor) - Completed (was blocked by ARCH-002)
- ✅ ARCH-004 (Circular Dependency) - Complete (was blocked by ARCH-002)
- ✅ ARCH-005 (Error Handler Decoupling) - Complete
- ✅ ARCH-006 (DI Container) - Complete

### Recommended Task Order
1. ✅ ARCH-001 (P0) - Complete - Critical state management issue
2. ✅ ARCH-002 (P1) - Complete - Foundation for other refactoring tasks
3. ✅ ARCH-003 (P1) - Complete - Payment provider refactoring
4. ✅ ARCH-004 (P1) - Complete - Circular dependency resolution
5. ✅ ARCH-005 (P2) - Complete - Error handler decoupling (independent)
6. ✅ ARCH-006 (P2) - Complete - DI container (unblocked)

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
