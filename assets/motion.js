/* 3M Construction: the animation layer. Loaded deferred after GSAP, ScrollTrigger and Lenis (self-hosted).
   Everything here is additive: if this file or GSAP fails to load, the page still shows and works.
   Only transform, opacity and clip-path are animated. Nothing is pinned or scroll-jacked.
   Reduced motion: this file does nothing. Low-power phones: no smooth scroll, no magnetic buttons, no spotlight. */
(function () {
  var d = document, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !window.gsap) return;
  var fine = matchMedia('(pointer:fine)').matches;
  var EASE = 'expo.out';
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---- smooth scroll on mouse and trackpad only ---- */
  var lenis = null;
  if (fine && window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on('scroll', function () { if (window.ScrollTrigger) ScrollTrigger.update(); });
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    d.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href'); if (id.length < 2) return;
        var el = d.querySelector(id); if (!el) return;
        e.preventDefault(); lenis.scrollTo(el, { offset: -86, duration: 1.4 }); history.pushState(null, '', id);
      });
    });
  }

  /* ---- text splitting (the heading keeps its full text in aria-label) ---- */
  function splitWords(el) {
    var text = el.textContent.trim(); el.setAttribute('aria-label', text); el.textContent = '';
    text.split(/\s+/).forEach(function (word, i) {
      var w = d.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
      var inner = d.createElement('span'); inner.className = 'wi'; inner.textContent = word;
      w.appendChild(inner); el.appendChild(w); if (i < text.split(/\s+/).length - 1) el.appendChild(d.createTextNode(' '));
    });
    return el.querySelectorAll('.wi');
  }
  function splitChars(line) {
    var text = line.textContent.trim(); line.setAttribute('aria-label', text); line.textContent = '';
    var chars = [];
    text.split(/\s+/).forEach(function (word, i, arr) {
      var w = d.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
      word.split('').forEach(function (ch) { var c = d.createElement('span'); c.className = 'c'; c.textContent = ch; w.appendChild(c); chars.push(c); });
      line.appendChild(w); if (i < arr.length - 1) line.appendChild(d.createTextNode(' '));
    });
    return chars;
  }
  /* keep one continuous gradient across split characters of a gradient line */
  function paintGradient(line, chars) {
    var lw = line.getBoundingClientRect(); if (!lw.width) return;
    chars.forEach(function (c) {
      var r = c.getBoundingClientRect();
      c.style.backgroundImage = 'linear-gradient(135deg,#FFC860 0%,#F2A91B 48%,#E8641B 100%)';
      c.style.backgroundSize = lw.width + 'px ' + lw.height + 'px';
      c.style.backgroundPosition = (lw.left - r.left) + 'px ' + (lw.top - r.top) + 'px';
      c.style.webkitBackgroundClip = 'text'; c.style.backgroundClip = 'text'; c.style.color = 'transparent';
    });
  }

  /* ---- hero: characters rise and settle, then the lede and buttons (CSS) follow ---- */
  var h1 = d.getElementById('h1');
  if (h1) {
    var lines = h1.querySelectorAll('.ln'), all = [];
    lines.forEach(function (ln) {
      var isGrad = ln.classList.contains('gtext'); var chars = splitChars(ln);
      if (isGrad) { ln.classList.remove('gtext'); paintGradient(ln, chars); addEventListener('resize', function () { paintGradient(ln, chars); }); if (d.fonts) d.fonts.ready.then(function () { paintGradient(ln, chars); }); }
      all = all.concat(chars);
    });
    gsap.set(all, { yPercent: 110, opacity: 0, rotateX: -50, transformOrigin: '50% 100%' });
    gsap.to(all, { yPercent: 0, opacity: 1, rotateX: 0, duration: 1.3, ease: EASE, stagger: { each: 0.028, from: 'start' }, delay: 0.15, onComplete: function () { gsap.set(all, { clearProps: 'rotateX,transform' }); if (lines[1]) paintGradient(lines[1], lines[1].querySelectorAll('.c')); } });
  }

  /* ---- section headings: words rise as the section arrives ---- */
  if (window.ScrollTrigger) {
    d.querySelectorAll('h2.split').forEach(function (h) {
      var words = splitWords(h);
      gsap.set(words, { yPercent: 105 });
      ScrollTrigger.create({ trigger: h, start: 'top 88%', once: true, onEnter: function () { gsap.to(words, { yPercent: 0, duration: 1.1, ease: EASE, stagger: 0.07 }); } });
    });
    /* ticked lists, stage cards and form fields arrive in sequence */
    d.querySelectorAll('.stage, .people-text, .panel-body, form[data-enquiry], .aside').forEach(function (box) {
      var items = box.querySelectorAll('.tick li, .who, label, .row, .btn, h3, ol, p');
      if (!items.length) return;
      gsap.set(items, { y: 16, opacity: 0 });
      ScrollTrigger.create({ trigger: box, start: 'top 85%', once: true, onEnter: function () { gsap.to(items, { y: 0, opacity: 1, duration: 1, ease: EASE, stagger: 0.06 }); } });
    });
    /* project cards and team photos */
    d.querySelectorAll('.photos figure').forEach(function (fig, i) {
      gsap.set(fig, { y: 30, opacity: 0, scale: 0.98 });
      ScrollTrigger.create({ trigger: fig, start: 'top 90%', once: true, onEnter: function () { gsap.to(fig, { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: EASE, delay: i * 0.12 }); } });
    });
    /* footer: the logo tile lights up when the footer arrives */
    var fl = d.querySelector('.foot .logo');
    if (fl) { gsap.set(fl, { opacity: 0, y: 14 }); ScrollTrigger.create({ trigger: fl, start: 'top 95%', once: true, onEnter: function () { gsap.to(fl, { opacity: 1, y: 0, duration: 1.2, ease: EASE }); } }); }
  }

  /* ---- services panel: each change wipes the photo in and staggers the ticks ---- */
  function panelIn(panel) {
    if (!panel) return;
    var img = panel.querySelector('img'), items = panel.querySelectorAll('.panel-body > *, .tick li');
    gsap.killTweensOf([img, items]);
    gsap.fromTo(img, { clipPath: 'inset(0 0 100% 0)', scale: 1.0 }, { clipPath: 'inset(0 0 0% 0)', duration: 1.1, ease: EASE });
    gsap.fromTo(items, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: EASE, stagger: 0.05, delay: 0.15 });
  }
  d.addEventListener('panelchange', function (e) { panelIn(e.detail); });

  /* ---- cursor spotlight on raised surfaces (fine pointers only) ---- */
  if (fine) {
    d.querySelectorAll('.spot').forEach(function (el) {
      el.addEventListener('pointermove', function (e) { var r = el.getBoundingClientRect(); el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px'); }, { passive: true });
    });
    /* magnetic buttons: the button leans toward the cursor and springs back */
    d.querySelectorAll('.mag').forEach(function (b) {
      var x = gsap.quickTo(b, 'x', { duration: 0.6, ease: 'power3.out' }), y = gsap.quickTo(b, 'y', { duration: 0.6, ease: 'power3.out' });
      b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); x((e.clientX - (r.left + r.width / 2)) * 0.22); y((e.clientY - (r.top + r.height / 2)) * 0.22); }, { passive: true });
      b.addEventListener('pointerleave', function () { x(0); y(0); });
    });
    /* nav links: a tiny lift on hover */
    d.querySelectorAll('.nav > a:not(.btn)').forEach(function (a) {
      a.addEventListener('pointerenter', function () { gsap.to(a, { y: -2, duration: 0.4, ease: 'power2.out' }); });
      a.addEventListener('pointerleave', function () { gsap.to(a, { y: 0, duration: 0.6, ease: 'power2.out' }); });
    });
  }

  /* ---- projects filter: cards settle in after a filter change ---- */
  d.querySelectorAll('.filters button').forEach(function (b) {
    b.addEventListener('click', function () {
      var shown = [].filter.call(d.querySelectorAll('.card'), function (c) { return !c.classList.contains('hide'); });
      gsap.fromTo(shown, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: EASE, stagger: 0.06, clearProps: 'transform' });
    });
  });

  /* ---- tab buttons: a small press ---- */
  d.querySelectorAll('.tab').forEach(function (t) {
    t.addEventListener('click', function () { gsap.fromTo(t, { scale: 0.985 }, { scale: 1, duration: 0.7, ease: 'elastic.out(1,.6)', clearProps: 'transform' }); });
  });
})();
