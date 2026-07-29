# MediSense AI — ML Deployment Guide

## Model Files

| File | Location | Size | Format |
|------|----------|------|--------|
| TF.js GraphModel | `public/models/medisense_model_tfjs/` | 29 KB | graph-model (browser) |
| TF-Lite FP16 | `ml/models/medisense_model_fp16.tflite` | 17 KB | FlatBuffer (mobile) |
| TF-Lite INT8 | `ml/models/medisense_model_int8.tflite` | 8.8 KB | FlatBuffer (mobile opt) |
| Keras source | `ml/models/medisense_model.h5` | 531 KB | HDF5 (training) |
| Preprocessing contract | `ml/artifacts/preprocessing_contract.json` | — | JSON |

## Preprocessing Contract (Python → JS Parity)

### Input Features (23, order WAJIB tetap)

| # | Feature | Unit | Clinical Range | Description |
|---|---------|------|---------------|-------------|
| 0 | age | years | 0-95 | Patient age |
| 1 | gender | 0/1 | 0=F, 1=M | Patient gender |
| 2 | bmi | kg/m² | 12-50 | Body mass index |
| 3 | heart_rate | bpm | 40-200 | Heart rate |
| 4 | respiratory_rate | breaths/min | 10-70 | Respiratory rate |
| 5 | systolic_bp | mmHg | 50-200 | Systolic blood pressure |
| 6 | diastolic_bp | mmHg | 30-120 | Diastolic blood pressure |
| 7 | temperature | °C | 35-42 | Body temperature |
| 8 | spo2 | % | 70-100 | Oxygen saturation |
| 9 | wbc | ×10³/µL | 0.5-40 | White blood cell count |
| 10 | hemoglobin | g/dL | 6-18 | Hemoglobin |
| 11 | platelet | ×10³/µL | 20-600 | Platelet count |
| 12 | creatinine | mg/dL | 0.2-5.0 | Creatinine (kidney function) |
| 13 | glucose | mg/dL | 50-300 | Blood glucose |
| 14 | sodium | mmol/L | 125-155 | Serum sodium |
| 15 | bicarbonate | mmol/L | 10-35 | Serum bicarbonate |
| 16 | fever | 0/1 | 0=no, 1=yes | Subjective/measured fever |
| 17 | cough | 0/1 | 0=no, 1=yes | Cough symptom |
| 18 | dyspnea | 0/1 | 0=no, 1=yes | Shortness of breath |
| 19 | confusion | 0/1 | 0=no, 1=yes | Altered mental status |
| 20 | chest_pain | 0/1 | 0=no, 1=yes | Chest pain |
| 21 | diarrhea | 0/1 | 0=no, 1=yes | Diarrhea |
| 22 | cyanosis | 0/1 | 0=no, 1=yes | Blue skin/lips |

### Normalization

StandardScaler with formula:
```
normalized[i] = (raw[i] - mean[i]) / scale[i]
```

Parameters (dari `ml/artifacts/preprocessing_contract.json`):
- `scaler_mean`: array of 23 floats
- `scaler_scale`: array of 23 floats

> **WAJIB**: Preprocessing di JavaScript harus identik dengan Python. Gunakan parameter yang sama persis. Jangan recompute di JS — gunakan nilai dari preprocessing_contract.json.

### Model Input
- Shape: `[1, 23]` (batch=1, features=23)
- Dtype: `float32`
- Tensor name: `features`
- Order: SAMA dengan urutan feature_names di preprocessing_contract.json

### Model Output
- Shape: `[1, 2]`
- Dtype: `float32`
- Tensor name: `output_0` (Identity)
- Index 0: **sepsis** probability (sigmoid, 0-1)
- Index 1: **pneumonia_balita** probability (sigmoid, 0-1)

### Triage Decision Logic

```typescript
function getTriageColor(probs: [number, number]): 'MERAH' | 'KUNING' | 'HIJAU' {
  const maxProb = Math.max(probs[0], probs[1]);
  if (maxProb > 0.7) return 'MERAH';
  if (maxProb > 0.3) return 'KUNING';
  return 'HIJAU';
}
```

### Loading in PWA (Next.js)

```typescript
import * as tf from '@tensorflow/tfjs';
import contract from '@/ml/artifacts/preprocessing_contract.json';

// Load model (sekali saat startup)
const model = await tf.loadGraphModel('/models/medisense_model_tfjs/model.json');

// Preprocess input
function preprocess(raw: number[]): tf.Tensor2D {
  const normalized = raw.map((val, i) => (val - contract.scaler_mean[i]) / contract.scaler_scale[i]);
  return tf.tensor2d([normalized], [1, 23]);
}

// Inference
async function predict(features: number[]): Promise<[number, number]> {
  const input = preprocess(features);
  const output = model.predict(input) as tf.Tensor;
  const probs = Array.from(output.dataSync()) as [number, number];
  input.dispose();
  output.dispose();
  return probs;
}
```

## Voice Input Deployment — Whisper.cpp Analysis

### Options Compared

| Approach | Size | Offline | RAM | CPU | Latency | Recommendation |
|----------|------|---------|-----|-----|---------|---------------|
| whisper.cpp WASM | ~40MB | ✅ Yes | ~300MB | Very heavy | 3-5x real-time | ❌ Tidak feasible untuk device kader |
| Vosk.js | ~22MB | ✅ Yes | ~100MB | Moderate | Near real-time | ✅ **RECOMMENDED** |
| Web Speech API | 0MB | ❌ No | — | — | Real-time | ❌ Butuh internet |
| Whisper API Cloud | 0MB | ❌ No | — | — | Real-time | ⚠️ Fallback saja |

### Recommendation: Vosk.js

**Alasan:**
1. **Offline penuh** — sesuai requirement PWA untuk wilayah 3T
2. **Ukuran wajar** — model bahasa Indonesia ~20MB + Vosk.js ~2MB
3. **RAM acceptable** — ~100MB masih masuk akal untuk device kelas menengah ke bawah
4. **Keyword spotting** — cukup untuk mengenali gejala-gejala utama (demam, batuk, sesak, dll)
5. **Bahasa Indonesia support** — Vosk punya model bahasa Indonesia

**Data Flow:**
```
Voice input → Vosk.js (on-device ASR) → teks gejala → NLP parse → feature vector → TF.js triase → output
```

**Fallback Strategy:**
- Online: pakai Google Cloud Speech-to-Text API (kualitas terbaik)
- Offline: pakai Vosk.js (akurasi cukup untuk keyword gejala)

### Not Recommended: whisper.cpp WASM

- **Ukuran:** ~40MB per bahasa (Indonesia + Inggris ~80MB)
- **RAM:** >300MB saat inferensi — bermasalah di device 2GB RAM
- **CPU:** 100% utilization selama 5-10 detik untuk 3 detik audio — boros baterai
- **WASM maturity:** Masih eksperimental, belum stabil di browser mobile
- **Kesimpulan:** Layak dipertimbangkan nanti jika target device sudah modern (≥4GB RAM, multi-core)

## Testing Model di Browser

1. Buka browser > DevTools > Console
2. Load model:
   ```js
   const model = await tf.loadGraphModel('/models/medisense_model_tfjs/model.json');
   console.log('Model loaded:', model);
   ```
3. Test inference:
   ```js
   const input = tf.tensor2d([[0.5, 0, ...]], [1, 23]);
   const output = model.predict(input);
   output.print();
   ```
