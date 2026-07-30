/**
 * GET /api/puskesmas/list
 *
 * Mengembalikan daftar puskesmas yang tersedia untuk dipilih saat registrasi.
 * Public endpoint — tidak perlu autentikasi.
 *
 * @see docs/TECH-STACK.md §3.3 (public routes)
 */

import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import type { Puskesmas } from '@/types/database';

export async function GET() {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('puskesmas')
      .select('id, name, address, region')
      .order('name', { ascending: true });

    if (error) {
      console.error('[puskesmas/list] Database error:', error.message);
      return NextResponse.json(
        { error: 'Gagal memuat daftar puskesmas' },
        { status: 500 }
      );
    }

    const puskesmasList = (data ?? []) as Pick<Puskesmas, 'id' | 'name' | 'address' | 'region'>[];

    return NextResponse.json({ puskesmas: puskesmasList });
  } catch (e) {
    console.error('[puskesmas/list] Error:', (e as Error).message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
