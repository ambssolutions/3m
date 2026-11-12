// Laptop-screen layout audit: overlapping/clipped text at common laptop viewports.
// Run: node tests/laptop.mjs [NN ...]   (screenshots go to tests/out/laptop/)
import { createRequire } from "node:module";
import { spawn, execSync } from "node:child_process";
import { readdirSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require(path.join(execSync("npm root -g").toString().trim(), "playwright"))); }
const SITE = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const OUT = path.join(SITE, "tests/out/laptop"); mkdirSync(OUT, { recursive: true });
const SIZES = [[1280, 720], [1366, 768], [1536, 864], [1440, 900]];
const PORT = 5900 + Math.floor(Math.random() * 300);
const srv = spawn("python3", ["-m", "http.server", String(PORT), "--bind", "127.0.0.1"], { cwd: SITE, stdio: "ignore" });
await new Promise(r => setTimeout(r, 800));
const want = process.argv.slice(2);
const DES = path.join(SITE, "designs");
const slugs = readdirSync(DES).filter(d => /^\d\d-/.test(d) && existsSync(path.join(DES, d, "index.html")) && (!want.length || want.some(w => d.startsWith(w))));
const b = await chromium.launch();
let total = 0;
for (const slug of slugs) {
  for (const pg of ["index.html", "services.html", "projects.html", "about.html", "contact.html", "project.html"]) {
    for (const [w, h] of SIZES) {
      const p = await b.newPage({ viewport: { width: w, height: h } });
      await p.goto(`http://127.0.0.1:${PORT}/designs/${slug}/${pg === "index.html" ? "" : pg}`, { waitUntil: "load" });
      await p.waitForTimeout(2600);
      const H = await p.evaluate(() => document.documentElement.scrollHeight);
      const issues = [];
      for (let y = 0; y < H; y += Math.round(h * 0.8)) {
        await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(450);
        const found = await p.evaluate(() => {
          const W = innerWidth, VH = innerHeight, out = [];
          const isText = el => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
          const vis = el => { const s = getComputedStyle(el); return s.visibility !== "hidden" && s.display !== "none" && +s.opacity > 0.15; };
          const header = document.querySelector("header, .nav, .site-header, [class*=header]");
          const els = [...document.querySelectorAll("h1,h2,h3,h4,p,li,a,button,span,dt,dd,label,blockquote,figcaption,small,strong,em")]
            .filter(el => isText(el) && vis(el) && !el.closest("[data-concept-switcher],[aria-hidden=true],.marquee,[class*=marquee],[class*=ticker],[class*=sr-only],.sr"))
            .map(el => ({ el, r: el.getBoundingClientRect() }))
            .filter(o => o.r.width > 4 && o.r.height > 4 && o.r.bottom > 0 && o.r.top < VH && o.r.right > 0 && o.r.left < W);
          // text running off-screen horizontally
          for (const o of els) if (o.r.right > W + 2 || o.r.left < -2) out.push(`offscreen: "${o.el.textContent.trim().slice(0, 40)}"`);
          // clipped text (scrollHeight > clientHeight with overflow hidden on itself)
          for (const o of els) { const s = getComputedStyle(o.el); if ((s.overflow === "hidden" || s.overflowY === "hidden") && o.el.scrollHeight > o.el.clientHeight + 4 && !/ellipsis/.test(s.textOverflow)) out.push(`clipped: "${o.el.textContent.trim().slice(0, 40)}"`); }
          // pairwise overlap of unrelated text boxes (use client rects per line to avoid inline false positives)
          for (let i = 0; i < els.length; i++) for (let j = i + 1; j < els.length; j++) {
            const a = els[i], c = els[j];
            if (a.el.contains(c.el) || c.el.contains(a.el)) continue;
            const ix = Math.min(a.r.right, c.r.right) - Math.max(a.r.left, c.r.left);
            const iy = Math.min(a.r.bottom, c.r.bottom) - Math.max(a.r.top, c.r.top);
            if (ix > 6 && iy > 6 && ix * iy > 0.15 * Math.min(a.r.width * a.r.height, c.r.width * c.r.height)) {
              // ignore if either is behind the other via fixed header compositing (header overlaps scrolled content is normal)
              const inHeader = x => header && header.contains(x.el);
              if (inHeader(a) !== inHeader(c)) continue;
              // is the lower element actually hidden by an opaque layer of the upper one? then it's intended stacking, not a bug
              const cx = (Math.max(a.r.left, c.r.left) + Math.min(a.r.right, c.r.right)) / 2, cy = (Math.max(a.r.top, c.r.top) + Math.min(a.r.bottom, c.r.bottom)) / 2;
              const hit = document.elementFromPoint(cx, cy);
              if (!hit) continue;
              const top = a.el.contains(hit) || hit.contains(a.el) ? a : c.el.contains(hit) || hit.contains(c.el) ? c : null;
              const under = top === a ? c : top === c ? a : null;
              if (!top) continue; // something else covers both
              let covered = false;
              for (let n = hit; n && !n.contains(under.el); n = n.parentElement) {
                const st = getComputedStyle(n), bg = st.backgroundColor, m = bg.match(/rgba?\(([^)]+)\)/);
                const alpha = m ? (m[1].split(",")[3] === undefined ? 1 : +m[1].split(",")[3]) : 0;
                const hasImg = st.backgroundImage !== "none";
                if ((alpha >= 0.98 || hasImg) && +st.opacity >= 0.98) { covered = true; break; }
                if (alpha > 0 && alpha < 0.98) { out.push(`see-through layer over text: "${under.el.textContent.trim().slice(0, 30)}"`); covered = true; break; }
              }
              if (covered) continue;
              out.push(`overlap: "${a.el.textContent.trim().slice(0, 30)}" × "${c.el.textContent.trim().slice(0, 30)}"`);
            }
          }
          // hero H1 cut by viewport bottom on first screen
          return out;
        });
        for (const f of found) if (!issues.includes(f)) issues.push(f);
        if (y === 0) await p.screenshot({ path: path.join(OUT, `${slug}-${pg.replace(".html", "")}-${w}x${h}-top.png`) });
      }
      total += issues.length;
      if (issues.length) console.log(`✗ ${slug}/${pg} @${w}x${h}: ${issues.length}\n    ` + issues.slice(0, 6).join("\n    "));
      await p.close();
    }
  }
}
await b.close(); srv.kill();
console.log(`\n${total} layout issues found`);
process.exit(total ? 1 : 0);
