// Generator for public/gate/{dark,light}{,-tall}.webp, the loading gate's posters:
// the real hero scene on the gate's first frame, shown before any script has
// loaded. Wide posters serve landscape stages, tall ones portrait phones and tablets.
//
// Run it after any change to the scene. check-dist fails the build until you do,
// so a stale poster cannot ship. Ordinary builds never run it.
//
//   npm run build     (fails at check-dist if the posters are stale; dist is still written)
//   npm run posters
//   npm run build
//
// Uses Chromium's software renderer, so the result does not depend on the machine's GPU.
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import { sceneHash } from "./scene-hash.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 4175;
const SHAPES = { wide: { width: 2000, height: 1250 }, tall: { width: 1200, height: 2000 } }; // GATE.posters in src/hero/hero.js
await mkdir(join(root, "public", "gate"), { recursive: true });
const server = spawn(process.execPath, [join(root, "scripts", "serve.mjs"), String(PORT)], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 800));
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
try {
  for (const theme of ["dark", "light"])
    for (const [shape, viewport] of Object.entries(SHAPES)) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    await page.addInitScript(([t, s]) => {
      localStorage.setItem("rsx-theme", t);
      window.__gateHold = true;
      window.__gateShape = s;
    }, [theme, shape]);
    // The poster is framed on the whole picture, centred; the page shifts it into place.
    await page.route("**/gate/*.webp", (r) => r.abort());
    await page.goto(`http://127.0.0.1:${PORT}/`);
    await page.addStyleTag({ content: ".top, .hero-grid, main > :not(.hero), footer { visibility: hidden; } #hero-stage { position: fixed; inset: 0; height: 100vh; --gate-cx: 0.5 !important; }" });
    await page.waitForSelector("#hero-stage .hero-canvas.is-ready", { timeout: 30000 });
    await page.waitForTimeout(600);
    const png = (await page.screenshot()).toString("base64");
    const webp = await page.evaluate(async (data) => {
      const image = new Image();
      image.src = `data:image/png;base64,${data}`;
      await image.decode();
      const c = document.createElement("canvas");
      c.width = image.naturalWidth;
      c.height = image.naturalHeight;
      c.getContext("2d", { alpha: false }).drawImage(image, 0, 0);
      return c.toDataURL("image/webp", 0.86).split(",")[1];
    }, png);
    const name = `${theme}${shape === "tall" ? "-tall" : ""}.webp`;
    await writeFile(join(root, "public", "gate", name), Buffer.from(webp, "base64"));
    console.log(`wrote public/gate/${name} (${Math.round((webp.length * 0.75) / 1024)} KB)`);
    await context.close();
  }
  await writeFile(join(root, "src", "hero", "gate-posters.json"), `${JSON.stringify({ scene: await sceneHash() }, null, 2)}\n`);
} finally {
  await browser.close();
  server.kill();
}
