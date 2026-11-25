module.exports = async (req, res) => {
  const url = 'https://www.panguechile.com/';
  const variants = {
    ours: { 'User-Agent': 'Mozilla/5.0 (compatible; RLDiagnostico/1.0; +https://www.rodrigoletelier.cl/diagnostico/)', Accept: 'text/html,*/*;q=0.8', 'Accept-Language': 'es,en;q=0.8' },
    noua: {},
    plainua: { 'User-Agent': 'RLDiagnostico/1.0' },
    oursNoLang: { 'User-Agent': 'Mozilla/5.0 (compatible; RLDiagnostico/1.0; +https://www.rodrigoletelier.cl/diagnostico/)' }
  };
  const out = {};
  for (const [k, h] of Object.entries(variants)) {
    try {
      const r = await fetch(url, { headers: h, redirect: 'manual' });
      const t = await r.text();
      out[k] = { status: r.status, server: r.headers.get('server'), loc: r.headers.get('location'), len: t.length, head: t.slice(0, 200) };
    } catch (e) { out[k] = { error: String(e) }; }
  }
  res.json(out);
};
