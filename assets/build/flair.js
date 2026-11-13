/* flair: the separate "flair" design of The Build. Runs only when <html> has .flair (set in the head for /home-2 or ?design=flair).
   Splits each section heading into masked words (the heading keeps its full text in aria-label), marks one gradient word,
   adds the gradient defs for the line drawings, then reveals headings and intros once (IntersectionObserver + CSS).
   The shimmer on the gradient word runs only while its heading is on screen and the tab is visible. No scroll-linked JS. */
(function () {
  var d = document, R = d.documentElement;
  if (!R.classList.contains('flair')) return;
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches, IO = 'IntersectionObserver' in window;
  var PICK = { services: 'build', sketch: 'home', people: 'people' };
  var $$ = function (s) { return [].slice.call(d.querySelectorAll(s)); };
  var heads = $$('.sec .sec-head h2'), grads = [];

  heads.forEach(function (h) {
    var txt = h.textContent.replace(/\s+/g, ' ').trim(), words = txt.split(' '), sec = h.closest('section');
    var want = PICK[sec && sec.id], gi = words.length - 1;
    if (want) words.forEach(function (w, i) { if (w.replace(/\W/g, '').toLowerCase() === want) gi = i; });
    h.setAttribute('aria-label', txt);
    h.textContent = '';
    words.forEach(function (w, i) {
      var o = d.createElement('span'), n = d.createElement('span');
      o.className = 'fw';
      o.setAttribute('aria-hidden', 'true');
      n.className = i === gi ? 'fi fg' : 'fi';
      n.style.setProperty('--i', i);
      n.textContent = w;
      o.appendChild(n);
      h.appendChild(o);
      if (i < words.length - 1) h.appendChild(d.createTextNode(' '));
      if (i === gi) grads.push(n);
    });
    h.parentNode.style.setProperty('--n', words.length);
  });

  /* gradient strokes for the line drawings: user-space gradients sized to each drawing's viewBox (flair.css colours the stops) */
  var g = function (id, w, h, a, b) {
    return '<linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="' + w + '" y2="' + h + '"><stop offset="0" class="' + a + '"/><stop offset="1" class="' + b + '"/></linearGradient>';
  };
  var box = d.createElement('div');
  box.innerHTML = '<svg id="fx-defs" width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute"><defs>' +
    g('fx-s-ink', 200, 120, 'a', 'b') + g('fx-s-acc', 200, 120, 'c', 'd') + g('fx-p-ink', 240, 180, 'e', 'b') + g('fx-p-acc', 240, 180, 'c', 'd') +
    '</defs></svg>';
  d.body.appendChild(box.firstChild);

  if (calm || !IO) return;
  R.classList.add('fx');

  /* once: add .fx-in as each heading block (and the one hairline) enters, then stop watching it */
  var once = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('fx-in');
      once.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  $$('#layers, .sec .sec-head').forEach(function (el) { once.observe(el); });

  /* shimmer: only while the heading is on screen, the tab is visible and the phone is not a low-power one */
  var seen = [];
  function sync() {
    grads.forEach(function (n, i) { n.classList.toggle('fx-live', !!seen[i] && !d.hidden && !R.classList.contains('lite')); });
  }
  var live = new IntersectionObserver(function (es) {
    es.forEach(function (e) { seen[heads.indexOf(e.target)] = e.isIntersecting; });
    sync();
  });
  heads.forEach(function (h) { live.observe(h); });
  d.addEventListener('visibilitychange', sync);
})();
