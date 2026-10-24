import { test as base, expect, type Page } from "@playwright/test";

/*
 * /lab is a lazy route (src/labRoute.ts) with a fully prerendered page
 * (entry-server.tsx waits for it; prerender.mjs links its stylesheet).
 */

/** Fails any test that logs a console error (hydration mismatches included) or throws. */
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

const LAB_CHUNK = /\/assets\/LabPage-[^/]+\.js$/;

/** Records every request for the lab chunk. */
const labRequests = (page: Page) => {
  const seen: string[] = [];
  page.on("request", (r) => LAB_CHUNK.test(r.url()) && seen.push(r.url()));
  return seen;
};

const ribbonLive = (page: Page) => expect(page.locator(".ribbon-stage")).toHaveAttribute("data-live", "");

test("production pages never load the lab chunk", async ({ page }) => {
  const seen = labRequests(page);
  // (404.html is checked statically by check-dist; its 404 status logs a console error.)
  for (const path of ["/", "/work/atlas", "/archive"]) {
    await page.goto(path);
    await page.waitForFunction(() => document.documentElement.classList.contains("motion-ready"));
  }
  // Client-side navigation between production pages does not load it either.
  await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Archive" }).click();
  await expect(page).toHaveURL(/\/archive$/);
  expect(seen).toEqual([]);
});

test("a direct visit shows the styled, prerendered lab at once and hydrates it in place", async ({ page }) => {
  // Hold the lab chunk back so the prerendered page can be inspected first.
  let release!: () => void;
  const held = new Promise<void>((r) => (release = r));
  await page.route(LAB_CHUNK, async (route) => {
    await held;
    await route.continue();
  });
  await page.goto("/lab", { waitUntil: "domcontentloaded" });

  // Before the chunk: the content is there and already styled by the lab
  // stylesheet linked in the HTML (the pinned stage at this size).
  await expect(page.getByRole("heading", { level: 1, name: "Selected work, isolated" })).toBeVisible();
  await expect(page.locator(".ribbon-title")).toHaveText(["Nexus", "Atlas", "Reflux", "ExtendSpace"]);
  expect(await page.locator(".ribbon-stage").evaluate((el) => getComputedStyle(el).position)).toBe("sticky");
  await expect(page.locator(".ribbon-stage")).not.toHaveAttribute("data-live", "");
  // Mark prerendered nodes: hydration must adopt them, not replace them.
  await page.evaluate(() => {
    document.querySelector("#lab-title")!.setAttribute("data-prerendered", "");
    document.querySelector(".ribbon-stage")!.setAttribute("data-prerendered", "");
  });

  release();
  await ribbonLive(page);
  await expect(page.locator("#lab-title[data-prerendered]")).toHaveCount(1);
  await expect(page.locator(".ribbon-stage[data-prerendered]")).toHaveCount(1);
  await expect(page.locator(".lab-motion-item").first()).toBeVisible();
});

test("a direct visit hydrates the lab in the same pass as the page, before motion starts", async ({ page }) => {
  // At the moment html.motion-ready is set, record whether the lab content
  // has been hydrated (React has attached its fiber to the node). If it had
  // not, its reveal effects would run late and on-screen content would fade in.
  await page.addInitScript(() => {
    const w = window as unknown as { __labHydratedAtMotionReady?: boolean };
    new MutationObserver((_, observer) => {
      if (!document.documentElement.classList.contains("motion-ready")) return;
      const item = document.querySelector(".lab-motion-item");
      w.__labHydratedAtMotionReady = !!item && Object.keys(item).some((k) => k.startsWith("__reactFiber"));
      observer.disconnect();
      // (Observes the document: init scripts run before <html> exists.)
    }).observe(document, { subtree: true, attributes: true, attributeFilter: ["class"] });
  });
  // Delay the chunk, as a slow network would.
  await page.route(LAB_CHUNK, async (route) => {
    await new Promise((r) => setTimeout(r, 600));
    await route.continue();
  });
  await page.goto("/lab");
  await page.waitForFunction(() => document.documentElement.classList.contains("motion-ready"));
  expect(await page.evaluate(() => (window as unknown as { __labHydratedAtMotionReady?: boolean }).__labHydratedAtMotionReady)).toBe(true);
  // And nothing on screen is fading in. (Items below the fold do transition
  // to their hidden state, off screen; that is the reveal working.)
  const onScreen = await page.locator(".lab-motion-item").evaluateAll((els) =>
    els.filter((el) => el.getBoundingClientRect().top < innerHeight).flatMap((el) => el.getAnimations()).length,
  );
  expect(onScreen).toBe(0);
});

test("refreshing /lab renders and hydrates it again", async ({ page }) => {
  await page.goto("/lab");
  await ribbonLive(page);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "Selected work, isolated" })).toBeVisible();
  await ribbonLive(page);
});

test("client-side navigation to and from /lab loads the chunk once and works both ways", async ({ page }) => {
  const seen = labRequests(page);
  await page.goto("/");
  await page.waitForFunction(() => document.documentElement.classList.contains("motion-ready"));
  expect(seen).toEqual([]);

  // /lab is deliberately unlinked; navigate the way the router would.
  await page.evaluate(() => {
    history.pushState({}, "", "/lab");
    dispatchEvent(new PopStateEvent("popstate"));
  });
  await expect(page.getByRole("heading", { level: 1, name: "Selected work, isolated" })).toBeVisible();
  await ribbonLive(page);
  expect(await page.locator(".ribbon-cards").evaluate((el) => getComputedStyle(el).display)).toBe("block");
  expect(seen).toHaveLength(1);

  await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Archive" }).click();
  await expect(page).toHaveURL(/\/archive$/);
  await expect(page.locator(".ribbon-stage")).toHaveCount(0);

  await page.goBack();
  await expect(page).toHaveURL(/\/lab$/);
  await ribbonLive(page);
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("#hero-title")).toBeVisible();
  expect(seen).toHaveLength(1);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("lab.html is complete and styled", async ({ page }) => {
    await page.goto("/lab");
    await expect(page.getByRole("heading", { level: 1, name: "Selected work, isolated" })).toBeVisible();
    await expect(page.locator(".ribbon-title")).toHaveText(["Nexus", "Atlas", "Reflux", "ExtendSpace"]);
    await expect(page.locator(".lab-motion-item")).not.toHaveCount(0);
    // The lab stylesheet applies without the script: the static list in four columns.
    const columns = await page.locator(".ribbon-cards").evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length);
    expect(columns).toBe(4);
  });
});
