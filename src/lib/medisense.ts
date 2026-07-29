/**
 * MediSense AI — TF.js Model Loader & Inference Engine
 * 
 * Loads the triage model (TF.js GraphModel) and runs preprocessing + inference
 * 100% on-device via WebGL/WASM backend. No server calls for triage.
 * 
 * Usage:
 *   const engine = MedisenseEngine.getInstance();
 *   await engine.load();
 *   const result = await engine.predict({
 *     age: 58, gender: 1, bmi: 24,
 *     heart_rate: 112, respiratory_rate: 26,
 *     systolic_bp: 88, diastolic_bp: 55,
 *     temperature: 39.2, spo2: 93,
 *     wbc: 18.5, hemoglobin: 12, platelet: 180,
 *     creatinine: 1.8, glucose: 140, sodium: 136,
 *     bicarbonate: 19,
 *     fever: 1, cough: 1, dyspnea: 1,
 *     confusion: 1, chest_pain: 0, diarrhea: 0, cyanosis: 0
 *   });
 *   // result = { sepsis: 0.94, pneumonia: 0.12, triageColor: 'MERAH' }
 */

import * as tf from '@tensorflow/tfjs';

// Preprocessing contract — extracted from Python StandardScaler training
// DO NOT MODIFY — must match Python preprocessing exactly
const PREPROCESSING_CONTRACT: {
  inputFeatures: readonly string[];
  outputLabels: readonly string[];
  scaler: { mean: number[] | null; scale: number[] | null };
  modelPath: string;
} = {
  inputFeatures: [
    'age', 'gender', 'bmi', 'heart_rate', 'respiratory_rate',
    'systolic_bp', 'diastolic_bp', 'temperature', 'spo2',
    'wbc', 'hemoglobin', 'platelet', 'creatinine', 'glucose',
    'sodium', 'bicarbonate',
    'fever', 'cough', 'dyspnea', 'confusion', 'chest_pain', 'diarrhea', 'cyanosis'
  ],
  outputLabels: ['sepsis', 'pneumonia_balita'],
  scaler: {
    mean: null as number[] | null,
    scale: null as number[] | null,
  },
  modelPath: '/models/medisense_model_tfjs/model.json',
};

export type RawInput = {
  age: number;
  gender: number;
  bmi: number;
  heart_rate: number;
  respiratory_rate: number;
  systolic_bp: number;
  diastolic_bp: number;
  temperature: number;
  spo2: number;
  wbc: number;
  hemoglobin: number;
  platelet: number;
  creatinine: number;
  glucose: number;
  sodium: number;
  bicarbonate: number;
  fever: number;
  cough: number;
  dyspnea: number;
  confusion: number;
  chest_pain: number;
  diarrhea: number;
  cyanosis: number;
};

export type TriageProbability = {
  sepsis: number;
  pneumonia_balita: number;
};

export type TriageColor = 'HIJAU' | 'KUNING' | 'MERAH';

export type PredictionResult = TriageProbability & {
  triageColor: TriageColor;
  maxProbability: number;
};

export class MedisenseEngine {
  private static instance: MedisenseEngine;
  private model: tf.GraphModel | null = null;
  private loaded = false;

  private constructor() {}

  static getInstance(): MedisenseEngine {
    if (!MedisenseEngine.instance) {
      MedisenseEngine.instance = new MedisenseEngine();
    }
    return MedisenseEngine.instance;
  }

  /**
   * Load TF.js model and preprocessing parameters.
   * Call once at app startup (or when first needed).
   */
  async load(): Promise<void> {
    if (this.loaded) return;

    try {
      await tf.ready();
      console.log(`[Medisense] TF.js backend: ${tf.getBackend()}`);

      this.model = await tf.loadGraphModel(PREPROCESSING_CONTRACT.modelPath);
      console.log('[Medisense] Model loaded successfully');

      const response = await fetch('/preprocessing_contract.json');
      if (response.ok) {
        const contract = await response.json();
        PREPROCESSING_CONTRACT.scaler.mean = contract.scaler_mean;
        PREPROCESSING_CONTRACT.scaler.scale = contract.scaler_scale;
      } else {
        console.warn('[Medisense] Fallback: using built-in scaler params');
        PREPROCESSING_CONTRACT.scaler.mean = [28.8165, 0.4992, 23.8763, 109.5186, 28.5026, 97.1396, 62.5682, 38.26536, 94.7042, 13.00454, 12.79188, 248.3806, 1.01922, 107.7912, 138.7714, 22.0103, 0.6144, 0.4436, 0.4926, 0.209, 0.148, 0.1446, 0.0936];
        PREPROCESSING_CONTRACT.scaler.scale = [26.607916, 0.499999, 4.996488, 28.182428, 12.465103, 19.218629, 14.345206, 1.147679, 3.860764, 6.428632, 1.790924, 74.770487, 0.7091, 25.858237, 3.420518, 2.835578, 0.486737, 0.496809, 0.499945, 0.406594, 0.3551, 0.351697, 0.291271];
      }

      this.loaded = true;
    } catch (error) {
      console.error('[Medisense] Failed to load model:', error);
      throw error;
    }
  }

  /**
   * Convert raw input object to normalized feature array in the correct order.
   * Must match Python preprocessing EXACTLY.
   */
  private preprocess(input: RawInput): number[] {
    const raw: number[] = [
      input.age, input.gender, input.bmi,
      input.heart_rate, input.respiratory_rate,
      input.systolic_bp, input.diastolic_bp,
      input.temperature, input.spo2,
      input.wbc, input.hemoglobin, input.platelet,
      input.creatinine, input.glucose, input.sodium, input.bicarbonate,
      input.fever, input.cough, input.dyspnea,
      input.confusion, input.chest_pain, input.diarrhea, input.cyanosis
    ];

    const mean = PREPROCESSING_CONTRACT.scaler.mean!;
    const scale = PREPROCESSING_CONTRACT.scaler.scale!;

    return raw.map((val, i) => (val - mean[i]) / scale[i]);
  }

  /**
   * Run triage inference on a single patient.
   * Returns probability for each condition + triage color.
   */
  async predict(input: RawInput): Promise<PredictionResult> {
    if (!this.model || !this.loaded) {
      throw new Error('[Medisense] Model not loaded. Call load() first.');
    }

    const normalized = this.preprocess(input);
    const inputTensor = tf.tensor2d([normalized], [1, 23]);

    try {
      const outputTensor = this.model.predict(inputTensor) as tf.Tensor;
      const probs = await outputTensor.data();

      const sepsis = probs[0];
      const pneumonia = probs[1];
      const maxProbability = Math.max(sepsis, pneumonia);

      let triageColor: TriageColor;
      if (maxProbability > 0.7) {
        triageColor = 'MERAH';
      } else if (maxProbability > 0.3) {
        triageColor = 'KUNING';
      } else {
        triageColor = 'HIJAU';
      }

      return { sepsis, pneumonia_balita: pneumonia, triageColor, maxProbability };
    } finally {
      inputTensor.dispose();
    }
  }

  /**
   * Warm up model with a dummy inference call.
   * Call after load() to reduce latency on first real prediction.
   */
  async warmup(): Promise<void> {
    const dummy: RawInput = {
      age: 35, gender: 0, bmi: 24,
      heart_rate: 75, respiratory_rate: 16,
      systolic_bp: 120, diastolic_bp: 80,
      temperature: 36.8, spo2: 98,
      wbc: 7.5, hemoglobin: 14, platelet: 250,
      creatinine: 0.9, glucose: 95, sodium: 140, bicarbonate: 24,
      fever: 0, cough: 0, dyspnea: 0,
      confusion: 0, chest_pain: 0, diarrhea: 0, cyanosis: 0
    };
    await this.predict(dummy);
    console.log('[Medisense] Warmup complete');
  }

  /**
   * Dispose model and free GPU/WebGL memory.
   */
  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
      this.loaded = false;
      console.log('[Medisense] Model disposed');
    }
  }

  isLoaded(): boolean {
    return this.loaded;
  }
}

export const medisense = MedisenseEngine.getInstance();
