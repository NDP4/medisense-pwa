# MediSense AI — Status Proyek

**Tier:** Corex Growth (dengan aspek Enterprise pada compliance)
**PRD Terakhir:** 28 Juli 2026
**Milestone Aktif:** M1 — Foundation & Dataset (✅ Selesai — foundation)

## Ringkasan Milestone

| Milestone | Target Selesai | Status | Dikerjakan Oleh |
|-----------|---------------|--------|-----------------|
| M1: Foundation & Dataset | Minggu 1-3 | ✅ Foundation selesai | corex-architect |
| M2: Model AI v1 | Minggu 4-8 | 🔄 Pipeline ML siap — menunggu corex-data-scientist | corex-data-scientist → corex-ml-engineer |
| M3: PWA Inti | Minggu 6-12 | ⏳ Scaffold siap — menunggu model jadi | corex-frontend |
| M4: Voice Input + Sync | Minggu 10-16 | ⏳ Belum dimulai | corex-frontend + corex-backend |
| M5: Keamanan & Testing | Minggu 14-20 | ⏳ Belum dimulai | corex-security → corex-qa |
| M6: Pilot Lapangan | Minggu 18-24 | ⏳ Belum dimulai | corex-devops → corex-maintenance |
| M7: Federated Learning | Minggu 20-28 | ⏳ Belum dimulai | corex-backend + corex-data-scientist |

## Keputusan yang sudah diambil

- ✅ **Scope MVP: 5 kondisi prioritas** — arsitektur siap ekstensi ke 47
- ✅ **Platform: PWA murni (Next.js)** — bukan React Native
- ✅ **Inferensi AI on-device via TF.js WASM** — bukan microservice Python
- ✅ **Tier: Corex Growth** — dengan aspek Enterprise compliance

## Foundation (M1) — Sudah Selesai ✅

| Item | Status | File |
|------|--------|------|
| PRD final | ✅ | `docs/PRD.md` |
| TECH-STACK.md (arsitektur + stack + API contract) | ✅ | `docs/TECH-STACK.md` |
| VERSIONING.md | ✅ | `docs/VERSIONING.md` |
| Repo git (branch main) | ✅ | `git init` + initial commit |
| Struktur direktori | ✅ | `src/`, `ml/`, `public/`, `.github/` |
| .gitignore | ✅ | deps, env, ML artifacts |
| CI workflow | ✅ | `.github/workflows/ci.yml` |
| Dataset (existing MIMIC-IV demo) | ✅ | `dataset/` — 100 pasien |

## Catatan Penting

- **Budget IDR 3,2jt** — sangat terbatas. Semua layanan cloud di free tier.
- **Dokumen referensi:** `docs/reference/BRD-EXISTING.md`, `docs/reference/TECH-SPEC-EXISTING.md`
- **Tech stack referensi (React Native) sudah obsolete** — arsitektur baru di TECH-STACK.md
- **Milestone berikutnya: M2 (Model AI v1)** — butuh corex-data-scientist

## Log Aktivitas

| Tanggal | Agent | Aktivitas |
|---------|-------|-----------|
| 28 Jul 2026 | corex-pm | PRD ditulis berdasarkan referensi + briefing operator |
| 28 Jul 2026 | corex-pm | Operator setuju: 5 kondisi MVP. PRD diupdate. |
| 28 Jul 2026 | corex-architect | TECH-STACK.md, CI workflow, VERSIONING.md, repo init |
| 28 Jul 2026 | corex-pm | STATUS.md final — M1 foundation selesai |

## Langkah Selanjutnya

1. ✅ **M1 Foundation selesai** — repo, arsitektur, CI siap
2. 🔜 **corex-data-scientist** — pipeline ML: preprocessing MIMIC-IV → training model 5 kondisi → konversi TF-Lite
3. ⏳ Setelah model jadi: **corex-ml-engineer** → **corex-frontend** (PWA)
