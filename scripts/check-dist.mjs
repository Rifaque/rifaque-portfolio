// Release guard for dist/. Fails the build on: missing or duplicate metadata,
// sitemap drift, private data, the retired accent, legacy or dead domains,
// broken internal links or anchors, images without alt text, placeholder text,
// or any page that depends on a network-loaded script or stylesheet.
import { readFile, readdir, stat } from "node:fs/promises";
import { join, relative, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { sceneHash } from "./scene-hash.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const SITE = "https://rsxdevelops.dev";
const errors = [];
const fail = (m) => errors.push(m);

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}
const files = (await walk(dist)).map((f) => relative(dist, f).replace(/\\/g, "/"));
const htmlFiles = files.filter((f) => f.endsWith(".html"));
const textFiles = files.filter((f) => /\.(html|js|css|xml|txt|json|svg|webmanifest)$/.test(f));

// ---- expected pages
const expected = [
  "index.html", "about.html", "archive.html", "404.html",
  ...["nexus", "atlas", "reflux", "extendspace", "layers-by-rsx", "bluetap", "querycraft", "bhatkal-time-luxe"].map((s) => `work/${s}.html`),
];
for (const f of expected) if (!files.includes(f)) fail(`missing page ${f}`);
for (const f of ["sitemap.xml", "robots.txt", "resume/Rifaque_Resume.pdf", "favicon.ico", "favicon.svg", "favicon-96x96.png", "apple-touch-icon.png", "site.webmanifest", "og-image.png"]) if (!files.includes(f)) fail(`missing ${f}`);
// The manifest's icons exist, and the social image is the size the metadata declares.
if (files.includes("site.webmanifest")) {
  const manifest = JSON.parse(await readFile(join(dist, "site.webmanifest"), "utf8"));
  for (const icon of manifest.icons ?? []) if (!files.includes(icon.src.replace(/^\//, ""))) fail(`site.webmanifest: missing icon ${icon.src}`);
}
if (files.includes("og-image.png")) {
  const png = await readFile(join(dist, "og-image.png"));
  const [w, h] = [png.readUInt32BE(16), png.readUInt32BE(20)];
  if (w !== 1200 || h !== 630) fail(`og-image.png is ${w}x${h}, metadata declares 1200x630`);
}
// The 2025 Bhatkal Time Luxe composite predates the current site and is never published.
if (files.some((f) => /btl-2025|ui-composite/i.test(f))) fail("obsolete 2025 Bhatkal Time Luxe composite in dist");
if (files.some((f) => /(^|\/)lab(\.html|\/)/.test(f))) fail("a /lab page was emitted");
if (files.some((f) => /prototypes|knowledge-base|Rifaque_Profile/i.test(f))) fail("prototype, knowledge-base or private file copied into dist");

// ---- the loading gate's posters are present, the right size, and made from the current scene
for (const [f, width, height] of ["dark", "light"].flatMap((t) => [[`gate/${t}.webp`, 2000, 1250], [`gate/${t}-tall.webp`, 1200, 2000]])) {
  if (!files.includes(f)) {
    fail(`missing ${f}: run npm run posters`);
    continue;
  }
  const webp = await readFile(join(dist, f));
  // An extended WebP (it carries a colour profile): the canvas size is stored less one.
  if (webp.toString("latin1", 0, 4) !== "RIFF" || webp.toString("latin1", 12, 16) !== "VP8X") fail(`${f} is not the expected WebP`);
  else if (webp.readUIntLE(24, 3) + 1 !== width || webp.readUIntLE(27, 3) + 1 !== height) fail(`${f} is not ${width}x${height}`);
}
const manifest = JSON.parse(await readFile(join(root, "src", "hero", "gate-posters.json"), "utf8"));
if (manifest.scene !== (await sceneHash())) fail("the gate posters are older than the hero scene: run npm run build, then npm run posters, then npm run build");

// ---- forbidden content in every text file
const forbidden = [
  [/3abeff/i, "retired accent #3ABEFF"],
  [/Rifaque_Profile_Knowledge_Base/i, "private notes file name"],
  [/\+91[\s-]?\d|\b\d{5}[\s-]\d{5}\b|6364282251/, "phone number"],
  [/rifaque\.hubzero\.in|atlas\.rifaque\.dev|bhatkaltimeluxe\.in|(querycraft|zerolink|devpilot|layers|atlas)\.hubzero\.in/i, "legacy or dead domain"],
  [/\bECHO\b|Jishnu/, "ECHO reference"],
  [/lorem ipsum|\bTODO\b|\bFIXME\b|placeholder text/i, "placeholder text"],
  [/60\s?%\s*(faster|load)/i, "unverified 60% metric"],
  [/rifaque123|LPA\b|Tata Consultancy/i, "private career detail"],
];
for (const f of textFiles) {
  const text = await readFile(join(dist, f), "utf8");
  for (const [re, what] of forbidden) if (re.test(text)) fail(`${what} in ${f}`);
}

// ---- per-page checks
const titles = new Map(), descs = new Map();
const pageFor = (href) => {
  const clean = href.replace(/[?#].*$/, "");
  if (clean === "/" || clean === "") return "index.html";
  const p = clean.replace(/^\//, "").replace(/\/$/, "");
  if (files.includes(p)) return p;
  if (files.includes(`${p}.html`)) return `${p}.html`;
  return null;
};
const idsByPage = new Map();
const htmlByPage = new Map();
for (const f of htmlFiles) {
  const html = await readFile(join(dist, f), "utf8");
  htmlByPage.set(f, html);
  idsByPage.set(f, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
}
for (const f of htmlFiles) {
  const html = htmlByPage.get(f);
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const desc = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  const robots = html.match(/<meta name="robots" content="([^"]+)"/)?.[1];
  const metaContent = (key) => html.match(new RegExp(`<meta (?:name|property)="${key}" content="([^"]+)"`))?.[1];
  const ogImage = metaContent("og:image");
  if (!title) fail(`${f}: no <title>`);
  if (!desc) fail(`${f}: no description`);
  if (metaContent("og:title") !== title) fail(`${f}: Open Graph title differs from the page title`);
  if (metaContent("og:description") !== desc) fail(`${f}: Open Graph description differs from the page description`);
  if (!['website', 'article', 'profile'].includes(metaContent("og:type"))) fail(`${f}: missing or invalid Open Graph type`);
  if (f !== "404.html" && metaContent("og:url") !== canonical) fail(`${f}: Open Graph URL differs from canonical`);
  if (ogImage !== `${SITE}/og-image.png`) fail(`${f}: Open Graph image URL is incorrect`);
  if (metaContent("og:image:width") !== "1200" || metaContent("og:image:height") !== "630") fail(`${f}: Open Graph image dimensions are incorrect`);
  if (metaContent("twitter:title") !== title) fail(`${f}: Twitter title differs from the page title`);
  if (metaContent("twitter:description") !== desc) fail(`${f}: Twitter description differs from the page description`);
  if (metaContent("twitter:card") !== "summary_large_image") fail(`${f}: Twitter card type is incorrect`);
  if (metaContent("twitter:image") !== ogImage) fail(`${f}: Twitter image differs from the Open Graph image`);
  if (titles.has(title)) fail(`${f}: duplicate title with ${titles.get(title)}`);
  if (descs.has(desc)) fail(`${f}: duplicate description with ${descs.get(desc)}`);
  titles.set(title, f);
  descs.set(desc, f);
  if (f === "404.html") {
    if (!robots?.startsWith("noindex")) fail("404.html must be noindex");
    if (canonical) fail("404.html must not name a canonical");
  } else {
    const path = f === "index.html" ? "/" : "/" + f.replace(/\.html$/, "");
    const want = path === "/" ? `${SITE}/` : `${SITE}${path}`;
    if (canonical !== want) fail(`${f}: canonical ${canonical} ≠ ${want}`);
    if (!html.includes(`<meta property="og:url" content="${want}"`)) fail(`${f}: og:url mismatch`);
    if (!/<h1[\s>]/.test(html)) fail(`${f}: no <h1> in prerendered HTML`);
  }
  if (!/<main[^>]*>[\s\S]{200,}<\/main>/.test(html)) fail(`${f}: prerendered <main> is empty`);
  for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\salt="/.test(m[0])) fail(`${f}: <img> without alt: ${m[0].slice(0, 80)}`);
  for (const m of html.matchAll(/<(script|link)\b[^>]*(src|href)="(https?:)?\/\/[^"]+"[^>]*>/g)) {
    if (/rel="(canonical)"/.test(m[0])) continue;
    fail(`${f}: network-loaded resource ${m[0].slice(0, 100)}`);
  }
  // internal links and anchors
  for (const m of html.matchAll(/\shref="([^"]+)"/g)) {
    const href = m[1].replace(/&amp;/g, "&");
    if (/^(https?:|mailto:|data:)/.test(href)) continue;
    if (href.startsWith("#")) {
      if (href.length > 1 && !idsByPage.get(f).has(href.slice(1))) fail(`${f}: dead anchor ${href}`);
      continue;
    }
    if (href.startsWith("/assets/") || /\.(pdf|png|svg|ico|webp|woff2|webmanifest)$/.test(href)) {
      if (!files.includes(href.replace(/^\//, ""))) fail(`${f}: missing asset ${href}`);
      continue;
    }
    const target = pageFor(href);
    if (!target) {
      fail(`${f}: dead internal link ${href}`);
      continue;
    }
    const hash = href.split("#")[1];
    if (hash && !idsByPage.get(target)?.has(hash)) fail(`${f}: dead anchor ${href}`);
  }
}

// ---- sitemap matches indexable pages exactly
const sitemap = await readFile(join(dist, "sitemap.xml"), "utf8");
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort();
const want = htmlFiles
  .filter((f) => f !== "404.html")
  .map((f) => (f === "index.html" ? `${SITE}/` : `${SITE}/${f.replace(/\.html$/, "")}`))
  .sort();
if (JSON.stringify(locs) !== JSON.stringify(want)) fail(`sitemap drift:\n  sitemap ${locs.join(", ")}\n  pages   ${want.join(", ")}`);

// ---- size report (informational)
let total = 0;
for (const f of files) total += (await stat(join(dist, f))).size;

if (errors.length) {
  console.error(`check-dist: ${errors.length} problem(s)\n - ` + errors.join("\n - "));
  process.exit(1);
}
console.log(`check-dist: ok (${htmlFiles.length} pages, ${files.length} files, ${(total / 1024).toFixed(0)} KiB)`);
