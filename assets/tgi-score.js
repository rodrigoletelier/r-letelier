(function (root) {
  var IDS = ['visibilidad', 'conversion', 'propuesta', 'rendimiento', 'tracking'];
  var WEIGHTS = [25, 25, 20, 15, 15];
  var MAX_PCT = 90;
  var CAPS = { social: 35, channel: 40 };

  function capScore(checks, score) {
    if (score === null) return { score: null, cap: null };
    var st = function (id) { var c = checks.filter(function (x) { return x.id === id; })[0]; return c ? c.status : null; };
    var caps = [];
    if (st('social') === 0) caps.push([CAPS.social, 'social']);
    if (st('whatsapp') === 0 && st('contact') === 0) caps.push([CAPS.channel, 'channel']);
    caps.sort(function (a, b) { return a[0] - b[0]; });
    return caps.length && caps[0][0] < score ? { score: caps[0][0], cap: caps[0][1] } : { score: score, cap: null };
  }

  function score(checks) {
    var total = 0, complete = true;
    var areas = IDS.map(function (id, i) {
      var all = checks.filter(function (c) { return c.area === id; });
      var ev = all.filter(function (c) { return c.status !== null; });
      var sum = ev.reduce(function (s, c) { return s + c.status * (c.w || 1); }, 0);
      var wsum = ev.reduce(function (s, c) { return s + (c.w || 1); }, 0);
      var ok = ev.length >= 2 && ev.length / all.length >= 0.7;
      var pct = ev.length ? Math.min(MAX_PCT, Math.round(sum / wsum * 100)) : 0;
      if (ok) total += pct * WEIGHTS[i] / 100; else complete = false;
      return { id: id, weight: WEIGHTS[i], pct: pct, ok: ok, coverage: all.length ? Math.round(ev.length / all.length * 100) : 0, gap: ok ? (MAX_PCT - pct) * WEIGHTS[i] : 0 };
    });
    var c = capScore(checks, complete ? Math.round(total) : null);
    return { areas: areas, complete: complete, score: c.score, cap: c.cap };
  }

  function level(s) { return s >= 75 ? 2 : s >= 50 ? 1 : 0; }

  var api = { IDS: IDS, WEIGHTS: WEIGHTS, MAX_PCT: MAX_PCT, CAPS: CAPS, capScore: capScore, score: score, level: level };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.TGIScore = api;
})(this);
