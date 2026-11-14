/* svc-plus: the service cards in "In this issue: what we build".
   1. Each card's tile settles and its line drawing draws in once, when the card comes into view (a class change
      from an IntersectionObserver; the motion itself is CSS). Without JS or under reduced motion it shows finished.
   2. "A good fit if" and "Approvals" sit behind one "Approvals and fit" toggle per card: in place on phones and
      tablets, as a panel over the photo on laptops. Escape closes an open panel. Without JS they simply show.
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
    cards.forEach(function (c) { var a = c.querySelector('.sv-head'); if (a) io.observe(a); else c.classList.add('on'); });
  }

  /* 2. the "Approvals and fit" toggle */
  sec.classList.add('sv-folds');
  cards.forEach(function (c) {
    var x = c.querySelector('.sv-xtra'); if (!x) return;
    var b = d.createElement('button');
    b.type = 'button'; b.className = 'sv-more';
    b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', x.id);
    b.innerHTML = '<span>Approvals and fit</span><i aria-hidden="true"></i>';
    x.parentNode.insertBefore(b, x);
    c.classList.add('sv-shut');
    function set(open) {
      c.classList.toggle('sv-shut', !open);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    b.addEventListener('click', function () { set(c.classList.contains('sv-shut')); });
    c.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || c.classList.contains('sv-shut')) return;
      set(false); b.focus();
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
