'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, ClipboardList, PlusCircle, User } from 'lucide-react';

/* ── DESIGN.md §6.5 Bottom Navigation ─────────────────── */

const NAV_ITEMS = [
  { href: '/', label: 'Beranda', Icon: Home },
  { href: '/triage', label: 'Triase Baru', Icon: PlusCircle, isFab: true },
  { href: '/history', label: 'Riwayat', Icon: ClipboardList },
  { href: '/profile', label: 'Profil', Icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Hide on triage flow steps (show only bottom-0 on result screen)
  const isTriageFlow = pathname === '/triage';
  if (isTriageFlow) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border safe-area-bottom"
      style={{ height: '64px' }}
      aria-label="Navigasi utama"
    >
      <div className="flex items-center justify-around h-full max-w-lg mx-auto px-2">
        {NAV_ITEMS.map(({ href, label, Icon, isFab }) => {
          const isActive = pathname === href;

          if (isFab) {
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-center w-14 h-14 -mt-5 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 active:scale-95 transition-all"
                aria-label={label}
              >
                <Icon className="w-7 h-7" strokeWidth={2} />
              </Link>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 touch-target ${
                isActive ? 'text-primary' : 'text-text-secondary'
              }`}
            >
              <Icon
                className="w-5 h-5"
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
