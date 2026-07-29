/**
 * Supabase client singleton for server-side (API Routes) and client-side.
 *
 * Architecture:
 * - Server (SSR): Uses createServerClient with cookie-based auth for user-scoped access
 * - Server (Admin): Uses service_role key for admin operations (DML from trusted API routes)
 * - Client: Uses anon key with RLS (row-level security) for user-scoped queries
 *
 * @see docs/TECH-STACK.md §2.6
 */

import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/** Client-side Supabase client (RLS-enforced, anon key) — for browser components */
export function createClientClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Server-side Supabase client with cookie-based auth — for Server Components / Route Handlers.
 * Automatically reads and refreshes auth tokens from request cookies.
 */
export async function createServerComponentClient() {
  const cookieStore = await cookies();
  
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        );
      },
    },
  });
}

/**
 * Middleware-compatible Supabase client — for next/middleware.ts
 * Accepts the request object to read/set cookies at the Edge runtime level.
 */
export function createMiddlewareClient(request: NextRequest, response: NextResponse) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });
}

/** Server-side Supabase client with service role (admin bypass of RLS) — for API route handlers only */
export function createServiceClient() {
  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
