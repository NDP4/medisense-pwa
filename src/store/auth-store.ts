'use client';

import { create } from 'zustand';

/* ── Auth Zustand Store ─────────────────────────────── */

interface User {
  id: string;
  fullName: string;
  role: 'kader' | 'bidan' | 'puskesmas';
  puskesmasId: string;
  phone: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;

  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoggedIn: false,
  isLoading: false,

  login: (user, token) => {
    // In production, store token in httpOnly cookie via server
    // For PWA demo, we store minimal session info
    set({ user, token, isLoggedIn: true });
  },

  logout: () => {
    set({ user: null, token: null, isLoggedIn: false });
  },

  setLoading: (loading) => set({ isLoading: loading }),
}));
