# Changelog MediSense AI

Semua perubahan signifikan pada proyek ini akan dicatat di sini.

Format berdasarkan [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
dan proyek ini mengikuti [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.8.0] — 2026-08-05

### Added
- **Modal detail triase** (`src/components/triage/triage-detail-modal.tsx`) — Ketuk kartu di halaman History membuka modal detail yang menampilkan: level triase (ikon + warna sesuai level), waktu lengkap, kondisi terdeteksi beserta confidence %, catatan suara (voice text jika ada), dan daftar rekomendasi lengkap. Menggunakan komponen `Modal` yang sudah ada (focus trap, Escape, backdrop, a11y).
- **Kartu history interaktif** (`src/app/(pwa)/history/page.tsx`) — Card diubah dari `div` menjadi `button` (accessible, bisa di-focus & di-enter via keyboard), dengan ikon chevron sebagai affordance "Lihat detail"; React key kini memakai `item.id` (stabil) dengan fallback index.
- **`voiceText` di `TriageResult`** (`src/store/triage-store.ts`) — Field baru diisi dari IndexedDB (`loadHistory`) dan cloud (`fetchHistoryFromCloud`), sehingga catatan suara tampil di modal detail.

### Changed
- **i18n** (`src/lib/i18n/translations.ts`) — 8 key baru di namespace `history` (ID + EN): `detailHint`, `detailTitle`, `detailTime`, `detailConditions`, `detailNoConditions`, `detailRecommendations`, `detailVoice`, `detailClose`.

### Verified
- Typecheck 0 error, build 0 errors (21 routes).

## [0.7.1] — 2026-08-05

### Fixed
- **Duplikasi riwayat triase** — 1 triase tampil 2x di perangkat dan 3x di riwayat (saat online). Akar masalah:
  - **Double-write ke IndexedDB** (`src/components/triage/step-analyze.tsx`) — step analisis menyimpan record "audit trail" dengan id acak, lalu `addToHistory` di store menyimpan lagi dengan `triageSessionId` → 2 record lokal per triase. Sekarang penyimpanan tunggal lewat `addToHistory` (audit trail tetap tercatat di console).
  - **Dedup by timestamp yang tidak pernah cocok** (`src/store/triage-store.ts`) — timestamp lokal (2 nilai berbeda milidetik) vs cloud (`triage_completed_at`) selalu berbeda, sehingga 2 lokal + 1 cloud = 3 entri di riwayat. `TriageResult` kini punya field `id` (triageSessionId) dan merge cloud dilakukan **by id**.
  - **Auto-cleanup duplikat lama** — `loadHistory` menghapus record id non-UUID (artefak bug lama) yang punya kembaran UUID dengan level & waktu sama (±10 detik) dari IndexedDB (fire-and-forget); record yatim tetap dipertahankan agar tidak ada data hilang.
  - **`syncPendingDexieRecords` payload invalid** (`src/lib/sync.ts`) — `conditions: []` ditolak validasi API (zod `min(1)`) → sekarang mengirim kondisi hasil parse record lokal dengan fallback `tidak_ada`.

### Changed
- **`TriageResult`** (`src/store/triage-store.ts`) — Tambah field opsional `id` untuk dedup lokal↔cloud.
- **Cloud history merge** (`fetchHistoryFromCloud`) — dedup berdasarkan `id` (triage_id) bukan timestamp.

### Verified
- Simulasi logika: skenario bug lama mereproduksi 3 entri; skenario baru menghasilkan 1 entri. Typecheck 0 error, build 0 errors (21 routes).

## [0.7.0] — 2026-08-04

### Added
- **Release GitHub** — Repo `NDP4/medisense-pwa` (PRIVATE) dibuat + di-push, SSH user `NDP4`, default branch `main`, commit terakhir `5b4f3bf`
- **Favicon resmi** (`src/app/icon.svg`, `src/app/apple-icon.svg`) — Kotak #1E3A5F rounded + garis pulse ECG putih + aksen hijau #16A34A (konsisten dengan `public/icons/icon-512.svg`), `icons` metadata di `src/app/layout.tsx`
- **Onboarding swipe navigation** (`src/components/ui/onboarding.tsx`) — Swipe kiri/kanan (threshold 50px), navigasi keyboard ArrowLeft/Right, indikator swipe (MoveHorizontal + "Geser untuk lanjut") menggantikan tombol "Selanjutnya", tombol "Lewati" → "Selesai" (ikon Check) di slide terakhir, tombol "Kembali" dipertahankan untuk aksesibilitas

### Fixed
- **CI lint gagal (script interaktif)** (`.github/workflows/ci.yml`) — Ganti `npm run lint` → `npm run typecheck`
- **CI gagal karena package-lock tidak ter-track** — `package-lock.json` kini ter-track di git
- **CI actions outdated** — Upgrade `actions/checkout@v4`→`@v5`, `setup-node@v4`→`@v5`, node-version 20→22 LTS
- **tsbuildinfo ter-track** — Untrack `tsconfig.tsbuildinfo`, tambah `*.tsbuildinfo` ke `.gitignore`
- **Dataset 61,7 MB masih di history git** — `dataset/icu/chartevents.csv` di-untrack dari working tree (history belum di-rewrite — menunggu keputusan operator: `git filter-repo` + force push atau biarkan)

### Changed
- **CI kini hijau** — Build: 0 errors, 21 routes, durasi ±1m25s

## [0.6.0] — 2026-07-31

### Fixed
- **Double sync** (`src/components/triage/triage-wizard.tsx`) — Ubah `handleSync` dari direct `POST /api/sync/triage` menjadi panggil `syncManager.syncNow()`. Hilangkan duplikasi API call (Yjs periodic + manual).
- **voice_text tidak terkirim via Yjs** (`src/lib/sync.ts`, `src/components/triage/triage-wizard.tsx`) — Tambah field `voice_text` ke `TriageSyncData` interface dan kirim dari `handleAnalysisComplete`.
- **Riwayat tidak sync dari cloud** — Berbagai perbaikan:
  - Endpoint baru `GET /api/sync/history` untuk ambil riwayat dari Supabase
  - Action `fetchHistoryFromCloud` di `triage-store.ts` — fetch + dedup by timestamp
  - PWA layout panggil setelah `loadHistory()` dan setelah sync-complete
  - History page punya tombol Sync manual
- **Tidak ada tombol Kembali ke Beranda** (`src/components/triage/step-result.tsx`) — Tambah link "Kembali ke Beranda" di bawah tombol "Triase Baru"
- **/api/sync/history tidak terproteksi** (`src/middleware.ts`) — Tambah ke `PROTECTED_API_ROUTES`

### Changed
- **Sync chain disederhanakan** — Semua sync API via `syncManager.syncNow()`, tidak ada direct fetch di komponen
- **Sync langsung setelah analisis** — `handleAnalysisComplete` panggil `syncManager.syncNow()` segera setelah add ke Yjs

## [0.5.0] — 2026-07-30

### Fixed
- **Sync/triage 400: conditions empty array** (`src/components/triage/triage-wizard.tsx`) — Tambah default condition `'tidak_ada'` saat `result.conditions` kosong (probabilitas model < 0.1 untuk kedua kondisi). Fix di dua tempat: Yjs sync (line 91) dan direct API sync (line 138).
- **Middleware 401 Invalid token payload** (`src/middleware.ts`) — Baca `user_metadata.role` dari Supabase JWT (nested), bukan `user_role`.
- **device_id validation 400** (`src/lib/sync.ts`) — `getDeviceId()` return UUID murni tanpa prefix `device-`, sesuai Zod schema `z.string().uuid()`.
- **kader_id selalu 'unknown'** (`src/store/auth-store.ts`) — Panggil `syncManager.setKaderId(user.id)` di login() setelah autentikasi berhasil.

### Changed
- **Rantai sync penuh berfungsi** — Login → Middleware → Yjs local → API sync cloud. Semua link dari ujung ke ujung sekarang terhubung dan tervalidasi.

## [0.4.0] — 2026-07-30

### Added
- **Halaman Login** (`src/app/login/page.tsx`) — Form login dengan nomor telepon + password, validasi, error handling, loading state. Memanggil `POST /api/auth/login`.
- **Halaman Register** (`src/app/register/page.tsx`) — Form registrasi dengan nama, telepon, role (kader/bidan/puskesmas), password + konfirmasi. Memanggil `POST /api/auth/register`. Success page dengan redirect otomatis.
- **Integrasi Emergency Button** (`src/components/triage/step-result.tsx`) — Tombol 119 muncul di hasil triase level MERAH.
- **Logout** (`src/app/(pwa)/profile/page.tsx`) — Tombol "Keluar" di halaman Profile untuk user yang sudah login. Redirect ke `/login`.

### Fixed
- **Hydration Error** (`src/app/(pwa)/layout.tsx`) — `navigator.onLine` dipindahkan dari `useState` initializer ke `useEffect`. State default `true` untuk SSR, dikoreksi setelah mount.
- **Consent Screen Auto-Scroll Warning** (`src/components/triage/consent-screen.tsx`) — Hapus `position: fixed` sepenuhnya. Ganti dengan page-level flex layout (`min-h-screen bg-surface`). Render sebagai halaman penuh, bukan overlay modal. Tidak ada lagi warning "Skipping auto-scroll behavior" dari Next.js.
- **Register API 400** (`src/app/api/auth/register/route.ts`) — `puskesmas_id` dijadikan optional, auto-assign dari puskesmas pertama; nomor HP dinormalisasi ke E.164.
- **Emergency Button routing** (`src/components/ui/emergency-button.tsx`) — Integrasi penuh dengan hasil triase merah.

## [0.3.0] — 2026-07-29

### Added
- **PWA Layout** (`src/app/(pwa)/layout.tsx`) — Bottom navigation (4 items: Home, Triase Baru FAB, History, Profile). Sync status bar (online/offline/syncing/synced/error). Auto-dismiss sync status after 5s. Responsive padding + safe area.

### Components
- **ProgressStepper** (`src/components/ui/progress-stepper.tsx`) — 5-step visual indicator (active/completed/upcoming circles + labels)
- **BottomNav** (`src/components/ui/bottom-nav.tsx`) — Fixed bottom bar, max 4 items + center FAB, active state tracking
- **EmergencyButton** (`src/components/ui/emergency-button.tsx`) — Tombol 119 one-tap (red, 2x size, pulse animation)
- **Symptom Icons** (`src/components/triage/symptom-icons.tsx`) — 7 SVG illustrations (Demam, Batuk, Sesak, Kebingungan, Nyeri Dada, Diare, Kebiruan)
- **StepPatient** — Grid profil anggota keluarga (Diri Sendiri, Anak, Ibu, Ayah + custom)
- **StepSymptoms** — 2-column grid of symptom cards with SVG icons, multi-select
- **StepVoice** — Mic recording + manual text input + skip (optional)
- **StepAnalyze** — TF.js on-device inference with progress bar + disclaimer
- **StepResult** — Full background color by level (Hijau/Kuning/Merah), large icon, action list, 119 button (MERAH only), sync

### Pages

- **Home** (`/(pwa)/page.tsx`) — CTA triase baru card, quick stats (triase/offline/aman), 3 recent history cards
- **Triage Flow** (`/(pwa)/triage/page.tsx`) — Dynamic import (lazy loaded), 5-step wizard container
- **History** (`/(pwa)/history/page.tsx`) — Full history list with triage level indicators, empty state
- **Profile** (`/(pwa)/profile/page.tsx`) — User card, menu items, demo disclaimer

### Dependencies

- **lucide-react** — SVG icon library for UI elements (replaces emoji/font icons)
- **@serwist/next** — Service Worker utilities (manual SW deployed via `public/sw.js`)
