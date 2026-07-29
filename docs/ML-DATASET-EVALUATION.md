# Evaluasi Dataset — Neglected Tropical Diseases
## Apakah bisa digunakan untuk training MediSense AI?

**Diuvaluasi oleh:** corex-data-scientist
**Tanggal:** 28 Juli 2026

## 1. Isi Dataset

File: `annual-research-development-funding-for-neglected-tropical-diseases.csv`
Sumber: Our World in Data (OWID)

| Kolom | Contoh | Tipe |
|-------|--------|------|
| Entity | "World" | String |
| Code | "OWID_WRL" | String |
| Year | 2007-2023 | Integer |
| Funding for dengue | 63,639,804 | Float (USD) |
| Funding for malaria | 603,466,050 | Float (USD) |
| Funding for tuberculosis | 550,416,000 | Float (USD) |
| Funding for HIV/AIDS | 1,554,392,400 | Float (USD) |
| ... (20+ kolom funding) | ... | Float (USD) |

Dataset berisi **pendanaan riset tahunan global** untuk neglected tropical diseases.

## 2. Kesesuaian untuk Multi-label Triage

| Kriteria | Terpenuhi? | Keterangan |
|----------|-----------|------------|
| Data pasien per individu | ❌ | Agregat global, bukan data per pasien |
| Gejala klinis | ❌ | Tidak ada gejala sama sekali |
| Label diagnosis per pasien | ❌ | Tidak ada diagnosis, hanya total funding per tahun |
| Format siap ML (tabular) | ⚠️ | Format CSV tapi tidak relevan untuk klasifikasi |
| Cocok untuk MIMIC-IV augmentation | ❌ | Struktur data berbeda total, tidak bisa digabung |

## 3. Kesimpulan

**TIDAK DAPAT DIGUNAKAN** untuk training model triage karena:

1. **Bukan data klinis** — ini data pendanaan riset (dalam USD), bukan rekam medis
2. **Tidak ada pasien** — agregat global per tahun, bukan individu
3. **Tidak ada gejala** — tidak ada kolom demam, batuk, atau gejala apapun
4. **Tidak bisa digabung dengan MIMIC-IV** — struktur dan semantic berbeda total

## 4. Rekomendasi

✅ **LANJUTKAN OPSI A: Fokus ke 2 kondisi (sepsis + pneumonia) untuk MVP.**

### Alasan Opsi A adalah keputusan tepat:

1. **Dataset NTD tidak berguna** untuk training — bukan data klinis
2. **MIMIC-IV memiliki cukup kasus** untuk sepsis (13) dan pneumonia (17) — masih imbalance tapi bisa diatasi dengan SMOTE + sample weighting
3. **Risiko minimal:**
   - Arsitektur neural network sudah memiliki 5 output neuron — hanya 2 yang aktif sekarang
   - Penambahan 3 kondisi lain (stroke, pre-eklampsia, DBD) cukup dengan **fine-tuning** saat data tersedia — TIDAK PERLU UBAH ARSITEKTUR
   - UI/UX PWA (DESIGN.md) tidak berubah — hasil triase hanya menampilkan kondisi yang terdeteksi
   - Dashboard Puskesmas tetap sama
4. **Sesuai dokumen acuan:**
   - PRD Section 7: "Arsitektur siap scale ke 47, hanya output yang dibatasi"
   - TECH-STACK.md: Arsitektur 3 layer tidak berubah
   - Target MVP tetap tercapai: offline triase untuk kondisi yang paling mungkin ditemui kader

### Roadmap Tambahan Kondisi:
| Kondisi | Ketersediaan Data | Rencana |
|---------|------------------|---------|
| Sepsis | ✅ MIMIC-IV (13 kasus) | MVP v1 |
| Pneumonia Balita | ✅ MIMIC-IV (17 kasus) | MVP v1 |
| Stroke Iskemik | ⚠️ Perlu dataset stroke publik | MVP v2 (setelah pilot) |
| DBD | ❌ Perlu dataset dari Indonesia | MVP v2 (setelah pilot) |
| Pre-Eklampsia | ❌ Perlu dataset ibu hamil | MVP v2 (setelah pilot) |
