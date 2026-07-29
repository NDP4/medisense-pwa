# Technical Stack & Architecture
## MediSense AI — AI-Powered Triage & Early Disease Detection Platform

**Versi:** 1.0
**Arsitek:** corex-architect
**Tanggal:** 28 Juli 2026
**Status:** Final

---

## 1. Ringkasan Arsitektur

MediSense AI menggunakan **arsitektur tiga lapis (three-layer architecture)** yang berjalan sepenuhnya di sisi klien untuk operasi inti, dengan lapisan cloud opsional untuk agregasi data dashboard.

```
┌─────────────────────────────────────────────────────────┐
│  LAYER 1 — ON-DEVICE PWA (Browser)                      │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐      │
│  │ Next.js  │  │ Service  │  │ TF.js WASM/WebGL │      │
│  │ App (PWA)│  │ Worker   │  │ AI Inference     │      │
│  ├──────────┤  │ (Workbox)│  ├──────────────────┤      │
│  │ Zustand  │  │ Cache    │  │ Whisper WASM     │      │
│  │ State    │  │ First    │  │ Voice-to-Text    │      │
│  └──────────┘  └──────────┘  └──────────────────┘      │
│         │              │               │                │
│         ▼              ▼               ▼                │
│  ┌─────────────────────────────────────────────────┐   │
│  │  LAYER 2 — LOCAL DATA ENGINE                    │   │
│  │  ┌────────────┐  ┌──────────┐  ┌────────────┐   │   │
│  │  │ IndexedDB  │  │ Yjs     │  │ Web Crypto │   │   │
│  │  │ (Dexie.js) │  │ CRDT    │  │ AES-256-GCM│   │   │
│  │  └────────────┘  └──────────┘  └────────────┘   │   │
│  └─────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────┘
                       │ Sinkronisasi (saat online)
                       ▼
┌─────────────────────────────────────────────────────────┐
│  LAYER 3 — CLOUD (OPSIONAL, untuk Dashboard & Sync)     │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐      │
│  │ Vercel   │  │ Supabase │  │ CouchDB /        │      │
│  │ Hosting  │  │ Auth + DB│  │ PouchDB Sync     │      │
│  └──────────┘  └──────────┘  └──────────────────┘      │
│                                                         │
│  Dashboard Puskesmas (Web, role-based access)           │
└─────────────────────────────────────────────────────────┘
```

**Prinsip arsitektur:**
- **Offline-first:** Semua fitur triase inti (input gejala → inferensi AI → hasil) berjalan 100% offline tanpa koneksi internet
- **On-device AI:** Model TF-Lite dijalankan di browser via TensorFlow.js — tidak ada microservice Python untuk inferensi
- **Privasi-by-design:** Data pasien (PII) tidak pernah meninggalkan device. Hanya metadata anonim yang disinkronkan ke cloud
- **Budget-aware:** Semua layanan cloud menggunakan free tier hingga 5.000 pengguna aktif bulanan

---

## 2. Stack Decisions

### 2.1 Frontend PWA

| Komponen | Pilihan | Justifikasi |
|----------|---------|-------------|
| Framework | **Next.js 14+** (App Router) | SSR untuk dashboard Puskesmas, static generation untuk halaman PWA, API Routes monorepo — menghemat biaya hosting karena frontend + backend jadi satu deployment |
| PWA Engine | **Workbox** (dibundel di next-pwa atau @serwist/next) | Mature, terintegrasi dengan Next.js, strategi cache flexible (cache-first untuk model AI) |
| State Management | **Zustand** | Ukuran ~1KB, tanpa boilerplate, performa baik di device entry-level |
| UI Components | **Tailwind CSS + shadcn/ui** | Ringan, tree-shakeable, aksesibilitas baik, cocok untuk pengguna literasi rendah (font besar, kontras tinggi) |
| Icons | **Lucide Icons** (SVG) | Ringan, tidak perlu font icon, mendukung warna kustom untuk triase Hijau/Kuning/Merah |
| Bundler | **Turbopack** (Next.js built-in) | Cepat untuk development, optimasi otomatis untuk production |

### 2.2 AI Inference (WAJIB On-Device Browser)

| Komponen | Pilihan | Justifikasi |
|----------|---------|-------------|
| Runtime | **TensorFlow.js** dengan **XNNPACK WASM backend** | Satu-satunya opsi yang memungkinkan TF-Lite model jalan di browser. XNNPACK WASM backend dipilih karena optimasi untuk CPU (tidak butuh GPU) — krusial untuk device entry-level |
| Format Model | **TF.js Graph Model** (konversi dari .tflite INT8) | TF-Lite model (.tflite) dikonversi ke format TF.js GraphModel via TensorFlow.js converter. Ukuran tetap kecil karena INT8 quantized |
| Loading Strategy | **Cache-first via Service Worker** | Model AI disimpan di Cache API saat pertama kali diinstal. Semua sesi berikutnya offline |
| Fallback | **WebGL backend** (TF.js) | Untuk device yang tidak mendukung WASM dengan baik. Performa mungkin lebih lambat, tetapi tetap berfungsi |
| Latensi Target | **<800 ms** per inferensi | Diuji pada Snapdragon 450 (2019, low-end). Jika tidak tercapai, turunkan kompleksitas model |
| Ukuran Model | **<15 MB** (MVP 5 kondisi) → **<50 MB** (47 kondisi penuh) | Setelah INT8 quantisasi. Diprediksi ~3MB per kondisi |

**Pipeline konversi model:**
```
Python (Keras/TF) → .h5 → .tflite (INT8 quantized) → TF.js Graph Model → 
Disimpan di public/models/ → Dload via Service Worker install
```

### Model Serving Strategy (Updated)

| Format | Size | Backend | Status |
|--------|------|--------|--------|
| TF.js GraphModel | 29 KB | Browser (WASM) | ✅ Ready at `public/models/medisense_model_tfjs/` |
| TF-Lite FP16 | 17 KB | Mobile (fallback) | ✅ Ready |
| TF-Lite INT8 | 8.8 KB | Mobile (optimized) | ✅ Ready |
| Keras H5 | 531 KB | Training | ✅ Ready |

**Model Path:** Load TF.js model from `/models/medisense_model_tfjs/model.json`
**Inference:** 100% offline via TF.js WASM backend (no cloud calls for triage)
**Features (23):** age, gender, bmi, heart_rate, respiratory_rate, systolic_bp, diastolic_bp, temperature, spo2, wbc, hemoglobin, platelet, creatinine, glucose, sodium, bicarbonate, fever, cough, dyspnea, confusion, chest_pain, diarrhea, cyanosis
**Output:** [sepsis_prob, pneumonia_prob] — both float 0-1
**Triage Logic:** If either prob > 0.7 → MERAH, > 0.3 → KUNING, else HIJAU

⚠️ Current model trained on **synthetic data** for demo. Replace with real-clinical model when available.

### 2.3 Voice Recognition

| Komponen | Pilihan | Justifikasi |
|----------|---------|-------------|
| Engine | **Whisper.cpp** via **WASM** (GGML port) | Satu-satunya solusi STT offline yang realistic untuk bahasa Indonesia + daerah. Ukuran ±40MB/bahasa |
| Loading | **Lazy-load per bahasa** | Hanya download model bahasa yang dipilih user saat onboarding. Disimpan di IndexedDB |
| Bahasa Awal | Bahasa Indonesia, Jawa, Sunda, Batak, Bugis, Papua | 5 bahasa daerah dengan penutur terbanyak |
| WER Target | **<15%** | Dalam kondisi lingkungan bising (klinik desa) |
| Fallback | **Input teks manual** | Jika voice gagal atau tidak didukung device |

### 2.4 Local Storage

| Komponen | Pilihan | Justifikasi |
|----------|---------|-------------|
| Database | **IndexedDB via Dexie.js** | BUKAN sql.js. Alasan: sql.js (WASM SQLite) sinkronus dan bisa memblokir UI thread. IndexedDB async, lebih cocok untuk PWA. Dexie.js memberikan wrapper yang ergonomis |
| Enkripsi | **Web Crypto API (AES-256-GCM)** | SQLCipher tidak tersedia di browser. Web Crypto API adalah native browser, performa baik, dan AES-256-GCM sudah cukup untuk compliance data kesehatan |
| Struktur Data | **Tabel utama:** `patients`, `triage_sessions`, `symptoms`, `ai_decisions` (audit trail), `sync_queue` | Semua tabel dienkripsi per-field untuk data sensitif |
| Riwayat | **Retensi lokal 2 tahun** | Sesuai standar rekam medis dasar. Data lama bisa diarsipkan |

### 2.5 Offline Sync

| Komponen | Pilihan | Justifikasi |
|----------|---------|-------------|
| CRDT Library | **Yjs** | Lebih mature dari Automerge. Ekosistem lebih besar (y-indexeddb, y-websocket, y-couchdb). Performa lebih baik di dokumen besar |
| Provider Offline | **y-indexeddb** | Menyimpan dokumen Yjs di IndexedDB. Terintegrasi dengan Dexie.js |
| Provider Cloud | **CouchDB** via PouchDB adapter | PouchDB di browser ↔ CouchDB di cloud. Cocok untuk offline-first. Target data loss <0.1% |
| Strategi Sinkronisasi | **Periodik (setiap 5 menit saat online) + Event-driven (setelah triase)** | Tidak real-time untuk hemat baterai. User juga bisa trigger manual |
| Retry Queue | **Exponential backoff** | Jika gagal sync, retry dengan delay 1menit → 5menit → 30menit → 2jam |

### 2.6 Backend & Cloud

| Komponen | Pilihan | Justifikasi |
|----------|---------|-------------|
| API Backend | **Next.js API Routes** (monorepo) | Satu deployment dengan frontend. Hemat biaya. Cukup untuk MVP dengan traffic rendah |
| Database Cloud | **Supabase** (free tier: 500MB) | Cukup untuk MVP. PostgreSQL di bawahnya, siap scale. Juga menyediakan Auth + Storage |
| Hosting | **Vercel** (free tier) | Optimal untuk Next.js. Edge functions untuk API. Bandwidth 100GB/bulan gratis |
| Auth | **Supabase Auth** | Terintegrasi dengan database. Support role-based access untuk kader/bidan/kepala Puskesmas |
| File Storage | **Vercel Blob** (free tier 250MB) | Untuk menyimpan ilustrasi gejala dan aset statis |
| Monitoring | **Vercel Analytics + Sentry** (free tier) | Error tracking + usage analytics. Budget-friendly |

### 2.7 Dashboard Puskesmas

| Komponen | Pilihan | Justifikasi |
|----------|---------|-------------|
| Pendekatan | **Protected routes dalam PWA yang sama** | Bukan app terpisah. Alasan: satu deployment, satu domain, reuse komponen. Akses dashboard via role-based routing setelah login |
| Framework | **Next.js App Router** (sama dengan PWA) | SSR untuk SEO (dashboard publik) + static generation (dashboard internal) |
| Role Access | 3 level: Kader, Bidan, Kepala Puskesmas | Kader: lihat riwayat sendiri. Bidan: lihat wilayah. Kepala Puskesmas: full dashboard + early warning |
| Early Warning | **Agregasi anonim** + threshold outbreak | Deteksi lonjakan kasus >2 SD dari rata-rata 7 hari terakhir. Notifikasi ke dashboard |

---

## 3. Definisi Kontrak API

> **Implementasi aktual**: `src/app/api/` — semua endpoint menggunakan Next.js App Router Route Handlers.
> **Validasi**: Semua input divalidasi dengan Zod schema.
> **Autentikasi**: Middleware di `src/middleware.ts` — JWT Bearer token, role-based access.
> **⚠️ TIDAK** ada endpoint yang menerima gejala mentah untuk prediksi — prediksi AI 100% on-device di browser.

### 3.1 Sinkronisasi Data

#### `POST /api/sync/triage`
**Deskripsi:** Sinkronisasi sesi triase dari PWA client ke cloud. Menerima data yang **sudah diproses** di client (prediksi AI sudah selesai on-device).  
**Auth:** JWT (kader/bidan/puskesmas)  
**File:** `src/app/api/sync/triage/route.ts`

**Request Body:**
```typescript
{
  triage_id: string;               // UUID generated on-device
  device_id: string;               // UUID device identifier
  kader_id: string;                // UUID kader
  village_id?: string;             // UUID desa (opsional)
  patient_hash: string;            // SHA-256 hash (anonim — NO PII)
  patient_age?: number;            // usia tahun (opsional, agregasi)
  patient_gender?: number;         // 0=F, 1=M (opsional, agregasi)
  triage_level: "hijau"|"kuning"|"merah";
  conditions: [{                   // hasil prediksi AI (multi-label)
    condition: string;             // kode kondisi: "sepsis" | "pneumonia_balita"
    confidence: number;            // 0.0 - 1.0
    triage_level: "hijau"|"kuning"|"merah";
  }];
  triage_started_at: string;       // ISO 8601
  triage_completed_at: string;     // ISO 8601
  model_version?: string;          // versi model AI yang digunakan
  app_version?: string;            // versi PWA
  audit_trail?: object[];          // log keputusan AI (setiap langkah)
  voice_text?: string;             // transkripsi voice (opsional)
}
```

**Response (201):**
```typescript
{ success: true, sync_timestamp: "2026-07-29T..." }
```

**Response (400 — validasi gagal):**
```typescript
{ success: false, sync_timestamp: "...", error: "Validation failed: ..." }
```

#### `GET /api/sync/pending`
**Deskripsi:** Ambil daftar data yang perlu disinkronkan ke device (model update, config change, rekomendasi).  
**Auth:** JWT (kader/bidan/puskesmas)  
**File:** `src/app/api/sync/pending/route.ts`  
**Query:** `?device_id=UUID&current_model_version=v1.0`

**Response:**
```typescript
{
  updates: object[];                  // [{ type: "model_update", version, url, sha256, size_bytes }, ...]
  model_version: string;             // versi model terbaru
}
```

### 3.2 Dashboard Puskesmas

#### `GET /api/dashboard/summary`
**Deskripsi:** Ringkasan dashboard untuk Puskesmas — agregasi tren penyakit, distribusi triase, early warning.  
**Auth:** JWT (role: bidan — lihat wilayah sendiri; puskesmas — full)  
**File:** `src/app/api/dashboard/summary/route.ts`  
**Query:** `?puskesmas_id=UUID&periode=30d` (periode: `7d`|`30d`|`90d`, default: `30d`)

**Response:**
```typescript
{
  total_triages: number;
  triage_by_level: { hijau: number, kuning: number, merah: number };
  conditions_breakdown: { sepsis: number, pneumonia_balita: number };
  daily_trend: [{ date: string, total: number, merah: number, kuning: number, hijau: number }];
  active_kaders: number;
  unique_patients: number;           // berdasarkan patient_hash unik
  early_warnings: [{                 // kondisi yang melonjak (>2SD dari rata2 7 hari)
    condition: string;
    current_count: number;
    avg_7day: number;
    z_score: number;
    severity: "normal"|"warning"|"critical"|"insufficient_data";
  }];
}
```

#### `GET /api/dashboard/kaders`
**Deskripsi:** Daftar kader dan ringkasan performa mereka.  
**Auth:** JWT (role: puskesmas — full; bidan — wilayah sendiri)  
**File:** `src/app/api/dashboard/kaders/route.ts`  
**Query:** `?puskesmas_id=UUID`

**Response:**
```typescript
{
  kaders: [{
    id: string;
    full_name: string;
    total_triages: number;
    last_active: string | null;      // ISO 8601
    village_name: string;
  }];
}
```

### 3.3 Model & System

#### `GET /api/models/latest`
**Deskripsi:** Cek versi model AI terbaru.  
**Auth:** Public (no auth) — response tanpa signature untuk MVP, akan ditambahkan HMAC di milestone lanjutan.  
**File:** `src/app/api/models/latest/route.ts`

**Response:**
```typescript
{
  version: string;                   // semantic version, e.g. "1.0.0"
  size_bytes: number;
  url: string;                       // download URL
  sha256: string;                    // integrity hash
}
```

#### `GET /api/health`
**Deskripsi:** Health check — status server + koneksi database.  
**Auth:** Public  
**File:** `src/app/api/health/route.ts`

**Response:**
```typescript
{
  status: "ok" | "degraded";
  timestamp: string;
  version: string;
  database: "connected" | "error: ...";
}
```

### 3.4 Autentikasi

#### `POST /api/auth/register`
**Deskripsi:** Registrasi user baru (kader, bidan, puskesmas). Membuat user di Supabase Auth + profil.  
**Auth:** Public  
**File:** `src/app/api/auth/register/route.ts`

**Request Body:**
```typescript
{
  full_name: string;                 // min 3, max 100
  phone: string;                     // format Indonesia: 08xx / +628xx / 628xx
  password: string;                  // min 8 karakter
  role: "kader"|"bidan"|"puskesmas";
  puskesmas_id: string;              // UUID, validasi exist
  region?: string;                   // kecamatan/kabupaten
}
```

**Response (201):**
```typescript
{
  user: { id: string, full_name: string, role: string, puskesmas_id: string };
  token: string;                     // JWT untuk akses selanjutnya
}
```

#### `POST /api/auth/login`
**Deskripsi:** Login via phone + password.  
**Auth:** Public  
**File:** `src/app/api/auth/login/route.ts`

**Request Body:**
```typescript
{
  phone: string;
  password: string;
}
```

**Response (200):**
```typescript
{
  user: { id: string, full_name: string, role: string, puskesmas_id: string };
  token: string;                     // JWT
}
```

### 3.5 Middleware — Autentikasi & Otorisasi

**File:** `src/middleware.ts`

| Route Pattern | Required Role | Status Code |
|--------------|---------------|-------------|
| `POST /api/sync/triage` | kader, bidan, puskesmas | 401/403 |
| `GET /api/sync/pending` | kader, bidan, puskesmas | 401/403 |
| `GET /api/dashboard/summary` | bidan, puskesmas | 401/403 |
| `GET /api/dashboard/kaders` | puskesmas | 401/403 |
| `POST /api/auth/*` | Public | — |
| `GET /api/health` | Public | — |
| `GET /api/models/latest` | Public | — |

**Flow:** Request → Middleware ekstrak JWT dari `Authorization: Bearer <token>` → Decode payload → Cek role → Forward dengan header `x-medisense-user-id` dan `x-medisense-user-role`.

---

## 4. Struktur Repo

```
medisense-pwa/
├── .github/
│   └── workflows/
│       └── ci.yml                 # CI workflow
├── src/
│   ├── app/                       # Next.js App Router pages
│   │   ├── (pwa)/                 # PWA routes (offline triage)
│   │   │   ├── triage/
│   │   │   ├── history/
│   │   │   └── profile/
│   │   ├── (dashboard)/           # Dashboard routes (protected)
│   │   │   ├── dashboard/
│   │   │   ├── kaders/
│   │   │   └── early-warning/
│   │   ├── api/                   # API Routes (monorepo)
│   │   │   ├── sync/
│   │   │   ├── dashboard/
│   │   │   ├── auth/
│   │   │   └── models/
│   │   └── layout.tsx
│   ├── components/                # UI components
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── triage/                # Triage-specific components
│   │   └── dashboard/             # Dashboard-specific components
│   ├── lib/                       # Utilities & business logic
│   │   ├── db.ts                  # Dexie.js database setup
│   │   ├── crypto.ts              # Web Crypto API wrapper
│   │   ├── triage-engine.ts       # TF.js inference wrapper
│   │   ├── sync.ts                # Sync manager
│   │   └── voice.ts               # Whisper WASM wrapper
│   ├── store/                     # Zustand stores
│   │   ├── triage-store.ts
│   │   └── auth-store.ts
│   └── workers/
│       └── sw.ts                  # Service Worker (Workbox)
├── ml/                            # ML pipeline (terpisah dari PWA)
│   ├── data/
│   │   ├── raw/                   # Dataset mentah (gitignored)
│   │   └── processed/             # Dataset terproses
│   ├── notebooks/
│   │   ├── 01-eda.ipynb
│   │   └── 02-training.ipynb
│   ├── models/                    # Model artifacts (gitignored, kecuali sample)
│   │   └── sample/                # Sample small model untuk testing
│   └── scripts/
│       ├── preprocess.py
│       ├── train.py
│       └── convert_to_tfjs.py
├── public/
│   ├── models/                    # TF.js model files (deployed)
│   ├── illustrations/             # Symptom illustrations (47 SVG/icons)
│   └── manifest.json              # PWA manifest
├── docs/
│   ├── PRD.md
│   ├── TECH-STACK.md
│   ├── STATUS.md
│   └── VERSIONING.md
├── dataset/                       # MIMIC-IV demo (tidak dipindah)
├── .env.local                     # Local env (gitignored)
├── .env.example                   # Template env
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 5. Catatan Keamanan & Compliance

| Area | Implementasi | Keterangan |
|------|-------------|------------|
| Enkripsi lokal | **Web Crypto API AES-256-GCM** | Setiap field PII dienkripsi sebelum disimpan di IndexedDB |
| Data ke cloud | **Hanya metadata anonim** | Pasien di-hash (SHA-256), tidak ada nama/alamat/KK dikirim |
| Koneksi cloud | **HTTPS wajib** | Semua endpoint API via HTTPS. Sertifikat otomatis dari Vercel |
| Disclaimer medis | **Otomatis di setiap hasil triase** | "Hasil ini adalah alat bantu, bukan diagnosis dokter. Segera hubungi tenaga kesehatan." |
| Audit trail | **Setiap keputusan AI tercatat** | Timestamp, input gejala, output model, confidence score, device ID. Disimpan lokal |
| UU PDP 2022 | **Compliance review** | Prinsip: data minim, hak subjek data, persetujuan eksplisit di onboarding |
| Autentikasi | **Supabase Auth + JWT** | Role-based access control (kader/bidan/puskesmas) |
| Dependency | **npm audit di CI** | Setiap build akan scan dependency untuk known vulnerabilities |

---

## 6. Unresolved Decisions

| No | Masih Perlu Diputuskan | Dampak | Direkomendasikan |
|----|----------------------|--------|-----------------|
| 1 | **Whisper.cpp WASM port spesifik** — beberapa port tersedia (ggml-whisper.js, whisper-wasm, dll). Perlu diuji mana yang stabil di Chrome Android | Mempengaruhi ukuran bundle dan kompatibilitas | Uji coba dengan whisper-wasm dari whisper.cpp repo |
| 2 | **WebNN API** — Chrome sedang mengadopsi WebNN untuk akselerasi ML hardware. Bisa jadi fallback atau pengganti TF.js di masa depan | Potensi peningkatan performa 2-3x | Pantau perkembangan, implementasi di fase lanjutan |
| 3 | **Ekspansi bahasa daerah** — setelah 5 bahasa awal, daerah mana selanjutnya? (Makassar, Madura, Bali, Minang) | Cakupan pengguna | Tentukan berdasarkan data demografis pilot |
| 4 | **Strategi update model** — mekanisme push model baru ke device tanpa bikin user download ulang PWA via Service Worker update | Kenyamanan update | Implementasi di Milestone 3 bersamaan dengan SW lifecycle |
| 5 | **Sinkronisasi CouchDB vs Supabase Realtime** — CouchDB lebih mature untuk sync offline, tapi Supabase Realtime juga mendukung | Biaya operasional vs kemudahan | Mulai dengan CouchDB (via PouchDB adapter) karena sudah teruji untuk offline-first |

---

*Dokumen ini adalah referensi arsitektur utama untuk seluruh fase pengembangan MediSense AI. Update jika ada perubahan keputusan teknis.*
