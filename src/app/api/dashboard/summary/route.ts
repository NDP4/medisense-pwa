/**
 * GET /api/dashboard/summary
 *
 * Ringkasan dashboard untuk Puskesmas.
 * Menyediakan agregasi tren penyakit, distribusi triase,
 * dan early warning signal.
 *
 * Role: bidan (lihat wilayah sendiri), puskesmas (full)
 *
 * @see docs/TECH-STACK.md §3.2
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase';
import type { API, TriageLevel } from '@/types/database';

const querySchema = z.object({
  puskesmas_id: z.string().uuid().optional(),
  periode: z.enum(['7d', '30d', '90d']).default('30d'),
});

const PERIODE_DAYS: Record<string, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.safeParse({
      puskesmas_id: searchParams.get('puskesmas_id'),
      periode: searchParams.get('periode') ?? '30d',
    });

    if (!query.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters' },
        { status: 400 }
      );
    }

    const { puskesmas_id, periode } = query.data;
    const days = PERIODE_DAYS[periode];
    const supabase = createServiceClient();

    // Build base query with optional puskesmas filter
    let baseQuery = supabase.from('triage_sessions').select('*', { count: 'exact', head: false });
    let kaderFilterQuery = supabase.from('user_profiles').select('id');

    if (puskesmas_id) {
      kaderFilterQuery = kaderFilterQuery.eq('puskesmas_id', puskesmas_id);
    }

    const { data: kaderIds } = await kaderFilterQuery;
    const kaderIdSet = new Set(kaderIds?.map((k) => k.id) ?? []);

    if (kaderIdSet.size === 0) {
      // No kaders found for this puskesmas
      return NextResponse.json({
        total_triages: 0,
        triage_by_level: { hijau: 0, kuning: 0, merah: 0 },
        conditions_breakdown: {},
        daily_trend: [],
        active_kaders: 0,
        unique_patients: 0,
        early_warnings: [],
      } satisfies API.DashboardSummaryResponse);
    }

    // ─── Get all triages in period ───
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceISO = since.toISOString();

    const { data: triages } = await supabase
      .from('triage_sessions')
      .select('*')
      .in('kader_id', Array.from(kaderIdSet))
      .gte('triage_completed_at', sinceISO)
      .eq('sync_status', 'synced');

    if (!triages || triages.length === 0) {
      return NextResponse.json({
        total_triages: 0,
        triage_by_level: { hijau: 0, kuning: 0, merah: 0 },
        conditions_breakdown: {},
        daily_trend: [],
        active_kaders: 0,
        unique_patients: 0,
        early_warnings: [],
      } satisfies API.DashboardSummaryResponse);
    }

    // ─── Aggregate ───
    const triageByLevel: Record<TriageLevel, number> = { hijau: 0, kuning: 0, merah: 0 };
    const conditionsBreakdown: Record<string, number> = {};
    const dailyMap: Record<string, { total: number; merah: number; kuning: number; hijau: number }> = {};
    const activeKaders = new Set<string>();
    const uniquePatients = new Set<string>();

    for (const t of triages) {
      // By level
      const level = t.triage_level as TriageLevel;
      triageByLevel[level]++;

      // By condition
      const conds = t.conditions as unknown as API.DashboardSummaryResponse['conditions_breakdown'];
      if (Array.isArray(conds)) {
        for (const c of conds) {
          const name = (c as { condition: string }).condition;
          conditionsBreakdown[name] = (conditionsBreakdown[name] ?? 0) + 1;
        }
      }

      // Daily trend
      const day = t.triage_completed_at.slice(0, 10);
      if (!dailyMap[day]) {
        dailyMap[day] = { total: 0, merah: 0, kuning: 0, hijau: 0 };
      }
      dailyMap[day].total++;
      dailyMap[day][t.triage_level as TriageLevel]++;

      // Kader & patients
      activeKaders.add(t.kader_id);
      uniquePatients.add(t.patient_hash);
    }

    const dailyTrend = Object.entries(dailyMap)
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // ─── Early warnings ───
    let earlyWarnings: API.EarlyWarning[] = [];

    if (puskesmas_id) {
      const { data: warnings } = await supabase.rpc('get_early_warnings', {
        target_puskesmas_id: puskesmas_id,
      });
      if (warnings) {
        earlyWarnings = warnings as unknown as API.EarlyWarning[];
      }
    }

    return NextResponse.json({
      total_triages: triages.length,
      triage_by_level: triageByLevel,
      conditions_breakdown: conditionsBreakdown,
      daily_trend: dailyTrend,
      active_kaders: activeKaders.size,
      unique_patients: uniquePatients.size,
      early_warnings: earlyWarnings,
    } satisfies API.DashboardSummaryResponse);
  } catch (error) {
    console.error('[dashboard/summary] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
