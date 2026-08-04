'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Language } from './translations';

/* ── Language Store (Zustand + persist) ───────────────── */
/* Storage key: medisense_lang — inisialisasi di client     */
/* Deteksi browser: navigator.language ('en' → English)     */

const STORAGE_KEY = 'medisense_lang';

interface LanguageState {
  lang: Language;
  setLang: (lang: Language) => void;
}

function getInitialLang(): Language {
  if (typeof window === 'undefined') return 'id';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const lang = parsed?.state?.lang;
      if (lang === 'id' || lang === 'en') return lang;
    }
  } catch {
    // ignore corrupt storage — fall back to detection
  }
  return navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'id';
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      lang: getInitialLang(),
      setLang: (lang) => {
        if (typeof window !== 'undefined') {
          document.documentElement.lang = lang;
        }
        set({ lang });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
