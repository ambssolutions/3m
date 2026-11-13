/* book: "A build in five chapters" as a book whose pages turn as you scroll. Linked before your-build.js.
   The turning itself is CSS only (book.css: a view timeline on the tall wrapper, one range per page). This script runs
   once at load and never on scroll:
   - it copies each chapter's line drawing onto the back of the page before it (and onto the first left-hand page), so
     after a turn the spread reads "drawing N | chapter N". The copies are aria-hidden; the chapter text stays once.
   - it adds the page shadows and five invisible markers inside the tall wrapper. One IntersectionObserver on the markers
     sets the "Chapter N of 5" count and keeps the tiles over the photo in step. Nothing else changes on the pages, so
     nothing repaints while they turn.
   Only when view timelines exist and motion is allowed; otherwise your-build.js runs the plain timeline as before. */
(function () {
  var d = document, sec = d.getElementById('process');
  if (!sec || !window.CSS || !CSS.supports('animation-timeline: view()') || matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  var tl = sec.querySelector('.yb-tl'), book = sec.querySelector('.bk-book'), items = [].slice.call(sec.querySelectorAll('.yb-chap'));
  if (!tl || !book || items.length < 2) return;
  var tiles = [].slice.call(sec.querySelectorAll('.en-fc')), num = book.querySelector('.bk-count b'), n = items.length;
  function el(tag, c) { var e = d.createElement(tag); e.className = c; e.setAttribute('aria-hidden', 'true'); return e; }
  function verso(i, c) { var p = el('div', 'bk-pg ' + c); p.appendChild(items[i].querySelector('.yb-art').cloneNode(true)); return p; }
  var base = verso(0, 'bk-base'), marks = [];
  base.appendChild(el('i', 'bk-lc'));
  book.insertBefore(base, book.firstChild);
  items.forEach(function (it, i) {
    if (i) it.querySelector('.yb-card').appendChild(el('i', 'bk-c'));
    if (i < n - 1) {
      var b = verso(i + 1, 'bk-back'); b.appendChild(el('i', 'bk-bs')); if (i < n - 2) b.appendChild(el('i', 'bk-lc'));
      it.appendChild(b);
    }
    var m = el('i', 'bk-mk'); m.style.setProperty('--k', i); tl.appendChild(m); marks.push(m);
  });
  sec.classList.add('bk-on', 'yb-tiles');

  var cur = -1, on = marks.map(function () { return false; });
  function setCur(k) {
    if (k === cur) return; cur = k;
    if (num) num.textContent = k + 1;
    tiles.forEach(function (t, i) { t.classList.toggle('rd', i <= k); });
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { on[marks.indexOf(e.target)] = e.isIntersecting; });
    for (var k = n - 1; k >= 0; k--) if (on[k]) { setCur(k); break; }
  }, { rootMargin: '-50% 0px -49% 0px' });
  marks.forEach(function (m) { io.observe(m); });
})();
