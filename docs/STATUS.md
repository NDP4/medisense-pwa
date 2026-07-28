# MediSense AI — Status Proyek

**Tier:** Corex Growth (dengan aspek Enterprise pada compliance)
**PRD Terakhir:** 28 Juli 2026
**Milestone Aktif:** M2 — Model AI v1 (⚠️ Hasil training di bawah target — butuh data tambahan)

## Ringkasan Milestone

| Milestone | Target Selesai | Status | Dikerjakan Oleh |
|-----------|---------------|--------|-----------------|
| M1: Foundation & Dataset | Minggu 1-3 | ✅ Selesai | corex-architect |
| M2: Model AI v1 | Minggu 4-8 | ⚠️ Training selesai — performa rendah | corex-data-scientist |
| M3: PWA Inti | Minggu 6-12 | ✅ Desain selesai — menunggu model | corex-designer → corex-frontend |
| M4: Voice Input + Sync | Minggu 10-16 | ⏳ Belum dimulai | corex-frontend + corex-backend |
| M5: Keamanan & Testing | Minggu 14-20 | ⏳ Belum dimulai | corex-security → corex-qa |
| M6: Pilot Lapangan | Minggu 18-24 | ⏳ Belum dimulai | corex-devops → corex-maintenance |
| M7: Federated Learning | Minggu 20-28 | ⏳ Belum dimulai | corex-backend + corex-data-scientist |

## Temuan Kritis — Model AI

Dataset MIMIC-IV demo TIDAK cocok untuk 3 dari 5 kondisi target:
- **Pre-Eklampsia: 0 kasus** — data ICU dewasa AS
- **DBD: 0 kasus** — penyakit tropis, tidak ada di AS
- **Stroke Iskemik: 2 kasus** — sample terlalu kecil
- **Sepsis: 13 kasus** — bisa dipelajari terbatas
- **Pneumonia: 17 kasus** — satu-satunya dengan hasil measurable (AUC 0.53)

**Model saat ini hanya bisa mendeteksi pneumonia balita dengan AUC 0.53 (hampir random).**

## Log Aktivitas

| Tanggal | Agent | Aktivitas |
|---------|-------|-----------|
| 28 Jul 2026 | corex-pm | PRD final |
| 28 Jul 2026 | corex-architect | Arsitektur + repo |
| 28 Jul 2026 | corex-designer | Design system |
| 28 Jul 2026 | corex-data-scientist | Preprocessing + training + model card |
| 28 Jul 2026 | corex-pm | STATUS — performa model rendah, rekomendasi data tambahan |

## Langkah Selanjutnya

🔴 **Menunggu keputusan operator:**
1. Opsi A: Fokus ke 2 kondisi (sepsis + pneumonia) — pakai MIMIC-IV existing
2. Opsi B: Cari dataset tambahan untuk 5 kondisi lengkap
3. Opsi C: Rule-based untuk 3 kondisi tanpa data + ML untuk 2 kondisi
