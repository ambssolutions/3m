/* stages: one real photo per stage in "Built in layers, paid in stages" (designs/13-your-build).
   While the panel is on screen and the tab is visible, the photos move through the five stages (HOLD each, a 1.2s
   crossfade in CSS). Hover, keyboard focus or a tap on a stage in the list shows its photo and pauses the cycle; it
   picks up again a few seconds after the pointer leaves. The current stage is marked in the list (.cur).
   Reduced motion or Save-Data: no auto cycle, the list still chooses the photo. Without JS the first photo shows. */
(function () {
  var d = document, sec = d.getElementById('layers');
  var box = sec && sec.querySelector('[data-stage-photos]');
  if (!box) return;
  var figs = box.querySelectorAll('.lp-f'), bars = box.querySelectorAll('.lp-bar i'), items = sec.querySelectorAll('.layers-list li');
  var num = box.querySelector('.lp-n'), ttl = box.querySelector('.lp-t');
  var names = [].map.call(items, function (li) { var b = li.querySelector('b'); return b ? b.textContent.trim() : ''; });
  var HOLD = 4200, RESUME = 3000;
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches || (navigator.connection && navigator.connection.saveData);
  var cur = 0, timer = 0, seen = false, held = false, resumeT = 0;
  box.style.setProperty('--lp-hold', HOLD + 'ms');

  function show(i) {
    cur = (i + figs.length) % figs.length;
    for (var k = 0; k < figs.length; k++) {
      figs[k].classList.toggle('on', k === cur);
      if (bars[k]) { bars[k].classList.toggle('done', k < cur); bars[k].classList.remove('now'); }
      if (items[k]) items[k].classList.toggle('cur', k === cur);
    }
    /* restart the fill on the current bar */
    if (bars[cur]) { void bars[cur].offsetWidth; bars[cur].classList.add('now'); }
    num.textContent = (cur < 9 ? '0' : '') + (cur + 1);
    ttl.textContent = names[cur] || '';
    /* warm the next photo so its fade never waits on the network */
    var nx = figs[(cur + 1) % figs.length].querySelector('img'); if (nx && nx.loading === 'lazy') nx.loading = 'eager';
  }
  function stop() { clearTimeout(timer); timer = 0; box.classList.remove('run'); }
  function run() {
    stop(); if (calm || held || !seen || d.hidden) return;
    box.classList.add('run');
    timer = setTimeout(function () { show(cur + 1); run(); }, HOLD);
  }
  function pick(i) { held = true; clearTimeout(resumeT); stop(); show(i); }
  function release() { clearTimeout(resumeT); resumeT = setTimeout(function () { held = false; run(); }, RESUME); }

  [].forEach.call(items, function (li, i) {
    li.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') pick(i); });
    li.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') release(); });
    li.addEventListener('click', function () { pick(i); release(); });
    li.addEventListener('focus', function () { pick(i); });
    li.addEventListener('blur', release);
  });

  show(0);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { seen = es[0].isIntersecting; if (seen) run(); else stop(); }, { threshold: 0.35 }).observe(box);
  }
  d.addEventListener('visibilitychange', function () { if (d.hidden) stop(); else run(); });
})();
