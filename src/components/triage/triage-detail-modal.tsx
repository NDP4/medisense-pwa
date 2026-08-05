'use client';

import { CheckCircle, AlertTriangle, XCircle, Mic, Clock, User } from 'lucide-react';
import Modal from '@/components/ui/modal';
import {
  useT,
  translateLevel,
  translateCondition,
  translateRecommendations,
  formatDate,
} from '@/lib/i18n/use-t';
import type { TriageResult } from '@/store/triage-store';

/* ── Modal Detail Triase ─────────────────────────────── */
/* Dibuka dari halaman History — menampilkan hasil lengkap: */
/* level, kondisi + confidence, catatan suara, rekomendasi   */

interface TriageDetailModalProps {
  item: TriageResult | null;
  onClose: () => void;
}

const LEVEL_STYLES = {
  hijau: { Icon: CheckCircle, color: '#16A34A', bg: '#DCFCE7' },
  kuning: { Icon: AlertTriangle, color: '#D97706', bg: '#FEF9C3' },
  merah: { Icon: XCircle, color: '#DC2626', bg: '#FEE2E2' },
} as const;

function formatConfidence(val: number): string {
  return `${(val * 100).toFixed(0)}%`;
}

export default function TriageDetailModal({ item, onClose }: TriageDetailModalProps) {
  const { t, lang } = useT();

  if (!item) return null;

  const levelStyle = LEVEL_STYLES[item.triageLevel] ?? LEVEL_STYLES.hijau;
  const { Icon } = levelStyle;

  const timeStr = formatDate(lang, item.timestamp, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const hasConditions =
    item.conditions.length > 0 &&
    !item.conditions.every((c) => c.condition === 'tidak_ada');

  return (
    <Modal open={true} onClose={onClose} title={t('history.detailTitle')}>
      <div className="w-full">
        {/* ── Header: ikon + level + waktu ── */}
        <div className="flex flex-col items-center mb-5">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
            style={{ backgroundColor: levelStyle.bg }}
          >
            <Icon className="w-9 h-9" style={{ color: levelStyle.color }} />
          </div>
          <h2
            className="text-2xl font-bold"
            style={{ color: levelStyle.color }}
          >
            {translateLevel(t, item.triageLevel)}
          </h2>
          {/* Nama pasien — hanya tersedia dari record lokal (cloud anonim) */}
          {item.patientName && (
            <p className="text-sm font-medium text-text-primary mt-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-text-secondary shrink-0" />
              {item.patientName}
            </p>
          )}
          <p className="text-xs text-text-secondary mt-2 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {timeStr}
          </p>
        </div>

        {/* ── Kondisi Terdeteksi ── */}
        <div className="w-full mb-4 text-left">
          <p className="text-xs font-semibold text-text-secondary uppercase mb-2">
            {t('history.detailConditions')}
          </p>
          {!hasConditions ? (
            <p className="text-sm text-text-secondary">
              {t('history.detailNoConditions')}
            </p>
          ) : (
            <div className="space-y-2">
              {item.conditions.map((c, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-muted rounded-xl px-3 py-2.5"
                >
                  <span className="text-sm font-medium text-text-primary">
                    {translateCondition(t, c.condition)}
                  </span>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ml-2"
                    style={{
                      backgroundColor: levelStyle.bg,
                      color: levelStyle.color,
                    }}
                  >
                    {formatConfidence(c.confidence)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Catatan Suara (opsional) ── */}
        {item.voiceText && (
          <div className="w-full mb-4 text-left">
            <p className="text-xs font-semibold text-text-secondary uppercase mb-2 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5" />
              {t('history.detailVoice')}
            </p>
            <div className="bg-muted rounded-xl p-3 text-sm text-text-primary leading-relaxed">
              &ldquo;{item.voiceText}&rdquo;
            </div>
          </div>
        )}

        {/* ── Rekomendasi ── */}
        <div className="w-full mb-6 text-left">
          <p className="text-xs font-semibold text-text-secondary uppercase mb-2">
            {t('history.detailRecommendations')}
          </p>
          <ul className="space-y-2">
            {translateRecommendations(t, item.recommendations).map((rec, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-sm text-text-primary leading-relaxed"
              >
                <span
                  className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: levelStyle.color }}
                />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Tombol Tutup ── */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all touch-target"
        >
          {t('history.detailClose')}
        </button>
      </div>
    </Modal>
  );
}
