(function () {
  var form = document.querySelector('.diag-form');
  var box = document.getElementById('diag-inline');
  if (!form || !box) return;
  var en = document.documentElement.lang === 'en';
  var T = en ? {
    areas: ['Visibility on Google and AI', 'Direct booking', 'Offer for travelers', 'Speed and mobile', 'Tracking and social'],
    services: { visibilidad: 'Visibility', conversion: 'Conversion and technology', propuesta: 'Conversion and technology', rendimiento: 'Conversion and technology', tracking: 'Acquisition' },
    loading: 'Checking your site…', measuring: 'Measuring mobile speed…', of: 'out of 100', partial: 'Partial results',
    levels: ['There is a lot of room to grow', 'You are on track, but there are leaks', 'Your website has a solid base'],
    noEvidence: 'Not enough evidence', top: 'Your top 3 priorities', none: 'We found no obvious gaps',
    wa: 'Go over my results on WhatsApp', full: 'See the full report →', page: '/en/diagnostic/',
    speedOk: 'Fast on mobile', speedBad: 'Slow on mobile', speedDetail: 'Measured with Google PageSpeed.',
    msg: function (host, score, weak) { return 'Hi Rodrigo, I checked my website (' + host + ') with your free tool. ' + (score !== null ? 'It scored ' + score + '/100' : 'I got partial results') + (weak ? ' and the weakest area is "' + weak + '".' : '.') + ' I would like to go over it with you.'; },
    errors: { bad_url: 'Check the address. Type something like yourlodge.com.', unreachable: 'We could not open that site. Check the address and that the site is online.', rate: 'You ran several checks in a row. Wait a minute and try again.', blocked: 'Your site blocks automated checks. Write to me and I will review it by hand.' }
  } : {
    areas: ['Visibilidad en Google y la IA', 'Reserva directa', 'Propuesta para el viajero', 'Velocidad y móvil', 'Medición y redes'],
    services: { visibilidad: 'Visibilidad', conversion: 'Conversión y tecnología', propuesta: 'Conversión y tecnología', rendimiento: 'Conversión y tecnología', tracking: 'Adquisición' },
    loading: 'Revisando tu sitio…', measuring: 'Midiendo la velocidad en móvil…', of: 'de 100', partial: 'Diagnóstico parcial',
    levels: ['Hay mucho espacio para crecer', 'Vas bien, pero hay fugas', 'Tu web tiene una base sólida'],
    noEvidence: 'Sin evidencia suficiente', top: 'Tus 3 prioridades', none: 'No encontramos brechas evidentes',
    wa: 'Revisar mi resultado por WhatsApp', full: 'Ver el informe completo →', page: '/diagnostico/',
    speedOk: 'Carga rápida en móvil', speedBad: 'Carga lenta en móvil', speedDetail: 'Medido con Google PageSpeed.',
    msg: function (host, score, weak) { return 'Hola Rodrigo, analicé mi web (' + host + ') en tu diagnóstico. ' + (score !== null ? 'Me dio ' + score + '/100' : 'Me salió un diagnóstico parcial') + (weak ? ' y el área más débil es "' + weak + '".' : '.') + ' Me gustaría revisarlo contigo.'; },
    errors: { bad_url: 'Revisa la dirección. Escribe algo como tulodge.com.', unreachable: 'No pudimos abrir ese sitio. Revisa que la dirección esté bien y que el sitio esté en línea.', rate: 'Hiciste varios análisis seguidos. Espera un minuto y vuelve a intentar.', blocked: 'Tu sitio bloquea las revisiones automáticas. Escríbeme y lo reviso a mano.' }
  };
  var IDS = ['visibilidad', 'conversion', 'propuesta', 'rendimiento', 'tracking'];
  var WEIGHTS = [25, 25, 20, 15, 15];
  var PRIORITY = ['noindex', 'engine', 'ota', 'ga4', 'speed', 'whatsapp', 'schema', 'adtags', 'desc', 'reviews', 'sitemap', 'price', 'offer', 'contact', 'lang', 'title', 'h1', 'viewport', 'https', 'social'];
  var data = null, speed = null;

  function esc(s) { return String(s || '').replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function track(n, p) { if (typeof gtag === 'function') gtag('event', n, p || {}); }
  function color(p) { return p >= 70 ? 'var(--sage)' : p >= 40 ? '#c9935a' : '#c97a66'; }

  function speedCheck() {
    if (!speed) return { id: 'speed', area: 'rendimiento', status: null, label: '', detail: '' };
    var st = speed.score >= 90 ? 1 : speed.score >= 50 ? 0.5 : 0;
    return { id: 'speed', area: 'rendimiento', status: st, label: (st === 1 ? T.speedOk : T.speedBad) + ' (' + speed.score + '/100)', detail: T.speedDetail + (speed.lcp ? ' LCP ' + speed.lcp + '.' : '') };
  }

  function compute() {
    var checks = data.checks.concat([speedCheck()]);
    var total = 0, complete = true;
    var areas = IDS.map(function (id, i) {
      var all = checks.filter(function (c) { return c.area === id; });
      var ev = all.filter(function (c) { return c.status !== null; });
      var sum = ev.reduce(function (s, c) { return s + c.status; }, 0);
      var ok = ev.length >= 2 && ev.length / all.length >= 0.7;
      var pct = ev.length ? Math.round(sum / ev.length * 100) : 0;
      if (ok) total += pct * WEIGHTS[i] / 100; else complete = false;
      return { title: T.areas[i], pct: pct, ok: ok };
    });
    var gaps = checks.filter(function (c) { return c.status !== null && c.status < 1; });
    gaps.sort(function (a, b) { return (a.status - b.status) || (PRIORITY.indexOf(a.id) - PRIORITY.indexOf(b.id)); });
    return { areas: areas, score: complete ? Math.round(total) : null, top: gaps.slice(0, 3) };
  }

  function render() {
    var r = compute();
    var title = r.score !== null ? T.levels[r.score >= 70 ? 2 : r.score >= 40 ? 1 : 0] : speed === null ? T.measuring : T.partial;
    var weak = r.areas.filter(function (a) { return a.ok; }).sort(function (a, b) { return a.pct - b.pct; })[0];
    box.innerHTML =
      '<div class="di-head"><div class="di-score"><strong>' + (r.score !== null ? r.score : '–') + '</strong><span>' + T.of + '</span></div>' +
      '<div><p class="di-host">' + esc(data.host) + '</p><h3>' + esc(title) + '</h3></div></div>' +
      '<div class="di-bars">' + r.areas.map(function (a) {
        return '<div class="di-bar"><span>' + a.title + '</span><i><b style="width:' + (a.ok ? a.pct : 0) + '%;background:' + color(a.pct) + '"></b></i><em>' + (a.ok ? a.pct + '%' : (a.title === T.areas[3] && speed === null ? '…' : '–')) + '</em></div>';
      }).join('') + '</div>' +
      '<h4>' + T.top + '</h4><ol class="di-top">' + (r.top.length ? r.top.map(function (c) {
        return '<li><small>' + T.services[c.area] + '</small>' + esc(c.label) + '</li>';
      }).join('') : '<li>' + T.none + '</li>') + '</ol>' +
      '<div class="di-actions"><a class="btn btn-primary" target="_blank" rel="noreferrer" href="https://wa.me/56966170884?text=' + encodeURIComponent(T.msg(data.host, r.score, weak && weak.title)) + '">' + T.wa + '</a>' +
      '<a class="di-full" href="' + T.page + '?web=' + encodeURIComponent(data.host) + '">' + T.full + '</a></div>';
    return r;
  }

  function getJson(u, ms) {
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, ms);
    return fetch(u, ctrl ? { signal: ctrl.signal } : {}).then(function (res) {
      return res.json().then(function (j) { clearTimeout(timer); if (!res.ok) throw new Error(j.error || String(res.status)); return j; });
    }, function (e) { clearTimeout(timer); throw e; });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var raw = form.querySelector('input').value.trim();
    var btn = form.querySelector('button');
    if (!/^(https?:\/\/)?[^\s\/]+\.[^\s]{2,}/i.test(raw)) { box.hidden = false; box.innerHTML = '<p class="di-msg">' + T.errors.bad_url + '</p>'; return; }
    btn.disabled = true;
    box.hidden = false;
    box.innerHTML = '<p class="di-msg"><span class="di-spin" aria-hidden="true"></span>' + T.loading + '</p>';
    data = null; speed = null;
    track('diagnostico_start', { place: 'home' });
    getJson('/api/diagnostico?' + (en ? 'lang=en&' : '') + 'url=' + encodeURIComponent(raw), 20000).then(function (j) {
      data = j;
      render();
      track('diagnostico_complete', { site: j.host, place: 'home' });
      return getJson('/api/velocidad?url=' + encodeURIComponent(j.url), 65000).catch(function () { return false; }).then(function (s) {
        if (data !== j) return;
        speed = s;
        var r = render();
        track('diagnostico_score', { site: j.host, place: 'home', speed_ok: !!s, score: r.score });
      });
    }).catch(function (err) {
      box.innerHTML = '<p class="di-msg">' + (T.errors[err.message] || T.errors.unreachable) + '</p>';
      track('diagnostico_error', { reason: err.message, place: 'home' });
    }).then(function () { btn.disabled = false; });
  });
})();
