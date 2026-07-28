# Versioning — MediSense AI

**Skema:** Semantic Versioning (SemVer) — `MAJOR.MINOR.PATCH`
**Mulai:** `v0.1.0` (fase development)
**Dikelola oleh:** corex-release

## Aturan Versioning

| Bump | Ketika | Contoh |
|------|--------|--------|
| **MAJOR** | Perubahan arsitektur besar / breaking API / perubahan format data yang tidak kompatibel | `v1.0.0` → `v2.0.0` |
| **MINOR** | Fitur baru, model AI baru, bahasa daerah baru (tidak breaking) | `v0.1.0` → `v0.2.0` |
| **PATCH** | Bug fix, optimasi performa, peningkatan akurasi model, perbaikan UI minor | `v0.1.0` → `v0.1.1` |

## Model AI Versioning

Model AI memiliki versi sendiri yang dirilis terpisah dari versi aplikasi:

- Format: `mv{MODEL_MAJOR}.{MODEL_MINOR}.{MODEL_PATCH}`
- Contoh: `mv1.2.0`
- Model version dicantumkan di metadata setiap hasil triase (audit trail)
- Model version disimpan di Service Worker cache dan di-check saat update

## Milestone & Tag

| Milestone | Target Tag | Deskripsi |
|-----------|-----------|-----------|
| M1: Foundation & Dataset | `v0.1.0` | Infrastruktur repo + dataset preprocessing |
| M2: Model AI v1 | `v0.2.0` | Model MVP 5 kondisi siap |
| M3: PWA Inti | `v0.3.0` | Aplikasi triase offline functional |
| M4: Voice Input + Sync | `v0.4.0` | Voice + sync + dashboard |
| M5: Keamanan & Testing | `v0.5.0` | Lolos security audit & QA |
| M6: Pilot Lapangan | `v1.0.0-rc.1` | Release candidate untuk pilot |
| M7: Federated Learning | `v1.1.0` | FL aktif, model hyper-lokal |

## Proses Rilis

1. Kode melewati: `corex-security` → `corex-qa`
2. `corex-release` membuat Pull Request ke `main`
3. Operator melakukan merge ke `main`
4. `corex-release` menambahkan tag versi
5. CI otomatis build dan deploy (Vercel)

## Format Tag Git

```
v{MAJOR}.{MINOR}.{PATCH}
v0.1.0
v0.2.0
v1.0.0-rc.1   (release candidate)
v1.0.0
```

---

*Dokumen ini dikelola oleh corex-release. Update jika ada perubahan skema versioning.*
