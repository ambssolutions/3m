/* book: "A build in five chapters" as a book whose pages turn as you scroll. Linked before your-build.js.
   The book stays in the middle of the screen (CSS sticky) while its tall wrapper scrolls by, one stretch of about 80% of
   a screen per page. Crossing from one stretch into the next turns the page over on its own: a timed CSS transition on
   the page's transform (1.1s, a soft ease-in-out), not tied to the finger, so it always runs at the same
   smooth pace. Scrolling back across the line turns it back. A quick flick across several lines queues the turns 180ms
   apart, so the pages fan over one after another. No scroll listeners: one IntersectionObserver on five invisible
   markers (one per stretch) says which page the reader is on.
   This script runs once at load and then only on those observer callbacks and the timers of the turns:
   - it sets each chapter's line drawing in an embossed tile (.bk-tile) and copies it onto the back of the page before it
     (and onto the first left-hand page), so after a turn the spread reads "drawing N | chapter N". The copies are
     aria-hidden; the chapter text stays once. The strokes take a navy-to-accent gradient defined here from the theme.
   - per page it sets .bk-t (turned), .bk-mv with .bk-t or .bk-u (turning over, or back), .bk-wc (its own layer: only a
     page in motion, promoted two frames before its turn starts and released when it lands) and .bk-hf / .bk-hb (front or back face out of sight: drawn as nothing, switched instantly
     when a turn ends). The layer is ready before a turn starts, and nothing inside a turning page repaints.
   - once a page has landed and the book is still, its tiles get .bk-on: the drawing draws itself in and plays its one
     detail. Each plays once.
   Only when motion is allowed (and the browser has the CSS this book was built and tested with); otherwise
   your-build.js runs the plain timeline as before. */
(function () {
  var d = document, sec = d.getElementById('process');
  if (!sec || !window.CSS || !CSS.supports('animation-timeline: view()') || matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  var tl = sec.querySelector('.yb-tl'), book = sec.querySelector('.bk-book'), items = [].slice.call(sec.querySelectorAll('.yb-chap'));
  if (!tl || !book || items.length < 2) return;
  var tiles = [].slice.call(sec.querySelectorAll('.en-fc')), n = items.length, art = [], pages = [];
  function el(tag, c) { var e = d.createElement(tag); e.className = c; e.setAttribute('aria-hidden', 'true'); return e; }
  function tile(svg, i) { var t = el('span', 'bk-tile bk-t' + (i + 1)); svg.classList.add('bk-a' + (i + 1)); svg.parentNode.insertBefore(t, svg); t.appendChild(svg); (pages[i] = pages[i] || []).push(t); return t; }
  function verso(i, c) { var p = el('div', 'bk-pg ' + c), a = art[i].cloneNode(true); p.appendChild(a); tile(a, i); return p; }
  /* the stroke gradients: user space of the drawings' 240x180 view box, stop colours from the theme in book.css */
  var defs = d.createElement('div');
  defs.innerHTML = '<svg class="bk-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>' +
    '<linearGradient id="bk-g-ink" gradientUnits="userSpaceOnUse" x1="20" y1="10" x2="220" y2="170"><stop offset="0" class="s0"/><stop offset="1" class="s1"/></linearGradient>' +
    '<linearGradient id="bk-g-acc" gradientUnits="userSpaceOnUse" x1="20" y1="10" x2="220" y2="170"><stop offset="0" class="s2"/><stop offset="1" class="s3"/></linearGradient></defs></svg>';
  book.appendChild(defs.firstChild);
  items.forEach(function (it, i) { art[i] = it.querySelector('.yb-art'); });
  var base = verso(0, 'bk-base'), marks = [];
  base.appendChild(el('i', 'bk-lc'));
  book.insertBefore(base, book.firstChild);
  items.forEach(function (it, i) {
    if (i) it.querySelector('.yb-card').appendChild(el('i', 'bk-c'));
    if (i < n - 1) {
      var b = verso(i + 1, 'bk-back'); b.appendChild(el('i', 'bk-bs')); if (i < n - 2) b.appendChild(el('i', 'bk-lc'));
      it.appendChild(b);
    }
    tile(art[i], i);
    var m = el('i', 'bk-mk'); m.style.setProperty('--k', i); tl.appendChild(m); marks.push(m);
  });
  sec.classList.add('bk-on', 'yb-tiles');

  /* ---------- the turns ---------- */
  var DUR = 1100, GAP = 180;
  var shown = 0, want = 0, moving = {}, token = [], timer = null;
  function cls(e, c, on) { if (e.classList.contains(c) !== on) e.classList.toggle(c, on); }
  /* which faces can be seen: the top page of each pile, any page in motion, and whatever a page in motion uncovers */
  var spread = matchMedia('(min-width:1000px)');
  function sync() {
    var sp = spread.matches;   /* faces are hidden only on the spread (book.css); on phones nothing else needs to change */
    items.forEach(function (it, j) {
      if (sp) {
        cls(it, 'bk-hf', !(j === shown || moving[j] || moving[j - 1]));
        cls(it, 'bk-hb', !(j === shown - 1 || moving[j] || moving[j + 1]));
      }
      /* a layer only while it turns */
      cls(it, 'bk-wc', !!moving[j]);
    });
    if (sp) cls(base, 'bk-hb', !(shown === 0 || moving[0]));
  }
  function draw(k) { if (pages[k]) pages[k].forEach(function (t) { t.classList.add('bk-on'); }); }
  function move(j, fwd) {
    var it = items[j], tk = token[j] = (token[j] || 0) + 1, ready = !!moving[j];
    moving[j] = true; sync();
    function turn() { if (token[j] !== tk) return; it.classList.remove('bk-pre'); it.classList.add('bk-mv'); cls(it, 'bk-u', !fwd); cls(it, 'bk-t', fwd); }
    /* promoted two frames ahead (.bk-pre: set in place without a transition), so its layer is drawn before it moves; a
       page reversing mid-turn is already a layer and turns back at once */
    if (ready) turn(); else { it.classList.add('bk-pre'); requestAnimationFrame(function () { requestAnimationFrame(turn); }); }
    setTimeout(function () {
      if (token[j] !== tk) return;
      delete moving[j]; it.classList.remove('bk-mv', 'bk-u'); sync();   /* landed: hide what is covered, release layers */
      settle();
    }, DUR + (ready ? 60 : 100));
  }
  /* the drawing plays once the book is still: the last turn has landed and nothing more is queued (on a flick, only the
     page the reader stops on draws, after the pages have fanned over) */
  function settle() { if (!timer && shown === want && !Object.keys(moving).length) { draw(shown); fill(shown); } }
  /* the tiles over the photo fill up to the page reached; changed while the book is still, so they never repaint mid-turn */
  function fill(k) { tiles.forEach(function (t, i) { cls(t, 'rd', i <= k); }); }
  function step() {
    timer = null;
    if (want > shown) { move(shown, true); shown++; }
    else if (want < shown) { shown--; move(shown, false); }
    else return settle();
    timer = setTimeout(step, GAP);
  }
  function go(k) { want = k; if (!timer) step(); }
  sync();

  var on = marks.map(function () { return false; }), first = true;
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { on[marks.indexOf(e.target)] = e.isIntersecting; });
    for (var k = n - 1; k >= 0; k--) if (on[k]) {
      if (first) {
        /* a reload or a jump into the middle of the book: open it at that page without turning, then carry on */
        first = false; book.classList.add('bk-now'); shown = want = k;
        items.forEach(function (it, j) { cls(it, 'bk-t', j < k); });
        sync(); fill(k);
        requestAnimationFrame(function () { requestAnimationFrame(function () { book.classList.remove('bk-now'); draw(k); }); });
      } else go(k);
      break;
    }
  }, { rootMargin: '-50% 0px -49% 0px' });
  marks.forEach(function (m) { io.observe(m); });
})();
