import { expect, test, type Page } from "@playwright/test";
import { axe, hydrated, watch } from "./helpers";

const VIEWPORTS = [
  [1920, 1080],
  [1440, 900],
  [1024, 768],
  [820, 1180],
  [390, 844],
] as const;

const gated = (page: Page) => page.evaluate(() => document.documentElement.classList.contains("gate"));
const ended = (page: Page) => expect.poll(() => gated(page), { timeout: 20_000 }).toBe(false);
const settled = async (page: Page) => {
  await ended(page);
  await expect(page.locator("#hero-stage")).toHaveClass(/has-gl/, { timeout: 15_000 });
};
const hold = (page: Page) =>
  page.addInitScript(() => {
    window.__gateHold = true;
  });
const live = (page: Page) => expect(page.locator(".gate .hero-canvas.is-ready")).toHaveCount(1, { timeout: 15_000 });
/** Requests made during a stretch of time: 0 means nothing is animating. */
const framesDuring = (page: Page, ms: number) =>
  page.evaluate(async (ms) => {
    let n = 0;
    const orig = window.requestAnimationFrame;
    window.requestAnimationFrame = (cb) => {
      n++;
      return orig(cb);
    };
    await new Promise((r) => setTimeout(r, ms));
    window.requestAnimationFrame = orig;
    return n;
  }, ms);
/** The room is never empty: the drawing holds it until the live scene takes over. A browser may have the scene cached. */
const roomFilled = (page: Page) =>
  expect
    .poll(() => page.evaluate(() => document.querySelector("#hero-stage")!.classList.contains("has-gl") || getComputedStyle(document.querySelector(".hero-poster")!).opacity === "1"))
    .toBe(true);
/** The next visit counts as a returning visitor's. */
const returning = (page: Page) =>
  page.addInitScript(() => {
    localStorage.setItem("rsx-gate", "1");
  });

test.describe("loading gate @core", () => {
  test("hands over from the poster to the hero and leaves nothing behind", async ({ page }) => {
    const problems = watch(page);
    await page.goto("/");
    await settled(page);
    await expect(page.locator("canvas")).toHaveCount(1);
    await expect(page.locator("#hero-stage > canvas.is-ready")).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.className)).toBe("js");
    expect(await page.evaluate(() => getComputedStyle(document.querySelector("#hero-stage")!, "::before").content)).toBe("none");
    await axe(page);
    expect(problems).toEqual([]);
  });

  test("text and poster are on screen before any script bundle, and the text is on top", async ({ page }) => {
    await page.route(/assets\/index-[\w-]+\.js$/, async (r) => {
      await new Promise((res) => setTimeout(res, 1200));
      await r.continue();
    });
    await page.goto("/", { waitUntil: "commit" });
    await expect(page.locator("#hero-name")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.dataset.hydrated)).toBeUndefined();
    expect(await page.evaluate(() => getComputedStyle(document.querySelector("#hero-stage")!, "::before").backgroundImage)).toContain("/gate/dark.webp");
    const name = (await page.locator("#hero-name").boundingBox())!;
    expect(await page.evaluate(([x, y]) => !!document.elementFromPoint(x, y)?.closest("#hero-name"), [name.x + 20, name.y + 20])).toBe(true);
  });

  test("a failed bundle leaves the poster and a page that reads and links", async ({ page }) => {
    await page.route(/assets\/index-[\w-]+\.js$/, (r) => r.abort());
    await page.goto("/");
    await expect(page.locator("#hero-name")).toBeVisible();
    await page.getByRole("link", { name: "See the work" }).click();
    await expect(page).toHaveURL(/#work$/);
  });

  for (const [width, height] of [
    [901, 800],
    [1024, 768],
    [1280, 720],
    [1440, 900],
    [1920, 1080],
  ])
    test(`the solid starts clear of the copy at ${width}x${height}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await hold(page);
      await page.goto("/");
      await live(page);
      const { copy, solid } = await page.evaluate(() => {
        const stage = document.querySelector("#hero-stage")!;
        const box = stage.getBoundingClientRect();
        const cover = Math.max(box.width / 2000, box.height / 1250);
        const cx = parseFloat(getComputedStyle(stage).getPropertyValue("--gate-cx"));
        const right = [...document.querySelectorAll(".hero-copy h1 span, .hero-role, .hero-lede, .hero-actions a, .hero-meta")].map((e) => {
          const r = document.createRange();
          r.selectNodeContents(e);
          return r.getBoundingClientRect().right;
        });
        // In the poster the solid reaches 5.7 world units left of the centre, at 2000x1250 showing 34 units.
        return { copy: Math.max(...right), solid: box.left + cx * box.width - 5.7 * ((1250 * cover) / 34) };
      });
      expect(solid).toBeGreaterThan(copy);
    });

  test("the gate shows once: a reload in the session has none", async ({ page }) => {
    await page.goto("/");
    await settled(page);
    await page.reload();
    await hydrated(page);
    expect(await gated(page)).toBe(false);
  });

  for (const url of ["/?nointro", "/#work", "/?project=nexus", "/about", "/work/atlas"])
    test(`no gate on ${url}`, async ({ page }) => {
      await page.goto(url);
      expect(await gated(page)).toBe(false);
    });

  test("reduced motion gets the drawing at once, and no gate", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.route(/three\.min-[\w-]+\.js$/, async (r) => {
      await new Promise((res) => setTimeout(res, 2500));
      await r.continue();
    });
    await page.goto("/");
    await hydrated(page);
    expect(await gated(page)).toBe(false);
    await roomFilled(page);
    await expect(page.locator("#hero-stage")).toHaveClass(/has-gl/, { timeout: 15_000 });
    expect(await framesDuring(page, 500)).toBeLessThanOrEqual(1);
  });

  test("the keyboard is never held: a key ends the move and focus starts as normal", async ({ page, browserName }) => {
    await hold(page);
    await page.goto("/");
    await live(page);
    await page.keyboard.press("Tab");
    await ended(page);
    // WebKit's default Tab skips links, so it lands on the first control instead.
    await expect(page.locator(browserName === "webkit" ? "#theme-switch" : "a.skip")).toBeFocused();
    await expect(page.locator("#hero-stage")).toHaveClass(/has-gl/);
  });

  test("scrolling ends the move, and the page moves", async ({ page }) => {
    await hold(page);
    await page.goto("/");
    await live(page);
    await page.mouse.move(400, 400);
    await page.mouse.wheel(0, 500);
    await ended(page);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
  });

  test("the copy's links work while the scene is held on its first frame", async ({ page }) => {
    await hold(page);
    await page.goto("/");
    await live(page);
    await page.getByRole("link", { name: "See the work" }).click();
    await ended(page);
    await expect(page.locator("#work")).toBeInViewport();
  });

  test("a scene that arrives late still moves, and the room is never empty", async ({ page }) => {
    await page.route(/three\.min-[\w-]+\.js$/, async (r) => {
      await new Promise((res) => setTimeout(res, 3500));
      await r.continue();
    });
    await page.goto("/");
    await expect(page.locator("#hero-name")).toBeVisible();
    await settled(page);
    await expect(page.locator("#hero-stage > canvas")).toHaveCount(1);
  });

  test("a scene that arrives after the visitor has scrolled skips the move and leaves the hero at rest", async ({ page }) => {
    await page.route(/three\.min-[\w-]+\.js$/, async (r) => {
      await new Promise((res) => setTimeout(res, 2000));
      await r.continue();
    });
    await page.goto("/");
    await hydrated(page);
    await page.evaluate(() => scrollTo({ top: 600, behavior: "instant" }));
    await settled(page);
    await expect(page.locator("#hero-stage canvas.is-ready")).toHaveCount(1);
  });

  test("when WebGL cannot start, the drawing stays and the page works", async ({ page }) => {
    await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
        return /webgl/.test(type) ? null : (get as (...a: unknown[]) => unknown).call(this, type, ...rest);
      } as typeof HTMLCanvasElement.prototype.getContext;
    });
    await page.goto("/");
    await ended(page);
    await expect(page.locator("#hero-stage")).toHaveClass(/gl-off/, { timeout: 15_000 });
    await expect(page.locator(".hero-poster")).toHaveCSS("opacity", "1");
    await page.getByRole("link", { name: "See the work" }).click();
    await expect(page.locator("#work")).toBeInViewport();
  });

  test("a context lost during the gate leaves the drawing", async ({ page }) => {
    await hold(page);
    await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
        const c = (get as (...a: unknown[]) => unknown).call(this, type, ...rest);
        if (/webgl/.test(type) && c) (window as Window & { __gl?: unknown }).__gl = c;
        return c;
      } as typeof HTMLCanvasElement.prototype.getContext;
    });
    await page.goto("/");
    await live(page);
    await page.evaluate(() => (window as Window & { __gl?: WebGLRenderingContext }).__gl!.getExtension("WEBGL_lose_context")!.loseContext());
    await expect(page.locator("#hero-stage")).toHaveClass(/gl-off/);
    await ended(page);
    await expect(page.locator("#hero-stage")).not.toHaveClass(/has-gl/);
    await expect(page.locator(".hero-poster")).toHaveCSS("opacity", "1");
  });

  test("a width change during the move ends in the hero's resting state", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector(".gate .hero-canvas.is-ready", { timeout: 15_000 });
    await page.setViewportSize({ width: 1100, height: 900 });
    await settled(page);
    const size = await page.locator("#hero-stage canvas").evaluate((c: HTMLCanvasElement) => [c.clientWidth, c.parentElement!.clientWidth]);
    expect(size[0]).toBe(size[1]);
  });

  test("a tab hidden during the move ends at rest, with nothing left running", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector(".gate .hero-canvas.is-ready", { timeout: 15_000 });
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
      Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await settled(page);
    await page.evaluate(() => {
      delete (document as unknown as Record<string, unknown>).hidden;
      delete (document as unknown as Record<string, unknown>).visibilityState;
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(await framesDuring(page, 500)).toBe(0);
  });

  test("a tab hidden before the scene is ready does not start the move on return", async ({ page }) => {
    await page.route(/three\.min-[\w-]+\.js$/, async (r) => {
      await new Promise((res) => setTimeout(res, 1500));
      await r.continue();
    });
    await page.goto("/");
    await hydrated(page);
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await settled(page);
    await expect(page.locator("#hero-stage canvas.is-ready")).toHaveCount(1);
  });

  test("leaving during the gate leaves no canvas or state behind", async ({ page }) => {
    await hold(page);
    await page.goto("/");
    await live(page);
    await page.evaluate(() => {
      history.pushState(null, "", "/about");
      dispatchEvent(new PopStateEvent("popstate"));
    });
    await ended(page);
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page).toHaveTitle(/About/);
  });

  test("the handover moves no layout", async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as Window & { __cls?: number; __shifts?: string[] };
      w.__cls = 0;
      w.__shifts = [];
      new PerformanceObserver((l) => {
        for (const e of l.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean; sources?: { node?: Node | null; previousRect: DOMRectReadOnly; currentRect: DOMRectReadOnly }[] })[]) {
          if (e.hadRecentInput) continue;
          w.__cls! += e.value;
          // Named in the failure, so a shift can be traced to what moved.
          w.__shifts!.push(`${Math.round(e.startTime)}ms ${e.value.toFixed(4)}: ${(e.sources ?? []).map((s) => `${s.node?.nodeName}.${(s.node as Element | null)?.className} y${Math.round(s.previousRect.y)}>${Math.round(s.currentRect.y)}`).join(", ")}`);
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto("/");
    await settled(page);
    const { cls, shifts } = await page.evaluate(() => {
      const w = window as Window & { __cls?: number; __shifts?: string[] };
      return { cls: w.__cls!, shifts: w.__shifts! };
    });
    expect(cls, shifts.join("\n")).toBeLessThan(0.01);
  });

  test("nothing keeps running afterwards", async ({ page }) => {
    await page.goto("/");
    await settled(page);
    await page.waitForTimeout(300);
    expect(await framesDuring(page, 1000)).toBe(0);
  });
});

test.describe("loading gate and the construction entrance @core", () => {
  const entrance = async (page: Page, url: string) => {
    await page.addInitScript(() => {
      (window as Window & { __f?: number }).__f = 0;
      const r = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = (cb) => {
        (window as Window & { __f?: number }).__f!++;
        return r(cb);
      };
    });
    await page.goto(url);
    await expect(page.locator("#hero-stage")).toHaveClass(/has-gl/, { timeout: 15_000 });
    await expect.poll(() => page.evaluate(() => (window as Window & { __f?: number }).__f)).toBeGreaterThan(3);
    expect(await gated(page)).toBe(false);
    await expect(page.locator("canvas")).toHaveCount(1);
    expect(await page.evaluate(() => sessionStorage.getItem("rsx-intro"))).toBe("1");
  };

  test("a returning visitor's new session gets the entrance", async ({ page }) => {
    await returning(page);
    await entrance(page, "/");
  });

  test("a direct deep link gets the entrance", async ({ page }) => {
    await entrance(page, "/?project=nexus");
  });

  test("arriving at the home page from another page gets the entrance", async ({ page }) => {
    await page.goto("/about");
    await hydrated(page);
    await page.addScriptTag({ content: "window.__f=0;const r=requestAnimationFrame.bind(window);window.requestAnimationFrame=(c)=>{window.__f++;return r(c)};" });
    await page.locator("a.mark").click();
    await expect(page.locator("#hero-stage")).toHaveClass(/has-gl/, { timeout: 15_000 });
    await expect.poll(() => page.evaluate(() => (window as Window & { __f?: number }).__f)).toBeGreaterThan(3);
    expect(await gated(page)).toBe(false);
  });

  test("after the gate, coming back to the home page runs neither", async ({ page }) => {
    await page.goto("/");
    await settled(page);
    await page.locator(".foot-row a", { hasText: "About" }).click();
    await page.waitForURL("**/about");
    await page.locator("a.mark").click();
    await expect(page.locator("#hero-stage")).toHaveClass(/has-gl/, { timeout: 15_000 });
    await page.waitForTimeout(200);
    expect(await framesDuring(page, 500)).toBe(0);
    expect(await gated(page)).toBe(false);
  });

  test("the next session of a visitor who saw the gate gets the entrance, not the gate", async ({ page, context }) => {
    await page.goto("/");
    await settled(page);
    const next = await context.newPage();
    await next.goto("/");
    await hydrated(next);
    expect(await gated(next)).toBe(false);
  });
});

// A real page-lifecycle freeze, which only Chromium's protocol offers. Chromium reports it as hidden, so the move ends at rest.
test("a page frozen during the move comes back at rest, with one canvas and no loop", async ({ page, browserName, context }) => {
  test.skip(browserName !== "chromium");
  const cdp = await context.newCDPSession(page);
  await page.goto("/");
  await page.waitForSelector(".gate .hero-canvas.is-ready", { timeout: 15_000 });
  await cdp.send("Page.setWebLifecycleState", { state: "frozen" });
  await new Promise((r) => setTimeout(r, 2500));
  await cdp.send("Page.setWebLifecycleState", { state: "active" });
  await settled(page);
  await page.waitForTimeout(300);
  expect(await framesDuring(page, 800)).toBe(0);
  await expect(page.locator("canvas")).toHaveCount(1);
});

test("a main thread stalled during the move resumes with no jump @core", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector(".gate .hero-canvas.is-ready", { timeout: 15_000 });
  await page.waitForTimeout(350);
  await page.evaluate(() => {
    const t = performance.now();
    while (performance.now() - t < 2500); // far longer than the whole move
  });
  expect(await gated(page)).toBe(true); // a clock on the wall would have finished it
  await settled(page);
  expect(await framesDuring(page, 800)).toBe(0);
});

test("a device too slow to finish the move still reaches the hero in time @core", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector(".gate .hero-canvas.is-ready", { timeout: 15_000 });
  await page.evaluate(() => {
    window.requestAnimationFrame = () => 0; // no frame ever arrives
  });
  await expect.poll(() => gated(page), { timeout: 7_000 }).toBe(false);
  await expect(page.locator("#hero-stage")).toHaveClass(/has-gl/);
  await expect(page.locator("#hero-stage > canvas.is-ready")).toHaveCount(1);
});

test.describe("the hero after the gate", () => {
  for (const [width, height] of VIEWPORTS)
    for (const theme of ["dark", "light"])
      test(`is pixel-identical to the plain hero at ${width}x${height}, ${theme}`, async ({ browser }) => {
        const shot = async (url: string) => {
          const context = await browser.newContext({ viewport: { width, height } });
          const page = await context.newPage();
          await page.addInitScript((t) => localStorage.setItem("rsx-theme", t), theme);
          await page.goto(url);
          await settled(page);
          await page.waitForTimeout(900);
          const png = await page.screenshot();
          await context.close();
          return png;
        };
        const [plain, gatePath] = [await shot("/?nointro"), await shot("/")];
        expect(gatePath.equals(plain)).toBe(true);
      });
});
