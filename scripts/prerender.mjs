// Prerenders every route in src/content/routes.ts to static HTML, plus
// 404.html, sitemap.xml and robots.txt. The resume is served from public/resume.
// Runs after `vite build` and the SSR build.
import { readFile, writeFile, mkdir, readdir, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const ssr = await import(pathToFileURL(join(root, "dist-ssr", "entry-server.js")).href);
const { render, routes, notFoundRoute, site } = ssr;

const template = await readFile(join(dist, "index.html"), "utf8");
if (!template.includes("<!--app-html-->") || !template.includes("<!--app-head-->")) throw new Error("index.html placeholders missing");

// Preload the two variable latin fonts (hashed names from the client build).
const assets = await readdir(join(dist, "assets"));
const fonts = assets.filter((f) => /^(archivo|martian-mono)-latin-wdth-wght-.*\.woff2$/.test(f));
const preload = fonts.map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin />`).join("\n    ");

async function write(file, url, route) {
  const { html, head, env } = render(url);
  const page = template
    .replace("<html lang=\"en-GB\">", `<html lang="en-GB" data-env="${env}">`)
    .replace("<!--app-head-->", head)
    .replace("<!--app-preload-->", preload)
    .replace("<!--app-html-->", html);
  const out = join(dist, file);
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, page);
  return route.path;
}

const written = [];
for (const r of routes) written.push(await write(r.file, r.path, r));
await write(notFoundRoute.file, notFoundRoute.path, notFoundRoute);

const indexable = routes.filter((r) => r.indexable);
const loc = (p) => (p === "/" ? `${site.url}/` : `${site.url}${p}`);
await writeFile(
  join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable.map((r) => `  <url><loc>${loc(r.path)}</loc></url>`).join("\n")}\n</urlset>\n`,
);
await writeFile(join(dist, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);

// The SSR bundle is a build intermediate, never deployed.
await rm(join(root, "dist-ssr"), { recursive: true, force: true });
console.log(`prerendered ${written.length} routes + 404; sitemap: ${indexable.length} URLs; fonts preloaded: ${fonts.length}`);
