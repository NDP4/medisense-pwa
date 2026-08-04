'use client';

/* ── Symptom SVG Illustrations ───────────────────────── */
/* DESIGN.md §5.2 — Flat illustration, line art tebal      */
/* Warna: Outline #4B5563, Aksen #3B82F6, Fill #F3F4F6    */

interface IconProps {
  size?: number;
  className?: string;
}

const SvgWrap: React.FC<{ children: React.ReactNode; size?: number; className?: string; viewBox?: string }> = ({
  children,
  size = 120,
  className = '',
  viewBox = '0 0 120 120',
}) => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {children}
  </svg>
);

/* ── 1. Demam Tinggi (Fever) ────────────────────────── */
/* Termometer di mulut, garis demam merah */
export function IconDemam({ size, className }: IconProps) {
  return (
    <SvgWrap size={size} className={className} viewBox="0 0 120 120">
      {/* Face outline */}
      <ellipse cx="60" cy="50" rx="38" ry="40" fill="#F3F4F6" stroke="#4B5563" strokeWidth="2.5" />
      {/* Eyes */}
      <circle cx="44" cy="42" r="3" fill="#4B5563" />
      <circle cx="76" cy="42" r="3" fill="#4B5563" />
      {/* Mouth with thermometer */}
      <rect x="46" y="62" width="28" height="8" rx="4" fill="#F3F4F6" stroke="#4B5563" strokeWidth="2" />
      <rect x="56" y="56" width="8" height="24" rx="4" fill="#DC2626" stroke="#4B5563" strokeWidth="2" />
      {/* Thermometer cap */}
      <circle cx="60" cy="54" r="5" fill="#DC2626" stroke="#4B5563" strokeWidth="2" />
      {/* Red line inside */}
      <rect x="58" y="60" width="4" height="16" rx="2" fill="#DC2626" />
    </SvgWrap>
  );
}

/* ── 2. Batuk (Cough) ──────────────────────────────── */
/* Wajah/paru-paru dengan garis batuk */
export function IconBatuk({ size, className }: IconProps) {
  return (
    <SvgWrap size={size} className={className} viewBox="0 0 120 120">
      {/* Face */}
      <circle cx="55" cy="50" r="35" fill="#F3F4F6" stroke="#4B5563" strokeWidth="2.5" />
      {/* Eyes worried */}
      <ellipse cx="43" cy="42" rx="3" ry="4" fill="#4B5563" />
      <ellipse cx="67" cy="42" rx="3" ry="4" fill="#4B5563" />
      {/* Open mouth coughing */}
      <ellipse cx="55" cy="65" rx="12" ry="8" fill="#F3F4F6" stroke="#4B5563" strokeWidth="2" />
      {/* Cough lines */}
      <path d="M75 60 Q90 55 95 50" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M78 63 Q95 62 100 58" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M76 68 Q88 70 92 66" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </SvgWrap>
  );
}

/* ── 3. Sesak Napas (Dyspnea) ───────────────────────── */
/* Paru-paru dengan garis napas zigzag cepat */
export function IconSesakNapas({ size, className }: IconProps) {
  return (
    <SvgWrap size={size} className={className} viewBox="0 0 120 120">
      {/* Lungs left */}
      <path d="M30 40 Q25 30 35 25 Q45 20 50 35 Q52 45 48 55 Q44 65 38 70 Q30 75 28 65 Q25 55 30 40Z" fill="#F3F4F6" stroke="#4B5563" strokeWidth="2.5" />
      {/* Lungs right */}
      <path d="M90 40 Q95 30 85 25 Q75 20 70 35 Q68 45 72 55 Q76 65 82 70 Q90 75 92 65 Q95 55 90 40Z" fill="#F3F4F6" stroke="#4B5563" strokeWidth="2.5" />
      {/* Windpipe */}
      <rect x="52" y="20" width="16" height="20" rx="8" fill="#F3F4F6" stroke="#4B5563" strokeWidth="2.5" />
      {/* Zigzag breath lines */}
      <polyline points="45,38 50,33 55,38 60,33 65,38 70,33 75,38" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <polyline points="48,50 52,46 56,50 60,46 64,50 68,46 72,50" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.7" />
    </SvgWrap>
  );
}

/* ── 4. Kebingungan (Confusion) ─────────────────────── */
/* Kepala dengan tanda tanya */
export function IconKebingungan({ size, className }: IconProps) {
  return (
    <SvgWrap size={size} className={className} viewBox="0 0 120 120">
      {/* Head */}
      <circle cx="55" cy="50" r="35" fill="#F3F4F6" stroke="#4B5563" strokeWidth="2.5" />
      {/* Eyes */}
      <circle cx="43" cy="45" r="3" fill="#4B5563" />
      <circle cx="67" cy="45" r="3" fill="#4B5563" />
      {/* Mouth */}
      <path d="M46 63 Q55 58 64 63" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Question marks */}
      <text x="72" y="30" fontSize="18" fontWeight="bold" fill="#3B82F6" fontFamily="sans-serif">?</text>
      <text x="28" y="28" fontSize="14" fontWeight="bold" fill="#3B82F6" fontFamily="sans-serif">?</text>
      <text x="82" y="44" fontSize="12" fontWeight="bold" fill="#3B82F6" fontFamily="sans-serif">?</text>
    </SvgWrap>
  );
}

/* ── 5. Nyeri Dada (Chest Pain) ─────────────────────── */
/* Dada dengan tanda nyeri petir */
export function IconNyeriDada({ size, className }: IconProps) {
  return (
    <SvgWrap size={size} className={className} viewBox="0 0 120 120">
      {/* Torso */}
      <path d="M40 35 L80 35 L85 100 L35 100 Z" fill="#F3F4F6" stroke="#4B5563" strokeWidth="2.5" />
      {/* Pain lightning bolt */}
      <polygon points="60,45 52,65 62,65 56,85 72,60 61,60 67,45" fill="#DC2626" stroke="#DC2626" strokeWidth="1.5" />
      {/* Pain lines */}
      <path d="M38 48 L30 44" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M36 55 L27 54" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M85 48 L93 44" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M87 55 L96 54" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" />
    </SvgWrap>
  );
}

/* ── 6. Diare (Diarrhea) ────────────────────────────── */
/* Perut dengan gelombang */
export function IconDiare({ size, className }: IconProps) {
  return (
    <SvgWrap size={size} className={className} viewBox="0 0 120 120">
      {/* Body */}
      <ellipse cx="60" cy="50" rx="35" ry="40" fill="#F3F4F6" stroke="#4B5563" strokeWidth="2.5" />
      {/* Face */}
      <circle cx="48" cy="38" r="2.5" fill="#4B5563" />
      <circle cx="72" cy="38" r="2.5" fill="#4B5563" />
      {/* Grimacing mouth */}
      <path d="M50 50 Q60 46 70 50" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Stomach area with waves */}
      <path d="M40 68 Q48 60 56 68 Q64 76 72 68 Q80 60 86 68" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M38 78 Q46 70 54 78 Q62 86 70 78 Q78 70 84 78" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
    </SvgWrap>
  );
}

/* ── 7. Kebiruan (Cyanosis) ─────────────────────────── */
/* Tangan dengan warna kebiruan */
export function IconKebiruan({ size, className }: IconProps) {
  return (
    <SvgWrap size={size} className={className} viewBox="0 0 120 120">
      {/* Hand outline */}
      <path d="M40 60 L40 30 Q40 25 45 25 L50 25 Q55 25 55 30 L55 35" stroke="#4B5563" strokeWidth="2.5" fill="#F3F4F6" />
      <path d="M55 35 L55 28 Q55 23 60 23 L65 23 Q70 23 70 28 L70 38" stroke="#4B5563" strokeWidth="2.5" fill="#F3F4F6" />
      <path d="M70 38 L70 25 Q70 20 75 20 L80 20 Q85 20 85 25 L85 42" stroke="#4B5563" strokeWidth="2.5" fill="#F3F4F6" />
      <path d="M85 42 L85 30 Q85 25 90 25 L95 25 Q100 25 100 30 L100 65" stroke="#4B5563" strokeWidth="2.5" fill="#F3F4F6" />
      {/* Palm + wrist */}
      <path d="M40 60 Q35 75 38 85 L38 95 Q38 100 43 100 L95 100 Q100 100 100 95 L100 65" stroke="#4B5563" strokeWidth="2.5" fill="#B0C4DE" opacity="0.5" />
      {/* Blue tint overlay on fingertips */}
      <circle cx="47" cy="28" r="5" fill="#60A5FA" opacity="0.4" />
      <circle cx="62" cy="26" r="5" fill="#60A5FA" opacity="0.4" />
      <circle cx="78" cy="23" r="5" fill="#60A5FA" opacity="0.4" />
      <circle cx="92" cy="28" r="5" fill="#60A5FA" opacity="0.4" />
    </SvgWrap>
  );
}

/* ── Icon Map ───────────────────────────────────────── */

export const SYMPTOM_ICONS: Record<string, React.FC<IconProps>> = {
  fever: IconDemam,
  cough: IconBatuk,
  dyspnea: IconSesakNapas,
  confusion: IconKebingungan,
  chest_pain: IconNyeriDada,
  diarrhea: IconDiare,
  cyanosis: IconKebiruan,
};
