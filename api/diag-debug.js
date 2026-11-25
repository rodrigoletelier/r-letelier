const ALLOWED = ['wasai.com', 'www.wasai.com'];
module.exports = async (req, res) => {
  const u = new URL(String(req.query.url || 'https://wasai.com/en/'));
  if (!ALLOWED.includes(u.hostname)) return res.status(400).json({ error: 'host' });
  const r = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RodrigoLetelierDiagnostico/1.0; +https://www.rodrigoletelier.cl/diagnostico/)', Accept: 'text/html' } });
  const html = await r.text();
  const out = { status: r.status, final: r.url, length: html.length, hits: {} };
  for (const k of ['whatsapp', 'wa.me', 'wa.link', 'joinchat', 'fbq', 'fbevents', 'facebook.net', 'pixel', 'GTM-', 'gtag(', 'AW-', 'G-']) {
    const re = new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const list = []; let m;
    while ((m = re.exec(html)) && list.length < 4) list.push(html.slice(Math.max(0, m.index - 120), m.index + 160).replace(/\s+/g, ' '));
    out.hits[k] = { count: (html.match(re) || []).length, samples: list };
  }
  const scripts = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1]).slice(0, 60);
  out.scripts = scripts;
  res.json(out);
};
