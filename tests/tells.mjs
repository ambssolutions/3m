// "Looks AI-generated" audit: template tells within each concept and sameness across concepts.
// Run: node tests/tells.mjs [NN ...]   (cross-concept checks always look at all ten home pages)
import { createRequire } from "node:module";
import { spawn, execSync } from "node:child_process";
import { readdirSync, existsSync } from "node:fs";
import path from "node:path";
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require(path.join(execSync("npm root -g").toString().trim(), "playwright"))); }
const SITE = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DES = path.join(SITE, "designs");
const PORT = 6200 + Math.floor(Math.random() * 300);
const srv = spawn("python3", ["-m", "http.server", String(PORT), "--bind", "127.0.0.1"], { cwd: SITE, stdio: "ignore" });
await new Promise(r => setTimeout(r, 800));
const all = readdirSync(DES).filter(d => /^\d\d-/.test(d) && existsSync(path.join(DES, d, "index.html")));
const want = process.argv.slice(2);
const slugs = all.filter(d => !want.length || want.some(w => d.startsWith(w)));
const ROTATE_OK = ["01-terrain", "09-kinetic"];     // rotating/accent headline is their device
const EYEBROW_OK = ["03-blueprint", "06-swiss"];     // drawing labels / numbered Swiss sections carry meaning there
const LIMIT = { accent: 1, fullstop: 2, eyebrow: 2 };

const b = await chromium.launch();
const home = {};
let fails = 0;
for (const slug of all) {
  for (const pg of ["index.html", "services.html", "about.html"]) {
    if (pg !== "index.html" && !slugs.includes(slug)) continue;
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    await p.goto(`http://127.0.0.1:${PORT}/designs/${slug}/${pg === "index.html" ? "" : pg}`, { waitUntil: "load" });
    await p.waitForTimeout(600);
    const r = await p.evaluate(() => {
      const txt = el => el.textContent.replace(/\s+/g, " ").trim();
      const hs = [...document.querySelectorAll("main h1, main h2, main h3, body > section h1, body > section h2, header h1")]
        .filter((h, i, a) => a.indexOf(h) === i && txt(h).length > 2 && getComputedStyle(h).display !== "none" && !h.closest("footer,[aria-hidden=true],.sr-only"));
      const accent = [], fullstop = [];
      for (const h of hs) {
        if (h.tagName === "H3") { const t = txt(h); if (h.tagName !== "H1" && /\.$/.test(t) && t.split(" ").length <= 9) fullstop.push(t.slice(0, 60)); continue; }
        const c = getComputedStyle(h).color;
        const kids = [...h.querySelectorAll("*")].filter(k => k.children.length === 0 && txt(k).length > 1 && !k.closest("a"));
        if (kids.some(k => { const s = getComputedStyle(k); return s.color !== c || s.fontStyle !== getComputedStyle(h).fontStyle; }) && txt(h).split(" ").length > 1) accent.push(txt(h).slice(0, 60));
        const t = txt(h);
        if (h.tagName !== "H1" && /\.$/.test(t) && t.split(" ").length <= 9) fullstop.push(t.slice(0, 60));
      }
      // eyebrow: small, uppercase/letter-spaced label sitting right above a heading
      const eyebrow = [];
      for (const h of hs.filter(h => h.tagName !== "H3")) {
        let prev = h.previousElementSibling;
        if (!prev && h.parentElement) prev = h.parentElement.previousElementSibling;
        if (!prev) continue;
        const s = getComputedStyle(prev), fs = parseFloat(s.fontSize), t = txt(prev);
        if (t && t.length < 70 && fs <= 14 && (s.textTransform === "uppercase" || (t === t.toUpperCase() && /[A-Z]/.test(t))) && parseFloat(s.letterSpacing || 0) > 0.4) eyebrow.push(t.slice(0, 50));
      }
      const body = document.body.innerText;
      return {
        accent, fullstop, eyebrow,
        h2s: hs.filter(h => h.tagName !== "H1").map(txt),
        process: hs.some(h => /^(0?\d\s*)?understand the site/i.test(txt(h))) || hs.some(h => /^(0?\d\s*)?deliver on site/i.test(txt(h))),
        quotes: (body.match(/I have to say|We have all been commenting|pro-active in your communications/gi) || []).map(s => s.toLowerCase()),
      };
    });
    await p.close();
    if (pg === "index.html") home[slug] = r;
    if (!slugs.includes(slug)) continue;
    const bad = [];
    const accentLimit = ROTATE_OK.includes(slug) ? 3 : LIMIT.accent;
    if (r.accent.length > accentLimit) bad.push(`accent-word headings ${r.accent.length}>${accentLimit}: ${r.accent.join(" | ")}`);
    if (r.fullstop.length > LIMIT.fullstop) bad.push(`short full-stop headings ${r.fullstop.length}>${LIMIT.fullstop}: ${r.fullstop.join(" | ")}`);
    if (!EYEBROW_OK.includes(slug) && r.eyebrow.length > LIMIT.eyebrow) bad.push(`eyebrow labels ${r.eyebrow.length}>${LIMIT.eyebrow}: ${r.eyebrow.join(" | ")}`);
    if (bad.length) fails++;
    console.log(`${bad.length ? "✗" : "✓"} ${slug}/${pg}${bad.length ? "\n    " + bad.join("\n    ") : ""}`);
  }
}

// cross-concept sameness (home pages)
console.log("\nAcross concepts:");
const withProcess = all.filter(s => home[s].process);
if (withProcess.length > 1) { fails++; console.log(`✗ shared 4-step process ("Understand the site / Design & consent / Deliver on site / Complete & hand over") on ${withProcess.length} home pages: ${withProcess.join(", ")} (max 1)`); }
else console.log("✓ shared 4-step process copy on at most one home page");
const norm = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
import { readFileSync } from "node:fs";
const NAMES = [];
try { for (const pr of JSON.parse(readFileSync(path.join(SITE, "assets/content/projects-source.json"), "utf8"))) for (const k of ["title", "name", "site"]) if (pr[k]) NAMES.push(norm(pr[k])); } catch {}
NAMES.push(..."land surveying|rma planning|engineering|landscape architecture|environmental services|project management|send an enquiry|send us an enquiry|book a meeting|what to tell us|faq|contact".split("|"));
const isName = h => /\b(street|road|avenue|crescent|reserve|park|green|lookout|drive|lane|playground|footbridge|school)\b/.test(h) || NAMES.some(n => n && (h === n || h.startsWith(n) || n.startsWith(h)));
const seen = {};
for (const s of all) for (const h of new Set(home[s].h2s.map(norm))) if (h.split(" ").length >= 3 && !isName(h) && !/understand the site|design consent|deliver on site|complete hand over/.test(h)) (seen[h] ||= []).push(s.slice(0, 2));
const dups = Object.entries(seen).filter(([, v]) => v.length > 1);
if (dups.length) { fails++; console.log(`✗ section headings repeated across concepts:\n    ${dups.map(([h, v]) => `"${h}" (${v.join(",")})`).join("\n    ")}`); }
else console.log("✓ no section heading repeated across concepts");
const quoteUse = {};
for (const s of all) for (const q of new Set(home[s].quotes)) (quoteUse[q] ||= []).push(s.slice(0, 2));
const over = Object.entries(quoteUse).filter(([, v]) => v.length > 4);
if (over.length) { fails++; console.log(`✗ same client quote on more than 4 home pages: ${over.map(([q, v]) => `"${q}" (${v.join(",")})`).join("; ")}`); }
else console.log("✓ client quotes spread across concepts");

await b.close(); srv.kill();
console.log(`\n${fails ? fails + " problem(s)" : "No template tells found"}`);
process.exit(fails ? 1 : 0);
