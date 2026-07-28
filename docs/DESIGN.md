# Design System — MediSense AI
## Arahan Visual & UX untuk PWA Triase Kesehatan

**Versi:** 1.0
**Desainer:** corex-designer (arahan ditulis oleh corex-pm berdasarkan design brief)
**Tanggal:** 28 Juli 2026

---

## 1. Design Philosophy

**"Warna adalah bahasa pertama, ilustrasi adalah bahasa kedua, teks adalah bahasa ketiga."**

MediSense AI dirancang untuk kader kesehatan desa dengan literasi digital rendah. Setiap layar harus bisa dipahami dalam **3 detik tanpa membaca teks**. Keputusan desain selalu mendahulukan:
1. **Kejelasan** — pengguna langsung tahu apa yang harus dilakukan
2. **Kecepatan** — setiap sesi triase selesai <3 menit
3. **Kepercayaan diri** — pengguna tidak takut "salah pencet" (71% khawatir)

---

## 2. Color System

### 2.1 Triage Colors (PRIMARY — Bahasa Utama Aplikasi)

Warna triase adalah ELEMEN PALING PENTING dalam desain. Warna latar penuh (full background) digunakan di layar hasil agar pengguna langsung tahu level tanpa membaca.

| Level | Hex | Background | Text | Makna | Ikon Pendamping |
|-------|-----|------------|------|-------|-----------------|
| **Hijau** | `#16A34A` | `#DCFCE7` | Putih `#FFFFFF` | Aman — rawat jalan mandiri | ✅ Lingkaran centang |
| **Kuning** | `#EAB308` | `#FEF9C3` | Putih `#FFFFFF` | Waspada — rujuk ≤24 jam | ⚠️ Segitiga seru |
| **Merah** | `#DC2626` | `#FEE2E2` | Putih `#FFFFFF` | **DARURAT** — segera 119 | ❌ Lingkaran X |

**Aturan ketat:**
- Warna triase **HANYA** dipakai untuk hasil triase — jangan untuk elemen UI umum
- Tombol 119: merah solid `#DC2626` dengan animasi pulse, ukuran 2x tombol normal
- Warna triase juga dibedakan dengan **bentuk ikon** (lingkaran/segitiga/X) untuk pengguna color-blind

### 2.2 UI Colors (Netral)

| Fungsi | Hex | Penggunaan |
|--------|-----|------------|
| Primary | `#1E3A5F` | Header, tombol utama non-triase, nav bar |
| Surface | `#FFFFFF` | Background kartu, modal |
| Text Primary | `#1F2937` | Judul, konten utama |
| Text Secondary | `#6B7280` | Label, keterangan |
| Border | `#E5E7EB` | Garis pemisah, border card |
| Muted Background | `#F9FAFB` | Background layar selain triase |

---

## 3. Typography

| Elemen | Font | Ukuran | Weight | Warna |
|--------|-----|--------|--------|-------|
| Hasil triase (angka/label) | Inter | 48px | Bold (700) | Putih |
| Nama kondisi | Inter | 24px | Semibold (600) | Putih |
| Judul halaman | Inter | 20px | Semibold (600) | `#1F2937` |
| Body teks | Inter | 16px | Regular (400) | `#1F2937` |
| Label gejala | Inter | 14px | Medium (500) | `#4B5563` |
| Tombol | Inter | 18px | Semibold (600) | Putih |
| Disclaimer medis | Inter | 12px | Regular (400) | `#6B7280` |

**Aturan:**
- Minimum 16px untuk teks yang bisa disentuh (tombol, link)
- Jangan gunakan italic — sulit dibaca di layar kecil
- Line height: 1.5 untuk body, 1.2 untuk heading

---

## 4. Layout & Spacing

| Token | Ukuran | Penggunaan |
|-------|--------|------------|
| `space-2` | 8px | Gap antar ikon kecil |
| `space-4` | 16px | Margin layar (kiri/kanan), gap antar kartu |
| `space-6` | 24px | Gap antar section |
| `space-8` | 32px | Padding tombol (vertikal) |
| `space-12` | 48px | Jarak bottom nav ke konten |

### Grid
- Mobile: 4-column grid, gutter 16px
- Tablet/Dashboard: 12-column grid, gutter 24px
- Touch target minimal: **48x48dp** (rekomendasi 56dp untuk sering dipakai)
- Bottom navigation: fixed 64px height, 4 icon max

---

## 5. Iconography & Ilustrasi

### 5.1 Ikon UI (dari Lucide Icons)
Gunakan Lucide Icons untuk semua elemen UI (tombol, navigasi, status). Jangan pakai font icon.

Ikon yang dipakai:
- `home`, `activity`, `history`, `user`, `mic`, `phone`, `check`, `alert-triangle`, `x-circle`, `arrow-left`, `chevron-right`, `search`, `settings`

### 5.2 Ilustrasi Gejala (Kustom SVG)
Ini adalah aset desain PALING KRUSIAL. 47 ilustrasi gejala (25 untuk 5 kondisi MVP).

**Spesifikasi:**
- Format: **SVG murni** (inline atau file, jangan PNG/JPG)
- Ukuran: 120x120dp di grid gejala, 80x80dp di card hasil
- Style: **Flat illustration, line art tebal (2-3px stroke)**
- Palette: Outline `#4B5563`, Aksen `#3B82F6` (biru), Fill `#F3F4F6`
- Setiap ilustrasi punya label 2-3 kata di bawah (14px, `#4B5563`)
- File: `public/illustrations/gejala-{kondisi}-{nomor}.svg`

### 5.3 Brief Ilustrasi per Kondisi (5 MVP)

**SEPSIS (4 ilustrasi):**
1. `gejala-sepsis-01-demam.svg` — Termometer merah di mulut, background wajah
2. `gejala-sepsis-02-napas.svg` — Ikon paru-paru dengan garis napas cepat (zigzag)
3. `gejala-sepsis-03-bingung.svg` — Kepala dengan tanda tanya besar di samping
4. `gejala-sepsis-04-tekanan.svg` — Tensimeter dengan jarum di zona merah

**STROKE ISKEMIK (5 ilustrasi):**
1. `gejala-stroke-01-wajah.svg` — Wajah, satu sisi tersenyum, sisi lain turun
2. `gejala-stroke-02-lengan.svg` — Dua tangan, satu terangkat normal, satu lemah ke bawah
3. `gejala-stroke-03-bicara.svg` — Mulut dengan gelombang suara tidak beraturan
4. `gejala-stroke-04-pusing.svg` — Kepala dengan garis spiral di sekeliling
5. `gejala-stroke-05-mati rasa.svg` — Tubuh, setengah warna gelap setengah terang

**PRE-EKLAMPSIA (5 ilustrasi):**
1. `gejala-preklampsia-01-kepala.svg` — Kepala dengan ikon petir di area dahi
2. `gejala-preklampsia-02-penglihatan.svg` — Mata dengan efek buram/kabut
3. `gejala-preklampsia-03-bengkak.svg` — Kaki dengan tanda pembengkakan (garis melengkung)
4. `gejala-preklampsia-04-tekanan.svg` — Tensimeter digital, angka 160/110
5. `gejala-preklampsia-05-mual.svg` — Perut dengan gelombang mual

**DBD (5 ilustrasi):**
1. `gejala-dbd-01-demam.svg` — Termometer dengan grafik lonjakan tinggi
2. `gejala-dbd-02-nyeri.svg` — Sendi lutut/siku dengan tanda nyeri (garis merah)
3. `gejala-dbd-03-bintik.svg` — Lengan dengan bintik-bintik merah (petekie)
4. `gejala-dbd-04-muntah.svg` — Wajah miring dengan muntahan
5. `gejala-dbd-05-perdarahan.svg` — Gusi berdarah atau luka dengan tetes darah

**PNEUMONIA BALITA (5 ilustrasi):**
1. `gejala-pneumonia-01-batuk.svg` — Bayi/wajah dengan garis batuk
2. `gejala-pneumonia-02-demam.svg` — Termometer (untuk balita)
3. `gejala-pneumonia-03-napas.svg` — Hidung dengan garis napas cepat
4. `gejala-pneumonia-04-tarik-dada.svg` — Dada bayi dengan tanda tarikan (cekungan)
5. `gejala-pneumonia-05-makan.svg` — Sendok dot dengan tanda silang (tidak mau makan)

---

## 6. Komponen UI

### 6.1 Tombol Triase (Button — Triage Result)
- Full width, background warna solid sesuai level
- Text putih, 18px semibold
- Border radius: 12px
- Padding: 16px vertical, 24px horizontal

### 6.2 Tombol 119 (Button — Emergency)
- Ukuran: 2x tombol normal
- Background: `#DC2626` (merah)
- Icon: Lucide `phone` (putih, 24px)
- Animasi: **pulse** (skala 1 → 1.05 → 1, loop 2s)
- Text: putih, 20px bold, "HUBUNGI 119"
- Posisi: sticky bottom, di atas bottom nav

### 6.3 Card Gejala (Symptom Card)
- Background: putih `#FFFFFF`
- Border: 1px `#E5E7EB`, border radius 12px
- Padding: 16px
- Layout: ilustrasi di atas, label di bawah (center)
- Active state: border 2px `#3B82F6`, background `#EFF6FF`
- Multi-select: beberapa card bisa aktif

### 6.4 Card Riwayat (History Card)
- Horizontal layout: ikon warna triase (kiri) → nama pasien + kondisi (tengah) → waktu (kanan)
- Border kiri: 4px solid sesuai level triase

### 6.5 Bottom Navigation
- Fixed di bawah, height 64px
- 4 item max: Home, Triase Baru, Riwayat, Profil
- Active state: icon + label, warna `#1E3A5F`
- Inactive: icon only atau icon + label abu-abu
- Tombol "Triase Baru" di tengah: circular FAB (floating action button)

### 6.6 Progress Stepper (Alur Triase)
- 5 lingkaran horizontal di atas layar
- Active: lingkaran solid biru
- Completed: lingkaran centang hijau
- Upcoming: lingkaran outline abu
- Label singkat di bawah: "Pasien" → "Gejala" → "Suara" → "Proses" → "Hasil"

---

## 7. Alur Layar (Screen Flows)

### 7.1 Layar 1 — Home / Dashboard
```
┌─────────────────────────────────┐
│ [Logo MediSense]          [⚙]  │  Header
├─────────────────────────────────┤
│ "Halo, [Nama Kader]!"          │  Greeting (20px)
│ "Terakhir: 2 hari lalu"         │  Subtitle (14px)
├─────────────────────────────────┤
│ ┌───────────────────────────┐   │
│ │   [+ TRIASE BARU]         │   │  CTA Tombol Besar
│ │   Ikon stetoskop + plus   │   │  Background #1E3A5F
│ └───────────────────────────┘   │
├─────────────────────────────────┤
│ Riwayat Terakhir                │  Section Title (16px)
│ ┌───────────────────────────┐   │
│ │ 🟢 Andi — Demam biasa     │   │  History Card
│ │    12 Jul, 14:30          │   │
│ ├───────────────────────────┤   │
│ │ 🟡 Siti — DBD dicurigai   │   │
│ │    10 Jul, 09:15          │   │
│ └───────────────────────────┘   │
│ [Lihat Semua >]                │  Link
├─────────────────────────────────┤
│                                │
├─────────────────────────────────┤
│ [🏠]  [➕]  [📋]  [👤]        │  Bottom Nav
└─────────────────────────────────┘
```

### 7.2 Layar 2 — Pilih Pasien
```
┌─────────────────────────────────┐
│ ◀ Kembali         Lewati ▶     │  Header
├─────────────────────────────────┤
│ ○ ○ ○ ○ ○                      │  Progress: Langkah 1/5
├─────────────────────────────────┤
│ "Siapa yang akan diperiksa?"   │  Title (20px)
├─────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐    │
│ │      │ │      │ │      │    │  Grid profil
│ │ 👤   │ │ 👤   │ │ 👤   │    │  Foto/ikon + nama
│ │ Ibu  │ │ Anak │ │ Kakek│    │  Simple, 3 per baris
│ └──────┘ └──────┘ └──────┘    │
│ ┌──────┐ ┌──────────────────┐ │
│ │ 👤   │ │ [+ Pasien Baru]  │ │
│ │ Ayah │ │ Ikon tambah      │ │
│ └──────┘ └──────────────────┘ │
├─────────────────────────────────┤
│                                │
│ [ Selanjutnya > ]              │  Button
└─────────────────────────────────┘
```

### 7.3 Layar 3 — Input Gejala (LAYAR UTAMA)
```
┌─────────────────────────────────┐
│ ◀ Kembali                       │
├─────────────────────────────────┤
│ ● ○ ○ ○ ○                      │  Progress: Langkah 2/5
├─────────────────────────────────┤
│ "Apa keluhan yang dirasakan?"   │  Title (20px)
│ "Pilih semua yang sesuai"       │  Subtitle (14px)
├─────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐      │
│ │  🔥     │ │  🤕     │      │  2-column grid
│ │ Demam    │ │ Pusing   │      │
│ │ Tinggi   │ │ Berat    │      │
│ └──────────┘ └──────────┘      │
│ ┌──────────┐ ┌──────────┐      │
│ │  💨     │ │  😵     │      │
│ │ Napas    │ │ Mual     │      │
│ │ Cepat    │ │ Muntah   │      │
│ └──────────┘ └──────────┘      │
│ ┌──────────┐ ┌──────────┐      │
│ │  ...     │ │  ...     │      │
│ └──────────┘ └──────────┘      │
│ [Pilih minimal 1 gejala]        │  Hint text (14px)
├─────────────────────────────────┤
│ [ Selanjutnya (3 dipilih) > ]   │  Button (active jika ≥1)
└─────────────────────────────────┘
```

### 7.4 Layar 4 — Input Suara (Opsional)
```
┌─────────────────────────────────┐
│ ◀ Kembali               Lewati │
├─────────────────────────────────┤
│ ● ● ○ ○ ○                      │  Progress: Langkah 3/5
├─────────────────────────────────┤
│ "Tambahkan suara (opsional)"    │  Title
│ "Ceritakan keluhan dengan       │
│  bahasa yang nyaman"            │
├─────────────────────────────────┤
│                                 │
│          ┌──────────┐           │
│          │   🎤     │           │  Tombol mic besar
│          │  Tekan    │          │  96x96px
│          │  & Bicara │          │  Pulse saat merekam
│          └──────────┘           │
│                                 │
│ "Bahasa: Indonesia" [Ganti]     │  Language selector
├─────────────────────────────────┤
│ ┌───────────────────────────┐   │
│ │ "Saya demam sejak 3 hari  │   │  Hasil transkrip
│ │  dan pusing berat..."     │   │  (setelah rekam)
│ └───────────────────────────┘   │
├─────────────────────────────────┤
│ [ Gunakan Teks Ini > ]          │  Button
│ [ Lewati ]                      │  Link
└─────────────────────────────────┘
```

### 7.5 Layar 5 — Analisis (Loading)
```
┌─────────────────────────────────┐
│                                 │
│                                 │
│      ┌────────────────┐         │
│      │  🔄            │         │  Animasi loading
│      │  (berdenyut)    │         │  Logo MediSense
│      └────────────────┘         │
│                                 │
│   "Menganalisis gejala..."      │  Text (20px)
│   "Bentar ya, lagi diproses"    │  Subtitle (14px, santai)
│                                 │
│   [■□□□□□□□□□] 10%              │  Progress bar (opsional)
│                                 │
│   "Proses ini berjalan offline  │  Disclaimer (12px)
│    di perangkat Anda. Data      │
│    aman dan tidak dikirim."     │
│                                 │
└─────────────────────────────────┘
```

### 7.6 Layar 6 — HASIL TRIASE (LAYAR PALING KRITIS)
```
┌─────────────────────────────────┐
│   🔒 Data aman di perangkat    │  Top chip (12px)
├─────────────────────────────────┤
│                                 │
│                                 │
│         ┌──────────┐            │
│         │    ✅    │            │  Icon besar 64px
│         │ (putih)  │            │  Lingkaran/Centang
│         └──────────┘            │  atau ❌ / ⚠️
│                                 │
│           AMAN                  │  Level (32px bold, putih)
│                                 │
│       Demam Biasa               │  Nama kondisi (24px)
│                                 │
│  ─── ─── ─── ─── ─── ───       │  Separator putih 50%
│                                 │
│  ✅ Minum obat sesuai gejala    │  Tindakan (16px)
│  ✅ Istirahat cukup             │
│  ✅ Minum air putih             │
│  ❗ Jika memburuk dalam 2 hari  │
│    segera ke Puskesmas          │
│                                 │
│                                 │
│                                 │
│  [ Triase Baru ]                │  Button outline putih
│                                 │
│  "Ini alat bantu, bukan         │  Disclaimer (12px)
│   diagnosis dokter. Konsultasi  │  WAJIB ada
│   dengan tenaga kesehatan."     │
├─────────────────────────────────┤
│ [🏠]  [➕]  [📋]  [👤]        │  Bottom Nav
└─────────────────────────────────┘

CATATAN: Background layar FULL warna sesuai level:
- HIJAU (#16A34A) untuk Aman
- KUNING (#EAB308) untuk Waspada
- MERAH (#DC2626) untuk Darurat

Untuk level MERAH, tambahkan tombol 119 besar
di antara tindakan dan tombol Triase Baru.
```

---

## 8. Accessibility Notes

| Aspek | Standar | Implementasi |
|-------|---------|--------------|
| Kontras rasio | ≥4.5:1 teks normal, ≥3:1 teks besar | Semua teks di background triase putih, kontras >4.5:1 |
| Color-blind safety | Informasi tidak hanya dari warna | Warna triase + ikon (✅ centang, ⚠️ seru, ❌ X) + label teks |
| Touch target | ≥48x48dp (WCAG) | Semua tombol ≥56dp |
| Font scaling | Mendukung sistem font size | Layout fluid, tidak fixed pixel |
| Fokus visual | Outline jelas untuk keyboard nav | Focus ring 2px `#3B82F6` |
| Bahasa sederhana | Hindari istilah medis rumit | "Napas cepat" bukan "Takipnea", "Bintik merah" bukan "Petekie" |

---

## 9. Loading & Empty States

### 9.1 Loading States
- **Gejala loading:** Skeleton card (abu-abu bergelombang) dengan grid 2 kolom
- **Analisis AI:** Animasi logo MediSense berdenyut + progress bar
- **Sync data:** Indikator kecil di pojok, non-intrusive

### 9.2 Empty States
- **Riwayat kosong:** Ilustrasi clipboard kosong + "Belum ada sesi triase. Mulai triase baru sekarang!"
- **Tidak ada anggota keluarga:** Ilustrasi orang + "Tambahkan anggota keluarga agar lebih cepat"
- **Belum ada koneksi:** Ilustrasi offline + "Data akan tersimpan otomatis saat offline"

---

## 10. Prioritas Implementasi (untuk corex-frontend)

### 🔴 HIGH — Kerjakan duluan
1. **Sistem warna triase** - Tailwind config + komponen dasar (card hasil, tombol 119)
2. **Layar Hasil Triase** - Layar paling kritis, tentukan mood seluruh app
3. **Layar Input Gejala** - Grid ilustrasi 2 kolom, state multi-select
4. **Alur navigasi 5 langkah** - Progress stepper + routing

### 🟡 MEDIUM
5. **Layar Home/Dashboard** - Riwayat + tombol triase baru
6. **Pilih Pasien** - Grid anggota keluarga + tambah baru
7. **Input Suara** - Tombol mic + rekaman + transkrip
8. **Loading screen** - Animasi + progress

### 🟢 LOW
9. **Dashboard Puskesmas** - Web dashboard (terpisah, setelah PWA inti jadi)
10. **Gamifikasi** - Badge, leaderboard (pasca-MVP)
11. **Onboarding** - Tur berpandu (pasca-MVP)

---

*Dokumen ini adalah panduan desain untuk seluruh pengembangan MediSense AI. Update jika ada perubahan keputusan visual.*