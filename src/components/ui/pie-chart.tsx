'use client';

import { useState, useMemo } from 'react';

/* ── Interactive SVG Pie Chart ─────────────────────────── */
/* Pure SVG arcs — zero dependencies, animasi draw + hover  */

interface Slice {
  label: string;
  value: number;
  color: string;
  /** Optional accent / ring color */
  ring?: string;
}

interface PieChartProps {
  slices: Slice[];
  size?: number;
  innerRadius?: number; // 0 = pie, >0 = donut
  animated?: boolean;
}

interface ArcData {
  path: string;
  color: string;
  ring: string;
  label: string;
  value: number;
  percent: number;
  startAngle: number;
  endAngle: number;
  midAngle: number;
}

/** Convert degrees to radians */
function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Build an SVG arc path string */
function arcPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number
): string {
  const start = degToRad(startDeg);
  const end = degToRad(endDeg);
  const x1 = cx + r * Math.cos(start);
  const y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(end);
  const y2 = cy + r * Math.sin(end);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
}

export default function PieChart({
  slices,
  size = 220,
  innerRadius = 60,
  animated = true,
}: PieChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const total = useMemo(() => slices.reduce((s, s2) => s + s2.value, 0), [slices]);
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 8;
  const innerR = Math.min(innerRadius, outerR * 0.6);

  // Build arcs
  const arcs: ArcData[] = useMemo(() => {
    if (total === 0) return [];
    let currentAngle = -90; // start from top
    return slices
      .filter((s) => s.value > 0)
      .map((s) => {
        const sliceAngle = (s.value / total) * 360;
        const startAngle = currentAngle;
        const midAngle = currentAngle + sliceAngle / 2;
        const endAngle = currentAngle + sliceAngle;

        // Outer path (pie slice)
        const outer = arcPath(cx, cy, outerR, startAngle, endAngle);
        // Inner "donut hole" path (subtracted visually via another circle)
        const inner = arcPath(cx, cy, innerR, startAngle, endAngle);

        currentAngle = endAngle;

        return {
          path: outer,
          color: s.color,
          ring: s.ring ?? s.color,
          label: s.label,
          value: s.value,
          percent: total ? Math.round((s.value / total) * 100) : 0,
          startAngle,
          endAngle,
          midAngle,
        };
      });
  }, [slices, total, cx, cy, outerR, innerR]);

  if (total === 0 || arcs.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-xs text-text-secondary">Tidak ada data</span>
      </div>
    );
  }

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
        role="img"
        aria-label="Diagram pie distribusi triase"
      >
        {/* Definisi untuk animasi */}
        <style>{`
          @keyframes pieDraw {
            from { opacity: 0; transform: scale(0.6); }
            to   { opacity: 1; transform: scale(1); }
          }
          @keyframes piePop {
            0%   { transform: scale(1); }
            50%  { transform: scale(1.04); }
            100% { transform: scale(1); }
          }
          .pie-slice {
            transition: transform 0.25s ease, opacity 0.2s ease;
            cursor: pointer;
          }
          .pie-slice:hover {
            transform: scale(1.05);
            filter: brightness(1.1);
          }
          .pie-slice.inactive {
            opacity: 0.35;
          }
          .donut-hole {
            fill: white;
            pointer-events: none;
          }
        `}</style>

        {/* Animated entrance: each slice fades in */}
        <g
          className="pie-group"
          style={{
            animation: animated ? 'pieDraw 0.5s ease-out both' : 'none',
            transformOrigin: 'center',
          }}
        >
          {arcs.map((arc, idx) => {
            const isHovered = hoveredIdx === idx;
            const isAnyHovered = hoveredIdx !== null;

            return (
              <g
                key={arc.label}
                className={`pie-slice ${isAnyHovered && !isHovered ? 'inactive' : ''}`}
                style={{
                  animationDelay: `${idx * 0.1}s`,
                  animation: isHovered ? 'piePop 0.3s ease' : 'none',
                }}
                onMouseEnter={(e) => {
                  setHoveredIdx(idx);
                  const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
                  setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
                }}
                onMouseMove={(e) => {
                  const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
                  setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
                }}
                onMouseLeave={() => {
                  setHoveredIdx(null);
                  setTooltipPos(null);
                }}
                onClick={() => setHoveredIdx(hoveredIdx === idx ? null : idx)}
              >
                {/* Drop shadow filter */}
                <filter id={`shadow-${idx}`} x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
                </filter>
                <path
                  d={arc.path}
                  fill={arc.color}
                  filter={`url(#shadow-${idx})`}
                />
              </g>
            );
          })}
        </g>

        {/* Inner circle — creates donut hole */}
        <circle
          cx={cx}
          cy={cy}
          r={innerR}
          className="donut-hole"
        />

        {/* Center text (total) */}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          className="text-center"
          fontSize="22"
          fontWeight="700"
          fill="#1F2937"
          style={{ fontFamily: 'var(--font-inter), sans-serif' }}
        >
          {total}
        </text>
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          fontSize="11"
          fill="#6B7280"
          style={{ fontFamily: 'var(--font-inter), sans-serif' }}
        >
          Total
        </text>
      </svg>

      {/* Hover tooltip — positioned via fixed */}
      {hoveredIdx !== null && arcs[hoveredIdx] && tooltipPos && (
        <div
          className="fixed z-50 px-3 py-2 rounded-lg shadow-lg pointer-events-none text-xs font-medium"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: 'translate(-50%, -100%)',
            backgroundColor: arcs[hoveredIdx].color,
            color: '#fff',
          }}
        >
          {arcs[hoveredIdx].label}: {arcs[hoveredIdx].value} ({arcs[hoveredIdx].percent}%)
        </div>
      )}

      {/* Ring loading animation (subtle pulse ring around chart) */}
      {animated && (
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            border: '2px solid transparent',
            animation: 'pulse-ring 2s ease-out 0.6s',
          }}
        />
      )}
    </div>
  );
}
