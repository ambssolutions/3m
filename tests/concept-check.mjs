// Per-concept check: overlapping or off-screen text at phone and laptop sizes, horizontal scroll, console errors.
// Run from the repo root: node tests/concept-check.mjs 02-blueprint
import { createRequire } from "node:module"; import { execSync, spawn } from "node:child_process"; import path from "node:path"; import { mkdirSync } from "node:fs";
const require = createRequire(import.meta.url);
let chromium; try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require(path.join(execSync("npm root -g").toString().trim(), "playwright"))); }
const SITE = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const slug = process.argv[2]; if (!slug) { console.log("usage: node tests/concept-check.mjs NN-slug"); process.exit(2); }
const OUT = path.join(SITE, "tests/out", slug); mkdirSync(OUT, { recursive: true });
const PORT = 6300 + Math.floor(Math.random() * 300);
const srv = spawn("python3", ["-m", "http.server", String(PORT), "--bind", "127.0.0.1"], { cwd: SITE, stdio: "ignore" });
await new Promise(r => setTimeout(r, 800));
const b = await chromium.launch();
const SIZES = [[390, 844], [1280, 720], [1366, 768], [1440, 900], [1536, 864]];
let total = 0, errTotal = 0;
for (const [w, h] of SIZES) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on("console", m => { if (m.type() === "error") errs.push(m.text()); }); p.on("pageerror", e => errs.push(String(e)));
  await p.goto(`http://127.0.0.1:${PORT}/designs/${slug}/`, { waitUntil: "load" }); await p.waitForTimeout(2600);
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  const sw = await p.evaluate(() => document.documentElement.scrollWidth);
  const issues = [];
  if (sw > w + 1) issues.push(`horizontal scroll: page is ${sw}px wide`);
  for (let y = 0; y < H; y += Math.round(h * 0.8)) {
    await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(450);
    const found = await p.evaluate(() => {
      const W = innerWidth, VH = innerHeight, out = [];
      const isText = el => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
      const vis = el => { const s = getComputedStyle(el); return s.visibility !== "hidden" && s.display !== "none" && +s.opacity > 0.15; };
      const header = document.querySelector("header, .hdr, .nav, .site-header, [class*=header]");
      const els = [...document.querySelectorAll("h1,h2,h3,h4,p,li,a,button,span,dt,dd,label,small,b,strong,em,figcaption,td,th,blockquote")]
        .filter(el => isText(el) && vis(el) && !el.closest("[data-concept-switcher],[aria-hidden=true],.vh,.sr-only,.hp,[class*=marquee],[class*=ticker]"))
        .map(el => ({ el, r: el.getBoundingClientRect() }))
        .filter(o => o.r.width > 4 && o.r.height > 4 && o.r.bottom > 0 && o.r.top < VH && o.r.right > 0 && o.r.left < W);
      for (const o of els) if (o.r.right > W + 2 || o.r.left < -2) out.push(`offscreen: "${o.el.textContent.trim().slice(0, 40)}"`);
      for (const o of els) { const s = getComputedStyle(o.el); if ((s.overflow === "hidden" || s.overflowY === "hidden") && o.el.scrollHeight > o.el.clientHeight + 4 && !/ellipsis/.test(s.textOverflow)) out.push(`clipped: "${o.el.textContent.trim().slice(0, 40)}"`); }
      // Text on a page turned in perspective (any 3D transform): getBoundingClientRect gives the axis-aligned bounds of each
      // line's projected trapezoid, so the boxes of neighbouring lines cross while the lines themselves do not. A perspective
      // projection of a plane never makes two separate regions overlap, so for two elements on the same 3D-transformed
      // element the test uses their untransformed layout boxes on that element. Real overlaps there still count.
      const plane = x => { for (let n = x.parentElement; n; n = n.parentElement) { const t = getComputedStyle(n).transform; if (t && t !== "none" && !new DOMMatrixReadOnly(t).is2D) return n; } return null; };
      const flat = (x, anc) => { let l = 0, t = 0, n = x; while (n && n !== anc) { l += n.offsetLeft; t += n.offsetTop; n = n.offsetParent; } return n === anc ? { l, t, r: l + x.offsetWidth, b: t + x.offsetHeight } : null; };
      const apart = (a, c) => { const pa = plane(a.el); if (!pa || pa !== plane(c.el)) return false; const A = flat(a.el, pa), C = flat(c.el, pa); if (!A || !C) return false;
        return !(Math.min(A.r, C.r) - Math.max(A.l, C.l) > 6 && Math.min(A.b, C.b) - Math.max(A.t, C.t) > 6); };
      for (let i = 0; i < els.length; i++) for (let j = i + 1; j < els.length; j++) {
        const a = els[i], c = els[j]; if (a.el.contains(c.el) || c.el.contains(a.el)) continue;
        const ix = Math.min(a.r.right, c.r.right) - Math.max(a.r.left, c.r.left), iy = Math.min(a.r.bottom, c.r.bottom) - Math.max(a.r.top, c.r.top);
        if (ix > 6 && iy > 6 && ix * iy > 0.15 * Math.min(a.r.width * a.r.height, c.r.width * c.r.height) && !apart(a, c)) {
          const inH = x => header && header.contains(x.el); if (inH(a) !== inH(c)) continue;
          const cx = (Math.max(a.r.left, c.r.left) + Math.min(a.r.right, c.r.right)) / 2, cy = (Math.max(a.r.top, c.r.top) + Math.min(a.r.bottom, c.r.bottom)) / 2;
          const hit = document.elementFromPoint(cx, cy); if (!hit) continue;
          const top = a.el.contains(hit) || hit.contains(a.el) ? a : c.el.contains(hit) || hit.contains(c.el) ? c : null; if (!top) continue;
          const under = top === a ? c : a; let covered = false;
          for (let n = hit; n && !n.contains(under.el); n = n.parentElement) { const st = getComputedStyle(n), m = st.backgroundColor.match(/rgba?\(([^)]+)\)/); const alpha = m ? (m[1].split(",")[3] === undefined ? 1 : +m[1].split(",")[3]) : 0; if ((alpha >= 0.98 || st.backgroundImage !== "none") && +st.opacity >= 0.98) { covered = true; break; } if (alpha > 0 && alpha < 0.98) { out.push(`see-through layer over text: "${under.el.textContent.trim().slice(0, 30)}"`); covered = true; break; } }
          if (covered) continue;
          out.push(`overlap: "${a.el.textContent.trim().slice(0, 30)}" x "${c.el.textContent.trim().slice(0, 30)}"`);
        }
      }
      return out;
    });
    for (const f of found) if (!issues.includes(f)) issues.push(f);
  }
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(400);
  await p.screenshot({ path: path.join(OUT, `top-${w}x${h}.png`) });
  if (w === 390 || w === 1280) { await p.evaluate(() => { document.querySelectorAll(".rv,.reveal,[data-reveal]").forEach(e => e.classList.add("in")); }); await p.screenshot({ path: path.join(OUT, `full-${w}.png`), fullPage: true }); }
  total += issues.length; errTotal += errs.length;
  console.log(`${issues.length || errs.length ? "✗" : "✓"} ${slug} @${w}x${h} pageH=${H} errors=${errs.length}${errs.length ? "\n    " + errs.slice(0, 4).join("\n    ") : ""}${issues.length ? "\n    " + issues.slice(0, 10).join("\n    ") : ""}`);
  await p.close();
}
await b.close(); srv.kill();
console.log(`\n${total} layout issues, ${errTotal} console errors. Screenshots in tests/out/${slug}/`);
process.exit(total || errTotal ? 1 : 0);
