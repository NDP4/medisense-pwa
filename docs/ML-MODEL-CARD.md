# Model Card — MediSense AI Triage Model

**Versi:** 1.0 (MVP — 5 conditions)
**Model Type:** Multi-label Classification (Dense NN + Self-Attention)
**Target Platform:** TensorFlow.js (browser/offline)
**Tanggal:** 28 Juli 2026

---

## 1. Model Overview

- **Task:** Multi-label classification for medical triage
- **Input:** 52+ features (symptom indicators + demographics + vital signs)
- **Output:** 5 binary labels (one per condition)
- **Architecture:** Dense(256) → BatchNorm → Dropout(0.3) → Dense(128) → BatchNorm → Dropout(0.2) → MultiHeadAttention(4 heads) → Dense(64) → Output(5, sigmoid)
- **Parameters:** ~150K (estimated)
- **Size:** <15 MB (INT8 quantized)

### Target Conditions (MVP)

| # | Condition | ICD-9 Code(s) | Clinical Priority |
|---|-----------|---------------|-------------------|
| 1 | Sepsis | 038.x, 995.91, 995.92, 785.52 | Organ failure, high mortality |
| 2 | Stroke Iskemik | 433.x, 434.x, 436 | Therapeutic window <4.5h |
| 3 | Pre-Eklampsia | 642.4, 642.5, 642.6 | Maternal mortality risk |
| 4 | DBD (Dengue) | 061, 065.4 | Endemic tropical, often misdiagnosed |
| 5 | Pneumonia Balita | 480.x-486.x | Leading child mortality in 3T areas |

## 2. Dataset

- **Source:** MIMIC-IV Clinical Database Demo (PhysioNet)
- **Patients:** 100 (deidentified, ICU admissions)
- **Admissions:** 276
- **Diagnosis Records:** 4,507 (ICD-9/10 codes)
- **Size:** ~100MB (CSV files in `./dataset/`)
- **Limitations:** Adult ICU data only, limited pediatric/obstetric cases

### Preprocessing Pipeline

1. Load MIMIC-IV tables (patients, admissions, diagnoses, charts)
2. Map ICD-9 codes to 5 target conditions (prefix matching)
3. Engineer features: age, gender, admission type, insurance, vital signs, LOS
4. Handle missing values (median imputation)
5. Scale features (StandardScaler)
6. Train/val/test split: 70/15/15 stratified
7. SMOTE augmentation for minority classes (via sample weighting)

**Script:** `ml/scripts/preprocess.py`

## 3. Model Architecture

```
Input Layer (52+ features)
    │
Dense(256) + BatchNorm + ReLU + Dropout(0.3)
    │
Dense(128) + BatchNorm + ReLU + Dropout(0.2)
    │
Reshape(1, 128) ──► MultiHeadAttention(4 heads, key_dim=32)
    │                        │
    └──────── Concat ────────┘
    │
Dense(64) + ReLU + Dropout(0.1)
    │
Output(5) + Sigmoid
    │
Multi-label: [sepsis, stroke_iskemik, pre_eklampsia, dbd, pneumonia_balita]
```

### Key Design Decisions

- **Sigmoid** (not softmax): Conditions are NOT mutually exclusive
- **Self-Attention**: Captures correlation between symptoms
- **Skip connection**: Helps gradient flow with small dataset
- **Dropout (0.3→0.2→0.1)**: Strong regularization for 100-patient dataset
- **L2 regularization** (1e-4): Prevents overfitting
- **AdamW optimizer**: Weight decay for better generalization
- **Sample weighting**: Higher weight on positive (minority) classes

## 4. Training Details

- **Framework:** TensorFlow 2.x / Keras
- **Loss:** Binary Crossentropy
- **Optimizer:** AdamW (lr=1e-3, weight_decay=1e-4)
- **Batch Size:** 16
- **Epochs:** 200 (with early stopping, patience=30)
- **Learning Rate Schedule:** ReduceLROnPlateau (factor=0.5, patience=10)
- **Regularization:** Dropout + L2 + Early Stopping
- **Hardware:** CPU-compatible (dapat dijalankan di laptop tanpa GPU)

**Script:** `ml/scripts/train.py`

## 5. Performance Metrics

> *Hasil evaluasi akan diisi setelah training dijalankan.*

| Condition | AUC | Sensitivity | Specificity | Precision | F1 |
|-----------|-----|-------------|-------------|-----------|-----|
| Sepsis | — | — | — | — | — |
| Stroke Iskemik | — | — | — | — | — |
| Pre-Eklampsia | — | — | — | — | — |
| DBD | — | — | — | — | — |
| Pneumonia Balita | — | — | — | — | — |
| **Macro Avg** | — | — | — | — | — |

### Target Thresholds

| Metric | Target | Minimum |
|--------|--------|---------|
| Accuracy | >91% | >85% |
| Sensitivity (emergency) | >95% | >90% |
| ROC-AUC | >0.95 | >0.90 |
| Latency (Snapdragon 450) | <800ms | <1.5s |
| Model Size (INT8) | <15MB | <50MB |

## 6. Conversion & Deployment

### TF-Lite INT8 Quantization

```python
import tensorflow as tf

# Load trained model
model = tf.keras.models.load_model('ml/models/medisense_model.h5')

# Convert to TF-Lite with INT8 quantization
converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.target_spec.supported_types = [tf.float16]  # or tf.int8
tflite_model = converter.convert()

# Save
with open('public/models/medisense_model.tflite', 'wb') as f:
    f.write(tflite_model)
```

### TF.js Conversion

```bash
tensorflowjs_converter \
    --input_format=tf_saved_model \
    --output_format=tfjs_graph_model \
    --quantize_uint8=uint8 \
    ml/models/medisense_model.h5 \
    public/models/tfjs/
```

### Deployment Notes

- Model disimpan di `public/models/` untuk di-cache oleh Service Worker
- Strategi cache: Cache-first (didownload sekali saat install PWA)
- Fallback: TF.js WebGL backend jika WASM tidak tersedia
- Verifikasi: SHA-256 checksum pada model file

## 7. Limitations & Ethical Considerations

### Known Limitations

1. **Small dataset:** 100 patients from a single hospital (Beth Israel Deaconess)
   - May not generalize to Indonesian population
   - Limited demographic diversity
2. **Adult ICU data:** MIMIC-IV is predominantly adult ICU
   - Pre-eclampsia and pediatric pneumonia are under-represented
3. **Synthetic augmentation:** SMOTE and sample weighting partially address imbalance
   - But cannot replace real clinical data
4. **ICD code mapping:** Ground truth relies on administrative diagnosis codes
   - May have coding errors or inconsistencies

### Ethical Considerations

- **Not a diagnostic tool:** This model is a triage ASSISTANT, NOT a replacement for clinical diagnosis
- **Disclaimer required:** Every triage result must display "Alat bantu, bukan diagnosis dokter"
- **Escalation path:** Red/Yellow results MUST recommend seeing a healthcare professional
- **Data privacy:** Model runs 100% on-device, no patient data leaves the phone
- **Continuous improvement:** Federated learning (planned) will adapt model to local population
- **Validation needed:** Clinical validation with ≥50 retrospective cases before pilot

## 8. Maintenance

- **Retraining:** When new conditions added or accuracy drops below 85%
- **Version tracking:** Model version stored in `mv{Major}.{Minor}.{Patch}` format
- **A/B testing:** New models compared against current before rollout
- **Monitoring:** False negatives (missed emergency conditions) logged for review

---

*Dokumen ini dikelola oleh corex-data-scientist. Update setelah training selesai dengan hasil evaluasi aktual.*
