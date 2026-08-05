'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, SkipForward, ChevronDown, Check, Loader2, AlertCircle, Download, WifiOff } from 'lucide-react';
import ProgressStepper from '@/components/ui/progress-stepper';
import { useTriageStore } from '@/store/triage-store';
import voiceService from '@/lib/voice';
import { useT, translateErrorMessage } from '@/lib/i18n/use-t';

/* ── Step 3/5 — Input Suara (Vosk.js + Web Speech API) ─ */
/* DESAIN: DESIGN.md §7.4 — Tombol mic besar + transkripsi  */
/* OFFLINE: Vosk.js WASM (model ~22MB) via Cache API        */
/* ONLINE: Web Speech API (real-time, akurasi lebih tinggi)  */

const LANGUAGES = [
  { code: 'id', labelKey: 'voice.langId', speechLang: 'id-ID' },
  { code: 'jv', labelKey: 'voice.langJv', speechLang: 'jv-ID' },
  { code: 'su', labelKey: 'voice.langSu', speechLang: 'su-ID' },
];

export default function StepVoice({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const { t } = useT();
  const { voiceText, setVoiceText } = useTriageStore();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualText, setManualText] = useState('');
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [engineCode, setEngineCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const [voskStatus, setVoskStatus] = useState<{ downloaded: boolean; sizeMB: number } | null>(null);
  const [isDownloadingModel, setIsDownloadingModel] = useState(false);
  // Reaktif terhadap status jaringan (hydration-safe: jangan baca navigator.onLine di render)
  const [isOnline, setIsOnline] = useState(true);
  const resultUnsubscribe = useRef<(() => void) | null>(null);
  const stateUnsubscribe = useRef<(() => void) | null>(null);
  const errorUnsubscribe = useRef<(() => void) | null>(null);

  useEffect(() => {
    voiceService.checkMicrophonePermission().then(setMicPermission);
    setVoskStatus(voiceService.getVoskModelStatus());
  }, []);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    stateUnsubscribe.current = voiceService.onStateChange((state) => {
      setIsRecording(state === 'recording');
      setIsProcessing(state === 'processing');
    });

    resultUnsubscribe.current = voiceService.onResult((result) => {
      // result.text sudah berisi FULL accumulated text (final + interim)
      // Jangan APPEND, karena event onresult mengirim seluruh teks setiap kali
      setTranscription(result.text);
      setEngineCode(result.engine === 'vosk' ? 'vosk' : 'web-speech');
    });

    errorUnsubscribe.current = voiceService.onError((msg) => {
      setError(msg);
    });

    return () => {
      stateUnsubscribe.current?.();
      resultUnsubscribe.current?.();
      errorUnsubscribe.current?.();
    };
  }, []);

  const handleRecord = useCallback(async () => {
    setError(null);

    if (isRecording) {
      voiceService.cancelRecording();
      setIsRecording(false);
      return;
    }

    try {
      if (!micPermission) {
        const granted = await voiceService.requestMicrophonePermission();
        setMicPermission(granted);
        if (!granted) {
          setError('Izin mikrofon diperlukan. Izinkan akses mikrofon di pengaturan browser.');
          return;
        }
      }

      setTranscription('');
      setEngineCode('');

      const engine = voiceService.getBestEngine();
      if (engine === 'none' && !isOnline) {
        if (voskStatus && !voskStatus.downloaded) {
          setError('Mode offline: unduh model suara terlebih dahulu');
          return;
        }
      }

      await voiceService.startRecording(selectedLang.code);
    } catch (err) {
      setError(`Gagal memulai rekaman: ${(err as Error).message}`);
    }
  }, [isRecording, micPermission, selectedLang, voskStatus, isOnline]);

  const handleUseText = useCallback(() => {
    const text = transcription || manualText.trim();
    if (text) {
      setVoiceText(text);
    }
    onNext();
  }, [transcription, manualText, setVoiceText, onNext]);

  const handleSkip = useCallback(() => {
    voiceService.cancelRecording();
    setVoiceText(null);
    onSkip();
  }, [setVoiceText, onSkip]);

  const handleDownloadModel = useCallback(async () => {
    setIsDownloadingModel(true);
    setError(null);
    try {
      const success = await voiceService.prepareVoskModel(selectedLang.code);
      if (success) {
        setVoskStatus(voiceService.getVoskModelStatus());
      } else {
        setError('Gagal mengunduh model suara. Coba lagi nanti.');
      }
    } catch {
      setError('Gagal mengunduh model suara.');
    } finally {
      setIsDownloadingModel(false);
    }
  }, [selectedLang]);

  return (
    <div className="flex flex-col min-h-[70vh]">
      <ProgressStepper currentStep={3} className="mb-6" />

      <h2 className="text-xl font-semibold text-text-primary mb-1">
        {t('voice.title')}
      </h2>
      <p className="text-sm text-text-secondary mb-6">
        {t('voice.subtitle')}
      </p>

      {engineCode && (
        <div className="flex items-center justify-center gap-1 mb-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-accent-bg text-accent font-medium">
            {engineCode === 'vosk' ? t('voice.engineOffline') : t('voice.engineOnline')}
          </span>
        </div>
      )}

      <div className="flex flex-col items-center mb-8">
        <button
          onClick={handleRecord}
          disabled={isProcessing}
          className={`
            w-24 h-24 rounded-full flex items-center justify-center transition-all
            ${isRecording
              ? 'bg-merah text-white scale-110 shadow-lg shadow-red-500/30 animate-pulse'
              : isProcessing
              ? 'bg-gray-200 text-gray-400 cursor-wait'
              : 'bg-white border-2 border-border text-text-primary hover:border-accent hover:text-accent'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          aria-label={isRecording ? t('voice.micStopAria') : t('voice.micStartAria')}
        >
          {isProcessing ? (
            <Loader2 className="w-10 h-10 animate-spin" />
          ) : (
            <Mic className={`w-10 h-10 ${isRecording ? 'animate-pulse' : ''}`} strokeWidth={isRecording ? 2.5 : 2} />
          )}
        </button>

        <p className="mt-3 text-sm font-medium text-text-secondary">
          {isRecording ? t('voice.stateRecording') : isProcessing ? t('voice.stateProcessing') : t('voice.pressAndTalk')}
        </p>

        {isRecording && (
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-merah animate-pulse" />
            <span className="text-xs text-merah font-medium">{t('voice.recordingLive')}</span>
          </div>
        )}
      </div>

      <div className="relative mb-6">
        <button
          onClick={() => setShowLangPicker(!showLangPicker)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-surface text-sm text-text-primary mx-auto"
        >
          <span>{t('voice.langPrefix', { name: t(selectedLang.labelKey) })}</span>
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
                {t(lang.labelKey)}
              </button>
            ))}
          </div>
        )}
      </div>

      {transcription && (
        <div className="mb-6 p-4 rounded-xl bg-accent-bg border border-accent/20 animate-fade-in">
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-accent mt-0.5 shrink-0" />
            <p className="text-sm text-text-primary leading-relaxed">
              {transcription}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 animate-fade-in">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-merah mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{translateErrorMessage(t, error)}</p>
              {/* Tombol unduh model hanya berguna saat online — saat offline,
                  notice manajemen model di bawah yang memberi penjelasan */}
              {error.includes('unduh model') && isOnline && (
                <button
                  onClick={handleDownloadModel}
                  disabled={isDownloadingModel}
                  className="mt-2 flex items-center gap-2 text-sm font-medium text-accent hover:underline disabled:opacity-50"
                >
                  {isDownloadingModel ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {isDownloadingModel ? t('voice.downloading') : t('voice.downloadModel', { size: voskStatus?.sizeMB ?? 22 })}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manajemen model suara offline — selalu terlihat, apa pun status jaringan.
          Unduhan butuh internet (persiapan saat online), lalu model dipakai offline. */}
      {voskStatus &&
        (voskStatus.downloaded ? (
          <div className="mb-6 p-3 rounded-xl bg-green-50 border border-green-200 flex items-center gap-2">
            <Check className="w-4 h-4 text-green-700 shrink-0" />
            <p className="text-xs text-green-800">{t('voice.modelReady')}</p>
          </div>
        ) : (
          <div className="mb-6 p-4 rounded-xl bg-yellow-50 border border-yellow-200">
            <p className="text-sm font-semibold text-yellow-800">{t('voice.modelTitle')}</p>
            <p className="text-xs text-yellow-800 mt-1">
              {t('voice.modelDesc', { size: voskStatus.sizeMB })}
            </p>
            {isOnline ? (
              <button
                onClick={handleDownloadModel}
                disabled={isDownloadingModel}
                className="mt-3 w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all touch-target"
              >
                {isDownloadingModel ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {isDownloadingModel ? t('voice.downloading') : t('voice.downloadModel', { size: voskStatus.sizeMB })}
              </button>
            ) : (
              <p className="mt-3 flex items-center gap-2 text-xs font-medium text-yellow-800">
                <WifiOff className="w-4 h-4 shrink-0" />
                {t('voice.needOnline')}
              </p>
            )}
          </div>
        ))}

      <div className="mb-6">
        <label className="block text-sm font-medium text-text-primary mb-2">
          {t('voice.manualLabel')}
        </label>
        <textarea
          value={manualText}
          onChange={(e) => setManualText(e.target.value)}
          placeholder={t('voice.manualPlaceholder')}
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-border text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent resize-none text-sm"
        />
      </div>

      <div className="flex-1" />

      <div className="flex flex-col gap-3">
        <button
          onClick={handleUseText}
          disabled={!manualText.trim() && !transcription}
          className="w-full py-4 bg-primary text-white text-lg font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-[0.98] transition-all touch-target"
        >
          {t('voice.useText')}
        </button>

        <button
          onClick={handleSkip}
          className="w-full py-3 flex items-center justify-center gap-2 text-text-secondary font-medium hover:text-text-primary transition-colors touch-target"
        >
          <SkipForward className="w-4 h-4" />
          <span>{t('voice.skip')}</span>
        </button>
      </div>
    </div>
  );
}