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
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var prog = tl.querySelector('.yb-prog'), num = prog && prog.querySelector('b'), dots = prog ? [].slice.call(prog.querySelectorAll('.yb-dots i')) : [];
  tl.classList.add('yb-js');

  /* reached, in order */
  var shown = 0, target = 0, timer = null;
  function step() {
    timer = null; if (shown >= target) return;
    items[shown].classList.add('on'); if (dots[shown]) dots[shown].classList.add('on'); shown++;
    if (shown < target) timer = setTimeout(step, 320);
  }
  function reach(n) { if (n > target) { target = n; if (!timer) step(); } }
  if (reduce) { items.forEach(function (it, i) { it.classList.add('on'); if (dots[i]) dots[i].classList.add('on'); }); shown = target = items.length; }
  else {
    list.classList.add('yb-live');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting && e.boundingClientRect.top > 0) return;
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
