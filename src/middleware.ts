/**
 * Middleware for authentication and authorization.
 *
 * Protects API routes and dashboard pages based on user role.
 * Uses Supabase SSR cookie-based session management for auth,
 * with custom RBAC via the `user_role` JWT claim.
 *
 * @see docs/TECH-STACK.md §3.4 (Auth Contract)
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase';
import type { UserRole } from '@/types/database';

// Routes that require authentication + optional role
const PROTECTED_API_ROUTES: Record<string, UserRole[]> = {
  '/api/sync/triage': ['kader', 'bidan', 'puskesmas'],
  '/api/sync/pending': ['kader', 'bidan', 'puskesmas'],
  '/api/dashboard/summary': ['bidan', 'puskesmas'],
  '/api/dashboard/kaders': ['puskesmas'],
};

// Public routes (no auth required)
const PUBLIC_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/models/latest',
  '/api/health',
];

export async function middleware(request: NextRequest) {
  // Create response early — Supabase SSR needs it for cookie management
  const supabaseResponse = NextResponse.next({ request });
  const supabase = createMiddlewareClient(request, supabaseResponse);

  const { pathname } = request.nextUrl;

  // Refresh session — automatically reads/writes auth cookies
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Skip public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return supabaseResponse;
  }

  // Check if route is protected
  const requiredRoles = Object.entries(PROTECTED_API_ROUTES).find(([route]) =>
    pathname.startsWith(route)
  );

  if (!requiredRoles) {
    // Route not in our protection list — let it pass
    return supabaseResponse;
  }

  const [, allowedRoles] = requiredRoles;

  // Authenticated check
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required. Login via POST /api/auth/login.' },
      { status: 401 }
    );
  }

  // Extract role from user metadata (set during registration)
  const userRole = user.user_metadata?.role as UserRole | undefined;

  if (!userRole) {
    return NextResponse.json(
      { error: 'User profile missing role assignment' },
      { status: 403 }
    );
  }

  // Role-based access control
  if (!allowedRoles.includes(userRole)) {
    return NextResponse.json(
      { error: `Insufficient role. Required: ${allowedRoles.join(' or ')}` },
      { status: 403 }
    );
  }

  // Attach user info to request headers for downstream route handlers
  const requestHeaders = new Headers(supabaseResponse.headers);
  requestHeaders.set('x-medisense-user-id', user.id);
  requestHeaders.set('x-medisense-user-role', userRole);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    '/api/:path*',
    // Exclude static files
    '/((?!_next/static|_next/image|favicon.ico|models/|illustrations/).*)',
  ],
};
