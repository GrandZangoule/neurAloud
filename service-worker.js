self.addEventListener("install", event => {
  console.log("Service Worker installing...");
  event.waitUntil(
    caches.open("neuraloud-cache").then(cache => {
      return cache.addAll([
        "./index.html",
        "./style.css",
        "./script.js",
        "./icon.png",
        "./manifest.json"
      ]);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
