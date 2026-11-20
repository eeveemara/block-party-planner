// Keeps a copy of the card planner on the device so it opens with no Wi-Fi.
// Author: Tamara Nguyen
// build.py puts the page's version in CACHE, so a new build replaces the old copy.
const CACHE = "card-planner-ffe8af1922";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys()
    .then(names => Promise.all(names.filter(n => n.startsWith("card-planner-") && n !== CACHE).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});

// The copy on the device answers first, so the page opens at once, online or not.
// When online, a fresh copy is fetched in the background for next time.
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(caches.open(CACHE).then(cache =>
    cache.match(event.request, { ignoreSearch: true }).then(hit => {
      const fresh = fetch(event.request).then(res => { if (res.ok) cache.put(event.request, res.clone()); return res; }).catch(() => hit);
      return hit || fresh;
    })));
});
