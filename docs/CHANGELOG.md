# Changelog MediSense AI

Semua perubahan signifikan pada proyek ini akan dicatat di sini.

Format berdasarkan [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
dan proyek ini mengikuti [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

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
