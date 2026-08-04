'use client';

import { useState } from 'react';
import { Plus, ArrowRight, Pencil, Trash2, X } from 'lucide-react';
import ProgressStepper from '@/components/ui/progress-stepper';
import { useTriageStore, DEFAULT_PATIENTS, type Patient } from '@/store/triage-store';
import { useT, translateRelation } from '@/lib/i18n/use-t';

/* ── Step 1/5 — Pilih Pasien ────────────────────────── */
/* DESIGN.md §7.2 — Grid profil anggota keluarga          */

export default function StepPatient({ onNext }: { onNext: () => void }) {
  const { t } = useT();
  const { selectedPatient, selectPatient } = useTriageStore();
  const [patients, setPatients] = useState(DEFAULT_PATIENTS);
  const [customName, setCustomName] = useState('');
  const [customAge, setCustomAge] = useState('');
  const [customGender, setCustomGender] = useState<0 | 1>(0);
  const [showCustom, setShowCustom] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // ── Select ──

  const handleSelect = (patient: Patient) => {
    selectPatient(patient);
  };

  // ── Add mode ──

  const openAddForm = () => {
    setEditingPatient(null);
    setCustomName('');
    setCustomAge('');
    setCustomGender(0);
    setShowCustom(true);
  };

  // ── Edit mode ──

  const openEditForm = (patient: Patient) => {
    setEditingPatient(patient);
    setCustomName(patient.name);
    setCustomAge(String(patient.age));
    setCustomGender(patient.gender);
    setShowCustom(true);
  };

  const cancelForm = () => {
    setShowCustom(false);
    setEditingPatient(null);
    setCustomName('');
    setCustomAge('');
    setCustomGender(0);
  };

  // ── Save (add or update) ──

  const handleSavePatient = () => {
    if (!customName.trim()) return;
    const age = parseInt(customAge, 10);
    if (isNaN(age) || age < 0 || age > 120) return;

    if (editingPatient) {
      // Update existing patient
      const updated: Patient = {
        ...editingPatient,
        name: customName.trim(),
        age,
        gender: customGender,
      };
      setPatients((prev) => prev.map((p) => (p.id === editingPatient.id ? updated : p)));
      selectPatient(updated);
    } else {
      // Add new patient
      const newPatient: Patient = {
        id: `custom-${Date.now()}`,
        name: customName.trim(),
        age,
        gender: customGender,
        avatar: '👤',
        relation: 'Lainnya',
      };
      setPatients((prev) => [...prev, newPatient]);
      selectPatient(newPatient);
    }

    cancelForm();
  };

  // ── Delete ──

  const handleDeletePatient = (id: string) => {
    setPatients((prev) => prev.filter((p) => p.id !== id));
    if (selectedPatient?.id === id) {
      selectPatient(null);
    }
    setDeleteConfirmId(null);
  };

  return (
    <div className="flex flex-col min-h-[70vh]">
      {/* Progress */}
      <ProgressStepper currentStep={1} className="mb-6" />

      {/* Title */}
      <h2 className="text-xl font-semibold text-text-primary mb-1">
        {t('patient.title')}
      </h2>
      <p className="text-sm text-text-secondary mb-6">
        {t('patient.subtitle')}
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
                relative flex flex-col items-center gap-2 p-4 pb-6 rounded-xl border-2 transition-all
                ${isSelected
                  ? 'border-accent bg-accent-bg ring-2 ring-accent/20'
                  : 'border-border bg-surface hover:border-accent/50'
                }
              `}
              aria-pressed={isSelected}
              aria-label={t('patient.ariaSelect', { name: p.name })}
            >
              {/* Edit icon — semua pasien bisa diedit */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openEditForm(p);
                }}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-border transition-colors"
                aria-label={t('patient.ariaEdit', { name: p.name })}
              >
                <Pencil className="w-3 h-3 text-text-secondary" />
              </button>

              <span className="text-3xl" role="img" aria-hidden="true">
                {p.avatar}
              </span>
              <span className="text-sm font-medium text-text-primary">
                {p.name}
              </span>
              <span className="text-xs text-text-secondary">{translateRelation(t, p.relation)}</span>
            </button>
          );
        })}

        {/* Add custom patient */}
        <button
          onClick={openAddForm}
          className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-border bg-surface hover:border-accent/50 transition-all"
        >
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Plus className="w-6 h-6 text-text-secondary" />
          </div>
          <span className="text-sm font-medium text-text-primary">{t('patient.newPatient')}</span>
          <span className="text-xs text-text-secondary">{t('relations.other')}</span>
        </button>
      </div>

      {/* Action buttons — Edit & Hapus untuk pasien terpilih */}
      {selectedPatient && !showCustom && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => openEditForm(selectedPatient!)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-border bg-surface text-text-primary font-medium hover:border-accent/50 transition-all"
          >
            <Pencil className="w-4 h-4" />
            <span>{t('patient.edit')}</span>
          </button>
          <button
            onClick={() => setDeleteConfirmId(selectedPatient!.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-red-200 bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t('patient.delete')}</span>
          </button>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirmId && (
        <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 animate-fade-in">
          <p className="text-sm text-red-700 mb-3">
            {t('patient.deleteConfirm')}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="flex-1 py-2 rounded-lg border border-border bg-surface text-text-primary text-sm font-medium"
            >
              {t('patient.cancel')}
            </button>
            <button
              onClick={() => handleDeletePatient(deleteConfirmId)}
              className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
            >
              {t('patient.yesDelete')}
            </button>
          </div>
        </div>
      )}

      {/* Custom patient form (add / edit) */}
      {showCustom && (
        <div className="mb-6 p-4 rounded-xl border border-border bg-surface animate-fade-in space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-text-primary">
              {editingPatient ? t('patient.editTitle') : t('patient.newTitle')}
            </h3>
            <button
              onClick={cancelForm}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-border transition-colors"
              aria-label={t('patient.closeAria')}
            >
              <X className="w-4 h-4 text-text-secondary" />
            </button>
          </div>

          {/* Nama */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              {t('patient.nameLabel')}
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder={t('patient.namePlaceholder')}
              className="w-full px-4 py-2.5 rounded-lg border border-border text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
              onKeyDown={(e) => e.key === 'Enter' && handleSavePatient()}
              autoFocus
            />
          </div>

          {/* Usia */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              {t('patient.ageLabel')}
            </label>
            <input
              type="number"
              value={customAge}
              onChange={(e) => setCustomAge(e.target.value)}
              placeholder={t('patient.agePlaceholder')}
              min={0}
              max={120}
              className="w-full px-4 py-2.5 rounded-lg border border-border text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Jenis Kelamin */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              {t('patient.genderLabel')}
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCustomGender(0)}
                className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                  customGender === 0
                    ? 'border-accent bg-accent-bg text-accent ring-2 ring-accent/20'
                    : 'border-border bg-surface text-text-secondary hover:border-accent/50'
                }`}
              >
                {t('patient.female')}
              </button>
              <button
                type="button"
                onClick={() => setCustomGender(1)}
                className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                  customGender === 1
                    ? 'border-accent bg-accent-bg text-accent ring-2 ring-accent/20'
                    : 'border-border bg-surface text-text-secondary hover:border-accent/50'
                }`}
              >
                {t('patient.male')}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSavePatient}
            disabled={!customName.trim() || !customAge.trim() || isNaN(parseInt(customAge, 10)) || parseInt(customAge, 10) < 0 || parseInt(customAge, 10) > 120}
            className="w-full py-2.5 bg-accent text-white rounded-lg font-medium disabled:opacity-50 hover:bg-accent/90 transition-colors"
          >
            {editingPatient ? t('patient.save') : t('patient.add')}
          </button>
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
        <span>{t('patient.next')}</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
