const { runDiagnosis } = require('./diagnostico.js');

const hits = new Map();
const IDS = ['visibilidad', 'conversion', 'propuesta', 'rendimiento', 'tracking'];
const WEIGHTS = [25, 25, 20, 15, 15];
const MAX_PCT = 90;

const TXT = {
  es: {
    areas: ['Visibilidad en Google y la IA', 'Reserva directa', 'Propuesta para el viajero', 'Velocidad y móvil', 'Medición y redes'],
    levels: ['Hay mucho espacio para crecer', 'Vas bien, pero hay fugas', 'Tu web tiene una base sólida'],
    partial: 'Diagnóstico parcial',
    subject: (h) => `Tu diagnóstico web: ${h}`,
    intro: (h) => `Este es el informe completo del diagnóstico de ${h}. Revisamos lo que un viajero ve en tu sitio antes de reservar.`,
    score: 'Índice', of: 'de 100', noScore: 'Sin índice completo: no encontramos evidencia suficiente en todas las áreas.',
    detail: 'Todo lo que revisamos', ok: 'Bien', mid: 'Mejorable', bad: 'Falta',
    speedOk: 'Carga rápida en móvil', speedBad: 'Carga lenta en móvil', speedDetail: 'Medido con Google PageSpeed.',
    capped: { social: 'Índice limitado a 35: sin redes sociales enlazadas.', channel: 'Índice limitado a 40: sin WhatsApp ni contacto directo en la portada.' },
    note: 'Es una revisión automática de tu página de inicio. El máximo por área es 90 %: el resto solo se puede ver con tus datos reales de campañas y reservas.',
    cta: '¿Lo revisamos juntos? Responde este correo o escríbeme por WhatsApp.',
    wa: 'Escribir por WhatsApp',
    waMsg: (h) => `Hola Rodrigo, recibí el informe del diagnóstico de ${h} y me gustaría revisarlo contigo.`,
    sign: 'Rodrigo Letelier · Marketing turístico'
  },
  en: {
    areas: ['Visibility on Google and AI', 'Direct booking', 'Offer for travelers', 'Speed and mobile', 'Tracking and social'],
    levels: ['There is a lot of room to grow', 'You are on track, but there are leaks', 'Your website has a solid base'],
    partial: 'Partial results',
    subject: (h) => `Your website check: ${h}`,
    intro: (h) => `Here is the full report for ${h}. We reviewed what a traveler sees on your site before booking.`,
    score: 'Score', of: 'out of 100', noScore: 'No full score: we did not find enough evidence in every area.',
    detail: 'Everything we checked', ok: 'Good', mid: 'Can improve', bad: 'Missing',
    speedOk: 'Fast on mobile', speedBad: 'Slow on mobile', speedDetail: 'Measured with Google PageSpeed.',
    capped: { social: 'Score capped at 35: no social profiles linked.', channel: 'Score capped at 40: no WhatsApp or direct contact on the home page.' },
    note: 'This is an automatic review of your home page. Each area tops out at 90%: the rest can only be seen with your real campaign and booking data.',
    cta: 'Want to go over it together? Reply to this email or message me on WhatsApp.',
    wa: 'Message me on WhatsApp',
    waMsg: (h) => `Hi Rodrigo, I got the report for ${h} and would like to go over it with you.`,
    sign: 'Rodrigo Letelier · Tourism marketing'
  }
};

function esc(s) { return String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

function capScore(checks, score) {
  if (score === null) return { score: null, cap: null };
  var st = function (id) { var c = checks.filter(function (x) { return x.id === id; })[0]; return c ? c.status : null; };
  var caps = [];
  if (st('social') === 0) caps.push([35, 'social']);
  if (st('whatsapp') === 0 && st('contact') === 0) caps.push([40, 'channel']);
  caps.sort(function (a, b) { return a[0] - b[0]; });
  return caps.length && caps[0][0] < score ? { score: caps[0][0], cap: caps[0][1] } : { score: score, cap: null };
}

function compute(checks) {
  let total = 0, complete = true;
  const areas = IDS.map((id, i) => {
    const all = checks.filter((c) => c.area === id);
    const ev = all.filter((c) => c.status !== null);
    const sum = ev.reduce((s, c) => s + c.status * (c.w || 1), 0);
    const wsum = ev.reduce((s, c) => s + (c.w || 1), 0);
    const ok = ev.length >= 2 && ev.length / all.length >= 0.7;
    const pct = ev.length ? Math.min(MAX_PCT, Math.round(sum / wsum * 100)) : 0;
    if (ok) total += pct * WEIGHTS[i] / 100; else complete = false;
    return { id, pct, ok };
  });
  const c = capScore(checks, complete ? Math.round(total) : null);
  return { areas, score: c.score, cap: c.cap };
}

function buildEmail(t, data, r) {
  const color = (p) => p >= 70 ? '#6f9464' : p >= 40 ? '#c9935a' : '#c97a66';
  const title = r.score !== null ? t.levels[r.score >= 75 ? 2 : r.score >= 50 ? 1 : 0] : t.partial;
  const bars = r.areas.map((a, i) => `<tr><td style="padding:6px 0;font-size:14px;color:#1e2420">${esc(t.areas[i])}</td><td style="padding:6px 0 6px 12px;width:45%"><div style="height:8px;border-radius:8px;background:#ebe3d5"><div style="height:8px;border-radius:8px;width:${a.ok ? a.pct : 0}%;background:${color(a.pct)}"></div></div></td><td style="padding:6px 0 6px 12px;text-align:right;font-size:14px;font-weight:600;color:#1e2420">${a.ok ? a.pct + '%' : '–'}</td></tr>`).join('');
  const groups = IDS.map((id, i) => {
    const rows = data.checks.filter((c) => c.area === id && c.status !== null).sort((a, b) => a.status - b.status).map((c) => {
      const mark = c.status === 1 ? ['#6f9464', t.ok] : c.status === 0.5 ? ['#c9935a', t.mid] : ['#c97a66', t.bad];
      return `<tr><td width="1%" style="width:1%;padding:6px 10px 6px 0;vertical-align:top;white-space:nowrap"><span style="display:inline-block;padding:2px 8px;border-radius:10px;background:${mark[0]};color:#fff;font-size:11px;font-weight:600">${mark[1]}</span></td><td style="padding:6px 0;font-size:14px;color:#1e2420">${esc(c.label)}${c.detail ? `<br><span style="color:#657168;font-size:13px">${esc(c.detail)}</span>` : ''}</td></tr>`;
    }).join('');
    return rows ? `<h3 style="margin:22px 0 6px;font-size:15px;color:#143d2d">${esc(t.areas[i])}</h3><table role="presentation" cellpadding="0" cellspacing="0" width="100%">${rows}</table>` : '';
  }).join('');
  const wa = 'https://wa.me/56966170884?text=' + encodeURIComponent(t.waMsg(data.host));
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f4f0e8;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f0e8;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="background:#0d2b20;padding:28px 28px 24px;color:#ffffff">
<p style="margin:0 0 6px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#a6b891">${esc(data.host)}</p>
<p style="margin:0;font-size:22px;font-family:Georgia,serif">${esc(title)}</p>
<p style="margin:14px 0 0;font-size:15px;color:#a6b891">${r.score !== null ? `${t.score}: <strong style="font-size:26px;color:#ffffff">${r.score}</strong> ${t.of}` : esc(t.noScore)}</p>${r.cap ? `<p style="margin:8px 0 0;font-size:13px;color:#a6b891">${esc(t.capped[r.cap])}</p>` : ''}
</td></tr>
<tr><td style="padding:24px 28px">
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#1e2420">${esc(t.intro(data.host))}</p>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">${bars}</table>
<h2 style="margin:28px 0 0;font-size:18px;font-family:Georgia,serif;color:#0d2b20">${esc(t.detail)}</h2>
${groups}
<p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#657168">${esc(t.note)}</p>
<p style="margin:24px 0 14px;font-size:15px;line-height:1.6;color:#1e2420">${esc(t.cta)}</p>
<a href="${wa}" style="display:inline-block;padding:12px 22px;border-radius:999px;background:#6f9464;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px">${esc(t.wa)}</a>
<p style="margin:28px 0 0;font-size:13px;color:#657168">${esc(t.sign)}<br><a href="https://www.rodrigoletelier.cl" style="color:#1f4d3a">rodrigoletelier.cl</a></p>
</td></tr></table></td></tr></table></body></html>`;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  const { email, url, lang: rawLang, speed } = req.body || {};
  const lang = rawLang === 'en' ? 'en' : 'es';
  const t = TXT[lang];
  if (!/^[^\s@<>]{1,64}@[^\s@<>]{1,190}\.[a-z]{2,}$/i.test(String(email || ''))) return res.status(400).json({ error: 'email' });

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'x';
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((x) => now - x < 600000);
  if (recent.length >= 3) return res.status(429).json({ error: 'rate' });
  recent.push(now);
  hits.set(ip, recent);

  const d = await runDiagnosis(url, lang);
  if (d.status !== 200) { console.error('informe: diagnóstico falló', url, d.body); return res.status(d.status).json(d.body); }
  const data = d.body;

  const sp = speed && Number.isFinite(+speed.score) ? Math.max(0, Math.min(100, Math.round(+speed.score))) : null;
  const lcp = speed && /^[\d.,]{1,6}\s?m?s$/.test(String(speed.lcp || '')) ? String(speed.lcp) : '';
  if (sp !== null) {
    const st = sp >= 90 ? 1 : sp >= 50 ? 0.5 : 0;
    data.checks.push({ id: 'speed', area: 'rendimiento', status: st, label: (st === 1 ? t.speedOk : t.speedBad) + ' (' + sp + '/100)', detail: t.speedDetail + (lcp ? ' LCP ' + lcp + '.' : ''), w: 1 });
  } else {
    data.checks.push({ id: 'speed', area: 'rendimiento', status: null, label: '', detail: '', w: 1 });
  }
  const r = compute(data.checks);

  try {
    const send = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Rodrigo Letelier <diagnostico@mail.rodrigoletelier.cl>',
        to: [String(email)],
        bcc: ['hola@rodrigoletelier.cl'],
        reply_to: 'hola@rodrigoletelier.cl',
        subject: t.subject(data.host),
        html: buildEmail(t, data, r)
      })
    });
    if (!send.ok) { console.error('informe: Resend respondió', send.status, (await send.text()).slice(0, 300), 'key:', !!process.env.RESEND_API_KEY); return res.status(502).json({ error: 'send' }); }
    return res.status(200).json({ ok: true, score: r.score });
  } catch (e) {
    console.error('informe: error al enviar', e.message);
    return res.status(500).json({ error: 'send' });
  }
};
