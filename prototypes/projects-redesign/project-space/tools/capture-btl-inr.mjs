// Captures the current Bhatkal Time Luxe site (https://btl.hubzero.in) with the
// site's own currency selector set to INR, for Concept D. Same pages, viewports and
// viewport-only framing as capture-btl.mjs; nothing on the site is altered beyond
// choosing INR in its selector inside this headless session. The footer and contact
// page carry a personal phone number and are never captured; any contact data seen
// in a viewport is logged as present, with the number itself redacted.
// Run from the repository root: node prototypes/projects-redesign/project-space/tools/capture-btl-inr.mjs
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = "prototypes/projects-redesign/project-space/media/captures";
const PRODUCT = "https://btl.hubzero.in/product/67f2ba0c0b835fcd943706f3";
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const log = [];
let storage; // the session after INR is chosen, reused for the phone captures

async function shot(name, url, { w = 1440, h = 900, scroll = 0 } = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, ...(storage && w < 640 ? { storageState: storage } : {}) });
  const page = await ctx.newPage();
  const res = await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2000);
  // Choose INR in the site's own currency selector (it opens from the button showing the current currency).
  const trigger = page.locator("button", { hasText: /^(KWD|INR|USD|EUR|GBP)/ }).first();
  let chosen = "not found";
  if (await trigger.count() && await trigger.isVisible()) {
    await trigger.click();
    await page.waitForTimeout(600);
    const inr = page.locator("button, [role=option], [role=menuitem], li", { hasText: /^INR/ }).first();
    if (await inr.count()) { await inr.click(); chosen = "INR"; }
    await page.waitForTimeout(1500);
    await page.mouse.move(5, h - 5);
  }
  if (chosen === "INR" && !storage) storage = await ctx.storageState();
  if (storage && w < 640 && chosen !== "INR") chosen = "INR (remembered from the desktop session)";
  if (scroll) { await page.evaluate((y) => scrollTo(0, y), scroll); await page.waitForTimeout(1500); }
  const visible = await page.evaluate(() => {
    const vh = innerHeight, hits = [];
    const redact = (s) => s.replace(/\d[\d\s-]{6,}\d/g, "[phone number redacted]");
    for (const a of document.querySelectorAll('a[href^="tel:"], a[href*="wa.me"], a[href*="whatsapp"], a[href^="mailto:"]')) {
      const r = a.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh && r.width > 0) hits.push({ href: redact(a.getAttribute("href")), box: [r.x, r.y, r.width, r.height].map(Math.round) });
    }
    const prices = [...document.body.innerText.matchAll(/(₹|INR|KWD|KD)\s?[\d,.]+/g)].map((m) => m[0]).slice(0, 4);
    return { title: document.title, url: location.href, hits, prices };
  });
  await page.screenshot({ path: `${OUT}/${name}.png` });
  log.push({ name, url, status: res.status(), size: [w, h], scroll, currency: chosen, date: new Date().toISOString(), ...visible });
  await ctx.close();
}

await shot("btl-home-1440-inr", "https://btl.hubzero.in/");
await shot("btl-product-1440-inr", PRODUCT);
await shot("btl-new-arrivals-grid-1440-inr", "https://btl.hubzero.in/new-arrivals", { scroll: 640 });
await shot("btl-home-390-inr", "https://btl.hubzero.in/", { w: 390, h: 844 });
await shot("btl-product-390-inr", PRODUCT, { w: 390, h: 844 });

writeFileSync(`${OUT}/capture-log-inr.json`, JSON.stringify(log, null, 2));
console.log(JSON.stringify(log.map((l) => ({ name: l.name, status: l.status, currency: l.currency, prices: l.prices, hits: l.hits })), null, 1));
await browser.close();
