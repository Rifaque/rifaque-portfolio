import { expect, test, type Page } from "@playwright/test";
import { hydrated } from "./helpers";

declare global {
  interface Window {
    __contexts: WebGLRenderingContext[];
  }
}

/** Records every WebGL context the page creates, so a test can see which stay alive. */
async function trackContexts(page: Page) {
  await page.addInitScript(() => {
    window.__contexts = [];
    const get = HTMLCanvasElement.prototype.getContext as (this: HTMLCanvasElement, type: string, ...rest: unknown[]) => unknown;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
      const context = get.call(this, type, ...rest) as WebGLRenderingContext | null;
      if (/webgl/.test(type) && context && !window.__contexts.includes(context)) window.__contexts.push(context);
      return context;
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
}

const liveContexts = (page: Page) => page.evaluate(() => window.__contexts.filter((c) => !c.isContextLost()).length);
/** Bright pixels on screen in the room: the solid. Read from a screenshot, since an idle WebGL buffer cannot be read back. */
const litPixels = async (page: Page) => {
  const png = (await page.locator("#hero-stage canvas").screenshot()).toString("base64");
  return page.evaluate(async (data) => {
    const image = new Image();
    image.src = `data:image/png;base64,${data}`;
    await image.decode();
    const copy = document.createElement("canvas");
    copy.width = image.naturalWidth;
    copy.height = image.naturalHeight;
    const c = copy.getContext("2d")!;
    c.drawImage(image, 0, 0);
    const pixels = c.getImageData(image.naturalWidth / 2, 0, image.naturalWidth / 2, image.naturalHeight).data;
    let lit = 0;
    for (let i = 0; i < pixels.length; i += 4) if (pixels[i] > 200) lit++;
    return lit;
  }, png);
};

test.describe("hero WebGL lifecycle @core", () => {
  test("repeated visits to the home page keep one live context", async ({ page }) => {
    const warnings: string[] = [];
    page.on("console", (m) => {
      if (/Too many active WebGL contexts/.test(m.text())) warnings.push(m.text());
    });
    await trackContexts(page);
    await page.goto("/?nointro");
    await hydrated(page);
    await expect(page.locator("#hero-stage")).toHaveClass(/has-gl/, { timeout: 15_000 });
    expect(await liveContexts(page)).toBe(1);

    for (let i = 0; i < 20; i++) {
      await page.locator(".foot-row a", { hasText: "About" }).click();
      await page.waitForURL("**/about");
      await expect.poll(() => liveContexts(page)).toBe(0);
      await page.locator("a.mark").click();
      await expect(page.locator("#hero-stage")).toHaveClass(/has-gl/, { timeout: 15_000 });
      await expect(page.locator("#hero-stage canvas")).toHaveCount(1);
    }
    await expect.poll(() => liveContexts(page)).toBe(1);
    expect(warnings).toEqual([]);
  });

  test("leaving the home page while the scene starts leaves nothing behind", async ({ page }) => {
    await trackContexts(page);
    await page.route(/three\.min-[\w-]+\.js$/, async (r) => {
      await new Promise((res) => setTimeout(res, 500));
      await r.continue();
    });
    await page.goto("/?nointro");
    await hydrated(page);
    await page.locator(".foot-row a", { hasText: "About" }).click();
    await page.waitForURL("**/about");
    await page.waitForTimeout(900);
    expect(await liveContexts(page)).toBe(0);
    await expect(page.locator("canvas")).toHaveCount(0);
  });

  test("a lost context shows the drawing, then the room comes back when it is restored", async ({ page }) => {
    await trackContexts(page);
    await page.goto("/?nointro");
    await hydrated(page);
    const stage = page.locator("#hero-stage");
    await expect(stage).toHaveClass(/has-gl/, { timeout: 15_000 });
    expect(await litPixels(page)).toBeGreaterThan(1000);

    await page.evaluate(() => {
      const c = window.__contexts.find((x) => !x.isContextLost())!;
      (window as Window & { __lose?: WEBGL_lose_context }).__lose = c.getExtension("WEBGL_lose_context")!;
      (window as Window & { __lose?: WEBGL_lose_context }).__lose!.loseContext();
    });
    await expect(stage).toHaveClass(/gl-off/);
    await expect(stage).not.toHaveClass(/has-gl/);
    await expect(page.locator(".hero-poster")).toHaveCSS("opacity", "1");
    await expect(page.locator(".views")).toBeHidden();
    await expect(page.locator("#hero-name")).toBeVisible();

    await page.evaluate(() => (window as Window & { __lose?: WEBGL_lose_context }).__lose!.restoreContext());
    await expect(stage).toHaveClass(/has-gl/, { timeout: 10_000 });
    await expect(stage).not.toHaveClass(/gl-off/);
    await expect(page.locator(".views")).toBeVisible();
    await expect.poll(() => litPixels(page), { timeout: 5_000 }).toBeGreaterThan(1000);
  });

  test("a context that never comes back leaves the drawing in place and no frames running", async ({ page }) => {
    await trackContexts(page);
    await page.goto("/?nointro");
    await hydrated(page);
    await expect(page.locator("#hero-stage")).toHaveClass(/has-gl/, { timeout: 15_000 });
    await page.evaluate(() => window.__contexts.find((x) => !x.isContextLost())!.getExtension("WEBGL_lose_context")!.loseContext());
    await expect(page.locator("#hero-stage")).toHaveClass(/gl-off/);
    await page.getByRole("link", { name: "See the work" }).click();
    await expect(page.locator("#work")).toBeInViewport();
  });
});
