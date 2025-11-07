# Testing & Quality Assurance

This document outlines the testing strategy and quality assurance procedures for AstroPro Digital.

## Testing Strategy

### Automated Testing
- Unit tests for utility functions and components
- Integration tests for API endpoints and database interactions
- End-to-end tests for critical user flows
- Visual regression testing for UI components

### Quality Gates
- Code linting and formatting checks
- Type checking with TypeScript
- Build validation
- Dependency security scanning

## Current Test Setup

### Build & Type Checking
Run the comprehensive check that includes building the project and type checking:

```bash
npm run check
```

This command runs:
- `astro build` - Validates the build process
- `tsc` - TypeScript type checking
- `wrangler deploy --dry-run` - Validates Cloudflare worker configuration

### Manual Testing Checklist

#### Marketing Site
- [ ] All pages load correctly
- [ ] Navigation works across all devices
- [ ] Contact forms submit correctly
- [ ] Portfolio items display properly
- [ ] Blog posts render correctly
- [ ] Responsive design on mobile/tablet
- [ ] SEO metadata is present

#### Client Portal
- [ ] Authentication flows work (login, signup, password reset)
- [ ] Different user roles have appropriate access
- [ ] Dashboard displays correctly for each role
- [ ] Project management features work
- [ ] Billing and payment pages function
- [ ] Support ticket system works
- [ ] Profile management works

#### Payment Integration
- [ ] Payment session creation works
- [ ] Midtrans checkout flows function
- [ ] Webhook processing handles events correctly
- [ ] Payment status updates properly

#### API Endpoints
- [ ] All API endpoints return expected responses
- [ ] Authentication is enforced on protected endpoints
- [ ] Error handling works correctly
- [ ] Rate limiting functions properly

## Testing Guidelines

### Unit Tests
- Test individual functions and utilities
- Focus on pure functions and business logic
- Aim for high code coverage on critical functions
- Use descriptive test names

### Integration Tests
- Test API endpoints with mocked dependencies
- Verify database interactions
- Test authentication and authorization flows
- Validate external service integrations

### End-to-End Tests
- Test critical user journeys
- Cover authentication flows
- Test payment processes
- Verify portal functionality

### Visual Regression Testing
- Capture baseline screenshots of key pages
- Run tests across different screen sizes
- Test both light and dark modes if applicable
- Update baselines when UI changes are intentional

## Quality Metrics

### Performance
- Page load times under 3 seconds
- Core Web Vitals scores:
  - Largest Contentful Paint (LCP) < 2.5s
  - First Input Delay (FID) < 100ms
  - Cumulative Layout Shift (CLS) < 0.1

### Code Quality
- TypeScript type coverage
- Linting rules compliance
- Dependency vulnerability checks
- Code complexity metrics

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Proper contrast ratios

## Testing Commands

### Running Tests
```bash
# Run build validation and type checking
npm run check

# Build the project
npm run build

# Preview the production build locally
npm run preview
```

### CI/CD Integration
When CI/CD is set up (see `docs/plan/15_ci_cd.md`), tests should run automatically:
- On pull requests
- Before deployment
- As scheduled health checks

## Supabase Testing

### Local Development
When testing Supabase features locally:

1. Use the local Supabase stack:
   ```bash
   supabase start
   ```

2. Test RLS policies with different user roles
3. Verify authentication flows
4. Test database triggers and functions

### Migration Testing
- Test migrations against a clean database
- Verify seed data loads correctly
- Check that down migrations work if implemented

## Payment Testing

### Sandbox Environment
- Use Midtrans sandbox for payment testing
- Test various payment scenarios
- Verify webhook processing with test events
- Validate error handling for failed payments

### Webhook Testing
- Manually trigger webhook events in sandbox
- Verify signature validation
- Test error handling and retries
- Log all webhook interactions

## Documentation Testing

### Runbook Validation
- Follow runbooks in `docs/runbooks/` with real scenarios
- Update procedures based on actual use
- Test incident response procedures
- Validate backup and recovery processes

## Security Testing

### Authentication Testing
- Test all authentication flows
- Verify role-based access
- Test session expiration
- Validate password policies

### Input Validation Testing
- Test for SQL injection
- Check for XSS vulnerabilities
- Validate file upload restrictions
- Test API endpoint security

## Performance Testing

### Load Testing
- Test application under expected load
- Monitor response times
- Check resource utilization
- Verify database performance

### Optimization Testing
- Test image optimization
- Verify code splitting effectiveness
- Check caching behavior
- Monitor bundle sizes

## Accessibility Testing

### Automated Testing
- Use tools like axe-core for automated checks
- Run accessibility tests in CI/CD
- Check color contrast ratios
- Validate semantic HTML

### Manual Testing
- Test with screen readers
- Verify keyboard navigation
- Check focus management
- Validate form accessibility

## Test Documentation Updates

When adding new features:
1. Update testing procedures
2. Add new test cases
3. Document any special testing requirements
4. Update the manual QA checklist
5. Add any necessary visual regression tests