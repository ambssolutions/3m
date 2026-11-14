/* book: "A build in five chapters" as a book whose pages turn as you scroll. Linked before your-build.js.
   The turning itself is CSS only (book.css: a view timeline on the tall wrapper, one range per page). This script runs
   once at load and never on scroll:
   - it sets each chapter's line drawing in an embossed tile (.bk-tile) and copies it onto the back of the page before it
     (and onto the first left-hand page), so after a turn the spread reads "drawing N | chapter N". The copies are
     aria-hidden; the chapter text stays once. The strokes take a navy-to-accent gradient defined here from the theme.
   - it adds the page shadows and five invisible markers inside the tall wrapper, one for the still stretch of scroll
     between two turns. One IntersectionObserver on the markers marks the page that has landed: its tiles get .bk-on, so
     its drawing draws itself in and plays its one small detail, on a page that is not moving. It also keeps the tiles
     over the photo in step. Each drawing plays once; going back shows it finished.
   Only when view timelines exist and motion is allowed; otherwise your-build.js runs the plain timeline as before. */
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

  var cur = -1, on = marks.map(function () { return false; });
  function setCur(k) {
    if (k === cur) return; cur = k;
    tiles.forEach(function (t, i) { t.classList.toggle('rd', i <= k); });
    pages[k].forEach(function (t) { t.classList.add('bk-on'); });
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { on[marks.indexOf(e.target)] = e.isIntersecting; });
    for (var k = n - 1; k >= 0; k--) if (on[k]) { setCur(k); break; }
  }, { rootMargin: '-50% 0px -49% 0px' });
  marks.forEach(function (m) { io.observe(m); });
})();
