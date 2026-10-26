// Review captures for the concepts (headless Chromium from the repo's Playwright).
// Usage: node prototypes/projects-redesign/tools/look.mjs <outDir> <name|url> [w h] [script]
import { chromium } from "playwright";
const [out, target, w = "1440", h = "900", script = ""] = process.argv.slice(2);
const url = target.startsWith("http") ? target : `http://localhost:8765/prototypes/projects-redesign/${target}`;
const browser = await chromium.launch({ args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"] });
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
const errs = [];
page.on("pageerror", (e) => errs.push(String(e)));
page.on("console", (m) => { if (["error", "warning"].includes(m.type())) errs.push(`${m.type()}: ${m.text()}`); });
page.on("requestfailed", (r) => errs.push(`failed: ${r.url()}`));
page.on("response", (r) => { if (r.status() >= 400) errs.push(`${r.status()}: ${r.url()}`); });
await page.goto(url);
await page.waitForTimeout(900);
const steps = script ? script.split(";;") : ["shot"];
let n = 0;
for (const s of steps) {
  if (s === "shot") await page.screenshot({ path: `${out}/${n++}.png` });
  else if (s.startsWith("wait:")) await page.waitForTimeout(+s.slice(5));
  else if (s.startsWith("scroll:")) { await page.evaluate((y) => scrollTo(0, y), +s.slice(7)); await page.waitForTimeout(700); }
  else if (s.startsWith("to:")) { await page.evaluate((sel) => { const el = document.querySelector(sel); scrollTo(0, el.getBoundingClientRect().top + scrollY - 70); }, s.slice(3)); await page.waitForTimeout(700); }
  else if (s.startsWith("click:")) { await page.click(s.slice(6)); await page.waitForTimeout(900); }
  else if (s.startsWith("key:")) { await page.keyboard.press(s.slice(4)); await page.waitForTimeout(500); }
  else if (s.startsWith("eval:")) console.log(JSON.stringify(await page.evaluate(s.slice(5))));
}
console.log(JSON.stringify({ errs, overflow: await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth) }));
await browser.close();
