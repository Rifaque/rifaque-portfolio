import { expect, test, type Page } from "@playwright/test";
import { hydrated } from "./helpers";

/*
 * The sound system stays off under automation unless ?sound=test, so these
 * tests ask for it and count the oscillators the real cues start.
 */
async function spy(page: Page, stored?: string) {
  await page.addInitScript((value) => {
    const key = "rsx-sound-seeded";
    if (value !== undefined && !sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      localStorage.setItem("rsx-sound", value);
    }
    const w = window as unknown as { __cues: number };
    w.__cues = 0;
    const start = OscillatorNode.prototype.start;
    OscillatorNode.prototype.start = function (...args) {
      w.__cues++;
      return start.apply(this, args);
    };
  }, stored);
}
const cues = (page: Page) => page.evaluate(() => (window as unknown as { __cues: number }).__cues);
const stored = (page: Page) => page.evaluate(() => localStorage.getItem("rsx-sound"));
const toggle = (page: Page) => page.locator("#sound-switch");
const open = async (page: Page) => {
  await page.goto("/?sound=test");
  await hydrated(page);
};
/** Selecting a project plays a cue; the first gesture also starts the audio context. */
async function act(page: Page) {
  await page.locator('.ps-sd-btn[data-slug="nexus"]').click();
  await page.waitForTimeout(150);
  await page.locator('.ps-sd-btn[data-slug="reflux"]').click();
  await page.waitForTimeout(150);
  await page.locator('.ps-sd-btn[data-slug="atlas"]').click();
  await page.waitForTimeout(150);
}

test.describe("sound preference @core", () => {
  // Without Web Audio (WebKit's Windows build) sound stays off and the switch says so.
  test.beforeEach(async ({ page }) => {
    await page.goto("/404");
    test.skip(!(await page.evaluate(() => "AudioContext" in window || "webkitAudioContext" in window)), "no Web Audio in this browser build");
  });

  test("a fresh visitor has sound on, plays nothing on load and stores nothing", async ({ page }) => {
    await spy(page);
    await open(page);
    await expect(toggle(page)).toHaveAttribute("data-on", "true");
    await expect(toggle(page)).toHaveAccessibleName("Mute sound");
    expect(await cues(page)).toBe(0);
    expect(await stored(page)).toBeNull();
    await act(page);
    expect(await cues(page)).toBeGreaterThan(0);
    expect(await stored(page)).toBeNull();
  });

  test("a saved off stays off and is silent", async ({ page }) => {
    await spy(page, "off");
    await open(page);
    await expect(toggle(page)).toHaveAttribute("data-on", "false");
    await act(page);
    expect(await cues(page)).toBe(0);
    expect(await stored(page)).toBe("off");
  });

  test("a saved on stays on", async ({ page }) => {
    await spy(page, "on");
    await open(page);
    await expect(toggle(page)).toHaveAttribute("data-on", "true");
    await act(page);
    expect(await cues(page)).toBeGreaterThan(0);
  });

  test("an invalid saved value falls back to on and is left alone", async ({ page }) => {
    await spy(page, "loud");
    await open(page);
    await expect(toggle(page)).toHaveAttribute("data-on", "true");
    expect(await stored(page)).toBe("loud");
  });

  test("the switch changes real behaviour, and the choice survives a reload", async ({ page }) => {
    await spy(page);
    await open(page);
    await toggle(page).click();
    await expect(toggle(page)).toHaveAttribute("data-on", "false");
    expect(await stored(page)).toBe("off");
    const before = await cues(page);
    await act(page);
    expect(await cues(page)).toBe(before);
    await open(page); // selecting a project dropped ?sound=test from the URL
    await expect(toggle(page)).toHaveAttribute("data-on", "false");
    await toggle(page).click();
    await expect(toggle(page)).toHaveAttribute("data-on", "true");
    expect(await stored(page)).toBe("on");
    await page.waitForTimeout(150);
    const on = await cues(page);
    await act(page);
    expect(await cues(page)).toBeGreaterThan(on);
  });
});
