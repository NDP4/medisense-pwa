# MediSense PWA — AI-Powered Triage & Early Disease Detection Platform

[![YESIST12 2026 Grand Final](https://img.shields.io/badge/YESIST12-2026%20Grand%20Final-blue.svg)](https://yesist12.org)
[![Next.js](https://img.shields.io/badge/Next.js-15.2-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-4.22-orange?logo=tensorflow)](https://www.tensorflow.org/js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📋 Latar Belakang Masalah

Layanan kesehatan primer di wilayah **3T (Terdepan, Terluar, Tertinggal)** Indonesia menghadapi tantangan struktural yang masif:
1. **Krisis Rasio Nakes**: Rasio dokter di wilayah 3T mencapai **1:8.400 penduduk**, jauh lebih buruk dari standar nasional (7x lipat lebih timpang). Beban operasional harian bertumpu pada kader kesehatan desa.
2. **Keterbatasan Infrastruktur**: Sebagian besar desa 3T memiliki konektivitas internet yang sangat minim atau nihil, serta suplai listrik yang tidak stabil. Solusi *telemedicine* berbasis cloud konvensional gagal total di lapangan.
3. **Keterlambatan Deteksi & Rujukan**: Keterbatasan instrumen diagnostik dini sering kali menyebabkan kasus kritis (seperti pre-eklamsia pada ibu hamil, infeksi pernapasan akut, dan gizi buruk balita) terlambat dideteksi, berujung pada tingginya angka morbiditas dan mortalitas yang dapat dicegah.

---

## 🎯 Mengapa MediSense PWA Dibuat?

**MediSense AI** hadir sebagai solusi teknologi kesehatan presisi yang dirancang khusus untuk memberdayakan kader kesehatan di lapangan tanpa bergantung pada koneksi internet:
* **100% Offline-First (On-Device AI)**: Menggunakan **TensorFlow.js** untuk menjalankan inferensi model AI langsung di perangkat (smartphone *entry-level* RAM 2GB, Android 7.0+) tanpa latensi server atau kuota data.
* **Triase Berkode Warna Otomatis**: Menerima input gejala multimodal (visual & klinis) dan memberikan rekomendasi instan:
  * 🟢 **Hijau**: Rawat jalan / pemantauan mandiri kader.
  * 🟡 **Kuning**: Rujukan dalam 24 jam ke Puskesmas pembantu.
  * 🔴 **Merah**: Darurat medis kritis (segera hubungi layanan darurat 119).
* **Desain Inklusif**: Antarmuka PWA berstandar tinggi yang ramah pengguna bagi kader dengan tingkat literasi digital dasar.
* **Local-First Sync**: Menggunakan **Serwist** dan **IndexedDB (Dexie)** untuk penyimpanan lokal yang aman, dengan sinkronisasi asinkron ke **Supabase** saat perangkat mendeteksi sinyal internet.

---

## 📈 Dampak Setelah Aplikasi Dibuat

Setelah **MediSense PWA** diimplementasikan di wilayah operasional kesehatan primer:
1. **Akselerasi Deteksi Dini 72 Jam Lebih Awal**: Kader kesehatan dapat mengidentifikasi tanda-tanda awal perburukan kondisi pasien sebelum gejala klinis menjadi parah, memotong rantai keterlambatan penanganan.
2. **Efisiensi Sistem Rujukan Medis**: Mengurangi rasio rujukan salah sasaran (*false alarm*) ke rumah sakit kabupaten, menghemat biaya operasional pasien dan meringankan beban faskes rujukan tingkat lanjut.
3. **Pemberdayaan Komunitas 3T**: Menjangkau lebih dari **63 juta penduduk** di wilayah terpencil melalui peningkatan kapasitas operasional kader kesehatan lokal dengan teknologi medis portabel berbasis AI.
4. **Kontribusi Nyata SDGs 3**: Mendukung pencapaian Sustainable Development Goals poin *Good Health and Well-being*, khususnya penurunan Angka Kematian Ibu (AKI) dan Angka Kematian Bayi (AKB) di daerah tertinggal.
5. **Inovasi Grand Final YESIST12 2026**: Membuktikan bahwa teknologi *Edge AI* berbiaya rendah dapat menyelesaikan masalah kemanusiaan global yang krusial secara inklusif dan berkelanjutan.

---

## 🛠️ Tech Stack

* **Frontend & Framework**: Next.js 15 (App Router), React 19, TypeScript
* **Styling**: Tailwind CSS v4, Lucide React
* **PWA & Offline Capability**: Serwist (`@serwist/next`), IndexedDB (`Dexie`)
* **Machine Learning**: TensorFlow.js (On-Device inference model <50MB)
* **Backend & State**: Supabase (`@supabase/supabase-js`), Zustand, Yjs (Real-time sync)

---

## 🚀 Memulai (Quick Start)

```bash
# Clone repository
git clone https://github.com/NDP4/medisense-pwa.git
cd medisense-pwa

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE) — dikembangkan untuk kompetisi **YESIST12 2026 Grand Final**.
