// Build step 4 of 4: assert the generated site is correct before it can be
// deployed. Fails the build on the first category with problems, listing
// every problem in it.
//
// Checks: per-route titles, descriptions, robots, canonicals, Open Graph and
// JSON-LD; the sitemap and robots.txt against the manifest; legacy domains,
// private details and the retired accent colour; internal links and in-page
// anchors; one h1 per page; alt text on every image.

import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const { routes, notFoundRoute, redirects, site } = await import(
  pathToFileURL(join(root, "dist-ssr", "entry-server.js")).href
);

const problems = [];
const fail = (msg) => problems.push(msg);

const all = [...routes, notFoundRoute];
const pages = new Map();
for (const r of all) {
  try {
    pages.set(r.path, await readFile(join(dist, r.file), "utf8"));
  } catch {
    fail(`${r.path}: ${r.file} was not generated`);
  }
}

const matchAll = (html, re) => [...html.matchAll(re)];
const meta = (html, attr, key) =>
  matchAll(html, new RegExp(`<meta ${attr}="${key.replace(/[:]/g, "\\:")}" content="([^"]*)"`, "g")).map((m) => decode(m[1]));
const decode = (s) => s.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const canonicalOf = (r) => (r.path === "/" ? `${site.url}/` : `${site.url}${r.path}`);

// ---- head tags -------------------------------------------------------------
const seenTitles = new Map();
const seenDescriptions = new Map();
for (const r of all) {
  const html = pages.get(r.path);
  if (!html) continue;
  const titles = matchAll(html, /<title>([^<]*)<\/title>/g).map((m) => decode(m[1]));
  if (titles.length !== 1) fail(`${r.path}: expected 1 <title>, found ${titles.length}`);
  if (titles[0] !== r.title) fail(`${r.path}: <title> does not match the manifest`);
  const desc = meta(html, "name", "description");
  if (desc.length !== 1 || !desc[0]) fail(`${r.path}: expected 1 non-empty meta description`);
  if (desc[0] && (desc[0].length < 50 || desc[0].length > 300)) fail(`${r.path}: description length ${desc[0].length} is outside 50-300`);
  if (r.indexable) {
    if (seenTitles.has(titles[0])) fail(`${r.path}: title duplicates ${seenTitles.get(titles[0])}`);
    if (seenDescriptions.has(desc[0])) fail(`${r.path}: description duplicates ${seenDescriptions.get(desc[0])}`);
    seenTitles.set(titles[0], r.path);
    seenDescriptions.set(desc[0], r.path);
  }

  const robots = meta(html, "name", "robots");
  if (robots.length !== 1) fail(`${r.path}: expected 1 robots meta, found ${robots.length}`);
  const noindex = /noindex/.test(robots[0] ?? "");
  if (r.indexable === noindex) fail(`${r.path}: robots "${robots[0]}" contradicts indexable=${r.indexable}`);

  const canonicals = matchAll(html, /<link rel="canonical" href="([^"]*)"/g).map((m) => m[1]);
  if (r.indexable) {
    if (canonicals.length !== 1) fail(`${r.path}: expected 1 canonical, found ${canonicals.length}`);
    else if (canonicals[0] !== canonicalOf(r)) fail(`${r.path}: canonical ${canonicals[0]} should be ${canonicalOf(r)}`);
    const ogUrl = meta(html, "property", "og:url");
    if (ogUrl[0] !== canonicalOf(r)) fail(`${r.path}: og:url ${ogUrl[0]} should equal the canonical`);
  } else if (canonicals.length) {
    fail(`${r.path}: a noindex page should not declare a canonical`);
  }

  for (const key of ["og:title", "og:type", "og:image", "og:image:alt", "og:description", "og:site_name"]) {
    const v = meta(html, "property", key);
    if (v.length !== 1 || !v[0]) fail(`${r.path}: expected 1 ${key}`);
  }
  if (!meta(html, "property", "og:image")[0]?.startsWith(`${site.url}/`)) fail(`${r.path}: og:image must be an absolute ${site.url} URL`);

  for (const m of matchAll(html, /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    let data;
    try {
      data = JSON.parse(m[1]);
    } catch (e) {
      fail(`${r.path}: JSON-LD does not parse (${e.message})`);
      continue;
    }
    if (data["@context"] !== "https://schema.org") fail(`${r.path}: JSON-LD @context should be https://schema.org`);
    const text = JSON.stringify(data);
    for (const url of text.match(/https?:\/\/[^"\\]+/g) ?? []) {
      if (/rsxdevelops/.test(url) && !url.startsWith(site.url)) fail(`${r.path}: JSON-LD URL ${url} is not on ${site.url}`);
    }
  }

  const h1s = matchAll(html, /<h1[\s>]/g).length;
  if (h1s !== 1) fail(`${r.path}: expected 1 <h1>, found ${h1s}`);

  for (const img of matchAll(html, /<img\b[^>]*>/g)) {
    if (!/\balt="[^"]+"/.test(img[0])) fail(`${r.path}: image without alt text: ${img[0].slice(0, 80)}`);
  }
}

const home = pages.get("/") ?? "";
const homeLd = home.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
if (homeLd) {
  const graph = JSON.parse(homeLd[1])["@graph"] ?? [];
  const person = graph.find((n) => n["@type"] === "Person");
  const website = graph.find((n) => n["@type"] === "WebSite");
  if (!website || website.url !== `${site.url}/` || website.name !== site.name) fail("/: WebSite JSON-LD must name the site and use the canonical home URL");
  if (!person || person.name !== site.person) fail("/: Person JSON-LD must use the current name");
  const sameAs = person?.sameAs ?? [];
  for (const p of ["https://github.com/Rifaque", "https://www.linkedin.com/in/rifaque-akrami/"]) {
    if (!sameAs.includes(p)) fail(`/: Person sameAs is missing ${p}`);
  }
} else {
  fail("/: home page has no JSON-LD");
}

// ---- sitemap and robots ----------------------------------------------------
const sitemap = await readFile(join(dist, "sitemap.xml"), "utf8").catch(() => "");
const locs = matchAll(sitemap, /<loc>([^<]+)<\/loc>/g).map((m) => m[1]).sort();
const expected = routes.filter((r) => r.indexable).map(canonicalOf).sort();
if (JSON.stringify(locs) !== JSON.stringify(expected)) fail(`sitemap.xml lists ${locs.join(", ")}; expected ${expected.join(", ")}`);
for (const r of routes.filter((x) => !x.indexable)) {
  if (sitemap.includes(`${site.url}${r.path}<`)) fail(`sitemap.xml must not list noindex page ${r.path}`);
}
const robots = await readFile(join(dist, "robots.txt"), "utf8").catch(() => "");
if (!robots.includes(`Sitemap: ${site.url}/sitemap.xml`)) fail("robots.txt does not point at the sitemap");
if (/Disallow:\s*\/\s*$/m.test(robots)) fail("robots.txt disallows the whole site");

// ---- legacy domains and private details -------------------------------------
const banned = [
  [/rifaque\.hubzero\.in/, "legacy domain rifaque.hubzero.in"],
  [/(atlas|querycraft|zerolink|devpilot|layers)\.hubzero\.in/, "dead hubzero.in subdomain"],
  [/atlas\.rifaque\.dev/, "dead domain atlas.rifaque.dev"],
  [/bhatkaltimeluxe\.in/, "dead domain bhatkaltimeluxe.in"],
  [/Rifaque Ahmed(?! Akrami)/, "old name without Akrami"],
  [/\+\d{1,3}[\s-]?\d{5}[\s-]?\d{5}|\b\d{5}[\s-]\d{5}\b/, "phone number"],
  [/C:\\\\Users|C:\/Users/i, "local file path"],
];
const htmlFiles = [];
const walk = async (dir) => {
  for (const name of await readdir(dir)) {
    const p = join(dir, name);
    if ((await stat(p)).isDirectory()) await walk(p);
    else if (/\.(html|xml|txt|js|json|webmanifest)$/.test(name)) htmlFiles.push(p);
  }
};
await walk(dist);
for (const file of htmlFiles) {
  const text = await readFile(file, "utf8");
  for (const [re, label] of banned) {
    if (re.test(text)) fail(`${file.slice(dist.length + 1)}: contains ${label}`);
  }
  // The only email address the site may publish is the public one.
  for (const email of text.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) ?? []) {
    if (email !== site.email && !/\.(png|webp|woff2|js)$/.test(email)) fail(`${file.slice(dist.length + 1)}: contains another email address`);
  }
}

// ---- colour system ----------------------------------------------------------
// Electric blue (#3abeff) was the decorative accent and is retired. Blue is
// still allowed as the semantic pre-release status colour, which must remain.
const retiredAccent = /#3abeff|58\s*,?\s*190\s*,?\s*255/i;
const styleFiles = (await readdir(join(dist, "assets"))).filter((f) => f.endsWith(".css"));
let css = "";
for (const f of styleFiles) css += await readFile(join(dist, "assets", f), "utf8");
for (const file of [...htmlFiles, ...styleFiles.map((f) => join(dist, "assets", f))]) {
  if (retiredAccent.test(await readFile(file, "utf8"))) fail(`${file.slice(dist.length + 1)}: contains the retired accent colour`);
}
if (!/--status-prerelease:\s*#7cb2ff/i.test(css)) fail("CSS lacks the pre-release status colour --status-prerelease");

// ---- internal links and anchors -------------------------------------------
const routePaths = new Set(routes.map((r) => r.path));
const redirectSources = new Set(redirects.map((r) => r.from));
const idsByPath = new Map([...pages].map(([p, html]) => [p, new Set(matchAll(html, /\sid="([^"]+)"/g).map((m) => m[1]))]));
const external = new Set();
for (const [path, html] of pages) {
  for (const m of matchAll(html, /<a\b[^>]*\bhref="([^"]*)"/g)) {
    const href = decode(m[1]);
    if (!href || href === "#") {
      fail(`${path}: empty link`);
      continue;
    }
    if (/^(mailto:|tel:)/.test(href)) continue;
    if (/^https?:\/\//.test(href)) {
      external.add(href);
      continue;
    }
    const [target, hash] = href.split("#");
    if (target === "") {
      if (!idsByPath.get(path)?.has(hash)) fail(`${path}: in-page link #${hash} has no target`);
      continue;
    }
    const targetPath = target.split("?")[0];
    if (routePaths.has(targetPath)) {
      if (hash && !idsByPath.get(targetPath)?.has(hash)) fail(`${path}: link ${href} points at a missing #${hash}`);
      continue;
    }
    if (redirectSources.has(targetPath)) {
      fail(`${path}: links to retired path ${targetPath}`);
      continue;
    }
    try {
      await stat(join(dist, decodeURIComponent(targetPath)));
    } catch {
      fail(`${path}: link ${href} has no route or file`);
    }
  }
}

// ---- code splitting ---------------------------------------------------------
// /lab is a lazy route (src/labRoute.ts): no other page may load its code or
// styles, and lab.html must still be complete, styled and free of Suspense
// fallbacks.
// (The small .lab-switch/.lab-motion rules in pages.css are shared CSS, not
// part of the chunk, so only the motion fixture's script is checked.)
const labMarkers = [
  ["Selected work, isolated", "the lab page", "js"],
  ["ribbon-counter", "the project ribbon", "js"],
  ["(min-width: 1200px) and (min-height: 680px)", "the ribbon controller", "js"],
  ["lab-motion-item", "the motion fixture", "js"],
  [".ribbon-stage", "the ribbon styles", "css"],
];
const assetsOf = (html) => matchAll(html, /(?:src|href)="\/(assets\/[^"]+\.(?:js|css))"/g).map((m) => m[1]);
for (const [path, html] of pages) {
  // Every page's HTML must be complete and hydrate in one pass: no Suspense
  // boundary at all (a loaded lazy route renders inline; labRoute.ts).
  if (/<!--\$[?!]?-->/.test(html)) fail(`${path}: contains a Suspense boundary`);
  if (path === "/lab") continue;
  for (const asset of assetsOf(html)) {
    if (/LabPage/.test(asset)) fail(`${path}: loads the lab chunk ${asset}`);
    const text = await readFile(join(dist, asset), "utf8").catch(() => "");
    if (!text) fail(`${path}: references missing asset ${asset}`);
    for (const [marker, label, type] of labMarkers) {
      if (asset.endsWith(`.${type}`) && text.includes(marker)) fail(`${path}: ${asset} contains ${label} ("${marker}")`);
    }
  }
}
const lab = pages.get("/lab");
if (lab) {
  const labCss = assetsOf(lab).filter((a) => /LabPage-[^/]+\.css$/.test(a));
  if (labCss.length !== 1) fail(`/lab: expected its chunk's stylesheet linked in the HTML, found ${labCss.length}`);
  for (const a of labCss) {
    if (!(await readFile(join(dist, a), "utf8").catch(() => "")).includes(".ribbon-stage")) fail(`/lab: ${a} lacks the ribbon styles`);
  }
  if (!assetsOf(lab).some((a) => /LabPage-[^/]+\.js$/.test(a))) fail("/lab: does not preload its chunk");
  // Chunk CSS after the app's, as in a single bundle, so the cascade is unchanged.
  const order = assetsOf(lab).filter((a) => a.endsWith(".css"));
  if (order.findIndex((a) => /LabPage-/.test(a)) < order.findIndex((a) => /\/index-/.test(a))) {
    fail(`/lab: its chunk stylesheet must come after the app stylesheet (${order.join(", ")})`);
  }
  for (const needle of ["Selected work, isolated", 'class="ribbon-stage"', 'class="lab-motion']) {
    if (!lab.includes(needle)) fail(`/lab: prerendered HTML lacks ${needle}`);
  }
  // React separates adjacent text with <!-- --> in server output.
  const ribbon = lab.slice(lab.indexOf('<section class="ribbon"')).replace(/<!-- -->/g, "");
  const caseLinks = matchAll(ribbon, /<a [^>]*href="\/work\/([a-z-]+)"[^>]*>Read the [^<]+ case study<\/a>/g).map((m) => m[1]);
  if (caseLinks.length !== 4) fail(`/lab: expected 4 ribbon case-study links, found ${caseLinks.length}`);
}

if (problems.length) {
  console.error(`check-dist: ${problems.length} problem(s)\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(`check-dist: ${pages.size} pages, ${locs.length} sitemap URLs, ${external.size} distinct external links: all checks passed`);
