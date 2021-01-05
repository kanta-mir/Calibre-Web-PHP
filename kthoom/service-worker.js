const CACHE_NAME = 'kthoom:v2';

let urlsToCache = [
  '.',
  'code/bitjs/archive/archive.js',
  'code/bitjs/archive/rarvm.js',
  'code/bitjs/archive/unzip.js',
  'code/bitjs/archive/unrar.js',
  'code/bitjs/archive/untar.js',
  'code/bitjs/file/sniffer.js',
  'code/bitjs/image/webp-shim/webp-shim.js',
  'code/bitjs/image/webp-shim/webp-shim-module.js',
  'code/bitjs/image/webp-shim/webp-shim-module.wasm',
  'code/bitjs/io/bitstream-worker.js',
  'code/bitjs/io/bytebuffer-worker.js',
  'code/bitjs/io/bytestream-worker.js',
  'code/book-binder.js',
  'code/book-events.js',
  'code/book-viewer.js',
  'code/book.js',
  'code/comic-book-binder.js',
  'code/epub-book-binder.js',
  'code/event-emitter.js',
  'code/helpers.js',
  'code/kthoom-google.js',
  'code/kthoom-ipfs.js',
  'code/kthoom.css',
  'code/kthoom.js',
  'code/main.js',
  'code/menu.js',
  'code/page.js',
  'code/reading-stack.js',
  'code/traceur/traceur.js',
  'images/logo-192.png',
  'images/logo.png',
  'images/logo.svg',
  'index.html',
  'privacy.html',
  'kthoom.webmanifest',
];

self.addEventListener('install', (evt) => {
  evt.waitUntil(async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(urlsToCache);
  });
});

self.addEventListener('fetch', (evt) => {
  evt.respondWith(async function () {
    try {
      const networkResponse = await fetch(evt.request);
      const cache = await caches.open(CACHE_NAME);
      evt.waitUntil(cache.put(evt.request, networkResponse.clone()));
      return networkResponse;
    } catch (err) {
      return caches.match(evt.request);
    }
  }());
});