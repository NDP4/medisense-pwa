'use client';

import { useState, useCallback, useRef } from 'react';
import {
  Stethoscope,
  HeartPulse,
  Mic,
  BrainCircuit,
  ShieldCheck,
  ChevronLeft,
  Check,
  MoveHorizontal,
} from 'lucide-react';

/* ── Onboarding 5 Layar untuk Kader Baru ─────────────── */
/* DESIGN.md §1 — "Warna adalah bahasa pertama"          */
/* F-09: Onboarding interaktif visual, mobile-first PWA  */
/* Navigasi: swipe kiri/kanan + keyboard + dots          */

interface OnboardingSlide {
  icon: typeof Stethoscope;
  title: string;
  description: string;
  color: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    icon: Stethoscope,
    title: 'Triase Cepat',
    description: 'Pilih gejala yang dirasakan pasien dengan mengetuk ilustrasi. Cukup 1-2 menit untuk dapat hasil awal.',
    color: '#1E3A5F',
  },
  {
    icon: Mic,
    title: 'Rekam Suara',
    description: 'Pasien bisa ceritakan keluhannya dengan bahasa sendiri. Suara langsung diubah ke teks — offline penuh.',
    color: '#3B82F6',
  },
  {
    icon: BrainCircuit,
    title: 'Analisis AI',
    description: 'Aplikasi akan menganalisis gejala dan suara secara otomatis di perangkat Anda. Data tetap aman dan privat.',
    color: '#8B5CF6',
  },
  {
    icon: HeartPulse,
    title: 'Hasil 3 Warna',
    description: 'Hijau untuk rawat jalan, Kuning untuk rujuk 24 jam, Merah untuk darurat — lengkap dengan panduan tindakan.',
    color: '#16A34A',
  },
  {
    icon: ShieldCheck,
    title: 'Data Aman',
    description: 'Semua data pasien disimpan terenkripsi di perangkat Anda. Tidak ada data pribadi yang dikirim ke internet.',
    color: '#DC2626',
  },
];

/** Ambang jarak swipe agar dianggap navigasi (px) */
const SWIPE_THRESHOLD = 50;

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const slide = SLIDES[slideIndex];
  const isFirst = slideIndex === 0;
  const isLast = slideIndex === SLIDES.length - 1;
  const Icon = slide.icon;

  const handleNext = useCallback(() => {
    if (isLast) {
      onComplete();
    } else {
      setSlideIndex((i) => i + 1);
    }
  }, [isLast, onComplete]);

  const handlePrev = useCallback(() => {
    if (!isFirst) setSlideIndex((i) => i - 1);
  }, [isFirst]);

  const handleDotClick = useCallback((idx: number) => {
    setSlideIndex(idx);
  }, []);

  // Swipe gesture — mulai sentuh
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }, []);

  // Swipe gesture — akhir sentuh: kiri = lanjut, kanan = kembali
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null) return;
      const deltaX = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
      touchStartX.current = null;
      if (deltaX < -SWIPE_THRESHOLD) handleNext();
      else if (deltaX > SWIPE_THRESHOLD) handlePrev();
    },
    [handleNext, handlePrev],
  );

  // Keyboard navigation untuk aksesibilitas
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'ArrowLeft') handlePrev();
    },
    [handleNext, handlePrev],
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-white flex flex-col safe-area-inset"
      role="dialog"
      aria-modal="true"
      aria-label="Pengenalan aplikasi"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Skip / Selesai button — berubah di slide terakhir */}
      <button
        type="button"
        onClick={onComplete}
        className={`absolute top-2 right-2 z-10 flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors ${
          isLast
            ? 'bg-primary text-white rounded-full shadow-sm hover:opacity-90'
            : 'text-text-secondary hover:text-text-primary'
        }`}
      >
        {isLast ? (
          <>
            Selesai
            <Check className="w-3.5 h-3.5" />
          </>
        ) : (
          'Lewati'
        )}
      </button>

      {/* Slide content — flex-1 pushes bottom controls down */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center min-h-0">
        {/* Icon / Illustration — compact ukuran */}
        <div
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center mb-5 shrink-0"
          style={{ backgroundColor: slide.color + '15' }}
        >
          <Icon className="w-12 h-12 sm:w-14 sm:h-14" style={{ color: slide.color }} strokeWidth={1.5} />
        </div>

        {/* Slide number */}
        <span className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary mb-2">
          Langkah {slideIndex + 1} dari {SLIDES.length}
        </span>

        {/* Title */}
        <h2 className="text-lg sm:text-xl font-bold text-text-primary mb-2 leading-tight">
          {slide.title}
        </h2>

        {/* Description */}
        <p className="text-sm text-text-secondary leading-relaxed px-2 max-w-xs">
          {slide.description}
        </p>
      </div>

      {/* Bottom controls — tetap di bawah, compact */}
      <div className="px-6 pb-6 pt-2 space-y-4 shrink-0">
        {/* Dots */}
        <div className="flex items-center justify-center gap-1.5" role="tablist" aria-label="Indikator langkah">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              role="tab"
              aria-selected={idx === slideIndex}
              aria-label={`Langkah ${idx + 1}`}
              onClick={() => handleDotClick(idx)}
              className={`rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-accent/40 ${
                idx === slideIndex
                  ? 'bg-primary w-7 h-2'
                  : 'bg-gray-300 hover:bg-gray-400 w-2 h-2'
              }`}
            />
          ))}
        </div>

        {/* Swipe indicator — pengganti tombol "Selanjutnya" yang rawan tertutup */}
        {isLast ? (
          <div className="flex items-center justify-center gap-2 text-text-secondary">
            <MoveHorizontal className="w-5 h-5 animate-pulse" />
            <span className="text-xs font-medium">Geser ke kanan untuk melihat lagi</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-text-secondary">
            <MoveHorizontal className="w-5 h-5 animate-pulse" />
            <span className="text-xs font-medium">Geser untuk lanjut</span>
          </div>
        )}

        {/* Kembali button — hanya untuk aksesibilitas (keyboard/mouse) */}
        {!isFirst && (
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Langkah sebelumnya"
            className="flex items-center justify-center gap-1 mx-auto px-4 py-2 rounded-xl border border-border text-text-primary font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Kembali
          </button>
        )}
      </div>
    </div>
  );
}
