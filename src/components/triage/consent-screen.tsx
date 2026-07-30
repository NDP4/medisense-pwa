'use client';

import { Shield, Check, X } from 'lucide-react';

const CONSENT_VERSION = 'v1.0';
const CONSENT_STORAGE_KEY = 'medisense_consent';

interface ConsentScreenProps {
  onConsent: () => void;
}

export default function ConsentScreen({ onConsent }: ConsentScreenProps) {
  const handleConsent = () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
    }));
    onConsent();
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-[#1E3A5F] px-6 py-8 text-white shrink-0">
        <div className="flex justify-center mb-4">
          <Shield size={56} className="text-white" />
        </div>
        <h1 className="text-xl font-bold text-center">Persetujuan Penggunaan Data</h1>
        <p className="text-center mt-2 text-blue-100 text-sm">
          Baca informasi berikut sebelum menggunakan MediSense
        </p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 text-sm text-gray-700">
        <section>
          <h2 className="font-semibold text-base text-gray-900 mb-2">1. Tujuan Pengumpulan Data</h2>
          <p>Data yang Anda masukkan digunakan untuk:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Analisis triase dini berbasis kecerdasan buatan</li>
            <li>Rekomendasi tindakan medis darurat</li>
            <li>Peningkatan akurasi model AI melalui pembelajaran federasi</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-base text-gray-900 mb-2">2. Jenis Data yang Dikumpulkan</h2>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Data demografis (usia, jenis kelamin)</li>
            <li>Gejala yang dipilih oleh pengguna</li>
            <li>Hasil analisis triase (tingkat keparahan, kondisi terdeteksi)</li>
            <li>Rekaman suara yang diubah menjadi teks (opsional)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-base text-gray-900 mb-2">3. Hak Subjek Data</h2>
          <p>Sesuai UU PDP 2022, Anda berhak untuk:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Mengakses data yang tersimpan</li>
            <li>Memperbaiki data yang tidak akurat</li>
            <li>Menghapus data Anda kapan saja</li>
            <li>Mengekspor data Anda (portabilitas data)</li>
          </ul>
          <p className="mt-2">Kelola hak Anda melalui halaman Profil &gt; Data Saya.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base text-gray-900 mb-2">4. Periode Retensi</h2>
          <p>Data disimpan selama maksimal 2 (dua) tahun sesuai standar rekam medis dasar.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base text-gray-900 mb-2">5. Keamanan Data</h2>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Data Anda dienkripsi (AES-256-GCM) sebelum disimpan di perangkat Anda</li>
            <li>Data pasien (PII) tidak pernah dikirim ke cloud — hanya metadata anonim</li>
            <li>Semua pemrosesan AI terjadi di perangkat Anda (offline)</li>
          </ul>
        </section>

        <section className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-yellow-800 text-xs">
            ⚕️ MediSense adalah alat bantu triase, bukan pengganti diagnosis dokter. 
            Selalu konsultasikan kondisi darurat dengan tenaga kesehatan profesional.
          </p>
        </section>
      </div>

      {/* Footer buttons - fixed at bottom */}
      <div className="px-6 py-4 border-t border-gray-200 space-y-3 bg-white shrink-0">
        <button
          onClick={handleConsent}
          className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-green-700 active:scale-[0.98] transition-all"
        >
          <Check size={20} />
          Setuju & Lanjutkan
        </button>
        <a
          href="/"
          className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors block text-center"
        >
          <X size={20} />
          Tidak Setuju
        </a>
      </div>
    </div>
  );
}

export function hasConsent(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
  if (!stored) return false;
  try {
    const data = JSON.parse(stored);
    return data.version === CONSENT_VERSION;
  } catch {
    return false;
  }
}