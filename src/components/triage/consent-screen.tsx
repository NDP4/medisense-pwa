'use client';

import { Shield, Check, X } from 'lucide-react';
import { useT } from '@/lib/i18n/use-t';

const CONSENT_VERSION = 'v1.0';
const CONSENT_STORAGE_KEY = 'medisense_consent';

interface ConsentScreenProps {
  onConsent: () => void;
}

export default function ConsentScreen({ onConsent }: ConsentScreenProps) {
  const { t } = useT();
  const handleConsent = () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
    }));
    onConsent();
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-[#1E3A5F] px-6 py-8 text-white shrink-0">
        <div className="flex justify-center mb-4">
          <Shield size={56} className="text-white" />
        </div>
        <h1 className="text-xl font-bold text-center">{t('consent.title')}</h1>
        <p className="text-center mt-2 text-blue-100 text-sm">
          {t('consent.subtitle')}
        </p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 text-sm text-gray-700">
        <section>
          <h2 className="font-semibold text-base text-gray-900 mb-2">{t('consent.s1Title')}</h2>
          <p>{t('consent.s1Intro')}</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>{t('consent.s1L1')}</li>
            <li>{t('consent.s1L2')}</li>
            <li>{t('consent.s1L3')}</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-base text-gray-900 mb-2">{t('consent.s2Title')}</h2>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>{t('consent.s2L1')}</li>
            <li>{t('consent.s2L2')}</li>
            <li>{t('consent.s2L3')}</li>
            <li>{t('consent.s2L4')}</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-base text-gray-900 mb-2">{t('consent.s3Title')}</h2>
          <p>{t('consent.s3Intro')}</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>{t('consent.s3L1')}</li>
            <li>{t('consent.s3L2')}</li>
            <li>{t('consent.s3L3')}</li>
            <li>{t('consent.s3L4')}</li>
          </ul>
          <p className="mt-2">{t('consent.s3Outro')}</p>
        </section>

        <section>
          <h2 className="font-semibold text-base text-gray-900 mb-2">{t('consent.s4Title')}</h2>
          <p>{t('consent.s4Body')}</p>
        </section>

        <section>
          <h2 className="font-semibold text-base text-gray-900 mb-2">{t('consent.s5Title')}</h2>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>{t('consent.s5L1')}</li>
            <li>{t('consent.s5L2')}</li>
            <li>{t('consent.s5L3')}</li>
          </ul>
        </section>

        <section className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-yellow-800 text-xs">
            {t('consent.disclaimer')}
          </p>
        </section>
      </div>

      {/* Footer buttons - fixed at bottom */}
      <div className="px-6 py-4 border-t border-gray-200 space-y-3 bg-white shrink-0">
        <button
          onClick={handleConsent}
          className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-green-700 active:scale-[0.98] transition-all"
        >
          <Check size={20} />
          {t('consent.agree')}
        </button>
        <a
          href="/"
          className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors block text-center"
        >
          <X size={20} />
          {t('consent.disagree')}
        </a>
      </div>
    </div>
  );
}

export function hasConsent(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
  if (!stored) return false;
  try {
    const data = JSON.parse(stored);
    return data.version === CONSENT_VERSION;
  } catch {
    return false;
  }
}