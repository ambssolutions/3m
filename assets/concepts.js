/* 3M Construction concept switcher: a small floating control on every concept page
   to jump to the previous/next concept, open any concept, return to the gallery,
   and shortlist the current one. Rendered in a shadow root so it never inherits or
   leaks a concept's styles. Shortlist is shared with the gallery via localStorage. */
(function () {
  var CONCEPTS = [
    ['01-night-shift', 'Night Shift', 'Dark gradient, embossed'],
    ['02-blueprint', 'Blueprint', 'Drawing set'],
    ['03-site-diary', 'Site Diary', 'Editorial journal'],
    ['04-hard-hat', 'Hard Hat', 'Industrial blocks'],
    ['05-glasshouse', 'Glasshouse', 'Light and quiet'],
    ['06-before-after', 'Before and After', 'Comparison sliders'],
    ['07-control-room', 'Control Room', 'Status board'],
    ['08-timber', 'Timber', 'Warm and rounded'],
    ['09-skyline', 'Skyline', 'Cinematic chapters'],
    ['10-quote-builder', 'Quote Builder', 'Estimate stepper']
  ];
  var current = document.documentElement.getAttribute('data-concept');
  var i = CONCEPTS.findIndex(function (c) { return c[0] === current; });
  if (i < 0) return;
  var script = document.currentScript;
  var base = new URL('../', script ? script.src : location.href); // repo root
  var href = function (c) { return new URL('designs/' + c[0] + '/', base).href; };
  var n = CONCEPTS.length, cur = CONCEPTS[i], prev = CONCEPTS[(i + n - 1) % n], next = CONCEPTS[(i + 1) % n];
  var id = cur[0].slice(0, 2);
  var pad = function (k) { return String(k + 1).padStart(2, '0'); };

  var host = document.createElement('div');
  host.setAttribute('data-concept-switcher', '');
  var root = host.attachShadow({ mode: 'open' });
  root.innerHTML =
    '<style>' +
    ':host{all:initial}' +
    '.bar{position:fixed;left:16px;bottom:16px;z-index:2147483000;display:flex;align-items:center;gap:2px;' +
    'font:500 13px/1 Inter,system-ui,-apple-system,"Segoe UI",sans-serif;color:#fff;background:rgba(10,14,20,.92);' +
    'backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.14);border-radius:999px;' +
    'padding:4px;box-shadow:0 12px 32px -12px rgba(0,0,0,.5);transition:opacity .3s,transform .3s}' +
    '.bar.tuck{opacity:.35}.bar:hover,.bar:focus-within{opacity:1}' +
    '.bar.gone{opacity:0;pointer-events:none;transform:translate(-50%,24px)}' +
    'a,button{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 12px;border-radius:999px;color:#fff;white-space:nowrap}' +
    'a:hover,button:hover{background:rgba(255,255,255,.12)}' +
    'a:focus-visible,button:focus-visible{outline:2px solid #F2A91B;outline-offset:1px}' +
    '.arrow{width:34px;padding:0;justify-content:center;font-size:16px}' +
    '.tag{color:#F2A91B;font-weight:700}' +
    '.menu{position:absolute;left:0;bottom:calc(100% + 8px);min-width:260px;background:#0e1116;border:1px solid rgba(255,255,255,.14);' +
    'border-radius:16px;padding:6px;box-shadow:0 20px 40px -16px rgba(0,0,0,.6);display:none;max-height:70vh;overflow:auto}' +
    '.menu.open{display:block}' +
    '.menu a{display:flex;width:100%;box-sizing:border-box;height:auto;padding:9px 12px;border-radius:10px;justify-content:space-between;gap:16px}' +
    '.menu a[aria-current]{background:rgba(242,169,27,.22)}' +
    '.menu small{color:#A9B8AE;font-weight:400}' +
    '.menu hr{border:0;border-top:1px solid rgba(255,255,255,.12);margin:6px 4px}' +
    '.fav{width:34px;padding:0;justify-content:center}.fav svg{width:17px;height:17px}' +
    '.fav[aria-pressed="true"]{color:#F5C518}.fav[aria-pressed="true"] svg{fill:currentColor}' +
    '@media (max-width:760px){.bar{left:50%;transform:translateX(-50%);bottom:calc(76px + env(safe-area-inset-bottom))}.sub{display:none}}' +
    '@media print{.bar{display:none}}' +
    '</style>' +
    '<nav class="bar" aria-label="Design concepts">' +
    '<a class="arrow" href="' + href(prev) + '" aria-label="Previous concept: ' + prev[1] + '">&#8249;</a>' +
    '<button type="button" class="label" aria-expanded="false" aria-haspopup="true">' +
    '<span class="tag">' + pad(i) + '</span> ' + cur[1] + '<span class="sub">&nbsp;&middot; ' + cur[2] + '</span> <span aria-hidden="true">&#9662;</span></button>' +
    '<a class="arrow" href="' + href(next) + '" aria-label="Next concept: ' + next[1] + '">&#8250;</a>' +
    '<button type="button" class="fav" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5l2.6 5.3 5.9.9-4.25 4.1 1 5.85L12 16.9l-5.25 2.75 1-5.85L3.5 9.7l5.9-.9z"/></svg></button>' +
    '<div class="menu" role="menu">' +
    '<a role="menuitem" href="' + base.href + '">All concepts <small>gallery &amp; send your pick</small></a><hr>' +
    CONCEPTS.map(function (c, k) {
      return '<a role="menuitem" href="' + href(c) + '"' + (k === i ? ' aria-current="page"' : '') + '>' + pad(k) + ' &nbsp;' + c[1] + ' <small>' + c[2] + '</small></a>';
    }).join('') +
    '</div></nav>';

  var bar = root.querySelector('.bar'), btn = root.querySelector('button.label'), menu = root.querySelector('.menu'), fav = root.querySelector('.fav');

  // shortlist, shared with the gallery (same key and id format)
  var KEY = 'm3-shortlist';
  function getList() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } }
  function paintFav() {
    var on = getList().indexOf(id) > -1;
    fav.setAttribute('aria-pressed', on);
    fav.setAttribute('aria-label', (on ? 'Remove ' : 'Add ') + cur[1] + (on ? ' from' : ' to') + ' shortlist');
    fav.title = on ? 'Shortlisted' : 'Add to shortlist';
  }
  fav.addEventListener('click', function (e) {
    e.stopPropagation();
    var l = getList(), k = l.indexOf(id);
    if (k > -1) l.splice(k, 1); else l.push(id);
    l.sort();
    try { localStorage.setItem(KEY, JSON.stringify(l)); } catch (err) {}
    paintFav();
  });
  addEventListener('storage', function (e) { if (e.key === KEY) paintFav(); });
  addEventListener('pageshow', paintFav);
  paintFav();

  function close() { menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = !menu.classList.contains('open');
    menu.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    if (open) { var a = menu.querySelector('[aria-current]'); if (a) a.scrollIntoView({ block: 'nearest' }); }
  });
  document.addEventListener('click', close);
  root.addEventListener('keydown', function (e) { if (e.key === 'Escape') { close(); btn.focus(); } });

  // inside the gallery's preview frames the gallery already provides controls
  var framed = false; try { framed = window.self !== window.top; } catch (e) { framed = true; }
  if (framed) return;

  // fade a little while scrolling down so it never blocks content
  // hide while scrolling down (fully on phones, faded on desktop); show again on scroll up or near the end
  var lastY = scrollY, ticking = false, phone = matchMedia('(max-width:760px)');
  addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = scrollY, down = y > lastY && y > 200, nearEnd = innerHeight + y > document.documentElement.scrollHeight - 160;
      bar.classList.toggle(phone.matches ? 'gone' : 'tuck', down && !nearEnd);
      if (!phone.matches) bar.classList.remove('gone');
      lastY = y; ticking = false;
    });
  }, { passive: true });

  // mount after the page has loaded and gone idle so it never competes with the page's own first paint
  function mount() { document.body.appendChild(host); }
  function idle() { ('requestIdleCallback' in window) ? requestIdleCallback(mount, { timeout: 2500 }) : setTimeout(mount, 1200); }
  if (document.readyState === 'complete') idle(); else addEventListener('load', idle);
})();
