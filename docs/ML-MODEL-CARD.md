# MediSense AI — Model Card

## Model Overview
- **Nama Model:** MediSense Triage v1.0
- **Tujuan:** Triage dini (sepsis + pneumonia balita)
- **Arsitektur:** Dense Neural Network (64→32→16) with batch normalization, dropout, and attention gating
- **Total Parameter:** 4,579
- **Output:** 2 sigmoid neurons (sepsis, pneumonia_balita)
- **Framework:** TensorFlow 2.21.0
- **Format:** Keras H5 + TF-Lite (FP16/INT8) + TF.js GraphModel

## Data Source
⚠️ **WARNING: SYNTHETIC/FICTIONAL DATA — NOT CLINICAL.**
Dataset adalah data sintetis yang dihasilkan oleh script `ml/scripts/generate_synthetic.py` berdasarkan distribusi klinis dari literatur WHO/ICD guidelines. BUKAN data pasien asli.

### Dataset Composition
| Condition | Samples | Percentage |
|-----------|---------|-----------|
| Sepsis only | 1,500 | 30% |
| Pneumonia only | 1,500 | 30% |
| Both | 500 | 10% |
| Control (healthy) | 1,500 | 30% |
| **Total** | **5,000** | **100%** |

### Features (23 total)
| Group | Features | Count |
|-------|----------|-------|
| Demographics | age, gender, bmi | 3 |
| Vital Signs | heart_rate, respiratory_rate, systolic_bp, diastolic_bp, temperature, spo2 | 6 |
| Lab Values | wbc, hemoglobin, platelet, creatinine, glucose, sodium, bicarbonate | 7 |
| Symptoms | fever, cough, dyspnea, confusion, chest_pain, diarrhea, cyanosis | 7 |
| **Total** | | **23** |

### Clinical Distributions
| Feature | Sepsis | Pneumonia | Control |
|---------|--------|-----------|---------|
| Age (years) | 58±18 | 2.5±1.5 | 35±15 |
| Heart Rate (bpm) | 110±15 | 140±20 (children) | 75±10 |
| Respiratory Rate | 24±6 | 44±12 (children) | 16±3 |
| Temperature (°C) | 39.0±0.8 | 38.8±0.7 | 36.8±0.3 |
| SpO2 (%) | 94±4 | 93±4 | 98±1 |
| WBC (x10³/µL) | 18±6 | 15±5 | 7.5±2 |
| Creatinine (mg/dL) | 1.8±0.8 | 0.5±0.15 | 0.9±0.2 |

## Performance (Test Set — 750 samples)

### Sepsis
| Metric | Value |
|--------|-------|
| AUC-ROC | 0.938 |
| Sensitivity | 0.92 |
| Specificity | 0.89 |
| Precision | 0.84 |
| F1 Score | 0.88 |

### Pneumonia Balita
| Metric | Value |
|--------|-------|
| AUC-ROC | 0.96 |
| Sensitivity | 0.93 |
| Specificity | 0.91 |
| Precision | 0.86 |
| F1 Score | 0.89 |

### Architecture Scoring
Model menggunakan Dense NN dengan attention gating untuk menangkap interaksi non-linear antar fitur vital sign, lab, dan gejala. Ukuran kecil (4,579 params) untuk inferensi cepat di browser via TF.js WASM backend.

## Deployment
| Format | Size | Use |
|--------|------|-----|
| Keras H5 | 531 KB | Training/eval |
| TF-Lite FP16 | 17 KB | Mobile |
| TF-Lite INT8 | 8.8 KB | Mobile optimized |
| TF.js GraphModel | 29 KB | **Browser (PWA)** |

TF.js model disimpan di `public/models/medisense_model_tfjs/`.

### Inference Pipeline
1. Kader input gejala + demografi + (opsional) data vital
2. Browser normalisasi dengan scaler (pre-computed dari training)
3. TF.js WASM backend inference on-device (100% offline)
4. Output: probability [0-1] untuk sepsis dan pneumonia
5. Triage color: Hijau (<0.3), Kuning (0.3-0.7), Merah (>0.7)

## Limitations
1. **SYNTHETIC DATA** — model hanya valid untuk DEMO. Performa pada data klinis nyata tidak diketahui.
2. Hanya 2 kondisi — tidak mencakup stroke, pre-eklampsia, DBD
3. Gejala input terbatas — tidak mencakup semua varian klinis
4. Tidak disetujui untuk diagnosis — hanya alat bantu triase dini
5. Perlu re-training dengan data lapangan nyata sebelum digunakan di produksi

## Next Steps for Production
1. Kumpulkan data klinis dari pilot desa
2. Re-train model dengan data asli (butuh ≥500 kasus per kondisi)
3. Validasi oleh dokter spesialis
4. Tambah 3 kondisi (stroke, pre-eklampsia, DBD) via fine-tuning
