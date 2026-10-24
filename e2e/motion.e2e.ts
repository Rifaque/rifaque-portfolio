import { test as base, expect, type Page } from "@playwright/test";

/** Fails any test that logs a console error or throws an uncaught error. */
const test = base.extend<{ errors: string[] }>({
  errors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
      page.on("pageerror", (e) => errors.push(e.message));
      await use(errors);
      expect(errors, "browser errors").toEqual([]);
    },
    { auto: true },
  ],
});

const hydrated = (page: Page) => page.waitForFunction(() => document.documentElement.classList.contains("motion-ready"));

/** Running animations on hero elements, by class. */
const heroAnimations = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll(".hero-shell *")].flatMap((el) =>
      el.getAnimations().map((a) => `${(el as Element).getAttribute("class")}:${(a as CSSAnimation).animationName}`),
    ),
  );

const finalState = (page: Page) =>
  page.evaluate(() => {
    const sel = [".hero-kicker", ".hero-title", ".hero-lede", ".hero-actions", ".hero-meta", ".now-title", ".now-list > li"];
    return sel.flatMap((s) =>
      [...document.querySelectorAll(s)].map((el) => {
        const cs = getComputedStyle(el);
        return { s, opacity: cs.opacity, transform: cs.transform };
      }),
    );
  });

test("first load plays the entrance; the headline is visible from the first frame", async ({ page }) => {
  await page.goto("/");
  const early = await page.evaluate(() => {
    const h1 = document.querySelector(".hero-title")!;
    return {
      opacity: getComputedStyle(h1).opacity,
      names: h1.getAnimations().map((a) => (a as CSSAnimation).animationName),
      color: getComputedStyle(h1).color,
    };
  });
  expect(early.opacity).toBe("1");
  expect(early.color).toBe("rgb(242, 239, 233)");
  const names = await heroAnimations(page);
  expect(names.some((n) => n.endsWith("hero-lift"))).toBe(true);
  expect(names.some((n) => n.endsWith("hero-rise"))).toBe(true);
  expect(names.some((n) => n.endsWith("hero-draw"))).toBe(true);

  // About 1.6 s in all; everything then rests in its final state.
  await expect.poll(() => heroAnimations(page), { timeout: 3000 }).toEqual([]);
  for (const s of await finalState(page)) expect(s, s.s).toMatchObject({ opacity: "1", transform: "none" });
  await expect(page.locator(".hero-title")).toHaveCSS("color", "rgb(242, 239, 233)");
});

test("the entrance does not replay on client-side navigation back to the homepage", async ({ page }) => {
  await page.goto("/");
  await hydrated(page);
  await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Archive" }).click();
  await expect(page).toHaveURL(/\/archive$/);
  await page.locator("a.brand").click();
  await expect(page).toHaveURL(/\/$/);
  expect(await page.evaluate(() => document.documentElement.classList.contains("intro-done"))).toBe(true);
  expect(await heroAnimations(page)).toEqual([]);

  await page.goBack();
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  expect(await heroAnimations(page)).toEqual([]);
});

test("a client-side first visit to the homepage from another page does not play it either", async ({ page }) => {
  await page.goto("/archive");
  await hydrated(page);
  await page.locator("a.brand").click();
  await expect(page).toHaveURL(/\/$/);
  expect(await heroAnimations(page)).toEqual([]);
  for (const s of await finalState(page)) expect(s, s.s).toMatchObject({ opacity: "1", transform: "none" });
});

test("reduced motion shows every final state at once, with the motif drawn", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(await heroAnimations(page)).toEqual([]);
  for (const s of await finalState(page)) expect(s, s.s).toMatchObject({ opacity: "1", transform: "none" });
  expect(await page.locator(".hero-motif--wide").evaluate((el) => getComputedStyle(el).clipPath)).toBe("none");

  await page.goto("/lab");
  await hydrated(page);
  const hidden = await page.locator("[data-reveal]").evaluateAll((els) => els.filter((el) => getComputedStyle(el).opacity !== "1").length);
  expect(hidden).toBe(0);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("everything is readable and nothing waits on motion", async ({ page }) => {
    await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.className)).toBe("");
    for (const s of await finalState(page)) expect(s, s.s).toMatchObject({ opacity: "1", transform: "none" });
    await expect(page.locator(".hero-title")).toBeVisible();

    await page.goto("/lab");
    const items = page.locator("[data-reveal]");
    expect(await items.count()).toBeGreaterThan(0);
    const hidden = await items.evaluateAll((els) => els.filter((el) => getComputedStyle(el).opacity !== "1").length);
    expect(hidden).toBe(0);
  });
});

test("reveal: below the fold waits, on-screen content never hides, and each reveals once", async ({ page }) => {
  await page.goto("/lab");
  await hydrated(page);
  const items = page.locator("[data-reveal]");
  expect(await items.count()).toBe(4);
  // Far below the fold at load: registered, not yet revealed, hidden.
  expect(await items.first().getAttribute("data-revealed")).toBeNull();
  await expect(items.first()).toHaveCSS("opacity", "0");

  await items.first().scrollIntoViewIfNeeded();
  for (let i = 0; i < 4; i++) await expect(items.nth(i)).toHaveAttribute("data-revealed", "");
  await expect(items.last()).toHaveCSS("opacity", "1");

  // Scrolled away and back: still revealed, no replay.
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await items.first().scrollIntoViewIfNeeded();
  await expect(items.first()).toHaveCSS("opacity", "1");

  // A page load that starts with the section on screen shows it at once.
  await page.reload();
  await hydrated(page);
  await expect(items.first()).toHaveAttribute("data-revealed", "");
  expect(await items.first().evaluate((el) => el.getAnimations().length)).toBe(0);
});

/**
 * The lowest opacity any on-screen .lab-motion-item shows over `ms`, sampled
 * every frame, and how many frames had one on screen.
 */
const onScreenRevealOpacity = (page: Page, ms: number) =>
  page.evaluate(
    (ms) =>
      new Promise<{ min: number; frames: number }>((resolve) => {
        let min = 1;
        let frames = 0;
        const start = performance.now();
        const tick = () => {
          const onScreen = [...document.querySelectorAll(".lab-motion-item")].filter((el) => {
            const r = el.getBoundingClientRect();
            return r.bottom > 0 && r.top < innerHeight;
          });
          if (onScreen.length) frames++;
          for (const el of onScreen) min = Math.min(min, Number(getComputedStyle(el).opacity));
          if (performance.now() - start < ms) requestAnimationFrame(tick);
          else resolve({ min, frames });
        };
        tick();
      }),
    ms,
  );

test("reveal after a client-side visit: content below the fold still waits, then reveals", async ({ page }) => {
  await page.goto("/");
  await hydrated(page);
  // /lab is deliberately unlinked; navigate the way the router would.
  await page.evaluate(() => {
    history.pushState({}, "", "/lab");
    dispatchEvent(new PopStateEvent("popstate"));
  });
  const items = page.locator("[data-reveal]");
  await expect(items).toHaveCount(4);
  await expect(items.first()).toHaveAttribute("data-reveal", "pending");
  await expect(items.first()).toHaveCSS("opacity", "0");

  await items.first().scrollIntoViewIfNeeded();
  for (let i = 0; i < 4; i++) await expect(items.nth(i)).toHaveAttribute("data-revealed", "");
  await expect(items.last()).toHaveCSS("opacity", "1");
});

test("reveal after Back: content on screen at the restored position never fades in", async ({ page }) => {
  await page.goto("/lab");
  await hydrated(page);
  const items = page.locator("[data-reveal]");
  await items.first().scrollIntoViewIfNeeded();
  for (let i = 0; i < 4; i++) await expect(items.nth(i)).toHaveAttribute("data-revealed", "");

  // Clicked programmatically so Playwright does not scroll the link into view.
  await page
    .getByRole("navigation", { name: "Primary" })
    .getByRole("link", { name: "Archive" })
    .evaluate((a: HTMLAnchorElement) => a.click());
  await expect(page).toHaveURL(/\/archive$/);

  // html.motion-ready is already set: the remounted lab must not hide what
  // the restored scroll position puts on screen.
  const back = page.goBack();
  await page.waitForFunction(() => location.pathname === "/lab" && !!document.querySelector(".lab-motion-item"));
  const { min, frames } = await onScreenRevealOpacity(page, 800);
  await back;
  expect(frames, "the restored position shows the revealed items").toBeGreaterThan(10);
  expect(min).toBe(1);
  const onScreenAnimations = await items.evaluateAll((els) =>
    els.filter((el) => el.getBoundingClientRect().top < innerHeight).flatMap((el) => el.getAnimations()).length,
  );
  expect(onScreenAnimations).toBe(0);
});

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`the whole headline shares one colour, weight and tracking at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    const style = (selector: string) =>
      page.locator(selector).evaluate((el) => {
        const cs = getComputedStyle(el);
        return { color: cs.color, fontWeight: cs.fontWeight, letterSpacing: cs.letterSpacing, fontStyle: cs.fontStyle };
      });
    const title = await style(".hero-title");
    expect(title.fontWeight).toBe("600");
    expect(await style(".hero-title em")).toEqual(title);
  });
}

test("pointer tilt follows a fine pointer within 3° and settles flat on leave", async ({ page }) => {
  await page.goto("/lab");
  await hydrated(page);
  const card = page.getByTestId("tilt-sample");
  await card.scrollIntoViewIfNeeded();
  const box = (await card.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.1);
  await page.mouse.move(box.x + box.width * 0.98, box.y + box.height * 0.02, { steps: 4 });
  await expect(card).toHaveAttribute("data-tilt", "active");
  const vars = await card.evaluate((el) => ({ x: el.style.getPropertyValue("--tilt-x"), y: el.style.getPropertyValue("--tilt-y") }));
  for (const v of [vars.x, vars.y]) {
    const deg = parseFloat(v);
    expect(Math.abs(deg)).toBeGreaterThan(1);
    expect(Math.abs(deg)).toBeLessThanOrEqual(3);
  }

  await page.mouse.move(5, 5);
  await expect(card).not.toHaveAttribute("data-tilt", "active");
  expect(await card.evaluate((el) => el.style.getPropertyValue("--tilt-x"))).toBe("");
  // Flat again: only the perspective term remains, no rotation.
  const rotation = () =>
    card.evaluate((el) => {
      const m = new DOMMatrix(getComputedStyle(el).transform);
      return Math.max(...[m.m12, m.m13, m.m21, m.m23, m.m31, m.m32].map(Math.abs));
    });
  await expect.poll(rotation).toBeLessThan(1e-6);
});

test("pointer tilt stays off with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/lab");
  await hydrated(page);
  const card = page.getByTestId("tilt-sample");
  await card.scrollIntoViewIfNeeded();
  await card.hover({ position: { x: 4, y: 4 } });
  expect(await card.getAttribute("data-tilt")).toBeNull();
});

/**
 * Total layout shift since navigation (buffered), excluding only shifts that
 * follow user input, as CLS does. Each shift is listed with what moved, for
 * the failure message.
 */
const layoutShifts = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<{ cls: number; shifts: string[] }>((resolve) => {
        type Shift = PerformanceEntry & {
          value: number;
          hadRecentInput: boolean;
          sources: { node?: Node; previousRect: DOMRectReadOnly; currentRect: DOMRectReadOnly }[];
        };
        let total = 0;
        const shifts: string[] = [];
        new PerformanceObserver((list) => {
          for (const e of list.getEntries() as Shift[]) {
            if (e.hadRecentInput) continue;
            total += e.value;
            const what = e.sources.map((s) => {
              const el = s.node instanceof Element ? s.node : s.node?.parentElement;
              const r = (b: DOMRectReadOnly) => `${Math.round(b.x)},${Math.round(b.y)} ${Math.round(b.width)}×${Math.round(b.height)}`;
              return `${el?.tagName.toLowerCase()}.${el?.className} ${r(s.previousRect)} → ${r(s.currentRect)}`;
            });
            shifts.push(`${Math.round(e.startTime)}ms ${e.value.toFixed(4)}: ${what.join("; ")}`);
          }
        }).observe({ type: "layout-shift", buffered: true });
        setTimeout(() => resolve({ cls: total, shifts }), 100);
      }),
  );

/**
 * The fonts Chromium actually draws a node's text with (DevTools protocol):
 * glyphs per web-font family, and glyphs from any installed font.
 */
async function renderedFonts(page: Page, selector: string) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("DOM.enable");
  await cdp.send("CSS.enable");
  const { root } = await cdp.send("DOM.getDocument");
  const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: root.nodeId, selector });
  const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
  await cdp.detach();
  const web: Record<string, number> = {};
  let installed = 0;
  for (const f of fonts) {
    if (f.isCustomFont) web[f.familyName] = (web[f.familyName] ?? 0) + f.glyphCount;
    else installed += f.glyphCount;
  }
  return { web, installed };
}

test("the entrance causes no layout shift", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(2200);
  const { cls, shifts } = await layoutShifts(page);
  expect(cls, shifts.join("\n")).toBeLessThan(0.01);
});


/** Glyphs of the hero headline that Geist cannot draw: U+2011, the non-breaking hyphen in "full‑stack". */
const missingFromGeist = (page: Page) => page.locator(".hero-title").evaluate((el) => (el.textContent!.match(/‑/g) ?? []).length);

/** Delays every web-font response by `ms`. */
const delayFonts = (page: Page, ms: number) =>
  page.route(/\.woff2$/, async (route) => {
    await new Promise((r) => setTimeout(r, ms));
    await route.continue();
  });

// On a normal load the preloaded fonts are there for first paint, even on a
// slow connection where the page itself arrives slowly too: the headline is
// drawn in Geist and the labels in Geist Mono. (The one U+2011 in the
// headline is not in Geist and is drawn by the system either way.)
for (const network of ["local", "slow 4G"] as const) {
  test(`a first visit over ${network} draws the intended fonts from the first paint`, async ({ page }) => {
    if (network === "slow 4G") {
      const cdp = await page.context().newCDPSession(page);
      await cdp.send("Network.enable");
      await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
      const bytesPerSecond = 1.6e6 / 8;
      await cdp.send("Network.emulateNetworkConditions", {
        offline: false,
        latency: 150,
        downloadThroughput: bytesPerSecond,
        uploadThroughput: bytesPerSecond,
      });
    }
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const title = await renderedFonts(page, ".hero-title");
    expect(Object.keys(title.web)).toEqual(["Geist"]);
    expect(title.installed).toBe(await missingFromGeist(page));
    const kicker = await renderedFonts(page, ".hero-kicker");
    expect(kicker).toEqual({ web: { "Geist Mono": expect.any(Number) }, installed: 0 });
    const { cls, shifts } = await layoutShifts(page);
    expect(cls, shifts.join("\n")).toBeLessThan(0.01);
  });
}

// Fonts that arrive after first paint must not move the layout. Before Phase
// 4.3 this measured 0.10–0.14 at 1440px. Geist (font-display: optional,
// fonts.css) then stays on its metric-matched fallback for that load; Geist
// Mono swaps in, which cannot move anything (identical advances). A reload,
// with the file now cached, draws Geist.
for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  for (const delay of [800, 1500, 2500]) {
    test(`fonts arriving ${delay}ms late cause no layout shift at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await delayFonts(page, delay);
      const start = Date.now();
      const fontsArrived = Promise.all(
        ["geist-latin-wght", "geist-mono-latin-wght"].map((f) => page.waitForResponse((r) => r.url().includes(`/${f}`))),
      );
      // Not "load": preloaded fonts hold the load event back.
      await page.goto("/", { waitUntil: "domcontentloaded" });
      // First paint used the fallbacks: the web fonts were still on their way.
      expect(await page.evaluate(() => document.fonts.check('16px "Geist Mono Variable"', "a"))).toBe(false);
      await fontsArrived;
      await page.waitForFunction(() => document.fonts.check('16px "Geist Mono Variable"', "a"));
      await page.waitForTimeout(Math.max(600, 2200 - (Date.now() - start)));

      const { cls, shifts } = await layoutShifts(page);
      test.info().annotations.push({ type: "cls", description: cls.toFixed(4) });
      expect(cls, shifts.join("\n")).toBeLessThan(0.01);

      // Final typography for this load: labels swapped to Geist Mono; the
      // headline kept the Geist fallback rather than reflowing late.
      const kicker = await renderedFonts(page, ".hero-kicker");
      expect(kicker).toEqual({ web: { "Geist Mono": expect.any(Number) }, installed: 0 });
      const title = await renderedFonts(page, ".hero-title");
      expect(title.web).toEqual({});

      // The next load draws Geist.
      await page.unrouteAll();
      await page.reload();
      await page.evaluate(() => document.fonts.ready);
      const again = await renderedFonts(page, ".hero-title");
      expect(Object.keys(again.web)).toEqual(["Geist"]);
      expect(again.installed).toBe(await missingFromGeist(page));
    });
  }
}
