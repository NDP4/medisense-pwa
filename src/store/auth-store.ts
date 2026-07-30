'use client';

import { create } from 'zustand';
import { syncManager } from '@/lib/sync';

/* ── Auth Zustand Store ─────────────────────────────── */

interface User {
  id: string;
  fullName: string;
  role: 'kader' | 'bidan' | 'puskesmas';
  puskesmasId: string;
  puskesmasName?: string;
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

// Rehydrate from sessionStorage on store creation
// This ensures auth state persists across full page loads/navigations
function rehydrateFromSession(): { token: string | null; user: User | null } {
  if (typeof window === 'undefined') {
    return { token: null, user: null };
  }
  const token = sessionStorage.getItem('medisense_token');
  const userStr = sessionStorage.getItem('medisense_user');
  let user: User | null = null;
  if (userStr) {
    try {
      user = JSON.parse(userStr) as User;
    } catch {
      // Corrupted storage — clear it
      sessionStorage.removeItem('medisense_user');
    }
  }
  return { token, user };
}

const { token: initialToken, user: initialUser } = rehydrateFromSession();

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  token: initialToken,
  isLoggedIn: !!initialToken && !!initialUser,
  isLoading: false,

  login: (user, token) => {
    sessionStorage.setItem('medisense_token', token);
    sessionStorage.setItem('medisense_user', JSON.stringify(user));
    syncManager.setKaderId(user.id);
    set({ user, token, isLoggedIn: true });
  },

  logout: () => {
    sessionStorage.removeItem('medisense_token');
    sessionStorage.removeItem('medisense_user');
    set({ user: null, token: null, isLoggedIn: false });
  },

  setLoading: (loading) => set({ isLoading: loading }),
}));
