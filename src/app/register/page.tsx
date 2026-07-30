'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Phone, Lock, AlertCircle, Eye, EyeOff, ArrowLeft, Check, Building, Search, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import type { Puskesmas } from '@/types/database';

const ROLES = [
  { value: 'kader', label: 'Kader Kesehatan' },
  { value: 'bidan', label: 'Bidan Desa' },
  { value: 'puskesmas', label: 'Petugas Puskesmas' },
] as const;

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<string>('kader');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');

  // ── Puskesmas state ──
  const [puskesmasList, setPuskesmasList] = useState<Pick<Puskesmas, 'id' | 'name' | 'address' | 'region'>[]>([]);
  const [selectedPuskesmas, setSelectedPuskesmas] = useState<Pick<Puskesmas, 'id' | 'name' | 'address' | 'region'> | null>(null);
  const [puskesmasSearch, setPuskesmasSearch] = useState('');
  const [showPuskesmasDropdown, setShowPuskesmasDropdown] = useState(false);
  const [puskesmasLoading, setPuskesmasLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Fetch puskesmas list saat komponen mount ──
  useEffect(() => {
    let cancelled = false;
    const fetchPuskesmas = async () => {
      setPuskesmasLoading(true);
      try {
        const res = await fetch('/api/puskesmas/list');
        const data = await res.json();
        if (!cancelled && data.puskesmas) {
          setPuskesmasList(data.puskesmas);
        }
      } catch {
        // Silent fail — akan muncul error waktu submit
      } finally {
        if (!cancelled) setPuskesmasLoading(false);
      }
    };
    fetchPuskesmas();
    return () => { cancelled = true; };
  }, []);

  // ── Filter puskesmas berdasarkan search query ──
  const filteredPuskesmas = useMemo(() => {
    if (!puskesmasSearch.trim()) return puskesmasList;
    const q = puskesmasSearch.toLowerCase();
    return puskesmasList.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.region.toLowerCase().includes(q) ||
        (p.address && p.address.toLowerCase().includes(q))
    );
  }, [puskesmasList, puskesmasSearch]);

  // ── Tutup dropdown saat klik di luar ──
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowPuskesmasDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) {
      setPhone('');
      return;
    }
    if (digits.startsWith('62')) {
      setPhone(digits);
    } else if (digits.startsWith('0')) {
      setPhone('62' + digits.slice(1));
    } else {
      setPhone('62' + digits);
    }
  };

  const handleRegister = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || fullName.trim().length < 3) {
      setError('Nama lengkap minimal 3 karakter');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setError('Nomor telepon tidak valid');
      return;
    }
    if (!selectedPuskesmas) {
      setError('Pilih puskesmas tempat Anda bertugas');
      return;
    }
    if (password.length < 8) {
      setError('Password minimal 8 karakter');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak sama');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: '+' + phone.trim(),
          password,
          role,
          puskesmas_id: selectedPuskesmas.id,
        }),
      });

      const data = await res.json();

      if (res.ok && data.token !== undefined) {
        // Map snake_case dari API → camelCase yang diharapkan store
        login({
          id: data.user.id,
          fullName: data.user.full_name,
          role: data.user.role,
          puskesmasId: data.user.puskesmas_id,
          puskesmasName: data.user.puskesmas_name,
          phone: data.user.phone ?? '',
        }, data.token);
        setStep('success');
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setError(data.error || 'Registrasi gagal. Coba lagi.');
      }
    } catch (_err) {
      setError('Tidak dapat terhubung ke server. Periksa koneksi internet.');
    } finally {
      setLoading(false);
    }
  }, [fullName, phone, password, confirmPassword, role, selectedPuskesmas, login, router]);

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-xl font-bold text-text-primary mb-2">Registrasi Berhasil!</h1>
        <p className="text-sm text-text-secondary text-center">
          Akun Anda telah dibuat. Mengalihkan ke halaman utama...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="px-4 pt-6 pb-4 border-b border-border">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Kembali</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col px-6 py-8 max-w-sm mx-auto w-full overflow-y-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Daftar Akun Baru</h1>
          <p className="text-sm text-text-secondary mt-1">
            Daftar sebagai kader, bidan, atau petugas puskesmas
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 mb-4 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-text-primary mb-1">
              Nama Lengkap
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nama sesuai KTP"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-base"
                autoComplete="name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-1">
              Nomor Telepon
            </label>
            {phone && (
              <p className="text-xs text-text-secondary mb-1">
                Format: +{phone}
              </p>
            )}
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="Contoh: 08123456789"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-base"
                inputMode="numeric"
                autoComplete="tel"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Peran / Jabatan
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`py-2.5 px-3 rounded-lg text-sm font-medium border transition-all ${
                    role === r.value
                      ? 'bg-accent/10 border-accent text-accent'
                      : 'bg-surface border-border text-text-secondary hover:border-accent/50'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Searchable Puskesmas Selector ── */}
          <div ref={dropdownRef} className="relative">
            <label className="block text-sm font-medium text-text-primary mb-1">
              Puskesmas <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowPuskesmasDropdown(!showPuskesmasDropdown)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                selectedPuskesmas
                  ? 'border-accent bg-accent/5'
                  : 'border-border bg-surface hover:border-accent/50'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Building className="w-4 h-4 text-primary" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                {selectedPuskesmas ? (
                  <>
                    <p className="text-sm font-medium text-text-primary">{selectedPuskesmas.name}</p>
                    <p className="text-xs text-text-secondary truncate">{selectedPuskesmas.region}</p>
                  </>
                ) : (
                  <p className="text-sm text-text-secondary">
                    {puskesmasLoading ? 'Memuat daftar puskesmas...' : 'Ketuk untuk pilih puskesmas'}
                  </p>
                )}
              </div>
              <ChevronDown className={`w-5 h-5 text-text-secondary transition-transform ${showPuskesmasDropdown ? 'rotate-180' : ''}`} strokeWidth={1.5} />
            </button>

            {/* Dropdown */}
            {showPuskesmasDropdown && (
              <div className="absolute z-20 left-0 right-0 mt-1 bg-surface border border-border rounded-xl shadow-lg overflow-hidden">
                {/* Search input */}
                <div className="relative p-2 border-b border-border">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <input
                    type="text"
                    value={puskesmasSearch}
                    onChange={(e) => setPuskesmasSearch(e.target.value)}
                    placeholder="Cari puskesmas..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/20 border border-transparent focus:border-accent"
                    autoFocus
                  />
                </div>

                {/* List */}
                <div className="max-h-48 overflow-y-auto">
                  {filteredPuskesmas.length === 0 ? (
                    <div className="p-4 text-center text-sm text-text-secondary">
                      {puskesmasSearch ? 'Puskesmas tidak ditemukan' : 'Tidak ada puskesmas tersedia'}
                    </div>
                  ) : (
                    filteredPuskesmas.map((p) => {
                      const isSelected = selectedPuskesmas?.id === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSelectedPuskesmas(p);
                            setShowPuskesmasDropdown(false);
                            setPuskesmasSearch('');
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-muted transition-colors border-b border-border last:border-b-0 ${
                            isSelected ? 'bg-accent/5' : ''
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Building className="w-4 h-4 text-primary" strokeWidth={1.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary">{p.name}</p>
                            <p className="text-xs text-text-secondary truncate">{p.region}{p.address ? ` — ${p.address}` : ''}</p>
                          </div>
                          {isSelected && (
                            <Check className="w-5 h-5 text-accent shrink-0" strokeWidth={2} />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="w-full pl-10 pr-12 py-3 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-base"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-1">
              Konfirmasi Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-base"
                autoComplete="new-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold text-base hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {loading ? 'Memproses...' : 'Daftar'}
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-6 mb-8">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-accent font-medium hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
