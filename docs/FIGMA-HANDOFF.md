# Figma Handoff — MediSense AI

**Versi:** 1.0
**Tanggal:** 28 Juli 2026
**Untuk:** corex-frontend (implementasi Next.js + Tailwind)

---

## Status Figma

Belum ada file Figma. Dokumen ini adalah panduan setup Figma dan prioritas implementasi untuk frontend developer.

---

## 1. Yang Perlu Dibuat di Figma (oleh desainer)

### 1.1 Color Styles
Buat color styles di Figma dengan nama berikut:

```
colors/
├── triage/
│   ├── green           #16A34A
│   ├── green-bg        #DCFCE7
│   ├── yellow          #EAB308
│   ├── yellow-bg       #FEF9C3
│   ├── red             #DC2626
│   └── red-bg          #FEE2E2
├── ui/
│   ├── primary         #1E3A5F
│   ├── surface         #FFFFFF
│   ├── text-primary    #1F2937
│   ├── text-secondary  #6B7280
│   ├── border          #E5E7EB
│   └── muted-bg        #F9FAFB
```

### 1.2 Text Styles

| Nama Style | Font | Size | Weight | Line Height |
|------------|------|------|--------|-------------|
| `heading/triage-result` | Inter | 48px | Bold | 1.2 |
| `heading/condition-name` | Inter | 24px | Semibold | 1.3 |
| `heading/page-title` | Inter | 20px | Semibold | 1.4 |
| `body/default` | Inter | 16px | Regular | 1.5 |
| `label/symptom` | Inter | 14px | Medium | 1.4 |
| `button/default` | Inter | 18px | Semibold | 1.2 |
| `caption/disclaimer` | Inter | 12px | Regular | 1.4 |

### 1.3 Component Library
Komponen yang perlu dibuat di Figma:

1. **Button** — 6 varian:
   - Primary (`#1E3A5F`)
   - Secondary (outline)
   - Triage Green (`#16A34A`)
   - Triage Yellow (`#EAB308`)
   - Triage Red (`#DC2626`)
   - Emergency 119 (merah, 2x ukuran, pulse)

2. **Symptom Card** — 3 state:
   - Default (border 1px #E5E7EB)
   - Active (border 2px #3B82F6 + bg #EFF6FF)
   - Disabled (opacity 50%)

3. **Triage Result Card** — 3 varian (Hijau/Kuning/Merah):
   - Full background color
   - Icon besar di tengah atas
   - Level text
   - Kondisi text
   - Daftar tindakan
   - Disclaimer

4. **Bottom Navigation** — 4 item:
   - Home (active/inactive)
   - Triase Baru (FAB)
   - Riwayat (active/inactive)
   - Profil (active/inactive)

5. **Progress Stepper** — 5 langkah:
   - Circle completed (hijau + centang)
   - Circle active (biru solid)
   - Circle upcoming (outline abu)

6. **History Card** — dengan border kiri warna triase

7. **Input Mic** — tombol mic besar + state merekam + hasil transkrip

8. **Loading** — animasi logo + progress bar

9. **Empty State** — ilustrasi + teks + CTA

### 1.4 Icon Set
Dari Lucide Icons, yang dipakai:
`home`, `activity`, `history`, `user`, `mic`, `phone`, `check`, `alert-triangle`, `x-circle`, `arrow-left`, `chevron-right`, `search`, `settings`, `plus`, `stethoscope`, `thermometer`, `lungs`, `brain`, `eye`, `foot`, `bone`, `droplets`, `baby`, `utensils-crossed`

Buat di Figma sebagai komponen ikon (24px default).

---

## 2. Layout Specs per Screen (untuk Frontend)

### 2.1 Layar Hasil Triase (PRIORITAS #1)

```
Layout (mobile, 375px):
┌─────────────────────────────────┐
│ padding 16px                    │
│                                 │
│     Icon 64px (center)         │  margin-top: 48px
│                                 │
│     Level 32px (center)        │  margin-top: 16px
│                                 │
│     Kondisi 24px (center)      │  margin-top: 8px
│                                 │
│     Separator 50% opacity      │  margin: 24px 0
│                                 │
│     Tindakan list              │  padding: 0 24px
│     - 16px text putih          │  gap: 12px antar item
│     - icon check 16px           │
│                                 │
│     Tombol Triase Baru         │  margin-top: auto
│     outline putih              │  margin-bottom: 16px
│                                 │
│     Disclaimer 12px            │  padding: 0 16px
├─────────────────────────────────┤
│ Bottom Nav 64px                │
└─────────────────────────────────┘

Background: FULL warna sesuai level triase
Text: PUTIH semua (#FFFFFF)
```

### 2.2 Layar Input Gejala (PRIORITAS #2)

```
Layout (mobile, 375px):
┌─────────────────────────────────┐
│ header 56px (back + title)      │
│ stepper 40px                    │
│ title section 32px              │
├─────────────────────────────────┤
│ padding 16px                    │
│ ┌────────┐ ┌────────┐          │
│ │ 120px  │ │ 120px  │          │  grid gap 16px
│ │ SVG    │ │ SVG    │          │  2 columns
│ │ label  │ │ label  │          │  auto height
│ └────────┘ └────────┘          │
│ ┌────────┐ ┌────────┐          │
│ │ 120px  │ │ 120px  │          │
│ │ SVG    │ │ SVG    │          │
│ │ label  │ │ label  │          │
│ └────────┘ └────────┘          │
│ ...                             │
├─────────────────────────────────┤
│ sticky bottom:                  │
│ [ Selanjutnya (N dipilih) ]    │  button 56px height
│ padding 16px                   │
└─────────────────────────────────┘
```

### 2.3 Spesifikasi Responsif

| Breakpoint | Ukuran | Grid Gejala | Layout |
|------------|--------|-------------|--------|
| Mobile | <640px | 2 kolom | Single column, bottom nav |
| Tablet | 640-1024px | 3 kolom | Sidebar + content |
| Desktop | >1024px | 4+ kolom | Dashboard layout |

---

## 3. Aset yang Perlu Diekspor

| Aset | Ukuran | Format | Lokasi |
|------|--------|--------|--------|
| Ilustrasi gejala (25 untuk MVP) | 120x120dp | SVG | `public/illustrations/` |
| Logo MediSense (horizontal) | 200x60px | SVG | `public/logo-horizontal.svg` |
| Logo MediSense (icon only) | 64x64px | SVG | `public/logo-icon.svg` |
| App icon PWA | 192x192, 512x512 | PNG | `public/icons/` |
| Splash screen | 512x512 | PNG | `public/icons/` |
| Ilustrasi empty state | 200x200px | SVG | `public/illustrations/` |
| Ilustrasi loading | 120x120px | SVG | `public/illustrations/` |
| Favicon | 48x48 | ICO/PNG | `public/favicon.ico` |

---

## 4. Catatan Implementasi untuk corex-frontend

### 4.1 Setup Tailwind
```js
// tailwind.config.ts
colors: {
  triage: {
    green: '#16A34A',
    'green-bg': '#DCFCE7',
    yellow: '#EAB308',
    'yellow-bg': '#FEF9C3',
    red: '#DC2626',
    'red-bg': '#FEE2E2',
  },
  primary: '#1E3A5F',
}
```

### 4.2 Font Setup
```ts
// app/layout.tsx
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
// Gunakan di <body className={inter.className}>
```

### 4.3 Animasi CSS untuk Tombol 119
```css
@keyframes pulse-emergency {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
.emergency-119 {
  animation: pulse-emergency 2s ease-in-out infinite;
}
```

### 4.4 SVG Ilustrasi
- Simpan sebagai file `.svg` di `public/illustrations/`
- Load via `<Image>` atau inline SVG untuk kontrol styling
- Pastikan setiap SVG punya `viewBox="0 0 120 120"`
- Stroke width: 2-3px, gunakan `stroke-linecap="round"`

### 4.5 Service Worker Caching
- Cache semua aset di `public/` saat Service Worker install
- Strategi: Cache-first untuk semua file statis
- Model AI: Cache terpisah, diverifikasi dengan SHA-256

---

## 5. Prioritas untuk corex-frontend

| Urutan | Feature | Terkait Design System |
|--------|---------|----------------------|
| 1 | Setup tema warna + font | Color styles, typography |
| 2 | Komponen tombol + card | Button, symptom card, result card |
| 3 | Layar Hasil Triase (3 varian) | Triage result screen |
| 4 | Layar Input Gejala | Symptom grid |
| 5 | Alur navigasi 5 langkah | Progress stepper + routing |
| 6 | Layar Home + Riwayat | History card, empty state |
| 7 | Input Suara | Mic button, recording state |
| 8 | Loading screen | Loading animation |
| 9 | Dashboard Puskesmas | Dashboard layout (terpisah) |

---

*Dokumen ini untuk handoff antar agent Corex. Update setelah ada file Figma aktual.*
