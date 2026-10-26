// Verification for the three concepts: loads, errors, missing media, overflow,
// axe, keyboard, history, reduced motion, theme and sound controls.
// Run from the repository root with the local server up:
//   node prototypes/projects-redesign/tools/verify.mjs
import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const BASE = "http://localhost:8765/prototypes/projects-redesign/";
const AXE = readFileSync("node_modules/axe-core/axe.min.js", "utf8");
const CONCEPTS = { a: "capability-carousel/", b: "interactive-project-space/", c: "technical-evidence-explorer/" };
const out = { load: {}, errors: [], overflow: {}, axe: {}, checks: {} };
const browser = await chromium.launch({ args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"] });

async function open(path, { w = 1440, h = 900, reduce = false, theme } = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: reduce ? "reduce" : "no-preference" });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => out.errors.push(`${path}: ${e}`));
  page.on("console", (m) => { if (["error", "warning"].includes(m.type())) out.errors.push(`${path}: ${m.type()}: ${m.text()}`); });
  page.on("response", (r) => { if (r.status() >= 400) out.errors.push(`${path}: HTTP ${r.status()} ${r.url()}`); });
  const res = await page.goto(BASE + path + (theme ? `?theme=${theme}` : ""));
  await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" });
  await page.waitForTimeout(900);
  return { page, ctx, status: res.status() };
}
const overflow = (p) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
const brokenImages = (p) => p.evaluate(async () => {
  const imgs = [...document.querySelectorAll("img")];
  for (const i of imgs) { i.loading = "eager"; if (!i.complete) await new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 3000); }); }
  return imgs.filter((i) => !i.naturalWidth).map((i) => i.getAttribute("src"));
});

/* Load, title, media, overflow at several widths and both themes. */
for (const [k, path] of Object.entries({ landing: "", ...CONCEPTS })) {
  for (const [w, h] of [[1440, 900], [1920, 1080], [2560, 1300], [1024, 768], [768, 1024], [390, 844], [320, 700]]) {
    for (const theme of ["dark", "light"]) {
      const { page, ctx, status } = await open(path, { w, h, theme });
      if (w === 1440 && theme === "dark") out.load[k] = { status, title: await page.title(), broken: await brokenImages(page), wordmark: await page.evaluate(() => [...document.querySelectorAll("img[alt='RSX Develops']")].filter((i) => i.offsetParent).map((i) => i.src.split("/").pop())) };
      if (theme === "light" && w === 1440) out.load[`${k}-light-wordmark`] = await page.evaluate(() => [...document.querySelectorAll("img[alt='RSX Develops']")].filter((i) => i.offsetParent).map((i) => i.src.split("/").pop()));
      // Walk the whole page so lazy and late content is laid out.
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); } });
      out.overflow[`${k}-${w}-${theme}`] = await overflow(page);
      await ctx.close();
    }
  }
}

/* axe: desktop and mobile, both themes, plus a selected-project state. */
for (const [k, path] of Object.entries(CONCEPTS)) {
  for (const [w, h, theme, sel] of [[1440, 900, "dark", false], [1440, 900, "light", true], [390, 844, "dark", true]]) {
    const { page, ctx } = await open(path + (sel ? (k === "a" ? "#extendspace" : "?project=extendspace") : ""), { w, h, theme: sel && k !== "a" ? undefined : theme });
    await page.waitForTimeout(600);
    await page.addScriptTag({ content: AXE });
    out.axe[`${k}-${w}-${theme}${sel ? "-selected" : ""}`] = await page.evaluate(async () => (await axe.run(document, { resultTypes: ["violations"] })).violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(" | ")}`));
    await ctx.close();
  }
}

/* Concept A: rail, scroll progression, hash history, keyboard, flow mode. */
{
  const { page, ctx } = await open(CONCEPTS.a);
  const mode = await page.evaluate(() => document.querySelector("#projects").dataset.mode);
  await page.click('.rail-btn[data-i="3"]');
  await page.waitForTimeout(900);
  const afterRail = await page.evaluate(() => ({ hash: location.hash, on: document.querySelector(".st.is-on h3").textContent }));
  await page.evaluate(() => scrollTo(0, scrollY + innerHeight * 0.7));
  await page.waitForTimeout(700);
  const afterScroll = await page.evaluate(() => ({ hash: location.hash, on: document.querySelector(".st.is-on h3").textContent }));
  await page.goBack();
  await page.waitForTimeout(900);
  const afterBack = await page.evaluate(() => ({ hash: location.hash, on: document.querySelector(".st.is-on h3").textContent }));
  await page.focus('.rail-btn[data-i="0"]');
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(900);
  const kb = await page.evaluate(() => ({ focus: document.activeElement.textContent.trim(), on: document.querySelector(".st.is-on h3").textContent, inertOthers: [...document.querySelectorAll(".st")].filter((s) => s.inert).length }));
  out.checks.a = { mode, afterRail, afterScroll, afterBack, kb };
  await ctx.close();
  const m = await open(CONCEPTS.a, { w: 390, h: 844 });
  out.checks.aMobile = await m.page.evaluate(() => ({ mode: document.querySelector("#projects").dataset.mode, visibleStations: [...document.querySelectorAll(".st")].filter((s) => s.getBoundingClientRect().height > 100).length }));
  await m.ctx.close();
  const r = await open(CONCEPTS.a, { reduce: true });
  out.checks.aReduced = await r.page.evaluate(() => document.querySelector("#projects").dataset.mode);
  await r.ctx.close();
  const d = await open(CONCEPTS.a + "#layers");
  await d.page.waitForTimeout(900);
  out.checks.aDeepLink = await d.page.evaluate(() => document.querySelector(".st.is-on h3").textContent);
  await d.ctx.close();
}

/* Concept B: select from a device screen, switch, Esc, Back, keyboard, list. */
{
  const { page, ctx } = await open(CONCEPTS.b);
  await page.focus('.menu-item[data-slug="atlas"]');
  await page.keyboard.press("Enter");
  await page.waitForTimeout(800);
  const sel = await page.evaluate(() => ({ url: location.search, view: document.querySelector("#space").dataset.view, focus: document.activeElement.textContent, devices: [...document.querySelectorAll(".dev")].filter((d) => getComputedStyle(d).display !== "none").map((d) => d.dataset.dev) }));
  await page.click('.sw[data-slug="extendspace"]');
  await page.waitForTimeout(800);
  const es = await page.evaluate(() => [...document.querySelectorAll(".dev")].filter((d) => getComputedStyle(d).display !== "none").map((d) => d.dataset.dev));
  await page.goBack();
  await page.waitForTimeout(800);
  const back = await page.evaluate(() => ({ url: location.search, title: document.querySelector(".d-title")?.textContent }));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(800);
  const esc = await page.evaluate(() => ({ url: location.search, view: document.querySelector("#space").dataset.view }));
  out.checks.b = { sel, es, back, esc };
  await ctx.close();
  const d = await open(CONCEPTS.b + "?project=layers");
  await d.page.click('.pg[data-pg="1"]');
  out.checks.bLayersPager = await d.page.evaluate(() => document.querySelector(".scr-pager span").textContent);
  await d.ctx.close();
  const m = await open(CONCEPTS.b, { w: 390, h: 844 });
  await m.page.click('.li-btn[data-slug="reflux"]');
  await m.page.waitForTimeout(800);
  out.checks.bMobile = await m.page.evaluate(() => ({ stage: getComputedStyle(document.querySelector("#stage")).display, detail: document.querySelector(".d-title").textContent, flatMedia: document.querySelectorAll(".d-flat figure").length }));
  await m.ctx.close();
}

/* Concept C: hotspots, linked stages, trace, history, switch, keyboard. */
{
  const { page, ctx } = await open(CONCEPTS.c);
  await page.click('.hs[data-part="sources"]');
  const atlas = await page.evaluate(() => ({ url: location.search, sel: document.querySelector(".sel-h")?.textContent, lit: [...document.querySelectorAll(".path .is-lit b")].map((b) => b.textContent) }));
  await page.focus('.part[data-part="evidence"]');
  await page.keyboard.press("Enter");
  const kbPart = await page.evaluate(() => ({ sel: document.querySelector(".sel-h")?.textContent, lit: [...document.querySelectorAll(".path .is-lit b")].map((b) => b.textContent) }));
  await page.keyboard.press("Escape");
  const cleared = await page.evaluate(() => !document.querySelector(".sel"));
  await page.click('.mf[data-slug="nexus"]');
  await page.click('[data-nx="1"]');
  await page.click('[data-nx="1"]');
  const nexus = await page.evaluate(() => ({ step: document.querySelector(".is-on .tstep b").textContent, lit: [...document.querySelectorAll(".path .is-lit b")].map((b) => b.textContent) }));
  await page.goBack();
  await page.waitForTimeout(500);
  const back = await page.evaluate(() => ({ url: location.search, title: document.querySelector(".sf-title").textContent }));
  await page.focus('.mf[data-slug="atlas"]');
  await page.keyboard.press("ArrowDown");
  const kbManifest = await page.evaluate(() => ({ title: document.querySelector(".sf-title").textContent, focus: document.activeElement.dataset.slug }));
  out.checks.c = { atlas, kbPart, cleared, nexus, back, kbManifest };
  await ctx.close();
  const d = await open(CONCEPTS.c + "?project=atlas&part=index");
  out.checks.cDeepPart = await d.page.evaluate(() => ({ view: document.querySelector('.seg-b[aria-pressed="true"]').textContent, sel: document.querySelector(".sel-h")?.textContent }));
  await d.ctx.close();
  const m = await open(CONCEPTS.c, { w: 390, h: 844 });
  await m.page.click('.ps-b[data-pane="engineering"]');
  out.checks.cMobile = await m.page.evaluate(() => ({ product: getComputedStyle(document.querySelector(".pane-product")).display, eng: getComputedStyle(document.querySelector(".pane-eng")).display }));
  await m.ctx.close();
}

/* Shell: theme control names its action and persists; sound control. */
{
  const { page, ctx } = await open(CONCEPTS.b);
  const before = await page.evaluate(() => ({ theme: document.documentElement.dataset.theme, label: document.querySelector("#theme-btn").getAttribute("aria-label"), sound: document.querySelector("#sound-btn").getAttribute("aria-pressed") }));
  await page.click("#theme-btn");
  await page.waitForTimeout(500);
  const after = await page.evaluate(() => ({ theme: document.documentElement.dataset.theme, label: document.querySelector("#theme-btn").getAttribute("aria-label"), stored: localStorage.getItem("rsx-theme") }));
  await page.click("#sound-btn");
  const sound = await page.evaluate(() => ({ pressed: document.querySelector("#sound-btn").getAttribute("aria-pressed"), stored: localStorage.getItem("rsx-sound") }));
  await page.goto(BASE + CONCEPTS.c);
  const carried = await page.evaluate(() => ({ theme: document.documentElement.dataset.theme, sound: document.querySelector("#sound-btn").getAttribute("aria-pressed") }));
  out.checks.shell = { before, after, sound, carried };
  await ctx.close();
}

await browser.close();
console.log(JSON.stringify(out, null, 1));
