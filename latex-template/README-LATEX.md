# Cara Compile Dokumen LaTeX Corex

Tiap dokumen formal Corex (`docs/PROPOSAL.tex`, `docs/legal/NDA-DRAFT.tex`, dst) memakai 3 file bersama di folder ini:

```
latex-template/
├── corex-preamble.tex        ← packages, warna, komando kustom (edit di sini untuk ubah styling semua dokumen sekaligus)
├── corex-header-footer.tex   ← header & footer, terpisah dari preamble
├── corex-titlepage.tex       ← halaman judul dengan logo
├── logo/corex-logo-mark.pdf  ← logo vektor dipakai title page
└── examples/                 ← 3 contoh SUDAH DI-COMPILE (.tex + .pdf) sebagai referensi pola
```

## Opsi 1 — Compile Lokal (kalau sudah/mau install LaTeX)

**Install TeX Live (sekali saja):**
```bash
# Ubuntu/Debian/WSL
sudo apt-get update
sudo apt-get install -y texlive-latex-base texlive-latex-extra \
  texlive-fonts-recommended texlive-fonts-extra lmodern latexmk

# macOS
brew install --cask mactex-no-gui

# Windows
# Install MiKTeX dari https://miktex.org atau pakai WSL + perintah Ubuntu di atas
```

**Compile** (dari folder tempat file `.tex` berada, misal `docs/`):
```bash
latexmk -pdf PROPOSAL.tex
```
`latexmk` otomatis menjalankan `pdflatex` berulang sampai semua referensi (nomor halaman, dsb) benar — lebih gampang daripada manual `pdflatex` 2x. Kalau tidak ada `latexmk`, jalankan manual 2 kali:
```bash
pdflatex PROPOSAL.tex && pdflatex PROPOSAL.tex
```

Agent Corex (`corex-pitch`, `corex-legal`, dst) juga BOLEH menjalankan `latexmk`/`pdflatex` sendiri lewat bash kalau kamu approve permission-nya — hasil PDF langsung muncul di folder yang sama.

## Opsi 2 — Tanpa Install (Overleaf, gratis)

Kalau belum mau install LaTeX di komputer:
1. Zip folder `latex-template/` beserta file `.tex` yang mau dicompile (jaga struktur foldernya)
2. Upload ke [overleaf.com](https://www.overleaf.com) (akun gratis) sebagai project baru
3. Set file `.tex` yang dimaksud sebagai "Main document"
4. Overleaf compile otomatis, tinggal download PDF-nya

## Struktur Folder yang Diharapkan

```
nama-project/
├── docs/
│   ├── PROPOSAL.md
│   ├── PROPOSAL.tex          ← \input{../latex-template/corex-preamble.tex}
│   └── legal/
│       ├── NDA-DRAFT.md
│       ├── NDA-DRAFT.tex     ← \input{../../latex-template/corex-preamble.tex}
│       └── PERJANJIAN-KERJA-DRAFT.tex
└── latex-template/            ← copy dari kit, sekali per project
    ├── corex-preamble.tex
    ├── corex-header-footer.tex
    ├── corex-titlepage.tex
    └── logo/corex-logo-mark.pdf
```

**Penting soal path:** jumlah `../` di `\input{...}` dan di `\newcommand{\CorexLogoFile}{...}` menyesuaikan kedalaman folder dokumen — dokumen di `docs/` pakai `../latex-template/...`, dokumen di `docs/legal/` pakai `../../latex-template/...`. Lihat `examples/` untuk pola lengkap yang sudah teruji compile bersih.

## Kalau Compile Gagal

| Error | Penyebab | Solusi |
|---|---|---|
| `File 'lmodern.sty' not found` | Paket `lmodern` (bukan cuma `fonts-lmodern`) belum terinstall | `sudo apt-get install lmodern` |
| `File '../latex-template/corex-preamble.tex' not found` | Folder `latex-template/` belum di-copy ke project ini, atau path `../` kurang/lebih sesuai kedalaman folder | Cek struktur folder di atas |
| `\headheight is too small` | Custom margin di-override di dokumen individual | Jangan override `geometry` di file dokumen, biarkan default dari `corex-preamble.tex` |
