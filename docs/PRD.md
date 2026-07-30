# Product Requirements Document (PRD)
## MediSense AI — AI-Powered Triage & Early Disease Detection Platform

**Versi:** 1.0  
**Status:** Draft — PRD baru  
**Tier Klien:** Corex Growth (dengan aspek Enterprise pada compliance data kesehatan)  
**Disusun oleh:** Corex-PM  
**Tanggal:** 28 Juli 2026  

---

## 1. Ringkasan Eksekutif

MediSense AI adalah platform triase dini berbasis AI untuk kader kesehatan di wilayah 3T (Terdepan, Terluar, Tertinggal) Indonesia. Platform berjalan sebagai **Progressive Web App (PWA) murni** dengan seluruh inferensi AI di perangkat (on-device), tanpa membutuhkan koneksi internet untuk fungsi inti triase.

Model AI mendeteksi kondisi darurat medis berdasarkan input gejala (visual + suara) dan menghasilkan rekomendasi triase berkode warna: **Hijau** (rawat jalan), **Kuning** (rujuk dalam 24 jam), **Merah** (darurat — segera hubungi 119).

Target pengguna: **63 juta penduduk wilayah 3T** yang dilayani oleh kader kesehatan dengan rasio dokter 1:8.400 (7x lebih buruk dari rata-rata nasional).

---

## 2. Tujuan & Target Terukur

| No | Tujuan | Target MVP (Bulan 6) | Target Skala (Bulan 12) |
|----|--------|----------------------|-------------------------|
| 1 | Triase gejala offline di smartphone entry-level | Android 7.0+, RAM 2 GB, model AI <50 MB | Sama + iOS via PWA |
| 2 | Akurasi model AI | >91% (sensitivitas >95% untuk kondisi darurat) | >93% |
| 3 | Interface untuk pengguna literasi digital rendah | Task completion >85% tanpa pelatihan formal | >90% |
| 4 | Peningkatan model berkelanjutan | Federated learning + differential privacy | FL dengan 500+ device |
| 5 | Validasi lapangan | ≥3 desa, 30 kader, validasi klinis ≥50 kasus | 5 kabupaten, 500 kader |

---

## 3. Target User & Stakeholders

| Stakeholder | Kebutuhan Utama | Catatan Akses |
|---|---|---|
| **Kader kesehatan desa** | Alat triase akurat, mudah digunakan, offline penuh | User utama PWA — literasi digital rendah, smartphone entry-level |
| **Bidan desa** | Notifikasi proaktif ibu hamil risiko tinggi | Pengguna lanjutan, akses ke dashboard |
| **Kepala Puskesmas** | Dashboard monitoring kader, early warning outbreak (72 jam sebelum eskalasi) | Akses via web dashboard (desktop/mobile) |
| **Dinas Kesehatan / Kemenkes** | Data agregat anonim, potensi integrasi e-Puskesmas/SIMRS | Roadmap fase lanjutan |

---

## 4. Fitur Utama & Prioritas

### MVP (Milestone 1-3, Bulan 1-6)

| Fitur | Prioritas | Deskripsi |
|-------|-----------|-----------|
| **F-01** | P0 | Input gejala visual: 5-47 ilustrasi gejala yang bisa dipilih pengguna (tap pada gambar) |
| **F-02** | P0 | Input suara offline: voice-to-text via Whisper.cpp (WASM) — Bahasa Indonesia + 5 bahasa daerah |
| **F-03** | P0 | Model AI TF-Lite (via TF.js WASM backend): multi-label classification → output triase |
| **F-04** | P0 | Hasil triase 3 warna: Hijau (panduan mandiri), Kuning (rujuk ≤24 jam), Merah (darurat + tombol 119) |
| **F-05** | P0 | Tombol darurat satu-tap: dial 119 + kirim lokasi + hasil triase |
| **F-06** | P0 | Riwayat triase lokal (SQLite/SQLCipher) — bisa dilihat kembali offline |
| **F-07** | P1 | Sinkronisasi offline-to-cloud (PouchDB → CouchDB, CRDT-based) saat ada koneksi |
| **F-08** | P1 | Dashboard Puskesmas web: monitoring kader, hasil triase, early warning outbreak |
| **F-09** | P2 | Onboarding interaktif visual (30 menit, panduan bergambar) |
| **F-10** | P2 | Manajemen anggota keluarga (profil pasien berulang) |

### Pasca-MVP (Milestone 4+, Bulan 7-12)

| Fitur | Prioritas | Deskripsi |
|-------|-----------|-----------|
| **F-11** | P1 | Federated learning (FedAvg + DP ε=1.0) — update model tanpa data pasien keluar device |
| **F-12** | P1 | Gamifikasi komunitas: leaderboard desa, badge, progres deteksi |
| **F-13** | P2 | Eskalasi notifikasi ke Puskesmas untuk kasus Kuning/Merah |
| **F-14** | P3 | Integrasi e-Puskesmas/SIMRS (API bridge) |

---

## 5. Batasan Teknis (Platform & Constraints)

### Platform
- **Wajib:** PWA murni (dapat diinstal dari browser Chrome/Android). **Bukan React Native, bukan native app.**
- Target browser: Chrome 90+ (Android), Safari 15+ (iOS)
- Fitur PWA yang dipakai: Service Worker, Cache API, IndexedDB, WebAssembly, Install Prompt
- **Harus 100% berfungsi offline** untuk fitur triase inti (F-01 s.d. F-06)

### Device Target
- Android 7.0+ (API level 24), RAM minimal 2 GB
- Storage minimal 500 MB bebas (untuk model + data lokal)
- Layar minimal 4.5 inci
- Koneksi internet: opsional (hanya untuk sync & dashboard)

### Model AI
- Format: TensorFlow Lite (INT8 quantized), dijalankan via TensorFlow.js WASM backend
- Ukuran: <50 MB (target <15 MB jika 5 kondisi saja untuk MVP)
- Latensi inferensi: <800 ms di Snapdragon 450 (2019, low-end)
- Input: 52 fitur (47 gejala biner + 5 demografis) — atau subset untuk MVP
- Output: multi-label (5 kondisi untuk MVP → 47 kondisi penuh)

### Voice Recognition
- Whisper.cpp via WebAssembly (GGML WASM port)
- Ukuran model per bahasa: ±40 MB (dipilih sesuai region saat install)
- Bahasa: Bahasa Indonesia + 5 bahasa daerah (Jawa, Sunda, Batak, Bugis, Papua)
- WER target: <15%

### Penyimpanan Lokal
- Database: SQLite + SQLCipher (AES-256 enkripsi)
- Sync: PouchDB (offline-first) → CouchDB (cloud)
- Resolusi konflik: CRDT (Conflict-Free Replicated Data Types)

### Cloud (Opsional, untuk Dashboard & Sync)
- Backend API: FastAPI atau Next.js API Routes
- Database: Supabase (free tier, 500 MB untuk MVP)
- Hosting Frontend (Dashboard): Vercel
- Monitoring: Prometheus + Grafana (jika budget memungkinkan)

---

## 6. Keputusan Arsitektur Kunci (Untuk corex-architect)

1. **PWA + TF.js WASM:** Model TF-Lite harus dikonversi ke format TF.js atau menggunakan XNNPACK WASM backend. corex-architect perlu memutuskan pendekatan paling ringan untuk inferensi di browser.
2. **Whisper.cpp WASM:** Port WebAssembly dari Whisper.cpp untuk speech-to-text offline di browser. Perlu diuji di device entry-level dengan RAM terbatas.
3. **Service Worker Strategy:** Cache-first untuk aset statis + model AI. Network-first (dengan fallback) untuk sync data.
4. **SQLite via sql.js atau OPFS:** Akses SQLite dari browser (via WebAssembly). Atau alternatif IndexedDB dengan wrapper.
5. **CRDT untuk Offline Sync:** Automerge atau Yjs untuk resolusi konflik data triase offline.
6. **Keputusan scope sudah ditetapkan:** 5 kondisi untuk MVP, arsitektur siap scale ke 47. Lihat Section 7 untuk detail.

---

## 7. Keputusan — Scope Kondisi Medis

**Keputusan operator (28 Juli 2026): ✅ Opsi A — 5 kondisi prioritas untuk MVP, arsitektur siap scale ke 47.**

### Detail Scope MVP (5 Kondisi)

| No | Kondisi | Kode Output | Prioritas Klinis |
|----|---------|-------------|------------------|
| 1 | Sepsis | `sepsis` | Kegagalan organ sistemik, mortalitas tinggi |
| 2 | Stroke Iskemik | `stroke_iskemik` | Terapi window <4,5 jam, deteksi dini krusial |
| 3 | Pre-Eklampsia | `pre_eklampsia` | Risiko ibu hamil, penyebab kematian maternal |
| 4 | Demam Berdarah Dengue | `dbd` | Endemis tropis, sering salah diagnosis awal |
| 5 | Pneumonia Balita | `pneumonia_balita` | Penyebab kematian balita tertinggi di 3T |

### Arsitektur Scale ke 47
- Neural network dirancang dengan **47 output neuron** sejak awal — hanya 5 yang diaktifkan untuk MVP
- Loss function menggunakan **masked multi-label loss** (hanya menghitung error pada 5 kondisi aktif)
- Penambahan 42 kondisi sisanya cukup dengan: data tambahan → fine-tuning → tanpa perubahan arsitektur
- TF-Lite model conversion pipeline sudah mendukung dynamic output sizing

### Dataset untuk MVP
- Sumber: MIMIC-IV demo (100 pasien) + sintesis SMOTE untuk kelas minoritas
- Target per kondisi: minimum 500 record setelah augmentasi
- Fitur input: 52 fitur (47 gejala biner + 5 demografis) — semua fitur tetap digunakan, hanya output yang dibatasi

---

## 8. Milestone & Timeline

### Milestone 1: Foundation & Dataset (Minggu 1-3)
- Inisialisasi repo (`git init`, branch `main`)
- Setup CI workflow (dari template `ci-templates/github-actions-ci-node-EXAMPLE.yml`)
- Buat `docs/VERSIONING.md` — semantic versioning untuk project
- Eksplorasi dataset MIMIC-IV demo, preprocessing 5 kondisi prioritas
- Feature engineering: 52 fitur → subset relevan untuk 5 kondisi
- SMOTE augmentation untuk kelas minoritas
- **Delay:** Infrastructure (git, CI)

### Milestone 2: Model AI v1 (Minggu 4-8)
- Training Dense NN + Attention (5 output)
- Evaluasi: ROC-AUC, confusion matrix, sensitivitas >95%
- Konversi ke TF-Lite INT8 + TF.js WASM
- **Delay:** corex-data-scientist → corex-ml-engineer

### Milestone 3: PWA Inti (Minggu 6-12, overlap dengan Milestone 2)
- Service Worker setup (cache-first untuk model)
- Halaman input gejala (ilustrasi visual) — 5 kondisi dulu
- Halaman hasil triase (Hijau/Kuning/Merah) + tombol 119
- Integrasi TF.js WASM untuk inferensi
- Storage lokal (riwayat triase)
- **Delay:** corex-frontend

### Milestone 4: Voice Input + Sync (Minggu 10-16)
- Integrasi Whisper.cpp WASM
- Sinkronisasi offline-to-cloud (PouchDB/CouchDB)
- Dashboard Puskesmas web (Next.js)
- **Delay:** corex-frontend + corex-backend

### Milestone 5: Keamanan, Testing & Pilot (Minggu 14-20)
- Audit keamanan: corex-security
- QA testing fungsional & edge case
- Usability testing dengan kader (n=10-15)
- Validasi klinis retrospektif ≥50 kasus
- **Delay:** corex-security → corex-qa

### Milestone 6: Pilot Lapangan (Minggu 18-24)
- Deploy ke 3 desa, 30 kader
- Monitoring & bug fixing
- Evaluasi KPI (task completion, akurasi, adopsi)
- **Delay:** corex-devops → corex-maintenance

### Milestone 7: Federated Learning (Minggu 20-28, overlap)
- Server agregasi FedAvg + differential privacy
- Update model over-the-air
- A/B testing model baru
- **Delay:** corex-backend + corex-data-scientist

---

## 9. Risiko & Mitigasi

| Risiko | Tingkat | Dampak | Mitigasi |
|--------|---------|--------|----------|
| **R-01: Performa TF.js WASM di entry-level** | Tinggi | Inferensi >2 detik, pengalaman buruk | Gunakan WebGL backend fallback; quantisasi INT8; test rutin di Snapdragon 450 |
| **R-02: Ukuran Whisper.cpp WASM terlalu besar** | Tinggi | Model voice 40MB/bahasa membebani storage | Download model per bahasa sesuai region; kompresi WASM; ukur storage real-time |
| **R-03: Akurasi model rendah karena dataset demo terbatas** | Tinggi | False negative kasus darurat | SMOTE augmentation; validasi klinis retrospektif; fallback rule-based untuk gejala klasik |
| **R-04: Sinkronisasi offline gagal/konflik data** | Sedang | Data hilang atau duplikat | CRDT untuk resolusi otomatis; target data loss <0.1%; retry queue |
| **R-05: Adopsi rendah (takut salah pencet)** | Sedang | Kader tidak mau pakai | Desain visual-first; onboarding bergambar 30 menit; gamifikasi |
| **R-06: Kepatuhan regulasi data kesehatan** | Tinggi | Masalah hukum (UU PDP, Permenkes 46/2017) | Enkripsi lokal SQLCipher AES-256; data anonim; audit trail setiap keputusan AI; disclaimer medis otomatis |
| **R-07: Budget terbatas (IDR 3,2jt)** | Tinggi | Tidak bisa bayar infrastruktur cloud | Free tier maksimal; federated learning kurangi beban server; prioritaskan fitur offline |

---

## 10. Keamanan & Privasi Data (Checklist Awal & Status Audit)

Prioritas tinggi mengingat ini adalah **data kesehatan**.

| Item | Status | Severity | Referensi Audit |
|------|--------|:--------:|-----------------|
| **Wajib:** Enkripsi data lokal dengan Web Crypto API (AES-256-GCM) | ❌ Tidak ada implementasi | HIGH | SECURITY-AUDIT.md §1.1 |
| **Wajib:** Tidak ada data pasien (PII) dikirim ke cloud — hanya metadata anonim | ⚠️ Sebagian | HIGH | SECURITY-AUDIT.md §5.1 (hash lemah, voice_text berisiko) |
| **Wajib:** Disclaimer medis otomatis pada SETIAP hasil triase | ❌ Tidak terkonfirmasi | MEDIUM | SECURITY-AUDIT.md §2.3 |
| **Wajib:** Audit trail untuk setiap keputusan AI | ❌ Belum diimplementasi | MEDIUM | SECURITY-AUDIT.md §2.2 |
| **Wajib:** UU PDP 2022 compliance review | ❌ Multiple gaps | HIGH | SECURITY-AUDIT.md §2.1-2.4 |
| **Wajib:** HTTPS untuk semua koneksi cloud | ✅ Otomatis dari Vercel | — | SECURITY-AUDIT.md §5 |
| **P1:** Differential privacy (ε=1.0, δ=10⁻⁵) untuk federated learning | ⏳ Milestone 7 | MEDIUM | SECURITY-AUDIT.md §3.1 |
| **P1:** Validasi input di semua boundary | ✅ Zod schema di semua endpoint | — | SECURITY-AUDIT.md §5 |

---

## 11. Catatan untuk corex-architect

1. **Stack berubah dari dokumen referensi:** Tech Spec lama pakai React Native (Expo). Sekarang **PWA murni**. Seluruh arsitektur frontend perlu dirancang ulang.
2. **TF.js WASM vs TF-Lite Native:** Karena PWA, model harus jalan di browser. Evaluasi TF.js WASM backend vs WebGL vs WebNN.
3. **Service Worker perlu menyimpan model AI** di Cache API untuk akses offline cepat.
4. **SQLite di browser:** Evaluasi sql.js (WASM) vs IndexedDB wrapper. Pertimbangan: SQLCipher mungkin tidak tersedia di sql.js — perlu arsitektur enkripsi alternatif.
5. **CRDT library:** Pilih antara Yjs (lebih mature) atau Automerge.
6. **Dashboard Puskesmas:** Bisa jadi Next.js app terpisah (SSR untuk performa) atau halaman terproteksi dalam PWA yang sama.
7. **Lihat docs/reference/BRD-EXISTING.md dan TECH-SPEC-EXISTING.md** untuk detail teknis tambahan yang mungkin berguna.

---

*Dokumen ini adalah source of truth untuk seluruh fase pengembangan MediSense AI. Update dokumen ini jika ada perubahan scope atau keputusan arsitektur.*
