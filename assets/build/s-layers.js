/* s-layers: owned by the layers section builder.
   When the drawing comes into view, the five layers float apart with their labels, hold, then settle into one
   house. Hover and keyboard focus on a stage are pure CSS (:has), so they also work without this file.
   Nothing runs under reduced motion, on low-power phones, or without IntersectionObserver: the finished house shows. */
(function () {
  var d = document, sec = d.getElementById('layers');
  if (!sec) return;
  var model = sec.querySelector('.layers-model');
  if (!model) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || d.documentElement.classList.contains('lite') || !('IntersectionObserver' in window)) return;

  var HOLD = 5400, timer = null;
  function play() {
    model.classList.add('apart');
    timer = setTimeout(function () { model.classList.remove('apart'); timer = null; }, HOLD);
  }
  var io = new IntersectionObserver(function (es) {
    if (es[0].isIntersecting && !d.hidden) { io.disconnect(); play(); }
  }, { threshold: 0.5 });
  io.observe(model);
})();
