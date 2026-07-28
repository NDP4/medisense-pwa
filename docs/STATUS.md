# MediSense AI — Status Proyek

**Tier:** Corex Growth (dengan aspek Enterprise pada compliance)
**PRD Terakhir:** 28 Juli 2026
**Milestone Aktif:** M3 — PWA Inti (desain visual ✅ — menunggu implementasi)

## Ringkasan Milestone

| Milestone | Target Selesai | Status | Dikerjakan Oleh |
|-----------|---------------|--------|-----------------|
| M1: Foundation & Dataset | Minggu 1-3 | ✅ Selesai | corex-architect |
| M2: Model AI v1 | Minggu 4-8 | ⏳ Belum dimulai | corex-data-scientist → corex-ml-engineer |
| M3: PWA Inti | Minggu 6-12 | ✅ Desain selesai — menunggu model AI | corex-designer → corex-frontend |
| M4: Voice Input + Sync | Minggu 10-16 | ⏳ Belum dimulai | corex-frontend + corex-backend |
| M5: Keamanan & Testing | Minggu 14-20 | ⏳ Belum dimulai | corex-security → corex-qa |
| M6: Pilot Lapangan | Minggu 18-24 | ⏳ Belum dimulai | corex-devops → corex-maintenance |
| M7: Federated Learning | Minggu 20-28 | ⏳ Belum dimulai | corex-backend + corex-data-scientist |

## Dokumen Lengkap

| Dokumen | Status | Untuk |
|---------|--------|-------|
| `docs/PRD.md` | ✅ Final | Product Requirements |
| `docs/TECH-STACK.md` | ✅ Final | Arsitektur & Stack |
| `docs/DESIGN.md` | ✅ Final | Design System & Arahan Visual |
| `docs/FIGMA-HANDOFF.md` | ✅ Final | Handoff untuk Frontend |
| `docs/VERSIONING.md` | ✅ Final | Semantic Versioning |
| `docs/STATUS.md` | ✅ Terbaru | Status Proyek |
| `.github/workflows/ci.yml` | ✅ Siap | CI Pipeline |

## Log Aktivitas

| Tanggal | Agent | Aktivitas |
|---------|-------|-----------|
| 28 Jul 2026 | corex-pm | PRD ditulis, operator setuju 5 kondisi MVP |
| 28 Jul 2026 | corex-architect | TECH-STACK.md, CI, VERSIONING.md, repo init |
| 28 Jul 2026 | corex-designer | DESIGN.md + FIGMA-HANDOFF.md — arahan visual lengkap |
| 28 Jul 2026 | corex-pm | STATUS.md final — semua dokumen lengkap |

## Langkah Selanjutnya

1. ✅ **Fase desain selesai** — PRD → Arsitektur → Desain, semua terdokumentasi
2. 🔜 **corex-data-scientist** — Pipeline ML: preprocessing MIMIC-IV, training model 5 kondisi
3. ⏳ Setelah model jadi: **corex-ml-engineer** (konversi TF-Lite) → **corex-frontend** (implementasi PWA)
