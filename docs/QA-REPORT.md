# QA Test Report — MediSense AI

**Tester:** corex-qa
**Updated:** 31 Jul 2026 — Audit kode + compliance + UX rekomendasi ✅
**Build:** ✅ 0 errors, 19 routes
**Stack:** Next.js 15 App Router + TF.js WASM + Yjs CRDT + Dexie.js + Zustand + Supabase Auth

---

## Ringkasan

| Kelompok | Total Test | Pass | Fail | Skip | Coverage |
|----------|:----------:|:----:|:----:|:----:|:--------:|
| A. Full Triage Flow (Offline) | 21 | 21 | 0 | 0 | 100% |
| B. AI Model Offline Inference | 6 | 6 | 0 | 0 | 100% |
| C. Sync Online Recovery | 5 | 5 | 0 | 0 | 100% |
| D. CRDT Conflict Resolution | 6 | 6 | 0 | 0 | 100% |
| E. All Pages & Navigation | 9 | 9 | 0 | 0 | 100% |
| F. Edge Cases | 10 | 10 | 0 | 0 | 100% |
| **Subtotal (sebelumnya)** | **57** | **57** | **0** | **0** | **100%** |
| G. Code Quality & Accessibility | 14 | 0 | 14 | 0 | — |
| **Total** | **71** | **57** | **14** | **0** | — |

---

## Hasil Detail

### A. Full Triage Flow — Offline
(Sama seperti sebelumnya — 21 test, 21 PASS ✅)

| # | Test | Status |
|---|------|:------:|
| A1 | Consent screen muncul dengan judul "Persetujuan Penggunaan Data" | ✅ PASS |
| A2 | Tombol "Setuju & Lanjutkan" → simpan ke localStorage + masuk triage | ✅ PASS |
| A3 | Tombol "Tidak Setuju" → redirect ke home | ✅ PASS |
| A4 | Consent hanya muncul sekali (localStorage key `medisense_consent`) | ✅ PASS |
| A5 | Dari home, tap "+ TRIASE BARU" → halaman triage | ✅ PASS |
| A6 | Grid pasien: Diri Sendiri, Anak, Ibu, Ayah | ✅ PASS |
| A7 | Bisa tap pasien → highlight (border + ring) | ✅ PASS |
| A8 | Tombol "Selanjutnya" disabled tanpa pasien dipilih | ✅ PASS |
| A9 | Multi-select gejala: kartu berubah warna saat aktif | ✅ PASS |
| A10 | Tombol "Selanjutnya" aktif dengan minimal 1 gejala | ✅ PASS |
| A11 | Voice step: tombol mic + 3 bahasa + skip | ✅ PASS |
| A12 | Manual text input (textarea) | ✅ PASS |
| A13 | Progress bar berjalan saat analisis | ✅ PASS |
| A14 | Disclaimer offline saat analisis | ✅ PASS |
| A15 | MERAH: background #DC2626, XCircle, tombol 119 | ✅ PASS |
| A16 | KUNING: background #EAB308, AlertTriangle | ✅ PASS |
| A17 | HIJAU: background #16A34A, CheckCircle | ✅ PASS |
| A18 | Disclaimer medis muncul di semua hasil | ✅ PASS |
| A19 | Tombol "Simpan ke riwayat" → syncStatus berubah | ✅ PASS |
| A20 | ProgressStepper langkah 5/5 di hasil | ✅ PASS |
| A21 | Hijau hasil → action list tepat | ✅ PASS |

### B. AI Model Offline Inference
(6 test, 6 PASS ✅ — sama seperti sebelumnya)

### C. Sync — Online Recovery
(5 test, 5 PASS ✅ — sama seperti sebelumnya)

### D. CRDT Conflict Resolution
(6 test, 6 PASS ✅ — sama seperti sebelumnya)

### E. All Pages & Navigation
(9 test, 9 PASS ✅ — sama seperti sebelumnya)

### F. Edge Cases
(10 test, 10 PASS ✅ — sama seperti sebelumnya)

### G. Code Quality & Accessibility Audit (NEW — 31 Jul 2026)

#### G1. Register Page (`src/app/register/page.tsx`)

| # | Severity | Temuan | Lokasi | Saran |
|---|----------|--------|--------|-------|
| G1 | MEDIUM | Role selector buttons (kader/bidan/puskesmas) tidak punya `role="radio"` / `aria-checked`. Screen reader tidak mengenali sebagai grup pilihan. | line 251-266 | Bungkus dalam `<fieldset>` + `<legend>`, atau gunakan `role="radiogroup"` + `role="radio"` |
| G2 | MEDIUM | Label "Puskesmas" menggunakan `<label>` tanpa `htmlFor`. Karena selector adalah `<button>`, tidak ada elemen yang bisa dirujuk. | line 271-272 | Gunakan `aria-labelledby` pada tombol trigger yang merujuk ke `id` teks label |
| G3 | MEDIUM | Search input dalam dropdown puskesmas tidak punya label aksesibel — hanya placeholder. | line 307-314 | Tambah `aria-label="Cari puskesmas berdasarkan nama atau wilayah"` pada `<input>` |
| G4 | LOW | `setTimeout` redirect setelah registrasi sukses tidak di-cleanup — potensi navigasi ganda. | line 150-152 | Simpan `timerId` dan panggil `clearTimeout` di cleanup |
| G5 | INFO | Fetch puskesmas list gagal silent — user baru tahu error saat submit. | line 49-51 | Tampilkan pesan error di dropdown jika fetch gagal |

#### G2. Login Page (`src/app/login/page.tsx`)

| # | Severity | Temuan | Lokasi | Saran |
|---|----------|--------|--------|-------|
| G6 | MEDIUM | Password toggle (`tabIndex={-1}`) tidak bisa di-fokus via keyboard. Tidak ada `aria-label`. | line 147-153 | Hapus `tabIndex={-1}`, tambah `aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}` |
| G7 | LOW | Validasi client-side login lebih longgar dari register — nomor pendek lolos. | line 23-30 | Tambah `phone.length < 10` dan `password.length < 8` |
| G8 | INFO | Format nomor HP berbeda antara login (6281xxx) dan register (+6281xxx). API handle keduanya. | line 38 | Konsistenkan format di frontend |

#### G3. Profile Page (`src/app/(pwa)/profile/page.tsx`)

| # | Severity | Temuan | Lokasi | Saran |
|---|----------|--------|--------|-------|
| G9 | HIGH | Semua modal (Login Prompt, Hapus Data, Logout) tidak memiliki focus trapping. User keyboard bisa fokus ke konten di balik modal. | line 375-478 | Implementasi focus trapping — bisa pakai `focus-trap-react` atau custom hook |
| G10 | HIGH | Modal tidak memiliki `role="dialog"` atau `aria-modal="true"`. Screen reader tidak mengenali overlay sebagai dialog. | line 375, 408, 448 | Tambah `role="dialog" aria-modal="true"` dan `aria-labelledby` yang merujuk heading modal |
| G11 | MEDIUM | Klik backdrop modal tidak menutup modal. Tidak konsisten dengan UX umum. | line 375-405 | Tambah `onClick` pada backdrop untuk menutup modal non-destruktif (Login Prompt) |
| G12 | LOW | Tombol "Batal" dan "Nanti" di modal tidak punya `type="button"`. | line 391, 429, 461 | Tambah `type="button"` pada semua tombol non-submit |
| G13 | INFO | `window.location.reload()` setelah hapus data — UX kurang mulus (flash putih). | line 74 | Opsional: reset state store manual + `router.push('/')` |
| G14 | INFO | `appVersion` di export hardcoded (`'v0.2.0'`). | line 44 | Ambil dari `package.json` atau env variable |

#### G4. API Endpoint (`/api/puskesmas/list`)
**✅ OK — no issues found.** Error handling lengkap, struktur response konsisten, public route.

#### G5. Middleware
**✅ OK — no issues found.** `/api/puskesmas/list` sudah terdaftar sebagai public route. JWT verification dengan `jose` benar.

---

## Compliance Check

### PRD Compliance (8/10)
| Fitur | Status | Catatan |
|-------|--------|---------|
| F-01: Input gejala visual | ✅ | 47 ilustrasi SVG, multi-select |
| F-02: Input suara offline | ✅ | Web Speech API + Vosk.js |
| F-03: AI on-device (TF.js) | ✅ | 2 kondisi, synthetic data |
| F-04: Hasil triase 3 warna | ✅ | MERAH/KUNING/HIJAU + tombol 119 |
| F-05: Tombol darurat 1-tap | ✅ | `tel:119` + pulse animasi |
| F-06: Riwayat lokal | ✅ | IndexedDB + Yjs |
| F-07: Sinkronisasi offline-to-cloud | ✅ | Yjs CRDT + Supabase |
| F-08: Dashboard Puskesmas | ❌ | Belum diimplementasi (M6 pilot) |
| F-09: Onboarding interaktif | ❌ | Belum ada — perlu untuk literasi rendah |
| F-10: Manajemen anggota keluarga | ✅ | Add/Edit/Delete pasien |

### TECH-STACK Compliance (9/10)
| Aspek | Status | Catatan |
|-------|--------|---------|
| Next.js 14+ App Router | ✅ | Next.js 15 |
| PWA (Workbox / Serwist) | ✅ | SW manual di `public/sw.js` |
| TF.js WASM backend | ✅ | XNNPACK WASM |
| Whisper.cpp / Vosk.js | ✅ | Vosk.js + Web Speech API fallback |
| Yjs CRDT | ✅ | Y.Doc + Y.Array |
| Web Crypto AES-256-GCM | ✅ | crypto.ts |
| Zustand state management | ✅ | auth-store + triage-store |
| Supabase Auth + DB | ✅ | Login/register + middleware |
| API contract (TECH-STACK.md) | ✅ | Semua endpoint sesuai |
| Dashboard Puskesmas web | ❌ | Belum dibuat |

### DESIGN Compliance (8/10)
| Aspek | Status | Catatan |
|-------|--------|---------|
| Color system (Hijau/Kuning/Merah) | ✅ | #16A34A, #EAB308, #DC2626 |
| Typography (Inter 16px) | ✅ | Inter di globals.css |
| Layout max-w-lg mobile-first | ✅ | `max-w-lg mx-auto` |
| Bottom Nav 4 item + FAB | ✅ | Home, Triase, Riwayat, Profil |
| Progress Stepper 5 langkah | ✅ | Pasien → Gejala → Suara → Analisis → Hasil |
| Lucide Icons (bukan emoji) | ✅ | Semua ikon dari `lucide-react` |
| Touch target min 48dp | ✅ | Semua tombol min 48px |
| Color-blind safety (ikon + teks) | ⚠️ Sebagian | Ikon + teks untuk level, tapi beberapa tombol hanya ikon |
| Aksesibilitas (a11y) | ⚠️ 14 temuan | Lihat Section G |
| Ilustrasi gejala SVG | ✅ | 25 ilustrasi untuk 5 kondisi |

---

## UX Recommendations untuk Skalabilitas

### Prioritas Tinggi (Harus sebelum Pilot)

1. **Focus trapping di modal** — User keyboard bisa berinteraksi dengan konten di balik modal (HIGH). Implementasi `focus-trap-react` atau custom hook.

2. **Aksesibilitas modal** — Tambah `role="dialog"`, `aria-modal="true"`, dan `aria-labelledby` di semua modal untuk kompatibilitas screen reader.

3. **Onboarding untuk kader baru** — Belum ada onboarding/panduan interaktif. Untuk literasi rendah, ini kritis. Minimal: 5 layar panduan bergambar saat pertama kali buka app.

4. **Feedback fetch error yang jelas** — Jika API puskesmas list gagal, user harus lihat pesan error, bukan silent fail. Ini penting di wilayah 3T dengan koneksi tidak stabil.

### Prioritas Sedang (Minggu Pertama Pilot)

5. **Empty state untuk setiap halaman** — History, Profile (data pengguna), dan Dashboard sudah punya. Pastikan konsisten di semua halaman yang butuh.

6. **Skeleton loading** — Saat fetch data dari cloud (history sync), tampilkan skeleton card, bukan spinner generic.

7. **Konfirmasi untuk aksi destruktif** — Hapus data sudah ada modal. Pastikan Logout juga punya konfirmasi (sudah ada ✅).

8. **Error boundary per halaman** — Satu error di triage wizard jangan meng-crash seluruh app. Bungkus tiap page/step dengan error boundary.

### Prioritas Rendah (Pasca Pilot)

9. **Versi app dinamis di export** — Ambil dari `package.json` atau env, bukan hardcoded.

10. **Reset state tanpa reload** — Ganti `window.location.reload()` dengan reset store manual untuk UX lebih halus.

11. **Format nomor HP konsisten** — Standarisasi format antara login dan register (+6281xxx).

12. **Animasi transisi antar halaman** — Layout transisi yang smooth meningkatkan persepsi performa.

### Catatan Kinerja & Skalabilitas

13. **Bundle size dimonitor** — First Load JS shared: 103 kB (masih wajar). Tapi seiring penambahan fitur, perlu code-splitting lebih agresif.

14. **IndexedDB growth** — Pastikan ada kebijakan retensi/hapus data lama untuk mencegah IndexedDB membesar tak terkendali (target: <50 MB per device).

15. **API rate limiting** — Registrasi sudah (5/jam/IP). Sync dan dashboard endpoint belum — perlu untuk 500+ kader.

16. **Yjs garbage collection** — Jika user menghapus sesi, data di Y.Array tidak terhapus (hanya di UI). Perlu mekanisme GC periodik.

---

## Temuan / Issues (Updated 31 Jul 2026)

| # | Severity | Deskripsi | Lokasi | Status |
|---|----------|-----------|--------|:------:|
| 1-7 | Semua | Temuan sebelumnya (30 Jul) | — | ✅ FIXED |
| G9-G10 | **HIGH** | Modal tanpa focus trapping + role dialog | `profile/page.tsx:375-478` | ❌ OPEN |
| G1-G3 | MEDIUM | A11y issues di register page (radio group, label, search) | `register/page.tsx:251-314` | ❌ OPEN |
| G6 | MEDIUM | Password toggle tidak bisa diakses keyboard | `login/page.tsx:147-153` | ❌ OPEN |
| G11 | MEDIUM | Backdrop modal tidak menutup modal | `profile/page.tsx:375-405` | ❌ OPEN |
| G4, G7 | LOW | Redirect cleanup, validasi login longgar | `register/page.tsx:150-152`, `login/page.tsx:23-30` | ❌ OPEN |
| G12 | LOW | Tombol modal tanpa `type="button"` | `profile/page.tsx:391,429,461` | ❌ OPEN |
| G5, G8, G13, G14 | INFO | Silent fetch fail, format HP, reload hardcoded, appVersion | berbagai file | ❌ OPEN |

---

## Security Checklist Review

| # | Check | Status | Lokasi |
|---|-------|:------:|--------|
| 1 | JWT diverifikasi dengan jose | ✅ | `middleware.ts:52` |
| 2 | Token di sessionStorage (bukan localStorage) | ✅ | `auth-store.ts:33` |
| 3 | Data PII dienkripsi AES-256-GCM | ✅ | `crypto.ts:47-61` |
| 4 | CSP headers aktif | ✅ | `next.config.ts:31-32` |
| 5 | X-Content-Type-Options: nosniff | ✅ | `next.config.ts:36` |
| 6 | X-Frame-Options: DENY | ✅ | `next.config.ts:40` |
| 7 | Audit trail setiap inferensi AI | ✅ | `step-analyze.tsx:159-169` |
| 8 | Rate limiting registrasi (5/jam/IP) | ✅ | `register/route.ts:18-33` |
| 9 | Public routes terdefinisi eksplisit | ✅ | `middleware.ts:18-24` |
| 10 | /api/puskesmas/list public (tanpa auth) | ✅ | Info puskesmas bukan data sensitif |

---

## Kesimpulan

**Overall: ✅ LAYAK UNTUK PILOT — BERSYARAT**

57/57 functional test PASS (100%). Compliance terhadap PRD (8/10), TECH-STACK (9/10), DESIGN (8/10).

**Syarat sebelum pilot:**
1. Fix **2 HIGH** — focus trapping + role dialog di modal profile
2. Fix **4 MEDIUM** — a11y register page (3) + password toggle login (1)
3. Tambah **onboarding minimal** untuk kader baru

**Temuan non-bloker (bisa ditunda pasca-pilot):**
- Validasi login lebih ketat (LOW)
- Backdrop modal close (MEDIUM — preferensi UX)
- Redirect timer cleanup (LOW)
- Silent fetch fail feedback (INFO)

**Rekomendasi tambahan untuk Pilot:**
- Pantau IndexedDB growth di 30 device
- Siapkan mekanisme error reporting (Sentry sudah di TECH-STACK)
- Dokumentasi troubleshooting untuk kader lapangan
