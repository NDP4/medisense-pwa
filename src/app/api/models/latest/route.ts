/**
 * GET /api/models/latest
 *
 * Cek versi model AI terbaru yang tersedia.
 * Public endpoint (no auth required), but response is signed.
 *
 * @see docs/TECH-STACK.md §3.3
 */

import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createServiceClient();

    const { data: model, error } = await supabase
      .from('model_versions')
      .select('version, url, sha256, size_bytes')
      .eq('is_active', true)
      .single();

    if (error || !model) {
      // No active model — return default
      return NextResponse.json({
        version: '0.0.0',
        size_bytes: 0,
        url: '',
        sha256: '',
      });
    }

    return NextResponse.json({
      version: model.version,
      size_bytes: model.size_bytes,
      url: model.url,
      sha256: model.sha256,
    });
  } catch (error) {
    console.error('[models/latest] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
