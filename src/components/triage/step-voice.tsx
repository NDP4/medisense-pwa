'use client';

import { useState, useRef } from 'react';
import { Mic, SkipForward, ChevronDown } from 'lucide-react';
import ProgressStepper from '@/components/ui/progress-stepper';
import { useTriageStore } from '@/store/triage-store';

/* ── Step 3/5 — Input Suara (Opsional) ──────────────── */
/* DESIGN.md §7.4 — Tombol mic besar, language selector   */
/* Catatan: Vosk.js akan diintegrasikan di milestone lanjut */
/* Untuk MVP: gunakan fallback text input                  */

const LANGUAGES = [
  { code: 'id', label: 'Indonesia' },
  { code: 'jv', label: 'Jawa' },
  { code: 'su', label: 'Sunda' },
];

export default function StepVoice({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const { voiceText, setVoiceText } = useTriageStore();
  const [isRecording, setIsRecording] = useState(false);
  const [manualText, setManualText] = useState('');
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [transcription, setTranscription] = useState('');
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  const handleRecord = async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorder.current?.stop();
      setIsRecording(false);

      // Simulate transcription delay
      setTimeout(() => {
        const simulatedText = 'Demam sejak 3 hari, batuk, dan sesak napas';
        setTranscription(simulatedText);
        setVoiceText(simulatedText);
      }, 1500);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorder.current = recorder;
      recorder.start();
      setIsRecording(true);

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
      };
    } catch {
      // Mic not available — fallback to manual text
      setTranscription('');
    }
  };

  const handleUseText = () => {
    if (manualText.trim()) {
      setVoiceText(manualText.trim());
    }
    onNext();
  };

  const handleSkip = () => {
    setVoiceText(null);
    onSkip();
  };

  return (
    <div className="flex flex-col min-h-[70vh]">
      {/* Progress */}
      <ProgressStepper currentStep={3} className="mb-6" />

      {/* Title */}
      <h2 className="text-xl font-semibold text-text-primary mb-1">
        Tambahkan suara (opsional)
      </h2>
      <p className="text-sm text-text-secondary mb-6">
        Ceritakan keluhan dengan bahasa yang nyaman
      </p>

      {/* Mic Button */}
      <div className="flex flex-col items-center mb-8">
        <button
          onClick={handleRecord}
          className={`
            w-24 h-24 rounded-full flex items-center justify-center transition-all
            ${isRecording
              ? 'bg-merah text-white scale-110 shadow-lg shadow-red-500/30'
              : 'bg-white border-2 border-border text-text-primary hover:border-accent hover:text-accent'
            }
          `}
          aria-label={isRecording ? 'Berhenti merekam' : 'Mulai merekam'}
        >
          <Mic className="w-10 h-10" strokeWidth={isRecording ? 2.5 : 2} />
        </button>

        <p className="mt-3 text-sm font-medium text-text-secondary">
          {isRecording ? 'Rekam... Ketuk untuk berhenti' : 'Tekan & Bicara'}
        </p>

        {/* Recording indicator */}
        {isRecording && (
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-merah animate-pulse" />
            <span className="text-xs text-merah font-medium">Merekam...</span>
          </div>
        )}
      </div>

      {/* Language Selector */}
      <div className="relative mb-6">
        <button
          onClick={() => setShowLangPicker(!showLangPicker)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-surface text-sm text-text-primary mx-auto"
        >
          <span>Bahasa: {selectedLang.label}</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {showLangPicker && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-surface border border-border rounded-xl shadow-lg z-10 overflow-hidden">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setSelectedLang(lang);
                  setShowLangPicker(false);
                }}
                className={`block w-full px-6 py-3 text-sm text-left hover:bg-muted ${
                  selectedLang.code === lang.code ? 'bg-accent-bg text-accent font-medium' : 'text-text-primary'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Transcription / Manual text */}
      {transcription && (
        <div className="mb-6 p-4 rounded-xl bg-accent-bg border border-accent/20 animate-fade-in">
          <p className="text-sm text-text-primary leading-relaxed">
            {transcription}
          </p>
        </div>
      )}

      {/* Manual text input (fallback) */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-text-primary mb-2">
          Atau ketik keluhan secara manual
        </label>
        <textarea
          value={manualText}
          onChange={(e) => setManualText(e.target.value)}
          placeholder="Contoh: Saya demam sejak 3 hari yang lalu, batuk berdahak, dan sesak napas..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-border text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent resize-none text-sm"
        />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Action buttons */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleUseText}
          disabled={!manualText.trim() && !transcription}
          className="w-full py-4 bg-primary text-white text-lg font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-[0.98] transition-all touch-target"
        >
          Gunakan Teks Ini
        </button>

        <button
          onClick={handleSkip}
          className="w-full py-3 flex items-center justify-center gap-2 text-text-secondary font-medium hover:text-text-primary transition-colors touch-target"
        >
          <SkipForward className="w-4 h-4" />
          <span>Lewati</span>
        </button>
      </div>
    </div>
  );
}
