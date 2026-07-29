'use client';

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

/* ── Triage Zustand Store ───────────────────────────── */
/* Mengelola state keseluruhan alur triase 5 langkah      */

// ── Types ──────────────────────────────────────────────

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 0 | 1;
  avatar?: string; // emoji avatar
  relation: string; // "Diri Sendiri" | "Anak" | "Ibu" | "Ayah" | "Kakek" | "Nenek" | "Lainnya"
}

export interface VitalSigns {
  heart_rate?: number;
  respiratory_rate?: number;
  temperature?: number;
  spo2?: number;
  systolic_bp?: number;
  diastolic_bp?: number;
}

export interface SymptomDef {
  id: string;
  label: string;
  featureIndex: number; // index in the 23-feature array
  category: 'symptom' | 'vital' | 'demographic';
}

export interface TriageCondition {
  condition: string;
  label: string;
  confidence: number;
  triageLevel: 'hijau' | 'kuning' | 'merah';
}

export interface TriageResult {
  triageLevel: 'hijau' | 'kuning' | 'merah';
  triageLabel: string;
  conditions: TriageCondition[];
  recommendations: string[];
  timestamp: string;
}

export type TriageStep = 1 | 2 | 3 | 4 | 5;
export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

// ── State ──────────────────────────────────────────────

interface TriageState {
  // Step
  currentStep: TriageStep;

  // Patient
  selectedPatient: Patient | null;

  // Symptoms (feature indices that are active/selected)
  selectedSymptoms: Set<number>;

  // Vital signs (optional)
  vitalSigns: VitalSigns;

  // Voice
  voiceText: string | null;

  // Analysis state
  isAnalyzing: boolean;
  analysisProgress: number; // 0-100

  // Result
  result: TriageResult | null;

  // Sync
  syncStatus: SyncStatus;
  syncError: string | null;

  // Triage session ID
  triageSessionId: string | null;
  triageStartedAt: string | null;

  // History (cached locally)
  history: TriageResult[];

  // ── Actions ──
  setStep: (step: TriageStep) => void;
  nextStep: () => void;
  prevStep: () => void;

  selectPatient: (patient: Patient) => void;

  toggleSymptom: (featureIndex: number) => void;
  setVitalSign: (key: keyof VitalSigns, value: number | undefined) => void;
  clearSymptoms: () => void;

  setVoiceText: (text: string | null) => void;

  startAnalysis: () => void;
  setAnalysisProgress: (progress: number) => void;
  finishAnalysis: (result: TriageResult) => void;

  setSyncStatus: (status: SyncStatus, error?: string) => void;

  resetTriage: () => void;
  addToHistory: (result: TriageResult) => void;
}

// ── Symptom Definitions ────────────────────────────────
// Indexes into the 23-feature model input array
// See: docs/ML-DEPLOYMENT.md for feature order

export const SYMPTOM_DEFS: SymptomDef[] = [
  { id: 'fever', label: 'Demam Tinggi', featureIndex: 16, category: 'symptom' },
  { id: 'cough', label: 'Batuk', featureIndex: 17, category: 'symptom' },
  { id: 'dyspnea', label: 'Sesak Napas', featureIndex: 18, category: 'symptom' },
  { id: 'confusion', label: 'Kebingungan', featureIndex: 19, category: 'symptom' },
  { id: 'chest_pain', label: 'Nyeri Dada', featureIndex: 20, category: 'symptom' },
  { id: 'diarrhea', label: 'Diare', featureIndex: 21, category: 'symptom' },
  { id: 'cyanosis', label: 'Kebiruan', featureIndex: 22, category: 'symptom' },
];

// Default patients for quick selection
export const DEFAULT_PATIENTS: Patient[] = [
  { id: 'self', name: 'Diri Sendiri', age: 30, gender: 0, avatar: '👤', relation: 'Diri Sendiri' },
  { id: 'child', name: 'Anak', age: 2, gender: 0, avatar: '👶', relation: 'Anak' },
  { id: 'mother', name: 'Ibu', age: 50, gender: 0, avatar: '👩', relation: 'Ibu' },
  { id: 'father', name: 'Ayah', age: 55, gender: 1, avatar: '👨', relation: 'Ayah' },
];

// ── Triage Configuration ───────────────────────────────
export const TRIAGE_THRESHOLDS = {
  MERAH: 0.7,
  KUNING: 0.3,
} as const;

export function getTriageLevel(maxProb: number): 'hijau' | 'kuning' | 'merah' {
  if (maxProb > TRIAGE_THRESHOLDS.MERAH) return 'merah';
  if (maxProb > TRIAGE_THRESHOLDS.KUNING) return 'kuning';
  return 'hijau';
}

export function getTriageLabel(level: 'hijau' | 'kuning' | 'merah'): string {
  switch (level) {
    case 'hijau': return 'AMAN';
    case 'kuning': return 'WASPADA';
    case 'merah': return 'DARURAT';
  }
}

// Recommendations based on triage level and conditions
export function getRecommendations(level: 'hijau' | 'kuning' | 'merah', conditions: string[]): string[] {
  const base: string[] = [];

  if (level === 'hijau') {
    base.push('Istirahat yang cukup dan perbanyak minum air putih');
    base.push('Pantau gejala dalam 24 jam ke depan');
    base.push('Jika memburuk, segera ke Puskesmas terdekat');
  } else if (level === 'kuning') {
    base.push('Rujuk ke Puskesmas dalam waktu 24 jam');
    if (conditions.includes('pneumonia_balita')) {
      base.push('Pantau napas anak — jika sesak memburuk, segera ke IGD');
    }
    if (conditions.includes('sepsis')) {
      base.push('Waspada tanda bahaya: demam tinggi tidak turun, napas cepat, tubuh lemas');
    }
    base.push('Jangan berikan obat tanpa resep dokter');
    base.push('Bawa hasil triase ini saat ke Puskesmas');
  } else {
    base.push('SEGERA hubungi 119 atau layanan darurat terdekat!');
    if (conditions.includes('sepsis')) {
      base.push('Tanda bahaya sepsis: demam tinggi, napas cepat, kebingungan');
    }
    if (conditions.includes('pneumonia_balita')) {
      base.push('Tanda bahaya pneumonia balita: tarikan dinding dada, napas cepat');
    }
    base.push('Jangan menunggu — setiap menit sangat berharga');
    base.push('Bawa pasien ke fasilitas kesehatan terdekat sambil menunggu ambulans');
  }

  return base;
}

// ── Store Implementation ───────────────────────────────

export const useTriageStore = create<TriageState>((set, get) => ({
  // Initial state
  currentStep: 1,
  selectedPatient: null,
  selectedSymptoms: new Set<number>(),
  vitalSigns: {},
  voiceText: null,
  isAnalyzing: false,
  analysisProgress: 0,
  result: null,
  syncStatus: 'idle',
  syncError: null,
  triageSessionId: null,
  triageStartedAt: null,
  history: [],

  // ── Step Navigation ──
  setStep: (step) => set({ currentStep: step }),

  nextStep: () => {
    const { currentStep } = get();
    if (currentStep < 5) {
      set({ currentStep: (currentStep + 1) as TriageStep });
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 1) {
      set({ currentStep: (currentStep - 1) as TriageStep });
    }
  },

  // ── Patient ──
  selectPatient: (patient) => set({ selectedPatient: patient }),

  // ── Symptoms ──
  toggleSymptom: (featureIndex) => {
    const selected = new Set(get().selectedSymptoms);
    if (selected.has(featureIndex)) {
      selected.delete(featureIndex);
    } else {
      selected.add(featureIndex);
    }
    set({ selectedSymptoms: selected });
  },

  setVitalSign: (key, value) => {
    set({ vitalSigns: { ...get().vitalSigns, [key]: value } });
  },

  clearSymptoms: () => set({ selectedSymptoms: new Set(), vitalSigns: {} }),

  // ── Voice ──
  setVoiceText: (text) => set({ voiceText: text }),

  // ── Analysis ──
  startAnalysis: () => {
    set({
      isAnalyzing: true,
      analysisProgress: 0,
      result: null,
      triageSessionId: uuidv4(),
      triageStartedAt: new Date().toISOString(),
    });

    // Simulate progress
    const interval = setInterval(() => {
      const { analysisProgress, isAnalyzing } = get();
      if (!isAnalyzing) {
        clearInterval(interval);
        return;
      }
      if (analysisProgress < 90) {
        const increment = Math.random() * 15 + 5;
        set({ analysisProgress: Math.min(90, analysisProgress + increment) });
      }
    }, 400);
  },

  setAnalysisProgress: (progress) => set({ analysisProgress: progress }),

  finishAnalysis: (result) => {
    set({
      isAnalyzing: false,
      analysisProgress: 100,
      result,
      currentStep: 5,
    });
    get().addToHistory(result);
  },

  // ── Sync ──
  setSyncStatus: (status, error) =>
    set({ syncStatus: status, syncError: error || null }),

  // ── Reset ──
  resetTriage: () => {
    set({
      currentStep: 1,
      selectedPatient: null,
      selectedSymptoms: new Set(),
      vitalSigns: {},
      voiceText: null,
      isAnalyzing: false,
      analysisProgress: 0,
      result: null,
      syncStatus: 'idle',
      syncError: null,
      triageSessionId: null,
      triageStartedAt: null,
    });
  },

  // ── History ──
  addToHistory: (result) => {
    const history = [result, ...get().history].slice(0, 50); // keep last 50
    set({ history });
  },
}));
