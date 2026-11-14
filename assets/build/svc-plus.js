/* svc-plus: the service cards in "In this issue: what we build".
   1. Each card's tile settles and its line drawing draws in once, when the card comes into view (a class change
      from an IntersectionObserver; the motion itself is CSS). Without JS or under reduced motion it shows finished.
   2. The photo slot holds two faces: the photo, and "A good fit if" with "Approvals". They crossfade on their own
      (photo about 5s, text about 7s, the four cards staggered) while the card is on screen and readable. The loop
      waits while the pointer is over the card, while keyboard focus is inside it, in hidden tabs, and, on the
      stacking cards, while a later card covers it (only the top card fades). The "Approvals and fit" button
      switches to the text and holds it there until pressed again or the card leaves the screen; Escape goes back
      to the photo. Under reduced motion nothing fades by itself and the button swaps the faces at once. Without JS
      the text shows in flow. The fade itself is CSS (.sv-b on the card), opacity and a 6px rise only.
   3. "Talk to us about ..." keeps its normal jump to the enquiry form and ticks the matching job type there.
   4. Stacking cards are CSS only; if a card's words would not fit the screen, .sv-flat puts the cards back in flow. */
(function () {
  var d = document, sec = d.getElementById('services'); if (!sec) return;
  var cards = [].slice.call(sec.querySelectorAll('.sv-card')); if (!cards.length) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var IO = 'IntersectionObserver' in window;
  var FRONT = 5000, BACK = 7000, FADE = 1000, STAGGER = 2200;
  var STACK = matchMedia('(min-width:1000px) and (min-height:700px)');

  /* 1. drawings */
  if (!reduce && IO) {
    sec.classList.add('sv-live');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.closest('.sv-card').classList.add('on'); io.unobserve(e.target);
      });
    }, { threshold: .6 });
    cards.forEach(function (c) { var a = c.querySelector('.sv-head'); if (a) io.observe(a); else c.classList.add('on'); });
  }

  /* 2. the two-sided photo slot */
  sec.classList.add('sv-folds');
  var auto = !reduce && IO, raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };
  var S = [];
  cards.forEach(function (c, i) {
    var x = c.querySelector('.sv-xtra'), fig = c.querySelector('.sv-fig'); if (!x || !fig) return;
    var b = d.createElement('button');
    b.type = 'button'; b.className = 'sv-more';
    b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', x.id);
    b.innerHTML = '<span>Approvals and fit</span><i aria-hidden="true"></i>';
    x.parentNode.insertBefore(b, x);
    var s = { c: c, b: b, fig: fig, back: false, busy: false, hold: false, hover: false, focus: false, vis: false, cover: false, left: FRONT + (i % 2) * STAGGER, due: 0, t: 0 };
    S.push(s);
    b.addEventListener('click', function () {
      s.hold = !s.back;
      turn(s, !s.back);
    });
    c.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !s.back) return;
      s.hold = false; turn(s, false); b.focus();
    });
    c.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { s.hover = true; sync(s); } });
    c.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { s.hover = false; sync(s); } });
    c.addEventListener('focusin', function () { s.focus = true; sync(s); });
    c.addEventListener('focusout', function (e) { if (!c.contains(e.relatedTarget)) { s.focus = false; sync(s); } });
  });

  /* switch one card to the text (true) or the photo (false): a 1s crossfade in CSS; animate = false swaps at once */
  function turn(s, toBack, animate) {
    if (s.back === toBack) return;
    stop(s);
    var c = s.c;
    s.back = toBack;
    s.b.setAttribute('aria-expanded', toBack ? 'true' : 'false');
    clearTimeout(s.f);
    if (animate === false) {
      c.classList.add('sv-snap');
      c.classList.toggle('sv-b', toBack);
      void c.offsetWidth;
      c.classList.remove('sv-snap');
      s.busy = false; s.left = toBack ? BACK : FRONT; sync(s);
      return;
    }
    c.classList.toggle('sv-b', toBack);
    if (reduce) { s.busy = false; s.left = toBack ? BACK : FRONT; return; }
    s.busy = true;
    s.f = setTimeout(function () { s.busy = false; s.left = s.back ? BACK : FRONT; sync(s); }, FADE);
  }
  function can(s) { return auto && !d.hidden && s.vis && !s.cover && !s.hold && !s.hover && !s.focus && !s.busy; }
  function stop(s) { if (s.t) { clearTimeout(s.t); s.t = 0; s.left = Math.max(s.due - Date.now(), 0); } }
  function sync(s) {
    if (!can(s)) { stop(s); return; }
    if (s.t) return;
    var wait = Math.max(s.left, 1200);
    s.due = Date.now() + wait;
    s.t = setTimeout(function () { s.t = 0; s.left = 0; turn(s, !s.back); }, wait);
  }
  function all() { S.forEach(sync); }

  if (IO && S.length) {
    /* on screen: half the card showing, or half the screen filled by it (a phone card is taller than the screen);
       off screen: none of it (a held or turned card resets to the photo) */
    var seen = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var s = S.filter(function (z) { return z.c === e.target; })[0]; if (!s) return;
        var h = e.intersectionRect.height;
        s.vis = e.isIntersecting && (h >= e.boundingClientRect.height * .5 || h >= innerHeight * .5);
        if (!e.isIntersecting && (s.back || s.hold)) { s.hold = false; turn(s, false, false); }
        sync(s);
      });
    }, { threshold: [0, .1, .2, .3, .4, .5, .6, .7, .8, .9, 1] });
    S.forEach(function (s) { seen.observe(s.c); });

    /* stacking cards: a card is covered once a later card overlaps it; covered cards go back to the photo */
    var near = false, pend = false;
    function cover() {
      pend = false;
      var stacked = STACK.matches && !sec.classList.contains('sv-flat');
      var r = S.map(function (s) { return s.c.getBoundingClientRect(); });
      S.forEach(function (s, i) {
        var cov = false;
        if (stacked) for (var j = i + 1; j < S.length; j++) if (r[j].top < r[i].bottom - 4) { cov = true; break; }
        if (cov === s.cover) return;
        s.cover = cov;
        if (cov) { s.hold = false; if (s.back) turn(s, false); }
        sync(s);
      });
    }
    function onScroll() { if (near && !pend) { pend = true; raf(cover); } }
    new IntersectionObserver(function (es) { near = es[0].isIntersecting; if (near) onScroll(); }, { rootMargin: '200px 0px' }).observe(sec);
    addEventListener('scroll', onScroll, { passive: true });
    d.addEventListener('visibilitychange', all);
  }

  /* 3. preselect the job type on the enquiry card */
  var form = d.getElementById('quote');
  sec.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-job]'); if (!a || !form) return;
    var job = a.getAttribute('data-job'), r = null;
    [].forEach.call(form.querySelectorAll('input[name="type"]'), function (x) { if (x.value === job) r = x; });
    if (!r) return;
    if (!r.checked) { r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); }
    setTimeout(function () { try { r.focus({ preventScroll: true }); } catch (err) {} }, 0);
  });

  /* 4. stacking only when every card fits the screen */
  var t = null;
  function fit() {
    sec.classList.remove('sv-flat');
    if (!STACK.matches) return;
    var over = cards.some(function (c) { return c.scrollHeight > c.clientHeight + 2; });
    sec.classList.toggle('sv-flat', over);
  }
  fit();
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(fit);
  addEventListener('resize', function () { clearTimeout(t); t = setTimeout(function () { fit(); if (typeof onScroll === 'function') onScroll(); }, 200); });
})();
