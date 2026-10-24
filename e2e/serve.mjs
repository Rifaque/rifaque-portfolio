// Serves the built site (dist/) for the browser tests with the routing that
// vercel.json gives production: clean URLs, no trailing slash, the /desktop
// redirect, and 404.html with a real 404 status. vite preview would answer
// unknown paths with the home page instead.

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../dist/", import.meta.url));
const port = Number(process.env.PORT ?? 4317);

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".pdf": "application/pdf",
};

async function file(path) {
  const full = normalize(join(root, path));
  if (!full.startsWith(root)) return null;
  try {
    return (await stat(full)).isFile() ? full : null;
  } catch {
    return null;
  }
}

createServer(async (req, res) => {
  const { pathname, search } = new URL(req.url, "http://localhost");
  const redirect = (to) => res.writeHead(308, { Location: to }).end();

  if (pathname === "/desktop" || pathname.startsWith("/desktop/")) return redirect("/");
  if (pathname.length > 1 && pathname.endsWith("/")) return redirect(pathname.slice(0, -1) + search);
  if (pathname.endsWith(".html")) return redirect((pathname.slice(0, -5).replace(/\/index$/, "") || "/") + search);

  const path = decodeURIComponent(pathname);
  const found = (await file(path)) ?? (await file(`${path}.html`)) ?? (await file(join(path, "index.html")));
  const target = found ?? (await file("404.html"));
  res.writeHead(found ? 200 : 404, { "Content-Type": types[extname(target)] ?? "application/octet-stream" });
  res.end(await readFile(target));
}).listen(port, () => console.log(`dist on http://localhost:${port}`));
