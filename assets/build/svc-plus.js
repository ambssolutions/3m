/* svc-plus: the service cards in "In this issue: what we build".
   1. Each card's line drawing draws in once, when the card comes into view (a class change from an
      IntersectionObserver; the stroke itself is a CSS transition). Without JS or under reduced motion it shows finished.
   2. On phones, "Included" and "Approvals" fold behind one button per card. Without JS they simply show.
   3. "Talk to us about ..." keeps its normal jump to the enquiry form and ticks the matching job type there.
   4. Stacking cards are CSS only; if a card's words would not fit the screen, .sv-flat puts the cards back in flow. */
(function () {
  var d = document, sec = d.getElementById('services'); if (!sec) return;
  var cards = [].slice.call(sec.querySelectorAll('.sv-card')); if (!cards.length) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. drawings */
  if (!reduce && 'IntersectionObserver' in window) {
    sec.classList.add('sv-live');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.closest('.sv-card').classList.add('on'); io.unobserve(e.target);
      });
    }, { threshold: .6 });
    cards.forEach(function (c) { var a = c.querySelector('.sv-art'); if (a) io.observe(a); else c.classList.add('on'); });
  }

  /* 2. the phone fold */
  sec.classList.add('sv-folds');
  cards.forEach(function (c) {
    var inc = c.querySelector('.sv-inc'), ap = c.querySelector('.sv-appr'); if (!inc || !ap) return;
    var b = d.createElement('button');
    b.type = 'button'; b.className = 'sv-more';
    b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', inc.id + ' ' + ap.id);
    b.innerHTML = '<span>Included work and approvals</span><i aria-hidden="true"></i>';
    inc.parentNode.insertBefore(b, inc);
    c.classList.add('sv-shut');
    b.addEventListener('click', function () {
      var open = c.classList.toggle('sv-shut') === false;
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

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
  var STACK = matchMedia('(min-width:1000px) and (min-height:800px)'), t = null;
  function fit() {
    sec.classList.remove('sv-flat');
    if (!STACK.matches) return;
    var over = cards.some(function (c) { return c.scrollHeight > c.clientHeight + 2; });
    sec.classList.toggle('sv-flat', over);
  }
  fit();
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(fit);
  addEventListener('resize', function () { clearTimeout(t); t = setTimeout(fit, 200); });
})();
