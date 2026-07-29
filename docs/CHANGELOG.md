# Changelog MediSense AI

Semua perubahan signifikan pada proyek ini akan dicatat di sini.

Format berdasarkan [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
dan proyek ini mengikuti [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] — 2026-07-29

### Added

- **PRD (`docs/PRD.md`)** — Product Requirements Document final, 5 kondisi MVP dengan arsitektur scale-ready
- **TECH-STACK (`docs/TECH-STACK.md`)** — Arsitektur 3 layer, stack decisions, API contract, struktur repo
- **DESIGN (`docs/DESIGN.md`)** — Design system v2: warna triase (Hijau/Kuning/Merah), 6 wireframe ASCII, 25 brief ilustrasi SVG
- **FIGMA-HANDOFF (`docs/FIGMA-HANDOFF.md`)** — Handoff desain untuk frontend
- **VERSIONING (`docs/VERSIONING.md`)** — Semantic versioning + model versioning
- **ML Model Card (`docs/ML-MODEL-CARD.md`)** — Arsitektur Dense NN, evaluasi, keterbatasan
- **Status (`docs/STATUS.md`)** — Project tracker, milestone, log aktivitas

### ML Pipeline

- **Generate synthetic dataset** (`ml/scripts/generate_synthetic.py`) — 5000 samples (sepsis + pneumonia balita) dengan distribusi klinis realistis
- **Training** — Dense NN (64→32→16) with batch norm, dropout, attention gating, 4579 params
- **Model performance** — Sepsis AUC 0.938, Pneumonia AUC 0.96 on test set (synthetic data)
- **Model formats:**
  - TF.js GraphModel: `public/models/medisense_model_tfjs/` (29 KB)
  - TF-Lite FP16: `ml/models/medisense_model_fp16.tflite` (17 KB)
  - TF-Lite INT8: `ml/models/medisense_model_int8.tflite` (8.8 KB)
  - Keras H5: `ml/models/medisense_model.h5` (531 KB)
- **Preprocessing contract** (`ml/artifacts/preprocessing_contract.json`) — scaler params + feature order untuk JS parity
- **ML Deployment Guide** (`docs/ML-DEPLOYMENT.md`) — kontrak preprocessing, loading, triage logic, voice analysis (Vosk.js recommendation)

### Backend API

- **Directory structure** — Next.js App Router with `src/app/api/` monorepo
- **Middleware auth** (`src/middleware.ts`) — JWT Bearer validation, role-based access (kader/bidan/puskesmas)
- **Sync endpoints:**
  - `POST /api/sync/triage` — Sinkronisasi triase dari device ke cloud (Zod validation, upsert logic, device auto-registration)
  - `GET /api/sync/pending` — Ambil pending updates (model version, sync queue)
- **Dashboard endpoints:**
  - `GET /api/dashboard/summary` — Agregasi tren penyakit, distribusi triase, early warning signal
  - `GET /api/dashboard/kaders` — Daftar kader dan performa
- **Auth endpoints:**
  - `POST /api/auth/register` — Registrasi user (Supabase Auth + profile creation)
  - `POST /api/auth/login` — Login via phone + password
- **System endpoints:**
  - `GET /api/health` — Health check with database connectivity
  - `GET /api/models/latest` — Model version check (public)
- **Database schema** (`supabase/migrations/00001_init.sql`) — PostgreSQL: puskesmas, villages, user_profiles, devices, triage_sessions, sync_queue, model_versions, RLS policies, views, early warning function
- **TypeScript types** (`src/types/database.ts`) — Full type definitions for all tables + API request/response types
- **Supabase client** (`src/lib/supabase.ts`) — Server (service role) + client (anon key) helpers
- **TF.js Model loader** (`src/lib/medisense.ts`) — `MedisenseEngine` singleton: load, predict, warmup, dispose

### Infrastructure

- **Config files** — `package.json`, `tsconfig.json`, `next.config.ts`, `.env.example`, `.gitignore`
- **CI** — `.github/workflows/ci.yml`

## [0.2.0] — 2026-07-29

### Changed

- **Database migration executed** — `supabase/migrations/00001_init.sql` applied to Supabase Cloud project `jtkajnfafbzbvtyraydx`
- **Seed data** — 1 puskesmas demo (`Puskesmas Medisense Demo`), 3 villages (`Desa Sehat`, `Desa Tangguh`, `Desa Mandiri`), 1 model version (`v1.0.0`)
- **Connection note** — IPv6 direct connection unavailable; all DB operations via Management API (IPv4) or Supabase MCP with PAT
