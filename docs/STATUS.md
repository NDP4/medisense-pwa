# MediSense AI — Status Proyek

**Tier:** Corex Growth (dengan aspek Enterprise pada compliance)
**PRD Terakhir:** 28 Juli 2026
**Milestone Aktif:** M1 — Foundation & Dataset (sedang dikerjakan corex-architect)

## Ringkasan Milestone

| Milestone | Target Selesai | Status | Dikerjakan Oleh |
|-----------|---------------|--------|-----------------|
| M1: Foundation & Dataset | Minggu 1-3 | 🔄 Dikerjakan corex-architect | corex-architect → corex-data-scientist |
| M2: Model AI v1 | Minggu 4-8 | ⏳ Belum dimulai | corex-data-scientist → corex-ml-engineer |
| M3: PWA Inti | Minggu 6-12 | ⏳ Belum dimulai | corex-frontend |
| M4: Voice Input + Sync | Minggu 10-16 | ⏳ Belum dimulai | corex-frontend + corex-backend |
| M5: Keamanan & Testing | Minggu 14-20 | ⏳ Belum dimulai | corex-security → corex-qa |
| M6: Pilot Lapangan | Minggu 18-24 | ⏳ Belum dimulai | corex-devops → corex-maintenance |
| M7: Federated Learning | Minggu 20-28 | ⏳ Belum dimulai | corex-backend + corex-data-scientist |

## Keputusan yang sudah diambil

- ✅ **Scope MVP: 5 kondisi prioritas** (sepsis, stroke iskemik, pre-eklampsia, DBD, pneumonia balita) — arsitektur siap ekstensi ke 47 kondisi
- ✅ **Platform: PWA murni** (bukan React Native) — instal dari browser
- ✅ **Tier: Corex Growth** — dengan aspek Enterprise pada compliance data kesehatan
- ✅ **Inferensi AI: WAJIB on-device di browser** — via TF.js / TFLite Web API / WASM. BUKAN microservice Python terpisah.

## Catatan Penting

- Dokumen referensi: `docs/reference/BRD-EXISTING.md`, `docs/reference/TECH-SPEC-EXISTING.md`, `docs/reference/PROPOSAL-ORIGINAL.pdf`
- **Tech stack berubah dari referensi:** React Native (Expo) → PWA murni. Perlu redesign arsitektur frontend.
- **Repo belum diinisialisasi git** — akan dikerjakan oleh corex-architect sebagai bagian dari M1.
- **Budget IDR 3,2jt** — sangat terbatas, perlu prioritas ketat di setiap milestone.

## Log Aktivitas

| Tanggal | Agent | Aktivitas |
|---------|-------|-----------|
| 28 Jul 2026 | corex-pm | PRD ditulis berdasarkan referensi BRD + Tech Spec + briefing operator |
| 28 Jul 2026 | corex-pm | STATUS.md dibuat |
| 28 Jul 2026 | corex-pm | Operator setuju: 5 kondisi untuk MVP. PRD diupdate. |
| 28 Jul 2026 | corex-pm | Handoff ke corex-architect dengan 2 constraint wajib (PWA murni + inferensi on-device) |

## Langkah Selanjutnya

1. ✅ PRD final — `docs/PRD.md` (source of truth)
2. ✅ Keputusan scope: 5 kondisi MVP, arsitektur scale ke 47
3. 🔄 **corex-architect sedang bekerja** — desain arsitektur, pilih stack final, tulis `docs/TECH-STACK.md`, setup repo awal
4. ⏳ Berikutnya setelah architect: corex-designer (jika perlu arahan visual) + corex-data-scientist (untuk pipeline ML)
