/**
 * GET /api/trend/global
 *
 * Data trend GLOBAL dari seluruh puskesmas.
 * Tidak ada filter puskesmas — menampilkan agregasi nasional.
 * Bisa diakses oleh semua user yang sudah login (kader/bidan/puskesmas).
 *
 * @see docs/TECH-STACK.md §3.2 (extends dashboard concept)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase';
import type { API, TriageLevel } from '@/types/database';

const querySchema = z.object({
  periode: z.enum(['7d', '30d', 'all']).default('30d'),
});

const PERIODE_DAYS: Record<string, number | null> = {
  '7d': 7,
  '30d': 30,
  all: null,
};

export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-medisense-user-role');
    const userId = request.headers.get('x-medisense-user-id');

    if (!userRole || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = querySchema.safeParse({
      periode: searchParams.get('periode') ?? '30d',
    });

    if (!query.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters' },
        { status: 400 }
      );
    }

    const { periode } = query.data;
    const days = PERIODE_DAYS[periode];
    const supabase = createServiceClient();

    // ─── Build time filter ───
    let baseQuery = supabase
      .from('triage_sessions')
      .select('*', { count: 'exact', head: false })
      .eq('sync_status', 'synced');

    if (days !== null) {
      const since = new Date();
      since.setDate(since.getDate() - days);
      baseQuery = baseQuery.gte('triage_completed_at', since.toISOString());
    }

    const { data: triages, error } = await baseQuery;

    if (error) {
      console.error('[trend/global] Query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch trend data' },
        { status: 500 }
      );
    }

    if (!triages || triages.length === 0) {
      return NextResponse.json({
        total_triages: 0,
        triage_by_level: { hijau: 0, kuning: 0, merah: 0 },
        conditions_breakdown: {},
        daily_trend: [],
        puskesmas_summary: [],
        active_kaders: 0,
        unique_patients: 0,
      } satisfies API.TrendGlobalResponse);
    }

    // ─── Aggregate ───
    const triageByLevel: Record<TriageLevel, number> = { hijau: 0, kuning: 0, merah: 0 };
    const conditionsBreakdown: Record<string, number> = {};
    const dailyMap: Record<string, { total: number; merah: number; kuning: number; hijau: number }> = {};
    const puskesmasMap: Record<string, { id: string; name: string; region: string; total: number }> = {};
    const activeKaders = new Set<string>();
    const uniquePatients = new Set<string>();

    // Collect all kader IDs to resolve puskesmas
    const kaderIdSet = new Set<string>();

    for (const t of triages) {
      const level = t.triage_level as TriageLevel;
      triageByLevel[level]++;

      const conds = t.conditions as unknown as API.DashboardSummaryResponse['conditions_breakdown'];
      if (Array.isArray(conds)) {
        for (const c of conds) {
          const name = (c as { condition: string }).condition;
          conditionsBreakdown[name] = (conditionsBreakdown[name] ?? 0) + 1;
        }
      }

      const day = t.triage_completed_at.slice(0, 10);
      if (!dailyMap[day]) {
        dailyMap[day] = { total: 0, merah: 0, kuning: 0, hijau: 0 };
      }
      dailyMap[day].total++;
      dailyMap[day][level]++;

      activeKaders.add(t.kader_id);
      uniquePatients.add(t.patient_hash);
      kaderIdSet.add(t.kader_id);
    }

    // ─── Resolve puskesmas from kader profiles ───
    if (kaderIdSet.size > 0) {
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, puskesmas_id')
        .in('id', Array.from(kaderIdSet));

      const puskesmasIdSet = new Set<string>();
      const kaderPuskesmas: Record<string, string> = {};
      for (const p of profiles ?? []) {
        if (p.puskesmas_id) {
          puskesmasIdSet.add(p.puskesmas_id);
          kaderPuskesmas[p.id] = p.puskesmas_id;
        }
      }

      // Count triages per puskesmas
      const pCount: Record<string, number> = {};
      for (const t of triages) {
        const pid = kaderPuskesmas[t.kader_id];
        if (pid) {
          pCount[pid] = (pCount[pid] ?? 0) + 1;
        }
      }

      // Get puskesmas names
      if (puskesmasIdSet.size > 0) {
        const { data: puskesmasData } = await supabase
          .from('puskesmas')
          .select('id, name, region')
          .in('id', Array.from(puskesmasIdSet));

        for (const p of puskesmasData ?? []) {
          puskesmasMap[p.id] = {
            id: p.id,
            name: p.name,
            region: p.region,
            total: pCount[p.id] ?? 0,
          };
        }
      }
    }

    const dailyTrend = Object.entries(dailyMap)
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const puskesmasSummary = Object.values(puskesmasMap)
      .sort((a, b) => b.total - a.total);

    return NextResponse.json({
      total_triages: triages.length,
      triage_by_level: triageByLevel,
      conditions_breakdown: conditionsBreakdown,
      daily_trend: dailyTrend,
      puskesmas_summary: puskesmasSummary,
      active_kaders: activeKaders.size,
      unique_patients: uniquePatients.size,
    } satisfies API.TrendGlobalResponse);
  } catch (error) {
    console.error('[trend/global] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
