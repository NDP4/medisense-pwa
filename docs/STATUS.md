# MediSense AI — Status Proyek

**Tier:** Corex Growth (dengan aspek Enterprise pada compliance)
**PRD Terakhir:** 28 Juli 2026
**Milestone Aktif:** M2 — Model AI v1 (pipeline siap ✅ — tinggal training)

## Ringkasan Milestone

| Milestone | Target Selesai | Status | Dikerjakan Oleh |
|-----------|---------------|--------|-----------------|
| M1: Foundation & Dataset | Minggu 1-3 | ✅ Selesai | corex-architect |
| M2: Model AI v1 | Minggu 4-8 | ✅ Pipeline siap — perlu training | corex-data-scientist → corex-ml-engineer |
| M3: PWA Inti | Minggu 6-12 | ✅ Desain selesai — menunggu model | corex-designer → corex-frontend |
| M4: Voice Input + Sync | Minggu 10-16 | ⏳ Belum dimulai | corex-frontend + corex-backend |
| M5: Keamanan & Testing | Minggu 14-20 | ⏳ Belum dimulai | corex-security → corex-qa |
| M6: Pilot Lapangan | Minggu 18-24 | ⏳ Belum dimulai | corex-devops → corex-maintenance |
| M7: Federated Learning | Minggu 20-28 | ⏳ Belum dimulai | corex-backend + corex-data-scientist |

## Dokumen Lengkap

| Dokumen | Status |
|---------|--------|
| `docs/PRD.md` | ✅ |
| `docs/TECH-STACK.md` | ✅ |
| `docs/DESIGN.md` (v2) | ✅ |
| `docs/FIGMA-HANDOFF.md` | ✅ |
| `docs/VERSIONING.md` | ✅ |
| `docs/ML-MODEL-CARD.md` | ✅ |
| `ml/scripts/preprocess.py` | ✅ |
| `ml/scripts/train.py` | ✅ |
| `ml/requirements.txt` | ✅ |
| `docs/STATUS.md` | ✅ |

## Log Aktivitas

| Tanggal | Agent | Aktivitas |
|---------|-------|-----------|
| 28 Jul 2026 | corex-pm | PRD final — 5 kondisi MVP |
| 28 Jul 2026 | corex-architect | Arsitektur + stack + repo |
| 28 Jul 2026 | corex-designer | Design system + handoff |
| 28 Jul 2026 | corex-data-scientist | Pipeline ML: preprocess, train script, model card |

## Langkah Selanjutnya

1. 🔄 **Jalankan training** — `cd ml && pip install -r requirements.txt && python scripts/preprocess.py && python scripts/train.py`
2. ⏳ **corex-ml-engineer** — konversi model ke TF-Lite INT8 + TF.js
3. ⏳ **corex-frontend** — implementasi PWA sesuai DESIGN.md