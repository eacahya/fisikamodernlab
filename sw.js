/* dibuat otomatis oleh tools/web/build_web.py */
var CACHE = 'fmlab-5f9cfa1c51b0';
var FILES = [
"./",
"./beranda.js",
"./data.js",
"./fm.css",
"./fm.js",
"./icon-192.png",
"./icon-512.png",
"./index.html",
"./kunci.js",
"./manifest.webmanifest",
"./materi/P01-Kontrak-dan-Pendahuluan.html",
"./materi/P02-Relativitas-Khusus-I.html",
"./materi/P03-Relativitas-Khusus-II.html",
"./materi/P04-Radiasi-Benda-Hitam.html",
"./materi/P05-Sifat-Partikel-Radiasi.html",
"./materi/P06-Sifat-Gelombang-Partikel.html",
"./materi/P07-Model-Atom.html",
"./materi/P08-Kisi-Kisi-UTS.html",
"./materi/P09-Persamaan-Schrodinger.html",
"./materi/P10-Penerapan-Schrodinger-I.html",
"./materi/P11-Penerapan-Schrodinger-II.html",
"./materi/P12-Atom-Berelektron-Banyak.html",
"./materi/P13-Pengantar-Fisika-Inti.html",
"./materi/P14-Eksperimen-Millikan.html",
"./simulasi/P01-Simulasi-Ranah-Fisika-Modern.html",
"./simulasi/P02a-Simulasi-Michelson-Morley.html",
"./simulasi/P02b-Simulasi-Relativitas-Simultanitas.html",
"./simulasi/P02c-Simulasi-Dilatasi-Waktu-Kontraksi-Panjang.html",
"./simulasi/P03-Simulasi-Paradoks-Kembar.html",
"./simulasi/P03b-Simulasi-Minkowski-Doppler-Peluruhan.html",
"./simulasi/P04-Simulasi-Radiasi-Benda-Hitam.html",
"./simulasi/P05-Simulasi-Sifat-Partikel-Radiasi.html",
"./simulasi/P05b-Simulasi-Sinar-X.html",
"./simulasi/P06-Simulasi-Sifat-Gelombang-Partikel.html",
"./simulasi/P07-Simulasi-Model-Atom.html",
"./simulasi/P07b-Simulasi-Atom-Bohr.html",
"./simulasi/P09-Simulasi-Persamaan-Schrodinger.html",
"./simulasi/P10-Simulasi-Sumur-Potensial-dan-Terobosan.html",
"./simulasi/P11-Simulasi-Osilator-dan-Atom-Hidrogen.html",
"./simulasi/P12-Simulasi-Atom-Berelektron-Banyak.html",
"./simulasi/P13-Simulasi-Fisika-Inti.html"
];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k.indexOf('fmlab-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET' || /\.apk$/.test(new URL(e.request.url).pathname)) return;
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(e.request, { ignoreSearch: true }).then(function (hit) {
      return hit || fetch(e.request).then(function (r) {
        if (r && r.ok && new URL(e.request.url).origin === location.origin) c.put(e.request, r.clone());
        return r;
      });
    });
  }));
});
