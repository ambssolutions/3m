/* hero-sydney: the hero's changing scenes of building work (concept 13). The first scene is in the markup and is the LCP; this adds the
   scenes named in .hero-img[data-scenes] once the page has loaded and the browser is idle, then crossfades them
   (opacity only, styles in hero-sydney.css). It runs only while the hero is on screen and the tab is visible.
   Reduced motion or Save-Data: nothing is loaded and the first scene stays. No scroll handlers. */
(function () {
  var d = document, box = d.querySelector('.hero-img[data-scenes]');
  if (!box || !('IntersectionObserver' in window)) return;
  var calm = matchMedia('(prefers-reduced-motion: reduce)'), net = navigator.connection;
  if (calm.matches || (net && net.saveData)) return;

  var HOLD = 4000, FADE = 1200;
  var src = box.querySelector('img').getAttribute('src'), dir = src.slice(0, src.lastIndexOf('/') + 1);
  var names = box.getAttribute('data-scenes').split(/\s+/), layers = [], k = 0, timer = 0, ready = false, seen = true;

  function build() {
    names.forEach(function (n) {
      var f = d.createElement('div');
      f.className = 'hs-scene';
      f.setAttribute('aria-hidden', 'true');
      f.innerHTML = '<picture><source media="(max-width:700px) and (orientation:portrait)" srcset="' + dir + n + '-portrait-800.webp" width="800" height="1200">' +
        '<img src="' + dir + n + '-1600.webp" srcset="' + dir + n + '-800.webp 800w, ' + dir + n + '-1600.webp 1600w, ' + dir + n + '-2400.webp 2400w" sizes="100vw" width="1600" height="900" alt="" decoding="async"></picture>';
      box.appendChild(f);
      layers.push(f);
    });
    Promise.all(layers.map(function (f) {
      var im = f.querySelector('img');
      return im.decode ? im.decode().catch(function () {}) : Promise.resolve();
    })).then(function () { ready = true; sync(); });
  }

  /* k is the scene on show: 0 is the photo in the markup, 1..n the added layers (later layers sit on top) */
  function step() {
    timer = 0;
    var n = layers.length;
    k = (k + 1) % (n + 1);
    if (k === 0) layers[n - 1].classList.remove('on');
    else {
      layers[k - 1].classList.add('on');
      if (k > 1) { var prev = layers[k - 2]; setTimeout(function () { prev.classList.remove('on'); }, FADE + 100); }
    }
    sync();
  }
  function sync() {
    var run = ready && seen && !d.hidden && !calm.matches;
    if (run && !timer) timer = setTimeout(step, HOLD + FADE);
    else if (!run && timer) { clearTimeout(timer); timer = 0; }
  }

  new IntersectionObserver(function (es) { seen = es[es.length - 1].isIntersecting; sync(); }).observe(box.closest('.hero') || box);
  d.addEventListener('visibilitychange', sync);
  if (calm.addEventListener) calm.addEventListener('change', sync);

  function later() { (window.requestIdleCallback || function (f) { setTimeout(f, 1); })(build, { timeout: 3000 }); }
  if (d.readyState === 'complete') setTimeout(later, 1200);
  else addEventListener('load', function () { setTimeout(later, 1200); });
})();
