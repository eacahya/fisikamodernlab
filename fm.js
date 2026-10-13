/* Fisika Modern Lab: mode tampilan halaman materi/simulasi di dalam aplikasi.
   ?sim=4.3        buka simulasi SIM 4.3 (tab tertentu di halaman simulasi, atau hanya simulasi
                   di bagian materi yang dirujuk)
   ?mode=bab       halaman materi lengkap (tanpa tugas dan alokasi waktu kuliah)
   Tanpa parameter: halaman tampil apa adanya, dengan bilah aplikasi. */
(function () {
  var D = window.FM_DATA, html = document.documentElement;
  if (!D) return;
  var file = location.pathname.split('/').pop();
  var dir = /\/simulasi\/[^\/]*$/.test(location.pathname) ? 'simulasi/' : 'materi/';
  var here = dir + file;
  var q = new URLSearchParams(location.search);
  var code = q.get('sim'), sim = null, ch = null, i, j;
  for (i = 0; i < D.chapters.length; i++) {
    var c = D.chapters[i];
    for (j = 0; j < c.sims.length; j++) if (c.sims[j].code === code && c.sims[j].page === here) { sim = c.sims[j]; ch = c; }
  }
  if (!ch) for (i = 0; i < D.chapters.length && !ch; i++) {
    if (D.chapters[i].page === here) ch = D.chapters[i];
    for (j = 0; j < D.chapters[i].sims.length && !ch; j++) if (D.chapters[i].sims[j].page === here) ch = D.chapters[i];
  }
  var mode = sim ? 'sim' : (q.get('mode') || 'page');
  var tgt = sim ? sim.target : '';

  var css = 'nav.toc,.crumb,.pager,footer{display:none!important}#tugas,#tujuan .tbl{display:none!important}';
  if (mode === 'sim' && /^tab:/.test(tgt)) css += 'header{display:none!important}';
  if (mode === 'sim' && /^sec:/.test(tgt)) css += 'header{display:none!important}main{padding-top:4px}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  html.classList.add('fm-app', 'fm-' + mode);

  /* tema mengikuti pengaturan beranda */
  try { var th = localStorage.getItem('fm-theme'); if (th === 'dark' || th === 'light') html.setAttribute('data-theme', th); } catch (e) {}

  if (window.AndroidBridge && window.AndroidBridge.copyText) {
    var fallback = function (t) { window.AndroidBridge.copyText(String(t)); return Promise.resolve(); };
    try {
      if (!navigator.clipboard) Object.defineProperty(navigator, 'clipboard', { value: { writeText: fallback } });
      else navigator.clipboard.writeText = fallback;
    } catch (e) {}
  }

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function go(url) { location.href = url; }
  function simUrl(s) { return '../' + s.page + '?sim=' + s.code + (/^tab:/.test(s.target) ? '&tab=' + s.target.slice(4) : ''); }
  function home() { return '../index.html' + (ch ? '#bab-' + ch.n : ''); }

  function isolate(w) {
    var n = w;
    while (n && n.parentElement && n !== document.body) {
      Array.prototype.forEach.call(n.parentElement.children, function (s) {
        if (s !== n && !/^(SCRIPT|STYLE|LINK|svg)$/i.test(s.tagName) && !s.classList.contains('fm-keep')) s.setAttribute('data-fm-hide', '');
      });
      n = n.parentElement;
    }
    var s2 = document.createElement('style'); s2.textContent = '[data-fm-hide]{display:none!important}'; document.head.appendChild(s2);
  }

  function setup() {
    if (mode === 'sim') {
      if (/^tab:/.test(tgt)) {
        var b = document.querySelector('[data-go="' + tgt.slice(4) + '"]');
        if (b && !b.classList.contains('on')) b.click();
        if (b) setTimeout(function () { try { b.scrollIntoView({ block: 'nearest', inline: 'center' }); window.scrollTo(0, 0); } catch (e) {} }, 80);
      } else if (/^sec:/.test(tgt)) {
        var sec = document.getElementById(tgt.slice(4));
        var w = sec && sec.querySelector('.viz, .card.calc');
        if (w) isolate(w);
      }
    }
    var bar = el('div', 'fm-bar fm-keep');
    var back = el('button', 'fm-back', '‹'); back.setAttribute('aria-label', 'Kembali ke beranda');
    back.onclick = function () { go(home()); };
    var t = el('div', 'fm-title');
    if (sim) { t.appendChild(el('span', 'fm-code', 'SIM ' + sim.code)); t.appendChild(el('b', null, sim.title)); }
    else { t.appendChild(el('span', 'fm-code', ch ? (ch.n === 12 ? 'Praktikum' : 'Bab ' + ch.n) : 'Fisika Modern')); t.appendChild(el('b', null, ch ? ch.title : document.title)); }
    bar.appendChild(back); bar.appendChild(t);
    document.body.insertBefore(bar, document.body.firstChild);

    var host = document.querySelector('main') || document.body;
    var info = el('div', 'fm-info fm-keep');
    if (sim) {
      info.appendChild(el('p', 'fm-ref', /^\d/.test(sim.book) ? 'Di buku: subbab ' + sim.book : sim.book));
      info.appendChild(el('p', 'fm-desc', sim.desc));
    }
    var nav = el('div', 'fm-nav fm-keep');
    if (sim) {
      var k = ch.sims.indexOf(sim);
      if (k > 0) { var p = el('button', 'fm-btn', '‹ SIM ' + ch.sims[k - 1].code); p.onclick = function () { go(simUrl(ch.sims[k - 1])); }; nav.appendChild(p); }
      if (k < ch.sims.length - 1) { var n2 = el('button', 'fm-btn', 'SIM ' + ch.sims[k + 1].code + ' ›'); n2.onclick = function () { go(simUrl(ch.sims[k + 1])); }; nav.appendChild(n2); }
    }
    if (ch && !(mode === 'bab' && here === ch.page)) { var m = el('button', 'fm-btn', 'Materi ' + (ch.n === 12 ? 'praktikum' : 'Bab ' + ch.n)); m.onclick = function () { go('../' + ch.page + '?mode=bab'); }; nav.appendChild(m); }
    var hb = el('button', 'fm-btn', 'Beranda'); hb.onclick = function () { go(home()); }; nav.appendChild(hb);
    if (sim) host.insertBefore(info, host.firstChild);
    host.appendChild(nav);
    window.scrollTo(0, 0);
    setTimeout(function () { window.dispatchEvent(new Event('resize')); }, 60);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
