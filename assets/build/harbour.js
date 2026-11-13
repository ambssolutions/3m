/* harbour: runs the footer harbour scene only while it is on screen and the tab is visible.
   Adds .hb-run to .foot-sky.harbour; the CSS keeps every animation paused without it.
   No scroll handlers. Reduced motion never gets the class (and the CSS removes the animations anyway). */
(function () {
  var d = document, sky = d.querySelector('.foot-sky.harbour');
  if (!sky || !('IntersectionObserver' in window)) return;
  var mq = matchMedia('(prefers-reduced-motion: reduce)'), on = false;
  function set() { sky.classList.toggle('hb-run', on && !d.hidden && !mq.matches); }
  new IntersectionObserver(function (es) { on = es[es.length - 1].isIntersecting; set(); }, { rootMargin: '60px 0px' }).observe(sky);
  d.addEventListener('visibilitychange', set);
  if (mq.addEventListener) mq.addEventListener('change', set);
})();
