# Technical Specification
## MediSense AI — AI-Powered Triage & Early Disease Detection Platform

**Versi:** 1.0 (direkonstruksi dari Proposal MediSense AI, 2026)
**Disusun oleh:** MediSense AI Team — Program Diploma III Teknik Informatika
**Status:** Completed (sesuai Tabel 6 Proposal)

---

## 1. Ikhtisar Arsitektur Sistem

MediSense AI menggunakan **arsitektur tiga lapis (three-layer architecture)** yang berjalan sepenuhnya di sisi klien untuk operasi inti, dengan lapisan cloud opsional untuk agregasi dan sinkronisasi. Seluruh operasi triase dapat berjalan **100% offline**.

### Layer 1 — On-Device AI Engine
- TensorFlow Lite (INT8 quantised)
- 52 input features (47 gejala biner + 5 fitur demografis)
- 47 output kondisi (multi-label classification)
- Latensi inferensi: <800 ms (diuji pada Snapdragon 450, 2019, low-end)
- Ukuran model: <50 MB

### Layer 2 — Multimodal Input Engine
- 47 ilustrasi gejala visual
- Whisper.cpp untuk speech-to-text offline
- Dukungan 5 bahasa daerah: Jawa, Sunda, Batak, Bugis, Papua (+ Bahasa Indonesia)
- Ukuran model STT: ±40 MB per bahasa
- Word Error Rate (WER) Bahasa Indonesia: <15% pada kondisi lingkungan bising

### Layer 3 — Local Data & Sync Engine
- SQLite + SQLCipher (enkripsi AES-256)
- PouchDB sync queue → CouchDB
- Resolusi konflik berbasis CRDT (Conflict-Free Replicated Data Types)
- Target data loss: <0,1%

### Output
- Hasil triase berkode warna (Hijau/Kuning/Merah)
- Rekomendasi tindakan
- Panggilan darurat satu-tap ke 119

---

## 2. Alur Kerja Triase (Triage Workflow)

5 langkah, maksimum 3 menit per sesi:

1. Pilih anggota keluarga
2. Input gejala visual
3. Input suara (opsional)
4. Analisis AI on-device
5. Hasil & rekomendasi tindakan

---

## 3. Technology Stack

| Komponen | Teknologi |
|---|---|
| Application Framework | React Native (Expo) |
| AI Inference | TensorFlow Lite (INT8 Quantised, <50 MB) |
| Voice Input | Whisper.cpp (GGML, ±40 MB/bahasa) |
| Local Database | SQLite + SQLCipher (AES-256) |
| Sync Engine | PouchDB → CouchDB (berbasis CRDT) |
| API Backend | FastAPI (Python) |
| Cloud Database | PostgreSQL + Redis (Supabase managed) |
| Web Dashboard | Next.js 14 (SSR, Vercel deployment) |
| PWA | Service Worker + Cache-First Strategy |
| Infrastructure | Docker + Kubernetes (cloud-agnostic) |

---

## 4. Machine Learning Pipeline

**Alur:** Dataset → Preprocessing + Encoding + SMOTE → Feature Engineering (52 fitur) → Training (Dense NN + Attention) → Evaluation (ROC-AUC, Confusion Matrix) → TF-Lite INT8 Quantization

### 4.1 Dataset
- MIMIC-IV (300.000 record)
- Data gejala penyakit tropis publik
- Sintesis data minoritas menggunakan SMOTE

### 4.2 Feature Engineering
- 52 fitur input total: 47 gejala biner (dipilih via card sorting bersama kader kesehatan) + 5 fitur demografis

### 4.3 Arsitektur Neural Network

| Layer | Konfigurasi | Fungsi |
|---|---|---|
| Input Layer | 52 neuron | 47 gejala + 5 demografi |
| Hidden Layer 1 | Dense 256 + BatchNorm + Dropout(0.3) | Ekstraksi fitur utama |
| Hidden Layer 2 | Dense 128 + BatchNorm + Dropout(0.2) | Pengenalan pola |
| Attention Layer | Lightweight self-attention | Korelasi antar-gejala |
| Output Layer | Dense 47 + Sigmoid | Multi-label: 47 kondisi |
| Uncertainty Head | MC Dropout (T=20) | Estimasi ketidakpastian |

### 4.4 Teknik Penyeimbangan Data
- SMOTE untuk kelas minoritas (kondisi darurat seperti sepsis)
- Stratifikasi train/val/test split
- Class weighting pada loss function
- Target sensitivitas >95% untuk kondisi darurat

### 4.5 Konversi Model
- Post-training quantization (PTQ) INT8
- Representative dataset untuk kalibrasi
- Target penurunan akurasi <1% dari model asli

---

## 5. Federated Learning

- Algoritma: **FedAvg**
- Perlindungan privasi: **Differential Privacy** (ε = 1.0, δ = 10⁻⁵)
- Agregasi model: bulanan, minimum 1.000 record baru
- Validasi A/B testing sebelum rollout ke seluruh perangkat
- Data mentah tidak pernah meninggalkan perangkat — hanya gradien terenkripsi yang dikirim ke server agregasi
- Kepatuhan: UU PDP 2022, Permenkes No. 46/2017

---

## 6. Strategi Pengujian (Testing Strategy)

| Level Pengujian | Tool | Kriteria Lulus |
|---|---|---|
| Unit Testing | Jest + Pytest | >85% code coverage |
| Integration Testing | Postman + Supertest | 100% happy path |
| AI Model Testing | Confusion Matrix + ROC-AUC | Akurasi >91%, sensitivitas >95% |
| Offline Testing | Chrome DevTools + Airplane mode | 100% feature parity |
| Usability Testing | Think-Aloud Protocol (n=30) | Task completion >85% |
| Performance Testing | Lighthouse + JMeter | LCP <2.5 s, latensi AI <800 ms |
| Security Testing | OWASP ZAP + Snyk | 0 kerentanan kritis |
| Clinical Validation | Retrospective cohort (50+ kasus) | Sensitivitas >95% kondisi darurat |

---

## 7. Infrastruktur & Deployment

- HTTPS + Cloudflare CDN
- Monitoring: Prometheus + Grafana
- Hosting frontend: Vercel (medisense-ai-eta.vercel.app)
- Backend: Railway (free tier)
- Database cloud: Supabase (free tier, 500 MB)
- Containerization: Docker + Kubernetes (cloud-agnostic)

---

## 8. Keamanan & Privasi Data

- Enkripsi lokal: SQLCipher AES-256
- Data pasien dianonimkan sebelum pemrosesan
- Audit trail untuk setiap keputusan AI (sesuai WHO SMART Guidelines)
- Disclaimer medis otomatis pada setiap hasil triase
- Jalur eskalasi wajib ke tenaga kesehatan profesional untuk kasus berisiko

---

## 9. Kebutuhan Non-Fungsional

| Aspek | Target |
|---|---|
| Kompatibilitas perangkat | Android 7.0+, RAM 2 GB |
| Ukuran model AI | <50 MB |
| Latensi inferensi | <800 ms |
| Ukuran model STT per bahasa | ±40 MB |
| Ketahanan koneksi | 100% fungsi triase tanpa internet |
| Data loss saat sinkronisasi | <0,1% |
| Largest Contentful Paint (LCP) | <2,5 detik |

---

## 10. Status Implementasi Saat Ini

| Aktivitas | Status | % |
|---|---|---|
| Riset lapangan & analisis masalah | Completed | 100% |
| Dokumentasi lengkap (BRD, PRD, Tech Spec, UX, PP) | Completed | 100% |
| Desain arsitektur & Lo-Fi wireframe | Completed | 100% |
| Persiapan pipeline dataset & EDA | Completed | 100% |
| Pengembangan & pelatihan model AI | In Progress | 40% |
| Pengembangan frontend React Native | In Progress | 25% |
| Pengembangan backend FastAPI | In Progress | 30% |
| Pilot testing lapangan | Not Yet Started | 0% |

---

## 11. Rekomendasi Pengembangan Lanjutan (Teknis)

1. Validasi klinis skala besar (≥500 kasus) untuk sertifikasi sebagai alat bantu medis.
2. Ekspansi model Whisper.cpp untuk bahasa daerah tambahan (Makassar, Madura, Bali, Minang).
3. Konektor API resmi ke e-Puskesmas, ePPGBM, dan SIMRS Kemenkes.
4. Modul deteksi malnutrisi anak (stunting/wasting) via estimasi antropometri dari foto.
5. Integrasi sensor wearable Bluetooth (pulse oximeter, versi 3.0).

---

*Dokumen ini direkonstruksi dari isi Proposal MediSense AI (2026) karena berkas Technical Specification asli tidak turut diunggah. Untuk detail arsitektur lengkap, referensi akademik, dan justifikasi metodologis, lihat proposal sumber.*
