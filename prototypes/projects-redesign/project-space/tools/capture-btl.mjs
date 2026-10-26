// Captures the current Bhatkal Time Luxe storefront (https://btl.hubzero.in)
// for the Project Space concept. Viewport captures only: the footer and the
// contact page carry a personal phone number and are never captured.
// Run from the repository root: node prototypes/projects-redesign/project-space/tools/capture-btl.mjs
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = "prototypes/projects-redesign/project-space/media/captures";
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const log = [];

async function shot(name, url, { w = 1440, h = 900, wait = 2500, before } = {}) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const res = await page.goto(url, { waitUntil: "networkidle", timeout: 60000 }).catch((e) => ({ status: () => `error ${e.message}` }));
  await page.waitForTimeout(wait);
  if (before) await before(page);
  // Record anything that looks like contact data in the visible viewport.
  const visible = await page.evaluate(() => {
    const vh = innerHeight;
    const hits = [];
    for (const a of document.querySelectorAll('a[href^="tel:"], a[href*="wa.me"], a[href*="whatsapp"], a[href^="mailto:"]')) {
      const r = a.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh && r.width > 0) hits.push({ href: a.getAttribute("href"), box: [r.x, r.y, r.width, r.height].map(Math.round), text: a.textContent.trim().slice(0, 40) });
    }
    const digits = [...document.body.innerText.matchAll(/\+?\d[\d\s-]{7,}\d/g)].map((m) => m[0]);
    // Only the fact that contact data was seen is recorded, never the number itself.
    const redact = (s) => s.replace(/\d[\d\s-]{6,}\d/g, "[phone number redacted]");
    return { title: document.title, url: location.href, hits: hits.map((h) => ({ ...h, href: redact(h.href) })), digitRuns: digits.slice(0, 10).map(redact) };
  });
  await page.screenshot({ path: `${OUT}/${name}.png` });
  log.push({ name, url, status: typeof res.status === "function" ? res.status() : res, size: [w, h], date: new Date().toISOString(), ...visible });
  return page;
}

const home = await shot("btl-home-1440", "https://btl.hubzero.in/");
// Find real catalogue and product links from the live navigation.
const links = await home.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => a.href).filter((h) => h.startsWith(location.origin)));
await home.close();
log.push({ links: [...new Set(links)].slice(0, 60) });
await (await shot("btl-new-arrivals-1440", "https://btl.hubzero.in/new-arrivals")).close();
// The catalogue grid, and the product links it renders on the client.
const grid = await shot("btl-new-arrivals-grid-1440", "https://btl.hubzero.in/new-arrivals", {
  before: async (p) => { await p.evaluate(() => scrollTo(0, 640)); await p.waitForTimeout(1500); },
});
const gridLinks = await grid.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => a.href).filter((h) => h.startsWith(location.origin)));
await grid.close();
links.push(...gridLinks);
log.push({ gridLinks: [...new Set(gridLinks)].slice(0, 40) });
await (await shot("btl-brands-1440", "https://btl.hubzero.in/brands")).close();
const known = ["/brands", "/new-arrivals", "/faq", "/contact", "/cart", "/api/whatsapp", "/"];
const product = links.find((l) => { const u = new URL(l); return !known.includes(u.pathname) && u.pathname.split("/").filter(Boolean).length >= 2 && !u.pathname.startsWith("/api"); });
log.push({ product });
if (product) await (await shot("btl-product-1440", product)).close();
await (await shot("btl-home-390", "https://btl.hubzero.in/", { w: 390, h: 844 })).close();
if (product) await (await shot("btl-product-390", product, { w: 390, h: 844 })).close();

writeFileSync(`${OUT}/capture-log.json`, JSON.stringify(log, null, 2));
console.log(JSON.stringify(log.map((l) => ({ name: l.name, status: l.status, title: l.title, url: l.url, hits: l.hits, digitRuns: l.digitRuns })), null, 1));
await browser.close();
