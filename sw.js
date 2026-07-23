const CACHE_NAME = "distrito-v1";
const ASSETS_TO_CACHE = ["/", "/index.html", "/manifest.json", "/assets/distrito-angel-blue-v1.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS_TO_CACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  if (e.request.url.includes("supabase.co")) return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
