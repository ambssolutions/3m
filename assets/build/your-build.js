/* your-build: the chapter line in "A build in five chapters" draws one segment per chapter.
   A chapter switches on once its top passes about 58% of the screen (IntersectionObserver class change only,
   nothing tied to the scroll position). A jump (nav link, reload mid-page) still draws in order, one step at a time.
   Without JS, without IntersectionObserver or under reduced motion the line simply shows finished.
   The hero needs no script: its cards deal out with CSS, and s-modern.js already marks it live while on screen. */
(function () {
  var sec = document.getElementById('process'); if (!sec) return;
  var list = sec.querySelector('.yb-chapters'), items = [].slice.call(sec.querySelectorAll('.yb-chap'));
  if (!list || !items.length || !('IntersectionObserver' in window)) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  list.classList.add('yb-live');
  var shown = 0, target = 0, timer = null;
  function step() {
    timer = null; if (shown >= target) return;
    items[shown].classList.add('on'); shown++;
    if (shown < target) timer = setTimeout(step, 320);
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting && e.boundingClientRect.top > 0) return;
      target = Math.max(target, items.indexOf(e.target) + 1); io.unobserve(e.target);
    });
    if (!timer) step();
  }, { rootMargin: '0px 0px -42% 0px' });
  items.forEach(function (it) { io.observe(it); });
})();
