'use client';

import BottomNav from '@/components/ui/bottom-nav';
import { usePathname } from 'next/navigation';

/* ── PWA Layout — Shared shell with Bottom Nav ──────── */
/* DESIGN.md §6.5 — Bottom Navigation fixed 64px         */

export default function PWALayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isTriageResult = pathname === '/triage'; // hide bottom nav during triage flow

  return (
    <div className="min-h-screen bg-muted max-w-lg mx-auto relative">
      {/* Main content area */}
      <main className={`pb-4 ${!isTriageResult ? 'pb-20' : ''}`}>
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Safe area spacing for mobile */}
      <div className="h-4" />
    </div>
  );
}
