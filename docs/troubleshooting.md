# Troubleshooting Guide

This document provides solutions to common issues you may encounter when running or deploying AstroPro Digital.

## Development Issues

### Node.js Version Issues
**Problem**: Build fails with Node version error
**Solution**: 
- Ensure you're using Node.js 20 LTS (or >=18.20.8)
- Check your version: `node -v`
- Upgrade Node if needed, then run `npm ci` again

### Supabase Not Starting
**Problem**: `supabase start` fails or doesn't start properly
**Solution**:
1. Ensure Docker is running
2. Check Docker resources (memory allocation may be too low)
3. Run `supabase status` to check service status
4. If issues persist, stop and restart: `supabase stop && supabase start`

### Environment Variables Not Loading
**Problem**: Application throws errors about missing configuration
**Solution**:
1. Verify `.env.local` file exists and contains required variables
2. Check that variable names match exactly what the code expects
3. Restart the development server after making changes
4. Ensure sensitive keys are not committed to version control

### Authentication Not Working
**Problem**: Login/signup fails or authentication doesn't work properly
**Solution**:
1. Verify Supabase configuration in environment variables
2. Check that the Supabase project has email authentication enabled
3. Ensure RLS policies are set up correctly
4. Check browser console for authentication errors
5. Verify session management is working

## Build Issues

### Build Fails
**Problem**: `npm run build` fails
**Solution**:
1. Run `npm run check` to identify specific issues
2. Verify all environment variables are set for build
3. Check TypeScript errors with `tsc`
4. Ensure all dependencies are properly installed
5. Check for any syntax errors in templates or components

### Type Checking Errors
**Problem**: Type checking fails with TypeScript errors
**Solution**:
1. Run `tsc --noEmit` to see all type errors
2. Check for missing type definitions
3. Verify imports and exports are correct
4. Update type definitions if needed

## Payment Integration Issues

### Midtrans Integration Problems
**Problem**: Payment processing fails or returns errors
**Solution**:
1. Verify Midtrans server key is correct and has proper permissions
2. Check that `PAYMENT_ENV` is set to `sandbox` for development
3. Ensure webhook URL is properly configured in Midtrans dashboard
4. Check Cloudflare logs for payment-related errors: `[payments/*]`
5. Verify payment payload structure matches expected format

### Webhook Signature Validation
**Problem**: Webhook requests fail signature validation
**Solution**:
1. Ensure the server key matches between application and Midtrans dashboard
2. Verify the webhook URL uses HTTPS in production
3. Check that the request body is not modified before signature validation
4. Review Cloudflare logs for detailed error messages

## Portal Functionality Issues

### Portal Routes Redirecting Unexpectedly
**Problem**: Portal pages redirect to login even when authenticated
**Solution**:
1. Check that auth middleware is properly implemented
2. Verify Supabase session handling
3. Ensure correct user roles are assigned
4. Check RLS policies in Supabase database

### RBAC (Role-Based Access Control) Not Working
**Problem**: Users have incorrect permissions or can't access appropriate features
**Solution**:
1. Verify user roles are correctly assigned in Supabase Auth
2. Check RLS policies in database schema
3. Ensure role checking logic is implemented correctly in UI
4. Test with different user accounts to verify access levels

## Cloudflare Deployment Issues

### Deployment Fails
**Problem**: `npm run deploy` fails
**Solution**:
1. Verify Wrangler is logged in: `wrangler login`
2. Check that `wrangler.json` is properly configured
3. Ensure all required secrets are set in Cloudflare
4. Verify environment variables are correctly set
5. Check Cloudflare status for service issues

### Secrets Not Available in Production
**Problem**: Application fails in production due to missing secrets
**Solution**:
1. Verify all required secrets are set using `wrangler secret put`
2. Check secret names match environment variables
3. Ensure secrets are set in the correct Cloudflare project
4. Test with a simple endpoint that returns environment variable status

### Worker Errors in Production
**Problem**: Application works locally but fails in Cloudflare Workers
**Solution**:
1. Check Cloudflare logs with `wrangler tail`
2. Verify Node.js APIs used are available in Workers environment
3. Check if any dependencies need to be marked as external
4. Ensure server-side code is compatible with Workers runtime

## Performance Issues

### Slow Page Load Times
**Problem**: Pages load slowly in development or production
**Solution**:
1. Check network tab for slow resources
2. Verify image optimization is working
3. Check if external APIs are responding slowly
4. Review database queries for optimization opportunities
5. Check bundle size with build analysis tools

### High Memory Usage
**Problem**: Application consumes excessive memory
**Solution**:
1. Check for memory leaks in JavaScript code
2. Verify efficient data handling in components
3. Review database query optimization
4. Monitor Cloudflare Worker memory limits

## Database Issues

### RLS Policies Not Working
**Problem**: Row-Level Security policies don't restrict data access as expected
**Solution**:
1. Verify RLS policies are enabled on tables
2. Check policy definitions for correct logic
3. Test with different user roles
4. Use Supabase Studio to verify policy execution

### Migration Failures
**Problem**: Database migrations fail or don't apply correctly
**Solution**:
1. Check migration file syntax and structure
2. Verify migration order and dependencies
3. Test migrations against a clean database
4. Check for any custom functions or triggers causing issues

## Common Error Messages

### "Database is not configured"
**Problem**: Supabase client throws this error
**Solution**:
1. Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set
2. Check that the Supabase project is running (for local development)
3. Ensure variable names match what the client expects

### "Invalid signature" for webhooks
**Problem**: Payment webhook validation fails
**Solution**:
1. Verify the server key matches in both application and payment provider
2. Ensure the raw request body is used for signature verification
3. Check for any middleware that might modify the request body

### "Not authenticated" errors
**Problem**: Authenticated routes return unauthorized errors
**Solution**:
1. Check that authentication is properly configured
2. Verify session handling between client and server
3. Ensure authentication token is being sent with requests
4. Check that the token is still valid and not expired

## Debugging Tips

### Enable Detailed Logging
Add debugging information by logging key variables:

```typescript
console.log('[DEBUG] User role:', user?.role);
console.log('[DEBUG] Request URL:', req.url);
console.log('[DEBUG] Environment:', process.env.PAYMENT_ENV);
```

### Check Cloudflare Logs
Monitor real-time logs during development:

```bash
wrangler tail
```

### Use Supabase Studio
For database debugging:
1. Access Supabase Studio locally: `http://localhost:54323`
2. Check table contents and RLS policy logs
3. Test SQL queries directly

### Browser Developer Tools
Use browser tools to:
1. Check network requests and responses
2. Monitor console for JavaScript errors
3. Inspect authentication cookies and storage
4. Verify API endpoint calls

## Getting Help

### Review Documentation
- Check `README.md` for setup instructions
- Review `howto.md` for deployment guidance
- Look at relevant files in `docs/plan/` for architecture details

### Check Repository Resources
- Review `todo.md` for known issues and planned fixes
- Check GitHub Issues for similar problems
- Look at recent commits for changes that might affect functionality

### Support Channels
If issues persist after troubleshooting:
1. Create an issue in the repository
2. Include detailed error messages and steps to reproduce
3. Specify your environment (Node version, OS, etc.)
4. Provide relevant log output