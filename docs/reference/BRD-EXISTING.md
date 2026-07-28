# Business Requirements Document (BRD)
## MediSense AI — AI-Powered Triage & Early Disease Detection Platform

**Versi:** 1.0 (direkonstruksi dari Proposal MediSense AI, 2026)
**Disusun oleh:** MediSense AI Team — Program Diploma III Teknik Informatika
**Status:** Completed (sesuai Tabel 1 & Tabel 6 Proposal)

---

## 1. Ringkasan Eksekutif

MediSense AI adalah platform triase dan deteksi dini penyakit berbasis AI yang dirancang untuk menjawab krisis akses layanan kesehatan di wilayah 3T (Terdepan, Terluar, Tertinggal) Indonesia, yang menaungi **63 juta penduduk**. Platform berjalan **offline-first**, dengan model AI ringan yang berjalan langsung di perangkat pengguna (on-device AI), tanpa membutuhkan koneksi internet untuk fungsi inti triase.

---

## 2. Latar Belakang Bisnis

- Rasio dokter terhadap populasi di wilayah 3T: **1:8.400** (7x lebih buruk dari rata-rata nasional; jauh dari standar WHO 1:1.000).
- Keterlambatan diagnosis penyakit kritis rata-rata **12–48 jam**, berkontribusi pada **47% kematian yang sebenarnya dapat dicegah**.
- **67,4%** wilayah 3T tidak memiliki konektivitas internet yang stabil.
- **58,3%** kader kesehatan lebih nyaman berkomunikasi dalam bahasa daerah dibanding Bahasa Indonesia.
- Lima kondisi medis penyebab kematian tercegah tertinggi: sepsis (12.400/tahun), stroke iskemik (9.800), pre-eklampsia (7.200), demam berdarah dengue (5.600), pneumonia balita (14.200).
- Peluang: **78,9%** kader sudah memiliki smartphone Android; **97,8%** bersedia menggunakan aplikasi panduan medis bila mudah dioperasikan (survei internal, n=1.247, Cronbach's α = 0,84).

---

## 3. Tujuan Bisnis (Business Objectives)

| No | Tujuan | Target Terukur |
|----|--------|-----------------|
| 1 | Triase gejala offline di smartphone entry-level | Android 7.0+, RAM 2 GB, model <50 MB |
| 2 | Akurasi model AI triase | >91% (sensitivitas >95% untuk kondisi darurat) |
| 3 | Interface untuk pengguna literasi digital rendah | Task completion rate >85% tanpa pelatihan formal |
| 4 | Peningkatan model berkelanjutan berbasis privasi | Federated learning, data anonim & lokal |
| 5 | Validasi lapangan | ≥3 desa, 30 kader aktif, validasi klinis dengan Puskesmas mitra |

---

## 4. Pemangku Kepentingan (Stakeholders)

| Stakeholder | Kebutuhan Utama |
|---|---|
| Kader kesehatan desa | Alat triase akurat, mudah digunakan, tanpa internet |
| Bidan desa | Notifikasi proaktif ibu hamil risiko tinggi |
| Kepala Puskesmas | Dashboard monitoring kader & deteksi dini wabah (72 jam sebelum eskalasi) |
| Pasien wilayah terpencil | Akses panduan kesehatan standar tanpa perjalanan jauh |
| Dinas Kesehatan / Kemenkes | Integrasi dengan sistem nasional (e-Puskesmas, SIMRS) |

---

## 5. Ruang Lingkup (Scope)

**Termasuk dalam scope:**
- PWA (Progressive Web App) triase offline berbasis TensorFlow Lite
- Input multimodal: 47 ilustrasi gejala visual + voice input (Whisper.cpp, Bahasa Indonesia + 5 bahasa daerah: Jawa, Sunda, Batak, Bugis, Papua)
- Sistem warna triase 3 tingkat (Hijau/Kuning/Merah)
- Panggilan darurat satu-tap ke 119
- Gamifikasi komunitas (leaderboard desa, badge)
- Dashboard web Puskesmas (Next.js)
- Sinkronisasi data offline-to-cloud (PouchDB/CouchDB + CRDT)
- Federated learning untuk peningkatan model hyper-lokal

**Di luar scope (fase ini):**
- Sertifikasi sebagai alat medis resmi (direkomendasikan untuk fase lanjutan)
- Integrasi penuh SIMRS Kemenkes (roadmap Bulan 24)
- Modul deteksi stunting/wasting (rencana pengembangan mendatang)
- Sensor wearable IoT (rencana versi 3.0)

---

## 6. Deliverables Bisnis

| No | Deliverable | Status |
|---|---|---|
| 1 | MediSense AI PWA (Android 7.0+) | In Development |
| 2 | Model triase TF-Lite (>91% akurasi, <50 MB, INT8) | In Development |
| 3 | Modul voice input offline (Whisper.cpp) | In Development |
| 4 | Dashboard web Puskesmas (Next.js) | In Development |
| 5 | Sistem sinkronisasi data (PouchDB/CouchDB + CRDT) | In Development |
| 6 | Laporan pilot testing (≥3 desa, 30+ kader) | Not Yet Started |
| 7 | Dokumentasi lengkap (BRD, PRD, Tech Spec, User Manual) | Completed |
| 8 | Publikasi jurnal terindeks internasional | Not Yet Started |

---

## 7. Target Pertumbuhan & KPI Bisnis

| KPI | Bulan 6 (Pilot) | Bulan 12 | Bulan 24 |
|---|---|---|---|
| Kader aktif | 30 (3 desa) | 500 (5 kabupaten) | 10.000 (50+ kabupaten) |
| Sesi triase | 150+ | 5.000+ | 100.000+ |
| Waktu triase rata-rata | ≤15 menit | ≤12 menit | ≤10 menit |
| Peningkatan rujukan tepat waktu | +30% | +45% | +60% |
| Akurasi model AI | >91% | >93% | >95% |
| Puskesmas terhubung | 3 | 15 | 100+ |
| Integrasi sistem pemerintah | — | Pilot API e-Puskesmas | Integrasi penuh SIMRS Kemenkes |

---

## 8. Anggaran (Ringkasan Bisnis)

- **Total anggaran:** IDR 3.200.000 (± USD 200)
- Prinsip: **zero marginal cost at scale** — inferensi AI berjalan di perangkat kader, layanan cloud tetap dalam batas free-tier hingga 5.000 pengguna aktif bulanan.
- Rencana keberlanjutan: MoU dengan Dinas Kesehatan, pengajuan dana inovasi Kemenkes (BOK Nusantara), arsitektur API modular kompatibel dengan RME nasional, serta pengurangan ketergantungan server seiring pematangan federated learning.

---

## 9. Manfaat Bisnis

- **Sosial:** Kader kesehatan menjadi garda depan deteksi dini penyakit tanpa internet.
- **Sains & Teknologi:** Studi rujukan on-device ML dan federated learning untuk kesehatan pedesaan Indonesia.
- **Pembangunan Nasional:** Mendukung Perpres No. 18/2020, SDG 3 & SDG 10, serta potensi integrasi e-Puskesmas/SIMRS Kemenkes.

---

## 10. Asumsi & Batasan

- Kader kesehatan memiliki smartphone Android RAM ≥2 GB (asumsi tervalidasi survei internal, n=1.247).
- Ketersediaan listrik untuk pengisian daya perangkat di desa pilot.
- Model AI merupakan alat bantu triase, bukan pengganti diagnosis dokter — memerlukan disclaimer medis otomatis dan jalur eskalasi ke tenaga kesehatan profesional (sesuai standar WHO SMART Guidelines).
- Kepatuhan terhadap UU PDP 2022 dan Permenkes No. 46/2017 terkait privasi data pasien.

---

## 11. Risiko Bisnis Utama

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Adopsi rendah karena takut "salah pencet" (71% kader) | Penggunaan aplikasi rendah | Desain visual-first, onboarding 30 menit dengan panduan bergambar |
| Akurasi model belum tervalidasi klinis skala besar | Risiko keselamatan pasien | Validasi klinis retrospektif ≥50 kasus (pilot), ≥500 kasus (rekomendasi lanjutan) |
| Ketergantungan free-tier cloud | Gangguan layanan saat skala besar | Dana kontingensi IDR 500.000 + FL mengurangi beban server dari waktu ke waktu |
| Keterbatasan bahasa daerah (baru 5 dari banyak bahasa daerah) | Eksklusi sebagian pengguna | Roadmap ekspansi bahasa (Makassar, Madura, Bali, Minang) |

---

*Dokumen ini direkonstruksi dari isi Proposal MediSense AI (2026) karena berkas BRD asli tidak turut diunggah. Untuk detail lengkap KPI, metodologi riset, dan referensi ilmiah, lihat proposal sumber.*
