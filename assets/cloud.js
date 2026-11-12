/* Night Shift showpiece: a point cloud that assembles into a two-storey house.
   Canvas 2D, a few thousand points projected in 3D, slowly rotating, easing toward the cursor on fine pointers.
   Runs only while the hero is on screen and the tab is visible. DPR capped at 1.5. Fewer points on phones.
   Reduced motion: draws the finished house once and stops. */
(function () {
  var canvas = document.querySelector('canvas.cloud'); if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d', { alpha: true });
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = matchMedia('(pointer:coarse)').matches;
  var low = coarse && (navigator.hardwareConcurrency || 8) <= 4;
  var N = low ? 700 : coarse ? 900 : 2600;
  var hero = canvas.closest('.hero') || canvas.parentElement;

  /* ---- the house: edges in 3D (x right, y up, z toward the viewer) ---- */
  var W = 1.0, D = 0.72, H = 0.58, R = 0.92;   /* half width, half depth, wall height, ridge height */
  var E = [];
  function edge(a, b, w) { E.push({ a: a, b: b, w: w || 1 }); }
  var c = [[-W, 0, D], [W, 0, D], [W, 0, -D], [-W, 0, -D], [-W, H, D], [W, H, D], [W, H, -D], [-W, H, -D]];
  edge(c[0], c[1]); edge(c[1], c[2]); edge(c[2], c[3]); edge(c[3], c[0]);          /* slab */
  edge(c[4], c[5]); edge(c[5], c[6]); edge(c[6], c[7]); edge(c[7], c[4]);          /* eaves */
  edge(c[0], c[4]); edge(c[1], c[5]); edge(c[2], c[6]); edge(c[3], c[7]);          /* corners */
  var ridgeF = [0, R, D], ridgeB = [0, R, -D];
  edge(c[4], ridgeF); edge(c[5], ridgeF); edge(c[7], ridgeB); edge(c[6], ridgeB); edge(ridgeF, ridgeB, 1.4); /* roof */
  var m = H * 0.5;                                                                  /* storey line */
  edge([-W, m, D], [W, m, D], .6); edge([W, m, D], [W, m, -D], .6); edge([W, m, -D], [-W, m, -D], .6); edge([-W, m, -D], [-W, m, D], .6);
  function rect(x0, y0, x1, y1, z) { edge([x0, y0, z], [x1, y0, z], .7); edge([x1, y0, z], [x1, y1, z], .7); edge([x1, y1, z], [x0, y1, z], .7); edge([x0, y1, z], [x0, y1, z], .7); edge([x0, y1, z], [x0, y0, z], .7); }
  /* front face: door, two ground windows, three first-floor windows */
  rect(-0.12, 0, 0.12, 0.22, D); rect(-0.78, 0.07, -0.42, 0.24, D); rect(0.42, 0.07, 0.78, 0.24, D);
  rect(-0.78, 0.35, -0.5, 0.52, D); rect(-0.14, 0.35, 0.14, 0.52, D); rect(0.5, 0.35, 0.78, 0.52, D);
  /* side windows */
  rect(W, 0.08, W, 0.24, 0.1); rect(W, 0.35, W, 0.52, 0.1); rect(W, 0.35, W, 0.52, -0.4);

  /* distribute points along edges by length */
  var total = 0; E.forEach(function (e) { e.len = Math.hypot(e.b[0] - e.a[0], e.b[1] - e.a[1], e.b[2] - e.a[2]) * e.w; total += e.len; });
  var P = [];
  E.forEach(function (e) {
    var n = Math.max(2, Math.round(N * e.len / total));
    for (var i = 0; i < n; i++) {
      var t = (i + Math.random()) / n;
      var tx = e.a[0] + (e.b[0] - e.a[0]) * t, ty = e.a[1] + (e.b[1] - e.a[1]) * t, tz = e.a[2] + (e.b[2] - e.a[2]) * t;
      var r = 2.2 + Math.random() * 1.6, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
      P.push({ tx: tx, ty: ty - 0.45, tz: tz, sx: r * Math.sin(ph) * Math.cos(th), sy: r * Math.sin(ph) * Math.sin(th) - 0.3, sz: r * Math.cos(ph),
        d: Math.random() * 0.5, cyan: ty > H - 0.01 || Math.random() < 0.12, s: 1.2 + Math.random() * 1.4 });
    }
  });

  /* ---- sizing ---- */
  var dpr = Math.min(1.5, devicePixelRatio || 1), cw = 0, ch = 0;
  function size() {
    var r = hero.getBoundingClientRect(); cw = Math.max(1, Math.round(r.width)); ch = Math.max(1, Math.round(r.height));
    canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr); canvas.style.width = cw + 'px'; canvas.style.height = ch + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size(); addEventListener('resize', size);

  /* ---- motion ---- */
  var mx = 0, my = 0, cx = 0, cy = 0;
  if (!coarse) addEventListener('pointermove', function (e) { mx = (e.clientX / innerWidth - 0.5) * 2; my = (e.clientY / innerHeight - 0.5) * 2; }, { passive: true });
  var ease = function (t) { return t < 0 ? 0 : t > 1 ? 1 : 1 - Math.pow(1 - t, 3); };
  var CYCLE = 14, ASSEMBLE = 2.6, HOLD = 9.2, SCATTER = 1.4;   /* seconds */
  function phase(t) {                                              /* 0 = scattered, 1 = assembled */
    var u = t % CYCLE;
    if (u < ASSEMBLE) return [u / ASSEMBLE, 1];
    if (u < ASSEMBLE + HOLD) return [1, 1];
    if (u < ASSEMBLE + HOLD + SCATTER) return [(u - ASSEMBLE - HOLD) / SCATTER, -1];
    return [0, 1];
  }
  function draw(t) {
    ctx.clearRect(0, 0, cw, ch);
    cx += (mx - cx) * 0.04; cy += (my - cy) * 0.04;
    var yaw = t * 0.16 + cx * 0.6, pitch = -0.32 + cy * 0.18;
    var sy = Math.sin(yaw), cyw = Math.cos(yaw), sp = Math.sin(pitch), cp = Math.cos(pitch);
    var ph = phase(t), k = ph[0], dir = ph[1];
    var scale = Math.min(cw, ch) * (cw < 600 ? 0.27 : 0.25), ox = cw / 2, oy = ch * (cw < 600 ? 0.36 : 0.40);
    for (var i = 0; i < P.length; i++) {
      var p = P[i];
      var e = dir > 0 ? ease((k - p.d * 0.35) / (1 - p.d * 0.35)) : 1 - ease((k - p.d * 0.3) / (1 - p.d * 0.3));
      if (dir < 0 && k === 0) e = 0;
      var x = p.sx + (p.tx - p.sx) * e, y = p.sy + (p.ty - p.sy) * e, z = p.sz + (p.tz - p.sz) * e;
      /* rotate yaw around y, then pitch around x */
      var x1 = x * cyw + z * sy, z1 = -x * sy + z * cyw;
      var y1 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
      var persp = 3.2 / (3.2 + z2);
      var px = ox + x1 * scale * persp, py = oy - y1 * scale * persp;
      var a = (0.35 + 0.65 * e) * (0.55 + 0.45 * persp);
      ctx.fillStyle = p.cyan ? 'rgba(61,214,245,' + a.toFixed(2) + ')' : 'rgba(242,169,27,' + a.toFixed(2) + ')';
      var s = p.s * persp;
      ctx.fillRect(px - s / 2, py - s / 2, s, s);
    }
  }

  if (reduce) { P.forEach(function (p) { p.d = 0; }); draw(ASSEMBLE + 1); return; }   /* finished house, no motion */

  var live = false, raf = 0, t0 = performance.now(), paused = 0, pauseAt = 0;
  function loop(now) { if (!live || document.hidden) { raf = 0; return; } draw((now - t0 - paused) / 1000); raf = requestAnimationFrame(loop); }
  function start() { if (!raf) { if (pauseAt) { paused += performance.now() - pauseAt; pauseAt = 0; } raf = requestAnimationFrame(loop); } }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; pauseAt = performance.now(); } }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { live = es[0].isIntersecting; live ? start() : stop(); }, { threshold: 0.05 }).observe(hero);
  else { live = true; start(); }
  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : (live && start()); });
})();
