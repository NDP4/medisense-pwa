/**
 * GET /api/dashboard/kaders
 *
 * Daftar kader dan ringkasan performa mereka.
 * Role: puskesmas (full akses), bidan (wilayah sendiri)
 *
 * @see docs/TECH-STACK.md §3.2
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase';
import type { API } from '@/types/database';

const querySchema = z.object({
  puskesmas_id: z.string().uuid().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.safeParse({
      puskesmas_id: searchParams.get('puskesmas_id'),
    });

    if (!query.success) {
      return NextResponse.json(
        { kaders: [], error: 'Invalid puskesmas_id' },
        { status: 400 }
      );
    }

    const { puskesmas_id } = query.data;
    const supabase = createServiceClient();

    // ─── Get kaders ───
    let kaderQuery = supabase
      .from('user_profiles')
      .select('id, full_name, region, is_active')
      .eq('role', 'kader');

    if (puskesmas_id) {
      kaderQuery = kaderQuery.eq('puskesmas_id', puskesmas_id);
    }

    const { data: kaders, error: kaderError } = await kaderQuery;

    if (kaderError || !kaders) {
      console.error('[dashboard/kaders] Error fetching kaders:', kaderError);
      return NextResponse.json({ kaders: [] }, { status: 200 });
    }

    // ─── Get triage counts per kader ───
    const kaderIds = kaders.map((k) => k.id);

    const { data: triageCounts } = await supabase
      .from('triage_sessions')
      .select('kader_id, triage_completed_at')
      .in('kader_id', kaderIds)
      .eq('sync_status', 'synced');

    // Aggregate per kader
    const kaderMap = new Map<
      string,
      { total: number; lastActive: string | null }
    >();

    for (const k of kaders) {
      kaderMap.set(k.id, { total: 0, lastActive: null });
    }

    if (triageCounts) {
      for (const t of triageCounts) {
        const entry = kaderMap.get(t.kader_id);
        if (entry) {
          entry.total++;
          if (!entry.lastActive || t.triage_completed_at > entry.lastActive) {
            entry.lastActive = t.triage_completed_at;
          }
        }
      }
    }

    // ─── Get village assignments ───
    const { data: assignments } = await supabase
      .from('kader_villages')
      .select('kader_id, village:villages(name)')
      .in('kader_id', kaderIds)
      .eq('is_primary', true);

    const villageMap = new Map<string, string>();
    if (assignments) {
      for (const a of assignments) {
        const v = a.village as unknown as { name: string } | null;
        if (v?.name) {
          villageMap.set(a.kader_id, v.name);
        }
      }
    }

    // ─── Build response ───
    const result: API.KaderSummary[] = kaders.map((k) => {
      const stats = kaderMap.get(k.id);
      return {
        id: k.id,
        full_name: k.full_name,
        total_triages: stats?.total ?? 0,
        last_active: stats?.lastActive ?? null,
        village_name: villageMap.get(k.id) ?? k.region ?? 'Tidak ditugaskan',
      };
    });

    // Sort by most active first
    result.sort((a, b) => b.total_triages - a.total_triages);

    return NextResponse.json({ kaders: result } satisfies API.KadersResponse);
  } catch (error) {
    console.error('[dashboard/kaders] Error:', error);
    return NextResponse.json(
      { kaders: [], error: 'Internal server error' },
      { status: 500 }
    );
  }
}
