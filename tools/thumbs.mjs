// Generate designs/NN-slug/thumb.webp (720x450) + thumb.jpg for each concept.
// Run: node tools/thumbs.mjs [slug...]
import { createRequire } from "node:module";
import { spawn, execSync } from "node:child_process";
import { readdirSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require(path.join(execSync("npm root -g").toString().trim(), "playwright"))); }
const SITE = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DES = path.join(SITE, "designs");
const PORT = 5200 + Math.floor(Math.random() * 300);
const srv = spawn("python3", ["-m", "http.server", String(PORT), "--bind", "127.0.0.1"], { cwd: SITE, stdio: "ignore" });
await new Promise(r => setTimeout(r, 800));
const slugs = process.argv.slice(2).length ? process.argv.slice(2) : readdirSync(DES).filter(d => /^\d\d-/.test(d) && existsSync(path.join(DES, d, "index.html")));
const b = await chromium.launch();
for (const slug of slugs) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 0.5 });
  const p = await ctx.newPage();
  await p.goto(`http://127.0.0.1:${PORT}/designs/${slug}/`, { waitUntil: "load" });
  await p.waitForTimeout(4500); // let intro / preloader animations settle
  await p.evaluate(() => document.querySelector("[data-concept-switcher]")?.remove());
  const jpg = await p.screenshot({ type: "jpeg", quality: 82 });
  writeFileSync(path.join(DES, slug, "thumb.jpg"), jpg);
  const webp = await p.evaluate(async b64 => {
    const img = new Image(); img.src = "data:image/jpeg;base64," + b64; await img.decode();
    const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
    c.getContext("2d").drawImage(img, 0, 0); return c.toDataURL("image/webp", 0.8).split(",")[1];
  }, jpg.toString("base64"));
  writeFileSync(path.join(DES, slug, "thumb.webp"), Buffer.from(webp, "base64"));
  console.log("thumb", slug);
  await ctx.close();
}
await b.close(); srv.kill();
