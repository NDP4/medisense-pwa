'use client';

import { useEffect, useState } from 'react';
import BottomNav from '@/components/ui/bottom-nav';
import { usePathname } from 'next/navigation';
import { syncManager } from '@/lib/sync';
import { useTriageStore } from '@/store/triage-store';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';

/* ── PWA Layout — Shared shell with Bottom Nav ──────── */
/* DESIGN.md §6.5 — Bottom Navigation fixed 64px         */

export default function PWALayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isTriageResult = pathname === '/triage';
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [isOnline, setIsOnline] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    syncManager.initialize().then(() => setIsInitialized(true));

    // Load history from IndexedDB on mount
    useTriageStore.getState().loadHistory();

    // Then fetch history from cloud to merge with local
    setTimeout(() => {
      useTriageStore.getState().fetchHistoryFromCloud();
    }, 2000);

    setIsOnline(navigator.onLine);

    const unsub = syncManager.onEvent((event) => {
      setSyncStatus(event.status);
      if (event.connectionStatus) {
        setIsOnline(event.connectionStatus === 'online');
      }
      // After sync completes, refresh history from cloud
      if (event.type === 'sync-complete' && event.syncedCount && event.syncedCount > 0) {
        setTimeout(() => {
          useTriageStore.getState().fetchHistoryFromCloud();
        }, 1000);
      }
    });

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsub();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleManualSync = () => {
    syncManager.syncNow();
  };

  return (
    <div className="min-h-screen bg-muted max-w-lg mx-auto relative">
      {/* Sync status bar */}
      <div className="sticky top-0 z-30">
        {syncStatus === 'syncing' && (
          <div className="flex items-center justify-center gap-2 bg-accent/10 py-1.5 text-xs text-accent">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Menyinkronkan data...</span>
          </div>
        )}
        {!isOnline && (
          <div className="flex items-center justify-center gap-2 bg-yellow-50 py-1.5 text-xs text-yellow-700 border-b border-yellow-200">
            <WifiOff className="w-3 h-3" />
            <span>Offline — data aman di perangkat</span>
          </div>
        )}
        {isOnline && syncStatus === 'synced' && (
          <div className="flex items-center justify-center gap-2 bg-green-50 py-1.5 text-xs text-green-700">
            <Wifi className="w-3 h-3" />
            <span>Tersinkronasi</span>
          </div>
        )}
        {isOnline && syncStatus === 'error' && (
          <button
            onClick={handleManualSync}
            className="w-full flex items-center justify-center gap-2 bg-red-50 py-1.5 text-xs text-red-700 hover:bg-red-100 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Sync gagal — ketuk untuk ulang</span>
          </button>
        )}
      </div>

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
