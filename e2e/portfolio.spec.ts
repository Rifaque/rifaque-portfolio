import { expect, test, type Page } from "@playwright/test";
import { axe, hydrated, selected, watch } from "./helpers";

/** The page as it is used: past the hero's one-time entrance. */
const home = async (page: Page, query = "") => {
  await page.goto(`/?nointro${query}`);
  await hydrated(page);
};

test.describe("the accepted page @core", () => {
  test("sections in order: hero, Projects, How I work, Experience and education, Bill of materials, contact", async ({ page }) => {
    const problems = watch(page);
    await home(page);
    const sections = await page.locator("main > section").evaluateAll((ss) => ss.map((s) => [s.id, s.querySelector("h1, h2")?.textContent?.trim()]));
    expect(sections).toEqual([
      ["top", "Rifaque Akrami"],
      ["work", "Projects"],
      ["about", "How I work"],
      ["experience", "Experience and education"],
      ["stack-index", "Bill of materials"],
      ["contact", "Get in touch"],
    ]);
    await expect(page.locator("footer")).toContainText("© 2026 Rifaque Akrami");
    expect(problems).toEqual([]);
  });

  test("header: the approved wordmark, section links, a theme switch naming its target, an icon-only sound switch", async ({ page }) => {
    await home(page);
    const wm = page.locator("header.top .wm:visible");
    await expect(wm).toHaveCount(1);
    await expect(wm).toHaveAttribute("src", /rsx-develops-wordmark-dark-[\w-]+\.png$/);
    expect(await wm.evaluate((i: HTMLImageElement) => i.naturalWidth)).toBeGreaterThan(0);
    await expect(page.getByRole("navigation", { name: "Primary" }).getByRole("link")).toHaveText(["Work", "About", "Experience", "Contact"]);
    const theme = page.locator("#theme-switch");
    await expect(theme).toHaveAccessibleName("Switch to light theme");
    await expect(theme.locator(".pref-label")).toHaveText("Light");
    await theme.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(theme).toHaveAccessibleName("Switch to dark theme");
    await expect(theme.locator(".pref-label")).toHaveText("Dark");
    await expect(page.locator("header.top .wm:visible")).toHaveAttribute("src", /rsx-develops-wordmark-light-[\w-]+\.png$/);
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light"); // stored, applied before paint
    const sound = page.locator("#sound-switch");
    await expect(sound).toHaveAccessibleName("Enable sound");
    expect((await sound.innerText()).trim()).toBe("");
  });

  test("switching the theme never moves the page", async ({ page }) => {
    await home(page);
    await page.evaluate(() => scrollTo({ top: 2000, behavior: "instant" }));
    await expect.poll(() => page.evaluate(() => Math.round(scrollY))).toBe(2000);
    const box = (await page.locator("#theme-switch").boundingBox())!;
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    expect(await page.evaluate(() => Math.round(scrollY))).toBe(2000);
  });

  test("section links land below the floating header", async ({ page }) => {
    await home(page);
    await page.addStyleTag({ content: "html { scroll-behavior: auto !important }" });
    for (const id of ["work", "about", "experience"]) {
      await page.locator(`header.top .nav a[href="/#${id}"]`).click();
      await expect.poll(() => page.evaluate((i) => Math.round(document.getElementById(i)!.querySelector("h2")!.getBoundingClientRect().top), id)).toBe(104);
    }
  });
});

test.describe("hero", () => {
  test("the entrance runs once per session, settles, and stays settled after reload", async ({ page }) => {
    await page.addInitScript(() => {
      let frames = 0;
      const requestFrame = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = (callback) => {
        frames++;
        (window as Window & { __heroFrames?: number }).__heroFrames = frames;
        return requestFrame(callback);
      };
    });
    const frameCount = () => page.evaluate(() => (window as Window & { __heroFrames?: number }).__heroFrames ?? 0);

    await page.goto("/");
    await expect(page.locator("#hero-stage")).toHaveClass(/has-gl/, { timeout: 15_000 });
    await expect.poll(frameCount).toBeGreaterThan(5);
    await page.waitForTimeout(1800);
    const settledFrames = await frameCount();
    await page.waitForTimeout(150);
    expect(await frameCount()).toBe(settledFrames);
    expect(await page.evaluate(() => sessionStorage.getItem("rsx-intro"))).toBe("1");

    await page.reload();
    await expect(page.locator("#hero-stage")).toHaveClass(/has-gl/, { timeout: 15_000 });
    const reloadedFrames = await frameCount();
    await page.waitForTimeout(200);
    expect(await frameCount() - reloadedFrames).toBeLessThanOrEqual(1);

    await page.evaluate(() => sessionStorage.removeItem("rsx-intro"));
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    await expect(page.locator("#hero-stage")).toHaveClass(/has-gl/, { timeout: 15_000 });
    const reducedFrames = await frameCount();
    await page.waitForTimeout(200);
    expect(await frameCount() - reducedFrames).toBeLessThanOrEqual(1);
  });

  test("the solid takes the pointer where it is drawn; the controls still work", async ({ page }) => {
    await home(page);
    await expect(page.locator("#hero-stage")).toHaveClass(/has-gl/, { timeout: 15_000 });
    const box = (await page.locator("#hero-stage canvas").boundingBox())!;
    for (const [fx, fy] of [[0.715, 0.48], [0.62, 0.36], [0.86, 0.2]]) {
      const x = box.x + box.width * fx, y = box.y + box.height * fy;
      expect(await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.className, [x, y])).toContain("hero-canvas");
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x - 40, y + 8, { steps: 4 });
      await expect(page.locator(".hero-canvas")).toHaveClass(/is-dragging/);
      await page.mouse.up();
    }
    await page.getByRole("button", { name: /reads R/ }).click();
    await expect(page.getByRole("button", { name: /reads R/ })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".solid-caption")).toContainText("its own R");
    const see = page.getByRole("link", { name: "See the work" });
    const b = (await see.boundingBox())!;
    expect(await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.textContent, [b.x + 10, b.y + 10])).toContain("See the work");
  });

  test("without WebGL the drawing is shown on purpose, never a flash", async ({ page }) => {
    await page.goto("/?webgl=off");
    await hydrated(page);
    await expect(page.locator("#hero-stage")).toHaveClass(/gl-off/);
    await expect(page.locator(".hero-poster")).toHaveCSS("opacity", "1");
    await expect(page.locator(".views")).toBeHidden();
    await expect(page.locator(".solid-hint")).toHaveText("This is a drawing of the solid. Turning it needs WebGL.");
  });

  test("while WebGL starts the room stays empty", async ({ page }) => {
    await page.route(/three\.min-[\w-]+\.js$/, async (r) => {
      await new Promise((res) => setTimeout(res, 1500));
      await r.continue();
    });
    await page.goto("/?nointro");
    await hydrated(page);
    await expect(page.locator("#hero-stage")).not.toHaveClass(/has-gl/);
    await expect(page.locator(".hero-poster")).toHaveCSS("opacity", "0");
  });
});

test.describe("experience and education", () => {
  test("corrected start dates, and bars that match them", async ({ page }) => {
    await home(page);
    const rows = await page.locator(".ch-row").evaluateAll((rs) =>
      rs.map((r) => ({
        t: r.querySelector(".ch-title")!.textContent,
        d: r.querySelector(".ch-dates span")!.textContent,
        l: parseFloat((r.querySelector(".ch-bar") as HTMLElement).style.left),
        w: parseFloat((r.querySelector(".ch-bar") as HTMLElement).style.width),
      })),
    );
    const at = (y: number, m: number) => (((y - 2022) * 12 + m - 1) / 58) * 100; // Jan 2022 to Oct 2026
    const row = (t: string) => rows.find((r) => r.t === t)!;
    expect(rows.map((r) => r.t).slice(0, 2)).toEqual(["Reflux, ExtendSpace, Layers by RSX", "BlueTap"]);
    expect(row("Reflux, ExtendSpace, Layers by RSX").d).toBe("Oct 2026 to now");
    expect(row("Reflux, ExtendSpace, Layers by RSX").l).toBeCloseTo(at(2026, 10), 2);
    expect(row("BlueTap").d).toBe("Sep 2026 to now");
    expect(row("BlueTap").l).toBeCloseTo(at(2026, 9), 2);
    const be = row("B.E. Computer Science and Engineering");
    expect(be.d).toBe("Dec 2022 to Jun 2026");
    expect(be.l).toBeCloseTo(at(2022, 12), 2);
    expect(be.l + be.w).toBeCloseTo(at(2026, 7), 2);
    expect(rows).toHaveLength(9);
  });
});

test.describe("bill of materials", () => {
  test("a project leads to Projects or to its case study; light-theme contrast holds", async ({ page }) => {
    await home(page);
    const bom = page.locator("#stack-index");
    await bom.getByRole("button", { name: "BTL", exact: true }).click();
    await expect(bom.getByRole("button", { name: "BTL", exact: true })).toHaveAttribute("aria-pressed", "true");
    await bom.getByRole("link", { name: "Open it in Projects" }).click();
    await expect(page).toHaveURL(/\?project=bhatkal-time-luxe#work$/);
    await expect(selected(page)).toHaveText("Bhatkal Time Luxe");
    await bom.getByRole("button", { name: "QueryCraft", exact: true }).click();
    await expect(bom.getByRole("link", { name: "Read the case study" })).toHaveAttribute("href", "/work/querycraft");
    await page.evaluate(() => (document.documentElement.dataset.theme = "light"));
    await axe(page, "#stack-index");
  });
});

test.describe("also built and archive @core", () => {
  for (const [slug, title, note] of [
    ["querycraft", "QueryCraft", "Nothing runs until the user chooses Run."],
    ["bluetap", "BlueTap", "Tap to connect: not built yet"],
  ] as const) {
    test(`${title}: reached from Also built, opens with its labelled 3D illustration`, async ({ page }) => {
      const problems = watch(page);
      await home(page);
      await page.locator(".ps-also").getByRole("link", { name: title }).click();
      await expect(page).toHaveURL(new RegExp(`/work/${slug}$`));
      await expect(page.locator("h1")).toHaveText(title);
      await expect(page.locator(".st-3d .ps-scene")).toHaveCount(1);
      await expect(page.locator(".st-3d .ps-cap .ps-tag")).toHaveText("Illustration");
      await expect(page.locator(".st-3d")).toContainText(note);
      expect(problems).toEqual([]);
    });
  }

  test("archive builds: four entries, each with its repository", async ({ page }) => {
    await home(page);
    const rows = page.locator("#archive .arc");
    await expect(rows.locator("h4")).toHaveText(["HubZero website", "ZeroLink", "Blood Report Disease Diagnosis", "Hospital Management System"]);
    for (let i = 0; i < 4; i++) await expect(rows.nth(i).locator('a[href^="https://github.com/"]')).toHaveCount(1);
    await expect(page.locator("#archive")).not.toContainText("DevPilot");
  });

  test("Bhatkal Time Luxe keeps its India-wide framing and the currency experiment", async ({ page }) => {
    await page.goto("/work/bhatkal-time-luxe");
    const main = page.locator("main");
    await expect(main).toContainText("Bhatkal-based retailer");
    await expect(main).toContainText("India-wide");
    await expect(main).toContainText("original design by a HubZero co-founder");
    await expect(main).toContainText("not a client requirement");
    await expect(main).toContainText("not an active storefront");
  });
});
