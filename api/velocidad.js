const hits = new Map();

function limited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 60000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 6;
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method' });
  const key = process.env.PAGESPEED_API_KEY;
  if (!key) return res.status(503).json({ error: 'no_key' });

  let target;
  try {
    target = new URL(String(req.query.url || ''));
    if (!/^https?:$/.test(target.protocol) || String(req.query.url).length > 300) throw new Error();
  } catch (e) {
    return res.status(400).json({ error: 'bad_url' });
  }

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (limited(ip)) return res.status(429).json({ error: 'rate' });

  const api = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?strategy=mobile&category=performance' +
    '&url=' + encodeURIComponent(target.href) + '&key=' + encodeURIComponent(key);

  for (let attempt = 0; attempt < 2; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 45000);
    try {
      const r = await fetch(api, { signal: ctrl.signal });
      if (!r.ok) throw new Error(String(r.status));
      const j = await r.json();
      const lh = j.lighthouseResult;
      const lcp = lh.audits && lh.audits['largest-contentful-paint'];
      res.setHeader('Cache-Control', 's-maxage=3600');
      return res.status(200).json({
        score: Math.round(lh.categories.performance.score * 100),
        lcp: lcp ? lcp.displayValue : ''
      });
    } catch (e) {
      if (attempt === 1 || e.name === 'AbortError') return res.status(502).json({ error: 'psi_failed' });
    } finally {
      clearTimeout(timer);
    }
  }
};
