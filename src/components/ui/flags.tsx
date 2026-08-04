'use client';

/* ── Bendera SVG Murni (tanpa emoji) ───────────────────── */
/* viewBox 0 0 32 32, clip lingkaran r=16                  */
/* DESIGN.md: dilarang emoji untuk ikon UI                  */

interface FlagProps {
  className?: string;
}

/* Bendera Indonesia — setengah atas merah #FF0000, bawah putih */
export function FlagID({ className = '' }: FlagProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-hidden="true"
    >
      <defs>
        <clipPath id="flag-id-clip">
          <circle cx="16" cy="16" r="16" />
        </clipPath>
      </defs>
      <g clipPath="url(#flag-id-clip)">
        <rect x="0" y="0" width="32" height="16" fill="#FF0000" />
        <rect x="0" y="16" width="32" height="16" fill="#FFFFFF" />
      </g>
      <circle cx="16" cy="16" r="16" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
    </svg>
  );
}

/* Bendera Inggris — Union Jack sederhana dalam lingkaran */
export function FlagGB({ className = '' }: FlagProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-hidden="true"
    >
      <defs>
        <clipPath id="flag-gb-clip">
          <circle cx="16" cy="16" r="16" />
        </clipPath>
      </defs>
      <g clipPath="url(#flag-gb-clip)">
        {/* Latar biru */}
        <rect x="0" y="0" width="32" height="32" fill="#012169" />
        {/* Salib putih St Andrew (diagonal) */}
        <line x1="2" y1="2" x2="30" y2="30" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="square" />
        <line x1="30" y1="2" x2="2" y2="30" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="square" />
        {/* Diagonal merah St Patrick */}
        <line x1="2" y1="2" x2="30" y2="30" stroke="#C8102E" strokeWidth="3" strokeLinecap="square" />
        <line x1="30" y1="2" x2="2" y2="30" stroke="#C8102E" strokeWidth="3" strokeLinecap="square" />
        {/* Salib putih St George (horizontal + vertikal) */}
        <line x1="16" y1="0" x2="16" y2="32" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="square" />
        <line x1="0" y1="16" x2="32" y2="16" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="square" />
        {/* Salib merah St George */}
        <line x1="16" y1="0" x2="16" y2="32" stroke="#C8102E" strokeWidth="3.5" strokeLinecap="square" />
        <line x1="0" y1="16" x2="32" y2="16" stroke="#C8102E" strokeWidth="3.5" strokeLinecap="square" />
      </g>
      <circle cx="16" cy="16" r="16" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
    </svg>
  );
}
