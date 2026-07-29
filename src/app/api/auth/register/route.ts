/**
 * POST /api/auth/register
 *
 * Registrasi user baru (kader, bidan, puskesmas).
 * Membuat user di Supabase Auth + profile di user_profiles.
 *
 * @see docs/TECH-STACK.md §3.4
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase';
import type { API, UserProfile } from '@/types/database';

const registerSchema = z.object({
  full_name: z.string().min(3).max(100),
  phone: z.string().regex(/^(\+62|62|0)8[1-9][0-9]{6,11}$/, 'Format nomor HP Indonesia tidak valid'),
  password: z.string().min(8).max(100),
  role: z.enum(['kader', 'bidan', 'puskesmas']),
  puskesmas_id: z.string().uuid(),
  region: z.string().max(100).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: `Validation failed: ${parsed.error.issues.map((i) => i.message).join('; ')}` },
        { status: 400 }
      );
    }

    const { full_name, phone, password, role, puskesmas_id, region } = parsed.data;
    const supabase = createServiceClient();

    // ─── Check if phone already registered ───
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('phone', phone)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'Nomor HP sudah terdaftar' },
        { status: 409 }
      );
    }

    // ─── Verify puskesmas exists ───
    const { data: puskesmas } = await supabase
      .from('puskesmas')
      .select('id')
      .eq('id', puskesmas_id)
      .single();

    if (!puskesmas) {
      return NextResponse.json(
        { error: 'Puskesmas tidak ditemukan' },
        { status: 404 }
      );
    }

    // ─── Create user in Supabase Auth ───
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: `${phone.replace(/\D/g, '')}@medisense.local`, // phone-based login
      phone,
      password,
      user_metadata: {
        full_name,
        role,
        puskesmas_id,
      },
    });

    if (authError || !authUser.user) {
      console.error('[auth/register] Auth error:', authError);
      return NextResponse.json(
        { error: authError?.message ?? 'Gagal membuat akun' },
        { status: 500 }
      );
    }

    // ─── Create user profile ───
    const { error: profileError } = await supabase.from('user_profiles').insert({
      id: authUser.user.id,
      full_name,
      phone,
      role,
      puskesmas_id,
      region: region ?? null,
    } as never);

    if (profileError) {
      console.error('[auth/register] Profile error:', profileError);
      // Rollback auth user
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return NextResponse.json(
        { error: 'Gagal membuat profil user' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        user: {
          id: authUser.user.id,
          full_name,
          role,
          puskesmas_id,
        },
        token: '',
      } satisfies API.AuthResponse,
      { status: 201 }
    );
  } catch (error) {
    console.error('[auth/register] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
