/**
 * MediSense AI — Voice Recognition Service
 *
 * Multi-engine voice-to-text untuk PWA offline-first.
 * - Online: Web Speech API (real-time, no model download)
 * - Offline: Vosk.js WASM (model ~20MB, downloaded once)
 * - Fallback: MediaRecorder + manual text (always available)
 *
 * @see docs/ML-DEPLOYMENT.md §Voice Analysis
 */

// ── Types ──────────────────────────────────────────────

export type VoiceEngine = 'web-speech' | 'vosk' | 'none';
export type VoiceState = 'idle' | 'recording' | 'processing' | 'done' | 'error';

export interface VoiceResult {
  text: string;
  engine: VoiceEngine;
  confidence?: number;
  durationMs: number;
}

export interface VoiceEngineStatus {
  engine: VoiceEngine;
  available: boolean;
  modelLoaded?: boolean;
  modelSize?: number;
}

// ── Vosk WASM Model Registry ──────────────────────────
// Vosk.js models: https://alphacephei.com/vosk/models
// Bahasa Indonesia model: vosk-model-small-id-0.4 (~22MB)

interface VoskModelInfo {
  code: string;
  label: string;
  url: string;
  sizeBytes: number;
}

const VOSK_MODELS: Record<string, VoskModelInfo> = {
  id: {
    code: 'id',
    label: 'Bahasa Indonesia',
    url: 'https://alphacephei.com/vosk/models/vosk-model-small-id-0.4.zip',
    sizeBytes: 22_000_000,
  },
  jv: {
    code: 'jv',
    label: 'Jawa',
    url: '',
    sizeBytes: 0,
  },
  su: {
    code: 'su',
    label: 'Sunda',
    url: '',
    sizeBytes: 0,
  },
};

// ── Storage key for Vosk model ─────────────────────────
const VOSK_MODEL_KEY = 'medisense_vosk_model';
const VOSK_LOADED_KEY = 'medisense_vosk_loaded';

// ── Voice Service Class ───────────────────────────────

class VoiceService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private speechRecognition: any = null;
  private isWebSpeechSupported = false;
  private voskReady = false;
  private state: VoiceState = 'idle';
  private stateListeners: Array<(state: VoiceState) => void> = [];
  private resultListeners: Array<(result: VoiceResult) => void> = [];
  private errorListeners: Array<(error: string) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      this.isWebSpeechSupported = !!SpeechRecognitionAPI;
      this.checkVoskModel();
    }
  }

  // ── State Management ──

  private setState(newState: VoiceState) {
    this.state = newState;
    this.stateListeners.forEach((fn) => fn(newState));
  }

  onStateChange(fn: (state: VoiceState) => void): () => void {
    this.stateListeners.push(fn);
    return () => {
      this.stateListeners = this.stateListeners.filter((l) => l !== fn);
    };
  }

  onResult(fn: (result: VoiceResult) => void): () => void {
    this.resultListeners.push(fn);
    return () => {
      this.resultListeners = this.resultListeners.filter((l) => l !== fn);
    };
  }

  onError(fn: (error: string) => void): () => void {
    this.errorListeners.push(fn);
    return () => {
      this.errorListeners = this.errorListeners.filter((l) => l !== fn);
    };
  }

  getState(): VoiceState {
    return this.state;
  }

  // ── Engine Status ──

  getEngineStatus(): VoiceEngineStatus[] {
    return [
      {
        engine: 'web-speech',
        available: this.isWebSpeechSupported && navigator.onLine,
      },
      {
        engine: 'vosk',
        available: this.voskReady,
        modelLoaded: this.voskReady,
        modelSize: VOSK_MODELS.id.sizeBytes,
      },
      {
        engine: 'none',
        available: true,
      },
    ];
  }

  getBestEngine(): VoiceEngine {
    if (this.isWebSpeechSupported && navigator.onLine) return 'web-speech';
    if (this.voskReady) return 'vosk';
    return 'none';
  }

  // ── Web Speech API ──

  private async startWebSpeech(lang: string = 'id-ID'): Promise<void> {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      throw new Error('Web Speech API tidak didukung browser ini');
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = lang === 'id' ? 'id-ID' : lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let finalText = '';
    const startTime = Date.now();

    let silenceTimer: ReturnType<typeof setTimeout> | null = null;
    const SILENCE_TIMEOUT_MS = 10000;
    let lastResultTime = Date.now();

    recognition.onresult = (event: any) => {
      lastResultTime = Date.now();

      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
      silenceTimer = setTimeout(() => {
        console.log('[Voice] Silence timeout — auto-stopping');
        if (this.speechRecognition) {
          this.speechRecognition.stop();
        }
      }, SILENCE_TIMEOUT_MS);

      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcript;
        } else {
          interimText += transcript;
        }
      }

      const currentText = finalText + interimText;
      if (currentText.trim()) {
        this.resultListeners.forEach((fn) =>
          fn({
            text: currentText.trim(),
            engine: 'web-speech',
            durationMs: Date.now() - startTime,
          })
        );
      }
    };

    recognition.onerror = (event: any) => {
      console.error('[Voice] Web Speech error:', event.error);
      this.errorListeners.forEach((fn) =>
        fn(`Error pengenalan suara: ${event.error}`)
      );
      this.setState('error');
    };

    recognition.onend = () => {
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        silenceTimer = null;
      }
      if (this.state === 'recording') {
        this.setState('done');
      }
    };

    this.speechRecognition = recognition;
    recognition.start();

    silenceTimer = setTimeout(() => {
      console.log('[Voice] No speech detected — auto-stopping');
      if (this.speechRecognition) {
        this.speechRecognition.stop();
      }
    }, SILENCE_TIMEOUT_MS);
  }

  private stopWebSpeech(): string {
    if (this.speechRecognition) {
      this.speechRecognition.stop();
      this.speechRecognition = null;
    }
    return '';
  }

  // ── Vosk.js Integration ──

  private async checkVoskModel(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      const stored = localStorage.getItem(VOSK_LOADED_KEY);
      this.voskReady = stored === 'true';
      return this.voskReady;
    } catch {
      this.voskReady = false;
      return false;
    }
  }

  async prepareVoskModel(lang: string = 'id'): Promise<boolean> {
    const model = VOSK_MODELS[lang] || VOSK_MODELS.id;
    if (!model.url) {
      console.warn(`[Voice] Model untuk ${lang} belum tersedia`);
      return false;
    }

    try {
      this.setState('processing');

      const cache = await caches.open('medisense-vosk-models');
      const cachedResponse = await cache.match(model.url);
      if (cachedResponse) {
        this.voskReady = true;
        localStorage.setItem(VOSK_LOADED_KEY, 'true');
        this.setState('idle');
        return true;
      }

      console.log(`[Voice] Downloading Vosk model (${(model.sizeBytes / 1e6).toFixed(1)}MB)...`);
      const response = await fetch(model.url, { mode: 'cors' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      await cache.put(model.url, response);
      this.voskReady = true;
      localStorage.setItem(VOSK_LOADED_KEY, 'true');

      console.log('[Voice] Vosk model ready for offline use');
      this.setState('idle');
      return true;
    } catch (error) {
      console.warn('[Voice] Failed to prepare Vosk model:', error);
      this.voskReady = false;
      this.setState('idle');
      return false;
    }
  }

  getVoskModelStatus(): { downloaded: boolean; sizeMB: number } {
    return {
      downloaded: this.voskReady,
      sizeMB: VOSK_MODELS.id.sizeBytes / 1_000_000,
    };
  }

  // ── MediaRecorder Fallback ──

  private async startMediaRecording(): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.audioChunks = [];
    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType: MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4',
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      this.stream?.getTracks().forEach((t) => t.stop());
      this.stream = null;
    };

    this.mediaRecorder.start(100);
  }

  private stopMediaRecording(): Blob | null {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    if (this.audioChunks.length === 0) return null;

    const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
    return new Blob(this.audioChunks, { type: mimeType });
  }

  // ── Public API ──

  async startRecording(lang: string = 'id'): Promise<void> {
    if (this.state === 'recording') return;

    this.setState('recording');
    this.audioChunks = [];

    try {
      const engine = this.getBestEngine();

      if (engine === 'web-speech') {
        await this.startWebSpeech(lang);
      } else if (engine === 'vosk') {
        await this.startMediaRecording();
        console.log('[Voice] Using MediaRecorder (Vosk processing pending)');
      } else {
        await this.startMediaRecording();
      }
    } catch (error) {
      console.error('[Voice] Failed to start recording:', error);
      this.setState('error');
      this.errorListeners.forEach((fn) =>
        fn(`Gagal memulai rekaman: ${(error as Error).message}`)
      );
    }
  }

  async stopRecording(): Promise<VoiceResult | null> {
    const startTime = Date.now();

    if (this.state !== 'recording') return null;

    if (this.speechRecognition) {
      this.stopWebSpeech();
      this.setState('done');
      return null;
    }

    const audioBlob = this.stopMediaRecording();

    if (!audioBlob) {
      this.setState('idle');
      return null;
    }

    this.setState('processing');

    const durationMs = Date.now() - startTime;

    this.setState('done');
    return {
      text: '',
      engine: this.getBestEngine() === 'vosk' ? 'vosk' : 'none',
      durationMs,
    };
  }

  cancelRecording(): void {
    if (this.speechRecognition) {
      this.stopWebSpeech();
    }
    this.stopMediaRecording();
    this.audioChunks = [];
    this.setState('idle');
  }

  async checkMicrophonePermission(): Promise<boolean> {
    try {
      const permission = await navigator.permissions.query({
        name: 'microphone' as PermissionName,
      });
      return permission.state === 'granted';
    } catch {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
        return true;
      } catch {
        return false;
      }
    }
  }

  async requestMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      return true;
    } catch {
      return false;
    }
  }

  dispose(): void {
    this.cancelRecording();
    this.stateListeners = [];
    this.resultListeners = [];
    this.errorListeners = [];
  }
}

// ── Singleton Export ──────────────────────────────────

export const voiceService = new VoiceService();
export default voiceService;