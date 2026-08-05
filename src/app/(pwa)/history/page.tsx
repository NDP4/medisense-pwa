'use client';

import { useEffect, useState } from 'react';
import { ClipboardList, RefreshCw, ChevronRight } from 'lucide-react';
import { useTriageStore, type TriageResult } from '@/store/triage-store';
import { useT, translateCondition, translateRecommendations, localeOf } from '@/lib/i18n/use-t';
import TriageDetailModal from '@/components/triage/triage-detail-modal';

/* ── History Page ─────────────────────────────────────── */
/* DESIGN.md §9.2 — Empty state: clipboard kosong          */
/* Ketuk kartu → modal detail triase (triage-detail-modal)  */

const LEVEL_STYLES: Record<string, { border: string; bg: string; dot: string; text: string }> = {
  hijau: { border: '#16A34A', bg: '#DCFCE7', dot: '#16A34A', text: '#166534' },
  kuning: { border: '#EAB308', bg: '#FEF9C3', dot: '#EAB308', text: '#854D0E' },
  merah: { border: '#DC2626', bg: '#FEE2E2', dot: '#DC2626', text: '#991B1B' },
};

export default function HistoryPage() {
  const { t, lang } = useT();
  const { history, fetchHistoryFromCloud } = useTriageStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TriageResult | null>(null);

  // Fetch history from cloud on mount
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchHistoryFromCloud();
      setIsLoading(false);
    };
    init();
  }, [fetchHistoryFromCloud]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchHistoryFromCloud();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // ── Skeleton ──
  if (isLoading) {
    return (
      <div className="px-4 pt-6" role="status" aria-label={t('history.ariaLoading')}>
        <div className="flex items-center justify-between mb-6">
          <div className="h-7 w-36 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-surface border border-border animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
                <div className="h-3 w-1/2 bg-gray-200 rounded" />
              </div>
              <div className="h-3 w-16 bg-gray-200 rounded shrink-0" />
            </div>
          ))}
        </div>
        <span className="sr-only">{t('history.srLoading')}</span>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-text-primary">
          {t('history.title')}
        </h1>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 text-sm text-accent font-medium hover:underline disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{t('history.syncBtn')}</span>
        </button>
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <ClipboardList className="w-16 h-16 text-text-secondary/40 mb-4" strokeWidth={1.5} />
          <p className="text-base font-medium text-text-primary mb-1">
            {t('history.emptyTitle')}
          </p>
          <p className="text-sm text-text-secondary text-center max-w-xs">
            {t('history.emptyBody')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...history].reverse().map((item, idx) => {
            const style = LEVEL_STYLES[item.triageLevel] ?? LEVEL_STYLES.hijau;
            const timeStr = new Date(item.timestamp).toLocaleDateString(localeOf(lang), {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <button
                key={item.id ?? idx}
                type="button"
                onClick={() => setSelectedItem(item)}
                className="w-full flex items-start gap-3 p-4 rounded-xl bg-surface border border-border text-left hover:bg-muted/50 active:scale-[0.99] transition-all touch-target"
                style={{ borderLeft: `4px solid ${style.border}` }}
              >
                <div
                  className="w-3 h-3 rounded-full mt-1.5 shrink-0"
                  style={{ backgroundColor: style.dot }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-text-primary">
                      {item.conditions.map(c => translateCondition(t, c.condition)).join(', ') || t('history.checkup')}
                    </p>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: style.bg, color: style.text }}
                    >
                      {t(`levels.${item.triageLevel}`) || item.triageLevel}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary">{timeStr}</p>
                  <ul className="mt-2 space-y-1">
                    {translateRecommendations(t, item.recommendations).slice(0, 2).map((rec, ridx) => (
                      <li key={ridx} className="text-xs text-text-secondary flex items-start gap-1.5">
                        <span className="mt-0.5">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <ChevronRight className="w-4 h-4 text-text-secondary/40 shrink-0 mt-1" aria-hidden="true" />
              </button>
            );
          })}
        </div>
      )}

      {/* Modal detail triase */}
      <TriageDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
