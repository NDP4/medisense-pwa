/**
 * GET /api/sync/pending
 *
 * Ambil daftar data yang perlu disinkronkan ke device.
 * Saat ini support: update model version, config changes, dan
 * rekomendasi dari Puskesmas.
 *
 * @see docs/TECH-STACK.md §3.1
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase';
import type { API } from '@/types/database';

const querySchema = z.object({
  device_id: z.string().uuid(),
  current_model_version: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.safeParse({
      device_id: searchParams.get('device_id'),
      current_model_version: searchParams.get('current_model_version'),
    });

    if (!query.success) {
      return NextResponse.json(
        {
          updates: [],
          model_version: '',
          error: 'Missing or invalid device_id',
        },
        { status: 400 }
      );
    }

    const { device_id, current_model_version } = query.data;
    const supabase = createServiceClient();
    const updates: unknown[] = [];

    // ─── Check for model updates ───
    let latestModelVersion = current_model_version ?? '';

    const { data: activeModel } = await supabase
      .from('model_versions')
      .select('version, url, sha256, size_bytes')
      .eq('is_active', true)
      .single();

    if (activeModel && activeModel.version !== current_model_version) {
      latestModelVersion = activeModel.version;
      updates.push({
        type: 'model_update',
        version: activeModel.version,
        url: activeModel.url,
        sha256: activeModel.sha256,
        size_bytes: activeModel.size_bytes,
      });
    }

    // ─── Check sync queue for device ───
    const { data: queued } = await supabase
      .from('sync_queue')
      .select('payload, created_at')
      .eq('device_id', device_id)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10);

    if (queued && queued.length > 0) {
      updates.push(...queued.map((q) => q.payload));

      // Mark as delivered
      await supabase
        .from('sync_queue')
        .update({ status: 'synced', delivered_at: new Date().toISOString() })
        .eq('device_id', device_id)
        .eq('status', 'pending');
    }

    return NextResponse.json({
      updates,
      model_version: latestModelVersion,
    } satisfies API.SyncPendingResponse);
  } catch (error) {
    console.error('[sync/pending] Error:', error);
    return NextResponse.json(
      {
        updates: [],
        model_version: '',
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
