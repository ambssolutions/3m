// End-to-end checks for the CLIENT NAME concept gallery and all 10 concept sites.
// Run:  node tests/e2e.mjs  (path is relative to this folder; works from anywhere)
// Needs Playwright (global install is fine) and Python 3 for the static server.
import { createRequire } from "node:module";
import { spawn, execSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); }
catch { ({ chromium } = require(path.join(execSync("npm root -g").toString().trim(), "playwright"))); }

const SITE = path.resolve(path.dirname(new URL(import.meta.url).pathname), ".."); // folder holding index.html + designs/
const PORT = 4173 + Math.floor(Math.random() * 500);
const BASE = `http://127.0.0.1:${PORT}/`;
const ONLY = process.argv[2]; // optional: "gallery" or one concept, e.g. "03"

const server = spawn("python3", ["-m", "http.server", String(PORT), "--bind", "127.0.0.1"], { cwd: SITE, stdio: "ignore" });
await new Promise(r => setTimeout(r, 800));

const exe = ["/opt/pw-browsers/chromium-1194/chrome-linux/chrome", "/opt/pw-browsers/chromium"].find(existsSync);
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const results = [];
const ok = (name, pass, detail = "") => { results.push({ name, pass, detail }); console.log(`${pass ? "  ✓" : "  ✗"} ${name}${detail && !pass ? "  → " + detail : ""}`); };

async function newPage(width, height = 900) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push(String(e.message || e)));
  page.on("console", m => { if (m.type() === "error" && !/favicon|Failed to load resource/i.test(m.text())) errors.push(m.text()); });
  page.on("response", r => { if (r.status() >= 400 && r.url().startsWith(`http://127.0.0.1:${PORT}`) && !/favicon/.test(r.url())) errors.push(`${r.status()} ${r.url()}`); });
  return { ctx, page, errors };
}

/* ---------------- gallery ---------------- */
async function testGallery() {
  console.log("\nGallery");
  const { ctx, page, errors } = await newPage(1440);
  await page.goto(BASE, { waitUntil: "load" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "load" });
  ok("gallery renders 10 concept cards", (await page.locator(".card").count()) === 10);

  await page.locator('.card[data-id="03"] .star').click();
  await page.locator('.card[data-id="07"] .star').click();
  ok("shortlisting updates counter", (await page.locator("#countTop").textContent()) === "2");
  ok("shortlist tray appears", await page.locator("#tray.show").isVisible());

  await page.reload({ waitUntil: "load" });
  ok("shortlist persists after reload", (await page.locator(".card.on").count()) === 2);

  await page.locator('[data-filter="short"]').click();
  ok("shortlist filter shows only shortlisted", (await page.locator(".card:not(.hidden)").count()) === 2);
  await page.locator('[data-filter="all"]').click();

  await page.locator("#compareBtn").click();
  ok("compare opens shortlisted concepts side by side", (await page.locator("#cStage iframe").count()) === 2);
  await page.keyboard.press("Escape");

  await page.locator('.card[data-id="01"] .thumb').click();
  ok("viewer opens concept 01", (await page.locator("#vFrame").getAttribute("src")).includes("01-terrain"));
  await page.keyboard.press("ArrowRight");
  ok("arrow key moves to concept 02", (await page.locator("#vFrame").getAttribute("src")).includes("02-"));
  await page.locator('#viewer [data-dev="mobile"]').click();
  ok("mobile device preview toggles", (await page.locator("#stage").getAttribute("data-dev")) === "mobile");
  await page.locator("#vPick").click();
  ok("'This is the one' opens send dialog with concept preselected", await page.locator("#dlg[open]").isVisible() &&
    (await page.locator('#opts input:checked').getAttribute("value")) === "02");

  await page.locator("#submitBtn").click();
  ok("send form validates missing name", (await page.locator("#err.show").textContent()).includes("name"));
  await page.fill("#fName", "Test Client");
  await page.fill("#fEmail", "client@example.com");
  await page.fill("#fNotes", "Love it");
  await page.locator("#submitBtn").click();
  ok("send form completes with thank-you state", await page.locator("#done").isVisible());
  ok("picked design is flagged on its card", (await page.locator(".card.pick").getAttribute("data-id")) === "02");
  await ctx.close();

  const s = await newPage(390, 844);
  await s.page.goto(BASE + "?s=04,09&p=09", { waitUntil: "load" });
  ok("share link seeds shortlist and pick", (await s.page.locator(".card.on").count()) === 2 &&
    (await s.page.locator(".card.pick").getAttribute("data-id")) === "09");
  ok("gallery has no horizontal overflow on mobile", await s.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  ok("gallery has no console errors", errors.length + s.errors.length === 0, [...errors, ...s.errors].slice(0, 3).join(" | "));
  await s.ctx.close();
}

/* ---------------- concept sites ---------------- */
const CONCEPTS = ["01-terrain","02-gradient","03-blueprint","04-editorial","05-midnight","06-swiss","07-landscape","08-bento","09-kinetic","10-corporate"];

async function crawl(slug) {
  // collect every internal .html page reachable from the concept's home
  const start = `${BASE}designs/${slug}/`;
  const seen = new Set([start]), queue = [start];
  const { ctx, page } = await newPage(1440);
  while (queue.length) {
    const u = queue.shift();
    const res = await page.goto(u, { waitUntil: "domcontentloaded" }).catch(() => null);
    if (!res || res.status() >= 400) continue;
    const hrefs = await page.$$eval("a[href]", as => as.map(a => a.href));
    for (const h of hrefs) {
      const clean = h.split("#")[0].split("?")[0];
      const norm = clean.endsWith("/index.html") ? clean.slice(0, -10) : clean;
      if (norm.startsWith(`${BASE}designs/${slug}/`) && (norm.endsWith(".html") || norm.endsWith("/")) && !seen.has(norm)) { seen.add(norm); queue.push(norm); }
    }
  }
  await ctx.close();
  return [...seen];
}

async function testConcept(slug) {
  console.log(`\n${slug}`);
  if (!existsSync(path.join(SITE, "designs", slug, "index.html"))) return ok(`${slug} exists`, false, "missing home page");
  const pages = await crawl(slug);
  const names = pages.map(p => p.replace(BASE + "designs/", ""));
  ok(`site has home + inner pages (${names.length})`, ["services","projects","about","contact"].every(n => names.some(x => x.endsWith(`${slug}/${n}.html`))), names.join(", "));

  for (const width of [1440, 390]) {
    for (const u of pages) {
      const label = `${u.replace(BASE + "designs/", "")} @${width}`;
      const { ctx, page, errors } = await newPage(width, width > 500 ? 900 : 844);
      const res = await page.goto(u, { waitUntil: "load" }).catch(e => ({ status: () => 0, err: e }));
      if (res.status() !== 200) { ok(`${label} loads`, false, `status ${res.status()}`); await ctx.close(); continue; }
      // scroll the whole page so scroll-triggered code runs
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += innerHeight * 0.7) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } scrollTo(0, 0); });
      await page.waitForTimeout(300);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      const missingAnchors = await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].map(a => a.getAttribute("href")).filter(h => h.length > 1 && !document.getElementById(decodeURIComponent(h.slice(1)))));
      const brokenLinks = await page.evaluate(async () => {
        const out = [];
        const urls = [...new Set([...document.querySelectorAll("a[href]")].map(a => a.href.split("#")[0]).filter(h => h.startsWith(location.origin)))];
        for (const h of urls) { try { const r = await fetch(h, { method: "HEAD" }); if (!r.ok) out.push(h); } catch { out.push(h); } }
        return out;
      });
      ok(`${label} no console errors`, errors.length === 0, errors.slice(0, 3).join(" | "));
      const copied = await page.evaluate(() => { const t = document.body.innerText.replace(/\s+/g, " "); return ["Six disciplines. One integrated team", "We make it easy. You see it through", "people love.", "Let's talk about your site", "Let’s talk about your site", "second to none", "—"].filter(x => t.includes(x)); });
      ok(`${label} no copied/template/banned copy`, !copied.length, copied.join(" | "));
      const realLogo = await page.evaluate(() => !![...document.querySelectorAll("header img, nav img, .nav img, .header img, img")].find(i => /assets\/logo\//.test(i.getAttribute("src") || "") && i.getBoundingClientRect().top < 120));
      ok(`${label} real logo in header`, realLogo);
      ok(`${label} no horizontal overflow`, overflow <= 1, `${overflow}px`);
      ok(`${label} no broken links/anchors`, !brokenLinks.length && !missingAnchors.length, [...brokenLinks, ...missingAnchors].slice(0, 4).join(", "));

      if (width === 390 && u.endsWith(`${slug}/`)) {
        // mobile menu: find a visible toggle that controls navigation
        const toggle = page.locator('button[aria-expanded], button[aria-controls], .menu-toggle, .burger, .hamburger').filter({ visible: true }).first();
        if (await toggle.count()) {
          await toggle.click(); await page.waitForTimeout(700);
          const links = await page.locator("a").filter({ visible: true }).filter({ hasText: /^\s*(services|projects|about|contact)\s*$/i }).count();
          ok(`${slug} mobile menu opens with nav links`, links >= 3, `${links} visible nav links`);
        } else ok(`${slug} mobile menu toggle present`, false, "no visible menu button at 390px");
      }

      if (width === 1440 && /\/contact\.html$/.test(u)) {
        const form = page.locator("form").filter({ has: page.locator('input[type="email"]') }).first();
        if (await form.count()) {
          await form.scrollIntoViewIfNeeded();
          const submit = form.locator('button[type="submit"], input[type="submit"], button:not([type])').last();
          await submit.click(); await page.waitForTimeout(400);
          const blocked = !(await page.getByText(/thank/i).filter({ visible: true }).count());
          ok(`${slug} contact form blocks empty submit`, blocked);
          for (const f of await form.locator("input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=submit]), textarea").all()) {
            if (!(await f.isVisible())) continue;
            if (await f.evaluate(el => !!el.closest('[aria-hidden="true"], .hp, .honeypot') || /company_website|honeypot|website_url/.test(el.name) || el.tabIndex < 0)) continue; // spam trap
            const t = (await f.getAttribute("type")) || "text";
            await f.fill(t === "email" ? "client@example.com" : t === "tel" ? "021 555 0123" : t === "number" ? "1" : "Test enquiry about a subdivision");
          }
          for (const s of await form.locator("select").all()) if (await s.isVisible() && (await s.locator("option").count()) > 1) await s.selectOption({ index: 1 });
          for (const c of await form.locator('input[type="checkbox"][required]').all()) await c.check();
          for (const r of await form.locator('input[type="radio"]').all()) { await r.check({ force: true }).catch(() => {}); break; }
          await submit.click(); await page.waitForTimeout(1200);
          ok(`${slug} contact form shows success after valid submit`, (await page.getByText(/thank|received|be in touch/i).filter({ visible: true }).count()) > 0);
        } else ok(`${slug} contact page has an enquiry form`, false);
      }
      await ctx.close();
    }
  }
}

try {
  if (!ONLY || ONLY === "gallery") await testGallery();
  if (ONLY !== "gallery") for (const c of CONCEPTS) if (!ONLY || c.startsWith(ONLY)) await testConcept(c);
} finally {
  await browser.close(); server.kill();
}
const failed = results.filter(r => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
