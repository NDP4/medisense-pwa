'use client';

import { ArrowRight } from 'lucide-react';
import ProgressStepper from '@/components/ui/progress-stepper';
import { useTriageStore, SYMPTOM_DEFS } from '@/store/triage-store';
import { SYMPTOM_ICONS } from './symptom-icons';
import { useT } from '@/lib/i18n/use-t';

/* ── Step 2/5 — Input Gejala ────────────────────────── */
/* DESIGN.md §7.3 — Grid ilustrasi 2 kolom, multi-select  */

export default function StepSymptoms({ onNext }: { onNext: () => void }) {
  const { t } = useT();
  const { selectedSymptoms, toggleSymptom } = useTriageStore();
  const count = selectedSymptoms.size;

  return (
    <div className="flex flex-col min-h-[70vh]">
      {/* Progress */}
      <ProgressStepper currentStep={2} className="mb-6" />

      {/* Title */}
      <h2 className="text-xl font-semibold text-text-primary mb-1">
        {t('symptoms.title')}
      </h2>
      <p className="text-sm text-text-secondary mb-5">
        {t('symptoms.subtitle')}
      </p>

      {/* Symptom Grid — 2 columns */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {SYMPTOM_DEFS.map((symptom) => {
          const isSelected = selectedSymptoms.has(symptom.featureIndex);
          const IconComponent = SYMPTOM_ICONS[symptom.id];

          return (
            <button
              key={symptom.id}
              onClick={() => toggleSymptom(symptom.featureIndex)}
              className={`
                flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                ${isSelected
                  ? 'border-accent bg-accent-bg ring-2 ring-accent/20'
                  : 'border-border bg-surface hover:border-accent/50'
                }
              `}
              aria-pressed={isSelected}
              aria-label={t('symptoms.ariaSymptom', { name: t(`symptomsNs.${symptom.id}`) })}
            >
              {/* SVG Illustration 120x120 -> 96x96 in grid */}
              <div className="w-24 h-24 flex items-center justify-center">
                {IconComponent ? (
                  <IconComponent size={96} />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-text-secondary text-xs">
                    {t(`symptomsNs.${symptom.id}`)[0]}
                  </div>
                )}
              </div>

              {/* Label */}
              <span className="text-sm font-medium text-text-primary text-center leading-tight">
                {t(`symptomsNs.${symptom.id}`)}
              </span>

              {/* Check indicator */}
              {isSelected && (
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center -mt-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Hint */}
      <p className="text-xs text-text-secondary text-center mb-4">
        {count === 0
          ? t('symptoms.hintMinOne')
          : t('symptoms.hintSelected', { n: count })}
      </p>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Next button */}
      <button
        onClick={onNext}
        disabled={count === 0}
        className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white text-lg font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-[0.98] transition-all touch-target"
      >
        <span>{t('symptoms.btnSelected', { n: count })}</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
