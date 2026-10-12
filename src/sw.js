/* Service worker de Dérouille : l'app marche hors ligne et se met à jour en arrière-plan. */
const VERSION = "__VERSION__";
const CACHE = "derouille-" + VERSION;
const ASSETS = __ASSETS__;

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith("derouille-") && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Stale-while-revalidate : réponse immédiate depuis le cache, cache rafraîchi en arrière-plan. */
self.addEventListener("fetch", event => {
  const req = event.request;
  if(req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  const network = fetch(req).then(res => {
    if(!res || !res.ok) return res;
    const copy = res.clone();
    return caches.open(CACHE).then(cache => cache.put(req, copy)).then(() => res);
  });
  event.waitUntil(network.then(() => {}, () => {}));
  event.respondWith(
    caches.match(req, {ignoreSearch: true}).then(hit => hit || network.catch(() => caches.match("./index.html")))
  );
});
