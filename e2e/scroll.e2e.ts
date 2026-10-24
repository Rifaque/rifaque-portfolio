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

/** Prerendered links work before hydration as plain page loads; wait for the app. */
async function open(page: Page, url: string) {
  await page.goto(url);
  await page.waitForFunction(() => history.scrollRestoration === "manual");
}

const scrollY = (page: Page) => page.evaluate(() => window.scrollY);

/** Two frames: one for the scroll event, one for the throttled save. */
const settle = (page: Page) =>
  page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null)))));

async function scrollTo(page: Page, y: number) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
  await settle(page);
  return scrollY(page);
}

/** Top of an element relative to the viewport. */
const topOf = (page: Page, selector: string) => page.locator(selector).evaluate((el) => el.getBoundingClientRect().top);

const expectNear = async (page: Page, y: number) => expect.poll(() => scrollY(page)).toBeGreaterThanOrEqual(y - 2).then(() =>
  expect.poll(() => scrollY(page)).toBeLessThanOrEqual(y + 2),
);

test("case study from deep in the homepage opens at the top; Back and Forward restore", async ({ page }) => {
  await open(page, "/");
  const link = page.getByRole("link", { name: "Read the ExtendSpace case study" });
  await link.scrollIntoViewIfNeeded();
  await settle(page);
  const homeY = await scrollY(page);
  expect(homeY).toBeGreaterThan(3000);

  await link.click();
  await expect(page).toHaveURL(/\/work\/extendspace$/);
  expect(await scrollY(page)).toBe(0);
  await page.waitForTimeout(600);
  expect(await scrollY(page), "stays at the top").toBe(0);
  await expect(page.locator("h1")).toHaveText("ExtendSpace");

  const caseY = await scrollTo(page, 800);

  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expectNear(page, homeY);

  await page.goForward();
  await expect(page).toHaveURL(/\/work\/extendspace$/);
  await expectNear(page, caseY);

  await page.goBack();
  await expectNear(page, homeY);
});

test("direct entry starts at the top, and a hash reaches its target and focus", async ({ page }) => {
  await open(page, "/work/extendspace");
  expect(await scrollY(page)).toBe(0);

  // A separate document load each time, not a same-document hash change.
  await open(page, "/archive");
  await open(page, "/work/extendspace#cs-not-done-yet");
  await expect.poll(() => topOf(page, "#cs-not-done-yet")).toBeLessThan(40);
  expect(await topOf(page, "#cs-not-done-yet")).toBeGreaterThanOrEqual(0);
  await expect(page.locator("#cs-not-done-yet")).toBeFocused();

  await open(page, "/#work");
  await expect.poll(() => topOf(page, "#work")).toBeLessThan(40);
  await expect(page.locator("#work")).toBeFocused();

  // A hash typed into the address bar: a same-document entry with no router key.
  await page.evaluate(() => (location.hash = "#contact"));
  await expect.poll(() => page.locator("#contact").evaluate((el) => el.getBoundingClientRect().top < innerHeight)).toBe(true);
  await expect(page.locator("#contact")).toBeFocused();
  await page.goBack();
  await expect(page).toHaveURL(/\/#work$/);
  await expect.poll(() => topOf(page, "#work")).toBeLessThan(40);
});

test("moving between case studies starts each one at the top, with no glide", async ({ page }) => {
  await open(page, "/work/extendspace");
  await scrollTo(page, 100000);
  expect(await scrollY(page)).toBeGreaterThan(1000);

  await page.locator(".cs-next-link").click();
  await expect(page).toHaveURL(/\/work\/bhatkal-time-luxe$/);
  expect(await scrollY(page), "instant, not smooth").toBe(0);
  await expect(page.locator("h1")).toHaveText("Bhatkal Time Luxe");

  // Breadcrumb back to a homepage section: a different path with a hash.
  // Clicked programmatically: the breadcrumb is above the fold at this offset.
  await scrollTo(page, 600);
  await page
    .getByRole("navigation", { name: "Breadcrumb" })
    .getByRole("link", { name: "Experience" })
    .evaluate((a: HTMLAnchorElement) => a.click());
  await expect(page).toHaveURL(/\/#experience$/);
  await expect.poll(() => topOf(page, "#experience")).toBeLessThan(40);
  await expect(page.locator("#experience")).toBeFocused();

  // Back to the case study restores where it was left.
  await page.goBack();
  await expect(page).toHaveURL(/\/work\/bhatkal-time-luxe$/);
  await expectNear(page, 600);
});

test("a Lab query change keeps the scroll position", async ({ page }) => {
  await open(page, "/lab?layout=pinned");
  const y = await scrollTo(page, 1500);
  expect(y).toBeGreaterThan(1000);

  // Clicked programmatically so Playwright does not scroll the link into view.
  await page.locator('a[href="/lab?layout=stacked"]').evaluate((a: HTMLAnchorElement) => a.click());
  await expect(page).toHaveURL(/\?layout=stacked$/);
  await settle(page);
  expect(await scrollY(page)).toBe(y);
});

test("refresh restores the position of the current entry", async ({ page }) => {
  await open(page, "/");
  const y = await scrollTo(page, 3000);
  await page.reload();
  await page.waitForFunction(() => history.scrollRestoration === "manual");
  await expectNear(page, y);

  // A pushed entry keeps its router key across the reload.
  await page.getByRole("link", { name: "Archive" }).first().evaluate((a: HTMLAnchorElement) => a.click());
  await expect(page).toHaveURL(/\/archive$/);
  expect(await scrollY(page)).toBe(0);
  const archiveY = await scrollTo(page, 300);
  await page.reload();
  await page.waitForFunction(() => history.scrollRestoration === "manual");
  await expectNear(page, archiveY);

  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expectNear(page, y);
});

test("in-page anchors glide with motion allowed and jump with reduced motion", async ({ page }) => {
  await open(page, "/");
  await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Contact" }).click();
  await expect(page).toHaveURL(/\/#contact$/);
  const early = await scrollY(page);
  await expect.poll(() => page.locator("#contact").evaluate((el) => el.getBoundingClientRect().top < innerHeight)).toBe(true);
  await expect(page.locator("#contact")).toBeFocused();
  const final = await scrollY(page);
  expect(early, "smooth: not yet at the target on the first frame").toBeLessThan(final);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, "/");
  await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Experience" }).click();
  await expect(page).toHaveURL(/\/#experience$/);
  await settle(page);
  const top = await topOf(page, "#experience");
  expect(top, "instant: already at the target").toBeLessThan(40);
  expect(top).toBeGreaterThanOrEqual(0);
  await expect(page.locator("#experience")).toBeFocused();

  // Route changes and restoration behave the same with reduced motion.
  const homeY = await scrollY(page);
  await page.getByRole("link", { name: "Read the Bhatkal Time Luxe case study" }).evaluate((a: HTMLAnchorElement) => a.click());
  await expect(page).toHaveURL(/\/work\/bhatkal-time-luxe$/);
  expect(await scrollY(page)).toBe(0);
  await page.goBack();
  await expectNear(page, homeY);
});

test("the command palette still navigates to sections and case studies", async ({ page }) => {
  await open(page, "/");
  await page.keyboard.press("Control+k");
  await page.getByRole("combobox").fill("Smaller builds");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/#smaller$/);
  await expect.poll(() => topOf(page, "#smaller")).toBeLessThan(40);
  await expect(page.getByRole("dialog")).toBeHidden();

  await page.keyboard.press("Control+k");
  await page.getByRole("combobox").fill("Reflux");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/work\/reflux$/);
  expect(await scrollY(page)).toBe(0);
  await expect(page).toHaveTitle(/Reflux/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://rsxdevelops.dev/work/reflux");
});
