'use client';

import { useEffect, useRef } from 'react';
import { Activity, Lock } from 'lucide-react';
import ProgressStepper from '@/components/ui/progress-stepper';
import { useTriageStore, type TriageResult, type TriageCondition, getTriageLevel, getTriageLabel, getRecommendations } from '@/store/triage-store';
import { medisense } from '@/lib/medisense';

/* ── Step 4/5 — Analisis AI (Loading) ───────────────── */
/* DESIGN.md §7.5 — Logo berdenyut + progress bar         */

// Build RawInput from selected symptoms + defaults
function buildRawInput(
  symptoms: Set<number>,
  age: number,
  gender: number,
  vitals: {
    heart_rate?: number;
    respiratory_rate?: number;
    temperature?: number;
    spo2?: number;
    systolic_bp?: number;
    diastolic_bp?: number;
  } = {},
): {
  age: number; gender: number; bmi: number;
  heart_rate: number; respiratory_rate: number;
  systolic_bp: number; diastolic_bp: number;
  temperature: number; spo2: number;
  wbc: number; hemoglobin: number; platelet: number;
  creatinine: number; glucose: number; sodium: number; bicarbonate: number;
  fever: number; cough: number; dyspnea: number;
  confusion: number; chest_pain: number; diarrhea: number; cyanosis: number;
} {
  // Defaults: mean clinical values
  const has = (idx: number) => symptoms.has(idx) ? 1 : 0;

  return {
    age,
    gender,
    bmi: 22,
    heart_rate: vitals.heart_rate ?? 75,
    respiratory_rate: vitals.respiratory_rate ?? 16,
    systolic_bp: vitals.systolic_bp ?? 120,
    diastolic_bp: vitals.diastolic_bp ?? 80,
    temperature: vitals.temperature ?? 36.8,
    spo2: vitals.spo2 ?? 98,
    wbc: 7.5,
    hemoglobin: 14,
    platelet: 250,
    creatinine: 0.9,
    glucose: 95,
    sodium: 140,
    bicarbonate: 24,
    // Binary symptoms (indices 16-22)
    fever: has(16),
    cough: has(17),
    dyspnea: has(18),
    confusion: has(19),
    chest_pain: has(20),
    diarrhea: has(21),
    cyanosis: has(22),
  };
}

interface StepAnalyzeProps {
  onComplete: (result: TriageResult) => void;
  onError: (error: string) => void;
}

export default function StepAnalyze({ onComplete, onError }: StepAnalyzeProps) {
  const { selectedPatient, selectedSymptoms, startAnalysis, setAnalysisProgress } = useTriageStore();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const runAnalysis = async () => {
      startAnalysis();

      try {
        // Ensure model is loaded
        if (!medisense.isLoaded()) {
          await medisense.load();
        }

        setAnalysisProgress(20);

        // Build input
        const age = selectedPatient?.age ?? 30;
        const gender = selectedPatient?.gender ?? 0;
        const { vitalSigns } = useTriageStore.getState();
        const input = buildRawInput(selectedSymptoms, age, gender, vitalSigns);

        setAnalysisProgress(40);

        // Warmup if not yet warmed
        await medisense.warmup();

        setAnalysisProgress(60);

        // Run inference
        const prediction = await medisense.predict(input);

        setAnalysisProgress(80);

        // Map to triage result
        const level = getTriageLevel(prediction.maxProbability);

        const conditions: TriageCondition[] = [];
        const conditionLabels: string[] = [];

        if (prediction.sepsis > 0.1) {
          conditions.push({
            condition: 'sepsis',
            label: 'Sepsis',
            confidence: prediction.sepsis,
            triageLevel: getTriageLevel(prediction.sepsis),
          });
          conditionLabels.push('sepsis');
        }
        if (prediction.pneumonia_balita > 0.1) {
          conditions.push({
            condition: 'pneumonia_balita',
            label: 'Pneumonia',
            confidence: prediction.pneumonia_balita,
            triageLevel: getTriageLevel(prediction.pneumonia_balita),
          });
          conditionLabels.push('pneumonia_balita');
        }

        const result: TriageResult = {
          triageLevel: level,
          triageLabel: getTriageLabel(level),
          conditions,
          recommendations: getRecommendations(level, conditionLabels),
          timestamp: new Date().toISOString(),
        };

        setAnalysisProgress(100);

        // Audit trail
        const auditTrail = {
          timestamp: new Date().toISOString(),
          modelVersion: '1.0.0',
          inputFeatures: {
            age, gender, fever: input.fever, cough: input.cough,
            dyspnea: input.dyspnea, confusion: input.confusion,
            chest_pain: input.chest_pain, diarrhea: input.diarrhea,
            cyanosis: input.cyanosis,
          },
          rawOutput: [prediction.sepsis, prediction.pneumonia_balita],
          triageLevel: level,
          deviceFingerprint: navigator.userAgent?.slice(0, 50) || 'unknown',
        };
        console.log('[AUDIT] AI Decision:', JSON.stringify(auditTrail));

        // Simpan audit trail ke IndexedDB
        try {
          const { saveTriageSession } = await import('@/lib/db');
          await saveTriageSession({
            id: auditTrail.timestamp + '-' + Math.random().toString(36).slice(2, 8),
            patientName: selectedPatient?.name || 'Unknown',
            patientAge: selectedPatient?.age || 0,
            patientGender: selectedPatient?.gender ?? 0,
            triageLevel: level,
            conditions: JSON.stringify(conditions.map(c => c.condition)),
            confidence: prediction.maxProbability,
            modelVersion: '1.0.0',
            createdAt: new Date().toISOString(),
          });
        } catch (err) {
          console.warn('[Audit] Failed to persist:', err);
        }

        // Brief delay for UX
        setTimeout(() => onComplete(result), 600);
      } catch (err) {
        console.error('Analysis error:', err);
        onError(err instanceof Error ? err.message : 'Gagal menganalisis gejala');
      }
    };

    runAnalysis();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      {/* Progress */}
      <ProgressStepper currentStep={4} className="mb-6 w-full" />

      {/* Animated Logo */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
          <Activity className="w-12 h-12 text-primary" strokeWidth={1.5} />
        </div>
        {/* Spinning ring */}
        <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>

      {/* Status text */}
      <h2 className="text-xl font-semibold text-text-primary mb-2">
        Menganalisis gejala...
      </h2>
      <p className="text-sm text-text-secondary mb-8">
        Sebentar, sedang diproses
      </p>

      {/* Progress Bar */}
      <div className="w-full max-w-xs bg-border rounded-full h-3 mb-4 overflow-hidden">
        <div
          className="h-full bg-accent rounded-full animate-progress"
          style={{ animationDuration: '3s' }}
        />
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 mt-8 px-4 py-3 rounded-xl bg-muted max-w-xs">
        <Lock className="w-4 h-4 text-text-secondary mt-0.5 shrink-0" />
        <p className="text-xs text-text-secondary leading-relaxed">
          Proses ini berjalan offline di perangkat Anda. Data aman dan tidak dikirim ke server.
        </p>
      </div>
    </div>
  );
}
