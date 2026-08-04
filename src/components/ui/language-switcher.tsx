'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Check } from 'lucide-react';
import { useT, useLanguageStore } from '@/lib/i18n/use-t';
import type { Language } from '@/lib/i18n/translations';
import { FlagID, FlagGB } from './flags';

/* ── Language Switcher — tombol bendera bulat ─────────── */
/* Dropdown 2 opsi: Indonesia | English (a11y listbox)      */

const OPTIONS: { code: Language; labelKey: string; Flag: typeof FlagID }[] = [
  { code: 'id', labelKey: 'language.optionId', Flag: FlagID },
  { code: 'en', labelKey: 'language.optionEn', Flag: FlagGB },
];

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { t } = useT();
  const { lang, setLang } = useLanguageStore();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const active = OPTIONS.find((o) => o.code === lang) ?? OPTIONS[0];
  const ActiveFlag = active.Flag;

  const handleSelect = useCallback((code: Language) => {
    setLang(code);
    setOpen(false);
  }, [setLang]);

  // Tutup saat klik di luar
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-10 h-10 rounded-full bg-surface border border-border shadow-sm hover:bg-muted transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-accent/40"
        aria-label={t('language.ariaToggle')}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <ActiveFlag className="w-6 h-6" />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t('language.ariaToggle')}
          className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in"
        >
          {OPTIONS.map(({ code, labelKey, Flag }) => {
            const isActive = code === lang;
            return (
              <button
                key={code}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => handleSelect(code)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors hover:bg-muted ${
                  isActive ? 'bg-accent-bg font-medium' : 'text-text-primary'
                }`}
              >
                <Flag className="w-5 h-5 shrink-0" />
                <span className="flex-1 min-w-0 truncate">{t(labelKey)}</span>
                {isActive && <Check className="w-4 h-4 text-accent shrink-0" strokeWidth={2.5} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
