// Static server for dist/ that mirrors production routing (vercel.json):
// clean URLs without trailing slashes, the /desktop redirect, and a real 404.
// Usage: node scripts/serve.mjs [port]   (default 4173, bound to 127.0.0.1)
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dist = resolve(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const port = Number(process.argv[2] || process.env.PORT || 4173);
const types = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml",
  ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2", ".pdf": "application/pdf",
  ".xml": "application/xml", ".txt": "text/plain; charset=utf-8", ".ico": "image/x-icon", ".json": "application/json",
};

async function file(p) {
  try {
    const full = normalize(join(dist, p));
    if (!full.startsWith(dist)) return null;
    return (await stat(full)).isFile() ? full : null;
  } catch {
    return null;
  }
}

createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  let path = decodeURIComponent(url.pathname);
  if (path === "/desktop" || path.startsWith("/desktop/")) {
    res.writeHead(308, { Location: "/" });
    return res.end();
  }
  if (path.length > 1 && path.endsWith("/")) {
    res.writeHead(308, { Location: path.replace(/\/+$/, "") + url.search });
    return res.end();
  }
  if (path.endsWith(".html") && path !== "/404.html") {
    res.writeHead(308, { Location: (path === "/index.html" ? "/" : path.slice(0, -5)) + url.search });
    return res.end();
  }
  const found = path === "/" ? await file("index.html") : (await file(path)) || (await file(`${path}.html`));
  const target = found || join(dist, "404.html");
  const body = await readFile(target);
  const headers = { "Content-Type": types[extname(target)] || "application/octet-stream" };
  if (path.startsWith("/assets/")) headers["Cache-Control"] = "public, max-age=31536000, immutable";
  res.writeHead(found ? 200 : 404, headers);
  res.end(body);
}).listen(port, "127.0.0.1", () => console.log(`serving dist/ on http://127.0.0.1:${port}`));
