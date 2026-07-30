'use client';

import { useEffect, useState } from 'react';
import { ClipboardList, RefreshCw } from 'lucide-react';
import { useTriageStore } from '@/store/triage-store';

/* ── History Page ─────────────────────────────────────── */
/* DESIGN.md §9.2 — Empty state: clipboard kosong          */

const LEVEL_STYLES: Record<string, { border: string; bg: string; dot: string; text: string }> = {
  hijau: { border: '#16A34A', bg: '#DCFCE7', dot: '#16A34A', text: '#166534' },
  kuning: { border: '#EAB308', bg: '#FEF9C3', dot: '#EAB308', text: '#854D0E' },
  merah: { border: '#DC2626', bg: '#FEE2E2', dot: '#DC2626', text: '#991B1B' },
};

const LEVEL_LABELS: Record<string, string> = {
  hijau: 'Aman',
  kuning: 'Waspada',
  merah: 'Darurat',
};

export default function HistoryPage() {
  const { history, fetchHistoryFromCloud } = useTriageStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch history from cloud on mount
  useEffect(() => {
    fetchHistoryFromCloud();
  }, [fetchHistoryFromCloud]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchHistoryFromCloud();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-text-primary">
          Riwayat Triase
        </h1>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 text-sm text-accent font-medium hover:underline disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Sync</span>
        </button>
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <ClipboardList className="w-16 h-16 text-text-secondary/40 mb-4" strokeWidth={1.5} />
          <p className="text-base font-medium text-text-primary mb-1">
            Belum ada sesi triase
          </p>
          <p className="text-sm text-text-secondary text-center max-w-xs">
            Mulai triase baru sekarang! Data akan tersimpan otomatis di perangkat Anda.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...history].reverse().map((item, idx) => {
            const style = LEVEL_STYLES[item.triageLevel] ?? LEVEL_STYLES.hijau;
            const timeStr = new Date(item.timestamp).toLocaleDateString('id-ID', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={idx}
                className="flex items-start gap-3 p-4 rounded-xl bg-surface border border-border"
                style={{ borderLeft: `4px solid ${style.border}` }}
              >
                <div
                  className="w-3 h-3 rounded-full mt-1.5 shrink-0"
                  style={{ backgroundColor: style.dot }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-text-primary">
                      {item.conditions.map(c => c.label).join(', ') || 'Pemeriksaan'}
                    </p>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: style.bg, color: style.text }}
                    >
                      {LEVEL_LABELS[item.triageLevel] ?? item.triageLevel}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary">{timeStr}</p>
                  <ul className="mt-2 space-y-1">
                    {item.recommendations.slice(0, 2).map((rec, ridx) => (
                      <li key={ridx} className="text-xs text-text-secondary flex items-start gap-1.5">
                        <span className="mt-0.5">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
