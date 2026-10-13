/* Fisika Modern Lab: beranda (buka kode SIM, pindai QR, daftar bab) */
(function () {
  var D = window.FM_DATA;
  var $ = function (id) { return document.getElementById(id); };
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* tema */
  var th = store('fm-theme');
  if (th) document.documentElement.setAttribute('data-theme', th);
  $('themeBtn').onclick = function () {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark' ||
      (!document.documentElement.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
    var t = dark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', t); store('fm-theme', t);
  };

  $('bookTitle').textContent = D.book.title;
  $('bookSub').textContent = D.book.sub;
  $('aboutText').textContent = 'Fisika Modern Lab adalah aplikasi pendamping buku ' + D.book.title + ': ' + D.book.sub +
    ', karya ' + D.book.author + '. Setiap simulasi diberi kode yang sama dengan kotak SIM di buku.';
  $('version').textContent = 'Versi ' + D.version + ' · ' + D.count + ' simulasi · ' + D.chapters.length + ' bab dan praktikum';

  var IDX = {};
  D.chapters.forEach(function (c) { c.sims.forEach(function (s) { s.n = c.n; IDX[s.code] = s; }); });
  function url(s) { return s.page + '?sim=' + s.code + (/^tab:/.test(s.target) ? '&tab=' + s.target.slice(4) : ''); }
  /* menerima: 4.3 · SIM 4.3 · 4,3 · fisikamodern://sim/4.3 · https://…/#go=4.3 */
  function parse(t) {
    t = String(t || '').trim();
    var m = t.match(/(?:sim\/|#go=|[?&]sim=)(\d{1,2}[.,]\d{1,2})/i) || t.match(/^(?:sim\s*)?(\d{1,2}[.,]\d{1,2})$/i);
    if (!m) return null;
    var k = m[1].replace(',', '.').split('.');
    return (+k[0]) + '.' + (+k[1]);
  }
  function open(code) {
    var s = IDX[code];
    if (!s) { $('msg').textContent = 'Kode ' + code + ' tidak ditemukan. Kode berbentuk bab.nomor, misalnya 4.3.'; return false; }
    var r = (store('fm-recent') || '').split(',').filter(function (x) { return x && x !== code; });
    r.unshift(code); store('fm-recent', r.slice(0, 5).join(','));
    location.href = url(s); return true;
  }

  $('codeForm').onsubmit = function (e) {
    e.preventDefault();
    var raw = $('code').value, c = parse(raw);
    if (!raw.trim()) { $('msg').textContent = 'Ketik kode SIM terlebih dahulu.'; return; }
    if (!c) { $('msg').textContent = 'Format kode belum tepat. Contoh: 4.3 atau 10.6.'; return; }
    open(c);
  };
  $('code').oninput = function () { $('msg').textContent = ''; };

  (function recent() {
    var r = (store('fm-recent') || '').split(',').filter(function (x) { return IDX[x]; });
    var box = $('recent'); box.innerHTML = '';
    r.forEach(function (c) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'chip';
      b.textContent = 'SIM ' + c + ' · ' + IDX[c].title; b.onclick = function () { open(c); };
      box.appendChild(b);
    });
  })();

  /* daftar bab */
  var host = $('chapters');
  var PARTS = { 1: 'Bagian I · Relativitas', 3: 'Bagian II · Awal Teori Kuantum', 7: 'Bagian III · Mekanika Kuantum', 10: 'Bagian IV · Atom dan Inti', 12: 'Praktikum' };
  function item(code, cls, title, desc, ref, href) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'item';
    b.innerHTML = '<span class="code ' + cls + '"></span><span class="it"><b></b><span></span><i></i></span>';
    b.querySelector('.code').textContent = code;
    b.querySelector('b').textContent = title;
    var sp = b.querySelector('.it>span'); if (desc) sp.textContent = desc; else sp.remove();
    var i = b.querySelector('i'); if (ref) i.textContent = ref; else i.remove();
    b.onclick = function () { location.href = href; };
    return b;
  }
  D.chapters.forEach(function (c) {
    if (PARTS[c.n]) { var h = document.createElement('div'); h.className = 'part'; h.textContent = PARTS[c.n]; host.appendChild(h); }
    var d = document.createElement('details'); d.className = 'ch'; d.id = 'bab-' + c.n;
    var s = document.createElement('summary');
    s.innerHTML = '<span class="num"></span><span class="ch-t"><b></b><span></span></span><svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>';
    s.querySelector('.num').textContent = c.n === 12 ? 'P' : c.n;
    s.querySelector('b').textContent = c.title;
    s.querySelector('.ch-t>span').textContent = c.sims.length + ' simulasi';
    d.appendChild(s);
    var l = document.createElement('div'); l.className = 'list';
    c.sims.forEach(function (x) {
      l.appendChild(item(x.code, '', x.title, x.desc, /^\d/.test(x.book) ? 'Buku: subbab ' + x.book : x.book, url(x)));
    });
    l.appendChild(item(c.n === 12 ? 'P' : 'Bab', 'r', c.n === 12 ? 'Materi praktikum' : 'Materi Bab ' + c.n, 'Halaman materi lengkap dengan contoh soal dan simulasinya.', '', c.page + '?mode=bab'));
    d.appendChild(l);
    host.appendChild(d);
  });

  /* tautan langsung: index.html#go=4.3 (dari kode QR buku atau aplikasi lain) */
  function route() {
    var h = decodeURIComponent(location.hash || '');
    var m = h.match(/^#go=(.+)$/);
    if (m) { var c = parse('#go=' + m[1]); history.replaceState(null, '', location.pathname); if (c && !open(c)) $('code').value = c; return; }
    var b = h.match(/^#bab-(\d+)$/);
    if (b && $('bab-' + b[1])) { var el = $('bab-' + b[1]); el.open = true; setTimeout(function () { el.scrollIntoView({ block: 'start' }); }, 0); }
  }
  window.addEventListener('hashchange', route);
  if (!document.documentElement.classList.contains('fm-kunci')) route();
  window.fmOpen = function (t) { var c = parse(t); if (c) open(c); };

  /* pemindai QR: BarcodeDetector bila ada, selain itu jsQR (lib/jsQR.js) */
  var stream = null, timer = null, detector = null;
  function loadJsQR(cb) {
    if (window.jsQR) return cb(true);
    var srcs = ['lib/jsQR.js', 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js'];
    (function next(i) {
      if (i >= srcs.length) return cb(false);
      var s = document.createElement('script'); s.src = srcs[i];
      s.onload = function () { cb(!!window.jsQR); }; s.onerror = function () { next(i + 1); };
      document.head.appendChild(s);
    })(0);
  }
  function stop() {
    clearTimeout(timer); timer = null;
    if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
    stream = null; $('scan').classList.remove('on');
  }
  function found(text) {
    var c = parse(text);
    if (!c) { $('scanMsg').textContent = 'Kode QR ini bukan kode SIM buku. Coba kode QR lain.'; return false; }
    if (!IDX[c]) { $('scanMsg').textContent = 'Kode SIM ' + c + ' tidak dikenal.'; return false; }
    stop(); open(c); return true;
  }
  function tick() {
    var v = $('video');
    if (!stream) return;
    if (v.readyState < 2) { timer = setTimeout(tick, 150); return; }
    if (detector) {
      detector.detect(v).then(function (r) { if (!(r.length && found(r[0].rawValue))) timer = setTimeout(tick, 200); })
        .catch(function () { timer = setTimeout(tick, 300); });
      return;
    }
    var cv = $('cv'), w = v.videoWidth, h = v.videoHeight, k = Math.min(1, 720 / Math.max(w, h));
    cv.width = Math.round(w * k); cv.height = Math.round(h * k);
    var g = cv.getContext('2d', { willReadFrequently: true });
    g.drawImage(v, 0, 0, cv.width, cv.height);
    var img = g.getImageData(0, 0, cv.width, cv.height);
    var r = window.jsQR(img.data, cv.width, cv.height, { inversionAttempts: 'dontInvert' });
    if (!(r && r.data && found(r.data))) timer = setTimeout(tick, 200);
  }
  $('scanBtn').onclick = function () {
    $('msg').textContent = '';
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { $('msg').textContent = 'Kamera tidak tersedia di perangkat ini. Ketik kodenya saja.'; return; }
    var ready = function (ok) {
      if (!ok) { $('msg').textContent = 'Pemindai QR belum tersedia. Ketik kodenya saja.'; return; }
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false }).then(function (s) {
        stream = s; var v = $('video'); v.srcObject = s; v.play();
        $('scanMsg').textContent = 'Arahkan kamera ke kode QR pada kotak SIM.';
        $('scan').classList.add('on'); tick();
      }).catch(function () { $('msg').textContent = 'Izin kamera ditolak. Ketik kodenya, atau izinkan kamera di pengaturan aplikasi.'; });
    };
    if ('BarcodeDetector' in window) {
      window.BarcodeDetector.getSupportedFormats().then(function (f) {
        if (f.indexOf('qr_code') >= 0) { detector = new window.BarcodeDetector({ formats: ['qr_code'] }); ready(true); }
        else loadJsQR(ready);
      }).catch(function () { loadJsQR(ready); });
    } else loadJsQR(ready);
  };
  $('scanClose').onclick = stop;
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); });
})();
