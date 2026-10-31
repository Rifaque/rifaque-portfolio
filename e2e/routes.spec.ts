import { expect, test } from "@playwright/test";
import { routes, watch } from "./helpers";

test.describe("routes @core", () => {
  for (const path of routes) {
    test(`${path} loads directly, has its metadata and no console errors`, async ({ page }) => {
      const problems = watch(page);
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(canonical).toBe(path === "/" ? "https://rsxdevelops.dev/" : `https://rsxdevelops.dev${path}`);
      expect(await page.title()).toMatch(/RSX Develops/);
      // Let the home page's hero finish starting (its scene loads on demand) before reloading.
      if (path === "/") await expect(page.locator("#hero-stage")).toHaveClass(/has-gl|gl-off/, { timeout: 15_000 });
      await page.reload();
      await expect(page.locator("h1")).toHaveCount(1);
      expect(problems).toEqual([]);
    });
  }

  test("unknown paths get the 404 page with a 404 status", async ({ page }) => {
    const res = await page.goto("/nope");
    expect(res?.status()).toBe(404);
    await expect(page.locator("h1")).toHaveText("This page doesn't exist.");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
  });

  test("the retired lab route is not exposed", async ({ page }) => {
    const res = await page.goto("/lab");
    expect(res?.status()).toBe(404);
    await expect(page.locator("h1")).toHaveText("This page doesn't exist.");
  });

  test("/desktop redirects permanently to /", async ({ request }) => {
    const res = await request.get("/desktop", { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    expect(res.headers()["location"]).toBe("/");
    const nested = await request.get("/desktop/anything", { maxRedirects: 0 });
    expect(nested.headers()["location"]).toBe("/");
  });

  test("internal navigation, Back and Forward keep pages and titles in step", async ({ page }) => {
    await page.goto("/?nointro");
    // About and Archive are quieter pages, linked from the footer (the header's About is a section).
    await page.locator("footer").getByRole("link", { name: "About" }).click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.locator("h1")).toHaveText("Rifaque Akrami");
    await expect(page).toHaveTitle(/^About Rifaque Akrami/);
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
    await page.getByRole("link", { name: "QueryCraft" }).first().click();
    await expect(page).toHaveURL(/\/work\/querycraft$/);
    await expect(page).toHaveTitle(/^QueryCraft/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://rsxdevelops.dev/work/querycraft");
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
    await page.goBack();
    await expect(page).toHaveURL(/\/about$/);
    await page.goBack();
    await expect(page.locator("#hero-name")).toBeVisible();
    await page.goForward();
    await expect(page).toHaveURL(/\/about$/);
  });

  test("Work in the header reaches Project Space from another page", async ({ page }) => {
    await page.goto("/archive");
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Work" }).click();
    await expect(page).toHaveURL(/\/#work$/);
    await expect(page.locator("#work")).toBeInViewport();
  });
});

test.describe("content in the prerendered HTML", () => {
  test("every project page states status, ownership and a labelled visual before JavaScript", async ({ request }) => {
    for (const path of routes.filter((r) => r.startsWith("/work/"))) {
      const html = await (await request.get(path)).text();
      expect(html, path).toMatch(/<h1[^>]*>[^<]+<\/h1>/);
      expect(html, path).toMatch(/Ownership<\/dt>/);
      expect(html, path).toMatch(/class="status/);
      expect(html, path).toMatch(/<span class="(tag|ps-tag[^"]*)">(Screenshot|Illustration|Debug capture|Emulator capture|Screenshot, live site)<\/span>/);
    }
  });

  test("HubZero work is attributed to HubZero", async ({ request }) => {
    for (const path of ["/work/bhatkal-time-luxe", "/work/querycraft"]) {
      const html = await (await request.get(path)).text();
      expect(html).toContain("HubZero");
      expect(html).not.toContain("Personal project · RSX Develops");
    }
    expect(await (await request.get("/work/querycraft")).text()).toMatch(/class="ro-credit"/);
    const btl = await (await request.get("/work/bhatkal-time-luxe")).text();
    expect(btl).toContain("Ownership</dt><dd>HubZero client project</dd>");
    expect(btl).toContain("Initial mobile-only UI/UX foundation by a co-founder");
    expect(btl).not.toMatch(/Kuwait and the wider GCC|serving Kuwait/);
  });

  test("licences shown only where verified, and proprietary projects never called open source", async ({ request }) => {
    const licence = async (slug: string) => {
      const html = await (await request.get(`/work/${slug}`)).text();
      return html.match(/Licence<\/dt><dd>([^<]+)<\/dd>/)?.[1] ?? null;
    };
    expect(await licence("atlas")).toBe("MIT");
    expect(await licence("bluetap")).toBe("MIT");
    expect(await licence("extendspace")).toBe("MIT");
    expect(await licence("nexus")).toBe("Closed source");
    expect(await licence("reflux")).toBe("Proprietary");
    for (const slug of ["layers-by-rsx", "querycraft", "bhatkal-time-luxe", "hubzero"]) expect(await licence(slug)).toBeNull();
    for (const slug of ["reflux", "nexus"]) {
      const html = await (await request.get(`/work/${slug}`)).text();
      const main = html.match(/<main[\s\S]*<\/main>/)![0]; // the footer's support line is site-wide
      expect(main.replace(/not open source/g, "")).not.toMatch(/open[- ]source/i);
    }
  });
});
