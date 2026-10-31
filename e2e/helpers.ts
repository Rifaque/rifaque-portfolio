import { expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

export const routes = [
  "/",
  "/work/nexus",
  "/work/atlas",
  "/work/reflux",
  "/work/extendspace",
  "/work/layers-by-rsx",
  "/work/bluetap",
  "/work/querycraft",
  "/work/bhatkal-time-luxe",
  "/about",
  "/archive",
];

/** Collects console errors and failed requests for a test. */
export function watch(page: Page) {
  const problems: string[] = [];
  page.on("console", (m) => {
    // The hero's WebGL scene draws on the test machine's software renderer, whose driver notes
    // (performance hints, implementation-defined filtering) are not page errors.
    if (m.type() === "warning" && /GL Driver Message|WebGL warning: .*implementation-defined/.test(m.text())) return;
    // Firefox reports the hero releasing its context on purpose when the home page is left.
    if (m.type() === "warning" && /WebGL context was lost..*three.min-/.test(m.text())) return;
    if (m.type() === "error" || m.type() === "warning") problems.push(`console.${m.type()}: ${m.text()}`);
  });
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("requestfailed", (r) => problems.push(`requestfailed: ${r.url()}`));
  page.on("response", (r) => {
    if (r.status() >= 400 && !r.url().endsWith("/nope")) problems.push(`http ${r.status()}: ${r.url()}`);
  });
  return problems;
}

export async function axe(page: Page, context: string | null = null) {
  // Never sample mid-animation: wait for running animations (bounded).
  await page.evaluate(() => Promise.race([Promise.all(document.getAnimations().map((a) => a.finished.catch(() => undefined))), new Promise((r) => setTimeout(r, 2000))]));
  await page.addScriptTag({ content: axeSource });
  const result = await page.evaluate(async (ctx) => {
    // @ts-expect-error injected global
    const r = await window.axe.run(ctx ?? document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] } });
    return r.violations.map((v: { id: string; impact: string; nodes: { target: string[] }[] }) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`);
  }, context);
  expect(result, result.join("\n")).toEqual([]);
}

/** The Project Space detail view is open and settled (open animation finished). */
export async function detailOpen(page: Page, title: string) {
  const d = page.locator("dialog.ps-detail");
  await expect(d).toHaveAttribute("open", "", { timeout: 10_000 });
  await expect(d.locator("#ps-dt-title")).toHaveText(title);
  await d.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished.catch(() => undefined))));
}

export async function detailClosed(page: Page) {
  await expect(page.locator("dialog.ps-detail")).not.toHaveAttribute("open", "");
}

/** The project currently selected in Project Space. */
export const selected = (page: Page) => page.locator('#work .ps-sd-btn[aria-current="true"] .ps-sd-name');

export const hydrated = (page: Page) => page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
