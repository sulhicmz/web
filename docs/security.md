# Security & Compliance

This document outlines the security measures and compliance considerations for AstroPro Digital.

## Authentication & Authorization

### Supabase Authentication
- User authentication is handled by Supabase Auth
- Supports email/password and OAuth providers
- Session management with secure cookies
- Password strength requirements enforced by Supabase

### Role-Based Access Control (RBAC)
The system implements a four-tier role system:

- **Owner**: Full administrative access to all features and settings
- **Staff**: Project management and client communication capabilities
- **Client**: Access to their own projects and billing information
- **Viewer**: Read-only access to specific projects as granted by owners/staff

### Row-Level Security (RLS)
- All database operations are protected by Supabase RLS policies
- Data access is restricted based on user roles and ownership
- Policies are defined in `supabase/migrations/0001_core_schema.sql`
- Regular audits of RLS policies should be performed

## Data Protection

### Environment Variables & Secrets
- All sensitive credentials are stored as environment variables
- Never commit secrets to version control
- Use Cloudflare secrets for production deployments
- Rotate credentials regularly, especially if a breach is suspected

### Payment Security
- Payment processing handled by Midtrans (PCI DSS compliant)
- Payment information never touches our servers
- Webhook validation with signature verification
- Server keys stored securely as environment variables

### Data Encryption
- All data in transit is encrypted using HTTPS/TLS
- Supabase handles database encryption at rest
- Session data encrypted and stored securely

## API Security

### Rate Limiting
The application uses **persistent rate limiting** via Supabase to prevent abuse:

```typescript
import { persistentRateLimiter } from '@/lib/integration/rate-limiter';

const result = await persistentRateLimiter.check(
  'api:endpoint:192.168.1.1',
  { windowMs: 60000, maxRequests: 10 }
);
```

**Rate Limit Configuration:**
| Endpoint Type | Window | Max Requests | Burst Allowance |
|---------------|---------|--------------|-----------------|
| Default | 15 min | 100 | 20 |
| Payment | 1 hour | 10 | 5 |
| Webhook | 1 min | 10 | 2 |
| Auth | 15 min | 20 | 5 |
| API | 15 min | 100 | 20 |

### Input Validation

#### Zod Schema Validation
All user inputs are validated using Zod schemas:

```typescript
import { emailSchema, uuidSchema } from '@/lib/validation/common';

// Email validation
const result = emailSchema.safeParse(userInput);
if (!result.success) {
  // Handle validation error
}

// UUID validation
const uuidResult = uuidSchema.safeParse(id);
```

#### HTML Sanitization
When rendering user-generated HTML, use DOMPurify:

```typescript
import { sanitizeHtml, sanitizeText } from '@/lib/security/sanitize';

// For HTML content (rich text, markdown)
element.innerHTML = sanitizeHtml(userInput);

// For plain text (safest approach)
element.textContent = sanitizeText(userInput);
```

**When to use sanitization:**
- ✅ Rendering user-generated HTML (rich text editors)
- ✅ Displaying untrusted content with HTML
- ❌ Plain text display (use textContent instead)

#### SQL Injection Prevention
Supabase client automatically prevents SQL injection:

```typescript
// Safe: Parameterized query
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId);
```

### Webhook Security

#### Signature Verification
All webhooks verify signature before processing:

```typescript
const signature = request.headers.get('x-callback-token');
if (!(await provider.verifyWebhook(body, signature))) {
  throw new ApiError('Invalid webhook signature', 400);
}
```

#### Deduplication
Webhook deduplication prevents duplicate processing:

```typescript
const { isDuplicate } = await webhookDeduplicationService.checkAndMarkProcessed(
  webhookId,
  signature,
  orderId,
  'midtrans'
);

if (isDuplicate) {
  return Response.json({ success: true, duplicate: true });
}
```

#### Retry Queue
Failed webhooks are queued with exponential backoff:
- Retry attempts: 5
- Backoff: 5min, 15min, 1hr, 2hr, 4hr
- Dead-letter queue for exhausted retries

## Infrastructure Security

### Cloudflare Security
- SSL/TLS encryption for all traffic
- DDoS protection provided by Cloudflare
- Use Cloudflare Workers for server-side logic
- Regular security updates from Cloudflare

### Supabase Security
- Database access restricted by RLS policies
- Authentication managed by Supabase Auth
- Regular security updates from Supabase
- Audit logging for sensitive operations

## Privacy & Compliance

### Data Collection
- Only collect data necessary for operation
- Implement analytics consent banner (Plausible)
- Respect user privacy preferences
- Clear data retention policies

### GDPR Compliance
- Users can request data export
- Users can request data deletion
- Data processing agreements in place
- Privacy by design principles

### Data Retention
- Define clear data retention periods
- Automatically delete data after retention period
- Backup data retention policies
- Audit logs retention periods

## Security Monitoring

### Logging
- Log all authentication attempts
- Log all data access operations
- Monitor for suspicious activities
- Retain logs for security audits

### Error Handling
- Don't expose sensitive information in error messages
- Log errors server-side without exposing details to clients
- Implement proper error reporting
- Monitor error rates for potential attacks

## Security Best Practices

### Code Security
- Regular dependency updates (use `npm audit` and `npm outdated`)
- Security scanning of dependencies
- Code reviews for security-sensitive changes
- Static analysis tools
- Never commit secrets to git
- Use environment variables for all credentials

### Running Security Tests

```bash
# Check for vulnerabilities
npm audit

# Check for outdated packages
npm outdated

# Run security tests
npm test tests/unit/security/security-headers.test.ts

# Update packages
npm update
```

### Deployment Security
- Use HTTPS for all environments
- Regular security updates
- Secure credential management
- Access control for deployment systems

### Incident Response
- Document incident response procedures
- Regular security training for team
- Backup and recovery procedures
- Communication plan for security incidents

### Reporting Security Issues

If you discover a security vulnerability:

1. Do **NOT** create a public issue
2. Email security details to: security@astropro.digital
3. Include reproduction steps and impact assessment
4. Allow 90 days for remediation before disclosure

## Security Checklist

Before going to production, ensure the following:

- [ ] All secrets are properly configured as environment variables
- [ ] RLS policies are active and tested
- [ ] Authentication flows are working correctly
- [ ] Payment webhooks are validated
- [ ] Input validation is implemented
- [ ] Error messages don't expose sensitive information
- [ ] SSL/TLS is properly configured
 - [ ] Rate limiting is implemented for public endpoints
 - [ ] Audit logging is enabled
 - [ ] Security headers are set (CSP, HSTS, etc.)

## Security Headers

### Current Configuration

The application implements comprehensive security headers:

| Header | Value | Purpose |
|---------|--------|---------|
| Content-Security-Policy | See below | Prevents XSS, clickjacking |
| X-Content-Type-Options | nosniff | Prevents MIME type sniffing |
| X-Frame-Options | DENY | Prevents clickjacking |
| X-XSS-Protection | 1; mode=block | Legacy XSS protection |
| Referrer-Policy | strict-origin-when-cross-origin | Controls referrer information |
| Permissions-Policy | geolocation=(), microphone=(), camera=() | Restricts browser features |
| Strict-Transport-Security | max-age=31536000; includeSubDomains; preload | Enforces HTTPS (production only) |

### Content Security Policy (CSP)

```typescript
const cspDirectives = [
  "default-src 'self'",
  `script-src 'self' ${siteUrl}`,
  `style-src 'self' 'unsafe-inline' ${siteUrl}`,
  `img-src 'self' data: https: blob: ${supabaseDomain}`,
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseDomain} https://*.midtrans.com https://*.plausible.io`,
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "require-trusted-types-for 'script'",
  "report-uri /api/csp-report"
].join('; ');
```

**Key CSP Features:**
- **Strict default-src**: Only allows resources from same origin
- **No unsafe-inline scripts**: Script tags cannot contain inline code
- **Frame restriction**: Prevents clickjacking with `frame-src: none`
- **Object restriction**: Blocks plugins that could execute code
- **Trusted Types**: Enables Trusted Types API for DOM manipulation
- **CSP Reporting**: Reports violations to `/api/csp-report`