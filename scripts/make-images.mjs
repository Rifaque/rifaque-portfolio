// Generator for public/og-image.png (1200 × 630), the social-sharing image.
// It composes the approved RSX Develops wordmark
// (public/rsx-develops-brand-assets/rsx-develops-wordmark-dark-4x.png, white
// lettering for dark backgrounds) on the site's ink background, with the
// domain in small grey type: no other text, no new mark. Renders locally with
// Playwright's Chromium and the bundled Geist Mono; no network.
//
// The favicon and app-icon set in public/ is the approved artwork and is not
// generated here. Run: node scripts/make-images.mjs
import { chromium } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const b64 = async (p) => (await readFile(join(root, p))).toString("base64");
const mono = await b64("node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2");
const wordmark = await b64("public/rsx-develops-brand-assets/rsx-develops-wordmark-dark-4x.png");

// The wordmark is 3096 × 436 at 4x; drawn 640 px wide it keeps its aspect ratio (~90 px tall).
const og = `<!doctype html><html><head><style>
@font-face { font-family: GM; src: url(data:font/woff2;base64,${mono}) format("woff2"); font-weight: 100 900; }
* { margin: 0; box-sizing: border-box; }
html, body { width: 1200px; height: 630px; background: #0b0a09; overflow: hidden; }
body { display: grid; place-items: center; }
img { width: 640px; height: auto; display: block; transform: translateY(-14px); }
.url { position: absolute; left: 0; right: 0; bottom: 92px; text-align: center; font: 400 22px/1 GM; letter-spacing: 0.06em; color: #8b93a0; }
</style></head><body>
<img src="data:image/png;base64,${wordmark}" alt="">
<p class="url">rsxdevelops.dev</p>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(og, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: join(root, "public", "og-image.png") });
await browser.close();
console.log("wrote public/og-image.png (1200 × 630) from the approved wordmark");
