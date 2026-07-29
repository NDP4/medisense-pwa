/* ── MediSense AI — Service Worker ──────────────────── */
/* Strategi: Cache-First untuk shell & model              */
/* Network-First dengan fallback untuk API/sync           */
/* ───────────────────────────────────────────────────── */

const CACHE_NAMES = {
  SHELL: 'medisense-shell-v1',
  MODEL: 'medisense-model-v1',
  STATIC: 'medisense-static-v1',
  DYNAMIC: 'medisense-dynamic-v1',
};

const SHELL_URLS = [
  '/',
  '/triage',
  '/history',
  '/profile',
  '/manifest.json',
];

const MODEL_URLS = [
  '/models/medisense_model_tfjs/model.json',
  '/models/medisense_model_tfjs/group1-shard1of1.bin',
];

// ── INSTALL: Cache app shell + model ─────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Cache app shell
      caches.open(CACHE_NAMES.SHELL).then((cache) => {
        return cache.addAll(SHELL_URLS).catch((err) => {
          console.warn('Shell cache error (non-critical):', err);
        });
      }),
      // Cache model files
      caches.open(CACHE_NAMES.MODEL).then((cache) => {
        return cache.addAll(MODEL_URLS).catch((err) => {
          console.warn('Model cache error (non-critical):', err);
        });
      }),
    ])
  );
  self.skipWaiting();
});

// ── ACTIVATE: Clean old caches ────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter(
            (key) =>
              key.startsWith('medisense-') &&
              !Object.values(CACHE_NAMES).includes(key)
          )
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// ── FETCH: Strategi caching ───────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip Supabase API calls (already authenticated)
  if (url.hostname.includes('supabase.co')) return;

  // ── Cache-First untuk model AI ──
  if (url.pathname.startsWith('/models/')) {
    event.respondWith(cacheFirst(request, CACHE_NAMES.MODEL));
    return;
  }

  // ── Cache-First untuk aset statis ──
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/illustrations/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/manifest.json'
  ) {
    event.respondWith(cacheFirst(request, CACHE_NAMES.STATIC));
    return;
  }

  // ── Network-First untuk app shell (halaman navigasi) ──
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithFallback(request, CACHE_NAMES.SHELL));
    return;
  }

  // ── Network-First untuk API ──
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithFallback(request, CACHE_NAMES.DYNAMIC));
    return;
  }

  // ── Default: Network-First ──
  event.respondWith(networkFirstWithFallback(request, CACHE_NAMES.DYNAMIC));
});

// ── Cache Strategies ───────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirstWithFallback(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/');
      if (offlinePage) return offlinePage;
    }

    return new Response('Offline', { status: 503 });
  }
}
