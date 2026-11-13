// Photograph every section of every design for the section picker: designs/<slug>/sec-<key>.webp (640x400).
// Run: node tools/section-thumbs.mjs [slug...]
import { createRequire } from "node:module"; import { spawn, execSync } from "node:child_process"; import { readFileSync, writeFileSync } from "node:fs"; import path from "node:path"; import vm from "node:vm";
const require = createRequire(import.meta.url);
let chromium; try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require(path.join(execSync("npm root -g").toString().trim(), "playwright"))); }
const SITE = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const ctx0 = { window: {} }; vm.runInNewContext(readFileSync(path.join(SITE, "assets/mix-data.js"), "utf8"), ctx0); const MIX = ctx0.window.MIX;
const want = process.argv.slice(2); const designs = MIX.designs.map(d => d[0]).filter(s => !want.length || want.includes(s));
const PORT = 5600 + Math.floor(Math.random() * 300);
const srv = spawn("python3", ["-m", "http.server", String(PORT), "--bind", "127.0.0.1"], { cwd: SITE, stdio: "ignore" }); await new Promise(r => setTimeout(r, 800));
const b = await chromium.launch();
for (const slug of designs) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 0.5 }); const p = await ctx.newPage();
  await p.goto(`http://127.0.0.1:${PORT}/designs/${slug}/`, { waitUntil: "load" }); await p.waitForTimeout(3200);
  for (const s of MIX.sections) {
    if (s.kind === 'theme' || (s.only && !s.only.includes(slug))) continue;
    const found = await p.evaluate(sel => { const e = document.querySelector(sel); if (!e) return false; const top = e.getBoundingClientRect().top + scrollY; const hdr = document.querySelector('header, .hdr'); const off = (hdr && getComputedStyle(hdr).position === 'fixed') ? hdr.offsetHeight : 0; scrollTo(0, sel === '#top' ? 0 : (sel.startsWith('footer') ? document.documentElement.scrollHeight : Math.max(0, top - off))); return true; }, s.sel);
    if (!found) { console.log("missing", slug, s.key); continue; }
    await p.waitForTimeout(s.key === 'layers' ? 6500 : s.key === 'hero' ? 400 : 2600);
    await p.evaluate(() => document.querySelector('[data-concept-switcher]')?.remove());
    const jpg = await p.screenshot({ type: "jpeg", quality: 80 });
    const webp = await p.evaluate(async b64 => { const img = new Image(); img.src = "data:image/jpeg;base64," + b64; await img.decode(); const c = document.createElement("canvas"); c.width = 640; c.height = 400; c.getContext("2d").drawImage(img, 0, 0, 640, 400); return c.toDataURL("image/webp", 0.78).split(",")[1]; }, jpg.toString("base64"));
    writeFileSync(path.join(SITE, "designs", slug, `sec-${s.key}.webp`), Buffer.from(webp, "base64"));
  }
  console.log("done", slug); await ctx.close();
}
await b.close(); srv.kill();
