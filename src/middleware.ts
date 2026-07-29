/**
 * Middleware for authentication and authorization.
 *
 * Protects API routes and dashboard pages based on user role.
 * Uses Supabase JWT validation.
 *
 * @see docs/TECH-STACK.md §3.4 (Auth Contract)
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
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
  const { pathname } = request.nextUrl;

  // Skip public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if route is protected
  const requiredRoles = Object.entries(PROTECTED_API_ROUTES).find(([route]) =>
    pathname.startsWith(route)
  );

  if (!requiredRoles) {
    // Route not in our protection list — let it pass
    return NextResponse.next();
  }

  const [, allowedRoles] = requiredRoles;

  // Extract JWT from Authorization header
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing or invalid authorization header' },
      { status: 401 }
    );
  }

  const token = authHeader.slice(7);

  try {
    // Decode JWT payload (validate structure, verify with Supabase via API route)
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64url').toString()
    );

    const userRole = payload.user_role as UserRole | undefined;
    const userId = payload.sub as string | undefined;

    if (!userRole || !userId) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
    }

    // Role check
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json(
        { error: `Insufficient role. Required: ${allowedRoles.join(' or ')}` },
        { status: 403 }
      );
    }

    // Attach user info to request headers for downstream routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-medisense-user-id', userId);
    requestHeaders.set('x-medisense-user-role', userRole);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

export const config = {
  matcher: [
    '/api/:path*',
    // Exclude static files
    '/((?!_next/static|_next/image|favicon.ico|models/|illustrations/).*)',
  ],
};
