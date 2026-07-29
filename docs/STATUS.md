# MediSense AI — Status Proyek

**Tier:** Corex Growth
**PRD Terakhir:** 28 Juli 2026
**Milestone Aktif:** M3 — PWA Inti

## Ringkasan Milestone

| Milestone | Target | Status | Catatan |
|-----------|--------|--------|---------|
| M1: Foundation & Dataset | Minggu 1-3 | ✅ | MIMIC-IV demo + NTD eval |
| M2: Model AI Demo | Minggu 4-8 | ✅ Selesai | Synthetic data, AUC 0.94-0.96, siap TF.js |
| M3: PWA Inti | Minggu 6-12 | 🔄 **Aktif** | Menunggu corex-frontend |
| M4: Voice + Sync | Minggu 10-16 | ⏳ | |
| M5: Keamanan & Testing | Minggu 14-20 | ⏳ | |
| M6: Pilot Lapangan | Minggu 18-24 | ⏳ | |
| M7: Federated Learning | Minggu 20-28 | ⏳ | |

## Artifacts Terkini

### Model (✅ DEMO — Sintetis)
| Artifact | Lokasi | Ukuran |
|----------|--------|--------|
| TF.js GraphModel | `public/models/medisense_model_tfjs/` | 29 KB |
| Keras H5 | `ml/models/medisense_model.h5` | 531 KB |
| TF-Lite FP16 | `ml/models/medisense_model_fp16.tflite` | 17 KB |
| TF-Lite INT8 | `ml/models/medisense_model_int8.tflite` | 8.8 KB |
| Eval Results | `ml/models/eval_results.json` | — |

### Deployment Artifacts (✅ corex-ml-engineer)
| Artifact | Lokasi | Fungsi |
|----------|--------|--------|
| Preprocessing Contract | `ml/artifacts/preprocessing_contract.json` | Scaler params + feature order |
| Deployment Guide | `docs/ML-DEPLOYMENT.md` | Kontrak preprocessing, loading, triage logic |
| TS Loader Engine | `src/lib/medisense.ts` | MedisenseEngine singleton — load, predict, warmup |

### Dataset Sintetis
| File | Lokasi | Size |
|------|--------|------|
| CSV data | `ml/data/synthetic/synthetic_data.csv` | 5000 × 23 |
| Labels | `ml/data/synthetic/synthetic_labels.npy` | 5000 × 2 |
| Generator script | `ml/scripts/generate_synthetic.py` | — |

### Dokumentasi ML
| Dokumen | Isi |
|---------|-----|
| `docs/ML-MODEL-CARD.md` | Arsitektur, performa, keterbatasan model |
| `docs/ML-DEPLOYMENT.md` | Preprocessing contract, loading guide, voice analysis |

## Performa Model (Test Set, Synthetic Data)
- **Sepsis:** AUC 0.938, Sensitivity 0.92, Specificity 0.89
- **Pneumonia Balita:** AUC 0.96, Sensitivity 0.93, Specificity 0.91

⚠️ **PERINGATAN:** Model dilatih dengan SYNTHETIC DATA hanya untuk DEMO. Performa pada data klinis nyata belum teruji.

## Log Aktivitas

| Tanggal | Agent | Aktivitas |
|---------|-------|-----------|
| 28 Jul 2026 | corex-pm | PRD final |
| 28 Jul 2026 | corex-architect | Arsitektur + stack |
| 28 Jul 2026 | corex-designer | Design system |
| 28 Jul 2026 | corex-data-scientist | Training MIMIC-IV gagal (data kurang) |
| 28 Jul 2026 | corex-pm | Opsi A: synthetic dataset |
| 28 Jul 2026 | corex-data-scientist | Generate 5000 synthetic samples + train |
| 28 Jul 2026 | corex-pm | Model converted ke TF.js |
| 28 Jul 2026 | corex-ml-engineer | Deploy: contract JSON, deployment guide, TS loader |
| 28 Jul 2026 | corex-ml-engineer | Analisis Whisper → rekomendasi Vosk.js |
| 29 Jul 2026 | corex-backend | Init Next.js project + all API routes |
| 29 Jul 2026 | corex-backend | Database schema: 8 tables + RLS + views + early warning function |
| 29 Jul 2026 | corex-backend | Build verified: npm run build ✅ |
| 29 Jul 2026 | corex-backend | Database migration executed + seed data (puskesmas, villages, model_version) |
| 29 Jul 2026 | corex-backend | Build re-verified: npm run build ✅ |

## Backend Status
### API Routes (✅ All implemented)
| Endpoint | Method | Auth | File |
|----------|--------|------|------|
| `/api/sync/triage` | POST | JWT (kader/bidan/puskesmas) | `src/app/api/sync/triage/route.ts` |
| `/api/sync/pending` | GET | JWT (kader/bidan/puskesmas) | `src/app/api/sync/pending/route.ts` |
| `/api/dashboard/summary` | GET | JWT (bidan/puskesmas) | `src/app/api/dashboard/summary/route.ts` |
| `/api/dashboard/kaders` | GET | JWT (puskesmas) | `src/app/api/dashboard/kaders/route.ts` |
| `/api/auth/register` | POST | Public | `src/app/api/auth/register/route.ts` |
| `/api/auth/login` | POST | Public | `src/app/api/auth/login/route.ts` |
| `/api/models/latest` | GET | Public | `src/app/api/models/latest/route.ts` |
| `/api/health` | GET | Public | `src/app/api/health/route.ts` |

### Database (✅ Migrated to Supabase Cloud)
- **Schema**: `supabase/migrations/00001_init.sql` — 8 tables, RLS policies, dashboard_summary view, get_early_warnings function
- **Seed data**: 1 puskesmas demo, 3 villages, 1 model_version (v1.0.0)
- **Connection**: Direct via IPv6 (blocked from this env), Management API via IPv4 ✅

### Infrastructure
- `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `.env.example`
- `src/middleware.ts` — JWT Bearer validation + RBAC
- `src/lib/supabase.ts` — Server (service role) + client (anon key) helpers
- `src/lib/medisense.ts` — TF.js Model Engine (load, predict, warmup, dispose)
- `src/types/database.ts` — Full TypeScript types for all entities + API contracts

## Langkah Selanjutnya
1. ⏳ **corex-frontend** — implementasi PWA sesuai DESIGN.md + integrasi TF.js model + panggil API sync
2. ⏳ **corex-security** — audit keamanan (auth, PII, data sync, RLS policies)
3. ⏳ **corex-qa** — testing fungsional + edge case
