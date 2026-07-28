# Model Card — MediSense AI Triage Model

**Versi:** 1.0 (MVP — 5 conditions)
**Model Type:** Multi-label Classification (Dense NN + Self-Attention)
**Target Platform:** TensorFlow.js (browser/offline)
**Tanggal:** 28 Juli 2026
**Status:** ⚠️ Eksperimental — perlu data tambahan untuk 3 dari 5 kondisi

---

## 1. Model Overview

- **Task:** Multi-label classification for medical triage
- **Input:** 27 features (demographics + vital signs from MIMIC-IV)
- **Output:** 5 binary labels (one per condition)
- **Architecture:** Dense(256) → BatchNorm → Dropout(0.3) → Dense(128) → BatchNorm → Dropout(0.2) → MultiHeadAttention(4 heads) → Dense(64) → Output(5, sigmoid)
- **Total Parameters:** 124,421 (486 KB)
- **Size:** <15 MB expected after INT8 quantization

### Target Conditions (MVP)

| # | Condition | ICD-9 Code(s) | Clinical Priority | Cases in Dataset |
|---|-----------|---------------|-------------------|-----------------|
| 1 | Sepsis | 038.x, 995.91, 995.92, 785.52 | Organ failure | 13 (4.7%) |
| 2 | Stroke Iskemik | 433.x, 434.x, 436 | Therapeutic window <4.5h | **2 (0.7%)** |
| 3 | Pre-Eklampsia | 642.4, 642.5, 642.6 | Maternal mortality | **0 (0%)** |
| 4 | DBD (Dengue) | 061, 065.4 | Endemic tropical | **0 (0%)** |
| 5 | Pneumonia Balita | 480.x-486.x | Child mortality | 17 (6.2%) |

---

## 2. Dataset

- **Source:** MIMIC-IV Clinical Database Demo (PhysioNet)
- **Patients:** 100 (deidentified, ICU admissions — dewasa, AS)
- **Admissions:** 275 (setelah preprocessing)
- **Diagnosis Records:** 4,506 (ICD-9 codes)
- **Size:** ~100MB (CSV files in `./dataset/`)

### Temuan Kritis

Dataset MIMIC-IV demo memiliki **keterbatasan signifikan** untuk 5 kondisi target:

| Kondisi | Masalah | Dampak |
|---------|---------|--------|
| **Pre-Eklampsia** | 0 kasus — data ICU dewasa, ibu hamil jarang masuk ICU | Model tidak bisa belajar sama sekali |
| **DBD** | 0 kasus — penyakit tropis, tidak ada di AS | Model tidak bisa belajar sama sekali |
| **Stroke Iskemik** | Hanya 2 kasus (0.7%) — sample terlalu kecil | Model tidak bisa belajar pola yang berarti |
| **Sepsis** | 13 kasus (4.7%) — ada tapi sangat imbalance | Model bisa belajar terbatas |
| **Pneumonia** | 17 kasus (6.2%) — paling banyak, tapi tetap imbalance | Satu-satunya kondisi dengan hasil measurable |

### Preprocessing Pipeline

1. Load MIMIC-IV tables (patients, admissions, diagnoses, chartevents)
2. Map ICD-9 codes to 5 target conditions (prefix matching)
3. Engineer 27 features: age, gender, admission type, insurance, LOS, expired, 14 vital sign features (heart rate, respiratory rate, temperature, BP, SpO2, GCS)
4. Handle missing values (median imputation)
5. StandardScaler normalization
6. Train/val/test split: 192/41/42 (70/15/15 stratified)

---

## 3. Training Results (Aktual)

### Test Set Performance

| Condition | AUC | Sensitivity | Precision | F1 | Notes |
|-----------|-----|-------------|-----------|-----|-------|
| Sepsis | NaN | 0.000 | 0.000 | 0.000 | Tidak bisa belajar — terlalu sedikit kasus |
| Stroke Iskemik | NaN | 0.000 | 0.000 | 0.000 | Hanya 2 kasus di training |
| Pre-Eklampsia | NaN | 0.000 | 0.000 | 0.000 | 0 kasus di dataset |
| DBD | NaN | 0.000 | 0.000 | 0.000 | 0 kasus di dataset |
| Pneumonia Balita | **0.533** | 0.250 | 0.125 | 0.167 | Satu-satunya yang terukur — masih rendah |
| **Macro Avg** | NaN | 0.050 | 0.029 | 0.036 | — |

### Analisis

- **Akurasi overall 89.5% menyesatkan** — model hanya memprediksi "negatif untuk semua" yang benar 89.5% karena kelas mayoritas
- **Pneumonia balita AUC 0.533** — hampir setara random (0.5), tidak bisa diandalkan
- **ROC-AUC overall NaN** — karena beberapa kelas tidak punya varian positif di test set
- **Best validation AUC selama training: 0.249** — model gagal belajar pola yang bermakna

### Root Cause

1. **MIMIC-IV adalah data ICU dewasa rumah sakit AS** — tidak representatif untuk:
   - Penyakit tropis (DBD)
   - Kehamilan (pre-eklampsia)
   - Balita (pneumonia balita)
2. **100 pasien terlalu sedikit** untuk multi-label classification 5 kelas
3. **Class imbalance ekstrem** — 3 dari 5 kelas memiliki <5 kasus

---

## 4. Rekomendasi

### Jangka Pendek (Pertahankan Milestone)
1. **Cari dataset tambahan** yang mencakup:
   - DBD: data klinis dari rumah sakit Indonesia (dapat bekerja sama dengan Puskesmas mitra)
   - Pre-eklampsia: data ibu hamil dari Puskesmas atau dataset publik
   - Stroke: dataset stroke publik (contoh: Kaggle stroke dataset)
2. **Gunakan transfer learning** — pre-training pada data umum, fine-tuning pada data spesifik
3. **Implementasi rule-based fallback** untuk kondisi tanpa data (DBD, pre-eklampsia) — gunakan skoring gejala klasik (WHO criteria)

### Jangka Panjang (Milestone 6-7)
4. **Kumpulkan data real dari pilot** — 3 desa, 30 kader → data triase nyata
5. **Federated learning** akan membantu mengumpulkan data tanpa melanggar privasi
6. **Target 500+ kasus per kondisi** untuk model yang reliable

### Saran Perubahan Scope MVP
| Opsi | Keuntungan | Risiko | Biaya |
|------|------------|--------|-------|
| **A: Fokus ke 2 kondisi** (sepsis + pneumonia) | Model lebih akurat, dataset cukup | Fitur terbatas | Minim — pakai MIMIC-IV saja |
| **B: Tambah dataset eksternal** untuk 5 kondisi | Model lengkap, sesuai rencana | Butuh koordinasi dengan mitra klinis, waktu tambahan | Sedang — butuh akses data |
| **C: Rule-based untuk 3 kondisi tanpa data** + ML untuk 2 kondisi | Cepat, bisa MVP sesuai jadwal | Akurasi rule-based tidak setinggi ML | Minim — tim medis bisa bikin aturan |

---

## 5. Conversion & Deployment Notes

> *Konversi TF-Lite dan TF.js dapat dilakukan SETELAH model mencapai performa yang memadai.*

### TF-Lite INT8 Quantization
```bash
# Perintah ketika model siap
tensorflowjs_converter \
    --input_format=keras \
    --output_format=tfjs_graph_model \
    ml/models/medisense_model.h5 \
    public/models/tfjs/
```

### Deployment
- Model di-cache oleh Service Worker (cache-first)
- Estimasi size: <5 MB setelah INT8 quantization

---

## 6. Limitations & Ethical Considerations

### Current Limitations
1. **Dataset mismatch:** MIMIC-IV (AS, dewasa, ICU) ≠ target pengguna (Indonesia, semua usia, desa)
2. **Zero-shot untuk 3 kondisi:** Model tidak bisa mendeteksi DBD, pre-eklampsia, stroke
3. **Sample size:** 100 pasien tidak cukup untuk deep learning yang robust
4. **Geographic bias:** Populasi AS berbeda secara genetik dan epidemiologis dengan Indonesia

### Ethical Mandatory
- **DISCLAIMER WAJIB:** Setiap hasil triase harus menampilkan "Alat bantu, bukan diagnosis dokter"
- **Fallback penting:** Untuk kondisi tanpa data (DBD, pre-eklampsia), sistem harus punya mekanisme deteksi non-ML
- **Jangan gunakan di production** sebelum validasi klinis dengan ≥50 kasus per kondisi

---

## 7. Maintenance

| Aspek | Kebijakan |
|-------|-----------|
| Retraining | Ketika data baru terkumpul (target: 500 kasus/kondisi) |
| Version | `mv{Major}.{Minor}.{Patch}` — saat ini `mv0.1.0` (eksperimental) |
| Evaluasi | Ulang test SETIAP kali ada data baru |
| Monitoring | False negative direview oleh tenaga kesehatan |

---

*Dokumen ini diperbarui oleh corex-data-scientist. Hasil training aktual menunjukkan perfoma di bawah threshold — butuh data tambahan untuk melanjutkan.*
