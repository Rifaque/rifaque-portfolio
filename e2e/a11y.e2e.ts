import { createRequire } from "node:module";
import { expect, test, type Page } from "@playwright/test";

const axePath = createRequire(import.meta.url).resolve("axe-core/axe.min.js");

type AxeResult = { violations: { id: string; impact: string; nodes: { target: string[] }[] }[] };

async function axe(page: Page) {
  await page.addScriptTag({ path: axePath });
  return page.evaluate(
    () =>
      (window as unknown as { axe: { run: (ctx: Document, opts: object) => Promise<AxeResult> } }).axe.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] },
      }),
  );
}

const pages = ["/", "/work/nexus", "/work/atlas", "/work/bhatkal-time-luxe", "/archive", "/lab?layout=pinned", "/nope-xyz"];

for (const [label, viewport] of [
  ["desktop", { width: 1440, height: 900 }],
  ["phone", { width: 390, height: 844 }],
] as const) {
  test.describe(`${label}`, () => {
    test.use({ viewport });
    for (const path of pages) {
      test(`axe finds no WCAG A/AA violations on ${path}`, async ({ page }) => {
        await page.goto(path);
        await page.waitForFunction(() => history.scrollRestoration === "manual");
        await page.evaluate(() => document.fonts.ready);
        // Contrast is measured on settled pages, not mid-fade.
        await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== "running"));
        const { violations } = await axe(page);
        const summary = violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
        expect(summary).toEqual([]);
      });
    }
  });
}

test("no rendered element uses the retired accent colour", async ({ page }) => {
  for (const path of ["/", "/work/extendspace", "/archive"]) {
    await page.goto(path);
    const hits = await page.evaluate(() => {
      const blue = "rgb(58, 190, 255)";
      const props = ["color", "backgroundColor", "borderTopColor", "outlineColor", "fill", "stroke", "textDecorationColor"] as const;
      return [...document.querySelectorAll("*")]
        .filter((el) => {
          const cs = getComputedStyle(el);
          return props.some((p) => cs[p].includes(blue));
        })
        .map((el) => el.tagName + (el.className ? `.${String(el.className)}` : ""));
    });
    expect(hits, path).toEqual([]);
  }
});

test("every status shows its text with a stage glyph; the HubZero role is neutral", async ({ page }) => {
  await page.goto("/");
  const badges = await page.locator(".status").evaluateAll((els) =>
    els.map((el) => ({
      stage: el.getAttribute("data-stage"),
      text: el.textContent?.trim(),
      glyphHidden: el.querySelector("svg.glyph")?.getAttribute("aria-hidden"),
      visible: (el as HTMLElement).offsetParent !== null,
    })),
  );
  expect(badges.length).toBeGreaterThanOrEqual(10);
  for (const b of badges) {
    expect(b.text, JSON.stringify(b)).toBeTruthy();
    expect(b.glyphHidden).toBe("true");
    expect(b.stage).toMatch(/^(released|pre-release|in-development|private-alpha|delivered|retired|role)$/);
  }
  const hub = badges.find((b) => b.text?.startsWith("Co-founder & Software Engineer"));
  expect(hub?.stage).toBe("role");
});
