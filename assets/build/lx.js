/* lx: "Built in layers, paid in stages" as a scroll-through, from a drawing to the keys (designs/13-your-build).
   The stage (the 3D house, the step card and the step list) is pinned with CSS sticky. Under it run ten invisible
   steps, one per screen of scrolling, holding the real text for screen readers and no-JS readers. Whichever step
   crosses the middle of the screen is the current one: the card and the list follow it, the section gets
   data-step (CSS: the paper for the drawing, dusk at the keys), and the 3D house hears an 'lx-step' event.
   No scroll listener and no scroll-jacking: one IntersectionObserver on a line across the middle of the screen. */
(function () {
  var d = document, sec = d.getElementById('layers');
  if (!sec || !sec.classList.contains('lx') || !('IntersectionObserver' in window)) return;
  var steps = [].slice.call(sec.querySelectorAll('.lx-steps > li'));
  var links = [].slice.call(sec.querySelectorAll('.lx-index a'));
  var card = sec.querySelector('.lx-card');
  if (!steps.length || !card) return;
  var t = card.querySelector('.lx-t'), x = card.querySelector('.lx-x'), n = card.querySelector('.lx-n'), paid = card.querySelector('.lx-paid'), cta = card.querySelector('.lx-cta');
  var total = steps.length, cur = -1, swapT = 0;
  sec.classList.add('lx-on');

  function show(i) {
    if (i === cur) return;
    cur = i;
    var li = steps[i];
    sec.dataset.step = i;
    sec.style.setProperty('--lx-p', (i / (total - 1)).toFixed(3));
    links.forEach(function (a, k) { if (k === i) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current'); a.classList.toggle('done', k < i); });
    /* the card's words change behind a short fade */
    card.classList.add('swap');
    clearTimeout(swapT);
    swapT = setTimeout(function () {
      t.textContent = li.querySelector('h3').textContent;
      x.textContent = li.querySelector('p').textContent;
      paid.textContent = 'Paid at: ' + li.getAttribute('data-pay');
      n.textContent = (i < 9 ? '0' : '') + (i + 1) + ' / ' + (total < 10 ? '0' : '') + total;
      cta.tabIndex = i === total - 1 ? 0 : -1;
      card.classList.remove('swap');
    }, 220);
    var ev; try { ev = new CustomEvent('lx-step', { detail: i }); } catch (e) { ev = d.createEvent('CustomEvent'); ev.initCustomEvent('lx-step', false, false, i); }
    sec.dispatchEvent(ev);
  }

  var hit = [];
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { hit[steps.indexOf(e.target)] = e.isIntersecting; });
    var i = -1; for (var k = 0; k < total; k++) if (hit[k]) i = k;
    if (i < 0) {
      /* between steps or outside the run: keep the nearest end */
      var r = steps[0].getBoundingClientRect();
      i = r.top > innerHeight / 2 ? 0 : cur < 0 ? 0 : cur;
    }
    show(i);
  }, { rootMargin: '-50% 0px -50% 0px' });
  steps.forEach(function (li) { io.observe(li); });
  show(0);
})();
