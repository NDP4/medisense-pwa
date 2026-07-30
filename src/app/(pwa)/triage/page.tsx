'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import ConsentScreen, { hasConsent } from '@/components/triage/consent-screen';

const TriageWizard = dynamic(
  () => import('@/components/triage/triage-wizard'),
  {
    loading: () => (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-sm text-text-secondary">Memuat...</p>
      </div>
    ),
    ssr: false,
  }
);

export default function TriagePage() {
  const [consented, setConsented] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setConsented(hasConsent());
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  // Show consent screen as a page (not an overlay) when not consented
  if (!consented) {
    return <ConsentScreen onConsent={() => setConsented(true)} />;
  }

  return <TriageWizard />;
}