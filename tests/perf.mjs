// Mobile performance budget for every page of a concept (or all concepts).
// Run: node tests/perf.mjs [NN ...]
// Emulates a mid-range phone: 390x844, 4x CPU throttle, ~1.6 Mbps, 150 ms latency.
import { createRequire } from "node:module";
import { spawn, execSync } from "node:child_process";
import { readdirSync, existsSync, statSync } from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); }
catch { ({ chromium } = require(path.join(execSync("npm root -g").toString().trim(), "playwright"))); }

const SITE = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DES = path.join(SITE, "designs");
const BUDGET = { lcp: 2500, cls: 0.05, tbt: 300, htmlKB: 150, weightKB: 1200 };
const PORT = 5600 + Math.floor(Math.random() * 300);
const srv = spawn("python3", ["-m", "http.server", String(PORT), "--bind", "127.0.0.1"], { cwd: SITE, stdio: "ignore" });
await new Promise(r => setTimeout(r, 800));

const want = process.argv.slice(2);
const slugs = readdirSync(DES).filter(d => /^\d\d-/.test(d) && existsSync(path.join(DES, d, "index.html")) && (!want.length || want.some(w => d.startsWith(w))));
const b = await chromium.launch();
let fails = 0, total = 0;

for (const slug of slugs) {
  console.log(`\n${slug}`);
  const pages = readdirSync(path.join(DES, slug)).filter(f => f.endsWith(".html")).sort((a, c) => (a === "index.html" ? -1 : c === "index.html" ? 1 : a.localeCompare(c)));
  for (const pg of pages) {
    const htmlKB = Math.round(statSync(path.join(DES, slug, pg)).size / 1024);
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const p = await ctx.newPage();
    const cdp = await ctx.newCDPSession(p);
    await cdp.send("Network.enable");
    await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    let bytes = 0;
    cdp.on("Network.loadingFinished", e => { bytes += e.encodedDataLength || 0; });
    await p.addInitScript(() => {
      window.__m = { lcp: 0, cls: 0, tbt: 0 };
      new PerformanceObserver(l => { for (const e of l.getEntries()) __m.lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) __m.cls += e.value; }).observe({ type: "layout-shift", buffered: true });
      new PerformanceObserver(l => { for (const e of l.getEntries()) __m.tbt += Math.max(0, e.duration - 50); }).observe({ type: "longtask", buffered: true });
    });
    await p.goto(`http://127.0.0.1:${PORT}/designs/${slug}/${pg === "index.html" ? "" : pg}`, { waitUntil: "load", timeout: 120000 });
    await p.waitForTimeout(5000);
    const m = await p.evaluate(() => ({ lcp: Math.round(__m.lcp), cls: +__m.cls.toFixed(3), tbt: Math.round(__m.tbt) }));
    const r = { ...m, htmlKB, weightKB: Math.round(bytes / 1024) };
    const bad = Object.keys(BUDGET).filter(k => r[k] > BUDGET[k]);
    total++; if (bad.length) fails++;
    console.log(`  ${bad.length ? "✗" : "✓"} ${pg.padEnd(14)} LCP ${r.lcp}ms  CLS ${r.cls}  TBT ${r.tbt}ms  HTML ${r.htmlKB}KB  weight ${r.weightKB}KB${bad.length ? "   over: " + bad.join(", ") : ""}`);
    await ctx.close();
  }
}
await b.close(); srv.kill();
console.log(`\n${total - fails}/${total} pages within budget (LCP<${BUDGET.lcp}ms, CLS<${BUDGET.cls}, TBT<${BUDGET.tbt}ms, HTML<${BUDGET.htmlKB}KB, weight<${BUDGET.weightKB}KB)`);
process.exit(fails ? 1 : 0);
