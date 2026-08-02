'use client';

import { useEffect, useRef, useCallback, type ReactNode } from 'react';

/* ── Reusable Modal dengan Focus Trap + Aksesibilitas ── */
/* corex-qa: G9-HIGH, G10-HIGH — focus trapping + role dialog   */

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Whether this is a destructive action (e.g. delete, logout) */
  destructive?: boolean;
  /** Prevent closing on backdrop click (for destructive actions) */
  requireExplicitClose?: boolean;
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  destructive = false,
  requireExplicitClose = false,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  // ── Focus trap logic ──
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;

      // Escape → close (kecuali requireExplicitClose)
      if (e.key === 'Escape' && !requireExplicitClose) {
        e.stopPropagation();
        onClose();
        return;
      }

      // Tab trapping
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Shift+Tab: jika fokus di first → pindah ke last
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          // Tab: jika fokus di last → pindah ke first
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [open, onClose, requireExplicitClose]
  );

  // ── Lifecycle ──
  useEffect(() => {
    if (!open) return;

    // Simpan elemen aktif sebelumnya
    previousActiveElement.current = document.activeElement;

    // Fokus ke elemen pertama di modal
    const timer = setTimeout(() => {
      if (modalRef.current) {
        const firstFocusable = modalRef.current.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      }
    }, 50);

    // Cegah body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Event listener keyboard
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);

      // Kembalikan fokus ke elemen sebelumnya
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const titleId = `modal-${title.toLowerCase().replace(/\s+/g, '-')}-title`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      {/* Backdrop */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => {
          if (!requireExplicitClose) onClose();
        }}
      />

      {/* Content */}
      <div
        ref={modalRef}
        className={`relative bg-surface rounded-2xl p-6 max-w-sm w-full shadow-xl animate-fade-in ${
          destructive ? 'border border-red-200' : ''
        }`}
      >
        <div className="flex flex-col items-center text-center">{children}</div>
      </div>
    </div>
  );
}
