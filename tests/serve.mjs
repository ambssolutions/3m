// Small static server for the tests that sends files the way Vercel does: text files (HTML, CSS, JS, JSON, SVG, XML,
// TXT) Brotli-compressed when the browser accepts it (gzip otherwise), images and fonts as they are.
// Run: node tests/serve.mjs PORT [root]   (root defaults to the repo). Used by tests/perf.mjs; pass --raw there for the
// old uncompressed python server.
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";

const PORT = +process.argv[2] || 8130;
const ROOT = path.resolve(process.argv[3] || path.join(path.dirname(new URL(import.meta.url).pathname), ".."));
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json", ".svg": "image/svg+xml", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8", ".md": "text/plain; charset=utf-8",
  ".webp": "image/webp", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".gif": "image/gif", ".avif": "image/avif", ".ico": "image/x-icon",
  ".woff2": "font/woff2", ".woff": "font/woff", ".mp4": "video/mp4", ".webm": "video/webm", ".pdf": "application/pdf" };
const TEXT = /^(text\/|application\/(json|xml)|image\/svg)/;
const cache = new Map();

async function resolve(urlPath) {
  let p = path.join(ROOT, decodeURIComponent(urlPath.split("?")[0]));
  if (!p.startsWith(ROOT)) return null;
  try { const s = await stat(p); if (s.isDirectory()) p = path.join(p, "index.html"); await stat(p); return p; }
  catch { try { await stat(p + ".html"); return p + ".html"; } catch { return null; } }
}

http.createServer(async (req, res) => {
  const file = await resolve(req.url);
  if (!file) { res.writeHead(404, { "content-type": "text/plain" }); return res.end("not found"); }
  const type = TYPES[path.extname(file).toLowerCase()] || "application/octet-stream";
  const ae = String(req.headers["accept-encoding"] || "");
  const enc = TEXT.test(type) ? (/\bbr\b/.test(ae) ? "br" : /\bgzip\b/.test(ae) ? "gzip" : "") : "";
  const key = file + "|" + enc, { mtimeMs } = await stat(file);
  let hit = cache.get(key);
  if (!hit || hit.m !== mtimeMs) {
    const raw = await readFile(file);
    const body = enc === "br" ? zlib.brotliCompressSync(raw, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } }) : enc === "gzip" ? zlib.gzipSync(raw, { level: 6 }) : raw;
    hit = { m: mtimeMs, body }; cache.set(key, hit);
  }
  const h = { "content-type": type, "content-length": hit.body.length, "cache-control": "no-cache", vary: "accept-encoding" };
  if (enc) h["content-encoding"] = enc;
  if (/\/assets\/fonts\//.test(file)) h["access-control-allow-origin"] = "*";
  res.writeHead(200, h); res.end(req.method === "HEAD" ? undefined : hit.body);
}).listen(PORT, "127.0.0.1");
