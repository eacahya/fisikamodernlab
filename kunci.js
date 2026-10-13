/* Fisika Modern Lab: kode akses buku (web dan aplikasi Android) dan pemasangan sebagai aplikasi web (PWA).
   Tidak aktif hanya bila dibuka sebagai berkas lokal (file://).
   Kode akses tidak disimpan di sini, hanya sidik SHA-256-nya (ubah dengan tools/web/set_codes.py). */
(function () {
  var P = location.protocol, HOST = location.hostname, APP = HOST === 'appassets.androidplatform.net';
  if (P !== 'https:' && P !== 'http:') return;

  var HASH = ["845481f2c407adbd36925975a6288502acfa0c2b1453307694f7c3e40082b654"];
  var KEY = 'fmlab.akses', path = location.pathname;
  var sub = /\/(materi|simulasi)\/[^\/]*$/.test(path);
  var root = path.replace(/(materi|simulasi)\/[^\/]*$/, '').replace(/[^\/]*$/, '');
  var ANDROID = /Android/i.test(navigator.userAgent);

  function get() { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } }
  function save() { try { localStorage.setItem(KEY, '1'); } catch (e) { } }
  var ok = get();

  /* service worker: aplikasi tetap jalan tanpa internet setelah dibuka sekali */
  if (!APP && 'serviceWorker' in navigator && (P === 'https:' || HOST === 'localhost')) {
    window.addEventListener('load', function () { navigator.serviceWorker.register(root + 'sw.js', { scope: root }).catch(function () { }); });
  }

  var css = '' +
    'html.fm-kunci body>*:not(#fm-kunci){display:none!important}' +
    '#fm-kunci{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;' +
    'background:linear-gradient(160deg,#1f4e79,#163a5c);font:16px/1.5 Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#1d2330}' +
    '#fm-kunci .k-card{width:100%;max-width:420px;background:#fff;border-radius:18px;padding:24px 22px;box-shadow:0 10px 40px rgba(0,0,0,.25)}' +
    '#fm-kunci h1{margin:0 0 4px;font-size:22px;color:#1f4e79}#fm-kunci p{margin:0 0 14px;color:#5b6474;font-size:15px}' +
    '#fm-kunci input{width:100%;height:50px;border:1.5px solid #e2ded3;border-radius:12px;padding:0 14px;font:inherit;font-size:20px;letter-spacing:.08em;text-transform:uppercase;background:#f3f1ea;color:#1d2330;box-sizing:border-box}' +
    '#fm-kunci input:focus{outline:none;border-color:#1f4e79}' +
    '#fm-kunci button{width:100%;height:48px;margin-top:10px;border:0;border-radius:12px;background:#1f4e79;color:#fff;font:inherit;font-weight:700;cursor:pointer}' +
    '#fm-kunci .k-msg{min-height:22px;margin-top:8px;font-size:14px;color:#9b2c2c}' +
    '#fm-kunci .k-note{margin-top:14px;font-size:13px;color:#5b6474}' +
    '#fm-kunci .k-apk{display:block;margin-top:14px;text-align:center;font-weight:700;color:#1f4e79}' +
    '@media (prefers-color-scheme:dark){#fm-kunci .k-card{background:#1a1e26;color:#e7e9ee}#fm-kunci h1{color:#8cb8e6}#fm-kunci p,#fm-kunci .k-note{color:#a2aab8}' +
    '#fm-kunci input{background:#12151b;border-color:#2f3542;color:#e7e9ee}#fm-kunci button{background:#8cb8e6;color:#12151b}#fm-kunci .k-msg{color:#f09a9a}}' +
    '#fm-akses{max-width:760px;margin:0 auto 32px;padding:0 16px;font-size:14px;color:var(--muted,#5b6474);display:flex;flex-wrap:wrap;gap:8px;align-items:center}' +
    '#fm-akses .fm-apk{color:var(--accent,#1f4e79);font-weight:600}' +
    '#fm-akses button{border:1px solid var(--line,#e2ded3);background:var(--surface,#fff);color:var(--accent,#1f4e79);border-radius:999px;padding:6px 14px;font:inherit;font-size:14px;cursor:pointer}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function sha256hex(s) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)).then(function (b) {
      return Array.prototype.map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
    });
  }
  function check(code) {
    var n = String(code).toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!n) return Promise.resolve(false);
    if (!window.crypto || !crypto.subtle) return Promise.reject(new Error('nocrypto'));
    return sha256hex('fmlab:' + n).then(function (h) { return HASH.indexOf(h) >= 0; });
  }

  function ask() {
    var d = document.createElement('div'); d.id = 'fm-kunci';
    d.innerHTML = '<form class="k-card" autocomplete="off"><h1>Kode akses buku</h1>' +
      '<p>Fisika Modern Lab disediakan untuk pembaca buku <b>Fisika Modern</b>. Masukkan kode akses yang tercetak di halaman Petunjuk Penggunaan Buku.</p>' +
      '<input id="fm-kode" placeholder="Contoh: FML-XXXX-XXXX" aria-label="Kode akses" maxlength="20" autocapitalize="characters" spellcheck="false">' +
      '<button type="submit">Buka</button><div class="k-msg" id="fm-msg" role="alert"></div>' +
      '<div class="k-note">Kode cukup dimasukkan sekali di setiap perangkat dan peramban.</div>' +
      (ANDROID && !APP ? '<a class="k-apk" href="' + root + 'fisikamodernlab.apk" download>Unduh aplikasi Android (APK)</a>' : '') + '</form>';
    document.body.appendChild(d);
    var inp = d.querySelector('input'), msg = d.querySelector('#fm-msg');
    setTimeout(function () { inp.focus(); }, 50);
    d.querySelector('form').onsubmit = function (e) {
      e.preventDefault(); msg.textContent = '';
      check(inp.value).then(function (v) {
        if (!v) { msg.textContent = 'Kode tidak dikenal. Periksa kembali huruf dan angkanya.'; return; }
        save(); location.reload();
      }, function () { msg.textContent = 'Peramban ini tidak dapat memeriksa kode. Gunakan Chrome, Edge, Firefox, atau Safari versi terbaru.'; });
    };
  }

  /* bilah pasang aplikasi dan unduh APK di beranda */
  var installEvt = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); installEvt = e; bar(); });
  function bar() {
    if (sub || !document.body || !ok) return;
    var b = document.getElementById('fm-akses');
    if (!b) { b = document.createElement('div'); b.id = 'fm-akses'; document.body.appendChild(b); }
    b.innerHTML = '<span>Akses buku: ✓</span>' +
      (installEvt ? '<button type="button" id="fm-pasang">Pasang Fisika Modern Lab di perangkat ini</button>' : '') +
      (!APP ? '<a class="fm-apk" href="' + root + 'fisikamodernlab.apk" download>Unduh aplikasi Android (APK)</a>' : '');
    var p = document.getElementById('fm-pasang'); if (p) p.onclick = function () { installEvt.prompt(); installEvt.userChoice.then(function () { installEvt = null; bar(); }); };
  }

  if (!ok) document.documentElement.classList.add('fm-kunci');
  function ready() { if (!ok) ask(); else bar(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();
