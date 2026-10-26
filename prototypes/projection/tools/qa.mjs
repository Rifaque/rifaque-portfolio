// Stage A.1 checks and screenshots, in headless Chromium (software WebGL).
// Needs the local server: python -m http.server 8765 --bind 127.0.0.1
// Run from the repository root: node prototypes/projection/tools/qa.mjs
import { chromium } from "playwright";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SHOTS = join(here, "..", "screenshots");
mkdirSync(SHOTS, { recursive: true });
const BASE = "http://localhost:8765/prototypes/projection/";
const AXE = readFileSync(join(here, "..", "..", "..", "node_modules", "axe-core", "axe.min.js"), "utf8");
const report = { errors: [], overflow: {}, axe: {}, checks: {} };

const browser = await chromium.launch({ args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"] });
async function open(url, { w = 1440, h = 900, reduce = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: reduce ? "reduce" : "no-preference" });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => report.errors.push(`${url}: ${e}`));
  page.on("console", (m) => { if (["error", "warning"].includes(m.type())) report.errors.push(`${url}: ${m.type()}: ${m.text()}`); });
  await page.goto(url);
  await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" });
  await page.waitForTimeout(1300);
  return { page, ctx };
}
const to = (page, sel, off = 0) => page.evaluate(([s, o]) => { const el = document.querySelector(s); scrollTo(0, el.getBoundingClientRect().top + scrollY - 64 + o); }, [sel, off]).then(() => page.waitForTimeout(350));
const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
const axe = async (page, ctxSel = "document") => {
  await page.addScriptTag({ content: AXE });
  return page.evaluate(async (c) => {
    const r = await axe.run(c === "document" ? document : document.querySelector(c), { resultTypes: ["violations"] });
    return r.violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(" | ")}`);
  }, ctxSel);
};

/* ---------------------------------------------------------------- screenshots */
const sizes = [[1440, 900], [1920, 1080], [768, 1024], [390, 844]];
for (const [w, h] of sizes) {
  for (const theme of ["dark", "light"]) {
    const p = `${w}-${theme}-`;
    let { page, ctx } = await open(`${BASE}?nointro&clean&theme=${theme}`, { w, h });
    await page.screenshot({ path: join(SHOTS, `${p}01-hero.png`) });
    await page.evaluate(() => document.querySelector('[data-view="r"]').click());
    await page.waitForTimeout(1300);
    await page.screenshot({ path: join(SHOTS, `${p}02-hero-view-r.png`) });
    await page.evaluate(() => document.querySelector('[data-view="axo"]').click());
    await page.waitForTimeout(1200);
    await to(page, "#work", w < 700 ? 330 : 0);
    await page.screenshot({ path: join(SHOTS, `${p}03-work-atlas-what-it-is.png`) });
    await page.evaluate(() => { document.querySelector("#tab-nexus").click(); document.querySelector("#turn-inside").click(); });
    await page.waitForTimeout(1300);
    await page.screenshot({ path: join(SHOTS, `${p}04-work-nexus-how-it-works.png`) });
    await page.evaluate(() => { document.querySelector("#tab-extendspace").click(); document.querySelector("#turn-state").click(); });
    await page.waitForTimeout(1300);
    await page.screenshot({ path: join(SHOTS, `${p}05-work-extendspace-where-it-stands.png`) });
    report.overflow[`${w}-${theme}-home`] = await overflow(page);
    await to(page, "#about");
    await page.screenshot({ path: join(SHOTS, `${p}07-how-i-work.png`) });
    await to(page, "#experience");
    await page.screenshot({ path: join(SHOTS, `${p}08-experience.png`) });
    await to(page, "#stack-index");
    await page.evaluate(() => document.querySelector('[data-tech="Ollama (local models)"]').click());
    await page.waitForTimeout(250);
    await page.screenshot({ path: join(SHOTS, `${p}09-bill-of-materials.png`) });
    await to(page, "#contact");
    await page.screenshot({ path: join(SHOTS, `${p}10-contact.png`) });
    await ctx.close();
    ({ page, ctx } = await open(`${BASE}work/reflux/?theme=${theme}`, { w, h }));
    await page.screenshot({ path: join(SHOTS, `${p}06-case-study-reflux.png`) });
    report.overflow[`${w}-${theme}-study`] = await overflow(page);
    await ctx.close();
  }
}

/* ---------------------------------------------------------------- moments (1440 dark) */
{
  const { page, ctx } = await open(`${BASE}?nointro&clean&debug`);
  await page.waitForFunction(() => window.__hero);
  for (const [n, t] of [[1, 280], [2, 560], [3, 820], [4, 1080]]) {
    await page.evaluate((t) => window.__hero.seek(t), t);
    await page.screenshot({ path: join(SHOTS, `1440-dark-11-entrance-${n}-${t}ms.png`) });
  }
  await page.evaluate(() => window.__hero.seek(5000));
  await page.mouse.move(1010, 430);
  await page.mouse.down();
  await page.mouse.move(1120, 380, { steps: 6 });
  await page.screenshot({ path: join(SHOTS, "1440-dark-12-hero-dragged.png") });
  await page.mouse.up();
  await ctx.close();
}
{
  const { page, ctx } = await open(`${BASE}?nointro&clean&project=reflux`);
  await to(page, "#work");
  await page.evaluate(() => { document.querySelector("#turn-inside").click(); });
  await page.waitForTimeout(240);
  await page.screenshot({ path: join(SHOTS, "1440-dark-13-work-opening-mid-motion.png") });
  await ctx.close();
}
for (const theme of ["dark", "light"]) {
  const { page, ctx } = await open(`${BASE}?nointro&clean&webgl=off&theme=${theme}`);
  await page.screenshot({ path: join(SHOTS, `1440-${theme}-14-no-webgl.png`) });
  report.checks[`noWebGL-${theme}`] = await page.evaluate(() => ({ canvas: !!document.querySelector(".hero-canvas"), viewsHidden: document.querySelector("#views").hidden }));
  await ctx.close();
}

/* ---------------------------------------------------------------- overflow at other widths */
for (const w of [320, 1024, 2560]) for (const theme of ["dark", "light"]) {
  for (const v of ["front", "state"]) {
    const { page, ctx } = await open(`${BASE}?nointro&clean&theme=${theme}&project=extendspace&view=${v}`, { w, h: 900 });
    report.overflow[`${w}-${theme}-${v}`] = await overflow(page);
    if (w === 2560 && v === "front") await page.screenshot({ path: join(SHOTS, `2560-${theme}-15-ultrawide-hero.png`) });
    await ctx.close();
  }
}

/* ---------------------------------------------------------------- axe */
for (const theme of ["dark", "light"]) for (const v of ["front", "inside", "state"]) {
  const { page, ctx } = await open(`${BASE}?nointro&clean&theme=${theme}&project=nexus&view=${v}`);
  report.axe[`home-${theme}-${v}`] = await axe(page);
  await ctx.close();
}
for (const theme of ["dark", "light"]) {
  const { page, ctx } = await open(`${BASE}work/bhatkal-time-luxe/?theme=${theme}`);
  report.axe[`study-${theme}`] = await axe(page);
  await ctx.close();
}
{
  const { page, ctx } = await open(`${BASE}?nointro&clean`, { w: 390, h: 844 });
  report.axe["home-390-dark"] = await axe(page);
  await ctx.close();
}

/* ---------------------------------------------------------------- behaviour */
{
  const { page, ctx } = await open(`${BASE}?nointro&clean`);
  const order = [];
  for (let i = 0; i < 18; i++) {
    await page.keyboard.press("Tab");
    order.push(await page.evaluate(() => { const a = document.activeElement; return (a.id || a.className || a.tagName) + " | " + (a.getAttribute("aria-label") || a.textContent.trim()).slice(0, 26); }));
  }
  report.checks.tabOrder = order;
  await page.focus("#tab-atlas");
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(300);
  await page.focus("#turn-front");
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(900);
  report.checks.keyboardBench = await page.evaluate(() => ({
    selected: document.querySelector(".index-tab[aria-selected=true]").id,
    view: document.querySelector(".turn-key[aria-selected=true]").dataset.view,
    focus: document.activeElement.id,
    url: location.search,
    labelsReachable: [...document.querySelectorAll(".slabel")].filter((l) => !l.inert).length,
  }));
  // Bill of materials by keyboard.
  await page.focus('[data-tech="Kotlin"]');
  await page.keyboard.press("Enter");
  report.checks.bomKeyboard = await page.evaluate(() => ({ pressed: document.querySelector('[data-tech="Kotlin"]').getAttribute("aria-pressed"), out: document.querySelector("#bom-out").textContent }));
  // Theme switch persists and reaches the case-study page.
  await page.evaluate(() => document.querySelector("#theme-switch").click());
  await page.waitForTimeout(450);
  const themeAfter = await page.evaluate(() => [document.documentElement.dataset.theme, localStorage.getItem("rsx-theme")]);
  // Case study from the bench, back, direct and refresh.
  await page.evaluate(() => { document.querySelector("#tab-atlas").click(); });
  await page.waitForTimeout(300);
  await page.click("[data-study]");
  await page.waitForURL(/work\/atlas\//);
  await page.waitForTimeout(700);
  const study = await page.evaluate(() => ({ url: location.pathname, h1: document.querySelector("h1").textContent, theme: document.documentElement.dataset.theme, title: document.title }));
  await page.goBack();
  await page.waitForTimeout(1200);
  const back = await page.evaluate(() => ({ url: location.search, selected: document.querySelector(".index-tab[aria-selected=true]").id }));
  await page.goto(`${BASE}work/nexus/`);
  await page.reload();
  await page.waitForTimeout(800);
  const direct = await page.evaluate(() => ({ h1: document.querySelector("h1").textContent, next: document.querySelector(".st-next a:last-child").getAttribute("href") }));
  await page.goto(`${BASE}?work=querycraft`);
  await page.waitForTimeout(900);
  const legacy = page.url();
  report.checks.navigation = { themeAfter, study, back, direct, legacyRedirect: legacy };
  // Idle cost: animation frames requested at rest.
  await page.goto(`${BASE}?nointro&clean`);
  await page.waitForTimeout(2500);
  report.checks.idleFramesIn2s = await page.evaluate(async () => {
    let n = 0;
    const raf = window.requestAnimationFrame;
    window.requestAnimationFrame = (cb) => { n++; return raf(cb); };
    await new Promise((r) => setTimeout(r, 2000));
    window.requestAnimationFrame = raf;
    return n;
  });
  await ctx.close();
}
{
  const { page, ctx } = await open(`${BASE}?clean&project=atlas`, { reduce: true });
  await to(page, "#work");
  await page.evaluate(() => document.querySelector("#turn-state").click());
  await page.waitForTimeout(60);
  report.checks.reducedMotion = await page.evaluate(() => ({
    labelsVisibleImmediately: getComputedStyle(document.querySelector(".slabel")).visibility,
    heroReady: !!document.querySelector(".hero-canvas"),
    viewTransitionsOff: matchMedia("(prefers-reduced-motion: reduce)").matches,
  }));
  await ctx.close();
}
{
  const { page, ctx } = await open(`${BASE}?nointro&clean&sound=test`);
  await page.click("#sound-switch");
  await page.evaluate(() => { document.querySelector("#tab-reflux").click(); document.querySelector("#turn-inside").click(); });
  await page.waitForTimeout(500);
  report.checks.sound = await page.evaluate(() => ({ pressed: document.querySelector("#sound-switch").getAttribute("aria-pressed"), stored: localStorage.getItem("rsx-sound") }));
  await ctx.close();
}

await browser.close();
writeFileSync(join(here, "..", "screenshots", "qa-report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ errors: report.errors.length, overflowMax: Math.max(...Object.values(report.overflow)), axe: Object.fromEntries(Object.entries(report.axe).map(([k, v]) => [k, v.length])) }));
