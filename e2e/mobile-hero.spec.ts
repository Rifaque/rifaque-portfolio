import { expect, test, type Page } from "@playwright/test";
import { axe, hydrated, watch } from "./helpers";

const MATRIX = [
  [320, 568, "short"],
  [360, 640, "short"],
  [375, 812, "room"],
  [390, 844, "room"],
  [393, 852, "room"],
  [412, 915, "room"],
  [430, 932, "room"],
  [844, 390, "two"],
  [667, 375, "two"],
  [932, 430, "two"],
  [800, 600, "two"],
  [768, 1024, "room"],
] as const;

const layout = (page: Page) => page.evaluate(() => getComputedStyle(document.querySelector("#hero-stage")!).getPropertyValue("--hero-layout").trim());
const settled = (page: Page) => expect(page.locator("#hero-stage")).toHaveClass(/has-gl|gl-off/, { timeout: 15_000 });
const open = async (page: Page, url = "/?nointro") => {
  await page.goto(url);
  await hydrated(page);
  await settled(page);
};
const menuButton = (page: Page) => page.locator(".menu-switch");
const menu = (page: Page) => page.locator("#site-menu");

test.describe("mobile hero @core", () => {
  for (const [width, height, expected] of MATRIX)
    test(`${width}x${height}: ${expected} layout, room and actions in the first view`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await open(page);
      expect(await layout(page)).toBe(expected);
      const m = await page.evaluate(() => {
        const stage = document.querySelector("#hero-stage")!.getBoundingClientRect();
        const links = [...document.querySelectorAll(".hero-actions a")].map((a) => a.getBoundingClientRect());
        return {
          covered: (Math.min(innerHeight, stage.bottom) - Math.max(0, stage.top)) / innerHeight,
          bottom: Math.max(...links.map((r) => r.bottom)),
          right: Math.max(...links.map((r) => r.right)),
          overflow: document.documentElement.scrollWidth - innerWidth,
          vh: innerHeight,
          vw: innerWidth,
        };
      });
      expect(m.covered).toBe(1);
      expect(m.bottom).toBeLessThanOrEqual(m.vh);
      expect(m.right).toBeLessThanOrEqual(m.vw - 8);
      expect(m.overflow).toBe(0);
    });

  for (const [width, height] of [
    [1024, 768],
    [1440, 900],
    [1920, 1080],
    [1024, 1366],
  ])
    test(`${width}x${height} stays the desktop layout, with no menu button`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await open(page);
      expect(await layout(page)).toBe("");
      await expect(menuButton(page)).toBeHidden();
      await expect(page.locator("header.top .nav")).toBeVisible();
    });

  test("portrait opens on the tall poster, landscape on the wide one", async ({ page }) => {
    const poster = () => page.evaluate(() => getComputedStyle(document.querySelector("#hero-stage")!, "::before").backgroundImage);
    await page.addInitScript(() => {
      window.__gateHold = true;
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    expect(await poster()).toContain("/gate/dark-tall.webp");
    await page.evaluate(() => localStorage.clear());
    await page.evaluate(() => sessionStorage.clear());
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto("/");
    expect(await poster()).toMatch(/\/gate\/dark\.webp/);
  });

  test("the gate is on screen on a short phone, not below the fold", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.addInitScript(() => {
      window.__gateHold = true;
    });
    await page.goto("/");
    await expect(page.locator(".gate .hero-canvas.is-ready")).toHaveCount(1, { timeout: 15_000 });
    const box = (await page.locator("#hero-stage").boundingBox())!;
    expect(box.y).toBeLessThanOrEqual(0);
    await expect(page.locator("#hero-name")).toBeInViewport();
  });

  for (const [width, height] of [
    [320, 568],
    [360, 640],
    [375, 640],
    [393, 640],
    [412, 660],
  ])
    test(`at ${width}x${height} the opening frame stands between the actions and the introduction`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.addInitScript(() => {
        window.__gateHold = true;
      });
      await page.goto("/");
      await expect(page.locator(".gate .hero-canvas.is-ready")).toHaveCount(1, { timeout: 15_000 });
      const m = await page.evaluate(() => {
        const stage = document.querySelector("#hero-stage")!;
        const s = stage.getBoundingClientRect();
        const cover = Math.max(s.width / 1200, s.height / 2000);
        const centre = s.top + parseFloat(getComputedStyle(stage).getPropertyValue("--gate-cy")) * s.height;
        const bottoms = [...document.querySelectorAll(".hero-actions a")].map((a) => a.getBoundingClientRect().bottom);
        // In the tall poster the R reaches 9.35 world units above the centre and the S 10.58 below it, at 2000 pixels showing 64 units.
        const unit = (2000 * cover) / 64;
        return { top: centre - 9.35 * unit, bottom: centre + 10.58 * unit, actions: Math.max(...bottoms), lede: document.querySelector(".hero-lede")!.getBoundingClientRect().top };
      });
      expect(m.top).toBeGreaterThanOrEqual(m.actions);
      expect(m.bottom).toBeLessThanOrEqual(m.lede);
    });

  test("the gate ends on the mobile framing with one canvas and nothing running", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const problems = watch(page);
    await page.goto("/");
    await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains("gate")), { timeout: 20_000 }).toBe(false);
    await expect(page.locator("#hero-stage > canvas.is-ready")).toHaveCount(1);
    await axe(page);
    expect(problems).toEqual([]);
  });

  test("the view controls still work, just below the first screen", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page);
    const key = page.getByRole("button", { name: /reads R/ });
    const size = (await key.boundingBox())!;
    expect(size.height).toBeGreaterThanOrEqual(44);
    expect(size.width).toBeGreaterThanOrEqual(44);
    await key.click();
    await expect(key).toHaveAttribute("aria-pressed", "true");
  });

  test("reduced motion: no gate, and the drawing or scene is framed in the first view", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, "/");
    expect(await page.evaluate(() => document.documentElement.classList.contains("gate"))).toBe(false);
    expect(await layout(page)).toBe("room");
  });

  test("without WebGL the drawing sits between the copy", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, "/?webgl=off");
    await expect(page.locator("#hero-stage")).toHaveClass(/gl-off/);
    const { poster, role, lede } = await page.evaluate(() => {
      const r = (s: string) => document.querySelector(s)!.getBoundingClientRect();
      return { poster: r(".hero-poster"), role: r(".hero-role"), lede: r(".hero-lede") };
    });
    const middle = poster.top + poster.height / 2;
    expect(middle).toBeGreaterThan(role.bottom);
    expect(middle).toBeLessThan(lede.top);
    await expect(page.locator("#hero-name")).toBeInViewport();
  });

  test("a lost context on a phone falls back, and the room returns", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
        const c = (get as (...a: unknown[]) => unknown).call(this, type, ...rest);
        if (/webgl/.test(type) && c) (window as Window & { __gl?: unknown }).__gl = c;
        return c;
      } as typeof HTMLCanvasElement.prototype.getContext;
    });
    await open(page);
    await page.evaluate(() => {
      const ext = (window as Window & { __gl?: WebGLRenderingContext }).__gl!.getExtension("WEBGL_lose_context")!;
      (window as Window & { __ext?: WEBGL_lose_context }).__ext = ext;
      ext.loseContext();
    });
    await expect(page.locator("#hero-stage")).toHaveClass(/gl-off/);
    await page.evaluate(() => (window as Window & { __ext?: WEBGL_lose_context }).__ext!.restoreContext());
    await expect(page.locator("#hero-stage")).toHaveClass(/has-gl/, { timeout: 10_000 });
  });

  for (const [width, height] of [
    [195, 422],
    [422, 195],
  ])
    test(`reflow at 200% zoom (${width}x${height}) keeps everything`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await open(page);
      // The hero's own content must fit.
      const wide = await page.locator(".hero h1, .hero p, .hero a, .hero button").evaluateAll((els) => els.filter((e) => e.getBoundingClientRect().right > innerWidth + 0.5).map((e) => e.className));
      expect(wide).toEqual([]);
      // Known, and outside the hero: the Experience heading's longest word makes the page 2.5px too wide at 195px (browsers
      // round it to 2 or 3), as it did before this work, and nobody can scroll to it. Should be 0 once fixed; it must not grow.
      const page_ = await page.evaluate(() => ({ over: document.documentElement.scrollWidth - innerWidth, scrolled: (scrollTo(40, 0), scrollX) }));
      expect(page_.over).toBeLessThanOrEqual(3);
      expect(page_.scrolled).toBe(0);
      for (const name of ["See the work", "Email"]) await expect(page.getByRole("link", { name }).first()).toBeAttached();
      await expect(page.locator(".hero-lede")).toBeVisible();
      await expect(page.locator(".hero-meta")).toBeVisible();
      await page.getByRole("link", { name: "See the work" }).scrollIntoViewIfNeeded();
      await expect(page.getByRole("link", { name: "See the work" })).toBeInViewport();
    });

  test("the page reads in a logical order whatever the layout shows", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await open(page);
    const order = await page.locator(".hero-copy > *").evaluateAll((els) => els.map((e) => e.className || e.tagName));
    expect(order.slice(0, 2).join(" ")).toContain("hero-name");
    expect(order.indexOf("hero-lede")).toBeLessThan(order.indexOf("hero-actions"));
  });

  test("the hero meta line has normal-text contrast against the floor in the light theme", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("rsx-theme", "light"));
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page);
    expect(await page.locator(".hero-meta").evaluate((e) => getComputedStyle(e).color)).toBe(await page.evaluate(() => {
      const probe = document.createElement("i");
      probe.style.color = "var(--fg-2)";
      document.body.append(probe);
      const c = getComputedStyle(probe).color;
      probe.remove();
      return c;
    }));
  });
});

test.describe("mobile menu @core", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page);
  });

  test("names itself, opens, and moves focus to the first link", async ({ page }) => {
    const button = menuButton(page);
    await expect(button).toHaveAttribute("aria-label", "Open menu");
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(menu(page)).toBeHidden();
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expect(button).toHaveAttribute("aria-label", "Close menu");
    await expect(menu(page).getByRole("link")).toHaveText(["Work", "About", "Experience", "Contact"]);
    await expect(menu(page).getByRole("link", { name: "Work" })).toBeFocused();
    await axe(page, "#site-menu");
  });

  test("opened by pointer, Escape still returns focus to the button", async ({ page }) => {
    await menuButton(page).click();
    await expect(menu(page).getByRole("link", { name: "Work" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(menu(page)).toBeHidden();
    await expect(menuButton(page)).toHaveAttribute("aria-expanded", "false");
    await expect(menuButton(page)).toBeFocused();
  });

  test("Escape closes it and returns focus to the button", async ({ page }) => {
    await menuButton(page).focus();
    await page.keyboard.press("Enter");
    await expect(menu(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu(page)).toBeHidden();
    await expect(menuButton(page)).toBeFocused();
  });

  test("a choice goes there and closes it; choosing it again still goes there", async ({ page }) => {
    await menuButton(page).click();
    await menu(page).getByRole("link", { name: "Contact" }).click();
    await expect(menu(page)).toBeHidden();
    await expect(page).toHaveURL(/#contact$/);
    await expect(page.locator("#contact")).toBeInViewport();
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await menuButton(page).click();
    await menu(page).getByRole("link", { name: "Contact" }).click();
    await expect(page.locator("#contact")).toBeInViewport();
  });

  test("a tap outside closes it", async ({ page }) => {
    await menuButton(page).click();
    await page.mouse.click(200, 700);
    await expect(menu(page)).toBeHidden();
  });

  test("its controls are large enough to touch", async ({ page }) => {
    const header = await page.locator("header.top .prefs button:visible").evaluateAll((els) => els.map((e) => [e.getBoundingClientRect().width, e.getBoundingClientRect().height]));
    for (const [w, h] of header) {
      expect(w).toBeGreaterThanOrEqual(44);
      expect(h).toBeGreaterThanOrEqual(44);
    }
    await menuButton(page).click();
    for (const h of await menu(page).getByRole("link").evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height))) expect(h).toBeGreaterThanOrEqual(44);
  });

  test("the header fits at the narrowest phone", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    const right = await page.locator("#sound-switch").evaluate((e) => e.getBoundingClientRect().right);
    expect(right).toBeLessThanOrEqual(320 - 8);
  });
});

test.describe("touch on the room", () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });

  const countFrames = (page: Page) =>
    page.addInitScript(() => {
      const w = window as Window & { __frames?: number };
      const raf = window.requestAnimationFrame.bind(window);
      w.__frames = 0;
      window.requestAnimationFrame = (cb) =>
        raf((t) => {
          w.__frames!++;
          cb(t);
        });
    });
  const frames = (page: Page) => page.evaluate(() => (window as Window & { __frames?: number }).__frames!);

  test("the pixel-ratio cap holds on the full-height stage", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium");
    await open(page);
    expect(await page.locator("#hero-stage canvas").evaluate((c: HTMLCanvasElement) => [c.width, c.height])).toEqual([780, 1688]);
  });

  test("a vertical swipe scrolls without waking the scene, and a sideways one still turns it", async ({ page, browserName, context }) => {
    test.skip(browserName !== "chromium");
    await countFrames(page);
    await open(page);
    await page.waitForTimeout(700);
    const cdp = await context.newCDPSession(page);
    const touch = (type: "touchStart" | "touchMove" | "touchEnd", x?: number, y?: number) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: y === undefined ? [] : [{ x: x!, y }] });
    let before = await frames(page);
    await touch("touchStart", 195, 560);
    for (let y = 540; y > 160; y -= 20) await touch("touchMove", 195, y);
    await touch("touchEnd");
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
    await page.waitForTimeout(600);
    expect(await frames(page) - before).toBeLessThanOrEqual(2); // the one the release asks for
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(300);
    before = await frames(page);
    await touch("touchStart", 80, 450);
    for (let x = 100; x < 300; x += 20) await touch("touchMove", x, 450);
    await touch("touchEnd");
    await expect.poll(async () => (await frames(page)) - before).toBeGreaterThan(10);
  });

  test("a vertical swipe on the room scrolls the page", async ({ page, browserName, context }) => {
    test.skip(browserName !== "chromium");
    await open(page);
    for (const el of ["#hero-stage", "#hero-stage canvas"]) expect(await page.locator(el).evaluate((e) => getComputedStyle(e).touchAction)).toContain("pan-y");
    const cdp = await context.newCDPSession(page);
    const touch = (type: "touchStart" | "touchMove" | "touchEnd", y?: number) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: y === undefined ? [] : [{ x: 195, y }] });
    expect(await page.evaluate(() => document.elementFromPoint(195, 560)?.className)).toContain("hero-canvas");
    await touch("touchStart", 560);
    for (let y = 540; y > 160; y -= 20) await touch("touchMove", y);
    await touch("touchEnd");
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
  });
});

test.describe("mobile platform behaviour", () => {
  test("safe-area insets move the header and copy clear of a landscape notch", async ({ page, browserName, context }) => {
    test.skip(browserName !== "chromium");
    await page.setViewportSize({ width: 844, height: 390 });
    await open(page);
    const before = (await page.locator(".hero-name").boundingBox())!.x;
    const cdp = await context.newCDPSession(page);
    await cdp.send("Emulation.setSafeAreaInsetsOverride", { insets: { top: 0, left: 47, right: 47, bottom: 21 } });
    await expect.poll(async () => (await page.locator(".hero-name").boundingBox())!.x).toBeGreaterThan(before);
    // The heading sits 0.04em left of its box, as it does on desktop, to align its optical edge.
    expect((await page.locator(".hero-name").boundingBox())!.x).toBeGreaterThanOrEqual(44);
    expect((await page.locator(".top-row").boundingBox())!.x).toBeGreaterThanOrEqual(30);
  });

  test("nothing reads through the sticky header on a phone", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium");
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page);
    const bg = await page.locator(".top .top-row").evaluate((e) => getComputedStyle(e).backgroundColor);
    expect(bg).toMatch(/0\.9/);
    expect(await page.locator(".top").evaluate((e) => getComputedStyle(e).backgroundImage)).toContain("gradient");
  });
});
