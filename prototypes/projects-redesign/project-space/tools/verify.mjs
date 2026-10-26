// Verification for Concept D, Project Space. Run from the repository root
// with the local server up (python -m http.server 8765 --bind 127.0.0.1):
//   node prototypes/projects-redesign/project-space/tools/verify.mjs
import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const PATH = "/prototypes/projects-redesign/project-space/";
const HOSTS = ["http://127.0.0.1:8765", "http://localhost:8765"];
const AXE = readFileSync("node_modules/axe-core/axe.min.js", "utf8");
const SLUGS = ["atlas", "nexus", "extendspace", "reflux", "layers", "bhatkal-time-luxe"];
const out = { load: {}, errors: [], overflow: {}, axe: {}, checks: {} };
const browser = await chromium.launch({ args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"] });

async function open(q = "", { w = 1440, h = 900, reduce = false, host = HOSTS[0] } = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: reduce ? "reduce" : "no-preference" });
  const page = await ctx.newPage();
  const tagErr = (s) => out.errors.push(`${q || "/"} @${w}: ${s}`);
  page.on("pageerror", (e) => tagErr(String(e)));
  page.on("console", (m) => { if (["error", "warning"].includes(m.type())) tagErr(`${m.type()}: ${m.text()}`); });
  page.on("requestfailed", (r) => tagErr(`failed ${r.url()}`));
  page.on("response", (r) => { if (r.status() >= 400) tagErr(`HTTP ${r.status()} ${r.url()}`); });
  const res = await page.goto(host + PATH + q);
  await page.waitForTimeout(700);
  return { page, ctx, status: res.status() };
}
const settle = (p, ms = 650) => p.waitForTimeout(ms);
const overflow = (p) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
const broken = (p) => p.evaluate(async () => {
  const imgs = [...document.querySelectorAll("img")];
  for (const i of imgs) { i.loading = "eager"; if (!i.complete) await new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 4000); }); }
  return imgs.filter((i) => !i.naturalWidth).map((i) => i.getAttribute("src"));
});
const html = (p) => p.evaluate(() => document.documentElement.outerHTML);
const state = (p) => p.evaluate(() => ({
  url: location.search, scene: document.querySelector(".scene:not(.leaving)")?.dataset.scene, title: document.querySelector(".in-title")?.textContent,
  current: document.querySelector('.sd-btn[aria-current="true"]')?.dataset.slug, open: document.querySelector("#detail").open,
  focus: document.activeElement?.id || document.activeElement?.className, scrollY: Math.round(scrollY),
}));
const ok = (name, cond, detail) => { out.checks[name] = cond ? "pass" : `FAIL ${JSON.stringify(detail ?? "")}`; };

/* 1. Loads on both host forms. */
for (const host of HOSTS) {
  const { page, ctx, status } = await open("", { host });
  out.load[host] = { status, title: await page.title(), scene: (await state(page)).scene, wordmark: await page.evaluate(() => [...document.querySelectorAll("img[alt='RSX Develops']")].filter((i) => i.offsetParent).map((i) => i.src.split("/").pop())) };
  await ctx.close();
}

/* 2. Switch through all six; media resolves; nothing from the 2025 collage. */
{
  const { page, ctx } = await open();
  const seen = {};
  let allHTML = "";
  for (const s of SLUGS) {
    await page.click(`.sd-btn[data-slug="${s}"]`);
    await settle(page);
    const st = await state(page);
    seen[s] = { ...st, broken: await broken(page), imgs: await page.$$eval(".scene:not(.leaving) img", (a) => a.map((i) => i.getAttribute("src").split("/").pop())) };
    // Overlay: every gallery item resolves.
    await page.click("#explore");
    await settle(page, 450);
    const n = await page.$$eval(".th", (a) => a.length);
    const items = [];
    for (let i = 0; i < Math.max(n, 1); i++) {
      if (n) await page.click(`.th[data-i="${i}"]`);
      await settle(page, 200);
      items.push(await page.$eval("#dt-fig", (f) => ({ src: f.querySelector("img")?.getAttribute("src")?.split("/").pop() ?? "svg", tag: f.querySelector(".tag").textContent, w: f.querySelector("img")?.naturalWidth ?? 1 })));
    }
    seen[s].gallery = items;
    allHTML += await html(page);
    await page.keyboard.press("Escape");
    await settle(page, 400);
  }
  out.switching = seen;
  ok("switch: all six show scene, title and current", SLUGS.every((s) => seen[s].scene === s && seen[s].current === s && (s === "atlas" ? seen[s].url === "" : seen[s].url.includes(`project=${s}`))), seen);
  ok("media: no broken scene images", SLUGS.every((s) => !seen[s].broken.length));
  ok("media: no broken gallery images", SLUGS.every((s) => seen[s].gallery.every((g) => g.w > 0)));
  ok("btl: no 2025 collage anywhere", !/btl-2025|ui-composite/.test(allHTML));
  ok("btl: stage and gallery use current-site captures", seen["bhatkal-time-luxe"].imgs.every((i) => i.startsWith("btl-current")) && seen["bhatkal-time-luxe"].gallery.every((g) => g.src.startsWith("btl-current") && g.tag === "Screenshot, live site"), seen["bhatkal-time-luxe"]);
  ok("no DevPilot", !/devpilot/i.test(allHTML));
  await ctx.close();
}

/* 3. Layers: Studio only ever an empty, labelled 'Planned' outline. */
{
  const { page, ctx } = await open("?project=layers");
  // Studio is a flat note beside the scene, never a device inside it.
  const g = await page.$eval(".studio-flat", (el) => ({ text: el.textContent.replace(/\s+/g, " ").trim(), imgs: el.querySelectorAll("img, svg").length, inDevice: !!el.closest(".d3, .rig") }));
  await page.click("#explore");
  await settle(page, 450);
  const s = await page.$eval(".studio", (el) => ({ text: el.textContent.replace(/\s+/g, " ").trim(), imgs: el.querySelectorAll("img, svg").length }));
  const tags = await page.$$eval(".th", (a) => a.length);
  const kinds = [];
  for (let i = 0; i < tags; i++) { await page.click(`.th[data-i="${i}"]`); kinds.push(await page.$eval("#dt-fig .tag", (t) => t.textContent)); }
  out.layers = { ghost: g, studio: s, galleryTags: kinds };
  ok("layers: studio labelled planned, no imagery", /Planned/.test(g.text) && /No source exists yet/.test(g.text) && !g.imgs && !g.inDevice && /Planned/.test(s.text) && !s.imgs, out.layers);
  ok("layers: all captures labelled emulator", kinds.every((k) => k === "Emulator capture"), kinds);
  await ctx.close();
}

/* 4. Overlay: open, close button, Esc, backdrop, focus restore, position kept. */
{
  const { page, ctx } = await open();
  await page.click('.sd-btn[data-slug="reflux"]');
  await settle(page);
  await page.evaluate(() => scrollTo(0, 300));
  const y0 = (await state(page)).scrollY;
  await page.click("#explore"); await settle(page, 450);
  const opened = await state(page);
  await page.click("#dt-close"); await settle(page, 450);
  const afterClose = await state(page);
  await page.focus("#explore"); await page.keyboard.press("Enter"); await settle(page, 450);
  await page.keyboard.press("Escape"); await settle(page, 450);
  const afterEsc = await state(page);
  await page.click("#explore"); await settle(page, 450);
  await page.mouse.click(8, 450); await settle(page, 450);
  const afterBackdrop = await state(page);
  out.overlay = { opened, afterClose, afterEsc, afterBackdrop, y0 };
  ok("overlay: opens with focus on close and open=1", opened.open && opened.focus === "dt-close" && opened.url.includes("open=1"), opened);
  ok("overlay: close button restores focus and URL", !afterClose.open && afterClose.focus === "explore" && !afterClose.url.includes("open"), afterClose);
  ok("overlay: Esc closes and restores focus", !afterEsc.open && afterEsc.focus === "explore", afterEsc);
  ok("overlay: backdrop click closes", !afterBackdrop.open, afterBackdrop);
  ok("overlay: selection and scroll position kept", [afterClose, afterEsc, afterBackdrop].every((s) => s.current === "reflux" && Math.abs(s.scrollY - y0) < 2), out.overlay);
  // Tab stays in the modal. Past its last control focus may leave for the
  // browser UI (body), but never for the page content behind it.
  await page.click("#explore"); await settle(page, 450);
  const inside = [];
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    inside.push(await page.evaluate(() => document.activeElement === document.body || !!document.activeElement.closest("#detail")));
  }
  ok("overlay: focus never reaches page content while open", inside.every(Boolean), inside);
  await ctx.close();
}

/* 5. Back / Forward and deep links. */
{
  const { page, ctx } = await open();
  await page.click('.sd-btn[data-slug="layers"]'); await settle(page);
  await page.click('.sd-btn[data-slug="reflux"]'); await settle(page);
  await page.click("#explore"); await settle(page, 450);
  const seq = [await state(page)];
  for (const step of ["back", "back", "forward", "forward"]) {
    await (step === "back" ? page.goBack() : page.goForward());
    await settle(page);
    seq.push({ step, ...(await state(page)) });
  }
  out.history = seq;
  ok("history: back closes overlay, then steps selection", !seq[1].open && seq[1].current === "reflux" && seq[2].current === "layers" && seq[2].scene === "layers");
  ok("history: forward restores selection, then overlay", seq[3].current === "reflux" && !seq[3].open && seq[4].open && seq[4].current === "reflux", seq);
  await ctx.close();
  const deep = await open("?project=bhatkal-time-luxe&open=1");
  const ds = await state(deep.page);
  ok("deep link: project and open overlay", ds.current === "bhatkal-time-luxe" && ds.open, ds);
  await deep.page.keyboard.press("Escape"); await settle(deep.page, 400);
  ok("deep link: closing drops open=1 and stays on page", !(await state(deep.page)).url.includes("open") && deep.page.url().includes(PATH), deep.page.url());
  await deep.ctx.close();
  const bad = await open("?project=nope");
  ok("deep link: unknown slug falls back to first", (await state(bad.page)).current === "atlas");
  await bad.ctx.close();
}

/* 6. Keyboard selection in the sidebar. */
{
  const { page, ctx } = await open();
  await page.focus('.sd-btn[data-slug="atlas"]');
  await page.keyboard.press("ArrowDown"); await settle(page);
  const a = await state(page);
  await page.keyboard.press("End"); await settle(page);
  const b = await state(page);
  await page.keyboard.press("Enter"); await settle(page);
  ok("keyboard: arrows and End select", a.current === "nexus" && b.current === "bhatkal-time-luxe", { a, b });
  await ctx.close();
}

/* 7. Reduced motion: no animations on switch or open. */
{
  const { page, ctx } = await open("", { reduce: true });
  await page.click('.sd-btn[data-slug="extendspace"]');
  const anims = await page.evaluate(() => document.getAnimations().length);
  const st = await state(page);
  await page.click("#explore");
  const anims2 = await page.evaluate(() => document.getAnimations().length);
  ok("reduced motion: instant switch and open", anims === 0 && anims2 === 0 && st.scene === "extendspace", { anims, anims2 });
  await ctx.close();
  const m = await open("?motion=reduce");
  await m.page.click('.sd-btn[data-slug="nexus"]');
  ok("reduced motion via ?motion=reduce", (await m.page.evaluate(() => document.getAnimations().length)) === 0);
  await m.ctx.close();
}

/* 8. Theme and sound controls. */
{
  const { page, ctx } = await open();
  const before = await page.evaluate(() => ({ theme: document.documentElement.dataset.theme, label: document.querySelector("#theme-btn").getAttribute("aria-label"), sound: document.querySelector("#sound-btn").getAttribute("aria-pressed") }));
  await page.click("#theme-btn"); await settle(page, 500);
  const after = await page.evaluate(() => ({ theme: document.documentElement.dataset.theme, label: document.querySelector("#theme-btn").getAttribute("aria-label"), wm: [...document.querySelectorAll("img[alt='RSX Develops']")].filter((i) => i.offsetParent).map((i) => i.src.split("/").pop()) }));
  await page.click("#sound-btn");
  const muted = await page.$eval("#sound-btn", (b) => b.getAttribute("aria-pressed"));
  out.controls = { before, after, muted };
  ok("theme: toggles, names action, swaps wordmark", before.theme === "dark" && after.theme === "light" && /light/.test(before.label) && /dark/.test(after.label) && after.wm[0].includes("light"), out.controls);
  ok("sound: on by default, mute toggles", before.sound === "true" && muted === "false", out.controls);
  await ctx.close();
}

/* 11. The 3D stage: default views, shared rotation, reset, cancellation,
   rapid switching, keyboard, touch, honesty of screens. */
{
  const rig = (p) => p.evaluate(() => {
    const s = document.querySelector(".scene:not(.leaving)");
    const r = s.querySelector(".rig");
    // Compare angles numerically: the browser normalises "-5.00deg" to "-5deg".
    const ang = /rotateX\(([-\d.]+)deg\) rotateY\(([-\d.]+)deg\)/.exec(r.style.transform) ?? [0, NaN, NaN];
    const atDefault = Math.abs(ang[1] - r.dataset.rx) < 0.05 && Math.abs(ang[2] - r.dataset.ry) < 0.05;
    return {
      slug: s.dataset.scene, t: r.style.transform, atDefault,
      ry: +(/rotateY\(([-\d.]+)deg\)/.exec(r.style.transform)?.[1] ?? NaN), dragging: s.classList.contains("is-dragging"),
      scenes: document.querySelectorAll("#stage3 .scene").length, leaving: document.querySelectorAll(".scene.leaving").length,
      devs: [...s.querySelectorAll(".d3")].filter((d) => getComputedStyle(d).display !== "none").map((d) => {
        const b = d.querySelector(".d3-face").getBoundingClientRect();
        return { id: d.dataset.dev, style: d.getAttribute("style"), cx: b.x + b.width / 2, cy: b.y + b.height / 2, w: b.width };
      }),
    };
  });
  // A point on a device that hit-tests to that device (not to one in front of it).
  const grab = (p, id) => p.evaluate((id) => {
    const d = document.querySelector(`.scene:not(.leaving) .d3[data-dev="${id}"]`);
    d.scrollIntoView({ block: "center" });
    const b = d.querySelector(".d3-face").getBoundingClientRect();
    for (let fy = 0.5; fy < 0.95; fy += 0.1) for (let fx = 0.5; fx > 0.05; fx -= 0.1) for (const sx of [1, -1]) {
      const x = b.x + b.width * (0.5 + sx * (fx - 0.5)), y = b.y + b.height * fy;
      if (document.elementFromPoint(x, y)?.closest(".d3") === d) return { x, y };
    }
    return null;
  }, id);
  const drag = async (p, from, dx, dy = 0, steps = 8) => {
    await p.mouse.move(from.x, from.y);
    await p.mouse.down();
    for (let i = 1; i <= steps; i++) await p.mouse.move(from.x + (dx * i) / steps, from.y + (dy * i) / steps);
    await p.mouse.up();
    await settle(p, 120);
  };
  const t3 = {};
  // Reset view is shown only once the scene has been turned (hidden means already at the default).
  const resetView = async (p) => { if (await p.isVisible("#turn-reset")) await p.click("#turn-reset"); };

  // Default orientation, every scene, by deep link and after switching.
  {
    const { page, ctx } = await open();
    const defaults = {};
    for (const s of SLUGS) {
      await page.click(`.sd-btn[data-slug="${s}"]`); await settle(page, 700);
      const r = await rig(page);
      defaults[s] = r.atDefault && r.scenes === 1 && r.leaving === 0;
    }
    t3.defaults = defaults;
    ok("3d: every scene opens at its default view", Object.values(defaults).every(Boolean), defaults);
    await ctx.close();
  }

  // Dragging any device turns the whole group; arrangement and device transforms hold.
  {
    const { page, ctx } = await open();
    const results = {};
    for (const s of SLUGS) {
      await page.click(`.sd-btn[data-slug="${s}"]`); await settle(page, 700);
      const base = await rig(page);
      for (const d of base.devs) {
        await resetView(page); await settle(page, 500);
        const before = await rig(page);
        const at = await grab(page, d.id);
        if (!at) { results[`${s}/${d.id}`] = "no hit point"; continue; }
        await drag(page, at, 90);
        const after = await rig(page);
        const same = before.devs.every((b, i) => b.style === after.devs[i].style);
        const allMoved = before.devs.every((b, i) => Math.abs(b.cx - after.devs[i].cx) + Math.abs(b.cy - after.devs[i].cy) + Math.abs(b.w - after.devs[i].w) > 0.5);
        const order = (r) => r.devs.map((x) => x.id).sort((a, b) => r.devs.find((x) => x.id === a).cx - r.devs.find((x) => x.id === b).cx).join(",");
        results[`${s}/${d.id}`] = after.ry > before.ry + 3 && same && allMoved && order(before) === order(after) && !after.dragging ? "pass" : { before: before.ry, after: after.ry, same, allMoved, o1: order(before), o2: order(after) };
      }
      // Reset returns to the default.
      await resetView(page); await settle(page, 550);
      const r = await rig(page);
      results[`${s}/reset`] = r.atDefault ? "pass" : r.t;
    }
    t3.drag = results;
    ok("3d: dragging any device turns the shared group, arrangement kept", Object.entries(results).filter(([k]) => !k.endsWith("reset")).every(([, v]) => v === "pass"), results);
    ok("3d: reset view restores the default", Object.entries(results).filter(([k]) => k.endsWith("reset")).every(([, v]) => v === "pass"), results);
    ok("3d: every featured scene has linked devices", SLUGS.every((s) => Object.keys(results).filter((k) => k.startsWith(`${s}/`) && !k.endsWith("reset")).length >= 2), Object.keys(results));

    // Full horizontal rotation: several drags of about half a turn each, past two
    // revolutions in total. No jump between frames; folding the angle on release
    // changes nothing on screen; the stored angle stays near the default.
    await page.click('.sd-btn[data-slug="extendspace"]'); await settle(page, 700);
    const matrix = () => page.$eval(".scene:not(.leaving) .rig", (r) => getComputedStyle(r).transform.match(/-?[\d.e-]+/g).map(Number));
    const sc = await page.$eval(".scene:not(.leaving)", (s) => { s.scrollIntoView({ block: "center" }); const r = s.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
    let total = 0, maxStep = 0, foldOk = true, nearDefault = true;
    for (let k = 0; k < 5; k++) {
      const y = sc.y + sc.h * 0.12;
      await page.mouse.move(sc.x + 6, y); await page.mouse.down();
      let last = (await rig(page)).ry; const first = last;
      for (let i = 1; i <= 12; i++) {
        await page.mouse.move(sc.x + 6 + ((sc.w - 12) * i) / 12, y);
        await settle(page, 20);
        const r = (await rig(page)).ry;
        maxStep = Math.max(maxStep, Math.abs(r - last)); last = r;
      }
      total += last - first;
      const before = await matrix();
      await page.mouse.up(); await settle(page, 80);
      const after = await matrix();
      foldOk &&= before.every((v, i) => Math.abs(v - after[i]) < 1e-3);
      nearDefault &&= Math.abs((await rig(page)).ry - -4) <= 180.01;
    }
    t3.revolutions = { total, maxStep, foldOk, nearDefault };
    ok("3d: full horizontal rotation, past two revolutions", total > 720, t3.revolutions);
    ok("3d: no jumps while turning, none when the angle is folded", maxStep < 25 && foldOk && nearDefault, t3.revolutions);
    // Vertical rotation stays within its deliberate range.
    await resetView(page); await settle(page, 500);
    const cy = { x: sc.x + 8, y: sc.y + sc.h / 2 };
    await drag(page, cy, 0, 500, 10);
    const down = await page.$eval(".scene:not(.leaving) .rig", (r) => +/rotateX\(([-\d.]+)deg/.exec(r.style.transform)[1]);
    await resetView(page); await settle(page, 500);
    await drag(page, { x: cy.x, y: cy.y + 200 }, 0, -500, 10);
    const up = await page.$eval(".scene:not(.leaving) .rig", (r) => +/rotateX\(([-\d.]+)deg/.exec(r.style.transform)[1]);
    t3.vertical = { down, up };
    ok("3d: vertical rotation limited to -30 to 24 degrees", down === -30 && up === 24, t3.vertical);
    ok("3d: no visible turn buttons", (await page.$$("#turn-l, #turn-r, .turn button:not(#turn-reset)")).length === 0);

    // Pointer cancellation and window blur end a drag; later movement does nothing.
    await resetView(page); await settle(page, 500);
    const h = await grab(page, "host");
    await page.mouse.move(h.x, h.y); await page.mouse.down(); await page.mouse.move(h.x + 40, h.y); await page.mouse.move(h.x + 60, h.y);
    await settle(page, 60);
    const mid = await rig(page);
    await page.evaluate(() => document.querySelector(".scene:not(.leaving)").dispatchEvent(new PointerEvent("pointercancel", { pointerId: 1, bubbles: true })));
    await page.mouse.move(h.x + 160, h.y); await settle(page, 60);
    const afterCancel = await rig(page);
    await page.mouse.up();
    await page.mouse.move(h.x, h.y); await page.mouse.down(); await page.mouse.move(h.x + 30, h.y); await page.mouse.move(h.x + 50, h.y);
    await page.evaluate(() => dispatchEvent(new Event("blur")));
    await page.mouse.move(h.x + 200, h.y); await settle(page, 60);
    const afterBlur = await rig(page);
    await page.mouse.up();
    t3.cancel = { mid: mid.ry, afterCancel: afterCancel.ry, blurDragging: afterBlur.dragging };
    ok("3d: pointercancel ends the drag", mid.dragging && !afterCancel.dragging && afterCancel.ry === mid.ry, t3.cancel);
    ok("3d: window blur ends the drag", !afterBlur.dragging, t3.cancel);

    // Rapid drag starts and ends never leave a drag stuck.
    for (let i = 0; i < 12; i++) { await page.mouse.move(h.x, h.y); await page.mouse.down(); await page.mouse.move(h.x + 8 + i, h.y); await page.mouse.up(); }
    ok("3d: rapid drags never stick", !(await rig(page)).dragging);

    // A drag that ends over Explore does not open it; a click without movement still works.
    await resetView(page); await settle(page, 500);
    const ex = await page.$eval("#explore", (b) => { const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
    const t0 = await grab(page, "tablet");
    await page.mouse.move(t0.x, t0.y); await page.mouse.down(); await page.mouse.move((t0.x + ex.x) / 2, (t0.y + ex.y) / 2, { steps: 6 }); await page.mouse.move(ex.x, ex.y, { steps: 6 }); await page.mouse.up();
    await settle(page, 300);
    const stOpen = await state(page);
    ok("3d: dragging never activates Explore", !stOpen.open && !stOpen.url.includes("open"), stOpen);
    await page.click("#explore"); await settle(page, 400);
    ok("3d: Explore still opens on a plain click", (await state(page)).open);
    await page.keyboard.press("Escape"); await settle(page, 400);

    // A turned scene never leaks its angle into the next project, or back.
    await drag(page, await grab(page, "host"), 120);
    const turned = await rig(page);
    await page.click('.sd-btn[data-slug="bhatkal-time-luxe"]'); await settle(page, 700);
    const next = await rig(page);
    await page.click('.sd-btn[data-slug="extendspace"]'); await settle(page, 700);
    const back = await rig(page);
    ok("3d: switching starts each scene at its own default", !turned.atDefault && next.atDefault && back.atDefault, { turned: turned.t, next: next.t, back: back.t });
    ok("3d: reset control reflects state", (await page.$eval("#stage", (s) => s.dataset.turned)) === "false");
    const shown = () => page.$eval("#turn-reset", (b) => getComputedStyle(b).visibility === "visible");
    const hidden0 = !(await shown());
    await drag(page, await grab(page, "tablet"), 140);
    const shown1 = await shown();
    await page.focus("#explore"); await page.keyboard.press("Shift+Tab");
    let reached = false;
    for (let i = 0; i < 6 && !reached; i++) { reached = await page.evaluate(() => document.activeElement?.id === "turn-reset"); if (!reached) await page.keyboard.press("Shift+Tab"); }
    await page.keyboard.press("Enter"); await settle(page, 600);
    const afterKey = { atDefault: (await rig(page)).atDefault, hidden: !(await shown()), focus: await page.evaluate(() => document.activeElement?.classList.contains("scene")) };
    t3.reset = { hidden0, shown1, reached, ...afterKey };
    ok("3d: Reset view hidden at the default, shown once turned", hidden0 && shown1, t3.reset);
    ok("3d: Reset view is keyboard-reachable; after reset focus moves to the scene", reached && afterKey.atDefault && afterKey.hidden && afterKey.focus, t3.reset);

    // Rapid switching: no stuck, overlapping or stale scenes.
    await page.evaluate(async () => {
      const ids = ["atlas", "nexus", "extendspace", "reflux", "layers", "bhatkal-time-luxe", "nexus", "layers", "reflux"];
      for (const id of ids) { document.querySelector(`.sd-btn[data-slug="${id}"]`).click(); await new Promise((r) => setTimeout(r, 25)); }
    });
    const during = await rig(page);
    await settle(page, 900);
    const rapid = await rig(page);
    const st = await state(page);
    t3.rapid = { during: { scenes: during.scenes, leaving: during.leaving }, after: { slug: rapid.slug, scenes: rapid.scenes, leaving: rapid.leaving, t: rapid.t }, current: st.current };
    ok("3d: rapid switching settles on one correct scene", during.scenes <= 2 && rapid.scenes === 1 && rapid.leaving === 0 && rapid.slug === "reflux" && st.current === "reflux" && st.title === "Reflux" && rapid.atDefault, t3.rapid);

    // Keyboard: the focused scene turns with the arrow keys; Home and R reset.
    await page.focus(".scene:not(.leaving)");
    const described = await page.$eval(".scene:not(.leaving)", (s) => document.getElementById(s.getAttribute("aria-describedby"))?.textContent ?? "");
    await page.keyboard.press("ArrowRight"); await settle(page, 320);
    const k1 = await rig(page);
    await page.keyboard.press("ArrowRight"); await settle(page, 320);
    const k2 = await rig(page);
    await page.keyboard.press("ArrowLeft"); await page.keyboard.press("ArrowLeft"); await page.keyboard.press("ArrowLeft"); await settle(page, 320);
    const k3 = await rig(page);
    await page.keyboard.press("Home"); await settle(page, 520);
    const k4 = await rig(page);
    await page.keyboard.press("ArrowRight"); await settle(page, 320); await page.keyboard.press("r"); await settle(page, 520);
    const k5 = await rig(page);
    const bodyText = await page.textContent("body");
    t3.keys = [k1.ry, k2.ry, k3.ry, k4.ry, k5.ry, described];
    ok("3d: the focused scene still turns from the keyboard and resets", Math.abs(k1.ry - 25) < 0.6 && Math.abs(k2.ry - 40) < 0.6 && Math.abs(k3.ry - -5) < 0.6 && k4.atDefault && k5.atDefault, t3.keys);
    ok("3d: no rotation instructions or keyboard shortcuts advertised", !described && !/arrow keys|drag to turn|all the way round|swipe sideways/i.test(bodyText), described);

    // Theme change keeps the angle and restyles the hardware.
    await drag(page, await grab(page, "model"), 60);
    const pre = await rig(page);
    const shell0 = await page.$eval(".scene:not(.leaving) .d3-monitor .d3-face", (f) => getComputedStyle(f).backgroundImage);
    await page.click("#theme-btn"); await settle(page, 500);
    const post = await rig(page);
    const shell1 = await page.$eval(".scene:not(.leaving) .d3-monitor .d3-face", (f) => getComputedStyle(f).backgroundImage);
    ok("3d: theme change keeps the view, restyles devices", pre.t === post.t && shell0 !== shell1, { pre: pre.t, post: post.t });
    await page.click("#theme-btn"); await settle(page, 400);

    // Idle scenes never move.
    await page.click('.sd-btn[data-slug="layers"]'); await settle(page, 900);
    const idle0 = await rig(page);
    await settle(page, 1500);
    const idle1 = await rig(page);
    const running = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length);
    ok("3d: idle scene is completely still", idle0.t === idle1.t && JSON.stringify(idle0.devs) === JSON.stringify(idle1.devs) && running === 0, { running });

    // Honest screens: every scene image is a known capture; drawings and notes carry no image.
    const ALLOWED = ["atlas-1.0-ask.webp", "atlas-workspaces-paths-masked.webp", "extendspace-usb-stream-test-pattern.webp", "layers-large-window-editor.webp", "layers-emulator-launcher-1.webp", "btl-current-home-desktop-inr.webp", "btl-current-product-mobile-inr.webp"];
    const honesty = {};
    for (const s of SLUGS) {
      await page.click(`.sd-btn[data-slug="${s}"]`); await settle(page, 700);
      honesty[s] = await page.evaluate(() => {
        const sc = document.querySelector(".scene:not(.leaving)");
        return [...sc.querySelectorAll(".d3")].map((d) => ({ id: d.dataset.dev, real: d.hasAttribute("data-real"), imgs: [...d.querySelectorAll("img")].map((i) => i.getAttribute("src").split("/").pop()) }));
      });
    }
    t3.honesty = honesty;
    const flat = Object.values(honesty).flat();
    ok("3d: scene images are genuine captures only", flat.every((d) => d.imgs.every((i) => ALLOWED.includes(i)) && (d.real ? d.imgs.length === 1 : d.imgs.length === 0)), honesty);
    ok("3d: no product screenshot for Nexus, ExtendSpace host, Reflux or Studio", !honesty.nexus.some((d) => d.imgs.length) && !honesty.reflux.some((d) => d.imgs.length) && !honesty.extendspace.find((d) => d.id === "host").imgs.length && !honesty.layers.some((d) => /studio/i.test(d.id)), honesty);
    const hostText = await page.evaluate(() => { document.querySelector('.sd-btn[data-slug="extendspace"]').click(); return new Promise((r) => setTimeout(() => r(document.querySelector('.scene:not(.leaving) .d3[data-dev="host"]').textContent.replace(/\s+/g, " ")), 300)); });
    ok("3d: ExtendSpace host screen labelled illustration, Connect disabled", /Illustration/.test(hostText) && /Connect: disabled/.test(hostText), hostText);
    // The cable: in the rotating group, ends at the host's right side and the tablet's
    // left edge, and touching both at every angle of a full turn.
    await settle(page, 400);
    const geo = await page.evaluate(() => {
      const sc = document.querySelector(".scene:not(.leaving)");
      const c = sc.querySelector(".cable3");
      const v = (id, n) => +getComputedStyle(sc.querySelector(`.d3[data-dev="${id}"]`)).getPropertyValue(n);
      return { inRig: !!c?.closest(".rig"), segs: c?.children.length, ends: JSON.parse(c?.dataset.ends ?? "[]"), hostRight: v("host", "--dx") + v("host", "--dw") / 2, tabLeft: v("tablet", "--dx") - v("tablet", "--dw") / 2 };
    });
    const touches = {};
    for (const a of [0, 45, 90, 135, 180, 225, 270, 315, 360]) {
      await page.evaluate((a) => { const t = document.querySelector(".scene:not(.leaving)")._turn; t.tween(-6, -4 + a, 0); }, a);
      await settle(page, 60);
      touches[a] = await page.evaluate(() => {
        const sc = document.querySelector(".scene:not(.leaving)");
        const plugs = [...sc.querySelectorAll(".cable3 > .cb-plug")].map((e) => e.getBoundingClientRect());
        const union = (rs) => rs.reduce((u, r) => ({ l: Math.min(u.l, r.left), t: Math.min(u.t, r.top), r: Math.max(u.r, r.right), b: Math.max(u.b, r.bottom) }), { l: 1e9, t: 1e9, r: -1e9, b: -1e9 });
        const near = (a, b, m = 4) => a.l <= b.r + m && b.l <= a.r + m && a.t <= b.b + m && b.t <= a.b + m;
        const box = (sel) => union([...sc.querySelectorAll(sel)].map((e) => e.getBoundingClientRect()));
        const A = union(plugs.slice(0, 2)), B = union(plugs.slice(2, 4)), all = box(".cable3 > i");
        return near(A, box('.d3[data-dev="host"] .d3-body')) && near(B, box('.d3[data-dev="tablet"] .d3-body')) && all.r - all.l > 2 && all.b - all.t > 2;
      });
    }
    t3.cable = { ...geo, touches };
    ok("3d: USB cable is part of the rotating group and ends at both ports", geo.inRig && geo.segs === 48 && Math.abs(geo.ends[0][0] - geo.hostRight) < 0.05 && Math.abs(geo.ends[1][0] - geo.tabLeft) < 0.05, t3.cable);
    ok("3d: USB cable stays connected and visible through a full turn", Object.values(touches).every(Boolean), touches);

    // Fronts, sides and backs: what you hit from each side is the right face.
    const faces = {};
    for (const s of SLUGS) {
      await page.click(`.sd-btn[data-slug="${s}"]`); await settle(page, 700);
      const probe = (a) => page.evaluate((a) => {
        const sc = document.querySelector(".scene:not(.leaving)");
        const t = sc._turn; t.tween(t.view[0], t.view[1] + a, 0);
        return [...sc.querySelectorAll(".d3")].filter((d) => getComputedStyle(d).display !== "none").map((d) => {
          const b = d.querySelector(".d3-body").getBoundingClientRect();
          const hit = document.elementFromPoint(b.x + b.width / 2, b.y + b.height * 0.3);
          return { id: d.dataset.dev, front: !!hit?.closest(".d3-face"), back: !!hit?.closest(".d3-back, .d3-stand, .d3-foot"), side: Math.max(...[...d.querySelectorAll(".d3-l, .d3-r")].map((e) => e.getBoundingClientRect().width)) };
        });
      }, a);
      const f0 = await probe(0), f90 = await probe(90), f180 = await probe(180);
      faces[s] = { front: f0.filter((d) => d.front).length, back: f180.filter((d) => d.back).length, frontFromBehind: f180.filter((d) => d.front).length, sides: f90.filter((d) => d.side > 2).length, n: f0.length };
    }
    t3.faces = faces;
    ok("3d: fronts face forward, backs face back, sides have depth", Object.values(faces).every((f) => f.front >= 1 && f.back >= 1 && f.frontFromBehind === 0 && f.sides >= 1), faces);

    // Rear details: an RSX mark on every device back (not on windows or glass), turned to read from behind.
    const backs = {};
    for (const s of SLUGS) {
      await page.click(`.sd-btn[data-slug="${s}"]`); await settle(page, 600);
      Object.assign(backs, await page.evaluate(() => {
      const res = {};
      for (const d of document.querySelectorAll(".scene:not(.leaving) .d3")) {
        const kind = [...d.classList].find((c) => c.startsWith("d3-") && c !== "d3").slice(3);
        const back = d.querySelector(".d3-back");
        const m = new DOMMatrix(getComputedStyle(back).transform);
        res[kind] = { mark: d.querySelector(".bk-mark")?.textContent ?? "", turned: m.m11 < -0.99, cam: !!d.querySelector(".bk-cam"), vent: !!d.querySelector(".bk-vent"), ports: d.querySelectorAll(".bk-ports i").length };
      }
      return res;
      }));
    }
    t3.backs = backs;
    ok("3d: device backs carry RSX marks and rear details, turned to face backwards", Object.values(backs).every((b) => b.turned) && ["monitor", "tablet", "phone", "tv"].every((k) => !backs[k] || backs[k].mark === "RSX") && (!backs.phone || backs.phone.cam) && (!backs.tablet || backs.tablet.cam) && (!backs.monitor || (backs.monitor.vent && backs.monitor.ports === 3)), backs);

    // Glass: one drawing, translucent front and rear sheets, so the rear view is the same drawing seen through.
    const glass = {};
    for (const s of ["nexus", "reflux"]) {
      await page.click(`.sd-btn[data-slug="${s}"]`); await settle(page, 700);
      glass[s] = await page.evaluate(() => {
        const g = document.querySelector(".scene:not(.leaving) .d3-glass");
        const alpha = (el) => { const m = /rgba?\(([^)]+)\)/.exec(getComputedStyle(el).backgroundColor); const p = m[1].split(/[ ,/]+/).filter(Boolean); return p.length > 3 ? +p[3] : 1; };
        return { svgs: g.querySelectorAll("svg").length, face: alpha(g.querySelector(".d3-face")), back: alpha(g.querySelector(".d3-back")), faceBackface: getComputedStyle(g.querySelector(".d3-face")).backfaceVisibility, text: !!document.querySelector(".scene-aside .as-text li") };
      });
    }
    t3.glass = glass;
    ok("3d: glass panels show one drawing through translucent sheets, with a text version outside", Object.values(glass).every((g) => g.svgs === 1 && g.face < 1 && g.back < 1 && g.faceBackface === "visible" && g.text), glass);
    await page.click('.sd-btn[data-slug="extendspace"]'); await settle(page, 700);
    ok("3d: labels are hidden from behind, not mirrored", await page.$eval(".scene:not(.leaving) .d3-label", (l) => getComputedStyle(l).backfaceVisibility === "hidden"));
    await ctx.close();
  }

  // The stage never collides with the info column at any angle, at three desktop widths.
  {
    const hits = {};
    for (const w of [1280, 1440, 1920]) {
      const { page, ctx } = await open("", { w, h: 900 });
      for (const s of SLUGS) {
        await page.click(`.sd-btn[data-slug="${s}"]`); await settle(page, 700);
        for (const a of [0, 45, 90, 135, 180, 225, 270, 315]) {
          const r = await page.evaluate((a) => {
            const sc = document.querySelector(".scene:not(.leaving)"); const t = sc._turn; t.tween(t.view[0], t.view[1] + a, 0);
            const info = document.querySelector("#info").getBoundingClientRect();
            const side = document.querySelector(".sp-side").getBoundingClientRect();
            let l = 1e9, rr = -1e9;
            for (const e of sc.querySelectorAll(".d3-body, .d3-stand, .d3-foot, .cable3 > i")) { const b = e.getBoundingClientRect(); if (!b.width) continue; l = Math.min(l, b.left); rr = Math.max(rr, b.right); }
            return { overInfo: rr - info.left, overSide: side.right - l };
          }, a);
          if (r.overInfo > 0 || r.overSide > 0) hits[`${w}/${s}/${a}`] = r;
        }
      }
      await ctx.close();
    }
    t3.collisions = hits;
    ok("3d: devices never reach the project list or info column at any angle (1280 to 1920)", !Object.keys(hits).length, hits);
  }

  // Reduced motion: switching, reset and the modal work without movement.
  {
    const { page, ctx } = await open("?project=bhatkal-time-luxe", { reduce: true });
    await drag(page, await grab(page, "phone"), 80);
    const turned = await rig(page);
    await resetView(page);
    const r = await rig(page);
    const anims = await page.evaluate(() => document.getAnimations().length);
    ok("3d: reduced motion resets instantly", !turned.atDefault && r.atDefault && anims === 0, { anims });
    await ctx.close();
  }

  // Phones and tablets: composition, touch turning and normal scrolling.
  for (const [w, h, label] of [[390, 844, "phone"], [844, 390, "phone-landscape"], [768, 1024, "tablet"]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: w < 640 });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => out.errors.push(`touch ${label}: ${e}`));
    await page.goto(HOSTS[0] + PATH + "?project=layers");
    await settle(page, 800);
    const counts = {};
    for (const s of SLUGS) {
      await page.evaluate((s) => document.querySelector(`.sd-btn[data-slug="${s}"]`).click(), s); await settle(page, 700);
      counts[s] = (await rig(page)).devs.length;
    }
    t3[`counts-${label}`] = counts;
    if (label === "phone") ok("3d: phones show one device and at most one companion", Object.values(counts).every((n) => n >= 1 && n <= 2), counts);
    else ok(`3d: ${label} keeps the linked composition`, Object.values(counts).every((n) => n >= 2), counts);
    await page.evaluate(() => document.querySelector('.sd-btn[data-slug="layers"]').click()); await settle(page, 700);
    await page.evaluate(() => document.querySelector("#stage").scrollIntoView({ block: "center" })); await settle(page, 300);
    const cdp = await ctx.newCDPSession(page);
    const swipe = async (x0, y0, x1, y1) => {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x0, y: y0 }] });
      for (let i = 1; i <= 10; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x0 + ((x1 - x0) * i) / 10, y: y0 + ((y1 - y0) * i) / 10 }] });
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await settle(page, 400);
    };
    const tab = await grab(page, "tablet");
    const a = await rig(page); const y0 = await page.evaluate(() => scrollY);
    await swipe(tab.x - 40, tab.y, tab.x + 60, tab.y + 4);
    const b = await rig(page); const y1 = await page.evaluate(() => scrollY);
    await swipe(tab.x, tab.y + 60, tab.x + 3, tab.y - 120);
    const c = await rig(page); const y2 = await page.evaluate(() => scrollY);
    t3[`touch-${label}`] = { ry: [a.ry, b.ry, c.ry], scroll: [y0, y1, y2] };
    ok(`3d: ${label} sideways swipe turns, page stays put`, b.ry > a.ry + 3 && Math.abs(y1 - y0) < 4, t3[`touch-${label}`]);
    ok(`3d: ${label} vertical swipe scrolls, view unchanged`, y2 > y1 + 40 && c.ry === b.ry, t3[`touch-${label}`]);
    await ctx.close();
  }

  // Content data and logs: no 2025 collage reference, no phone number.
  const files = ["data.js", "scenes.js", "space.js", "stage3d.js", "index.html", "media/captures/capture-log.json", ...["atlas", "nexus", "extendspace", "reflux", "layers", "bhatkal-time-luxe"].map((s) => `case-studies/${s}/index.html`), "case-studies/cs.js", "case-studies/diagrams.js"].map((f) => readFileSync(`prototypes/projects-redesign/project-space/${f}`, "utf8"));
  ok("data: collage filename absent from page sources and content data", !files.filter((_, i) => i !== 5).some((t) => /btl-2025-ui-composite/.test(t)));
  ok("copy: the removed BTL disclaimer appears nowhere", !files.some((t) => /not every part|not all rifaque/i.test(t)));
  ok("copy: no claim that wireless ExtendSpace is implemented", !files.some((t) => /wi-?fi[^.<]{0,50}\b(is|are) (now )?(implemented|available|supported|working)/i.test(t)) && /Planned after the wired milestone/.test(files[1]));
  ok("privacy: no phone number in sources or capture log", !files.some((t) => /6364\s?282251|wa\.me\/\d|tel:\+?\d/.test(t)));
  out.three = t3;
}

/* 12. Case studies: load, links, real media, diagrams, 3D objects, copy, layout, axe. */
{
  const CS = (s) => `${PATH}case-studies/${s}/`;
  const cs = {};
  for (const s of SLUGS) {
    const { page, ctx, status } = await open(`case-studies/${s}/`);
    await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; });
    const info = await page.evaluate(async () => {
      for (const i of document.images) i.loading = "eager";
      await Promise.all([...document.images].map((i) => i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 4000); })));
      return {
        title: document.title, h1: document.querySelector("h1")?.textContent,
        broken: [...document.images].filter((i) => !i.naturalWidth).map((i) => i.getAttribute("src")),
        // Page imagery only: the header wordmark is not project evidence.
        imgs: [...document.querySelectorAll("main img")].map((i) => i.getAttribute("src").split("/").pop()),
        tags: [...document.querySelectorAll(".cs-fig figcaption .tag")].map((t) => t.textContent),
        scenes: document.querySelectorAll(".scene").length, dias: document.querySelectorAll(".cs-dia svg").length,
        sections: document.querySelectorAll(".cs-sec").length, status: !!document.querySelector("[data-status] .status"),
        links: [...document.querySelectorAll("a[href]")].map((a) => a.href).filter((h) => h.startsWith(location.origin)),
        text: document.body.innerText,
      };
    });
    // Every internal link resolves.
    const bad = [];
    for (const href of [...new Set(info.links)]) { const r = await page.request.get(href.split("#")[0]); if (r.status() !== 200) bad.push(`${r.status()} ${href}`); }
    // The first 3D object turns when dragged and resets.
    const box = await page.$eval(".scene", (sc) => { sc.scrollIntoView({ block: "center" }); const r = sc.getBoundingClientRect(); return { x: r.x + 10, y: r.y + r.height * 0.15, w: r.width }; });
    const ry = () => page.$eval(".scene .rig", (r) => +/rotateY\(([-\d.]+)deg/.exec(r.style.transform)[1]);
    const r0 = await ry();
    const resetHidden0 = await page.$eval(".cs-reset", (b) => getComputedStyle(b).visibility === "hidden");
    await page.mouse.move(box.x, box.y); await page.mouse.down();
    for (let i = 1; i <= 8; i++) await page.mouse.move(box.x + (box.w * 0.6 * i) / 8, box.y);
    await page.mouse.up(); await settle(page, 100);
    const r1 = await ry();
    await page.click(".cs-reset"); await settle(page, 600);
    const r2 = await ry();
    cs[s] = { status, ...info, text: undefined, links: info.links.length, bad, turn: [r0, r1, r2] };
    out.cases = cs;
    const realOnly = info.imgs.every((i) => !/composite|2025/.test(i));
    ok(`case ${s}: loads with status, sections, diagrams and labelled media`, status === 200 && info.status && info.sections >= 4 && info.dias >= 1 && !info.broken.length && realOnly && info.tags.every(Boolean), cs[s]);
    ok(`case ${s}: every internal link resolves`, !bad.length, bad);
    ok(`case ${s}: 3D object turns and resets; Reset view only once turned`, info.scenes >= 1 && resetHidden0 && Math.abs(r1 - r0) > 20 && Math.abs(r2 - r0) < 0.05, cs[s].turn);
    ok(`case ${s}: no rotation instructions advertised`, !/arrow keys|drag to turn|all the way round|swipe sideways/i.test(info.text), null);
    if (s === "bhatkal-time-luxe") ok("case btl: current captures, HubZero client work, no disclaimer", info.imgs.filter((i) => i.startsWith("btl-")).every((i) => i.startsWith("btl-current")) && /HubZero client work/.test(info.text) && !/not every part/i.test(info.text), info.imgs);
    if (s === "extendspace") ok("case extendspace: wired first, Wi-Fi planned, Connect disabled", /Wi-Fi, wireless/.test(info.text) && /Planned after the wired milestone/i.test(info.text) && /Connect is disabled/.test(info.text) && !/wi-?fi[^.\n]{0,50}\b(is|are) (now )?(implemented|available)/i.test(info.text), null);
    if (s === "layers") ok("case layers: Studio planned with no screen, captures labelled emulator", /planned, not built/i.test(info.text) && info.tags.filter((t) => /Emulator/.test(t)).length >= 3 && !info.imgs.some((i) => /studio/i.test(i)), info.tags);
    if (s === "nexus" || s === "reflux") ok(`case ${s}: no product screenshot`, !info.imgs.length, info.imgs);
    await ctx.close();
  }
  // The Project Space modal links to these pages.
  {
    const { page, ctx } = await open("?project=bhatkal-time-luxe&open=1");
    const href = await page.$eval(".dt-links a", (a) => a.href);
    ok("case: Explore modal links to the new case study", href.endsWith("/project-space/case-studies/bhatkal-time-luxe/") && (await page.request.get(href)).status() === 200, href);
    await ctx.close();
  }
  // Layout at phone, tablet and desktop widths, both themes; axe on two states each.
  for (const s of SLUGS) {
    for (const [w, h] of [[320, 700], [390, 844], [768, 1024], [1024, 768], [1440, 900]]) {
      for (const theme of ["dark", "light"]) {
        const { page, ctx } = await open(`case-studies/${s}/?theme=${theme}`, { w, h });
        await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); } });
        out.overflow[`case-${s}-${w}-${theme}`] = await overflow(page);
        if ((w === 1440 && theme === "dark") || (w === 390 && theme === "light")) {
          await page.addScriptTag({ content: AXE });
          out.axe[`case-${s} @${w} ${theme}`] = await page.evaluate(async () => (await axe.run(document, { resultTypes: ["violations"] })).violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(" | ")}`));
        }
        await ctx.close();
      }
    }
  }
  ok("case: no horizontal overflow at any width", Object.entries(out.overflow).filter(([k]) => k.startsWith("case-")).every(([, v]) => v <= 0), Object.entries(out.overflow).filter(([k, v]) => k.startsWith("case-") && v > 0));
}

/* 13. Phones: selector, stage, captions, reset, text size, case studies, landscape.
   The shared stylesheet clips body overflow, so a plain scrollWidth check could hide
   a problem. These checks look at every element's box against the viewport instead,
   allowing only the intentional local scrollers (the chip row, diagram boxes) and the
   3D rig, whose turned devices are meant to move in depth. */
{
  const offenders = (p) => p.evaluate(() => {
    const W = document.documentElement.clientWidth, bad = [];
    for (const el of document.body.querySelectorAll("*")) {
      if (el.closest("#side, .cs-dia, .rig, .skip, .sr-only, dialog:not([open])")) continue;
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden" || cs.position === "fixed") continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      if (r.right > W + 1 || r.left < -1) bad.push(`${el.tagName.toLowerCase()}.${String(el.className.baseVal ?? el.className).split(" ")[0]} ${Math.round(r.left)}..${Math.round(r.right)}`);
    }
    return bad.slice(0, 6);
  });
  const mob = {};
  for (const [w, h] of [[320, 700], [360, 800], [390, 844], [427, 926]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => out.errors.push(`mobile ${w}: ${e}`));
    page.on("console", (m) => { if (["error", "warning"].includes(m.type())) out.errors.push(`mobile ${w}: ${m.type()}: ${m.text()}`); });
    for (const theme of ["dark", "light"]) {
      await page.goto(HOSTS[0] + PATH + `?theme=${theme}`); await settle(page, 900);
      for (const s of SLUGS) {
        // Select through the chip row, from wherever the row is scrolled.
        const y0 = await page.evaluate((s) => { document.querySelector("#side").scrollIntoView({ block: "center" }); return scrollY; }, s);
        await page.evaluate((s) => document.querySelector(`.sd-btn[data-slug="${s}"]`).click(), s);
        await settle(page, 750);
        const m = await page.evaluate(() => {
          const side = document.querySelector("#side"), row = side.getBoundingClientRect();
          const chip = document.querySelector('.sd-btn[aria-current="true"]').getBoundingClientRect();
          const cap = document.querySelector("#cap").getBoundingClientRect();
          const items = [...document.querySelectorAll("#cap > span")].map((sp) => {
            const t = sp.querySelector(".tag")?.getBoundingClientRect(); const r = sp.getBoundingClientRect();
            return { full: Math.abs(r.width - cap.width) < 1.5, stacked: !t || t.bottom <= r.bottom - 8 };
          });
          const stage = document.querySelector("#stage3").getBoundingClientRect();
          const devs = [...document.querySelectorAll(".scene:not(.leaving) .d3")].filter((d) => getComputedStyle(d).display !== "none").map((d) => d.querySelector(".d3-body").getBoundingClientRect());
          const sceneTA = getComputedStyle(document.querySelector(".scene:not(.leaving)")).touchAction;
          return {
            scrollable: side.scrollWidth > side.clientWidth, noBar: getComputedStyle(side).scrollbarWidth === "none",
            chipVisible: chip.left >= row.left - 1 && chip.right <= row.right + 1, scrollY,
            caps: items, devsInside: devs.every((b) => b.left >= stage.left - 2 && b.right <= stage.right + 2 && b.width > 40),
            devMin: Math.round(Math.min(...devs.map((b) => b.width))), sceneTA,
          };
        });
        const key = `${w}/${theme}/${s}`;
        mob[key] = { ...m, pageMoved: Math.abs(m.scrollY - y0) > 2, offenders: await offenders(page) };
      }
      // Every chip is reachable: scroll the row to its end, then the last chip is fully visible.
      mob[`${w}/${theme}/row-end`] = await page.evaluate(() => {
        const side = document.querySelector("#side"); side.scrollLeft = side.scrollWidth;
        const row = side.getBoundingClientRect(), last = side.querySelector("li:last-child .sd-btn").getBoundingClientRect();
        const first = side.querySelector(".sd-btn").getBoundingClientRect();
        side.scrollLeft = 0;
        const first0 = side.querySelector(".sd-btn").getBoundingClientRect();
        return { last: last.right <= row.right + 1 && last.left >= row.left - 1, first: first0.left >= row.left - 1, moved: first.left !== first0.left };
      });
    }
    // Reset view on a phone: a 36px icon in the stage corner, only once turned, clear of the caption.
    await page.goto(HOSTS[0] + PATH + "?project=layers"); await settle(page, 800);
    const r0 = await page.$eval("#turn-reset", (b) => getComputedStyle(b).visibility);
    await page.evaluate(() => { document.querySelector("#stage").scrollIntoView({ block: "center" }); const t = document.querySelector(".scene:not(.leaving)")._turn; t.tween(-10, 120, 0); });
    await settle(page, 300);
    const r1 = await page.evaluate(() => {
      const b = document.querySelector("#turn-reset").getBoundingClientRect(), st = document.querySelector("#stage3").getBoundingClientRect(), cap = document.querySelector("#cap").getBoundingClientRect();
      return { vis: getComputedStyle(document.querySelector("#turn-reset")).visibility, w: b.width, h: b.height, inCorner: b.top >= st.top - 1 && b.right <= st.right + 1 && b.top < st.top + 12, clearOfCap: b.bottom <= cap.top, name: document.querySelector("#turn-reset").textContent.trim() };
    });
    await page.click("#turn-reset"); await settle(page, 600);
    const r2 = await page.$eval("#turn-reset", (b) => getComputedStyle(b).visibility);
    mob[`${w}/reset`] = { r0, ...r1, r2 };
    // Larger text (200%) still reflows without sideways overflow.
    await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
    await settle(page, 300);
    mob[`${w}/text200`] = await offenders(page);
    await page.evaluate(() => { document.documentElement.style.fontSize = ""; });
    // Case studies on this phone width.
    for (const s of SLUGS) {
      await page.goto(HOSTS[0] + PATH + `case-studies/${s}/`); await settle(page, 800);
      mob[`${w}/case/${s}`] = await page.evaluate(() => {
        const figs = [...document.querySelectorAll(".cs-fig figcaption, .cs-3d .scene-cap > span")].map((f) => {
          const t = f.querySelector(".tag")?.getBoundingClientRect(), r = f.getBoundingClientRect(), parent = f.parentElement.getBoundingClientRect();
          return (!t || t.bottom <= r.bottom - 8) && r.width >= parent.width - 2;
        });
        const dias = [...document.querySelectorAll(".cs-dia")].map((d) => ({ scrolls: d.scrollWidth > d.clientWidth + 1, tab: d.tabIndex === 0, named: !!d.getAttribute("aria-label"), textPx: Math.round(d.querySelector("svg").getBoundingClientRect().width / 600 * 11 * 10) / 10 }));
        return { stacked: figs.every(Boolean), dias, readable: dias.every((d) => d.textPx >= 9), keyboard: dias.every((d) => !d.scrolls || (d.tab && d.named)) };
      });
      mob[`${w}/case/${s}`].offenders = await offenders(page);
    }
    await ctx.close();
  }
  // Landscape phones and tablet portrait/landscape: no sideways overflow on the page or a case study.
  for (const [w, h] of [[844, 390], [926, 427], [768, 1024], [1024, 768]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: w < 900 });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => out.errors.push(`landscape ${w}: ${e}`));
    for (const s of SLUGS) {
      await page.goto(HOSTS[0] + PATH + `?project=${s}`); await settle(page, 700);
      const a = await offenders(page);
      await page.goto(HOSTS[0] + PATH + `case-studies/${s}/`); await settle(page, 700);
      const b = await offenders(page);
      if (a.length || b.length) mob[`${w}x${h}/${s}`] = { page: a, case: b };
    }
    await ctx.close();
  }
  out.mobile = mob;
  const phone = Object.entries(mob).filter(([k]) => /^\d+\/(dark|light)\/[a-z-]+$/.test(k) && !k.endsWith("row-end"));
  ok("mobile: chip row scrolls on its own, no visible scrollbar; selecting centres the chip without moving the page", phone.every(([, v]) => v.scrollable && v.noBar && v.chipVisible && !v.pageMoved), phone.filter(([, v]) => !(v.scrollable && v.noBar && v.chipVisible && !v.pageMoved)).map(([k, v]) => [k, v.chipVisible, v.pageMoved]));
  ok("mobile: first and last chips reachable by scrolling the row", Object.entries(mob).filter(([k]) => k.endsWith("row-end")).every(([, v]) => v.last && v.first && v.moved), Object.entries(mob).filter(([k]) => k.endsWith("row-end")));
  ok("mobile: evidence captions full width, label above text", phone.every(([, v]) => v.caps.every((c) => c.full && c.stacked)), phone.filter(([, v]) => !v.caps.every((c) => c.full && c.stacked)).map(([k, v]) => [k, v.caps]));
  ok("mobile: devices inside the stage and not tiny at the default view", phone.every(([, v]) => v.devsInside && v.devMin >= 60), phone.map(([k, v]) => [k, v.devsInside, v.devMin]).filter(([, a, b]) => !a || b < 60));
  ok("mobile: no element extends past the viewport (320 to 427, both themes, all six projects)", phone.every(([, v]) => !v.offenders.length), phone.filter(([, v]) => v.offenders.length).map(([k, v]) => [k, v.offenders]));
  ok("mobile: stage allows vertical page scrolling and pinch-zoom", phone.every(([, v]) => /pan-y/.test(v.sceneTA) && /pinch-zoom/.test(v.sceneTA)), phone[0]?.[1].sceneTA);
  const resets = Object.entries(mob).filter(([k]) => k.endsWith("/reset"));
  ok("mobile: Reset view hidden until turned, then a named 36px corner control clear of the caption", resets.every(([, v]) => v.r0 === "hidden" && v.vis === "visible" && v.w >= 36 && v.h >= 36 && v.inCorner && v.clearOfCap && v.name === "Reset view" && v.r2 === "hidden"), resets);
  ok("mobile: 200% text size reflows without sideways overflow", Object.entries(mob).filter(([k]) => k.endsWith("text200")).every(([, v]) => !v.length), Object.entries(mob).filter(([k, v]) => k.endsWith("text200") && v.length));
  const cases = Object.entries(mob).filter(([k]) => k.includes("/case/"));
  ok("mobile case studies: stacked full-width captions, readable diagrams, keyboard-reachable scroll boxes, no overflow", cases.every(([, v]) => v.stacked && v.readable && v.keyboard && !v.offenders.length), cases.filter(([, v]) => !(v.stacked && v.readable && v.keyboard && !v.offenders.length)));
  ok("landscape and tablet: no element past the viewport", !Object.keys(mob).some((k) => /^\d+x\d+\//.test(k)), Object.entries(mob).filter(([k]) => /^\d+x\d+\//.test(k)));
  // Attribution corrected in Concept D.
  const btl = readFileSync("prototypes/projects-redesign/project-space/data.js", "utf8") + readFileSync("prototypes/projects-redesign/project-space/case-studies/bhatkal-time-luxe/index.html", "utf8");
  ok("copy: BTL current storefront redesigned by the owner, original design by a HubZero co-founder", /designed the current storefront( iteration)?/i.test(btl) && /original (storefront )?design/i.test(btl) && !/Visual design by a HubZero co-founder/.test(btl));
}

/* 14. Final content audit: Bhatkal Time Luxe framing, currency evidence, links. */
{
  const { page, ctx } = await open("?project=bhatkal-time-luxe&open=1");
  const modal = await page.$eval("#detail", (d) => d.innerText);
  const info = await page.$eval("#info", (d) => d.innerText);
  const imgs = await page.$$eval(".scene:not(.leaving) img, #detail img", (a) => a.map((i) => i.getAttribute("src").split("/").pop()));
  await ctx.close();
  const cs = await open("case-studies/bhatkal-time-luxe/");
  const csText = await cs.page.evaluate(() => document.body.innerText);
  const csImgs = await cs.page.evaluate(() => [...document.querySelectorAll("main img")].map((i) => ({ src: i.getAttribute("src").split("/").pop(), cap: i.closest("figure")?.querySelector("figcaption")?.innerText ?? "" })));
  await cs.ctx.close();
  const kuwaitOnlyNegated = (t) => t.split(/(?<=[.!?])\s+/).filter((x) => /kuwait|gcc/i.test(x)).every((x) => /not (evidence|a client requirement)/i.test(x));
  ok("btl: India-wide, Bhatkal-based framing everywhere; Kuwait/GCC only ever denied", [info, modal, csText].every((t) => /Bhatkal-based/.test(t) && /India-wide/.test(t) && kuwaitOnlyNegated(t)), { info: info.slice(0, 200) });
  ok("btl: showcase, not an active storefront", [info + modal, csText].every((t) => /showcase/i.test(t) && /not an active storefront/i.test(t)));
  ok("btl: design attribution (current iteration mine, original by a HubZero co-founder) and end-to-end build", [modal, csText].every((t) => /current storefront( iteration)?/i.test(t) && /original (storefront )?design/i.test(t) && /HubZero co-founder/.test(t) && /end to end/i.test(t)));
  ok("btl: currency experiment explained as independent and not a client requirement", /independently/i.test(csText) && /not a client requirement/i.test(csText) && /independent/i.test(modal));
  ok("btl: INR captures lead; the KWD capture is labelled as the currency experiment", imgs.filter((i) => i.startsWith("btl-")).slice(0, 2).every((i) => i.endsWith("-inr.webp")) && csImgs.some((i) => i.src === "btl-current-product-desktop.webp" && /currency experiment/i.test(i.cap)) && !csImgs.some((i) => /2025|composite/.test(i.src)), { imgs, csImgs });
  // Links: Reflux's lagging public repository is not offered from Concept D; no placeholder URLs.
  const r = await open("?project=reflux&open=1");
  const refluxLinks = await r.page.$$eval(".dt-links a", (a) => a.map((x) => x.href));
  await r.ctx.close();
  ok("links: Reflux repository not linked from the modal or the case study", !refluxLinks.some((h) => /github\.com\/Rifaque\/reflux/i.test(h)), refluxLinks);
  const all = ["index.html", "space.js", "data.js", "scenes.js", ...SLUGS.map((s) => `case-studies/${s}/index.html`)].map((f) => readFileSync(`prototypes/projects-redesign/project-space/${f}`, "utf8")).join(" ");
  // Captions never squeeze beside their label: paired case-study columns at desktop, the detail view on a phone.
  const stackedIn = (p, sel) => p.$$eval(sel, (els) => els.map((f) => { const t = f.querySelector(".tag")?.getBoundingClientRect(), r = f.getBoundingClientRect(); return !t || t.bottom <= r.bottom - 8; }));
  const pairs = [];
  for (const s of ["layers", "bhatkal-time-luxe"]) { const c = await open(`case-studies/${s}/`, { w: 1440, h: 900 }); pairs.push(...await stackedIn(c.page, ".cs-pair figcaption, .cs-pair .scene-cap > span")); await c.ctx.close(); }
  const ph = await browser.newContext({ viewport: { width: 320, height: 700 }, isMobile: true, hasTouch: true });
  const pp = await ph.newPage(); await pp.goto(HOSTS[0] + PATH + "?project=bhatkal-time-luxe&open=1"); await settle(pp, 800);
  const modalCaps = await stackedIn(pp, ".dt-fig figcaption"); await ph.close();
  ok("captions: stacked in paired case-study columns (1440) and in the detail view on phones (320)", pairs.length >= 4 && pairs.every(Boolean) && modalCaps.length && modalCaps.every(Boolean), { pairs, modalCaps });
  ok("links: no placeholder or example URLs", !/href="#"|example\.com|TODO|lorem/i.test(all));
}

/* 9. Responsive layout and overflow (both themes, every project on phones). */
for (const [w, h] of [[2560, 1300], [1920, 1080], [1440, 900], [1280, 800], [1100, 800], [1024, 768], [844, 390], [768, 1024], [640, 900], [427, 926], [390, 844], [360, 800], [360, 740], [320, 700]]) {
  for (const theme of ["dark", "light"]) {
    const { page, ctx } = await open(`?theme=${theme}`, { w, h });
    let worst = await overflow(page);
    for (const s of SLUGS) {
      await page.click(`.sd-btn[data-slug="${s}"]`); await settle(page, 450);
      worst = Math.max(worst, await overflow(page));
      if (w <= 390 && theme === "dark") {
        await page.click("#explore"); await settle(page, 400);
        const d = await page.$eval("#detail", (el) => ({ w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height), sw: el.scrollWidth - el.clientWidth }));
        out.overflow[`${w}-dialog-${s}`] = d;
        await page.keyboard.press("Escape"); await settle(page, 300);
      }
    }
    out.overflow[`${w}-${theme}`] = worst;
    if (theme === "dark") out.overflow[`${w}-columns`] = await page.$eval(".sp-grid", (g) => getComputedStyle(g).gridTemplateColumns.split(" ").length);
    await ctx.close();
  }
}
ok("responsive: no page overflow", Object.entries(out.overflow).filter(([k, v]) => typeof v === "number" && !k.endsWith("columns")).every(([, v]) => v <= 0));
ok("responsive: three columns only on wide screens", out.overflow["1440-columns"] === 3 && out.overflow["1024-columns"] === 1 && out.overflow["390-columns"] === 1);
ok("responsive: full-screen detail on phones", Object.entries(out.overflow).filter(([k]) => k.includes("dialog")).every(([k, d]) => d.w === Number(k.split("-")[0]) && d.sw <= 0));

/* 10. axe: desktop both themes, overlay open, phone. */
for (const [q, w, h, openIt] of [["?theme=dark", 1440, 900], ["?theme=light&project=layers", 1440, 900], ["?project=bhatkal-time-luxe", 1440, 900, true], ["?theme=light&project=extendspace", 1440, 900, true], ["?project=reflux", 390, 844], ["?project=layers", 390, 844, true]]) {
  const { page, ctx } = await open(q, { w, h });
  if (openIt) { await page.click("#explore"); await settle(page, 450); }
  await page.addScriptTag({ content: AXE });
  out.axe[`${q} @${w}${openIt ? " +overlay" : ""}`] = await page.evaluate(async () => (await axe.run(document, { resultTypes: ["violations"] })).violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(" | ")}`));
  await ctx.close();
}
ok("axe: no violations", Object.values(out.axe).every((v) => !v.length), out.axe);
ok("console: no errors or warnings", !out.errors.length, out.errors.slice(0, 10));

console.log(JSON.stringify(out, null, 1));
await browser.close();
