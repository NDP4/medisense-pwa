/**
 * POST /api/auth/login
 *
 * Login user (kader, bidan, puskesmas) via phone + password.
 * Mengembalikan JWT token untuk akses API terproteksi.
 *
 * @see docs/TECH-STACK.md §3.4
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClientClient } from '@/lib/supabase';
import type { API } from '@/types/database';

const loginSchema = z.object({
  phone: z.string().min(8).max(20),
  password: z.string().min(1).max(100),
});

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Nomor HP atau password tidak valid' },
        { status: 400 }
      );
    }

    const { phone, password } = parsed.data;
    const supabase = createClientClient();

    // ─── Login via email (phone login disabled di Supabase) ───
    // Normalize phone: same format as register (+6281xxx → 6281xxx)
    const digits = phone.replace(/\D/g, '');
    const normalizedPhone = digits.startsWith('0') ? '62' + digits.slice(1) : digits.startsWith('62') ? digits : '62' + digits;
    const email = `${normalizedPhone}@medisense.local`;
    const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError || !authData.user) {
      console.error('[auth/login] Login error:', loginError?.message);

      if (loginError?.message?.includes('Invalid login credentials')) {
        return NextResponse.json(
          { error: 'Nomor HP atau password salah' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: 'Login gagal. Silakan coba lagi.' },
        { status: 500 }
      );
    }

    // ─── Get user profile (pakai service client — bypass RLS karena user_profiles belum punya SELECT policy) ───
    const { createServiceClient } = await import('@/lib/supabase');
    const adminSupabase = createServiceClient();
    const { data: profile } = await adminSupabase
      .from('user_profiles')
      .select('full_name, role, puskesmas_id, phone')
      .eq('id', authData.user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'Profil user tidak ditemukan' },
        { status: 404 }
      );
    }

    const userProfile = profile as unknown as { full_name: string; role: string; puskesmas_id: string | null; phone: string | null };

    // Fetch puskesmas name separately for display
    let puskesmasName: string | undefined;
    if (userProfile.puskesmas_id) {
      const { data: puskesmas } = await adminSupabase
        .from('puskesmas')
        .select('name')
        .eq('id', userProfile.puskesmas_id)
        .single();
      puskesmasName = puskesmas?.name ?? undefined;
    }

    return NextResponse.json({
      user: {
        id: authData.user.id,
        full_name: userProfile.full_name,
        role: userProfile.role as API.AuthResponse['user']['role'],
        puskesmas_id: userProfile.puskesmas_id,
        puskesmas_name: puskesmasName,
        phone: userProfile.phone ?? '',
      },
      token: authData.session?.access_token ?? '',
    } satisfies API.AuthResponse);
  } catch (error) {
    console.error('[auth/login] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
