import { expect, test } from "@playwright/test";
import { detailClosed, detailOpen, hydrated, selected, watch } from "./helpers";

const ORDER = ["Atlas", "Nexus", "ExtendSpace", "Reflux", "Layers by RSX", "Bhatkal Time Luxe"];

test.describe("project space @core", () => {
  test("the list selects projects, pushes ?project and never scrolls the page", async ({ page }) => {
    const problems = watch(page);
    await page.goto("/");
    await hydrated(page);
    await expect(selected(page)).toHaveText("Atlas"); // opens on the project with a real interface
    await page.locator("#work").scrollIntoViewIfNeeded();
    const y = await page.evaluate(() => scrollY);
    await page.locator('.ps-sd-btn[data-slug="extendspace"]').click();
    await expect(selected(page)).toHaveText("ExtendSpace");
    await expect(page).toHaveURL(/\/\?project=extendspace$/);
    await expect(page.locator("#ps-info h3")).toHaveText("ExtendSpace");
    await expect(page.locator("#work .ps-scene:not(.leaving)")).toHaveAttribute("data-scene", "extendspace");
    expect(await page.evaluate(() => scrollY)).toBe(y);
    // Back steps through selections.
    await page.goBack();
    await expect(selected(page)).toHaveText("Atlas");
    await page.goForward();
    await expect(selected(page)).toHaveText("ExtendSpace");
    expect(problems).toEqual([]);
  });

  test("the list holds the six featured projects in order", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#work .ps-sd-name")).toHaveText(ORDER);
    await expect(page.locator("#work .ps-also").getByRole("link")).toHaveText(["QueryCraft", "BlueTap"]);
  });

  test("keyboard: arrows, Home and End move through the list and select", async ({ page }) => {
    await page.goto("/");
    await hydrated(page);
    const btns = page.locator("#work .ps-sd-btn");
    await btns.first().focus();
    await page.keyboard.press("ArrowDown");
    await expect(selected(page)).toHaveText("Nexus");
    await expect(btns.nth(1)).toBeFocused();
    await page.keyboard.press("End");
    await expect(selected(page)).toHaveText("Bhatkal Time Luxe");
    await page.keyboard.press("ArrowDown"); // wraps
    await expect(selected(page)).toHaveText("Atlas");
    await page.keyboard.press("ArrowUp");
    await expect(selected(page)).toHaveText("Bhatkal Time Luxe");
    await page.keyboard.press("Home");
    await expect(selected(page)).toHaveText("Atlas");
    await expect(page.locator("#work p.sr-status")).toHaveText("Atlas selected.");
  });

  test("Explore opens the detail view; Escape restores the URL and focus", async ({ page }) => {
    const problems = watch(page);
    await page.goto("/");
    await hydrated(page);
    await page.locator("#ps-explore").click();
    await detailOpen(page, "Atlas");
    await expect(page).toHaveURL(/\?project=atlas&open=1$/);
    await expect(page.locator(".ps-dt-close")).toBeFocused();
    await page.keyboard.press("Escape");
    await detailClosed(page);
    await expect(page).toHaveURL(/127\.0\.0\.1:\d+\/$/);
    await expect(page.locator("#ps-explore")).toBeFocused();
    expect(problems).toEqual([]);
  });

  test("browser Back closes the detail view, Forward reopens it", async ({ page }) => {
    await page.goto("/");
    await hydrated(page);
    await page.locator('.ps-sd-btn[data-slug="reflux"]').click();
    await page.locator("#ps-explore").click();
    await detailOpen(page, "Reflux");
    await page.goBack();
    await detailClosed(page);
    await expect(page).toHaveURL(/\?project=reflux$/);
    await expect(selected(page)).toHaveText("Reflux");
    await page.goForward();
    await detailOpen(page, "Reflux");
    await expect(page).toHaveURL(/\?project=reflux&open=1$/);
  });

  test("direct URL and reload open the right project; closing keeps the selection", async ({ page }) => {
    await page.goto("/?project=extendspace&open=1");
    await detailOpen(page, "ExtendSpace");
    await page.reload();
    await detailOpen(page, "ExtendSpace");
    await page.locator(".ps-dt-close").click();
    await detailClosed(page);
    await expect(page).toHaveURL(/\/\?project=extendspace$/);
    await expect(selected(page)).toHaveText("ExtendSpace");
  });

  test("a HubZero project keeps its attribution", async ({ page }) => {
    await page.goto("/?project=bhatkal-time-luxe&open=1");
    await detailOpen(page, "Bhatkal Time Luxe");
    const d = page.locator("dialog.ps-detail");
    await expect(d.getByText("HubZero client project", { exact: true })).toBeVisible();
    await expect(d.locator(".ps-dt-fig .ps-tag")).toHaveText(/^Screenshot/);
    await expect(page.locator("#ps-info .ps-in-line")).toHaveText("With HubZero · client work");
  });

  test("an unknown ?project is ignored", async ({ page }) => {
    await page.goto("/?project=not-a-project&open=1");
    await expect(page.locator("#hero-name")).toBeVisible();
    await hydrated(page);
    await expect(selected(page)).toHaveText("Atlas");
    await detailClosed(page);
  });

  test("focus never reaches the page behind the open detail view", async ({ page }) => {
    await page.goto("/?project=atlas&open=1");
    await detailOpen(page, "Atlas");
    let wrappedBackIn = false;
    let leftToBrowser = false;
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press("Tab");
      // A native modal dialog may hand focus to the browser's own UI (activeElement = body)
      // after its last control; it must never land on an element of the page behind.
      const where = await page.evaluate(() => {
        const a = document.activeElement;
        if (!a || a === document.body) return "browser";
        return document.querySelector("dialog.ps-detail")!.contains(a) ? "dialog" : `page:${a.tagName}.${a.className}`;
      });
      expect(where).toMatch(/^(dialog|browser)$/);
      if (where === "browser") leftToBrowser = true;
      if (leftToBrowser && where === "dialog") wrappedBackIn = true;
    }
    expect(wrappedBackIn || !leftToBrowser).toBe(true);
  });

  test("the case-study link leads to the full page, which scrolls normally", async ({ page }) => {
    await page.goto("/?project=reflux&open=1");
    await detailOpen(page, "Reflux");
    await page.locator("dialog.ps-detail").getByRole("link", { name: "Case study" }).click();
    await expect(page).toHaveURL(/\/work\/reflux$/);
    await expect(page.locator("h1")).toHaveText("Reflux");
    await page.mouse.wheel(0, 600);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
  });

  test("Reset view appears only after the scene is turned, and returns focus to the scene", async ({ page }) => {
    await page.goto("/");
    await hydrated(page);
    const stage = page.locator("#work .ps-stage");
    const reset = stage.locator(".ps-reset");
    await expect(stage).toHaveAttribute("data-turned", "false");
    await expect(reset).toBeHidden();
    const scene = stage.locator(".ps-scene:not(.leaving)");
    await scene.focus();
    await page.keyboard.press("ArrowRight");
    await expect(stage).toHaveAttribute("data-turned", "true");
    await expect(reset).toBeVisible();
    await reset.click();
    await expect(stage).toHaveAttribute("data-turned", "false");
    await expect(scene).toBeFocused();
  });
});

test.describe("project space input details", () => {
  test("dragging turns the scene; a vertical wheel is left to the page", async ({ page }) => {
    await page.goto("/");
    await hydrated(page);
    await page.locator("#work").scrollIntoViewIfNeeded();
    const box = (await page.locator("#work .ps-stage3").boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
    await page.mouse.down();
    for (let i = 1; i <= 8; i++) await page.mouse.move(box.x + box.width * 0.5 - i * 20, box.y + box.height * 0.5);
    await page.mouse.up();
    await expect(page.locator("#work .ps-stage")).toHaveAttribute("data-turned", "true");
    await expect(selected(page)).toHaveText("Atlas"); // turning is not selecting
    const prevented = await page.evaluate(() => {
      const e = new WheelEvent("wheel", { deltaY: 120, bubbles: true, cancelable: true });
      document.querySelector("#work .ps-scene")!.dispatchEvent(e);
      return e.defaultPrevented;
    });
    expect(prevented).toBe(false);
  });

  test("no animation frames are requested while idle", async ({ page }) => {
    // ?nointro: the hero's one-time entrance animates on purpose; after it, nothing should.
    await page.goto("/?nointro");
    await hydrated(page);
    await page.waitForTimeout(1500);
    const frames = await page.evaluate(async () => {
      let n = 0;
      const orig = window.requestAnimationFrame;
      window.requestAnimationFrame = (cb) => {
        n++;
        return orig(cb);
      };
      await new Promise((r) => setTimeout(r, 1500));
      window.requestAnimationFrame = orig;
      return n;
    });
    expect(frames).toBe(0);
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the homepage names every project and links to every case study", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("#work .ps-sd-name")).toHaveText(ORDER);
    const hrefs = await page.locator("#work .ps-sd-btn").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
    expect(hrefs).toEqual(["/work/atlas", "/work/nexus", "/work/extendspace", "/work/reflux", "/work/layers-by-rsx", "/work/bhatkal-time-luxe"]);
    await expect(page.locator("#work .ps-scene")).toBeVisible(); // the prerendered scene
    await page.locator('#work .ps-sd-btn[data-slug="nexus"]').click();
    await expect(page).toHaveURL(/\/work\/nexus$/);
    await expect(page.locator("h1")).toHaveText("Nexus");
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the detail view opens without movement", async ({ page }) => {
    await page.goto("/");
    await hydrated(page);
    await page.evaluate(() => {
      const w = window as unknown as { __animated: string[] };
      w.__animated = [];
      const orig = HTMLDialogElement.prototype.animate;
      HTMLDialogElement.prototype.animate = function (keyframes, options) {
        const first = Array.isArray(keyframes) ? keyframes[0] : keyframes;
        w.__animated.push(...Object.keys(first ?? {}));
        return orig.call(this, keyframes, options);
      };
    });
    await page.locator('.ps-sd-btn[data-slug="nexus"]').click();
    await expect(page.locator("#work .ps-scene").first()).toHaveAttribute("data-scene", "nexus");
    await expect(page.locator("#work .ps-scene.leaving")).toHaveCount(0); // the scene swaps at once
    await page.locator("#ps-explore").click();
    await detailOpen(page, "Nexus");
    const props = await page.evaluate(() => (window as unknown as { __animated: string[] }).__animated);
    expect(props).toEqual([]);
  });
});

test.describe("project space on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("the chip row selects, and the detail view has a reachable close button", async ({ page }) => {
    await page.goto("/");
    await hydrated(page);
    const chip = page.locator('.ps-sd-btn[data-slug="layers-by-rsx"]');
    await chip.scrollIntoViewIfNeeded();
    await chip.tap();
    await expect(selected(page)).toHaveText("Layers by RSX");
    await page.locator("#ps-explore").tap();
    await detailOpen(page, "Layers by RSX");
    const b = (await page.locator(".ps-dt-close").boundingBox())!;
    expect(b.height).toBeGreaterThanOrEqual(44);
    expect(b.x + b.width).toBeLessThanOrEqual(390);
    await page.locator(".ps-dt-close").tap();
    await detailClosed(page);
  });
});

test.describe("case studies @core", () => {
  test("previous and next cycle through the six, and Projects returns to the selection", async ({ page }) => {
    await page.goto("/work/atlas");
    const nav = page.getByRole("navigation", { name: "Other case studies" });
    await nav.getByRole("link", { name: /Next/ }).click();
    await expect(page).toHaveURL(/\/work\/nexus$/);
    await expect(page.locator("h1")).toHaveText("Nexus");
    await nav.getByRole("link", { name: /Previous/ }).click();
    await nav.getByRole("link", { name: /Previous/ }).click();
    await expect(page).toHaveURL(/\/work\/bhatkal-time-luxe$/);
    await nav.getByRole("link", { name: /Projects/ }).click();
    await expect(page).toHaveURL(/\/\?project=bhatkal-time-luxe#work$/);
    await expect(selected(page)).toHaveText("Bhatkal Time Luxe");
    await expect(page.locator("#work")).toBeInViewport();
  });
});
