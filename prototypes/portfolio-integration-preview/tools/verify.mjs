// Checks and screenshots for the portfolio integration preview, in headless
// Chromium (software WebGL). Needs the local server from the repository root:
//   python -m http.server 8765 --bind 127.0.0.1
// Then, from the repository root:
//   node prototypes/portfolio-integration-preview/tools/verify.mjs
// Writes screenshots to prototypes/portfolio-integration-preview/screenshots/
// and the results to stdout (JSON). Never writes anywhere else.
import { chromium } from "playwright";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SHOTS = join(here, "..", "screenshots");
mkdirSync(SHOTS, { recursive: true });
const HOST = "http://127.0.0.1:8765";
const BASE = `${HOST}/prototypes/portfolio-integration-preview/`;
const AXE = readFileSync(join(here, "..", "..", "..", "node_modules", "axe-core", "axe.min.js"), "utf8");
const SLUGS = ["atlas", "nexus", "extendspace", "reflux", "layers", "bhatkal-time-luxe"];
const TITLES = ["Atlas", "Nexus", "ExtendSpace", "Reflux", "Layers by RSX", "Bhatkal Time Luxe"];
const out = { checks: {}, errors: [], known: new Set(), requests: new Set(), overflow: {}, axe: {} };
const ok = (name, cond, detail) => { out.checks[name] = cond ? "pass" : `FAIL ${JSON.stringify(detail ?? "")}`; };

const browser = await chromium.launch({ args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"] });
async function open(path = "", { w = 1440, h = 900, reduce = false, wait = 1500 } = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: reduce ? "reduce" : "no-preference" });
  const page = await ctx.newPage();
  const tagErr = (s) => out.errors.push(`${path || "/"} @${w}: ${s}`);
  page.on("pageerror", (e) => tagErr(String(e)));
  page.on("console", (m) => { if (["error", "warning"].includes(m.type())) tagErr(`${m.type()}: ${m.text()}`); });
  page.on("requestfailed", (r) => {
    // Projection's shell checks the résumé with a HEAD request; Chromium aborts it the same way on
    // the untouched Projection prototype, so it is recorded as known, not as a new failure.
    if (r.method() === "HEAD" && /Rifaque_Resume\.pdf$/.test(r.url()) && r.failure()?.errorText === "net::ERR_ABORTED") return out.known.add("résumé HEAD check aborted (also on prototypes/projection/)");
    tagErr(`failed ${r.url()} ${r.failure()?.errorText}`);
  });
  page.on("response", (r) => { out.requests.add(r.url()); if (r.status() >= 400) tagErr(`HTTP ${r.status()} ${r.url()}`); });
  await page.goto(BASE + path);
  await page.waitForTimeout(wait);
  return { page, ctx };
}
const settle = (p, ms = 700) => p.waitForTimeout(ms);
const overflow = (p) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
const instantScroll = (p) => p.addStyleTag({ content: "html{scroll-behavior:auto!important}" });
const broken = (p) => p.evaluate(async () => {
  const imgs = [...document.querySelectorAll("img")];
  for (const i of imgs) { i.loading = "eager"; if (!i.complete) await new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 5000); }); }
  return imgs.filter((i) => !i.naturalWidth).map((i) => i.getAttribute("src"));
});
const state = (p) => p.evaluate(() => ({
  url: location.search, hash: location.hash, project: new URLSearchParams(location.search).get("project"), opened: new URLSearchParams(location.search).get("open"),
  scene: document.querySelector("#stage .scene:not(.leaving)")?.dataset.scene,
  title: document.querySelector("#info .in-title")?.textContent,
  current: document.querySelector('#side .sd-btn[aria-current="true"]')?.dataset.slug,
  open: document.querySelector("#detail").open,
  focus: document.activeElement?.id || document.activeElement?.className,
}));
async function axe(p, sel = null) {
  await p.evaluate(() => Promise.race([Promise.all(document.getAnimations().map((a) => a.finished.catch(() => 0))), new Promise((r) => setTimeout(r, 2000))]));
  await p.addScriptTag({ content: AXE });
  return p.evaluate(async (s) => {
    const r = await window.axe.run(s ? document.querySelector(s) : document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] } });
    return r.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
  }, sel);
}

/* ---------------------------------------------------------------- page composition */
{
  const { page, ctx } = await open("", { wait: 3500 });
  const comp = await page.evaluate(() => ({
    sections: [...document.querySelectorAll("main > section")].map((s) => [s.id, s.querySelector("h1, h2")?.textContent.trim()]),
    header: !!document.querySelector("header.top #theme-switch") && !!document.querySelector("header.top #sound-switch"),
    nav: [...document.querySelectorAll("header.top .nav a")].map((a) => a.getAttribute("href")),
    footer: document.querySelector("footer.foot")?.textContent.replace(/\s+/g, " ").trim(),
    gl: document.querySelector("#hero-stage").classList.contains("has-gl"),
    canvas: !!document.querySelector("#hero-stage canvas"),
    bench: !!document.querySelector("#bench, #stack, .readout"),
    chron: document.querySelectorAll("#chron .ch-row").length,
    edu: [...document.querySelectorAll("#chron .ch-row")].some((r) => r.dataset.kind === "study"),
    bom: [document.querySelectorAll("#bom .bom-p").length, document.querySelectorAll("#bom .bom-t").length],
    principles: document.querySelectorAll("#principles li").length,
    contact: !!document.querySelector("#contact .titleblock") && !!document.querySelector("#copy-email"),
  }));
  ok("composition: section order hero, Projects, How I work, Experience and education, Bill of materials, contact",
    JSON.stringify(comp.sections) === JSON.stringify([["top", "Rifaque Akrami"], ["work", "Projects"], ["about", "How I work"], ["experience", "Experience and education"], ["stack-index", "Bill of materials"], ["contact", "Get in touch"]]), comp.sections);
  ok("composition: Projection header with theme and sound, nav unchanged", comp.header && JSON.stringify(comp.nav) === JSON.stringify(["#work", "#about", "#experience", "#contact"]), comp);
  ok("composition: Projection footer", /© 2026 Rifaque Akrami/.test(comp.footer) && /GitHub Sponsors/.test(comp.footer), comp.footer);
  ok("composition: the old work bench is gone", !comp.bench);
  ok("hero: WebGL scene is running", comp.gl && comp.canvas, comp);
  ok("experience: timeline rows including education", comp.chron === 9 && comp.edu, comp.chron);
  ok("bill of materials: 8 projects and their technologies", comp.bom[0] === 8 && comp.bom[1] > 20, comp.bom);
  ok("about: four principles", comp.principles === 4);
  ok("contact: title block and copy button", comp.contact);

  // Hero stays interactive: R, S, X keys and a drag across the solid.
  await page.locator('.view-key[data-view="r"]').click();
  await settle(page, 1200);
  const r = await page.evaluate(() => [document.querySelector('.view-key[data-view="r"]').getAttribute("aria-pressed"), document.querySelector("#solid-now").textContent]);
  const box = await page.locator("#hero-stage canvas").boundingBox();
  await page.mouse.move(box.x + box.width * 0.65, box.y + box.height * 0.45);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) await page.mouse.move(box.x + box.width * 0.65 - i * 18, box.y + box.height * 0.45 + i * 4);
  await page.mouse.up();
  await page.locator('.view-key[data-view="axo"]').click();
  await settle(page, 1200);
  ok("hero: view keys turn the solid (R reads R)", r[0] === "true" && /R/.test(r[1]), r);

  // The hero is the first thing on the page.
  const heroTop = await page.evaluate(() => document.querySelector("#top").getBoundingClientRect().top);
  ok("hero: it is the landing gate (top of the page)", heroTop <= 64, heroTop);
  out.axe.home = await axe(page);
  await page.screenshot({ path: join(SHOTS, "1440-01-landing.png") });
  await instantScroll(page);
  await page.screenshot({ path: join(SHOTS, "1440-00-full-page.png"), fullPage: true });
  await page.evaluate(() => document.querySelector("#work").scrollIntoView());
  await settle(page, 600);
  await page.screenshot({ path: join(SHOTS, "1440-02-projects.png") });
  await ctx.close();
}

/* ---------------------------------------------------------------- Projects: selection, URL, keyboard */
{
  const { page, ctx } = await open("?nointro");
  await instantScroll(page);
  let s = await state(page);
  ok("projects: opens on Atlas", s.current === "atlas" && s.scene === "atlas" && s.title === "Atlas", s);
  const names = await page.$$eval("#side .sd-name", (els) => els.map((e) => e.textContent));
  ok("projects: six featured projects in order", JSON.stringify(names) === JSON.stringify(TITLES), names);
  const also = await page.$$eval("#also a", (as) => as.map((a) => [a.textContent, new URL(a.href).pathname]));
  ok("projects: Also built links open the QueryCraft and BlueTap case studies", also[0][1].endsWith("/portfolio-integration-preview/work/querycraft/") && also[1][1].endsWith("/portfolio-integration-preview/work/bluetap/"), also);
  const y0 = await page.evaluate(() => { document.querySelector("#work").scrollIntoView(); return Math.round(scrollY); });
  const seen = [];
  for (const slug of SLUGS) {
    await page.locator(`#side .sd-btn[data-slug="${slug}"]`).click();
    await settle(page, 900);
    s = await state(page);
    seen.push([slug, s.scene, s.current, s.project]);
    const shots = await broken(page);
    if (shots.length) out.errors.push(`broken images on ${slug}: ${shots}`);
    if (slug === "extendspace" || slug === "layers" || slug === "bhatkal-time-luxe") await page.locator("#work").screenshot({ path: join(SHOTS, `1440-03-projects-${slug}.png`) });
  }
  // Atlas is already selected on load, so choosing it again adds no history entry.
  ok("projects: each selection shows its scene and pushes ?project", seen.every(([a, b, c, u], n) => a === b && a === c && u === (n === 0 ? null : a)), seen);
  const y1 = await page.evaluate(() => Math.round(scrollY));
  ok("projects: selecting never scrolls the page", y0 === y1, [y0, y1]);
  await page.goBack(); await settle(page);
  const back = await state(page);
  await page.goForward(); await settle(page);
  const fwd = await state(page);
  ok("projects: Back and Forward step through selections", back.current === "layers" && fwd.current === "bhatkal-time-luxe", [back, fwd]);

  // Keyboard on the list.
  await page.locator('#side .sd-btn[data-slug="atlas"]').focus();
  await page.keyboard.press("ArrowDown"); await settle(page, 300);
  const k1 = await state(page);
  await page.keyboard.press("End"); await settle(page, 300);
  const k2 = await state(page);
  await page.keyboard.press("Home"); await settle(page, 300);
  const k3 = await state(page);
  ok("projects: arrow keys, Home and End select", k1.current === "nexus" && k2.current === "bhatkal-time-luxe" && k3.current === "atlas", [k1, k2, k3]);

  // Rotation and Reset view.
  const stage = page.locator("#stage");
  const hidden0 = await page.locator("#turn-reset").evaluate((b) => getComputedStyle(b).visibility);
  await page.locator("#stage .scene:not(.leaving)").focus();
  await page.keyboard.press("ArrowRight"); await settle(page, 500);
  const turned = await stage.getAttribute("data-turned");
  const vis = await page.locator("#turn-reset").evaluate((b) => getComputedStyle(b).visibility);
  const sb = await page.locator("#stage .stage3").boundingBox();
  await page.mouse.move(sb.x + sb.width / 2, sb.y + sb.height / 2); await page.mouse.down();
  for (let i = 1; i <= 8; i++) await page.mouse.move(sb.x + sb.width / 2 - i * 20, sb.y + sb.height / 2);
  await page.mouse.up(); await settle(page, 300);
  await page.locator("#turn-reset").click(); await settle(page, 700);
  const after = [await stage.getAttribute("data-turned"), await page.evaluate(() => document.activeElement.classList.contains("scene"))];
  ok("projects: rotation by keys and drag; Reset view appears only once turned and returns focus to the scene", hidden0 === "hidden" && turned === "true" && vis === "visible" && after[0] === "false" && after[1], { hidden0, turned, vis, after });

  // Detail view.
  await page.locator('#side .sd-btn[data-slug="bhatkal-time-luxe"]').click(); await settle(page);
  await page.locator("#explore").click(); await settle(page, 600);
  s = await state(page);
  const dtext = await page.locator("#detail").innerText();
  ok("detail: Explore opens it, pushes &open=1, focus on close", s.open && s.opened === "1" && s.focus === "dt-close", s);
  ok("detail: BTL facts (Bhatkal-based, India-wide, co-founder's original design, my current design, end to end, KWD experiment, showcase)",
    /Bhatkal-based/.test(dtext) && /India-wide|across India/.test(dtext) && /co-founder/.test(dtext) && /end to end/i.test(dtext) && /KWD/.test(dtext) && /not a client requirement/.test(dtext) && /showcase/.test(dtext), dtext.slice(0, 400));
  const tags = await page.$$eval("#detail .tag", (t) => t.map((x) => x.textContent));
  ok("detail: BTL evidence labelled as live-site screenshots", tags.length > 0 && tags.every((t) => t === "Screenshot, live site"), tags);
  out.axe.detail = await axe(page, "#detail");
  await page.screenshot({ path: join(SHOTS, "1440-04-detail-btl.png") });
  await page.keyboard.press("Escape"); await settle(page, 500);
  s = await state(page);
  ok("detail: Escape closes, restores the URL and focus on Explore", !s.open && s.project === "bhatkal-time-luxe" && s.opened === null && s.focus === "explore", s);
  await page.locator("#explore").click(); await settle(page, 500);
  await page.goBack(); await settle(page, 500);
  const b1 = await state(page);
  await page.goForward(); await settle(page, 500);
  const f1 = await state(page);
  ok("detail: Back closes it, Forward reopens it", !b1.open && f1.open, [b1, f1]);
  // Case study link from the detail view.
  await page.locator("#detail a", { hasText: "Case study" }).click();
  await page.waitForURL(/\/work\/bhatkal-time-luxe\/$/); await settle(page, 1200);
  ok("detail: Case study leads to the BTL case-study page", (await page.locator("h1").textContent()) === "Bhatkal Time Luxe");
  await ctx.close();
}

/* ---------------------------------------------------------------- links from other sections */
{
  const { page, ctx } = await open("?nointro");
  await instantScroll(page);
  await page.locator('#about a[data-project="nexus"]').first().click(); await settle(page, 900);
  const s = await state(page);
  const inView = await page.evaluate(() => { const r = document.querySelector("#work").getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; });
  ok("about: the Nexus link selects Nexus in Projects", s.current === "nexus" && inView, s);
  await page.locator('#bom .bom-p[data-slug="bhatkal-time-luxe"]').click(); await settle(page, 300);
  const o1 = await page.locator("#bom-out").innerHTML();
  await page.locator('#bom-out a[data-project="bhatkal-time-luxe"]').click(); await settle(page, 900);
  const s2 = await state(page);
  ok("bill of materials: a featured project opens in Projects", /Open it in Projects/.test(o1) && s2.current === "bhatkal-time-luxe", [o1, s2]);
  await page.locator('#bom .bom-p[data-slug="querycraft"]').click(); await settle(page, 300);
  const o2 = await page.locator("#bom-out a").last().getAttribute("href");
  ok("bill of materials: an Also built project links to its case study", o2 === "work/querycraft/", o2);
  // Theme and sound.
  await page.locator("#theme-switch").click(); await settle(page, 600);
  const theme = await page.evaluate(() => document.documentElement.dataset.theme);
  await page.evaluate(() => document.querySelector("#work").scrollIntoView()); await settle(page, 500);
  await page.screenshot({ path: join(SHOTS, "1440-05-projects-light.png") });
  out.axe.homeLight = await axe(page);
  await page.locator("#theme-switch").click(); await settle(page, 400);
  ok("theme: the header switch changes the whole page, Projects included", theme === "light");
  await ctx.close();
}
{
  const { page, ctx } = await open("?nointro&sound=test");
  const before = [await page.locator("#sound-switch").getAttribute("aria-label"), (await page.locator("#sound-switch").innerText()).trim()];
  await page.locator("#sound-switch").click(); await settle(page, 300);
  const after = [await page.locator("#sound-switch").getAttribute("aria-label"), await page.locator("#sound-switch").getAttribute("data-on")];
  await page.locator('#side .sd-btn[data-slug="nexus"]').click(); await settle(page, 300);
  await page.locator("#explore").click(); await settle(page, 300); await page.keyboard.press("Escape");
  ok("sound: icon-only switch, off by default (Enable sound), on after a click (Mute sound); cues play without errors", before[0] === "Enable sound" && before[1] === "" && after[0] === "Mute sound" && after[1] === "true", { before, after });
  await ctx.close();
}

/* ---------------------------------------------------------------- reduced motion */
{
  const { page, ctx } = await open("", { reduce: true });
  const intro = await page.evaluate(() => document.querySelector("#hero-stage").classList.contains("has-gl"));
  await page.evaluate(() => {
    window.__anim = [];
    const o = HTMLDialogElement.prototype.animate;
    HTMLDialogElement.prototype.animate = function (k, opt) { window.__anim.push(k); return o.call(this, k, opt); };
  });
  await page.locator('#side .sd-btn[data-slug="reflux"]').click();
  const leaving = await page.locator("#stage .scene.leaving").count();
  await page.locator("#explore").click(); await settle(page, 200);
  const anim = await page.evaluate(() => window.__anim.length);
  ok("reduced motion: scenes swap at once and the detail view does not move", leaving === 0 && anim === 0 && intro, { leaving, anim, intro });
  await ctx.close();
}

/* ---------------------------------------------------------------- case studies */
for (const [i, slug] of SLUGS.entries()) {
  const { page, ctx } = await open(`work/${slug}/`, { wait: 1300 });
  const cs = await page.evaluate(() => ({
    h1: document.querySelector("h1")?.textContent,
    header: !!document.querySelector("header.top #theme-switch"),
    footer: !!document.querySelector("footer.foot"),
    scenes: document.querySelectorAll(".cs-3d .scene").length,
    figs: document.querySelectorAll(".cs-fig figcaption .tag").length,
    back: document.querySelector("[data-back]")?.getAttribute("href"),
    next: [...document.querySelectorAll("#cs-next a")].map((a) => new URL(a.href).pathname + new URL(a.href).search + new URL(a.href).hash),
    status: !!document.querySelector("[data-status] .status"),
  }));
  const shots = await broken(page);
  ok(`case study ${slug}: loads in Projection's shell with its 3D objects, labelled figures and status`,
    cs.h1 === TITLES[i] && cs.header && cs.footer && cs.scenes > 0 && cs.figs > 0 && cs.status && !shots.length && /\?project=.*#work$/.test(cs.back) && cs.next.length === 3, { cs, shots });
  if (slug === "bhatkal-time-luxe" || slug === "extendspace") {
    out.axe[`cs-${slug}`] = await axe(page);
    await page.screenshot({ path: join(SHOTS, `1440-06-case-study-${slug}.png`) });
  }
  if (i === 0) {
    // Back to Projects returns to the selection, in view.
    await instantScroll(page);
    await page.locator("#cs-next a", { hasText: "Projects" }).click();
    await page.waitForURL(/\?project=atlas#work$/); await settle(page, 1500);
    const s = await state(page);
    const top = await page.evaluate(() => Math.round(document.querySelector("#work").getBoundingClientRect().top));
    ok("case study: Back to Projects lands on Projects with the project selected", s.current === "atlas" && top > -400 && top < 200, { s, top });
    await page.goto(BASE + `work/${slug}/`); await settle(page, 800);
    await page.locator("#cs-next a", { hasText: "Next" }).click();
    await page.waitForURL(/\/work\/nexus\/$/);
    ok("case study: Next leads to the next case study", (await page.locator("h1").textContent()) === "Nexus");
  }
  await ctx.close();
}
for (const slug of ["querycraft", "bluetap"]) {
  const { page, ctx } = await open(`work/${slug}/`, { wait: 1200 });
  const c = await page.evaluate(() => ({ h1: document.querySelector("h1")?.textContent, crumb: document.querySelector(".crumbs a")?.getAttribute("href"), nav: [...document.querySelectorAll(".st-next a")].map((a) => a.textContent) }));
  ok(`also built ${slug}: Projection's case study, linking back to Projects`, !!c.h1 && c.crumb === "../../#work" && /Projects/.test(c.nav[0]), c);
  out.axe[`also-${slug}`] = await axe(page);
  await ctx.close();
}

/* ---------------------------------------------------------------- responsive */
for (const [w, h] of [[320, 700], [360, 800], [390, 844], [427, 926], [768, 1024], [1024, 768], [1280, 800], [1440, 900], [1920, 1080], [2560, 1440]]) {
  const { page, ctx } = await open("?nointro", { w, h, wait: 1400 });
  await instantScroll(page);
  const o = { home: await overflow(page) };
  await page.locator('#side .sd-btn[data-slug="extendspace"]').click(); await settle(page, 900);
  o.extendspace = await overflow(page);
  await page.locator("#explore").click(); await settle(page, 500);
  o.detail = await page.locator("#detail").evaluate((d) => d.scrollWidth - d.clientWidth);
  if ([390, 768].includes(w)) await page.screenshot({ path: join(SHOTS, `${w}-04-detail-extendspace.png`) });
  await page.keyboard.press("Escape"); await settle(page, 400);
  const hit = await page.$$eval("#side .sd-btn, #explore", (els) => Math.min(...els.map((e) => e.getBoundingClientRect().height)));
  o.minTarget = Math.round(hit);
  if ([360, 390, 768, 1024, 2560].includes(w)) {
    await page.evaluate(() => document.querySelector("#work").scrollIntoView()); await settle(page, 400);
    await page.screenshot({ path: join(SHOTS, `${w}-02-projects.png`) });
  }
  if ([390, 768].includes(w)) {
    await page.evaluate(() => scrollTo(0, 0)); await settle(page, 300);
    await page.screenshot({ path: join(SHOTS, `${w}-01-landing.png`) });
    await page.screenshot({ path: join(SHOTS, `${w}-00-full-page.png`), fullPage: true });
  }
  for (const slug of ["bhatkal-time-luxe", "layers"]) {
    await page.goto(BASE + `work/${slug}/`); await settle(page, 1000);
    o[`cs-${slug}`] = await overflow(page);
    if (w === 390 && slug === "bhatkal-time-luxe") await page.screenshot({ path: join(SHOTS, "390-06-case-study-bhatkal-time-luxe.png"), fullPage: true });
  }
  out.overflow[`${w}x${h}`] = o;
  if (w === 390) out.axe.phone = await (async () => { await page.goto(BASE + "?nointro"); await settle(page, 1200); return axe(page); })();
  await ctx.close();
}
const worst = Object.values(out.overflow).flatMap((o) => [o.home, o.extendspace, o.detail, o["cs-bhatkal-time-luxe"], o["cs-layers"]]);
ok("responsive: no horizontal overflow, 320 to 2560", worst.every((x) => x === 0), out.overflow);
ok("responsive: project list and Explore targets at least 44px below 1100px",
  Object.entries(out.overflow).filter(([k]) => Number(k.split("x")[0]) <= 1024).every(([, o]) => o.minTarget >= 44), out.overflow);

/* ---------------------------------------------------------------- assets */
const reqs = [...out.requests];
ok("assets: the 2025 BTL collage is never requested", !reqs.some((u) => /btl-2025|ui-composite/.test(u)));
ok("assets: nothing loaded from the source prototypes", !reqs.some((u) => /\/prototypes\/(projection|projects-redesign)\//.test(u)), reqs.filter((u) => /\/prototypes\/(projection|projects-redesign)\//.test(u)));
ok("assets: no Google Play header", !reqs.some((u) => /Play_Header/i.test(u)));
ok("console: no errors, warnings, failed requests or 4xx", out.errors.length === 0, out.errors);

/* ---------------------------------------------------------------- MVP pass */
{
  const { page, ctx } = await open("?nointro", { wait: 2500 });
  const h = await page.evaluate(() => ({
    wm: [...document.querySelectorAll("header.top .wm")].filter((i) => i.offsetWidth).map((i) => [i.getAttribute("src"), i.naturalWidth > 0]),
    oldMark: !!document.querySelector(".mark-glyph, .mark-word"),
    icons: [...document.querySelectorAll("link[rel~='icon'], link[rel='apple-touch-icon']")].map((l) => l.getAttribute("href")),
    label: document.querySelector("#theme-switch .pref-label").textContent,
  }));
  await page.locator("#theme-switch").click(); await settle(page, 500);
  const l = await page.evaluate(() => ({ label: document.querySelector("#theme-switch .pref-label").textContent, aria: document.querySelector("#theme-switch").getAttribute("aria-label"), wm: [...document.querySelectorAll("header.top .wm")].filter((i) => i.offsetWidth).map((i) => i.getAttribute("src")) }));
  await page.locator("#theme-switch").click(); await settle(page, 400);
  ok("brand: the approved wordmark (dark theme), no cube mark, approved favicons", h.wm.length === 1 && /wordmark-dark\.png$/.test(h.wm[0][0]) && h.wm[0][1] && !h.oldMark && h.icons.join() === "brand/favicon.ico,brand/favicon-32-dark.png,brand/favicon-180-dark.png", h);
  ok("theme: label, accessible name and wordmark follow the theme (Light in dark, Dark in light)", h.label === "Light" && l.label === "Dark" && l.aria === "Switch to dark theme" && l.wm.length === 1 && /wordmark-light\.png$/.test(l.wm[0]), l);
  // The solid can be grabbed where it is drawn, not only in the margins.
  const box = await page.locator("#hero-stage canvas").boundingBox();
  const grabs = [];
  for (const [fx, fy] of [[0.715, 0.48], [0.62, 0.36], [0.86, 0.2]]) {
    const x = box.x + box.width * fx, y = box.y + box.height * fy;
    await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x - 40, y + 8, { steps: 4 });
    grabs.push(await page.evaluate(() => document.querySelector(".hero-canvas").classList.contains("is-dragging")));
    await page.mouse.up(); await settle(page, 200);
  }
  ok("hero: the solid is draggable at its centre, its edge and in empty stage space", grabs.every(Boolean), grabs);
  for (const id of ["work", "about", "experience", "contact"]) {
    await page.locator(`header.top .nav a[href="#${id}"]`).click(); await settle(page, 1300);
    const top = await page.evaluate((i) => Math.round(document.getElementById(i).querySelector("h2").getBoundingClientRect().top), id);
    out.checks[`nav: ${id}`] = top > 60 && top < 260 ? "pass" : `FAIL ${top}`;
  }
  const arc = await page.$$eval("#archive .arc", (rows) => rows.map((r) => [r.querySelector("h4").textContent, [...r.querySelectorAll(".arc-links a")].map((a) => a.getAttribute("href"))]));
  ok("archive: four entries with repository links (DevPilot excluded)", arc.length === 4 && arc.every(([, ls]) => ls.some((h) => /^https:\/\/github\.com\//.test(h))) && !JSON.stringify(arc).includes("DevPilot"), arc);
  const ch = await page.evaluate(() => Math.round(document.querySelector("#chron").getBoundingClientRect().height));
  ok("experience: timeline shorter than Projection's (986 px at 1440)", ch < 860 && (await page.locator("#chron .ch-row").count()) === 9, ch);
  // Corrected dates (owner, 26 Oct 2026): labels, and bars placed on the 2022-01 to 2026-10 axis (58 months).
  const rows = await page.$$eval("#chron .ch-row", (rs) => rs.map((r) => ({ t: r.querySelector(".ch-title").textContent, d: r.querySelector(".ch-dates span").textContent, approx: !!r.querySelector(".ch-approx"), l: parseFloat(r.querySelector(".ch-bar").style.left), w: parseFloat(r.querySelector(".ch-bar").style.width) })));
  const at = (y, m) => (((y - 2022) * 12 + m - 1) / 58) * 100;
  const row = (t) => rows.find((r) => r.t === t);
  const near = (a, b) => Math.abs(a - b) < 0.01;
  const rs = row("Reflux, ExtendSpace, Layers by RSX"), bt = row("BlueTap"), be = row("B.E. Computer Science and Engineering");
  ok("experience: Reflux, ExtendSpace and Layers from Oct 2026; BlueTap from Sep 2026; B.E. Dec 2022 to Jun 2026; bars match",
    rs?.d === "Oct 2026 to now" && near(rs.l, at(2026, 10)) && bt?.d === "Sep 2026 to now" && near(bt.l, at(2026, 9)) &&
    be?.d === "Dec 2022 to Jun 2026" && !be.approx && near(be.l, at(2022, 12)) && near(be.l + be.w, at(2026, 7)) &&
    rows[0].t === "Reflux, ExtendSpace, Layers by RSX" && rows[1].t === "BlueTap", rows.slice(0, 3).concat(be));
  await ctx.close();
}
{
  const { page, ctx } = await open("?nointro", { wait: 1500 });
  await page.route(/three\.min\.js/, async (r) => { await new Promise((res) => setTimeout(res, 1500)); r.continue(); });
  await page.reload(); await settle(page, 600);
  const pending = await page.evaluate(() => [document.querySelector("#hero-stage").className, getComputedStyle(document.querySelector(".hero-poster")).opacity]);
  ok("hero: no poster frame while WebGL starts", pending[0].includes("gl-pending") && pending[1] === "0", pending);
  await ctx.close();
}
for (const slug of ["querycraft", "bluetap"]) {
  const { page, ctx } = await open(`work/${slug}/`, { wait: 1300 });
  const c = await page.evaluate(() => ({ scene: !!document.querySelector(".st-3d .scene"), tag: document.querySelector(".st-3d .scene-cap .tag")?.textContent }));
  ok(`also built ${slug}: 3D illustration on its case study`, c.scene && c.tag === "Illustration", c);
  await ctx.close();
}

await browser.close();
const fails = Object.entries(out.checks).filter(([, v]) => v !== "pass");
console.log(JSON.stringify({ passed: Object.keys(out.checks).length - fails.length, total: Object.keys(out.checks).length, fails: Object.fromEntries(fails), axe: out.axe, errors: out.errors, known: [...out.known], overflow: out.overflow }, null, 2));
