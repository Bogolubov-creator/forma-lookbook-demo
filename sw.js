const scope = new URL(self.registration.scope);
const cachePrefix = 'forma-demo:' + scope.pathname + ':';
const { version, files } = {"version":"cf49bbf6228af1c940de","files":["assets/denim.webp","assets/glasses.webp","assets/index-Qry5d4eI.css","assets/index-YO93AWKe.js","assets/jacket.webp","assets/knit.webp","assets/loafers.webp","assets/shirt.webp","assets/sneakers.webp","assets/tee.webp","assets/trousers.webp","favicon.svg","icons/apple-touch-icon.png","icons/icon-192.png","icons/icon-512.png","icons/maskable-512.png","index.html","manifest.webmanifest"]};
const cacheName = cachePrefix + version;
const cachedPaths = new Set(files.map(path => new URL(path, scope).pathname));

self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(
    files.map(path => new Request(new URL(path, scope), { cache: 'reload' })),
  )));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      const legacyRootCache = scope.pathname === '/' && /^forma-demo-[a-f0-9]{20}$/.test(key);
      if (legacyRootCache || (key.startsWith(cachePrefix) && key !== cacheName)) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Keep the shell and hashed assets on the same release until the next worker activates.
  const path = request.mode === 'navigate' && url.pathname === scope.pathname
    ? new URL('index.html', scope).pathname
    : url.pathname;
  if (!cachedPaths.has(path)) return;
  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    return await cache.match(path) || fetch(request);
  })());
});
