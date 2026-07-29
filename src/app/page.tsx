import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <h1 className="text-4xl font-bold text-emerald-600">MediSense AI</h1>
      <p className="mt-4 text-lg text-gray-600 max-w-md">
        Aplikasi triase dini berbasis AI untuk kader kesehatan.
        Sepenuhnya offline dengan inferensi on-device.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/api/health"
          className="rounded-lg bg-emerald-600 px-6 py-3 text-white hover:bg-emerald-700"
        >
          Cek Status Server
        </Link>
        <Link
          href="/api/health"
          className="rounded-lg border border-emerald-600 px-6 py-3 text-emerald-600 hover:bg-emerald-50"
        >
          API Health
        </Link>
      </div>
      <p className="mt-12 text-sm text-gray-400">
        MediSense AI v0.1.0 — SYNTHETIC DATA DEMO. Tidak untuk diagnosis klinis.
      </p>
    </main>
  );
}
