(function () {
  var bgs = document.querySelectorAll('.sol-bg');
  if (!bgs.length) return;
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.target.classList.toggle('is-paused', !e.isIntersecting); });
    });
    bgs.forEach(function (bg) { bg.classList.add('is-paused'); io.observe(bg); });
  }

  document.querySelectorAll('.sol-bg-search').forEach(function (bg) {
    var el = bg.querySelector('.sb-typed');
    var queries = (el.getAttribute('data-queries') || '').split('|');
    if (still) { el.textContent = queries[0]; bg.classList.add('is-done'); return; }
    var q = 0, i = 0, deleting = false;
    function tick() {
      if (bg.classList.contains('is-paused')) return setTimeout(tick, 400);
      var text = queries[q];
      if (!deleting) {
        i++;
        el.textContent = text.slice(0, i);
        if (i === text.length) { bg.classList.add('is-done'); deleting = true; return setTimeout(tick, 2600); }
        return setTimeout(tick, 70 + Math.random() * 60);
      }
      if (i === text.length) bg.classList.remove('is-done');
      i--;
      el.textContent = text.slice(0, i);
      if (i === 0) { deleting = false; q = (q + 1) % queries.length; return setTimeout(tick, 500); }
      setTimeout(tick, 30);
    }
    tick();
  });
})();
