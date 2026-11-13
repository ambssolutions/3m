/* s-modern: the two background blobs drift only while their section is on screen and the tab is visible.
   Nothing runs under reduced motion or on low-power phones (html.lite). */
(function () {
  var d = document, root = d.documentElement;
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var els = [].slice.call(d.querySelectorAll('.hero,#contact')), seen = [];
  function sync() { els.forEach(function (el, i) { el.classList.toggle('m-live', !!seen[i] && !d.hidden && !root.classList.contains('lite')); }); }
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { seen[els.indexOf(e.target)] = e.isIntersecting; }); sync(); });
  els.forEach(function (el) { io.observe(el); });
  d.addEventListener('visibilitychange', sync);
})();
