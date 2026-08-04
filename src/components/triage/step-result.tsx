'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Lock } from 'lucide-react';
import ProgressStepper from '@/components/ui/progress-stepper';
import EmergencyButton from '@/components/ui/emergency-button';
import { useTriageStore, type TriageResult } from '@/store/triage-store';
import { useT, translateLevel, translateCondition, translateRecommendations } from '@/lib/i18n/use-t';

/* ── Step 5/5 — HASIL TRIASE (LAYAR PALING KRITIS) ──── */
/* DESIGN.md §7.6 — Background FULL warna, 3 varian        */
/* Hijau/Kuning/Merah — teks PUTIH semua                   */

interface StepResultProps {
  onRestart: () => void;
  onSync: () => void;
}

// Ikon besar sesuai level
function LevelIcon({ level }: { level: string }) {
  const size = 64;
  switch (level) {
    case 'merah':
      return <XCircle size={size} strokeWidth={1.5} className="text-white" />;
    case 'kuning':
      return <AlertTriangle size={size} strokeWidth={1.5} className="text-white" />;
    default:
      return <CheckCircle size={size} strokeWidth={1.5} className="text-white" />;
  }
}

function formatConfidence(val: number): string {
  return `${(val * 100).toFixed(0)}%`;
}

export default function StepResult({ onRestart, onSync }: StepResultProps) {
  const { t } = useT();
  const { result, syncStatus, triageSessionId } = useTriageStore();
  const [showDetail, setShowDetail] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    // Stagger entrance animation
    const t = setTimeout(() => setAnimateIn(true), 100);
    return () => clearTimeout(t);
  }, []);

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-text-secondary">{t('result.noResult')}</p>
      </div>
    );
  }

  const { triageLevel, conditions, recommendations } = result;
  const isMerah = triageLevel === 'merah';
  const translatedRecs = translateRecommendations(t, recommendations);

  // Background color berdasarkan level
  const bgClass = {
    hijau: 'bg-hijau',
    kuning: 'bg-kuning',
    merah: 'bg-merah',
  }[triageLevel];

  return (
    <div className={`flex flex-col min-h-[80vh] ${bgClass} text-white transition-colors duration-500`}>
      {/* Top safety chip */}
      <div className="flex items-center justify-center gap-1.5 pt-4 pb-2">
        <Lock className="w-3.5 h-3.5 text-white/70" strokeWidth={2} />
        <span className="text-xs text-white/70 font-medium">{t('result.dataSafe')}</span>
      </div>

      {/* Content area — fade in */}
      <div className={`flex flex-col items-center flex-1 px-6 transition-all duration-500 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Progress steps — white outline version */}
        <div className="w-full mb-6">
          <ProgressStepper currentStep={5} />
        </div>

        {/* Large Icon */}
        <div className="mb-4 mt-2 animate-fade-in">
          <LevelIcon level={triageLevel} />
        </div>

        {/* Level label — large */}
        <h1 className="text-4xl font-bold mb-2 text-center text-white drop-shadow-sm">
          {translateLevel(t, triageLevel)}
        </h1>

        {/* Conditions */}
        {conditions.length > 0 && (
          <div className="mb-4 text-center">
            {conditions.map((c, idx) => (
              <p key={idx} className="text-lg font-semibold text-white/90">
                {translateCondition(t, c.condition)}
                <span className="ml-2 text-sm text-white/70">
                  ({formatConfidence(c.confidence)})
                </span>
              </p>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="w-16 h-0.5 bg-white/30 rounded-full mb-4" />

        {/* Recommendations */}
        <ul className="w-full space-y-3 mb-6">
          {translatedRecs.map((rec, idx) => (
            <li
              key={idx}
              className="flex items-start gap-3 text-sm text-white/90 leading-relaxed animate-fade-in"
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <span className="mt-0.5 shrink-0">
                {rec.startsWith('SEGERA') || rec.startsWith('IMMEDIATELY') || rec.startsWith('Jangan') || rec.startsWith('Do not') ? (
                  <AlertTriangle className="w-4 h-4 text-white/80" strokeWidth={2.5} />
                ) : (
                  <CheckCircle className="w-4 h-4 text-white/80" strokeWidth={2} />
                )}
              </span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>

        {/* Spacer */}
        <div className="flex-1" />

        {/* ── Emergency Button (ONLY for MERAH) ── */}
        {isMerah && (
          <div className="w-full mb-4 animate-fade-in">
            <EmergencyButton />
          </div>
        )}

        {/* ── Sync status ── */}
        <button
          onClick={onSync}
          disabled={syncStatus === 'syncing'}
          className="flex items-center gap-2 text-sm text-white/80 font-medium mb-3 hover:text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
          <span>
            {syncStatus === 'idle' && t('result.syncIdle')}
            {syncStatus === 'syncing' && t('result.syncSyncing')}
            {syncStatus === 'synced' && t('result.syncSynced')}
            {syncStatus === 'error' && t('result.syncError')}
          </span>
        </button>

        {/* ── Triase Baru ── */}
        <button
          onClick={onRestart}
          className="w-full py-4 rounded-xl border-2 border-white/40 text-white text-lg font-semibold hover:bg-white/10 active:scale-[0.98] transition-all touch-target"
        >
          {t('result.newTriage')}
        </button>

        {/* ── Kembali ke Beranda ── */}
        <a
          href="/"
          className="w-full block text-center py-3 mt-2 rounded-xl text-white/80 text-base font-medium hover:text-white hover:bg-white/5 active:scale-[0.98] transition-all touch-target"
        >
          {t('result.backHome')}
        </a>

        {/* ── Disclaimer Medis ── */}
        <div className="w-full px-4 py-3 bg-black/10 mt-2 mb-4">
          <p className="text-white text-xs text-center leading-relaxed">
            {t('result.disclaimer')}
          </p>
        </div>
      </div>
    </div>
  );
}
