'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  MapPin,
  Users,
  Lock,

} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import Modal from '@/components/ui/modal';
import PieChart from '@/components/ui/pie-chart';
import type { API } from '@/types/database';

/* ── Trend / Statistik Global ──────────────────────────── */
/* Data agregat dari SELURUH puskesmas via API             */
/* Pie chart interaktif + smooth navigation                */

type Period = '7d' | '30d' | 'all';

const LEVEL_CONFIG = [
  { key: 'hijau' as const, label: 'Aman', color: '#16A34A', Icon: CheckCircle },
  { key: 'kuning' as const, label: 'Waspada', color: '#EAB308', Icon: AlertTriangle },
  { key: 'merah' as const, label: 'Darurat', color: '#DC2626', Icon: XCircle },
];

export default function TrendPage() {
  const router = useRouter();
  const { token } = useAuthStore();

  const [period, setPeriod] = useState<Period>('7d');
  const [data, setData] = useState<API.TrendGlobalResponse | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isPeriodLoading, setIsPeriodLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const dataRef = useRef<API.TrendGlobalResponse | null>(null);

  // ── Fetch global data ──
  const fetchData = useCallback(async (p: Period) => {
    if (!token) {
      setIsInitialLoading(false);
      setShowLoginModal(true);
      return;
    }
    setError(null);
    try {
      const res = await fetch(`/api/trend/global?periode=${p}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Gagal memuat data' }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const json: API.TrendGlobalResponse = await res.json();
      setData(json);
      dataRef.current = json;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Terjadi kesalahan';
      if (!dataRef.current) setError(msg);
    }
  }, [token]);

  // ── Initial fetch (skeleton) + prefetch login page ──
  useEffect(() => {
    setIsInitialLoading(true);
    fetchData(period).finally(() => setIsInitialLoading(false));
    // Prefetch halaman login untuk navigasi cepat
    router.prefetch('/login');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Period change: silent fetch, NO skeleton ──
  const handlePeriodChange = useCallback((p: Period) => {
    if (p === period) return;
    setPeriod(p);
    setIsPeriodLoading(true);
    fetchData(p).finally(() => setIsPeriodLoading(false));
  }, [period, fetchData]);

  // ── Manual refresh ──
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchData(period);
    setTimeout(() => setIsRefreshing(false), 500);
  }, [period, fetchData]);

  // ── Derived data ──
  const total = data?.total_triages ?? 0;
  const byLevel = data?.triage_by_level ?? { hijau: 0, kuning: 0, merah: 0 };

  const pieSlices = LEVEL_CONFIG.map((c) => ({
    label: c.label,
    value: byLevel[c.key],
    color: c.color,
  }));

  const hijauPct = total ? Math.round((byLevel.hijau / total) * 100) : 0;
  const kuningPct = total ? Math.round((byLevel.kuning / total) * 100) : 0;
  const merahPct = total ? Math.round((byLevel.merah / total) * 100) : 0;

  const sortedConditions = data?.conditions_breakdown
    ? Object.entries(data.conditions_breakdown).sort(([, a], [, b]) => b - a).slice(0, 5)
    : [];

  // ── Skeleton ──
  if (isInitialLoading) {
    return (
      <div className="px-4 pt-6 pb-4" role="status" aria-label="Memuat data global">
        <div className="flex items-center justify-between mb-5">
          <div className="space-y-2"><div className="h-7 w-24 bg-gray-200 rounded-lg animate-pulse" /><div className="h-3 w-32 bg-gray-200 rounded animate-pulse" /></div>
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-8 bg-gray-100 rounded-xl mb-5 animate-pulse" />
        <div className="grid grid-cols-3 gap-2.5 mb-5">{[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />)}</div>
        <div className="h-64 bg-gray-200 rounded-xl mb-4 animate-pulse" />
        <span className="sr-only">Memuat data global...</span>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-4">
      {/* ── Login Prompt Modal ── */}
      <Modal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Login untuk Melihat Data Global"
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
          <Lock className="w-8 h-8 text-primary" strokeWidth={1.5} />
        </div>
        <h2 id="modal-login-trend-title" className="text-lg font-bold text-text-primary text-center mb-2">
          Login untuk Melihat Data Global
        </h2>
        <p className="text-sm text-text-secondary text-center mb-6 leading-relaxed">
          Data trend global dari seluruh puskesmas tersedia setelah login.
          Data offline Anda tetap bisa diakses tanpa login.
        </p>
        <button
          type="button"
          onClick={() => { setShowLoginModal(false); router.push('/login'); }}
          className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors mb-3"
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setShowLoginModal(false)}
          className="w-full text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          Nanti
        </button>
      </Modal>

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Trend Global</h1>
          <p className="text-xs text-text-secondary mt-0.5">Data agregat seluruh puskesmas</p>
        </div>
        <div className="flex items-center gap-2">
          {data && (
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1 text-xs text-accent font-medium hover:underline disabled:opacity-50"
              aria-label="Sinkronkan data global"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>
          )}
          <TrendingUp className="w-6 h-6 text-primary/60" strokeWidth={1.5} />
        </div>
      </div>

      {/* ── Period selector ── */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5" role="tablist" aria-label="Periode data global">
        {(['7d', '30d', 'all'] as Period[]).map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={period === p}
            onClick={() => handlePeriodChange(p)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              period === p ? 'bg-white text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {p === '7d' ? '7 Hari' : p === '30d' ? '30 Hari' : 'Semua'}
          </button>
        ))}
      </div>

      {/* ── Error (hanya jika data kosong) ── */}
      {error && !data ? (
        <div className="bg-red-50 rounded-xl p-6 text-center border border-red-200" role="alert">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-red-700 mb-1">Gagal Memuat Data</p>
          <p className="text-xs text-red-600 mb-4">{error}</p>
          <button
            type="button"
            onClick={() => { setIsInitialLoading(true); fetchData(period).finally(() => setIsInitialLoading(false)); }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Coba Lagi
          </button>
        </div>
      ) : (
        <>
          {/* ── Summary Cards ── */}
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            <div className="bg-surface rounded-xl p-3.5 border border-border text-center">
              <p className="text-2xl font-bold text-text-primary">{total.toLocaleString('id-ID')}</p>
              <p className="text-[10px] text-text-secondary mt-0.5">Total Triase</p>
            </div>
            <div className="bg-surface rounded-xl p-3.5 border border-border text-center">
              <p className="text-2xl font-bold text-kuning">{byLevel.kuning.toLocaleString('id-ID')}</p>
              <p className="text-[10px] text-text-secondary mt-0.5">Waspada</p>
            </div>
            <div className="bg-surface rounded-xl p-3.5 border border-border text-center">
              <p className="text-2xl font-bold text-merah">{byLevel.merah.toLocaleString('id-ID')}</p>
              <p className="text-[10px] text-text-secondary mt-0.5">Darurat</p>
            </div>
          </div>

          {/* ── Pie Chart + Distribusi ── */}
          <div className="bg-surface rounded-xl p-4 border border-border mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-text-secondary" />
              <h2 className="text-sm font-semibold text-text-primary">Distribusi Level Triase</h2>
              {isPeriodLoading && (
                <RefreshCw className="w-3.5 h-3.5 text-accent animate-spin ml-auto" />
              )}
            </div>

            {total > 0 ? (
              <div className={`flex flex-col items-center transition-opacity ${isPeriodLoading ? 'opacity-60' : 'opacity-100'}`}>
                {/* Pie chart */}
                <div className="my-2">
                  <PieChart slices={pieSlices} size={200} innerRadius={55} animated />
                </div>

                {/* Level legend — interactive */}
                <div className="w-full grid grid-cols-3 gap-2 mt-1">
                  {LEVEL_CONFIG.map(({ key, label, color, Icon }) => {
                    const val = byLevel[key];
                    const pct = total ? Math.round((val / total) * 100) : 0;
                    return (
                      <div key={key} className="text-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <Icon className="w-4 h-4 mx-auto mb-1" style={{ color }} />
                        <p className="text-base font-bold" style={{ color }}>{pct}%</p>
                        <p className="text-[10px] text-text-secondary">{val.toLocaleString('id-ID')}</p>
                        <p className="text-[9px] text-text-secondary font-medium">{label}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Kader & Patient stats */}
                <div className="w-full grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Users className="w-3.5 h-3.5" />
                    <span><strong className="text-text-primary">{data?.active_kaders ?? 0}</strong> kader</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Users className="w-3.5 h-3.5" />
                    <span><strong className="text-text-primary">{data?.unique_patients?.toLocaleString('id-ID') ?? 0}</strong> pasien</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-secondary text-center py-8">Belum ada data global</p>
            )}
          </div>

          {/* ── Kondisi Terbanyak ── */}
          <div className="bg-surface rounded-xl p-4 border border-border mb-4">
            <h2 className="text-sm font-semibold text-text-primary mb-3">Kondisi Terbanyak</h2>
            {sortedConditions.length > 0 ? (
              <div className="space-y-2.5">
                {sortedConditions.map(([label, count]) => {
                  const pct = total ? Math.round((count / total) * 100) : 0;
                  const isMerah = label.toLowerCase().includes('sepsis') || label.toLowerCase().includes('darurat');
                  const barColor = isMerah ? '#DC2626' : label.toLowerCase().includes('pneumonia') ? '#EAB308' : '#3B82F6';
                  return (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-text-primary truncate">{label}</span>
                        <span className="text-xs font-semibold text-text-secondary shrink-0 ml-2">{count}x</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: barColor, minWidth: count > 0 ? 4 : 0 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-text-secondary text-center py-6">Belum ada data kondisi</p>
            )}
          </div>

          {/* ── Puskesmas Teraktif ── */}
          {data?.puskesmas_summary && data.puskesmas_summary.length > 0 && (
            <div className="bg-surface rounded-xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-text-secondary" />
                <h2 className="text-sm font-semibold text-text-primary">Puskesmas Teraktif</h2>
              </div>
              <div className="space-y-2.5">
                {data.puskesmas_summary.slice(0, 8).map((p) => {
                  const pct = total ? Math.round((p.total / total) * 100) : 0;
                  return (
                    <div key={p.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-text-primary truncate">{p.name}</span>
                        <span className="text-xs text-text-secondary shrink-0 ml-2">{p.total} triase</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[10px] text-text-secondary">{p.region}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
