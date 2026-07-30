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
import { createServiceClient, createClientClient } from '@/lib/supabase';
import type { API } from '@/types/database';

// Rate limiting: 5 registrations per IP per hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('62')) {
    return '+' + digits;
  }
  return '+62' + digits.replace(/^0+/, '');
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 3600000 });
    return true;
  }

  if (entry.count >= 5) {
    return false;
  }

  entry.count++;
  return true;
}

const registerSchema = z.object({
  full_name: z.string().min(3).max(100),
  phone: z.string().regex(/^(\+62|62|0)8[1-9][0-9]{6,11}$/, 'Format nomor HP Indonesia tidak valid: gunakan 08xx, 628xx, atau +628xx'),
  password: z.string().min(8).max(100),
  role: z.enum(['kader', 'bidan', 'puskesmas']),
  puskesmas_id: z.string().uuid().optional(),
  region: z.string().max(100).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limit check
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan. Coba lagi dalam 1 jam.' },
        { status: 429 }
      );
    }

    const body: unknown = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => i.message).join('; ') },
        { status: 400 }
      );
    }

    const { full_name, password, role, region } = parsed.data;
    const phone = toE164(parsed.data.phone);
    const supabase = createServiceClient();

    // ─── Auto-assign puskesmas if not provided ───
    let puskesmas_id = parsed.data.puskesmas_id;
    if (!puskesmas_id) {
      const { data: defaultPuskesmas } = await supabase
        .from('puskesmas')
        .select('id')
        .limit(1)
        .single();

      if (!defaultPuskesmas) {
        return NextResponse.json(
          { error: 'Tidak ada puskesmas terdaftar. Hubungi administrator.' },
          { status: 400 }
        );
      }
      puskesmas_id = defaultPuskesmas.id;
    }

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
      email_confirm: true, // auto-confirm (email @medisense.local palsu, gak bisa kirim confirmation)
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

    // ─── Sign in to get session token ───
    const clientSupabase = createClientClient();
    const signInEmail = `${phone.replace(/\D/g, '')}@medisense.local`;
    const { data: signInData } = await clientSupabase.auth.signInWithPassword({
      email: signInEmail,
      password,
    });

    const token = signInData?.session?.access_token ?? '';

    // Fetch puskesmas name for display
    let puskesmasName: string | undefined;
    if (puskesmas_id) {
      const { data: puskesmasData } = await supabase
        .from('puskesmas')
        .select('name')
        .eq('id', puskesmas_id)
        .single();
      puskesmasName = puskesmasData?.name ?? undefined;
    }

    return NextResponse.json(
      {
        user: {
          id: authUser.user.id,
          full_name,
          role,
          puskesmas_id: puskesmas_id ?? null,
          puskesmas_name: puskesmasName,
          phone,
        },
        token,
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
