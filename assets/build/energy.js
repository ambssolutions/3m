/* energy: carries the hero's arrival down the page. Linked after your-build.js and before flair.js.
   One IntersectionObserver, class changes only, nothing tied to the scroll position: as each marked block comes into
   view it gets .en-in once (the cover cards rise and their chapter cards deal out, the sketch sheet is laid down, the site office cards' rows
   deal in).
   html.en is set only when motion is allowed, so without the script, under reduced motion or without
   IntersectionObserver everything shows in its finished state. The other arrivals ride on the page's own .rv / .in
   classes and need no script here. */
(function () {
  var d = document, R = d.documentElement;
  if (!('IntersectionObserver' in window)) return;
  /* the sticky "Chapter 3 of 5" marker leaves with the chapters: once the projects section is well up the screen the
     process section gets .en-past and the marker fades out (and back in on the way up). Runs under reduced motion too. */
  var proc = d.getElementById('process'), next = d.getElementById('projects');
  if (proc && next) new IntersectionObserver(function (es) {
    var e = es[0]; proc.classList.toggle('en-past', e.isIntersecting || e.boundingClientRect.top < 0);
  }, { rootMargin: '0px 0px -40% 0px' }).observe(next);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var els = [].slice.call(d.querySelectorAll('.en-door, #sketch .sk-sheet, #contact .qc-aside>div'));
  if (!els.length) return;
  /* anything already on screen (a reload part-way down) shows finished, so nothing blinks out and back */
  var vh = innerHeight;
  els.forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < vh * 0.88 && r.bottom > 0) el.classList.add('en-in'); });
  R.classList.add('en');
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('en-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px' });
  els.forEach(function (el) { if (!el.classList.contains('en-in')) io.observe(el); });
})();
