/**
 * GET /api/health
 *
 * Health check endpoint. Returns server status and database connectivity.
 */

import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function GET() {
  const status = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '0.1.0',
    database: 'unknown',
  };

  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from('triage_sessions').select('id', { count: 'exact', head: true });

    if (error) {
      status.database = `error: ${error.message}`;
      return NextResponse.json({ ...status, status: 'degraded' }, { status: 503 });
    }

    status.database = 'connected';
    return NextResponse.json(status);
  } catch (e) {
    status.database = `error: ${(e as Error).message}`;
    return NextResponse.json({ ...status, status: 'degraded' }, { status: 503 });
  }
}
