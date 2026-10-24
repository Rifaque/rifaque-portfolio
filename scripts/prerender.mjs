// Build step 3 of 4: write one static HTML file per route in the manifest,
// plus 404.html, sitemap.xml and robots.txt, all from src/content/routes.ts.
//
// Runs after the client build (dist/) and the SSR build (dist-ssr/). Each page
// is the client's index.html with the route's head tags and server-rendered
// markup injected; the client then hydrates it.

import { readFile, writeFile, readdir, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

const ssr = await import(pathToFileURL(join(root, "dist-ssr", "entry-server.js")).href);
const { render, renderHead, routes, notFoundRoute, site } = ssr;

const template = await readFile(join(dist, "index.html"), "utf8");
for (const marker of ["<!--app-head-->", "<!--app-html-->", "<!--app-preload-->"]) {
  if (!template.includes(marker)) throw new Error(`dist/index.html is missing ${marker}`);
}

// Preload the two Latin font files so text renders in Geist on first paint.
const assets = await readdir(join(dist, "assets"));
const fontFor = (prefix) => {
  const file = assets.find((f) => f.startsWith(prefix) && f.endsWith(".woff2"));
  if (!file) throw new Error(`No font file starting with ${prefix} in dist/assets`);
  return `<link rel="preload" href="/assets/${file}" as="font" type="font/woff2" crossorigin />`;
};
const preload = [fontFor("geist-latin-wght-normal"), fontFor("geist-mono-latin-wght-normal")].join("\n    ");

// Lazily loaded routes (src/labRoute.ts): their chunk's stylesheet must be in
// the page's own HTML, or the prerendered markup would paint unstyled until
// the script arrives (and stay unstyled without JavaScript). Read from Vite's
// build manifest, which is then removed so it is not deployed.
const lazyRoutes = { "/lab": "src/lab/LabPage.tsx" };
const manifestFile = join(dist, ".vite", "manifest.json");
const manifest = JSON.parse(await readFile(manifestFile, "utf8"));
await rm(join(dist, ".vite"), { recursive: true });
// Linked at the end of <head>, after the app's own stylesheet, so the
// cascade order is the one a single bundle would have (chunk CSS last).
const lazyTags = (path) => {
  const src = lazyRoutes[path];
  if (!src) return "";
  const chunk = manifest[src];
  if (!chunk?.isDynamicEntry) throw new Error(`${src} is not a lazy chunk in the build manifest`);
  if (!chunk.css?.length) throw new Error(`${src} has no stylesheet in the build manifest`);
  return [
    ...chunk.css.map((f) => `<link rel="stylesheet" crossorigin href="/${f}">`),
    `<link rel="modulepreload" crossorigin href="/${chunk.file}">`,
  ]
    .map((tag) => `  ${tag}\n  `)
    .join("");
};

const page = async (route, url) =>
  template
    .replace("<!--app-head-->", renderHead(route))
    .replace("<!--app-preload-->", preload)
    .replace("</head>", `${lazyTags(route.path)}</head>`)
    .replace("<!--app-html-->", await render(url));

const written = [];
for (const route of routes) {
  const out = join(dist, route.file);
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, await page(route, route.path));
  written.push(`${route.path} -> ${route.file}`);
}

// Any path the router does not know renders NotFound.
await writeFile(join(dist, notFoundRoute.file), await page(notFoundRoute, "/__not-found__"));
written.push(`(unknown) -> ${notFoundRoute.file}`);

const indexable = routes.filter((r) => r.indexable);
const loc = (r) => (r.path === "/" ? `${site.url}/` : `${site.url}${r.path}`);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexable.map((r) => `  <url><loc>${loc(r)}</loc></url>`).join("\n")}
</urlset>
`;
await writeFile(join(dist, "sitemap.xml"), sitemap);

// /lab is not disallowed on purpose: crawlers must be able to fetch it to
// see its noindex.
await writeFile(join(dist, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);

console.log(`prerendered ${written.length} pages:\n  ${written.join("\n  ")}`);
console.log(`sitemap.xml: ${indexable.length} URLs; robots.txt written`);
