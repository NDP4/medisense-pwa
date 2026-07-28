# Design System — MediSense AI
## Arahan Visual & UX untuk PWA Triase Kesehatan

**Versi:** 2.0
**Desainer:** corex-designer
**Tanggal:** 28 Juli 2026
**Status:** Final

---

## 1. Design Philosophy

**"Warna adalah bahasa pertama, ilustrasi adalah bahasa kedua, teks adalah bahasa ketiga."**

MediSense AI dirancang untuk kader kesehatan desa dengan literasi digital rendah. Setiap layar harus bisa dipahami dalam 3 detik tanpa membaca teks. Keputusan desain selalu mendahulukan:

1. **Kejelasan** — pengguna langsung tahu apa yang harus dilakukan
2. **Kecepatan** — setiap sesi triase selesai kurang dari 3 menit
3. **Kepercayaan diri** — pengguna tidak takut "salah pencet" (71% khawatir berdasarkan survei)

---

## 2. Color System

### 2.1 Triage Colors — Bahasa Utama Aplikasi

Warna triase adalah elemen paling penting. Warna latar penuh (full background) digunakan di layar hasil agar pengguna langsung tahu level tanpa membaca teks.

| Level | Hex | Background | Text Color | Makna | Ikon Pendamping |
|-------|-----|------------|------------|-------|-----------------|
| **Hijau** | `#16A34A` | `#DCFCE7` | White `#FFFFFF` | Aman — rawat jalan mandiri | Lucide: `check-circle` |
| **Kuning** | `#EAB308` | `#FEF9C3` | White `#FFFFFF` | Waspada — rujuk dalam 24 jam | Lucide: `alert-triangle` |
| **Merah** | `#DC2626` | `#FEE2E2` | White `#FFFFFF` | Darurat — segera hubungi 119 | Lucide: `x-circle` |

**Aturan ketat:**
- Warna triase hanya dipakai untuk hasil triase — jangan untuk elemen UI umum
- Tombol 119: merah solid `#DC2626`, animasi pulse, ukuran 2x tombol normal
- Warna triase juga dibedakan dengan bentuk ikon berbeda (lingkaran, segitiga, X) untuk pengguna color-blind

### 2.2 UI Colors — Netral

| Fungsi | Hex | Penggunaan |
|--------|-----|------------|
| Primary | `#1E3A5F` | Header, tombol utama non-triase, bottom nav |
| Surface | `#FFFFFF` | Background kartu, modal |
| Text Primary | `#1F2937` | Judul, konten utama |
| Text Secondary | `#6B7280` | Label, keterangan, hint text |
| Border | `#E5E7EB` | Garis pemisah, border kartu |
| Muted Background | `#F9FAFB` | Background layar selain triase |

---

## 3. Typography

| Elemen | Font | Ukuran | Weight | Warna |
|--------|------|--------|--------|-------|
| Hasil triase (label level) | Inter | 48px | Bold (700) | White |
| Nama kondisi | Inter | 24px | Semibold (600) | White |
| Judul halaman | Inter | 20px | Semibold (600) | `#1F2937` |
| Body teks | Inter | 16px | Regular (400) | `#1F2937` |
| Label gejala | Inter | 14px | Medium (500) | `#4B5563` |
| Tombol | Inter | 18px | Semibold (600) | White |
| Disclaimer medis | Inter | 12px | Regular (400) | `#6B7280` |

**Aturan:**
- Minimum 16px untuk teks yang bisa disentuh (tombol, link)
- Jangan gunakan italic — sulit dibaca di layar kecil
- Line height: 1.5 untuk body, 1.2 untuk heading

---

## 4. Layout & Spacing

| Token | Ukuran | Penggunaan |
|-------|--------|------------|
| `space-2` | 8px | Gap antar ikon kecil dalam satu baris |
| `space-4` | 16px | Margin layar kiri/kanan, gap antar kartu |
| `space-6` | 24px | Gap antar section vertikal |
| `space-8` | 32px | Padding tombol vertikal |
| `space-12` | 48px | Jarak bottom navigation ke konten |

**Grid system:**
- Mobile: 4-column grid, gutter 16px
- Tablet atau Dashboard: 12-column grid, gutter 24px
- Touch target minimal: 48x48dp (rekomendasi 56dp)
- Bottom navigation: fixed 64px height, maksimal 4 item

---

## 5. Iconography & Ilustrasi

### 5.1 Ikon UI — Lucide Icons

Gunakan Lucide Icons untuk semua elemen UI. Dilarang menggunakan emoji atau font icon.

Daftar ikon yang dipakai:
- `home`, `activity`, `history`, `user`, `mic`, `phone`, `phone-forwarded`
- `check`, `check-circle`, `alert-triangle`, `x-circle`
- `arrow-left`, `chevron-right`, `chevron-left`
- `search`, `settings`, `plus`, `circle-plus`
- `stethoscope`, `thermometer`, `lungs`, `brain`
- `eye`, `eye-off`, `foot`, `bone`, `droplets`
- `baby`, `utensils-crossed`, `rotate-cw`, `lock`
- `clipboard-list`, `users`, `map-pin`

### 5.2 Ilustrasi Gejala — Kustom SVG

Ini adalah aset desain paling krusial. Total 47 ilustrasi gejala (25 untuk 5 kondisi MVP).

**Spesifikasi teknis:**
- Format: SVG murni — dilarang PNG, JPG, atau emoji
- Ukuran: 120x120dp di grid gejala, 80x80dp di kartu hasil
- Style: Flat illustration, line art tebal stroke 2-3px
- Warna: Outline `#4B5563`, Aksen `#3B82F6`, Fill `#F3F4F6`
- Setiap ilustrasi memiliki label 2-3 kata di bawah (14px, `#4B5563`)
- File naming: `gejala-{kondisi}-{nomor}.svg`

### 5.3 Brief Ilustrasi per Kondisi (5 MVP)

**SEPSIS (4 ilustrasi):**
| File | Deskripsi Visual |
|------|-----------------|
| `gejala-sepsis-01-demam.svg` | Termometer di mulut, latar wajah, garis demam merah |
| `gejala-sepsis-02-napas.svg` | Paru-paru dengan garis napas zigzag cepat |
| `gejala-sepsis-03-bingung.svg` | Kepala dengan tanda tanya di samping |
| `gejala-sepsis-04-tekanan.svg` | Tensimeter jarum di zona merah |

**STROKE ISKEMIK (5 ilustrasi):**
| File | Deskripsi Visual |
|------|-----------------|
| `gejala-stroke-01-wajah.svg` | Wajah, satu sisi tersenyum, sisi lain turun |
| `gejala-stroke-02-lengan.svg` | Dua tangan, satu terangkat normal, satu lemas |
| `gejala-stroke-03-bicara.svg` | Mulut dengan gelombang suara tidak beraturan |
| `gejala-stroke-04-pusing.svg` | Kepala dengan garis spiral di sekeliling |
| `gejala-stroke-05-mati-rasa.svg` | Tubuh setengah warna gelap, setengah terang |

**PRE-EKLAMPSIA (5 ilustrasi):**
| File | Deskripsi Visual |
|------|-----------------|
| `gejala-preklampsia-01-kepala.svg` | Kepala dengan ikon petir di dahi |
| `gejala-preklampsia-02-penglihatan.svg` | Mata dengan efek buram |
| `gejala-preklampsia-03-bengkak.svg` | Kaki dengan garis pembengkakan |
| `gejala-preklampsia-04-tekanan.svg` | Tensimeter digital, angka 160/110 |
| `gejala-preklampsia-05-mual.svg` | Perut dengan gelombang mual |

**DBD (5 ilustrasi):**
| File | Deskripsi Visual |
|------|-----------------|
| `gejala-dbd-01-demam.svg` | Termometer dengan grafik lonjakan tinggi |
| `gejala-dbd-02-nyeri.svg` | Sendi lutut dengan tanda nyeri garis merah |
| `gejala-dbd-03-bintik.svg` | Lengan dengan bintik merah (petekie) |
| `gejala-dbd-04-muntah.svg` | Wajah miring dengan muntahan |
| `gejala-dbd-05-perdarahan.svg` | Gusi berdarah atau luka dengan tetes darah |

**PNEUMONIA BALITA (5 ilustrasi):**
| File | Deskripsi Visual |
|------|-----------------|
| `gejala-pneumonia-01-batuk.svg` | Bayi dengan garis batuk |
| `gejala-pneumonia-02-demam.svg` | Termometer (untuk balita) |
| `gejala-pneumonia-03-napas.svg` | Hidung dengan garis napas cepat |
| `gejala-pneumonia-04-tarik-dada.svg` | Dada bayi dengan cekungan tarikan |
| `gejala-pneumonia-05-makan.svg` | Sendok dot dengan tanda silang |

---

## 6. Komponen UI

### 6.1 Tombol Triase
- Full width, background warna solid sesuai level (Hijau/Kuning/Merah)
- Text putih, 18px semibold
- Border radius: 12px
- Padding: 16px vertikal, 24px horizontal

### 6.2 Tombol 119 — Emergency
- Ukuran: 2x tombol normal
- Background: `#DC2626` (merah solid)
- Icon: Lucide `phone` putih 24px
- Animasi: pulse CSS (skala 1 ke 1.05, durasi 2s, loop infinite)
- Text: putih 20px bold "HUBUNGI 119"
- Posisi: sticky bottom, di atas bottom navigation

### 6.3 Kartu Gejala — Symptom Card
- Background: putih `#FFFFFF`
- Border: 1px solid `#E5E7EB`, border radius 12px
- Padding: 16px
- Layout: ilustrasi di tengah atas, label teks di bawah (center alignment)
- Active state: border 2px solid `#3B82F6`, background `#EFF6FF`
- Multi-select: beberapa kartu bisa aktif bersamaan

### 6.4 Kartu Riwayat — History Card
- Horizontal layout
- Border kiri: 4px solid sesuai level triase
- Konten: icon level triase (kiri) — nama pasien + kondisi (tengah) — waktu (kanan)

### 6.5 Bottom Navigation
- Fixed di bawah, height 64px
- Maksimal 4 item: Home, Triase Baru, Riwayat, Profil
- Active state: icon + label teks, warna `#1E3A5F`
- Inactive state: icon + label teks, warna abu-abu `#9CA3AF`
- Tombol "Triase Baru" di tengah: circular FAB (floating action button)

### 6.6 Progress Stepper — Alur Triase
- 5 lingkaran horizontal di atas layar
- Active: lingkaran solid biru `#3B82F6`
- Completed: lingkaran solid hijau dengan icon centang
- Upcoming: lingkaran outline abu `#D1D5DB`
- Label singkat di bawah: "Pasien" — "Gejala" — "Suara" — "Proses" — "Hasil"

---

## 7. Alur Layar — Screen Flows

### 7.1 Layar 1 — Home / Dashboard

```
+----------------------------------+
| [LOGO]                    [icon] |  Header: logo kiri, settings kanan
+----------------------------------+
| "Halo, [Nama Kader]!"           |  Greeting 20px
| "Terakhir: 2 hari lalu"         |  Subtitle 14px
+----------------------------------+
| +------------------------------+ |
| |     [icon: stethoscope]      | |  CTA Tombol Besar
| |     [+ TRIASE BARU]          | |  Background #1E3A5F
| +------------------------------+ |
+----------------------------------+
| Riwayat Terakhir                 |  Section title
| +------------------------------+ |
| | [HIJAU] Andi - Demam biasa   | |  History card
| |         12 Jul, 14:30        | |
| +------------------------------+ |
| | [KUNING] Siti - DBD dicurigai| |
| |         10 Jul, 09:15        | |
| +------------------------------+ |
| [Lihat Semua >]                  |  Link
+----------------------------------+
|                                  |
+----------------------------------+
| [home] [+] [history] [user]     |  Bottom Nav
+----------------------------------+
```

### 7.2 Layar 2 — Pilih Pasien

```
+----------------------------------+
| [<] Kembali           Lewati [>] |  Header
+----------------------------------+
| (o) (o) (o) (o) (o)             |  Progress: Langkah 1/5
+----------------------------------+
| "Siapa yang akan diperiksa?"    |  Title 20px
+----------------------------------+
| +------+ +------+ +------+     |
| | icon | | icon | | icon |     |  Grid profil
| | Ibu  | | Anak | | Kakek|     |  3 kolom
| +------+ +------+ +------+     |
| +------+ +-------------------+ |
| | icon | | [+ Pasien Baru]   | |
| | Ayah | | Icon plus         | |
| +------+ +-------------------+ |
+----------------------------------+
|                                  |
| [ Selanjutnya > ]                |  Button
+----------------------------------+
```

### 7.3 Layar 3 — Input Gejala (LAYAR UTAMA)

```
+----------------------------------+
| [<] Kembali                      |  Header
+----------------------------------+
| (@) (o) (o) (o) (o)             |  Progress: Langkah 2/5
+----------------------------------+
| "Apa keluhan yang dirasakan?"   |  Title 20px
| "Pilih semua yang sesuai"       |  Subtitle 14px
+----------------------------------+
| +----------+ +----------+       |
| | Ilustrasi| | Ilustrasi|       |  2-column grid
| | Demam    | | Pusing   |       |  gap 16px
| | Tinggi   | | Berat    |       |
| +----------+ +----------+       |
| +----------+ +----------+       |
| | Ilustrasi| | Ilustrasi|       |
| | Napas    | | Mual     |       |
| | Cepat    | | Muntah   |       |
| +----------+ +----------+       |
| ... (scroll)                    |
| [Pilih minimal 1 gejala]        |  Hint text
+----------------------------------+
| [ Selanjutnya (3 dipilih) > ]   |  Button sticky bottom
+----------------------------------+
```

### 7.4 Layar 4 — Input Suara (Opsional)

```
+----------------------------------+
| [<] Kembali           Lewati    |  Header
+----------------------------------+
| (@) (@) (o) (o) (o)             |  Progress: Langkah 3/5
+----------------------------------+
| "Tambahkan suara (opsional)"    |  Title 20px
| "Ceritakan keluhan dengan       |
|  bahasa yang nyaman"            |
+----------------------------------+
|                                  |
|        +----------------+        |
|        |  [icon: mic]   |        |  Tombol mic 96x96px
|        |  Tekan &       |        |  Animasi pulse saat rekam
|        |  Bicara        |        |
|        +----------------+        |
|                                  |
| Bahasa: Indonesia  [Ganti]       |  Language selector
+----------------------------------+
| +------------------------------+ |
| | "Saya demam sejak 3 hari    | |  Transkrip hasil
| |  dan pusing berat..."       | |  (setelah rekam)
| +------------------------------+ |
+----------------------------------+
| [ Gunakan Teks Ini > ]          |  Button
| [ Lewati ]                      |  Link
+----------------------------------+
```

### 7.5 Layar 5 — Analisis (Loading)

```
+----------------------------------+
|                                  |
|                                  |
|        +----------------+        |
|        | [animasi logo] |        |  Logo MediSense berdenyut
|        |    loading     |        |
|        +----------------+        |
|                                  |
|    "Menganalisis gejala..."      |  Text 20px
|    "Sebentar, sedang diproses"  |  Subtitle 14px
|                                  |
|    [##################....] 70%  |  Progress bar
|                                  |
|    Proses ini berjalan offline   |  Disclaimer 12px
|    di perangkat Anda. Data       |
|    aman dan tidak dikirim.       |
|                                  |
+----------------------------------+
```

### 7.6 Layar 6 — Hasil Triase (LAYAR PALING KRITIS)

```
+----------------------------------+
| [icon: lock] Data aman di lokal |  Top chip 12px
+----------------------------------+
|                                  |
|          +------------+          |
|          | [icon: 64px]|          |  Icon besar:
|          |  check/     |          |  Hijau: check-circle
|          |  triangle/  |          |  Kuning: alert-triangle
|          |  x          |          |  Merah: x-circle
|          +------------+          |
|                                  |
|            [LEVEL]               |  Level 32px bold white
|                                  |  "AMAN" / "WASPADA" / "DARURAT"
|                                  |
|        [Nama Kondisi]           |  Condition name 24px
|                                  |
|    --- --- --- --- --- ---       |  Separator 50% opacity
|                                  |
|    [icon: check] Tindakan 1     |  Action list 16px
|    [icon: check] Tindakan 2     |  Text putih
|    [icon: check] Tindakan 3     |
|    [icon: alert] Jika memburuk  |
|     dalam 2 hari ke Puskesmas   |
|                                  |
|    [only for MERAH:             |
|     +----------------------+    |
|     | [icon: phone]        |    |  Tombol 119 (2x ukuran)
|     | HUBUNGI 119          |    |  Background putih
|     +----------------------+]   |
|                                  |
|    [ Triase Baru ]               |  Button outline putih
|                                  |
|    "Ini alat bantu, bukan        |  Disclaimer 12px
|     diagnosis dokter. Konsultasi |
|     dengan tenaga kesehatan."    |
+----------------------------------+
| [home] [+] [history] [user]    |  Bottom Nav
+----------------------------------+

CATATAN: Background layar FULL warna sesuai level triase:
- Hijau (#16A34A) untuk level AMAN
- Kuning (#EAB308) untuk level WASPADA
- Merah (#DC2626) untuk level DARURAT
- Semua teks PUTIH (#FFFFFF)
```

---

## 8. Aksesibilitas

| Aspek | Standar | Implementasi |
|-------|---------|--------------|
| Kontras rasio | Minimum 4.5:1 teks normal, 3:1 teks besar | Semua teks di background triase berwarna putih, kontras di atas 4.5:1 |
| Color-blind safety | Informasi tidak boleh hanya dari warna | Warna triase + ikon berbeda (check-circle, alert-triangle, x-circle) + label teks level |
| Touch target | Minimum 48x48dp (WCAG) | Semua tombol minimum 56dp |
| Font scaling | Mendukung pengaturan font size sistem | Layout fluid menggunakan rem, tidak fixed pixel |
| Focus indicator | Outline jelas untuk keyboard | Focus ring 2px solid `#3B82F6` |
| Bahasa sederhana | Hindari istilah medis rumit | "Napas cepat" bukan "Takipnea", "Bintik merah" bukan "Petekie" |

---

## 9. Loading & Empty States

### 9.1 Loading States
- **Gejala loading:** Skeleton card abu-abu bergelombang, grid 2 kolom
- **Analisis AI:** Animasi logo MediSense berdenyut + progress bar
- **Sync data:** Indikator kecil di pojok, non-intrusif

### 9.2 Empty States
- **Riwayat kosong:** Ilustrasi clipboard kosong + "Belum ada sesi triase. Mulai triase baru sekarang!"
- **Tidak ada anggota keluarga:** Ilustrasi orang + "Tambahkan anggota keluarga agar lebih cepat"
- **Tidak ada koneksi:** Ilustrasi offline + "Data akan tersimpan otomatis saat offline"

---

## 10. Prioritas Implementasi

### [HIGH] — Kerjakan pertama
1. **Sistem warna triase** — Tailwind config + komponen dasar (kartu hasil, tombol 119)
2. **Layar Hasil Triase** — 3 varian (Hijau/Kuning/Merah), layar paling kritis
3. **Layar Input Gejala** — Grid ilustrasi 2 kolom, multi-select state
4. **Alur navigasi 5 langkah** — Progress stepper + routing antar layar

### [MEDIUM] — Kerjakan setelah HIGH selesai
5. **Layar Home/Dashboard** — Riwayat terakhir + tombol Triase Baru
6. **Layar Pilih Pasien** — Grid anggota keluarga + tambah baru
7. **Layar Input Suara** — Tombol mic + rekaman + transkrip
8. **Layar Loading** — Animasi + progress bar

### [LOW] — Pasca MVP
9. **Dashboard Puskesmas** — Web dashboard terpisah
10. **Gamifikasi** — Badge, leaderboard (pasca-MVP)
11. **Onboarding** — Tur berpandu (pasca-MVP)

---

*Dokumen ini adalah panduan desain resmi MediSense AI. Setiap perubahan harus di-review oleh corex-designer.*
