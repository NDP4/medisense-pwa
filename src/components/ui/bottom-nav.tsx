'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, TrendingUp, ClipboardList, PlusCircle, User } from 'lucide-react';
import { useT } from '@/lib/i18n/use-t';

/* ── DESIGN.md §6.5 Bottom Navigation ─────────────────── */
/* 5 item: Home, Trend, +Triase (FAB tengah), History, Profile */
/* Prefetch semua halaman untuk navigasi instan            */

type IconType = typeof Home;

const NAV_ITEMS: { href: string; labelKey: string; Icon: IconType; isFab?: boolean }[] = [
  { href: '/', labelKey: 'nav.home', Icon: Home },
  { href: '/trend', labelKey: 'nav.trend', Icon: TrendingUp },
  { href: '/triage', labelKey: 'nav.triage', Icon: PlusCircle, isFab: true },
  { href: '/history', labelKey: 'nav.history', Icon: ClipboardList },
  { href: '/profile', labelKey: 'nav.profile', Icon: User },
];

const FAB_INDEX = 2;

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useT();

  // Hide on triage flow
  if (pathname === '/triage') return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border safe-area-bottom"
      style={{ height: '64px' }}
      aria-label={t('nav.aria')}
    >
      <div className="relative flex items-center h-full max-w-lg mx-auto px-2">
        {/* Left: Home, Trend */}
        {NAV_ITEMS.slice(0, FAB_INDEX).map(({ href, labelKey, Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              prefetch={true}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 touch-target transition-colors ${
                isActive ? 'text-primary' : 'text-text-secondary'
              }`}
            >
              <Icon
                className="w-5 h-5"
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span className="text-[10px] font-medium">{t(labelKey)}</span>
            </Link>
          );
        })}

        {/* FAB — Triase Baru di tengah */}
        <div className="flex items-center justify-center flex-1 h-full relative">
          <Link
            href="/triage"
            prefetch={true}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 active:scale-95 transition-all will-change-transform"
            style={{ marginTop: '-20px' }}
            aria-label={t('nav.triage')}
          >
            <PlusCircle className="w-7 h-7" strokeWidth={2} />
          </Link>
        </div>

        {/* Right: History, Profile */}
        {NAV_ITEMS.slice(FAB_INDEX + 1).map(({ href, labelKey, Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              prefetch={true}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 touch-target transition-colors ${
                isActive ? 'text-primary' : 'text-text-secondary'
              }`}
            >
              <Icon
                className="w-5 h-5"
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span className="text-[10px] font-medium">{t(labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
