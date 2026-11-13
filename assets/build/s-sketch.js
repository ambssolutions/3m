/* s-sketch: owned by the sketch section builder.
   "Sketch your home on your block": a front elevation in Site Diary's ink line-work with soft washes.
   The drawing is generated here from four choices; the page carries a static default for no-JS visitors.
   Changes redraw with stroke-dashoffset and opacity only. The visitor's photo is read locally with
   URL.createObjectURL and never leaves the device. */
(function () {
  var d = document, sec = d.getElementById('sketch');
  if (!sec) return;
  var svg = sec.querySelector('.sk-art'), box = sec.querySelector('.sk-box'), place = sec.querySelector('.sk-place'),
    photo = sec.querySelector('.sk-photo'), cap = sec.querySelector('.sk-sum'), stg = sec.querySelector('.sk-stage'),
    ctrl = sec.querySelector('.sk-ctrl'), status = sec.querySelector('.sk-status'), file = sec.querySelector('#sk-file'),
    blkTools = sec.querySelector('.sk-blk'), range = sec.querySelector('#sk-scale');
  if (!svg || !ctrl) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- the drawing ---------- */
  var X0 = 230, X1 = 640, E = 16, F = 402, G = 410;
  var MAT = { weatherboard: ['skp-wb', '#4E5A3A', .17, 'weatherboard walls'], brick: ['skp-br', '#B5471F', .2, 'face brick walls'], rendered: ['skp-rn', '#7E776B', .1, 'rendered walls'] };
  var COL = { Surfmist: '#E4E2D5', 'Shale Grey': '#BDBFBA', Dune: '#B1ADA3', 'Woodland Grey': '#4B4C46', Basalt: '#6D6C6E', Monument: '#323233' };
  var sd = 1;
  function seed(n) { sd = n }
  function J() { sd = (sd * 9301 + 49297) % 233280; return (sd / 233280 - .5) * 1.3 }
  function r(n) { return Math.round(n * 10) / 10 }
  function P(pts) { return 'M' + pts.map(function (p) { return r(p[0]) + ' ' + r(p[1]) }).join('L') + 'Z' }
  /* a line that overshoots its ends a little, like a hand-ruled pencil line */
  function L(a, b, c, e, o) {
    o = o == null ? 5 : o;
    var dx = c - a, dy = e - b, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l;
    return 'M' + r(a - ux * o + J()) + ' ' + r(b - uy * o + J()) + 'L' + r(c + ux * o * .6 + J()) + ' ' + r(e + uy * o * .6 + J());
  }
  function O(pts, o) { var s = ''; for (var i = 0; i < pts.length; i++) { var p = pts[i], q = pts[(i + 1) % pts.length]; s += L(p[0], p[1], q[0], q[1], o) } return s }
  function RC(x, y, w, h) { return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]] }
  function ln(dd, c, i) { return '<path class="l' + (c ? ' ' + c : '') + '" pathLength="1"' + (i ? ' style="--d:' + i + '"' : '') + ' d="' + dd + '"/>' }
  function wa(dd, fill, a, i, still) { return '<path class="w" style="--a:' + a + (i ? ';--d:' + i : '') + '" fill="' + fill + '" fill-rule="evenodd"' + (still ? '' : ' transform="translate(-3 2)"') + ' d="' + dd + '"/>' }
  function tx(dd, id) { return '<path class="w" style="--a:1" fill="url(#' + id + ')" fill-rule="evenodd" d="' + dd + '"/>' }
  function blob(cx, cy, rx, ry, n, q) {
    var p = [], i, s;
    for (i = 0; i < n; i++) { var a = i / n * Math.PI * 2, k = 1 + J() * (q || .28); p.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]) }
    s = 'M' + r(p[0][0]) + ' ' + r(p[0][1]);
    for (i = 0; i < n; i++) {
      var p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
      s += 'C' + r(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + r(p1[1] + (p2[1] - p0[1]) / 6) + ' ' + r(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + r(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + r(p2[0]) + ' ' + r(p2[1]);
    }
    return s + 'Z';
  }

  function gen(s) {
    var dbl = s.st === 'double', rf = s.rf, T = dbl ? 178 : 284, rk = rf === 'skillion' ? 52 : 0, M = MAT[s.wl] || MAT.weatherboard, C = COL[s.cl] || COL.Monument;
    var o = {}, i, x, h;
    function top(x) { return T - rk * (x - X0) / (X1 - X0) }
    var wall = [[X0, F], [X0, T], [X1, top(X1)], [X1, F]];
    var ops = [{ x: 258, y: 314, w: 96, h: 54, t: 'w' }, { x: 372, y: 314, w: 56, h: 54, t: 'w' }, { x: 448, y: 318, w: 40, h: 84, t: 'd' }, { x: 524, y: 318, w: 104, h: 84, t: 'g' }];
    if (dbl) ops = ops.concat([{ x: 258, y: 204, w: 96, h: 54, t: 'w' }, { x: 380, y: 204, w: 48, h: 54, t: 'w' }, { x: 452, y: 212, w: 44, h: 46, t: 'w' }, { x: 530, y: 204, w: 92, h: 54, t: 'w' }]);
    if (rf === 'skillion') ops.push({ x: 500, y: T - 26, w: 120, h: 14, t: 'c' });

    /* roof geometry */
    var R, rp, poly, infill = null, edges = '', rtop, eave;
    if (rf === 'gable') {
      R = T - 70;
      var band = [[X0 - E, R], [X1 + E, R], [X1 + E, T + 6], [X0 - E, T + 6]], it = [[X0 - E + 15, T + 6], [309, R + 9], [389, T + 6]];
      rp = P(band) + P(it); infill = it; poly = band;
      rtop = function () { return R };
      eave = RC(X0, T + 6, X1 - X0, 10);
    } else if (rf === 'hip') {
      R = T - 74;
      poly = [[X0 - E, T + 6], [X0 + 92, R], [X1 - 92, R], [X1 + E, T + 6]]; rp = P(poly);
      rtop = function (x) { return x < X0 + 92 ? T + 6 - (T + 6 - R) * (x - X0 + E) / (92 + E) : x > X1 - 92 ? T + 6 - (T + 6 - R) * (X1 + E - x) / (92 + E) : R };
      eave = RC(X0, T + 6, X1 - X0, 10);
    } else {
      var yu = function (x) { return T + 6 - (rk + 4) * (x - X0) / (X1 - X0) }, a = X0 - E, b = X1 + E;
      poly = [[a, yu(a)], [b, yu(b)], [b, yu(b) - 20], [a, yu(a) - 20]]; rp = P(poly);
      rtop = function (x) { return yu(x) - 20 };
      eave = [[X0, yu(X0)], [X1, yu(X1)], [X1, yu(X1) + 10], [X0, yu(X0) + 10]];
      R = yu(b) - 20;
    }
    o.top = R;

    /* scene: ground, a gum tree, a letterbox and a person for scale */
    seed(11);
    var grass = ''; for (x = 18; x < 790; x += 26) { if (x > 214 && x < 660) continue; grass += 'M' + x + ' ' + G + 'l' + r(-2 + J()) + ' -7M' + (x + 5) + ' ' + G + 'l' + r(1 + J()) + ' -9'; }
    /* a gum tree: a forked pale trunk and loose, drooping clumps of leaves */
    var canopy = [[60, 204, 34, 13], [98, 176, 30, 12], [134, 140, 40, 15], [182, 196, 30, 12], [150, 100, 28, 11], [104, 112, 24, 10], [188, 152, 22, 9], [70, 150, 20, 8]], cw = '', lv = '';
    canopy.forEach(function (c) {
      cw += blob(c[0], c[1], c[2], c[3], 11, .7);
      for (var j = 0; j < 7; j++) { var px = c[0] + J() * c[2] * 1.4, py = c[1] + J() * c[3] * 1.3; lv += 'M' + r(px) + ' ' + r(py) + 'q' + r(2 + J() * 2) + ' 5 ' + r(J() * 3) + ' 10' }
    });
    o.scene =
      tx('M0 ' + G + 'H800V' + (G + 16) + 'H0Z', 'skp-hx') +
      wa(cw, '#4E5A3A', .22, 0) +
      ln('M113 410C116 362 117 332 113 300C109 274 96 250 78 222M127 410C125 364 126 336 131 306C137 282 150 258 166 232', '', 0) + ln('M78 222C72 214 66 210 60 206M166 232C172 220 178 208 184 198M119 302C125 262 132 196 134 142M128 256C140 210 150 150 151 104M111 288C100 266 98 220 100 176M134 200C150 180 170 162 188 152M100 230C92 210 80 178 70 152M134 160C124 140 112 124 104 112', 't', 1) +
      ln(lv, 'x', 1) + ln('M118 410C119 380 119 350 118 320M122 360C123 340 124 320 123 300', 'x', 1) + ln(L(6, G, 794, G, 0) + L(30, G + 1.5, 770, G + 1.5, 0), '', 1) + ln(grass, 'x', 2) +
      '<g class="sk-scale">' + wa('M700 340a6 6 0 1 0 .1 0ZM694 357C690 358 689 362 689 368L688 386L692 386L693 410L698 410L699 390L701 390L702 410L707 410L708 386L712 386L711 368C711 362 710 358 706 357Z', '#221F1A', .2, 3, true) +
      ln('M700 340a6 6 0 1 0 .1 0M694 357C690 358 689 362 689 368L688 386L692 386L693 410M707 410L708 386L712 386L711 368C711 362 710 358 706 357M698 410L699 390L701 390L702 410', 't', 3) + '</g>' +
      ln(L(190, G, 190, G - 34, 2) + O(RC(181, G - 46, 18, 12), 2), 't', 4);

    /* base: set-out slab and footings */
    seed(23);
    o.base = tx(P(RC(X0 - 4, F, X1 - X0 + 8, 8)), 'skp-hx') + ln(O(RC(X0 - 4, F, X1 - X0 + 8, 8), 4)) +
      '<g class="ft">' + wa(P(RC(X0 - 6, G, 26, 22)) + P(RC(X1 - 20, G, 26, 22)) + P(RC(430, G, 22, 18)), '#5B554B', .12, 1, true) + ln(O(RC(X0 - 6, G, 26, 22), 2) + O(RC(X1 - 20, G, 26, 22), 2) + O(RC(430, G, 22, 18), 2), 't', 1) + '</g>';

    /* set-out profiles and string line (shown only while it is being built) */
    seed(31);
    o.set = ln(L(X0 - 40, G, X0 - 40, G - 28, 2) + L(X0 - 28, G, X0 - 28, G - 28, 2) + L(X0 - 48, G - 22, X0 - 20, G - 22, 2) + L(X1 + 28, G, X1 + 28, G - 28, 2) + L(X1 + 40, G, X1 + 40, G - 28, 2) + L(X1 + 20, G - 22, X1 + 48, G - 22, 2), 'r') +
      ln(L(X0 - 34, G - 20, X1 + 34, G - 20, 0) + L(X0, G + 4, X0, G - 10, 0) + L(X1, G + 4, X1, G - 10, 0), 'r t', 2);

    /* frame: studs, plates, noggins and lintels; roof members seen end-on */
    seed(41);
    var studs = '', plates = '', nogs = '', lint = '';
    var segs = dbl ? [[F, 296], [288, null]] : [[F, null]];
    segs.forEach(function (sg) {
      var yb = sg[0];
      for (x = X0; x <= X1 + .1; x += 24.11) {
        var yt = sg[1] == null ? top(x) + 4 : sg[1], parts = [[yb, yt]];
        ops.forEach(function (op) {
          if (x < op.x - 3 || x > op.x + op.w + 3) return;
          parts = parts.reduce(function (acc, pt) {
            var lo = pt[0], hi = pt[1];
            if (op.y + op.h < hi || op.y > lo) { acc.push(pt); return acc }
            if (lo > op.y + op.h + 4) acc.push([lo, op.y + op.h + 4]);
            if (op.y - 9 > hi) acc.push([op.y - 9, hi]);
            return acc;
          }, []);
        });
        parts.forEach(function (pt) { studs += 'M' + r(x) + ' ' + r(pt[0]) + 'V' + r(pt[1]) });
      }
      var tp = sg[1] == null ? top : function () { return sg[1] };
      plates += L(X0, yb - 3, X1, yb - 3, 3) + L(X0, tp(X0) + 4, X1, tp(X1) + 4, 3) + L(X0, tp(X0) + 7, X1, tp(X1) + 7, 2);
      var ym = (yb + tp(X0)) / 2 + 10;
      for (x = X0; x < X1; x += 48.22) { var hit = ops.some(function (op) { return x + 24 > op.x - 3 && x < op.x + op.w + 3 && ym > op.y - 9 && ym < op.y + op.h + 4 }); if (!hit) nogs += 'M' + r(x) + ' ' + r(ym) + 'H' + r(x + 24) }
    });
    ops.forEach(function (op) { lint += L(op.x - 6, op.y - 4, op.x + op.w + 6, op.y - 4, 2) + L(op.x - 6, op.y - 8, op.x + op.w + 6, op.y - 8, 2); if (op.t === 'w' || op.t === 'c') lint += L(op.x - 3, op.y + op.h + 4, op.x + op.w + 3, op.y + op.h + 4, 2) });
    var webs = '';
    for (x = X0 - E + 12; x < X1 + E; x += 24) { var ytop = rtop(x); if (ytop < T + 2) webs += 'M' + r(x) + ' ' + r(rf === 'skillion' ? ytop + 20 : T + 6) + 'V' + r(ytop) }
    if (infill) webs += 'M309 ' + (R + 9) + 'V' + (T + 6) + 'M309 ' + (T + 6) + 'L262 ' + (T - 28) + 'M309 ' + (T + 6) + 'L356 ' + (T - 28);
    o.frame = ln(O(wall, 3), 'r') + ln(studs, 'r t', 1) + ln(plates + nogs, 'r t', 2) + ln(lint, 'r t', 3) + ln(O(poly, 4), 'r', 4) + ln(webs, 'r x', 5);

    /* lock-up: walls, roof colour, roof sheets, windows and doors */
    var wallp = P(wall) + (infill ? P(infill) : '');
    o.back = '<path class="bk" d="' + P(wall) + rp + '"/>';
    seed(53);
    var band2 = dbl ? L(X0, 292, X1, 292, 3) + L(X0, 297, X1, 297, 3) : '';
    var vent = infill ? O(RC(300, R + 34, 18, 14), 2) + 'M302 ' + (R + 39) + 'H316M302 ' + (R + 44) + 'H316' : '';
    o.walls = wa(wallp, M[1], M[2], 0) + tx(wallp, M[0]) + ln(O(wall)) + ln(O(wall, 2), 'x', 1) + (band2 || vent ? ln(band2 + vent, 't', 2) : '');
    seed(61);
    o.rc = wa(rp, C, .8, 1);
    seed(67);
    var rl = O(poly);
    if (infill) rl += L(X0 - E, T + 6, 309, R, 3) + L(309, R, 389 + 15, T + 6, 3);
    var rt = infill ? L(X0 - E + 15, T + 6, 309, R + 9, 2) + L(309, R + 9, 389, T + 6, 2) : rf === 'hip' ? L(X0 + 92, R + 3, X1 - 92, R + 3, 2) : L(X0 - E, poly[0][1] - 4, X1 + E, poly[1][1] - 4, 2);
    o.roof = tx(rp, 'skp-rf') + wa(P(eave), '#221F1A', .13, 2, true) + ln(rl, '', 1) + ln(rt, 't', 2) + ln(O(poly, 2), 'x', 3);
    seed(71);
    var gw = '', gl = '', dw = '', th = '';
    ops.forEach(function (op) {
      var q = RC(op.x, op.y, op.w, op.h);
      if (op.t === 'd') { dw += P(q) } else gw += P(q);
      gl += O(q, 3);
      if (op.t === 'w') { th += O(RC(op.x + 4, op.y + 4, op.w - 8, op.h - 8), 1) + L(op.x - 5, op.y + op.h + 3, op.x + op.w + 5, op.y + op.h + 3, 2); if (op.w > 70) th += L(op.x + op.w / 2, op.y + 4, op.x + op.w / 2, op.y + op.h - 4, 1) }
      if (op.t === 'c') { for (i = 1; i < 4; i++) th += 'M' + (op.x + op.w * i / 4) + ' ' + op.y + 'v' + op.h }
      if (op.t === 'g') { for (h = op.y + 12; h < op.y + op.h; h += 12) th += 'M' + (op.x + 3) + ' ' + h + 'H' + (op.x + op.w - 3) }
      if (op.t === 'd') th += O(RC(op.x + op.w - 13, op.y + 8, 6, op.h - 16), 1) + 'M' + (op.x + 8) + ' ' + (op.y + 10) + 'v' + (op.h - 20);
    });
    o.open = wa(gw, '#5B554B', .2, 0) + wa(dw, '#B5471F', .4, 0) + ln(gl, '', 1) + ln(th, 't', 2);

    /* fixing: gutters, downpipes, reflections and handles */
    seed(83);
    var fx = '';
    if (rf === 'skillion') fx += L(X0 + 8, poly[0][1] + 4, X0 + 8, F, 1) + L(X0 + 13, poly[0][1] + 4, X0 + 13, F, 1);
    else fx += L(X0 - E - 2, T + 6, X1 + E + 2, T + 6, 2) + L(X0 - E - 2, T + 12, X1 + E + 2, T + 12, 2) + L(X0 + 6, T + 12, X0 + 6, F, 1) + L(X0 + 11, T + 12, X0 + 11, F, 1) + L(X1 - 11, T + 12, X1 - 11, F, 1) + L(X1 - 6, T + 12, X1 - 6, F, 1);
    var refl = '';
    ops.forEach(function (op) { if (op.t === 'w') refl += 'M' + (op.x + 10) + ' ' + (op.y + op.h - 14) + 'l12 -16M' + (op.x + 16) + ' ' + (op.y + op.h - 12) + 'l7 -9'; if (op.t === 'd') refl += 'M' + (op.x + 7) + ' ' + (op.y + 46) + 'h7'; if (op.t === 'g') refl += 'M' + (op.x + op.w / 2 - 8) + ' ' + (op.y + op.h - 9) + 'h16' });
    o.fix = ln(fx, 't') + ln(refl, 'x', 2);

    /* practical completion: a lit window and the garden in */
    seed(97);
    var lit = ops[dbl ? 4 : 0], sh = blob(298, G - 9, 36, 13, 8) + blob(432, G - 7, 12, 9, 7) + blob(652, G - 9, 18, 12, 7);
    o.done = wa(P(RC(lit.x + 5, lit.y + 5, lit.w - 10, lit.h - 10)), '#B5471F', .32, 0, true) + wa(sh, '#4E5A3A', .34, 1) + ln(sh, 't', 1);
    return o;
  }

  /* ---------- state and redraw ---------- */
  function val(n) { var i = ctrl.querySelector('input[name="' + n + '"]:checked'); return i ? i.value : '' }
  function state() { return { st: val('sk-storeys'), rf: val('sk-roof'), wl: val('sk-walls'), cl: val('sk-colour') } }
  function words(s) {
    return [s.st === 'single' ? 'single storey' : 'double storey', s.rf + ' roof', (MAT[s.wl] || MAT.weatherboard)[3], 'Colorbond ' + s.cl + ' roof'].join(', ');
  }
  var cur = {}, blk = false, lastTop = 0;
  function render(animate) {
    var s = state(), out = gen(s), fresh = [];
    lastTop = out.top; delete out.top;
    Object.keys(out).forEach(function (k) {
      if (cur[k] === out[k]) return;
      cur[k] = out[k];
      var old = svg.querySelector('[data-k="' + k + '"]:not(.out)');
      if (!old) return;
      if (!animate || reduce) { old.innerHTML = out[k]; return }
      var g = old.cloneNode(false); g.innerHTML = out[k]; g.classList.add('pre');
      old.parentNode.insertBefore(g, old.nextSibling);
      old.classList.add('out'); setTimeout(function () { if (old.parentNode) old.parentNode.removeChild(old) }, 650);
      fresh.push(g);
    });
    if (fresh.length) { svg.getBoundingClientRect(); requestAnimationFrame(function () { requestAnimationFrame(function () { fresh.forEach(function (g) { g.classList.remove('pre') }) }) }) }
    var w = words(s); cap.textContent = w.charAt(0).toUpperCase() + w.slice(1) + '.';
    if (blk) frameBlock();
  }

  /* ---------- Watch it built: the five stages, with the stage name ---------- */
  var NAMES = ['Base', 'Frame', 'Lock-up', 'Fixing', 'Practical completion'], step = 0, timer = null, building = false;
  var bars = stg ? [].slice.call(stg.querySelectorAll('i')) : [];
  function setStage(n) { for (var i = 1; i <= 5; i++) svg.classList.toggle('st' + i, i <= n) }
  function label(n) {
    if (!stg) return;
    stg.querySelector('b').textContent = n; stg.querySelector('strong').textContent = NAMES[n - 1];
    bars.forEach(function (b, i) { b.classList.toggle('on', i < n) });
  }
  function next() {
    step++; setStage(step); label(step);
    timer = setTimeout(step < 5 ? next : end, step < 5 ? 1700 : 2400);
  }
  function end() { building = false; sec.classList.remove('building'); timer = null }
  function stop() { if (timer) clearTimeout(timer); timer = null; if (building) { setStage(5); end() } }
  function build() {
    stop(); building = true; played = true; sec.classList.add('building');
    svg.classList.add('snap'); setStage(0); svg.getBoundingClientRect(); svg.classList.remove('snap');
    step = 0; label(1); timer = setTimeout(next, 450);
  }

  /* ---------- Try it on your block ---------- */
  var url = null, pos = { x: .5, y: .9 }, scale = 1, drag = null;
  function say(t) { if (status) status.textContent = t }
  function frameBlock() {
    var t = Math.round(lastTop - 14);
    svg.setAttribute('viewBox', '196 ' + t + ' 484 ' + (G + 14 - t));
    place.style.setProperty('--ar', 484 / (G + 14 - t));
    paint();
  }
  function paint() {
    if (!blk) { place.style.transform = ''; return }
    var W = box.clientWidth, H = box.clientHeight;
    place.style.transform = 'translate(' + Math.round(pos.x * W) + 'px,' + Math.round(pos.y * H) + 'px) translate(-50%,-100%) scale(' + scale + ')';
  }
  function setBlock(on) {
    blk = on; sec.classList.toggle('on-block', on);
    photo.hidden = !on; if (blkTools) blkTools.hidden = !on;
    if (on) { place.tabIndex = 0; place.setAttribute('role', 'group'); place.setAttribute('aria-roledescription', 'movable sketch'); place.setAttribute('aria-label', 'The sketch on your photo. Use the arrow keys to move it.'); frameBlock() }
    else { place.removeAttribute('tabindex'); place.removeAttribute('role'); place.removeAttribute('aria-roledescription'); place.removeAttribute('aria-label'); svg.setAttribute('viewBox', '0 0 800 450'); place.style.transform = '' }
  }
  function resetPlace() { pos = { x: .5, y: .9 }; scale = 1; if (range) range.value = 100; paint() }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)) }
  /* keep at least most of the sketch on the photo */
  function keep() { var hw = Math.min(.5, .26 * scale * .92); pos.x = clamp(pos.x, hw, 1 - hw); pos.y = clamp(pos.y, .25, 1.04) }
  if (file) file.addEventListener('change', function () {
    var f = file.files && file.files[0];
    if (!f) return;
    if (!/^image\//.test(f.type)) { say('That file is not a photo. Try a JPEG or PNG.'); file.value = ''; return }
    var u = URL.createObjectURL(f);
    photo.onload = function () { if (url && url !== u) URL.revokeObjectURL(url); url = u; resetPlace(); setBlock(true); say('Your photo is on the sheet. Only this browser can see it.') };
    photo.onerror = function () { URL.revokeObjectURL(u); say('That photo could not be opened here. Try a JPEG or PNG.'); file.value = '' };
    photo.alt = 'Your photo of the block'; photo.src = u;
  });
  place.addEventListener('pointerdown', function (e) {
    if (!blk || e.button > 0) return;
    e.preventDefault(); place.setPointerCapture(e.pointerId);
    drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, x: pos.x, y: pos.y, W: box.clientWidth, H: box.clientHeight };
    place.classList.add('grab');
  });
  place.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    pos.x = drag.x + (e.clientX - drag.sx) / drag.W; pos.y = drag.y + (e.clientY - drag.sy) / drag.H; keep(); paint();
  });
  function up(e) { if (drag && e.pointerId === drag.id) { drag = null; place.classList.remove('grab') } }
  place.addEventListener('pointerup', up); place.addEventListener('pointercancel', up);
  place.addEventListener('keydown', function (e) {
    if (!blk) return;
    var k = e.key, st = e.shiftKey ? .06 : .015;
    if (k === 'ArrowLeft') pos.x -= st; else if (k === 'ArrowRight') pos.x += st; else if (k === 'ArrowUp') pos.y -= st; else if (k === 'ArrowDown') pos.y += st; else return;
    e.preventDefault(); keep(); paint();
  });
  if (range) range.addEventListener('input', function () { scale = range.value / 100; keep(); paint() });
  addEventListener('resize', function () { if (blk) paint() });
  sec.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b || !sec.contains(b)) return;
    var a = b.getAttribute('data-act');
    if (a === 'watch') build();
    else if (a === 'reset') { resetPlace(); say('The sketch is back in the middle of your photo.') }
    else if (a === 'remove') { setBlock(false); photo.removeAttribute('src'); if (url) URL.revokeObjectURL(url); url = null; if (file) file.value = ''; say('Photo removed. The sketch is back on the plain sheet.') }
    else if (a === 'add') addToEnquiry();
  });

  /* ---------- Add this sketch to my enquiry ---------- */
  function addToEnquiry() {
    var w = words(state()), f = d.querySelector('form[data-enquiry]');
    if (f) {
      var inp = f.querySelector('input[name="design"]');
      if (!inp) { inp = d.createElement('input'); inp.type = 'hidden'; inp.name = 'design'; f.appendChild(inp) }
      inp.value = 'Sketch: ' + w;
    }
    say('Added to your enquiry: ' + w + '. Taking you to the form.');
    var c = d.getElementById('contact');
    if (!c) return;
    setTimeout(function () {
      c.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      var h = f && f.querySelector('h3[tabindex]'); if (h) h.focus({ preventScroll: true });
    }, 700);
  }

  ctrl.addEventListener('change', function (e) { if (e.target.name && e.target.name.indexOf('sk-') === 0 && e.target.type === 'radio') { stop(); render(true) } });
  render(false);
  sec.classList.add('sk-ready');

  /* the first time the sheet comes into view, it builds itself once */
  var played = false;
  if (!reduce && !d.documentElement.classList.contains('lite') && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting && !d.hidden) { io.disconnect(); if (!played) build() } }, { threshold: .55 });
    io.observe(box);
  }
})();
