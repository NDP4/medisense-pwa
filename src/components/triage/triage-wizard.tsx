'use client';

import { useCallback, useState } from 'react';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useTriageStore, type TriageResult } from '@/store/triage-store';
import StepPatient from './step-patient';
import StepSymptoms from './step-symptoms';
import StepVoice from './step-voice';
import StepAnalyze from './step-analyze';
import StepResult from './step-result';
import { syncManager } from '@/lib/sync';

/* ── Triage Wizard — Controller 5 Langkah ───────────── */

async function generatePatientHash(id: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${id}:${salt}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function sanitizeVoiceText(text: string | null): string | undefined {
  if (!text) return undefined;
  return text
    .replace(/\b\w{30,}\b/g, '[terlalu panjang]')
    .replace(/\b\d{15,}\b/g, '[angka panjang]');
}

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
    syncError,
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
    async (result: TriageResult) => {
      finishAnalysis(result);

      try {
        const today = new Date().toISOString().split('T')[0];
        const salt = `medisense-2026-${today}`;
        const patientHash = await generatePatientHash(selectedPatient?.id || 'unknown', salt);
        const sanitizedVoiceText = sanitizeVoiceText(voiceText);

        syncManager.addTriageSession({
          triage_id: triageSessionId || crypto.randomUUID(),
          device_id: syncManager.getDeviceId(),
          kader_id: syncManager.getKaderId(),
          patient_hash: patientHash,
          patient_age: selectedPatient?.age,
          patient_gender: selectedPatient?.gender,
          triage_level: result.triageLevel,
          conditions: result.conditions.length > 0
            ? result.conditions.map(c => ({
                condition: c.condition,
                confidence: c.confidence,
                triage_level: c.triageLevel,
              }))
            : [{ condition: 'tidak_ada', confidence: 0, triage_level: result.triageLevel }],
          triage_started_at: triageStartedAt || new Date().toISOString(),
          triage_completed_at: new Date().toISOString(),
          model_version: '1.0.0',
          app_version: '0.2.1',
          voice_text: sanitizedVoiceText,
        });

        // Try immediate sync (the sync manager has periodic sync too,
        // but this ensures data is sent ASAP)
        if (typeof window !== 'undefined' && navigator.onLine) {
          syncManager.syncNow().catch(() => {});
        }
      } catch (err) {
        console.warn('[Triage] Failed to add to sync:', err);
      }
    },
    [finishAnalysis, triageSessionId, triageStartedAt, selectedPatient, voiceText]
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
      // Use syncManager.syncNow() instead of direct POST to avoid double sync.
      // Data is already in Yjs (from handleAnalysisComplete).
      // syncManager will send any pending sessions to the API.
      if (typeof window !== 'undefined' && navigator.onLine) {
        await syncManager.syncNow();
      }

      try {
        syncManager.registerBackgroundSync();
      } catch { /* SW may not be ready */ }

      // Read actual status from sync manager
      const mgrStatus = syncManager.getStatus();
      if (mgrStatus === 'synced') {
        setSyncStatus('synced');
      } else if (mgrStatus === 'error') {
        setSyncStatus('error', 'Gagal sinkronisasi');
      } else {
        // If sync manager says idle but we couldn't start a proper sync,
        // assume synced (data is safe in Yjs/IndexedDB)
        setSyncStatus('synced');
      }
    } catch (err) {
      setSyncStatus('error', err instanceof Error ? err.message : 'Gagal sinkronisasi');
      console.warn('[Sync] Error:', err);
    }
  }, [setSyncStatus]);

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
