import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

/* ── MediSense AI — Root Layout ─────────────────────── */

// Inter font — semua ukuran teks menggunakan Inter
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'MediSense AI — Triase Dini',
  description:
    'Aplikasi triase dini berbasis AI untuk kader kesehatan di wilayah 3T Indonesia. 100% offline, real-time on-device inference.',
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.svg',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MediSense AI',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#1E3A5F', // PRIMARY color per DESIGN.md
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* PWA Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(reg) { console.log('SW registered:', reg.scope); },
                    function(err) { console.log('SW registration failed:', err); }
                  );
                });
              }
            `,
          }}
        />
        {/* Set <html lang> sebelum paint dari localStorage medisense_lang */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('medisense_lang');
                  var lang = 'id';
                  if (stored) {
                    var parsed = JSON.parse(stored);
                    if (parsed && parsed.state && (parsed.state.lang === 'id' || parsed.state.lang === 'en')) {
                      lang = parsed.state.lang;
                    }
                  } else if (navigator.language && navigator.language.toLowerCase().indexOf('en') === 0) {
                    lang = 'en';
                  }
                  document.documentElement.lang = lang;
                } catch (e) {
                  document.documentElement.lang = 'id';
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans`}>{children}</body>
    </html>
  );
}
