'use client';

import { useState } from 'react';
import { Plus, ArrowRight, UserRound } from 'lucide-react';
import ProgressStepper from '@/components/ui/progress-stepper';
import { useTriageStore, DEFAULT_PATIENTS, type Patient } from '@/store/triage-store';

/* ── Step 1/5 — Pilih Pasien ────────────────────────── */
/* DESIGN.md §7.2 — Grid profil anggota keluarga          */

export default function StepPatient({ onNext }: { onNext: () => void }) {
  const { selectedPatient, selectPatient } = useTriageStore();
  const [patients] = useState(DEFAULT_PATIENTS);
  const [customName, setCustomName] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const handleSelect = (patient: Patient) => {
    selectPatient(patient);
  };

  const handleAddCustom = () => {
    if (!customName.trim()) return;
    const newPatient: Patient = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      age: 30,
      gender: 0,
      avatar: '👤',
      relation: 'Lainnya',
    };
    selectPatient(newPatient);
    setCustomName('');
    setShowCustom(false);
  };

  return (
    <div className="flex flex-col min-h-[70vh]">
      {/* Progress */}
      <ProgressStepper currentStep={1} className="mb-6" />

      {/* Title */}
      <h2 className="text-xl font-semibold text-text-primary mb-1">
        Siapa yang akan diperiksa?
      </h2>
      <p className="text-sm text-text-secondary mb-6">
        Pilih anggota keluarga atau tambahkan pasien baru
      </p>

      {/* Patient Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {patients.map((p) => {
          const isSelected = selectedPatient?.id === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handleSelect(p)}
              className={`
                flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                ${isSelected
                  ? 'border-accent bg-accent-bg ring-2 ring-accent/20'
                  : 'border-border bg-surface hover:border-accent/50'
                }
              `}
              aria-pressed={isSelected}
              aria-label={`Pilih ${p.name}`}
            >
              <span className="text-3xl" role="img" aria-hidden="true">
                {p.avatar}
              </span>
              <span className="text-sm font-medium text-text-primary">
                {p.name}
              </span>
              <span className="text-xs text-text-secondary">{p.relation}</span>
            </button>
          );
        })}

        {/* Add custom patient */}
        <button
          onClick={() => setShowCustom(true)}
          className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-border bg-surface hover:border-accent/50 transition-all"
        >
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Plus className="w-6 h-6 text-text-secondary" />
          </div>
          <span className="text-sm font-medium text-text-primary">Pasien Baru</span>
          <span className="text-xs text-text-secondary">Lainnya</span>
        </button>
      </div>

      {/* Custom patient form */}
      {showCustom && (
        <div className="mb-6 p-4 rounded-xl border border-border bg-surface animate-fade-in">
          <label className="block text-sm font-medium text-text-primary mb-2">
            Nama Pasien
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Masukkan nama..."
              className="flex-1 px-4 py-2.5 rounded-lg border border-border text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
              autoFocus
            />
            <button
              onClick={handleAddCustom}
              disabled={!customName.trim()}
              className="px-4 py-2.5 bg-accent text-white rounded-lg font-medium disabled:opacity-50 hover:bg-accent/90 transition-colors"
            >
              Tambah
            </button>
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Next button */}
      <button
        onClick={onNext}
        disabled={!selectedPatient}
        className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white text-lg font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-[0.98] transition-all touch-target"
      >
        <span>Selanjutnya</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
