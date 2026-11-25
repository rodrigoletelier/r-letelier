const d = require('./diagnostico.js');
module.exports = async (req, res) => {
  const out = {};
  try { const a = await d.safeFetch('https://www.panguechile.com/', 6000); out.first = { status: a.status, url: a.url, len: a.body.length }; } catch (e) { out.first = String(e); }
  try { const b = await d.safeFetch('https://www.panguechile.com/', 5000, true, 'RLDiagnostico/1.0 (+https://www.rodrigoletelier.cl/diagnostico/)'); out.retry = { status: b.status, url: b.url, len: b.body.length, title: (b.body.match(/<title[^>]*>([^<]*)/i) || [])[1] }; } catch (e) { out.retry = String(e); }
  res.json(out);
};
