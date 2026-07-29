'use client';

import { User, Shield, Info, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useTriageStore } from '@/store/triage-store';

/* ── Profile Page ─────────────────────────────────────── */

export default function ProfilePage() {
  const { history } = useTriageStore();

  const menuItems = [
    { icon: User, label: 'Data Pengguna', desc: 'Nama, peran, puskesmas', href: '#' },
    { icon: Shield, label: 'Privasi & Keamanan', desc: 'Data aman di perangkat', href: '#' },
    { icon: Info, label: 'Tentang MediSense', desc: 'v0.2.0 — Demo', href: '#' },
  ];

  return (
    <div className="px-4 pt-6">
      <h1 className="text-xl font-bold text-text-primary mb-6">Profil</h1>

      {/* User card */}
      <div className="bg-surface rounded-xl p-6 border border-border mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-lg font-semibold text-text-primary">Kader Demo</p>
            <p className="text-sm text-text-secondary">Kader Kesehatan</p>
            <p className="text-xs text-text-secondary mt-0.5">
              {history.length} triase dilakukan
            </p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        {menuItems.map((item, idx) => (
          <Link
            key={idx}
            href={item.href}
            className="flex items-center gap-4 p-4 hover:bg-muted transition-colors border-b border-border last:border-b-0"
          >
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <item.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary">{item.label}</p>
              <p className="text-xs text-text-secondary">{item.desc}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-text-secondary" strokeWidth={1.5} />
          </Link>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="mt-8 p-4 rounded-xl bg-kuning-bg border border-kuning/20">
        <p className="text-xs text-kuning/80 leading-relaxed">
          ⚠️ MediSense AI v0.2.0 — Demo menggunakan data sintetis. Bukan untuk diagnosis klinis.
          Selalu konsultasi dengan tenaga kesehatan untuk keputusan medis.
        </p>
      </div>
    </div>
  );
}
