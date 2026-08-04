'use client';

import { Check } from 'lucide-react';
import { useT } from '@/lib/i18n/use-t';

/* ── DESIGN.md §6.6 Progress Stepper ─────────────────── */

const STEP_KEYS = ['steps.patient', 'steps.symptoms', 'steps.voice', 'steps.analyze', 'steps.result'];

interface ProgressStepperProps {
  currentStep: number; // 1-5
  className?: string;
}

export default function ProgressStepper({
  currentStep,
  className = '',
}: ProgressStepperProps) {
  const { t } = useT();
  return (
    <div className={`flex items-center justify-between w-full px-2 ${className}`}>
      {STEP_KEYS.map((key, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;
        const isUpcoming = stepNum > currentStep;

        return (
          <div key={idx} className="flex flex-col items-center flex-1">
            {/* Step Circle */}
            <div
              className={`
                flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-300
                ${isActive ? 'bg-accent text-white ring-2 ring-accent ring-offset-2' : ''}
                ${isCompleted ? 'bg-hijau text-white' : ''}
                ${isUpcoming ? 'bg-white border-2 border-border text-text-secondary' : ''}
              `}
              aria-current={isActive ? 'step' : undefined}
            >
              {isCompleted ? (
                <Check className="w-4 h-4" strokeWidth={2.5} />
              ) : (
                <span>{stepNum}</span>
              )}
            </div>

            {/* Connector line */}
            {idx < STEP_KEYS.length - 1 && (
              <div
                className={`
                  h-0.5 w-full mt-4 -ml-2 mr-2
                  ${isCompleted ? 'bg-hijau' : 'bg-border'}
                  transition-colors duration-300
                `}
              />
            )}

            {/* Label */}
            <span
              className={`
                text-xs mt-1.5 font-medium text-center
                ${isActive ? 'text-accent font-semibold' : ''}
                ${isCompleted ? 'text-text-primary' : ''}
                ${isUpcoming ? 'text-text-secondary' : ''}
              `}
            >
              {t(key)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
