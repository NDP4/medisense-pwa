import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import type { UserRole } from '@/types/database';

const JWKS = createRemoteJWKSet(
  new URL('https://jtkajnfafbzbvtyraydx.supabase.co/auth/v1/.well-known/jwks.json')
);

const PROTECTED_API_ROUTES: Record<string, UserRole[]> = {
  '/api/sync/triage': ['kader', 'bidan', 'puskesmas'],
  '/api/sync/pending': ['kader', 'bidan', 'puskesmas'],
  '/api/sync/history': ['kader', 'bidan', 'puskesmas'],
  '/api/dashboard/summary': ['bidan', 'puskesmas'],
  '/api/dashboard/kaders': ['puskesmas'],
};

const PUBLIC_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/models/latest',
  '/api/health',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const requiredRoles = Object.entries(PROTECTED_API_ROUTES).find(([route]) =>
    pathname.startsWith(route)
  );

  if (!requiredRoles) {
    return NextResponse.next();
  }

  const [, allowedRoles] = requiredRoles;

  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing or invalid authorization header' },
      { status: 401 }
    );
  }

  const token = authHeader.slice(7);

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: 'https://jtkajnfafbzbvtyraydx.supabase.co/auth/v1',
    });

    // Debug: log ALL payload keys & values (visible in terminal where `next dev` runs)
    console.log('[middleware] JWT payload keys:', Object.keys(payload));
    console.log('[middleware] sub:', payload.sub);
    console.log('[middleware] user_metadata:', JSON.stringify((payload as Record<string, unknown>)['user_metadata']));
    console.log('[middleware] app_metadata:', JSON.stringify((payload as Record<string, unknown>)['app_metadata']));

    // Use bracket notation for safety
    const rawPayload = payload as Record<string, unknown>;
    const userMetadata = rawPayload['user_metadata'] as Record<string, unknown> | undefined;
    const userRole = (userMetadata?.['role'] || (rawPayload['app_metadata'] as Record<string, unknown> | undefined)?.['role']) as UserRole | undefined;
    const userId = rawPayload['sub'] as string | undefined;

    console.log('[middleware] resolved userRole:', userRole, 'userId:', userId);

    if (!userRole || !userId) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
    }

    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json(
        { error: `Insufficient role. Required: ${allowedRoles.join(' or ')}` },
        { status: 403 }
      );
    }

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
    '/((?!_next/static|_next/image|favicon.ico|models/|illustrations/).*)',
  ],
};
