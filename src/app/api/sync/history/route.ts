/**
 * GET /api/sync/history
 *
 * Ambil riwayat triase dari cloud untuk kader yang sedang login.
 * Data yang dikembalikan hanya metadata anonim (tanpa PII).
 * Berguna saat perangkat pertama kali sync setelah install ulang,
 * atau untuk membandingkan data lokal dengan cloud.
 *
 * @see docs/TECH-STACK.md §3.1
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Extract user info from headers (set by middleware)
    const userId = request.headers.get('x-medisense-user-id');
    const userRole = request.headers.get('x-medisense-user-role');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createServiceClient();
    const limit = Math.min(
      Number(request.nextUrl.searchParams.get('limit')) || 50,
      200
    );

    // Query triage sessions for this kader
    // Note: conditions is JSONB containing [{condition, confidence, triage_level}]
    const { data, error } = await supabase
      .from('triage_sessions')
      .select(
        'id, triage_level, conditions, voice_text, triage_started_at, triage_completed_at'
      )
      .eq('kader_id', userId)
      .order('triage_completed_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[sync/history] Query error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch history' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      history: data || [],
    });
  } catch (error) {
    console.error('[sync/history] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
