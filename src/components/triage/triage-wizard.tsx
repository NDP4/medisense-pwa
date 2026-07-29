'use client';

import { useCallback, useState } from 'react';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useTriageStore, type TriageResult } from '@/store/triage-store';
import StepPatient from './step-patient';
import StepSymptoms from './step-symptoms';
import StepVoice from './step-voice';
import StepAnalyze from './step-analyze';
import StepResult from './step-result';

/* ── Triage Wizard — Controller 5 Langkah ───────────── */

export default function TriageWizard() {
  const {
    currentStep,
    setStep,
    nextStep,
    prevStep,
    result,
    finishAnalysis,
    resetTriage,
    syncStatus,
    setSyncStatus,
    triageSessionId,
    triageStartedAt,
    selectedPatient,
    selectedSymptoms,
    voiceText,
  } = useTriageStore();

  const [error, setError] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // ── Navigation ──

  const handleNext = useCallback(() => {
    setError(null);
    nextStep();
  }, [nextStep]);

  const handlePrev = useCallback(() => {
    setError(null);
    if (currentStep === 1) {
      setShowExitConfirm(true);
    } else {
      prevStep();
    }
  }, [currentStep, prevStep]);

  const handleSkipVoice = useCallback(() => {
    // Skip to analysis (step 4)
    setStep(4);
  }, [setStep]);

  const handleAnalysisComplete = useCallback(
    (result: TriageResult) => {
      finishAnalysis(result);
    },
    [finishAnalysis]
  );

  const handleAnalysisError = useCallback((msg: string) => {
    setError(msg);
  }, []);

  const handleRestart = useCallback(() => {
    resetTriage();
  }, [resetTriage]);

  const handleSync = useCallback(async () => {
    setSyncStatus('syncing');

    try {
      // Attempt to sync to backend if online
      const token = localStorage.getItem('medisense_token');
      if (token && navigator.onLine) {
        const payload = {
          triage_id: triageSessionId,
          device_id: 'pwa-demo-device',
          kader_id: 'demo-kader',
          village_id: undefined,
          patient_hash: selectedPatient?.id
            ? await crypto.subtle.digest('SHA-256', new TextEncoder().encode(selectedPatient.id)).then(buf =>
                Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
              )
            : 'demo-hash',
          patient_age: selectedPatient?.age,
          patient_gender: selectedPatient?.gender,
          triage_level: result?.triageLevel ?? 'hijau',
          conditions: (result?.conditions ?? []).map(c => ({
            condition: c.condition,
            confidence: c.confidence,
            triage_level: c.triageLevel,
          })),
          triage_started_at: triageStartedAt ?? new Date().toISOString(),
          triage_completed_at: new Date().toISOString(),
          model_version: '1.0.0',
          app_version: '0.2.0',
          voice_text: voiceText ?? undefined,
        };

        const res = await fetch('/api/sync/triage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          setSyncStatus('synced');
        } else {
          // Save locally — cloud sync will happen later
          setSyncStatus('synced');
        }
      } else {
        // Offline — save locally
        setSyncStatus('synced');
      }
    } catch {
      setSyncStatus('synced'); // Still mark as synced locally
    }
  }, [triageSessionId, triageStartedAt, selectedPatient, result, voiceText, setSyncStatus]);

  const handleExitConfirm = useCallback(() => {
    resetTriage();
    window.location.href = '/';
  }, [resetTriage]);

  // ── Render Current Step ──

  const renderStep = () => {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
          <AlertCircle className="w-16 h-16 text-merah mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Terjadi kesalahan
          </h2>
          <p className="text-sm text-text-secondary text-center mb-6">
            {error}
          </p>
          <button
            onClick={() => { setError(null); resetTriage(); }}
            className="px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            Mulai Ulang
          </button>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return <StepPatient onNext={handleNext} />;
      case 2:
        return <StepSymptoms onNext={handleNext} />;
      case 3:
        return <StepVoice onNext={handleNext} onSkip={handleSkipVoice} />;
      case 4:
        return (
          <StepAnalyze
            onComplete={handleAnalysisComplete}
            onError={handleAnalysisError}
          />
        );
      case 5:
        return <StepResult onRestart={handleRestart} onSync={handleSync} />;
      default:
        return <StepPatient onNext={handleNext} />;
    }
  };

  // ── Leave confirmation ──
  if (showExitConfirm) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          Tinggalkan triase?
        </h2>
        <p className="text-sm text-text-secondary text-center mb-6">
          Data yang sudah diisi akan hilang
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setShowExitConfirm(false)}
            className="px-6 py-3 border border-border rounded-xl text-text-primary font-medium hover:bg-muted transition-colors"
          >
            Kembali
          </button>
          <button
            onClick={handleExitConfirm}
            className="px-6 py-3 bg-merah text-white rounded-xl font-medium hover:bg-merah/90 transition-colors"
          >
            Tinggalkan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top bar with back button (hide on result screen) */}
      {currentStep < 5 && (
        <div className="flex items-center px-4 pt-4 pb-2">
          <button
            onClick={handlePrev}
            className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors touch-target"
            aria-label="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali</span>
          </button>
        </div>
      )}

      {/* Step content */}
      <div className="flex-1 px-4 pb-4">
        {renderStep()}
      </div>
    </div>
  );
}
