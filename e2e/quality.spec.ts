import { expect, test } from "@playwright/test";
import { axe, detailOpen, routes } from "./helpers";

test.describe("accessibility (axe)", () => {
  for (const path of routes) {
    test(`${path} has no axe violations`, async ({ page }) => {
      await page.goto(path);
      await axe(page);
    });
  }

  test("the open detail view has no axe violations", async ({ page }) => {
    for (const slug of ["atlas", "layers-by-rsx", "bhatkal-time-luxe"]) {
      await page.goto(`/?project=${slug}&open=1`);
      await detailOpen(page, (await page.locator("#ps-info h3").textContent())!);
      await axe(page, "dialog.ps-detail");
    }
  });

  test("404 has no axe violations", async ({ page }) => {
    await page.goto("/nope");
    await axe(page);
  });

  test("phone layout has no axe violations", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await axe(page);
    await page.goto("/work/atlas");
    await axe(page);
  });
});

test.describe("structure", () => {
  test("headings never skip a level and landmarks exist", async ({ page }) => {
    for (const path of routes) {
      await page.goto(path);
      const levels = await page.locator("main h1, main h2, main h3, main h4").evaluateAll((hs) => hs.map((h) => Number(h.tagName[1])));
      expect(levels[0], path).toBe(1);
      for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1], `${path} ${levels.join(",")}`).toBeLessThanOrEqual(1);
      await expect(page.locator("header.top")).toHaveCount(1);
      await expect(page.locator("main")).toHaveCount(1);
      await expect(page.locator("footer")).toHaveCount(1);
    }
  });

  test("every visual says what kind of evidence it is", async ({ page }) => {
    for (const path of routes) {
      await page.goto(path);
      const figs = page.locator("figure.fig");
      const n = await figs.count();
      for (let i = 0; i < n; i++) await expect(figs.nth(i).locator(".tag")).toHaveText(/^(Screenshot|Illustration)$/);
      // Project Space figures distinguish captures, live-site screenshots, illustrations and plans.
      const ps = page.locator("figure.psc-fig");
      const m = await ps.count();
      for (let i = 0; i < m; i++) await expect(ps.nth(i).locator("figcaption .ps-tag")).toHaveText(/^(Screenshot|Debug capture|Emulator capture|Screenshot, live site|Illustration)$/);
    }
    await page.goto("/");
    await expect(page.locator("#work .ps-cap .ps-tag")).toHaveText(["Screenshot"]);
  });
});

test.describe("responsive", () => {
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const path of ["/", "/work/atlas", "/work/extendspace", "/work/layers-by-rsx", "/work/bhatkal-time-luxe", "/work/querycraft", "/about", "/archive"]) {
        await page.goto(path);
        const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(over, `${path} at ${width}`).toBe(0);
      }
      await page.goto("/?project=atlas&open=1");
      await detailOpen(page, "Atlas");
      const inner = await page.locator("dialog.ps-detail").evaluate((s) => s.scrollWidth - s.clientWidth);
      expect(inner).toBe(0);
    });
  }

  test("touch targets in the header and Project Space controls are at least 44px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
    // Only what is on screen: at phone width the header shows the wordmark and the two switches.
    const targets = page.locator(".top a:visible, .top button:visible, #work .ps-sd-btn, #ps-explore");
    const n = await targets.count();
    for (let i = 0; i < n; i++) {
      const b = await targets.nth(i).boundingBox();
      expect(b!.height, await targets.nth(i).innerText()).toBeGreaterThanOrEqual(44);
    }
  });
});
