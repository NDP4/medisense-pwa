/**
 * POST /api/sync/triage
 *
 * Sinkronisasi sesi triase dari PWA client ke cloud.
 * Menerima data triase yang sudah diproses di client (prediksi AI sudah
 * dilakukan on-device). Server hanya menyimpan dan mengagregasi.
 *
 * @see docs/TECH-STACK.md §3.1
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase';
import type { API, TriageLevel } from '@/types/database';

// ─── Validation Schema ───

const triageConditionSchema = z.object({
  condition: z.string().min(1).max(50),
  confidence: z.number().min(0).max(1),
  triage_level: z.enum(['hijau', 'kuning', 'merah']),
});

const syncTriageSchema = z.object({
  triage_id: z.string().uuid(),
  device_id: z.string().uuid(),
  kader_id: z.string().uuid(),
  village_id: z.string().uuid().optional(),
  patient_hash: z.string().min(1).max(128),
  patient_age: z.number().int().min(0).max(150).optional(),
  patient_gender: z.number().int().min(0).max(1).optional(),
  triage_level: z.enum(['hijau', 'kuning', 'merah']),
  conditions: z.array(triageConditionSchema).min(1).max(20),
  triage_started_at: z.string().datetime(),
  triage_completed_at: z.string().datetime(),
  model_version: z.string().optional(),
  app_version: z.string().optional(),
  audit_trail: z.array(z.record(z.unknown())).optional(),
  voice_text: z.string().max(5000).optional(),
});

// ─── Handler ───

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    // Parse and validate request body
    const body: unknown = await request.json();
    const parsed = syncTriageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          sync_timestamp: new Date().toISOString(),
          error: `Validation failed: ${parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`,
        } satisfies API.SyncTriageResponse,
        { status: 400 }
      );
    }

    const data = parsed.data;
    const supabase = createServiceClient();

    // ─── Validate device exists (or register new) ───
    const { data: existingDevice } = await supabase
      .from('devices')
      .select('id')
      .eq('id', data.device_id)
      .single();

    if (!existingDevice) {
      // Register device on first sync
      await supabase.from('devices').insert({
        id: data.device_id,
        kader_id: data.kader_id,
        device_name: request.headers.get('user-agent')?.slice(0, 200) ?? null,
        last_sync_at: new Date().toISOString(),
      });
    } else {
      // Update last sync timestamp
      await supabase
        .from('devices')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('id', data.device_id);
    }

    // ─── Upsert triage session ───
    // Using upsert so re-syncs don't create duplicates
    const { error: upsertError } = await supabase.from('triage_sessions').upsert(
      {
        id: data.triage_id,
        device_id: data.device_id,
        kader_id: data.kader_id,
        village_id: data.village_id ?? null,
        patient_hash: data.patient_hash,
        patient_age: data.patient_age ?? null,
        patient_gender: data.patient_gender ?? null,
        triage_level: data.triage_level,
        conditions: data.conditions as unknown as Record<string, unknown>[],
        triage_started_at: data.triage_started_at,
        triage_completed_at: data.triage_completed_at,
        model_version: data.model_version ?? null,
        app_version: data.app_version ?? null,
        audit_trail: data.audit_trail ? (data.audit_trail as unknown as Record<string, unknown>) : null,
        voice_text: data.voice_text ?? null,
        sync_status: 'synced',
      },
      { onConflict: 'id', ignoreDuplicates: false }
    );

    if (upsertError) {
      console.error(`[sync/triage] Upsert error (req=${requestId}):`, upsertError);
      return NextResponse.json(
        {
          success: false,
          sync_timestamp: new Date().toISOString(),
          error: 'Failed to save triage session',
        } satisfies API.SyncTriageResponse,
        { status: 500 }
      );
    }

    // ─── Success response ───
    return NextResponse.json(
      {
        success: true,
        sync_timestamp: new Date().toISOString(),
      } satisfies API.SyncTriageResponse,
      { status: 201 }
    );
  } catch (error) {
    console.error(`[sync/triage] Unexpected error (req=${requestId}):`, error);

    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          sync_timestamp: new Date().toISOString(),
          error: 'Invalid JSON in request body',
        } satisfies API.SyncTriageResponse,
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        sync_timestamp: new Date().toISOString(),
        error: 'Internal server error',
      } satisfies API.SyncTriageResponse,
      { status: 500 }
    );
  }
}
