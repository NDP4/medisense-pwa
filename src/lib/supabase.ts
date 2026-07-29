/**
 * Supabase client singleton for server-side (API Routes) and client-side.
 *
 * Architecture:
 * - Server: Uses service_role key for admin operations (DML from trusted API routes)
 * - Client: Uses anon key with RLS (row-level security) for user-scoped queries
 *
 * @see docs/TECH-STACK.md §2.6
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/** Client-side Supabase client (RLS-enforced, anon key) */
export function createClientClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

/** Server-side Supabase client with service role (admin bypass of RLS) */
export function createServiceClient() {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
