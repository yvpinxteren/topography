const CACHE_NAME = 'geochopper-v2';
const APP_BASE_PATH = self.location.pathname.replace(/[^/]+$/, '');
const APP_SHELL_PATHS = [
  '',
  'index.html',
  'manifest.webmanifest',
  'icon-192.png',
  'icon-512.png',
  'icon-192-maskable.png',
  'icon-512-maskable.png',
  'screenshot-1.png',
  'screenshot-2.png',
  'map-nederland.png',
];

function toAppUrl(path) {
  return new URL(path, self.location.origin + APP_BASE_PATH).toString();
}

async function getAppShellUrls() {
  const indexUrl = toAppUrl('');
  const indexResponse = await fetch(indexUrl, { cache: 'no-cache' });
  const indexHtml = await indexResponse.text();
  const assetUrls = [...indexHtml.matchAll(/(?:href|src)="([^"]+)"/g)]
    .map(([, assetPath]) => assetPath)
    .filter((assetPath) => !assetPath.startsWith('http'))
    .map((assetPath) => new URL(assetPath, self.location.origin).toString());

  return [
    ...APP_SHELL_PATHS.map((path) => toAppUrl(path)),
    ...assetUrls,
  ];
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const appShellUrls = await getAppShellUrls();
    await cache.addAll([...new Set(appShellUrls)]);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();

    await Promise.all(
      cacheNames
        .filter((cacheName) => cacheName !== CACHE_NAME)
        .map((cacheName) => caches.delete(cacheName)),
    );

    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    try {
      const response = await fetch(event.request);

      if (response.ok) {
        await cache.put(event.request, response.clone());
      }

      return response;
    } catch (error) {
      const cachedResponse = await caches.match(event.request);

      if (cachedResponse) {
        return cachedResponse;
      }

      if (event.request.mode === 'navigate') {
        const offlineShell = await caches.match(toAppUrl(''));
        if (offlineShell) {
          return offlineShell;
        }
      }

      throw error;
    }
  })());
});
