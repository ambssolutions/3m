/* s-layers-3d-model: owned by the layers section builder. Imported by s-layers-3d.js together with three.js,
   only once the page has loaded and the section is within about one screen. Builds the WebGL drafting model of a
   two-storey house in five layer groups (Base, Frame, Lock-up, Fixing, Practical completion), recoloured from the
   theme tokens on <html>. The CSS model stays until the canvas has drawn its first frame. */
const d = document, root = d.documentElement;
const sec = d.getElementById('layers');
const box = sec && sec.querySelector('.layers-model');

export function build(T) {
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LITE = root.classList.contains('lite');
  const COARSE = matchMedia('(pointer:coarse)').matches;
  const FINE = matchMedia('(pointer:fine)').matches;
  const EDGES = !LITE;
  /* the idle turn: a page can switch it off (--l3-sway:0 on .layers-model, e.g. on phones); the model then holds a still
     frame and draws only while it explodes, settles or is dragged */
  const SWAY = !REDUCE && getComputedStyle(box).getPropertyValue('--l3-sway').trim() !== '0';
  const now = () => performance.now();
  const rad = a => a * Math.PI / 180;

  /* ---------- palette from the theme tokens ---------- */
  const P = {};
  const KEYS = ['paper', 'paper-2', 'field', 'ink', 'ink-2', 'ink-3', 'rust', 'glow', 'moss', 'rule', 'rule-2'];
  function readPalette() {
    const cs = getComputedStyle(root);
    KEYS.forEach(k => { const v = cs.getPropertyValue('--' + k).trim(); P[k] = new T.Color(v || '#888888'); });
    P.dark = root.getAttribute('data-theme') === 'night' || (P.paper.r + P.paper.g + P.paper.b) < 0.6;
  }
  const mix = (a, b, t) => P[a].clone().lerp(P[b], t);
  /* material recipes: colour from the palette, opacity, and how it renders */
  const R = {
    slab: () => mix('paper-2', 'rule', P.dark ? .2 : .55),
    rebate: () => mix('paper-2', 'rule-2', .55),
    peg: () => mix('rule-2', 'ink-2', .25),
    frame: () => mix('ink-2', 'rule-2', .3),
    wall: () => P.dark ? mix('field', 'ink-3', .32) : P.field.clone(),
    trim: () => P.dark ? mix('ink-2', 'field', .35) : mix('paper-2', 'rule-2', .25),
    roof: () => P.dark ? mix('paper-2', 'ink-3', .35) : P['ink-2'].clone(),
    gutter: () => P.dark ? mix('ink-3', 'paper', .35) : mix('ink-2', 'ink', .45),
    glass: () => P.dark ? mix('paper', 'ink-3', .25) : mix('ink-2', 'ink', .25).lerp(P.glow, .12),
    door: () => P.rust.clone(),
    lining: () => P.dark ? mix('field', 'ink-2', .22) : mix('field', 'paper-2', .4),
    bench: () => P.dark ? mix('field', 'ink-2', .35) : mix('paper-2', 'rule-2', .45),
    top: () => P.dark ? mix('ink-2', 'field', .1) : mix('ink-2', 'ink', .2),
    tread: () => P.dark ? mix('rule-2', 'ink-2', .45) : mix('rule-2', 'paper-2', .2),
    lit: () => P.dark ? P.glow.clone() : mix('glow', 'field', .28),
    leaf: () => (['moss', 'rust', 'glow'].map(k => P[k]).find(c => { const h = c.getHSL({}).h * 360; return h > 60 && h < 175; }) || P.moss).clone(),
    soil: () => mix('ink-2', 'moss', .35),
    trunk: () => mix('ink-2', 'rule-2', .2),
    box: () => P.rust.clone(),
    tag: () => P.rust.clone(),
    ring: () => P.glow.clone(),
    path: () => P.dark ? mix('paper-2', 'ink-3', .25) : mix('paper-2', 'rule-2', .5)
  };
  const OPA = { glass: .42 };
  const FLAT = { leaf: 1, trunk: 1 };
  const BASIC = { lit: 1 };
  const NOSHADOW = { glass: 1, lit: 1 };

  /* ---------- the house, in metres. x across the front, z towards the street, y up ---------- */
  const W = 10.4, D = 7.6, SL = .3, H1 = 2.6, FZ = .25, H2 = 2.5;
  const Y1 = SL, Y2 = SL + H1 + FZ, Y2T = Y2 + H2;
  const CT = .1, FD = .09, ST = .07;
  const PITCH = rad(24), TP = Math.tan(PITCH), EAVE = .55, GOV = .4, HEEL = .12, RT = .1;
  const YR = Y2T + HEEL + D / 2 * TP;             /* underside of the roof sheets at the ridge */
  const yU = z => YR - Math.abs(z) * TP;
  /* openings per wall and storey: [u0, u1, sill, head, kind]; u is x on front and back, z on the sides */
  const WL = {
    f: { g: [[-4.2, -2.4, .9, 2.2], [-.55, .45, 0, 2.15, 'door'], [1.6, 4.2, .55, 2.2]], t: [[-4, -2.6, .9, 2.1], [-.8, .8, .9, 2.1, 'lit'], [2.4, 4, .9, 2.1]] },
    b: { g: [[-3.5, -1.6, 1.05, 2.1], [1, 3.8, 0, 2.15, 'slide']], t: [[-3.2, -1.8, .9, 2.1], [1.8, 3.2, .9, 2.1]] },
    r: { g: [[-1.4, 1, .9, 2.1]], t: [[-.8, .8, .9, 2.1]] },
    l: { g: [], t: [[-.5, .5, 1.2, 2.1]] }
  };
  /* wall coordinates (u along the wall, y up, depth in from the outer face) to world */
  function wp(w, u, y, dd) {
    if (w === 'f') return [u, y, D / 2 - dd];
    if (w === 'b') return [u, y, -D / 2 + dd];
    if (w === 'r') return [W / 2 - dd, y, u];
    return [-W / 2 + dd, y, u];
  }

  /* ---------- geometry buckets: one merged mesh per layer and material, one line set per layer ---------- */
  const NAMES = [...sec.querySelectorAll('.layers-model .lab b')].map(b => b.textContent.trim());
  const layers = [0, 1, 2, 3, 4].map(i => ({ i, parts: {}, edges: [], anchors: [], lift: 0, on: 0, dim: 1, lab: 0, name: NAMES[i] || '' }));
  const add = (ly, key, g) => { (ly.parts[key] = ly.parts[key] || []).push(g); return g; };
  const edge = (ly, g) => { if (EDGES) ly.edges.push(new T.EdgesGeometry(g, 30).attributes.position.array); };
  const seg = (ly, pts) => { if (EDGES) ly.edges.push(new Float32Array(pts)); };
  function bx(ly, key, x0, x1, y0, y1, z0, z1, e) {
    const g = new T.BoxGeometry(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0));
    g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    add(ly, key, g); if (e) edge(ly, g); return g;
  }
  function wbox(ly, key, w, u0, u1, y0, y1, d0, d1, e) {
    const a = wp(w, u0, y0, d0), b = wp(w, u1, y1, d1);
    return bx(ly, key, Math.min(a[0], b[0]), Math.max(a[0], b[0]), y0, y1, Math.min(a[2], b[2]), Math.max(a[2], b[2]), e);
  }
  const V = (x, y, z) => new T.Vector3(x, y, z);
  function beam(ly, key, p0, p1, w, h, e) {
    const len = p0.distanceTo(p1), g = new T.BoxGeometry(w, h, len);
    const up = Math.abs(p1.y - p0.y) / len > .98 ? V(1, 0, 0) : V(0, 1, 0);
    const m = new T.Matrix4().lookAt(p0, p1, up); m.setPosition(p0.clone().add(p1).multiplyScalar(.5));
    g.applyMatrix4(m); add(ly, key, g); if (e) edge(ly, g); return g;
  }
  /* a rectangle [u0,u1] x [0,h] minus openings, as rectangles */
  function pieces(u0, u1, h, holes) {
    const out = [], hs = holes.slice().sort((a, b) => a[0] - b[0]); let u = u0;
    hs.forEach(o => { if (o[0] > u) out.push([u, o[0], 0, h]); if (o[2] > 0) out.push([o[0], o[1], 0, o[2]]); if (o[3] < h) out.push([o[0], o[1], o[3], h]); u = o[1]; });
    if (u < u1) out.push([u, u1, 0, h]); return out;
  }
  function spans(u0, u1, cuts) { const out = []; let u = u0; cuts.slice().sort((a, b) => a[0] - b[0]).forEach(c => { if (c[0] > u) out.push([u, c[0]]); u = Math.max(u, c[1]); }); if (u < u1) out.push([u, u1]); return out; }
  function outline(ly, w, u0, u1, y0, y1, dd) {
    const p = (u, y) => wp(w, u, y, dd);
    const a = p(u0, y0), b = p(u1, y0), c = p(u1, y1), e = p(u0, y1);
    seg(ly, [...a, ...b, ...b, ...c, ...c, ...e, ...e, ...a]);
  }
  const span = w => (w === 'f' || w === 'b') ? [-W / 2, W / 2] : [-D / 2 + CT, D / 2 - CT];
  const storeys = [['g', Y1, Y2 - Y1, H1], ['t', Y2, H2, H2]];

  /* 01 Base: set-out profiles and string lines, a raised slab with an edge rebate and a porch step */
  const L0 = layers[0];
  bx(L0, 'slab', -W / 2 - .2, W / 2 + .2, 0, SL - .08, -D / 2 - .2, D / 2 + .2, true);
  bx(L0, 'rebate', -W / 2 - .06, W / 2 + .06, SL - .08, SL, -D / 2 - .06, D / 2 + .06, true);
  bx(L0, 'slab', -1.7, 1.5, 0, .16, D / 2 + .2, D / 2 + 1.7, true);
  const SO = [];
  const PX = W / 2 + 1.5, PZ = D / 2 + 1.5, SX = W / 2 + .2, SZ = D / 2 + .2;
  [-1, 1].forEach(sx => [-1, 1].forEach(sz => {
    /* two profiles per corner: one carries the string along x, the other along z */
    const prof = (cx, cz, alongX) => {
      const a = alongX ? [cx, cz - .55] : [cx - .55, cz], b = alongX ? [cx, cz + .55] : [cx + .55, cz];
      bx(L0, 'peg', a[0] - .03, a[0] + .03, 0, .75, a[1] - .03, a[1] + .03);
      bx(L0, 'peg', b[0] - .03, b[0] + .03, 0, .75, b[1] - .03, b[1] + .03);
      if (alongX) bx(L0, 'peg', cx - .015, cx + .015, .58, .68, cz - .62, cz + .62); else bx(L0, 'peg', cx - .62, cx + .62, .58, .68, cz - .015, cz + .015);
    };
    prof(sx * PX, sz * SZ, true); prof(sx * SX, sz * PZ, false);
  }));
  [-1, 1].forEach(s => { SO.push(-PX, .66, s * SZ, PX, .66, s * SZ, s * SX, .66, -PZ, s * SX, .66, PZ); });
  L0.anchors = [V(W / 2 + .2, SL, D / 2 + .2), V(W / 2 + .2, SL, -D / 2 - .2), V(-W / 2 - .2, SL, D / 2 + .2)];

  /* 02 Frame: stud walls with plates, noggins, lintels and trimmers, a floor frame, gable trusses */
  const L1 = layers[1];
  const PT = .05;
  ['f', 'b', 'r', 'l'].forEach(w => [['g', Y1, H1], ['t', Y2, H2]].forEach(([s, y0, h]) => {
    const holes = WL[w][s];
    const u0 = (w === 'f' || w === 'b') ? -W / 2 + CT : -D / 2 + CT + FD, u1 = -u0;
    const m = (a, b, c, e) => wbox(L1, 'frame', w, Math.max(u0, a), Math.min(u1, b), y0 + c, y0 + e, CT + .005, CT + FD);
    spans(u0, u1, holes.filter(o => o[2] === 0)).forEach(([a, b]) => m(a, b, 0, PT));
    m(u0, u1, h - 2 * PT, h);
    const xs = []; for (let u = u0 + ST / 2; u < u1 - ST; u += .6) xs.push(u); xs.push(u1 - ST / 2);
    xs.forEach(u => {
      const o = holes.find(o => u > o[0] - ST && u < o[1] + ST);
      if (!o) { m(u - ST / 2, u + ST / 2, PT, h - 2 * PT); return; }
      if (u < o[0] || u > o[1]) return;
      if (o[2] > 0) m(u - ST / 2, u + ST / 2, PT, o[2] - PT);
      if (o[3] + .2 < h - 2 * PT) m(u - ST / 2, u + ST / 2, o[3] + .2, h - 2 * PT);
    });
    holes.forEach(o => {
      m(o[0] - ST, o[0], PT, h - 2 * PT); m(o[1], o[1] + ST, PT, h - 2 * PT);
      m(o[0] - ST, o[1] + ST, o[3], o[3] + .2);
      if (o[2] > 0) m(o[0], o[1], o[2] - PT, o[2]);
    });
    const mid = h * .5;
    spans(u0, u1, holes.filter(o => o[2] < mid + .05 && o[3] + .2 > mid).map(o => [o[0] - ST, o[1] + ST])).forEach(([a, b]) => m(a, b, mid - .035, mid + .035));
  }));
  /* floor frame between the storeys: rim boards and joists */
  const FY0 = Y1 + H1, FY1 = Y2;
  bx(L1, 'frame', -W / 2 + CT, W / 2 - CT, FY0, FY1, D / 2 - CT - .05, D / 2 - CT);
  bx(L1, 'frame', -W / 2 + CT, W / 2 - CT, FY0, FY1, -D / 2 + CT, -D / 2 + CT + .05);
  for (let x = -W / 2 + CT + .03; x <= W / 2 - CT; x += .6) bx(L1, 'frame', x - .025, x + .025, FY0, FY1, -D / 2 + CT + .05, D / 2 - CT - .05);
  /* trusses: top chords, bottom chord, king post and webs, then a ridge board */
  const TY = Y2T + .04, ZE = D / 2 + EAVE;
  for (let x = -W / 2 + .06; x <= W / 2 - .05; x += (W - .12) / 11) {
    const ch = (z0, y0, z1, y1, w) => beam(L1, 'frame', V(x, y0, z0), V(x, y1, z1), .05, w || .1);
    ch(-ZE, yU(ZE) - .07, 0, YR - .07); ch(ZE, yU(ZE) - .07, 0, YR - .07);
    ch(-D / 2, TY, D / 2, TY);
    ch(0, TY, 0, YR - .1, .08);
    [-1, 1].forEach(s => { ch(s * D / 6, TY, s * D / 3, yU(D / 3) - .1, .07); ch(s * D / 6, TY, s * .25, yU(.25) - .12, .07); });
  }
  beam(L1, 'frame', V(-W / 2, YR - .04, 0), V(W / 2, YR - .04, 0), .05, .14);
  L1.anchors = [V(W / 2 - CT, Y2, D / 2 - CT), V(W / 2 - CT, Y2, -D / 2 + CT), V(-W / 2 + CT, Y2, D / 2 - CT)];

  /* 03 Lock-up: weatherboard walls, a floor band, windows, doors, gable ends, a ribbed roof, gutters, porch */
  const L2 = layers[2];
  ['f', 'b', 'r', 'l'].forEach(w => storeys.forEach(([s, y0, hc]) => {
    const [u0, u1] = span(w);
    pieces(u0, u1, hc, WL[w][s]).forEach(r => wbox(L2, 'wall', w, r[0], r[1], y0 + r[2], y0 + r[3], 0, CT));
    outline(L2, w, u0, u1, y0, y0 + hc, -.002);
    WL[w][s].forEach(o => {
      const kind = o[4], door = o[2] === 0, a = o[0], b = o[1], v0 = y0 + o[2], v1 = y0 + o[3], fw = .06;
      outline(L2, w, a, b, v0, v1, -.002);
      const fr = (p, q, r1, r2) => wbox(L2, 'trim', w, p, q, r1, r2, .015, .085, true);
      fr(a, b, v1 - fw, v1); fr(a, a + fw, v0, v1); fr(b - fw, b, v0, v1);
      if (!door) { fr(a, b, v0, v0 + fw); wbox(L2, 'trim', w, a - .06, b + .06, v0 - .05, v0, -.07, .1, true); }
      if (kind === 'door') {
        wbox(L2, 'door', w, a + fw, b - fw, v0, v1 - fw, .05, .09, true);
        wbox(L2, 'gutter', w, b - .2, b - .14, v0 + .98, v0 + 1.04, -.01, .06);
        return;
      }
      if (b - a > 1.4) fr((a + b) / 2 - fw / 2, (a + b) / 2 + fw / 2, v0, v1);
      wbox(L2, 'glass', w, a + fw, b - fw, door ? v0 : v0 + fw, v1 - fw, .045, .055);
    });
  }));
  /* floor band and corner stops */
  [['f', 0], ['b', 0], ['r', 1], ['l', 1]].forEach(([w]) => { const [u0, u1] = span(w); wbox(L2, 'trim', w, u0 - (w === 'f' || w === 'b' ? .03 : 0), u1 + (w === 'f' || w === 'b' ? .03 : 0), Y2 - .14, Y2 + .02, -.03, CT, true); });
  [-1, 1].forEach(sx => [-1, 1].forEach(sz => bx(L2, 'trim', sx * W / 2 - (sx > 0 ? .08 : -.08), sx * (W / 2 + .025), Y1, Y2T, sz * D / 2 - (sz > 0 ? .08 : -.08), sz * (D / 2 + .025))));
  /* gable ends, clad like the walls */
  const gs = new T.Shape([new T.Vector2(-D / 2, 0), new T.Vector2(D / 2, 0), new T.Vector2(0, YR - Y2T)]);
  [-1, 1].forEach(s => {
    const g = new T.ExtrudeGeometry(gs, { depth: CT, bevelEnabled: false });
    g.rotateY(-Math.PI / 2); g.translate(s > 0 ? W / 2 : -W / 2 + CT, Y2T, 0);
    add(L2, 'wall', g);
    const x = s * (W / 2 + .002);
    seg(L2, [x, Y2T, -D / 2, x, YR, 0, x, YR, 0, x, Y2T, D / 2]);
  });
  /* roof: two sheets with thickness and ribs, ridge capping, fascia, barge boards, soffits, gutters, downpipes */
  const RL = W + 2 * GOV, SLEN = ZE / Math.cos(PITCH) + .06;
  [-1, 1].forEach(s => {
    const zc = s * ZE / 2, n = V(0, Math.cos(PITCH), s * Math.sin(PITCH));
    const c = V(0, yU(zc), zc).addScaledVector(n, RT / 2);
    const m = new T.Matrix4().makeRotationX(s * PITCH); m.setPosition(c);
    const g = new T.BoxGeometry(RL, RT, SLEN); g.applyMatrix4(m); add(L2, 'roof', g); edge(L2, g);
    for (let x = -RL / 2 + .12; x < RL / 2 - .05; x += .28) {
      const r = new T.BoxGeometry(.06, .05, SLEN - .02), mr = m.clone(); mr.setPosition(c.clone().addScaledVector(n, RT / 2 + .022).add(V(x, 0, 0)));
      r.applyMatrix4(mr); add(L2, 'roof', r);
    }
    const ye = yU(ZE);
    bx(L2, 'trim', -RL / 2, RL / 2, ye - .2, ye + .02, s * ZE - (s > 0 ? .04 : -.04), s * ZE, true);
    bx(L2, 'wall', -W / 2 - GOV, W / 2 + GOV, ye - .2, ye - .18, s > 0 ? D / 2 : -ZE, s > 0 ? ZE : -D / 2);
    bx(L2, 'gutter', -RL / 2, RL / 2 + .02, ye - .2, ye - .06, s > 0 ? ZE : -ZE - .13, s > 0 ? ZE + .13 : -ZE, true);
    [-1, 1].forEach(t => beam(L2, 'trim', V(t * RL / 2, ye - .02, s * ZE), V(t * RL / 2, YR + RT + .02, 0), .05, .2, true));
  });
  beam(L2, 'gutter', V(-RL / 2, YR + RT + .04, 0), V(RL / 2, YR + RT + .04, 0), .16, .1, true);
  [[W / 2 + .1, D / 2 + .22], [-W / 2 - .1, D / 2 + .22], [W / 2 + .1, -D / 2 - .22]].forEach(([x, z]) => {
    const g = new T.CylinderGeometry(.045, .045, yU(ZE) - .16, 10); g.translate(x, (yU(ZE) - .16) / 2, z); add(L2, 'gutter', g);
  });
  /* porch over the front door: two posts and a thin skillion roof */
  const PY = Y1 + H1 + .05;
  [-1.55, 1.35].forEach(x => bx(L2, 'trim', x - .06, x + .06, .16, PY, D / 2 + 1.42, D / 2 + 1.54, true));
  beam(L2, 'roof', V(-1.75, PY + .2, D / 2 + .02 + .8), V(1.55, PY + .2, D / 2 + .02 + .8), 1.7, .1, false);
  bx(L2, 'trim', -1.75, 1.55, PY, PY + .14, D / 2 + 1.6, D / 2 + 1.68, true);
  L2.anchors = [V(RL / 2, yU(ZE), ZE), V(RL / 2, yU(ZE), -ZE), V(-RL / 2, yU(ZE), ZE)];

  /* 04 Fixing: linings on the far walls (a cut-away), an upper floor, partitions, a kitchen bench and island, stairs */
  const L3 = layers[3], LD = CT + FD;
  ['b', 'l'].forEach(w => [['g', Y1, H1], ['t', Y2, H2]].forEach(([s, y0, h]) => {
    const u0 = w === 'b' ? -W / 2 + LD : -D / 2 + LD + .015, u1 = w === 'b' ? W / 2 - LD : D / 2 - LD;
    pieces(u0, u1, h, WL[w][s]).forEach(r => wbox(L3, 'lining', w, r[0], r[1], y0 + r[2], y0 + r[3], LD, LD + .015));
    outline(L3, w, u0, u1, y0, y0 + h, LD + .016);
    WL[w][s].forEach(o => outline(L3, w, o[0], o[1], y0 + o[2], y0 + o[3], LD + .016));
  }));
  bx(L3, 'lining', -W / 2 + LD, W / 2 - LD, Y2 - .03, Y2, -D / 2 + LD, -.2, true);
  [[.2, -.2], [2.8, -.2]].forEach(([x]) => {
    pieces(-D / 2 + LD, -.2, H2, [[-1.6, -.75, 0, 2.05]]).forEach(r => bx(L3, 'lining', x - .05, x + .05, Y2 + r[2], Y2 + r[3], r[0], r[1], true));
  });
  bx(L3, 'lining', -1.6, -1.5, Y1, Y1 + H1, -D / 2 + LD, -2.3, true);
  /* kitchen: base cabinets under the back window, an island, benchtops in ink */
  bx(L3, 'bench', -4.75, -1.9, Y1, Y1 + .86, -D / 2 + LD, -D / 2 + LD + .58, true);
  bx(L3, 'top', -4.78, -1.87, Y1 + .86, Y1 + .9, -D / 2 + LD, -D / 2 + LD + .62, true);
  bx(L3, 'bench', -3.9, -2.2, Y1, Y1 + .86, -1.85, -1.05, true);
  bx(L3, 'top', -4.0, -2.1, Y1 + .86, Y1 + .9, -1.9, -1.0, true);
  /* stairs along the left wall, rising towards the back to the upper floor */
  const NS = 14, rise = (Y2 - Y1) / NS, go = 3.2 / NS, sx0 = -W / 2 + LD, sx1 = sx0 + 1.0, sz0 = 3.0;
  for (let k = 0; k < NS; k++) { const z = sz0 - k * go; bx(L3, 'tread', sx0, sx1, Y1 + k * rise, Y1 + (k + 1) * rise, z - go, z, true); }
  beam(L3, 'top', V(sx1 + .03, Y1 + .25, sz0), V(sx1 + .03, Y2 + .25, sz0 - NS * go), .05, .3, true);
  beam(L3, 'top', V(sx1 + .03, Y1 + 1.15, sz0), V(sx1 + .03, Y2 + 1.15, sz0 - NS * go), .05, .05, false);
  L3.anchors = [V(W / 2 - LD, Y2, -D / 2 + LD), V(2.8, Y2, -.2), V(-W / 2 + LD, Y2, D / 2 - LD)];

  /* 05 Practical completion: a lit window, a garden bed, a small tree, a path, a letterbox, a key tag on the door */
  const L4 = layers[4];
  { const o = WL.f.t[1]; wbox(L4, 'lit', 'f', o[0] + .06, o[1] - .06, Y2 + o[2] + .06, Y2 + o[3] - .06, .03, .04); }
  const GZ0 = D / 2 + .35, GZ1 = D / 2 + 1.25;
  bx(L4, 'trunk', 1.7, 4.6, 0, .32, GZ0, GZ1, true);
  bx(L4, 'soil', 1.76, 4.54, .32, .36, GZ0 + .06, GZ1 - .06);
  const shrub = (x, z, r, y) => { const g = new T.IcosahedronGeometry(r, 0); g.rotateY(x * 2.1); g.translate(x, y || .36 + r * .7, z); add(L4, 'leaf', g); };
  shrub(2.2, D / 2 + .8, .34); shrub(2.95, D / 2 + .72, .28); shrub(3.6, D / 2 + .85, .36); shrub(4.2, D / 2 + .75, .26);
  const TX = -W / 2 - .7, TZ = D / 2 + 1.5;
  { const g = new T.CylinderGeometry(.08, .12, 2.0, 7); g.translate(TX, 1.0, TZ); add(L4, 'trunk', g); }
  [[0, 2.5, 0, .95], [.45, 2.15, .2, .7], [-.38, 2.05, -.25, .66], [.05, 3.15, .05, .62]].forEach(([x, y, z, r]) => { const g = new T.DodecahedronGeometry(r, 0); g.rotateY(x * 3 + z); g.translate(TX + x, y, TZ + z); add(L4, 'leaf', g); });
  for (let k = 0; k < 4; k++) bx(L4, 'path', -.6, .5, 0, .05, D / 2 + 1.85 + k * .55, D / 2 + 2.3 + k * .55, true);
  const LX = 1.1, LZ = D / 2 + 3.6;
  bx(L4, 'trunk', LX - .04, LX + .04, 0, .95, LZ - .04, LZ + .04, true);
  bx(L4, 'box', LX - .2, LX + .2, .95, 1.27, LZ - .23, LZ + .23, true);
  bx(L4, 'trim', LX - .17, LX + .17, 1.16, 1.19, LZ + .231, LZ + .25);
  { const o = WL.f.g[1], hx = o[1] - .17, hy = Y1 + .96, z = D / 2 + .035;
    const ring = new T.TorusGeometry(.045, .012, 6, 14); ring.translate(hx, hy, z); add(L4, 'ring', ring);
    bx(L4, 'tag', hx - .055, hx + .055, hy - .26, hy - .06, z - .008, z + .008, true); }
  L4.anchors = [V(TX + .95, 3.0, TZ), V(4.6, .36, GZ1), V(LX + .2, 1.27, LZ), V(.8, Y2 + 2.1, D / 2)];

  /* ---------- scene ---------- */
  let renderer;
  try { renderer = new T.WebGLRenderer({ antialias: !LITE, alpha: true, powerPreference: 'low-power' }); } catch (e) { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.debug.checkShaderErrors = false; /* skips the blocking shader-log reads; the shaders are fixed and tested */
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  /* the shadow map is redrawn only when a layer, its fade or the sun moves, never for a camera turn alone */
  renderer.shadowMap.autoUpdate = false; renderer.shadowMap.needsUpdate = true;
  const cv = renderer.domElement; cv.className = 'l3-cv'; cv.setAttribute('aria-hidden', 'true');
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(24, 1, .5, 400);

  /* weatherboard: a small generated texture, mapped by world height so the boards line up around the house */
  const tc = d.createElement('canvas'); tc.width = 4; tc.height = 32;
  const tx = tc.getContext('2d'); const grd = tx.createLinearGradient(0, 0, 0, 32);
  grd.addColorStop(0, '#ffffff'); grd.addColorStop(.86, '#eceae6'); grd.addColorStop(.87, '#a9a6a0'); grd.addColorStop(.95, '#c9c6c0'); grd.addColorStop(1, '#ffffff');
  tx.fillStyle = grd; tx.fillRect(0, 0, 4, 32);
  const wb = new T.CanvasTexture(tc); wb.wrapS = wb.wrapT = T.RepeatWrapping; wb.colorSpace = T.SRGBColorSpace; wb.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  function worldUV(g) {
    const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv;
    for (let k = 0; k < p.count; k++) {
      const x = p.getX(k), y = p.getY(k), z = p.getZ(k), ny = Math.abs(n.getY(k));
      uv.setXY(k, (ny > .5 ? x : x + z) * 2, (ny > .5 ? z : y) / .19);
    }
  }
  function merge(list) {
    const arr = list.map(g => g.index ? g.toNonIndexed() : g); let n = 0; arr.forEach(g => { n += g.attributes.position.count; });
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2); let o = 0;
    arr.forEach(g => { pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); if (g.attributes.uv) uv.set(g.attributes.uv.array, o * 2); o += g.attributes.position.count; g.dispose(); });
    const out = new T.BufferGeometry();
    out.setAttribute('position', new T.BufferAttribute(pos, 3)); out.setAttribute('normal', new T.BufferAttribute(nor, 3)); out.setAttribute('uv', new T.BufferAttribute(uv, 2));
    return out;
  }
  const model = new T.Group(); scene.add(model);
  layers.forEach(ly => {
    ly.group = new T.Group(); model.add(ly.group); ly.mats = [];
    const bb = new T.Box3();
    Object.keys(ly.parts).forEach(key => {
      const g = merge(ly.parts[key]); if (key === 'wall') worldUV(g);
      g.computeBoundingBox(); bb.union(g.boundingBox);
      const opt = { transparent: true, opacity: 1, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 };
      const mat = BASIC[key] ? new T.MeshBasicMaterial(opt) : new T.MeshLambertMaterial(Object.assign(opt, { flatShading: !!FLAT[key], map: key === 'wall' ? wb : null }));
      mat.userData = { key, op: OPA[key] || 1 };
      const mesh = new T.Mesh(g, mat);
      mesh.castShadow = !NOSHADOW[key]; mesh.receiveShadow = !BASIC[key];
      mesh.renderOrder = key === 'glass' ? 4 : key === 'lit' ? 5 : 2;
      ly.group.add(mesh); ly.mats.push(mat);
    });
    ly.y0 = bb.min.y; ly.y1 = bb.max.y; ly.box = bb;
    if (ly.edges.length) {
      let n = 0; ly.edges.forEach(a => { n += a.length; }); const arr = new Float32Array(n); let o = 0; ly.edges.forEach(a => { arr.set(a, o); o += a.length; });
      const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(arr, 3));
      ly.lineMat = new T.LineBasicMaterial({ transparent: true, depthWrite: false });
      const ls = new T.LineSegments(g, ly.lineMat); ls.renderOrder = 6; ly.group.add(ls);
    }
  });
  /* set-out strings: always drawn, in the main accent */
  const soMat = new T.LineBasicMaterial({ transparent: true });
  { const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(new Float32Array(SO), 3)); const ls = new T.LineSegments(g, soMat); ls.renderOrder = 6; L0.group.add(ls); L0.so = soMat; }
  const FOOT = new T.Box3(); layers.forEach(ly => FOOT.union(ly.box));
  /* exploded-view guides: dashed lines at the four corners, drawn up to the top of the stack as it opens */
  const GD = [], DASH = .32;
  for (let y = 0; y < 34; y += DASH) [-1, 1].forEach(sx => [-1, 1].forEach(sz => GD.push(sx * (W / 2 + .3), y, sz * (D / 2 + .3), sx * (W / 2 + .3), y + DASH * .55, sz * (D / 2 + .3))));
  const guide = new T.LineSegments(new T.BufferGeometry().setAttribute('position', new T.BufferAttribute(new Float32Array(GD), 3)), new T.LineBasicMaterial({ transparent: true, depthWrite: false }));
  guide.renderOrder = 6; scene.add(guide);

  /* ground: a shadow catcher and a faint drawing-sheet grid that fades out */
  const ground = new T.Mesh(new T.PlaneGeometry(90, 90), new T.ShadowMaterial({ transparent: true }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; ground.renderOrder = 0; scene.add(ground);
  const gridMat = new T.ShaderMaterial({
    transparent: true, depthWrite: false, extensions: { derivatives: true },
    uniforms: { uC: { value: new T.Color() }, uA: { value: .2 }, uR: { value: 15 } },
    vertexShader: 'varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
    fragmentShader: 'uniform vec3 uC;uniform float uA;uniform float uR;varying vec3 vW;' +
      'float ln(vec2 p,float s,float w){vec2 q=p/s;vec2 g=abs(fract(q-.5)-.5)/fwidth(q);return 1.-min(min(g.x,g.y)/w,1.);}' +
      'void main(){float m=max(ln(vW.xz,1.,1.)*.45,ln(vW.xz,5.,1.2));float f=1.-smoothstep(uR*.35,uR,length(vW.xz));gl_FragColor=vec4(uC,m*f*uA);\n' +
      '#include <colorspace_fragment>\n}'
  });
  const grid = new T.Mesh(new T.PlaneGeometry(60, 60), gridMat); grid.rotation.x = -Math.PI / 2; grid.position.y = .004; grid.renderOrder = 1; scene.add(grid);

  const hemi = new T.HemisphereLight(0xffffff, 0xffffff, 2.1); scene.add(hemi);
  const sun = new T.DirectionalLight(0xffffff, 1.35);
  sun.position.set(-6, 20, 14); sun.castShadow = true;
  const SM = LITE ? 1024 : COARSE ? 1536 : 2048;
  sun.shadow.mapSize.set(SM, SM);
  Object.assign(sun.shadow.camera, { left: -19, right: 19, top: 19, bottom: -19, near: 1, far: 80 });
  sun.shadow.bias = -.0006; sun.shadow.normalBias = .03;
  scene.add(sun); scene.add(sun.target);

  /* ---------- colour ---------- */
  function recolour() {
    readPalette();
    layers.forEach(ly => ly.mats.forEach(m => { m.userData.base = R[m.userData.key](); }));
    ground.material.color.copy(P.ink); ground.material.opacity = P.dark ? .38 : .16;
    gridMat.uniforms.uC.value.copy(P.ink); gridMat.uniforms.uA.value = P.dark ? .2 : .16;
    hemi.color.set(0xffffff).lerp(P.field, .25); hemi.groundColor.copy(P.dark ? mix('paper-2', 'ink-3', .5) : P['paper-2']);
    hemi.intensity = P.dark ? 2.5 : 2.1; sun.intensity = P.dark ? 1.15 : 1.35;
    dirty = true;
  }
  function paint() {
    layers.forEach(ly => {
      const hl = ly.on, a = ly.dim;
      ly.mats.forEach(m => {
        const u = m.userData; m.color.copy(u.base);
        if (hl > 0) m.color.lerp(P.rust, hl * (u.key === 'glass' || u.key === 'lit' ? .3 : .62));
        m.opacity = u.op * a; m.depthWrite = u.key !== 'glass' && a > .97;
      });
      ly.group.traverse(o => { if (o.isMesh && !NOSHADOW[o.material.userData.key]) o.castShadow = a > .6; });
      if (ly.lineMat) { ly.lineMat.color.copy(P.ink).lerp(P.rust, hl); ly.lineMat.opacity = (P.dark ? .3 : .34 + .3 * hl) * a; }
      if (ly.so) { ly.so.color.copy(P.rust); ly.so.opacity = .9 * a; }
    });
    guide.material.color.copy(P.ink);
  }

  /* ---------- labels: the existing names, as positioned HTML beside the model ---------- */
  const labs = d.createElement('div'); labs.className = 'l3-labs'; labs.setAttribute('aria-hidden', 'true');
  layers.forEach(ly => {
    const el = d.createElement('span'); el.className = 'l3-lab'; el.innerHTML = '<i class="l3-ld"></i><i class="l3-dt"></i><b></b>';
    el.querySelector('b').textContent = ly.name; labs.appendChild(el);
    ly.el = el; ly.ld = el.querySelector('.l3-ld'); ly.dt = el.querySelector('.l3-dt'); ly.chip = el.querySelector('b'); ly.sx = null;
  });

  /* ---------- state: explode (lift), highlight (on), fade (dim), label (lab); all tweened ---------- */
  const eIO = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
  const eOut = p => 1 - Math.pow(1 - p, 3);
  function tw(o, k, to, dur, delay, ease) {
    if (REDUCE || !dur) { o[k] = to; o['_' + k] = null; dirty = true; return; }
    o['_' + k] = { f: o[k], to, t0: now() + (delay || 0), dur, e: ease || eOut }; dirty = true;
  }
  function step(o, k, t) {
    const a = o['_' + k]; if (!a) return false;
    const p = (t - a.t0) / a.dur; if (p < 0) return true;
    if (p >= 1) { o[k] = a.to; o['_' + k] = null; return true; }
    o[k] = a.f + (a.to - a.f) * a.e(p); return true;
  }
  let holdUntil = 0, holdT = 0, introDone = false, focus = -1, dirty = true;
  function settle() { holdUntil = 0; layers.forEach((ly, i) => { tw(ly, 'lift', 0, 1700, (4 - i) * 90, eIO); tw(ly, 'lab', 0, 600, 0); }); kick(); }
  function intro(fromCss) {
    introDone = true;
    if (REDUCE) return;
    const hold = fromCss ? 2400 : 1650 + 3200;
    layers.forEach((ly, i) => { if (fromCss) { ly.lift = 1; ly.lab = 1; } else { tw(ly, 'lift', 1, 1250, i * 95, eIO); tw(ly, 'lab', 1, 700, 650 + i * 170); } });
    holdUntil = now() + hold; clearTimeout(holdT); holdT = setTimeout(() => { if (focus < 0) settle(); }, hold);
  }
  function setFocus(n) {
    if (n === focus) return; focus = n;
    if (n >= 0) {
      layers.forEach((ly, i) => { tw(ly, 'lift', 1, 1100, 0, eOut); tw(ly, 'on', i === n ? 1 : 0, 800); tw(ly, 'dim', i === n ? 1 : .26, 800); tw(ly, 'lab', 1, 500); });
    } else {
      layers.forEach(ly => { tw(ly, 'on', 0, 800); tw(ly, 'dim', 1, 800); });
      if (now() < holdUntil) { clearTimeout(holdT); holdT = setTimeout(() => { if (focus < 0) settle(); }, holdUntil - now()); } else settle();
    }
    kick();
  }
  const items = [...sec.querySelectorAll('.layers-list li')];
  const canHover = matchMedia('(hover:hover)').matches;
  let hov = -1, foc = -1;
  const upd = () => setFocus(hov >= 0 ? hov : foc);
  items.forEach((li, i) => {
    if (canHover) {
      li.addEventListener('pointerenter', e => { if (e.pointerType !== 'touch') { hov = i; upd(); } });
      li.addEventListener('pointerleave', () => { if (hov === i) { hov = -1; upd(); } });
    }
    li.addEventListener('focus', () => { let v = false; try { v = li.matches(':focus-visible'); } catch (e) { v = true; } foc = v ? i : -1; upd(); });
    li.addEventListener('blur', () => { if (foc === i) { foc = -1; upd(); } });
  });

  /* ---------- camera: a slow turn, drag to orbit with inertia; no cursor tilt (house rule) ---------- */
  const AZ0 = rad(36), AZMIN = rad(-40), AZMAX = rad(100), SW0 = rad(18), SW1 = rad(56);
  let az = AZ0, azV = 0, dir = 1, drag = null, lastDrag = -1e9, leanX = 0, leanY = 0, tLeanX = 0, tLeanY = 0;
  cv.addEventListener('pointerdown', e => {
    if (e.button && e.button !== 0) return;
    drag = { x: e.clientX, t: now(), v: 0 }; azV = 0; cv.setPointerCapture(e.pointerId); cv.classList.add('drag');
  });
  cv.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x, t = now(), dt = Math.max(1, t - drag.t);
    const k = rad(.42) * (420 / Math.max(300, box.clientWidth));
    az = Math.min(AZMAX + rad(8), Math.max(AZMIN - rad(8), az - dx * k));
    drag.v = drag.v * .5 + (-dx * k / dt) * .5; drag.x = e.clientX; drag.t = t; kick();
  });
  const endDrag = () => { if (!drag) return; azV = REDUCE ? 0 : Math.max(-.004, Math.min(.004, drag.v)); drag = null; lastDrag = now(); cv.classList.remove('drag'); kick(); };
  cv.addEventListener('pointerup', endDrag); cv.addEventListener('pointercancel', endDrag); cv.addEventListener('lostpointercapture', endDrag);

  /* fit the current stack (rotation-independent: sampled over the turning range) into the free part of the canvas */
  const tgt = new T.Vector3(), f = new T.Vector3(), rv = new T.Vector3(), uv = new T.Vector3(), pt = new T.Vector3();
  let vw = 1, vh = 1, labW = 160, labFrac = 0, fitD = 40;
  function fit(el, labShare) {
    let y0 = 1e9, y1 = -1e9;
    layers.forEach(ly => { const y = ly.group.position.y; y0 = Math.min(y0, ly.y0 + y); y1 = Math.max(y1, ly.y1 + y); });
    y0 = Math.max(0, y0);
    const cx = (FOOT.min.x + FOOT.max.x) / 2, cz = (FOOT.min.z + FOOT.max.z) / 2, cy = (y0 + y1) / 2;
    const tH = Math.tan(rad(camera.fov / 2)) * camera.aspect * (1 - labShare) * .9, tV = Math.tan(rad(camera.fov / 2)) * .86;
    let need = 0;
    [SW0 - rad(6), (SW0 + SW1) / 2, SW1 + rad(6)].forEach(a => {
      f.set(Math.sin(a) * Math.cos(el), Math.sin(el), Math.cos(a) * Math.cos(el)); rv.set(Math.cos(a), 0, -Math.sin(a)); uv.crossVectors(f, rv);
      [FOOT.min.x, FOOT.max.x].forEach(x => [FOOT.min.z, FOOT.max.z].forEach(z => [y0, y1].forEach(y => {
        pt.set(x - cx, y - cy, z - cz);
        const df = pt.dot(f); need = Math.max(need, df + Math.abs(pt.dot(rv)) / tH, df + Math.abs(pt.dot(uv)) / tV);
      })));
    });
    tgt.set(cx, cy, cz); return need;
  }

  /* ---------- frame loop ---------- */
  const EXK = () => vw < 600 ? .8 : 1, PHZ = .2;
  let raf = 0, last = 0, onScreen = false, ready = false, sunX = NaN, sunY = NaN, sunZ = NaN;
  const scr = new T.Vector3();
  function proj(v) { scr.copy(v).project(camera); return [(scr.x + 1) / 2 * vw, (1 - scr.y) / 2 * vh]; }
  function frame() {
    const t = now(); raf = 0; const dt = Math.min(50, last ? t - last : 16); last = t;
    let moving = false;
    layers.forEach(ly => { ['lift', 'on', 'dim', 'lab'].forEach(k => { if (step(ly, k, t)) moving = true; }); });
    const tween = moving;
    /* lifts: a stacked exploded view; a stage in focus rises a little further */
    const k = EXK(), EX = [0, 1.0, 7.9, 14.9, 26.2];
    layers.forEach((ly, i) => { ly.group.position.y = (EX[i] * ly.lift) * k + ly.on * 1.1; });
    { const top = Math.max(...layers.map(ly => ly.group.position.y + Math.min(ly.y1, Y2T))), ex2 = Math.max(...layers.map(ly => ly.lift));
      guide.geometry.setDrawRange(0, Math.max(0, Math.floor(top / DASH)) * 8); guide.visible = ex2 > .02;
      guide.material.opacity = (P.dark ? .3 : .28) * Math.min(1, ex2 * 1.5); }
    /* turning */
    if (!REDUCE && !drag) {
      if (Math.abs(azV) > 1e-5) { az += azV * dt; azV *= Math.pow(.93, dt / 16); moving = true; }
      else if (SWAY && t - lastDrag > 1600) {
        if (az > SW1) dir = -1; else if (az < SW0) dir = 1;
        az += dir * rad(2.4) * dt / 1000; moving = true;
      }
      if (az > AZMAX) az += (AZMAX - az) * .12; if (az < AZMIN) az += (AZMIN - az) * .12;
    }
    leanX += (tLeanX - leanX) * Math.min(1, dt / 260); leanY += (tLeanY - leanY) * Math.min(1, dt / 260);
    if (Math.abs(tLeanX - leanX) + Math.abs(tLeanY - leanY) > .002) moving = true;
    const ex = Math.max(...layers.map(ly => ly.lift)), lv = Math.max(...layers.map(ly => ly.lab));
    const el = rad(22 + 4 * ex) + leanY * rad(-2.5), a = az + leanX * rad(4);
    labFrac = Math.min(.42, (labW + 30) / vw) * Math.min(1, lv * 1.4);
    fitD = fit(el, labFrac);
    /* phones: the fit above leaves room for the whole turning range, which on a small canvas leaves the settled house
       small; come in a little closer once it has settled (eased with the explode). Wider canvases are unchanged. */
    if (vw < 600) fitD /= 1 + PHZ * (1 - ex);
    camera.position.set(tgt.x + Math.sin(a) * Math.cos(el) * fitD, tgt.y + Math.sin(el) * fitD, tgt.z + Math.cos(a) * Math.cos(el) * fitD);
    camera.lookAt(tgt);
    /* lens shift: the model sits in the part of the canvas the labels leave free */
    camera.filmOffset = labFrac * Math.tan(rad(camera.fov / 2)) * camera.aspect * camera.getFilmWidth();
    camera.updateProjectionMatrix();
    sun.position.set(tgt.x - 6, 20 + tgt.y * .4, tgt.z + 14); sun.target.position.set(tgt.x * .5, 0, tgt.z);
    if (dirty || tween) { paint(); renderer.shadowMap.needsUpdate = true; }
    if (sun.position.x !== sunX || sun.position.y !== sunY || sun.position.z !== sunZ) { sunX = sun.position.x; sunY = sun.position.y; sunZ = sun.position.z; renderer.shadowMap.needsUpdate = true; }
    dirty = false;
    renderer.render(scene, camera);
    placeLabels(lv);
    if (!ready) { ready = true; box.classList.add('gl'); }
    /* keep drawing only while something moves (or the idle turn is on); otherwise hold the still frame until kick() */
    if (onScreen && !d.hidden && !REDUCE && (moving || drag || SWAY)) raf = requestAnimationFrame(frame);
    else if (REDUCE && moving) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && onScreen && !d.hidden) { last = 0; raf = requestAnimationFrame(frame); } }

  function placeLabels(lv) {
    labs.style.visibility = lv > .01 ? 'visible' : 'hidden';
    if (lv <= .01) return;
    const rows = layers.map(ly => {
      let best = null;
      ly.anchors.forEach(a => { pt.copy(a); pt.y += ly.group.position.y; const s = proj(pt); if (!best || s[0] > best[0]) best = s; });
      if (ly.sx == null || !ly.lab) { ly.sx = best[0]; ly.sy = best[1]; } else { ly.sx += (best[0] - ly.sx) * .3; ly.sy += (best[1] - ly.sy) * .3; }
      if (!ly.cw) { ly.cw = ly.chip.offsetWidth; ly.ch = ly.chip.offsetHeight; }
      return { ly, ax: ly.sx, ay: ly.sy, y: ly.sy, h: ly.ch || 26 };
    });
    let col = Math.max(...rows.map(r => r.ax)) + 22;
    rows.sort((p, q) => p.y - q.y);
    const gap = 6;
    for (let k = 1; k < rows.length; k++) { const p = rows[k - 1], q = rows[k]; const min = p.y + (p.h + q.h) / 2 + gap; if (q.y < min) q.y = min; }
    const over = rows[rows.length - 1].y + rows[rows.length - 1].h / 2 - (vh - 6); if (over > 0) rows.forEach(r => { r.y -= over; });
    const top = rows[0].y - rows[0].h / 2 - 6; if (top < 0) rows.forEach(r => { r.y -= top; });
    rows.forEach(r => {
      const ly = r.ly, w = ly.cw || 120;
      const lx = Math.max(r.ax + 12, Math.min(col, vw - w - 6));
      const dx = lx - r.ax, dy = r.y - r.ay, len = Math.hypot(dx, dy), ang = Math.atan2(dy, dx);
      const o = ly.lab * (.55 + ly.dim * .45);
      ly.el.style.opacity = o.toFixed(3);
      ly.el.classList.toggle('on', ly.on > .5);
      ly.chip.style.transform = 'translate3d(' + lx.toFixed(1) + 'px,' + (r.y - (ly.ch || 24) / 2).toFixed(1) + 'px,0) scaleX(' + (.6 + .4 * Math.min(1, ly.lab)).toFixed(3) + ')';
      ly.ld.style.width = len.toFixed(1) + 'px';
      ly.ld.style.transform = 'translate3d(' + r.ax.toFixed(1) + 'px,' + r.ay.toFixed(1) + 'px,0) rotate(' + ang.toFixed(4) + 'rad) scaleX(' + Math.min(1, ly.lab).toFixed(3) + ')';
      ly.dt.style.transform = 'translate3d(' + (r.ax - 3).toFixed(1) + 'px,' + (r.ay - 3).toFixed(1) + 'px,0)';
    });
  }

  /* ---------- size, visibility, theme ---------- */
  function resize() {
    const w = Math.max(1, box.clientWidth), h = Math.max(1, box.clientHeight);
    vw = w; vh = h; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    layers.forEach(ly => { ly.cw = 0; });
    labW = Math.max(...layers.map(ly => ly.chip.offsetWidth || 120)) || 150;
    dirty = true; if (ready) { if (REDUCE || !raf) frame(); }
  }
  box.appendChild(cv); box.appendChild(labs);
  recolour();
  new ResizeObserver(resize).observe(box);
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(() => { layers.forEach(ly => { ly.cw = 0; }); });
  resize();
  new IntersectionObserver(es => { onScreen = es[es.length - 1].isIntersecting; if (onScreen) kick(); }).observe(box);
  const iio = new IntersectionObserver(es => { if (es[es.length - 1].isIntersecting && !introDone) { iio.disconnect(); intro(false); kick(); } }, { threshold: .5 });
  d.addEventListener('visibilitychange', () => { if (!d.hidden) kick(); });
  new MutationObserver(() => { recolour(); paint(); if (!raf) frame(); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  cv.addEventListener('webglcontextlost', e => { e.preventDefault(); box.classList.remove('gl'); onScreen = false; });
  /* first frame: if the CSS model is mid-explode, start apart and settle; then swap the CSS model out */
  if (box.classList.contains('apart') && !REDUCE) intro(true);
  /* the shaders compile in parallel where the browser allows it, and the first frame draws in a later task,
     so the build and the first draw are two shorter pieces of work instead of one long one */
  const first = () => { if (!ready) frame(); };
  if (renderer.compileAsync) renderer.compileAsync(scene, camera).then(first, first); else requestAnimationFrame(first);
  if (!introDone) iio.observe(box);
}
