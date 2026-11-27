(function () {
  var form = document.querySelector('.diag-form');
  var box = document.getElementById('diag-inline');
  if (!form || !box) return;
  var en = document.documentElement.lang === 'en';
  var T = en ? {
    areas: ['Visibility on Google and AI', 'Direct booking', 'Offer for travelers', 'Speed and mobile', 'Tracking and social'],
    services: { visibilidad: 'Visibility', conversion: 'Conversion and technology', propuesta: 'Conversion and technology', rendimiento: 'Conversion and technology', tracking: 'Conversion and technology' },
    loading: 'Checking your site…', measuring: 'Measuring mobile speed…', wait: 'Measuring mobile speed with Google. It takes up to a minute', of: 'out of 100', partial: 'Partial results',
    levels: ['There is a lot of room to grow', 'You are on track, but there are leaks', 'Your website has a solid base'],
    capped: { social: 'Score capped at 35: no social profiles linked.', channel: 'Score capped at 40: no WhatsApp or direct contact on the home page.' },
    prio: {
      visibilidad: ['Get found on Google and by AI', 'Your home page gives few signals to show up when a traveler searches for your destination or asks an AI assistant.'],
      conversion: ['Make booking direct easy', 'A traveler who already chose you needs a clear way to book or ask without leaving for an OTA.'],
      propuesta: ['Show travelers why to choose you', 'Before booking they want to see what they will experience, what it costs and what other guests say.'],
      rendimiento: ['Load fast on phones', 'Every second of waiting on mobile makes more travelers leave before they see your offer.'],
      tracking: ['Know where your bookings come from', 'Without tracking and social profiles you cannot tell what works, and your campaigns cannot learn.']
    },
    noEvidence: 'Not enough evidence', top: 'Your top 3 priorities', none: 'We found no obvious gaps',
    full: 'See full report', send: 'Send report', email: 'Your email', ask: 'Leave your email and I will send you the full report, with everything we checked and what to fix first.', sending: 'Sending…', sent: function (e) { return 'Done. The full report is on its way to ' + e + '. If you do not see it in a few minutes, check your Promotions or Spam folder.'; }, sendError: 'We could not send it. Check the email address and try again.',
    speedOk: 'Fast on mobile', speedBad: 'Slow on mobile', speedDetail: 'Measured with Google PageSpeed.',
    errors: { bad_url: 'Check the address. Type something like yourhotel.com.', unreachable: 'We could not open that site. Check the address and that the site is online.', rate: 'You ran several checks in a row. Wait a minute and try again.', blocked: 'Your site blocks automated checks. Write to me and I will review it by hand.' }
  } : {
    areas: ['Visibilidad en Google y la IA', 'Reserva directa', 'Propuesta para el viajero', 'Velocidad y móvil', 'Medición y redes'],
    services: { visibilidad: 'Visibilidad', conversion: 'Conversión y tecnología', propuesta: 'Conversión y tecnología', rendimiento: 'Conversión y tecnología', tracking: 'Conversión y tecnología' },
    loading: 'Revisando tu sitio…', measuring: 'Midiendo la velocidad en móvil…', wait: 'Midiendo la velocidad en móvil con Google. Tarda hasta un minuto', of: 'de 100', partial: 'Diagnóstico parcial',
    levels: ['Hay mucho espacio para crecer', 'Vas bien, pero hay fugas', 'Tu web tiene una base sólida'],
    capped: { social: 'Índice limitado a 35: sin redes sociales enlazadas.', channel: 'Índice limitado a 40: sin WhatsApp ni contacto directo en la portada.' },
    prio: {
      visibilidad: ['Que Google y la IA te encuentren', 'Tu portada da pocas señales para aparecer cuando un viajero busca tu destino o le pregunta a la IA.'],
      conversion: ['Que reservar directo sea fácil', 'El viajero que ya te eligió necesita un camino claro para reservar o preguntar sin irse a una OTA.'],
      propuesta: ['Que el viajero entienda por qué elegirte', 'Antes de reservar quiere ver qué va a vivir, cuánto cuesta y qué dicen otros huéspedes.'],
      rendimiento: ['Que tu sitio cargue rápido en el teléfono', 'Cada segundo de espera en móvil hace que más viajeros se vayan antes de ver tu oferta.'],
      tracking: ['Saber de dónde vienen tus reservas', 'Sin medición ni redes enlazadas no sabes qué funciona, y tus campañas no pueden aprender.']
    },
    noEvidence: 'Sin evidencia suficiente', top: 'Tus 3 prioridades', none: 'No encontramos brechas evidentes',
    full: 'Ver informe completo', send: 'Enviar informe', email: 'Tu correo', ask: 'Deja tu correo y te envío el informe completo, con todo lo que revisamos y qué conviene corregir primero.', sending: 'Enviando…', sent: function (e) { return 'Listo. El informe completo va camino a ' + e + '. Si no lo ves en unos minutos, revisa las carpetas de Promociones o Spam.'; }, sendError: 'No pudimos enviarlo. Revisa el correo e inténtalo de nuevo.',
    speedOk: 'Carga rápida en móvil', speedBad: 'Carga lenta en móvil', speedDetail: 'Medido con Google PageSpeed.',
    errors: { bad_url: 'Revisa la dirección. Escribe algo como tuhotel.com.', unreachable: 'No pudimos abrir ese sitio. Revisa que la dirección esté bien y que el sitio esté en línea.', rate: 'Hiciste varios análisis seguidos. Espera un minuto y vuelve a intentar.', blocked: 'Tu sitio bloquea las revisiones automáticas. Escríbeme y lo reviso a mano.' }
  };
  var S = window.TGIScore;
  var MAX_PCT = S.MAX_PCT;
  var PRIORITY = ['noindex', 'engine', 'ota', 'ga4', 'speed', 'whatsapp', 'schema', 'content', 'adtags', 'desc', 'reviews', 'sitemap', 'price', 'offer', 'contact', 'lang', 'title', 'h1', 'viewport', 'https', 'social'];
  var data = null, speed = null, waitStart = 0, waitTimer = null;

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
    var r = S.score(checks);
    var areas = r.areas.map(function (a, i) { a.title = T.areas[i]; return a; });
    var gaps = checks.filter(function (c) { return c.status !== null && c.status < 1; });
    gaps.sort(function (a, b) { return (a.status - b.status) || (PRIORITY.indexOf(a.id) - PRIORITY.indexOf(b.id)); });
    var top = areas.filter(function (a) { return a.ok && a.pct < MAX_PCT; }).sort(function (a, b) { return b.gap - a.gap; }).slice(0, 3).map(function (a) {
      return { area: a, items: gaps.filter(function (c) { return c.area === a.id; }) };
    }).filter(function (p) { return p.items.length; });
    return { areas: areas, score: r.score, cap: r.cap, top: top };
  }

  function render() {
    var r = compute();
    var keep = box.querySelector('.di-mail:not([hidden])');
    var title = r.score !== null ? T.levels[S.level(r.score)] : speed === null ? T.measuring : T.partial;
    box.innerHTML =
      '<div class="di-head"><div class="di-score"><strong>' + (r.score !== null ? r.score : '–') + '</strong><span>' + T.of + '</span></div>' +
      '<div><p class="di-host">' + esc(data.host) + '</p><h3>' + esc(title) + '</h3></div></div>' +
      '<div class="di-bars">' + r.areas.map(function (a) {
        var waiting = a.title === T.areas[3] && speed === null;
        return '<div class="di-bar"><span>' + a.title + '</span><i' + (waiting ? ' class="is-loading"' : '') + '><b style="width:' + (a.ok ? a.pct : 0) + '%;background:' + color(a.pct) + '"></b></i><em>' + (a.ok ? a.pct + '%' : waiting ? '<span class="di-dots"><i></i><i></i><i></i></span>' : '–') + '</em></div>';
      }).join('') + '</div>' +
      (speed === null ? '<p class="di-wait"><span class="di-spin" aria-hidden="true"></span>' + T.wait + ' <b class="di-sec">' + Math.round((Date.now() - waitStart) / 1000) + ' s</b></p>' : '') +
      (r.cap ? '<p class="di-cap">' + T.capped[r.cap] + '</p>' : '') +
      '<h4>' + T.top + '</h4><ol class="di-top">' + (r.top.length ? r.top.map(function (p) {
        var c = T.prio[p.area.id];
        return '<li><small>' + p.area.title + ' · ' + p.area.pct + '%</small><strong>' + c[0] + '</strong><p>' + c[1] + '</p><ul>' + p.items.slice(0, 4).map(function (it) { return '<li' + (it.status >= 0.5 ? ' class="is-mid"' : '') + '>' + esc(it.label) + '</li>'; }).join('') + '</ul></li>';
      }).join('') : '<li>' + T.none + '</li>') + '</ol>' +
      '<div class="di-actions"><button type="button" class="btn btn-primary di-open">' + T.full + '</button></div>' +
      '<form class="di-mail" hidden><p>' + T.ask + '</p><div class="di-mail-row"><input type="email" name="email" placeholder="' + T.email + '" aria-label="' + T.email + '" required /><button type="submit" class="btn btn-primary">' + T.send + '</button></div><p class="di-status" role="status"></p></form>';
    if (keep) {
      box.replaceChild(keep, box.querySelector('.di-mail'));
      box.querySelector('.di-actions').hidden = true;
    } else bindMail();
    return r;
  }

  function bindMail() {
    var open = box.querySelector('.di-open'), mail = box.querySelector('.di-mail');
    open.addEventListener('click', function () {
      mail.hidden = false;
      open.parentNode.hidden = true;
      mail.querySelector('input').focus();
      track('diagnostico_report_open', { site: data.host, place: 'home' });
    });
    mail.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!mail.reportValidity()) return;
      var email = mail.email.value.trim(), b = mail.querySelector('button'), st = mail.querySelector('.di-status');
      b.disabled = true;
      st.textContent = T.sending;
      fetch('/api/informe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, url: data.url, lang: en ? 'en' : 'es', speed: speed || null, result: data })
      }).then(function (res) {
        if (!res.ok) throw new Error(String(res.status));
        mail.innerHTML = '<p class="di-done">' + esc(T.sent(email)) + '</p>';
        track('generate_lead', { form_id: 'diagnostico_informe', site: data.host, place: 'home' });
      }).catch(function () {
        b.disabled = false;
        st.textContent = T.sendError;
      });
    });
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
    data = null; speed = null; clearInterval(waitTimer);
    track('diagnostico_start', { place: 'home' });
    getJson('/api/diagnostico?' + (en ? 'lang=en&' : '') + 'url=' + encodeURIComponent(raw), 20000).then(function (j) {
      data = j;
      waitStart = Date.now();
      clearInterval(waitTimer);
      waitTimer = setInterval(function () { var el = box.querySelector('.di-sec'); if (el) el.textContent = Math.round((Date.now() - waitStart) / 1000) + ' s'; }, 1000);
      render();
      track('diagnostico_complete', { site: j.host, place: 'home' });
      return getJson('/api/velocidad?url=' + encodeURIComponent(j.url), 65000).catch(function () { return false; }).then(function (s) {
        if (data !== j) return;
        clearInterval(waitTimer);
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
