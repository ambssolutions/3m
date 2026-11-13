/* your-build: "A build in five chapters".
   Two IntersectionObservers, class changes only, nothing tied to the scroll position:
   1. Reached: a chapter switches on (.on) once its top passes about 58% of the screen. Its badge settles, its connector and
      the spine segment below it draw, and its line drawing draws itself in. A jump (nav link, reload mid-page) still draws
      in order, one step at a time.
   2. Current: the chapter filling most of a band across the middle of the screen gets .cur. On laptops it stays at full
      strength while the others ease back a little, and the sticky "Chapter 3 of 5" marker follows it.
   Without JS everything shows finished and the marker stays hidden. Under reduced motion the current chapter and the marker
   still follow, but nothing draws: the spine, connectors and drawings show finished.
   The hero needs no script: its cards deal out with CSS, and s-modern.js already marks it live while on screen. */
(function () {
  var sec = document.getElementById('process'); if (!sec) return;
  var tl = sec.querySelector('.yb-tl'), list = sec.querySelector('.yb-chapters'), items = [].slice.call(sec.querySelectorAll('.yb-chap'));
  if (!tl || !list || !items.length || !('IntersectionObserver' in window)) return;
  if (sec.classList.contains('bk-on')) return; /* book.js turns the chapters as the pages of a book and keeps the count */
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var prog = tl.querySelector('.yb-prog'), num = prog && prog.querySelector('b'), dots = prog ? [].slice.call(prog.querySelectorAll('.yb-dots i')) : [];
  var tiles = [].slice.call(sec.querySelectorAll('.en-fc')); /* the five tiles over the photo: each is marked read (.rd) with its chapter */
  tl.classList.add('yb-js');

  /* reached, in order */
  var shown = 0, target = 0, timer = null;
  function step() {
    timer = null; if (shown >= target) return;
    items[shown].classList.add('on'); if (dots[shown]) dots[shown].classList.add('on'); if (tiles[shown]) tiles[shown].classList.add('rd'); shown++;
    if (shown < target) timer = setTimeout(step, 320);
  }
  function reach(n) { if (n > target) { target = n; if (!timer) step(); } }
  if (reduce) { items.forEach(function (it, i) { it.classList.add('on'); if (dots[i]) dots[i].classList.add('on'); }); shown = target = items.length; }
  else {
    list.classList.add('yb-live'); sec.classList.add('yb-tiles');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        /* below the screen, or not laid out yet (phones skip the section with content-visibility until it is near, and
           report an empty box): wait. Only a chapter already above the screen (a jump) counts as reached unseen. */
        if (!e.isIntersecting && (e.boundingClientRect.top > 0 || !e.boundingClientRect.height)) return;
        reach(items.indexOf(e.target) + 1); io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -42% 0px' });
    items.forEach(function (it) { io.observe(it); });
  }

  /* current: the most of each chapter inside the middle band wins */
  var inBand = items.map(function () { return 0; }), cur = -1, th = [];
  for (var t = 0; t <= 20; t++) th.push(t / 20);
  function setCur(i) {
    if (i === cur) return;
    if (cur >= 0) { items[cur].classList.remove('cur'); if (dots[cur]) dots[cur].classList.remove('cur'); }
    cur = i; items[i].classList.add('cur'); if (dots[i]) dots[i].classList.add('cur');
    if (num) num.textContent = i + 1;
    tl.classList.add('yb-focus');
    reach(i + 1);
  }
  var io2 = new IntersectionObserver(function (es) {
    es.forEach(function (e) { inBand[items.indexOf(e.target)] = e.isIntersecting ? e.intersectionRect.height : 0; });
    var best = -1, h = 0;
    inBand.forEach(function (v, i) { if (v > h) { h = v; best = i; } });
    if (best >= 0) setCur(best);
  }, { rootMargin: '-36% 0px -36% 0px', threshold: th });
  items.forEach(function (it) { io2.observe(it); });
})();

/* photos load ahead of the reader: once the page has loaded (so nothing competes with the first screen), any lazy photo
   within about three screens below the view, or one screen above, is switched to eager and starts downloading. The
   browser's own lazy margin is closer than that on fast connections, which is why photos could still arrive late on a phone. */
(function () {
  if (!('IntersectionObserver' in window)) return;
  function arm() {
    var imgs = [].slice.call(document.querySelectorAll('img[loading=lazy]')); if (!imgs.length) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.loading = 'eager'; io.unobserve(e.target); } });
    }, { rootMargin: '100% 0px 300% 0px' });
    imgs.forEach(function (i) { io.observe(i); });
  }
  function later() { if ('requestIdleCallback' in window) requestIdleCallback(arm, { timeout: 2000 }); else setTimeout(arm, 300); }
  if (document.readyState === 'complete') later(); else addEventListener('load', later, { once: true });
})();
