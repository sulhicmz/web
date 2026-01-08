// ==========================================================================
// AstroPro Digital - Enhanced Authentication Middleware
// Middleware terpusat untuk autentikasi, error handling, dan logging
// ==========================================================================

import type { MiddlewareHandler } from 'astro';

interface AstroCookies {
  get(name: string): { value: string } | undefined;
  delete(name: string, options?: { path?: string }): void;
}

interface MiddlewareContext {
  locals: AuthenticatedLocals;
  request: Request;
  cookies: AstroCookies;
  redirect: (path: string) => Response;
}

// Types for middleware context
interface AuthenticatedLocals {
  user?: Record<string, unknown> | null;
  role?: string | null;
  isAuthenticated?: boolean;
  permissions?: string[];
}

// Route protection configuration
const ROUTE_PROTECTION = {
  '/portal': {
    requiresAuth: true,
    allowedRoles: ['admin', 'client', 'team_member'],
    redirectTo: '/login'
  },
  '/portal/admin': {
    requiresAuth: true,
    allowedRoles: ['admin'],
    redirectTo: '/portal'
  },
  '/api': {
    requiresAuth: false, // API routes handle auth individually
    allowedRoles: []
  }
} as const;

// Public routes that don't need authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/about',
  '/layanan',
  '/portofolio',
  '/testimoni',
  '/blog',
  '/kontak',
  '/faq'
] as const;

// Authentication middleware
export const authGuard: MiddlewareHandler = async (context, next) => {
  const { locals, request, cookies, redirect } = context as MiddlewareContext;
  const url = new URL(request.url);
  const pathname = url.pathname;

  try {
    // Skip authentication for static assets and public routes
    if (isPublicRoute(pathname) || isStaticAsset(pathname)) {
      return next();
    }

    // Check if route requires authentication
    const routeConfig = getRouteConfig(pathname);

    if (routeConfig?.requiresAuth) {
       const authResult = await authenticateUser(cookies);

       if (!authResult.success) {
         return redirect(routeConfig.redirectTo);
       }

       // Check role-based access
       if (routeConfig.allowedRoles.length > 0 && authResult.role) {
         const hasAccess = routeConfig.allowedRoles.includes(authResult.role);
         if (!hasAccess) {
           return redirect('/unauthorized');
         }
       }

       // Set authenticated locals
       locals.user = authResult.user;
       locals.role = authResult.role;
       locals.isAuthenticated = true;
       locals.permissions = authResult.permissions;
     }

    // Log successful request
    logRequest(request, locals);

    return next();

  } catch (error) {
    console.error('Middleware error:', error);
    return handleMiddlewareError(error, redirect);
  }
};

// Helper functions
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));
}

function isStaticAsset(pathname: string): boolean {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'];
  return staticExtensions.some(ext => pathname.endsWith(ext));
}

function getRouteConfig(pathname: string) {
  // Check for exact match first
  if (ROUTE_PROTECTION[pathname as keyof typeof ROUTE_PROTECTION]) {
    return ROUTE_PROTECTION[pathname as keyof typeof ROUTE_PROTECTION];
  }

  // Check for pattern match
  for (const [route, config] of Object.entries(ROUTE_PROTECTION)) {
    if (pathname.startsWith(route)) {
      return config;
    }
  }

  return null;
}

async function authenticateUser(cookies: AstroCookies) {
    const accessToken = cookies.get('sb-access-token');

    if (!accessToken) {
      return { success: false, user: null, role: null, permissions: [] };
    }

    try {
      // For now, we'll implement a simpler authentication check
      // TODO: Implement proper server-side user retrieval
      if (!accessToken || accessToken.value === '') {
        return { success: false, user: null, role: null, permissions: [] };
      }

      // Clean up invalid tokens
      cookies.delete('sb-access-token', { path: '/' });
      cookies.delete('sb-refresh-token', { path: '/' });
      return { success: false, user: null, role: null, permissions: [] };

    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, user: null, role: null, permissions: [] };
    }
  }

function logRequest(request: Request, locals: AuthenticatedLocals): void {
  const timestamp = new Date().toISOString();
  const method = request.method;
  const url = new URL(request.url);
  const pathname = url.pathname;

  console.log(`[${timestamp}] ${method} ${pathname}`, {
    authenticated: locals.isAuthenticated,
    userId: locals.user?.id,
    role: locals.role,
    userAgent: request.headers.get('user-agent')
  });
}

function handleMiddlewareError(_error: unknown, _redirect: (path: string) => Response): Response {
  console.error('Middleware error:', _error);

  // In production, you might want to redirect to a generic error page
  // For now, we'll continue with the request but log the error
  return new Response('Internal Server Error', {
    status: 500,
    headers: { 'Content-Type': 'text/plain' }
  });
}

// Error handling middleware
export const errorHandler: MiddlewareHandler = async ({ request }, next) => {
  try {
    return await next();
  } catch (error) {
    console.error('Unhandled error in route:', request.url, error);

    // You could implement custom error pages here
    return new Response('Internal Server Error', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};

// Security headers middleware
export const securityHeaders: MiddlewareHandler = async ({ request }, next) => {
  const response = await next();

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Only add HSTS in production over HTTPS
  if (request.url.startsWith('https://') && import.meta.env.MODE === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  return response;
};

// Request logging middleware
export const requestLogger: MiddlewareHandler = async ({ request }, next) => {
  const startTime = Date.now();
  const response = await next();
  const duration = Date.now() - startTime;

  // Log slow requests
  if (duration > 1000) {
    console.warn(`Slow request detected: ${request.method} ${request.url} took ${duration}ms`);
  }

  return response;
};

// Rate limiting (basic implementation)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimiter: MiddlewareHandler = async ({ request }, next) => {
  const clientIP = request.headers.get('x-forwarded-for') ||
                   request.headers.get('x-real-ip') ||
                   'unknown';

  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100;

  const clientData = requestCounts.get(clientIP);

  if (!clientData || now > clientData.resetTime) {
    // Reset or initialize counter
    requestCounts.set(clientIP, { count: 1, resetTime: now + windowMs });
  } else {
    clientData.count++;

    if (clientData.count > maxRequests) {
      return new Response('Too Many Requests', {
        status: 429,
        headers: {
          'Content-Type': 'text/plain',
          'Retry-After': Math.ceil((clientData.resetTime - now) / 1000).toString()
        }
      });
    }
  }

  return next();
};