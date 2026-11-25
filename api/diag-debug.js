module.exports = async (req, res) => {
  const out = {};
  const uas = { plain: 'RLDiagnostico/1.0 (+https://www.rodrigoletelier.cl/diagnostico/)', none: '', ours: 'Mozilla/5.0 (compatible; RLDiagnostico/1.0; +https://www.rodrigoletelier.cl/diagnostico/)' };
  for (const u of ['https://www.panguechile.com/', 'https://panguechile.com/']) for (const [k, ua] of Object.entries(uas)) {
    try {
      const r = await fetch(u, { headers: ua ? { 'User-Agent': ua, Accept: 'text/html' } : { Accept: 'text/html' } });
      const t = await r.text();
      out[u + ' ' + k] = { status: r.status, final: r.url, len: t.length, title: (t.match(/<title[^>]*>([^<]*)/i) || [])[1], head: t.slice(0, 300) };
    } catch (e) { out[u + ' ' + k] = { error: String(e) }; }
  }
  res.json(out);
};
