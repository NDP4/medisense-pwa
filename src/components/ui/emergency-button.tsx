'use client';

import { Phone } from 'lucide-react';
import { useT } from '@/lib/i18n/use-t';

/* ── DESIGN.md §6.2 Tombol 119 Emergency ──────────────── */
/* Ukuran 2x tombol normal, background merah solid, pulse  */

interface EmergencyButtonProps {
  className?: string;
}

function callEmergency() {
  // One-tap dial 119
  window.location.href = 'tel:119';
}

export default function EmergencyButton({ className = '' }: EmergencyButtonProps) {
  const { t } = useT();
  return (
    <button
      onClick={callEmergency}
      className={`
        w-full flex items-center justify-center gap-3
        bg-merah text-white font-bold
        rounded-xl px-6 py-5
        animate-pulse-emergency
        shadow-lg shadow-red-500/30
        active:scale-95 transition-transform
        text-lg sm:text-xl
        touch-target
        ${className}
      `}
      aria-label={t('emergency.aria')}
      type="button"
    >
      <Phone className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.5} />
      <span>{t('emergency.label')}</span>
    </button>
  );
}
