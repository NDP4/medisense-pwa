'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

/* ── Triage Flow ─────────────────────────────────────── */
/* Dynamic import — model loading is heavy, split bundle   */

const TriageWizard = dynamic(
  () => import('@/components/triage/triage-wizard'),
  {
    loading: () => (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-sm text-text-secondary">Memuat...</p>
      </div>
    ),
    ssr: false, // TF.js needs browser APIs
  }
);

export default function TriagePage() {
  return <TriageWizard />;
}
