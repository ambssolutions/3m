/* stages: one real photo per stage in "Built in layers, paid in stages" (designs/13-your-build), as a deck in 3D.
   Each photo's place in the deck is --k (0 at the front); the front photo leaving gets .out (it lifts off and fades),
   then rejoins the back unseen (.snap). While the panel is on screen and the tab is visible, the deck moves through
   the five stages (HOLD each; the movement itself is CSS, 1.4s). Hover, keyboard focus or a tap on a stage in the list brings
   its photo to the front and pauses the cycle; it picks up again a few seconds after the pointer leaves. The current stage is marked in the list (.cur).
   Reduced motion or Save-Data: no auto cycle, the list still chooses the photo. Without JS the first photo shows. */
(function () {
  var d = document, sec = d.getElementById('layers');
  var box = sec && sec.querySelector('[data-stage-photos]');
  if (!box) return;
  var figs = box.querySelectorAll('.lp-f'), bars = box.querySelectorAll('.lp-bar i'), items = sec.querySelectorAll('.layers-list li');
  var n = figs.length, outT = [];
  var HOLD = 4200, RESUME = 3000;
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches || (navigator.connection && navigator.connection.saveData);
  var cur = -1, timer = 0, seen = false, held = false, resumeT = 0;
  box.style.setProperty('--lp-hold', HOLD + 'ms');

  function place(f, k) { f.style.setProperty('--k', k); f.style.zIndex = n - k; }
  function show(i) {
    var prev = cur;
    cur = (i + n) % n;
    if (prev === cur) return;
    for (var k = 0; k < n; k++) {
      var f = figs[k], kk = (k - cur + n) % n;
      clearTimeout(outT[k]);
      f.classList.toggle('on', k === cur);
      if (k === prev && !calm) {
        /* the photo that was at the front lifts off, then rejoins the back of the deck */
        f.classList.add('out');
        outT[k] = setTimeout(function (f, kk) { return function () {
          f.classList.add('snap', 'hide'); f.classList.remove('out'); place(f, kk); void f.offsetWidth; f.classList.remove('snap', 'hide');
        }; }(f, kk), 1400);
      } else { f.classList.remove('out'); place(f, kk); }
      if (bars[k]) { bars[k].classList.toggle('done', k < cur); bars[k].classList.remove('now'); }
      if (items[k]) items[k].classList.toggle('cur', k === cur);
    }
    /* restart the fill on the current bar */
    if (bars[cur]) { void bars[cur].offsetWidth; bars[cur].classList.add('now'); }
    /* warm the next photo so its fade never waits on the network */
    var nx = figs[(cur + 1) % n].querySelector('img'); if (nx && nx.loading === 'lazy') nx.loading = 'eager';
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
