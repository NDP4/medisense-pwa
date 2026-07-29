'use client';

import Link from 'next/link';
import { Stethoscope, Activity, Clock, Shield } from 'lucide-react';
import { useTriageStore } from '@/store/triage-store';

/* ── Home / Dashboard ────────────────────────────────── */
/* DESIGN.md §7.1 — CTA Triase Baru + Riwayat Terakhir    */

const LEVEL_STYLES: Record<string, { border: string; bg: string; dot: string; text: string }> = {
  hijau: { border: '#16A34A', bg: '#DCFCE7', dot: '#16A34A', text: '#166534' },
  kuning: { border: '#EAB308', bg: '#FEF9C3', dot: '#EAB308', text: '#854D0E' },
  merah: { border: '#DC2626', bg: '#FEE2E2', dot: '#DC2626', text: '#991B1B' },
};

export default function HomePage() {
  const { history } = useTriageStore();
  const lastThree = history.slice(0, 3);

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-primary">MediSense AI</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Triase Dini berbasis AI
          </p>
        </div>
        <Shield className="w-8 h-8 text-primary/60" strokeWidth={1.5} />
      </div>

      {/* CTA — Triase Baru */}
      <Link
        href="/triage"
        className="block w-full bg-primary text-white rounded-2xl p-6 mb-8 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
            <Stethoscope className="w-7 h-7 text-white" strokeWidth={2} />
          </div>
          <div>
            <p className="text-lg font-bold">+ TRIASE BARU</p>
            <p className="text-sm text-white/80">Mulai pemeriksaan gejala</p>
          </div>
        </div>
      </Link>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-surface rounded-xl p-4 text-center border border-border">
          <Activity className="w-5 h-5 text-accent mx-auto mb-1" />
          <p className="text-lg font-bold text-text-primary">{history.length}</p>
          <p className="text-xs text-text-secondary">Triase</p>
        </div>
        <div className="bg-surface rounded-xl p-4 text-center border border-border">
          <Clock className="w-5 h-5 text-kuning mx-auto mb-1" />
          <p className="text-lg font-bold text-text-primary">Offline</p>
          <p className="text-xs text-text-secondary">100%</p>
        </div>
        <div className="bg-surface rounded-xl p-4 text-center border border-border">
          <Shield className="w-5 h-5 text-hijau mx-auto mb-1" />
          <p className="text-lg font-bold text-text-primary">Aman</p>
          <p className="text-xs text-text-secondary">Data lokal</p>
        </div>
      </div>

      {/* Recent History */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-text-primary">
            Riwayat Terakhir
          </h2>
          {history.length > 0 && (
            <Link
              href="/history"
              className="text-sm text-accent font-medium hover:underline"
            >
              Lihat Semua &gt;
            </Link>
          )}
        </div>

        {lastThree.length === 0 ? (
          <div className="bg-surface rounded-xl p-8 text-center border border-border">
            <p className="text-sm text-text-secondary">
              Belum ada sesi triase. Mulai triase baru sekarang!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {lastThree.map((item, idx) => {
              const style = LEVEL_STYLES[item.triageLevel] ?? LEVEL_STYLES.hijau;
              const timeStr = new Date(item.timestamp).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-border"
                  style={{ borderLeft: `4px solid ${style.border}` }}
                >
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: style.dot }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {item.conditions.map(c => c.label).join(', ') || 'Pemeriksaan'}
                    </p>
                    <p className="text-xs text-text-secondary">{timeStr}</p>
                  </div>
                  <span
                    className="text-xs font-semibold px-2 py-1 rounded-full"
                    style={{ backgroundColor: style.bg, color: style.text }}
                  >
                    {item.triageLevel === 'hijau' ? 'Hijau' : item.triageLevel === 'kuning' ? 'Kuning' : 'Merah'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
