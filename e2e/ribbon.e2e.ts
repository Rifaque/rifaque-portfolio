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

const NAMES = ["Nexus", "Atlas", "Reflux", "ExtendSpace"];
const LEAD = 0.65;

async function openLab(page: Page) {
  await page.goto("/lab");
  await page.waitForFunction(() => document.documentElement.classList.contains("motion-ready"));
}

const geometry = (page: Page) =>
  page.evaluate(() => {
    const track = document.querySelector<HTMLElement>(".ribbon-track")!;
    const stage = document.querySelector<HTMLElement>(".ribbon-stage")!;
    return { top: track.getBoundingClientRect().top + scrollY, len: track.offsetHeight - stage.clientHeight };
  });

/** Scrolls so card `i` (fractional: between cards) sits at the focus, and waits for the controller's frame. */
async function focusCard(page: Page, i: number) {
  const g = await geometry(page);
  const y = g.top + ((i + LEAD) / (NAMES.length - 1 + 2 * LEAD)) * g.len;
  await page.evaluate((top) => scrollTo({ top, behavior: "instant" }), y);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
}

const activeState = (page: Page) =>
  page.evaluate(() => {
    const active = document.querySelector<HTMLElement>(".ribbon-card[data-active]");
    const stage = document.querySelector<HTMLElement>(".ribbon-stage")!.getBoundingClientRect();
    if (!active) return null;
    const box = active.getBoundingClientRect();
    const m = new DOMMatrix(getComputedStyle(active).transform);
    return {
      name: active.querySelector("h3")!.textContent,
      centreOffset: box.left + box.width / 2 - (stage.left + stage.width / 2),
      scale: Math.hypot(m.m11, m.m12, m.m13),
      tilt: Math.max(Math.abs(m.m13), Math.abs(m.m31), Math.abs(m.m12)),
      opacity: getComputedStyle(active).opacity,
      counter: document.querySelector(".ribbon-counter span")!.textContent,
    };
  });

test.describe("desktop", () => {
  test("scrolling carries each project to the focus in order, flat and readable", async ({ page }) => {
    await openLab(page);
    await expect(page.locator(".ribbon-stage")).toHaveAttribute("data-live", "");
    await expect(page.locator(".ribbon-title")).toHaveText(NAMES);
    for (let i = 0; i < NAMES.length; i++) {
      await focusCard(page, i);
      const s = await activeState(page);
      expect(s, `card ${i}`).toMatchObject({ name: NAMES[i], opacity: "1", counter: String(i + 1).padStart(2, "0") });
      expect(Math.abs(s!.centreOffset)).toBeLessThan(2);
      expect(s!.scale).toBeCloseTo(1, 3);
      expect(s!.tilt).toBeLessThan(1e-3);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    }
  });

  test("links, statuses and reading order are the real ones", async ({ page }) => {
    await openLab(page);
    const cards = page.locator(".ribbon-card");
    await expect(cards).toHaveCount(4);
    const statuses = ["Private alpha · active development", "v1.0.3 released · not in active development", "Pre-release · source-available, not open source", "In development · Connect still disabled"];
    for (let i = 0; i < 4; i++) {
      const link = cards.nth(i).getByRole("link");
      await expect(link).toHaveAccessibleName(`Read the ${NAMES[i]} case study`);
      await expect(link).toHaveAttribute("href", `/work/${NAMES[i].toLowerCase()}`);
      await expect(cards.nth(i).locator(".status")).toHaveText(statuses[i]);
    }
  });

  test("focusing a link brings its card to the focus without moving focus again", async ({ page }) => {
    await openLab(page);
    await focusCard(page, 0);
    const link = page.getByRole("link", { name: "Read the Reflux case study" }).last();
    await link.focus();
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    expect((await activeState(page))!.name).toBe("Reflux");
    await expect(link).toBeFocused();

    // Scrolling on changes the active card but never steals focus.
    await focusCard(page, 3);
    expect((await activeState(page))!.name).toBe("ExtendSpace");
    await expect(link).toBeFocused();
  });

  test("a receded card's link can be clicked where it is", async ({ page }) => {
    await openLab(page);
    await focusCard(page, 1);
    const link = page.getByRole("link", { name: "Read the Nexus case study" }).last();
    const box = (await link.boundingBox())!;
    expect(box.x + box.width / 2).toBeGreaterThan(720);
    expect(box.y + box.height / 2).toBeLessThan(900);
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await expect(page).toHaveURL(/\/work\/nexus$/);
  });

  test("a resize recalculates the path and keeps the same card in view", async ({ page }) => {
    await openLab(page);
    await focusCard(page, 2);
    await page.setViewportSize({ width: 1280, height: 760 });
    await expect.poll(async () => (await activeState(page))?.name).toBe("Reflux");
    await expect.poll(async () => Math.abs((await activeState(page))!.centreOffset)).toBeLessThan(2);
  });

  test("resizing below 1200×680 hands over to the static list, and back", async ({ page }) => {
    await openLab(page);
    await focusCard(page, 1);
    await page.setViewportSize({ width: 1180, height: 820 });
    await expect(page.locator(".ribbon-stage")).not.toHaveAttribute("data-live", "");
    const inline = await page.locator(".ribbon-card").evaluateAll((els) => els.map((el) => (el as HTMLElement).style.cssText));
    expect(inline).toEqual(["--i: 0;", "--i: 1;", "--i: 2;", "--i: 3;"]);
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator(".ribbon-stage")).toHaveAttribute("data-live", "");
  });

  test("handoffs: one card at the focus, nothing over the active card", async ({ page }) => {
    await openLab(page);
    await focusCard(page, 0);
    const focal = await page.locator(".ribbon-card[data-active]").evaluate((el) => el.getBoundingClientRect().toJSON());
    for (let k = 0; k < NAMES.length - 1; k++) {
      for (const x of [0.2, 0.35, 0.5, 0.65, 0.8]) {
        await focusCard(page, k + x);
        const s = await page.evaluate((f) => {
          const hit = (a: DOMRect, b: DOMRect | typeof f) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
          const cards = [...document.querySelectorAll<HTMLElement>(".ribbon-card")].map((el) => {
            const m = new DOMMatrix(getComputedStyle(el).transform);
            return {
              el,
              box: el.getBoundingClientRect(),
              visible: Number(getComputedStyle(el).opacity) > 0,
              scale: Math.hypot(m.m11, m.m12, m.m13),
            };
          });
          const active = cards.find((c) => c.el.hasAttribute("data-active"))!;
          return {
            inFocus: cards.filter((c) => c.visible && hit(c.box, f)).length,
            onActive: cards.filter((c) => c !== active && c.visible && hit(c.box, active.box)).length,
            // Near natural size and in the focal box: the dominant card.
            dominant: cards.filter((c) => c.visible && c.scale > 0.95 && hit(c.box, f)).length,
          };
        }, focal);
        const where = `between ${NAMES[k]} and ${NAMES[k + 1]} at ${x}`;
        expect(s.inFocus, where).toBeLessThanOrEqual(1);
        expect(s.onActive, where).toBe(0);
        expect(s.dominant, where).toBeLessThanOrEqual(1);
      }
    }
  });

  test("text keeps its contrast against what is actually drawn behind it, in every pose", async ({ page }) => {
    await openLab(page);
    const ratios: { ratio: number; what: string }[] = [];
    // Resting, quarter and mid handoff poses, plus the first and last frames.
    const indices = [-LEAD, 0, 0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 3 + LEAD];
    for (const index of indices) {
      await focusCard(page, index);
      // 1. Each text element's colour and sample points, with the text visible.
      const texts = await page.evaluate(() => {
        const out: { card: number; label: string; color: string; surface: string | null; points: [number, number][] }[] = [];
        document.querySelectorAll<HTMLElement>(".ribbon-card").forEach((card, ci) => {
          if (getComputedStyle(card).opacity !== "1") return;
          const sel = ".kicker, .kicker-index, .ribbon-title, .status, .ribbon-question, .ribbon-limit, .ribbon-limit .tag, .ribbon-link, figcaption";
          card.querySelectorAll<HTMLElement>(sel).forEach((el) => {
            for (const r of el.getClientRects()) {
              const pts: [number, number][] = [];
              for (const fx of [0.2, 0.5, 0.8]) for (const fy of [0.25, 0.75]) pts.push([r.left + r.width * fx, r.top + r.height * fy]);
              const onScreen = pts.filter(([x, y]) => x >= 0 && y >= 0 && x < innerWidth && y < innerHeight);
              // A turned card's box is wider than its outline: keep the points
              // that land on this text itself. Any that land on another card
              // mean the text is covered.
              const own: [number, number][] = [];
              for (const [x, y] of onScreen) {
                const top = document.elementFromPoint(x, y);
                const other = top?.closest(".ribbon-card");
                if (other && other !== card) throw new Error(`${el.className} of card ${ci} is covered by card ${other.getAttribute("data-index")}`);
                if (top && el.contains(top)) own.push([x, y]);
              }
              // Copy text sits straight on the card's surface; the caption on its own chip.
              const surface = el.closest("figcaption") ? null : getComputedStyle(card.querySelector(".ribbon-article")!).backgroundColor;
              if (own.length) out.push({ card: ci, label: el.className || el.tagName, color: getComputedStyle(el).color, surface, points: own });
            }
          });
        });
        return out;
      });
      // 2. The rendered background at those points, with all text made transparent.
      await page.addStyleTag({ content: ".ribbon-card *{color:transparent!important;-webkit-text-fill-color:transparent!important;text-decoration-color:transparent!important;transition:none!important} .ribbon-card svg{visibility:hidden!important}", });
      const shot = (await page.screenshot()).toString("base64");
      const result = await page.evaluate(
        async ({ shot, texts }) => {
          const img = new Image();
          img.src = `data:image/png;base64,${shot}`;
          await img.decode();
          const c = document.createElement("canvas");
          c.width = img.width;
          c.height = img.height;
          const g = c.getContext("2d")!;
          g.drawImage(img, 0, 0);
          const scale = img.width / innerWidth;
          const lin = (v: number) => ((v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
          const lum = ([r, g, b]: number[]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
          return texts.map((t) => {
            const [r, gg, b, a = 1] = t.color.match(/[\d.]+/g)!.map(Number);
            let worst = Infinity;
            let drift = 0;
            const surface = t.surface?.match(/[\d.]+/g)!.map(Number);
            for (const [x, y] of t.points) {
              const [br, bg, bb] = g.getImageData(Math.floor(x * scale), Math.floor(y * scale), 1, 1).data;
              // Nothing (shade, overlay, another card) is drawn between the text and its surface.
              if (surface) drift = Math.max(drift, Math.abs(br - surface[0]), Math.abs(bg - surface[1]), Math.abs(bb - surface[2]));
              const fg = [r * a + br * (1 - a), gg * a + bg * (1 - a), b * a + bb * (1 - a)];
              const [l1, l2] = [lum(fg), lum([br, bg, bb])].sort((m, n) => n - m);
              worst = Math.min(worst, (l1 + 0.05) / (l2 + 0.05));
            }
            return { ...t, worst, drift };
          });
        },
        { shot, texts },
      );
      await page.evaluate(() => document.querySelectorAll("style").forEach((s) => s.textContent?.startsWith(".ribbon-card *{color:transparent") && s.remove()));
      for (const r of result) {
        expect(r.worst, `${NAMES[r.card]} ${r.label} at index ${index}`).toBeGreaterThanOrEqual(4.5);
        expect(r.drift, `surface behind ${NAMES[r.card]} ${r.label} at index ${index}`).toBeLessThanOrEqual(3);
        ratios.push({ ratio: r.worst, what: `${NAMES[r.card]} ${r.label} at index ${index}` });
      }
    }
    // Every card was measured, including receded ones.
    expect(ratios.length).toBeGreaterThan(100);
    const worst = ratios.reduce((a, b) => (b.ratio < a.ratio ? b : a));
    test.info().annotations.push({ type: "contrast", description: `${ratios.length} text runs; lowest ${worst.ratio.toFixed(2)}:1 (${worst.what})` });
  });

  test("leaving /lab removes the ribbon's listeners and observers", async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __scroll: number; __ro: number };
      w.__scroll = 0;
      w.__ro = 0;
      const add = window.addEventListener.bind(window);
      const remove = window.removeEventListener.bind(window);
      window.addEventListener = ((type: string, fn: EventListener, opts?: unknown) => {
        if (type === "scroll") w.__scroll++;
        return add(type, fn, opts as AddEventListenerOptions);
      }) as typeof window.addEventListener;
      window.removeEventListener = ((type: string, fn: EventListener, opts?: unknown) => {
        if (type === "scroll") w.__scroll--;
        return remove(type, fn, opts as EventListenerOptions);
      }) as typeof window.removeEventListener;
      const RO = window.ResizeObserver;
      window.ResizeObserver = class extends RO {
        constructor(cb: ResizeObserverCallback) {
          super(cb);
          w.__ro++;
        }
        disconnect() {
          w.__ro--;
          super.disconnect();
        }
      };
    });
    const counts = () => page.evaluate(() => ({ scroll: (window as never)["__scroll"], ro: (window as never)["__ro"] }));

    await page.goto("/archive");
    await page.waitForFunction(() => document.documentElement.classList.contains("motion-ready"));
    const baseline = await counts();

    await openLab(page);
    await expect(page.locator(".ribbon-stage")).toHaveAttribute("data-live", "");
    const onLab = await counts();
    expect(onLab.ro).toBeGreaterThan(baseline.ro);

    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Archive" }).click();
    await expect(page).toHaveURL(/\/archive$/);
    expect(await counts()).toEqual(baseline);
    // Scrolling after leaving runs no stale ribbon work.
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(100);
  });
});

test.describe("phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("the same projects are a static list with working links", async ({ page }) => {
    await openLab(page);
    await expect(page.locator(".ribbon-stage")).not.toHaveAttribute("data-live", "");
    expect(await page.locator(".ribbon-stage").evaluate((el) => getComputedStyle(el).position)).toBe("static");
    expect(await page.locator(".ribbon-path").evaluate((el) => getComputedStyle(el).display)).toBe("none");
    for (const name of NAMES) {
      const link = page.getByRole("link", { name: `Read the ${name} case study` }).last();
      await link.scrollIntoViewIfNeeded();
      await expect(link).toBeVisible();
    }
    const transforms = await page.locator(".ribbon-card").evaluateAll((els) => els.map((el) => getComputedStyle(el).transform));
    expect(new Set(transforms)).toEqual(new Set(["none"]));
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  });
});

for (const [width, height] of [
  [1200, 680],
  [1440, 900],
  [1920, 1080],
]) {
  test.describe(`${width}×${height} resting poses`, () => {
    test.use({ viewport: { width, height } });

    test("every card on view at a resting position is wholly on stage", async ({ page }) => {
      await openLab(page);
      await expect(page.locator(".ribbon-stage")).toHaveAttribute("data-live", "");
      for (let i = 0; i < NAMES.length; i++) {
        await focusCard(page, i);
        const out = await page.evaluate(() =>
          [...document.querySelectorAll<HTMLElement>(".ribbon-card")]
            .filter((el) => Number(getComputedStyle(el).opacity) > 0)
            .map((el) => {
              const b = el.getBoundingClientRect();
              return { name: el.querySelector("h3")!.textContent, left: b.left, top: b.top, right: innerWidth - b.right, bottom: innerHeight - b.bottom };
            }),
        );
        // The active card and both neighbours, each with its real rendered height.
        expect(out.length, `at ${NAMES[i]}`).toBe(i === 0 || i === NAMES.length - 1 ? 2 : 3);
        for (const c of out) {
          for (const side of ["left", "top", "right", "bottom"] as const) {
            expect(c[side], `${c.name} ${side} edge at ${NAMES[i]}`).toBeGreaterThanOrEqual(8);
          }
        }
      }
    });
  });
}

for (const [width, height] of [
  [1024, 660],
  [1180, 820],
  [1440, 660],
]) {
  test.describe(`${width}×${height}`, () => {
    test.use({ viewport: { width, height } });

    test("is below the pinned ribbon's size: every project in the static list", async ({ page }) => {
      await openLab(page);
      await expect(page.locator(".ribbon-stage")).not.toHaveAttribute("data-live", "");
      expect(await page.locator(".ribbon-stage").evaluate((el) => getComputedStyle(el).position)).toBe("static");
      const cards = page.locator(".ribbon-card");
      for (let i = 0; i < NAMES.length; i++) {
        await expect(cards.nth(i).locator(".status")).toBeVisible();
        const link = cards.nth(i).getByRole("link", { name: `Read the ${NAMES[i]} case study` });
        await link.scrollIntoViewIfNeeded();
        await expect(link).toBeVisible();
      }
      const state = await cards.evaluateAll((els) => els.map((el) => getComputedStyle(el).transform + getComputedStyle(el).opacity));
      expect(new Set(state)).toEqual(new Set(["none1"]));
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    });
  });
}

test("reduced motion gives a static, readable list with no travel", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openLab(page);
  await expect(page.locator(".ribbon-stage")).not.toHaveAttribute("data-live", "");
  const state = await page.locator(".ribbon-card").evaluateAll((els) =>
    els.map((el) => ({ t: getComputedStyle(el).transform, o: getComputedStyle(el).opacity, inline: (el as HTMLElement).style.transform })),
  );
  for (const s of state) expect(s).toEqual({ t: "none", o: "1", inline: "" });
  await page.mouse.wheel(0, 3000);
  await page.waitForTimeout(100);
  expect(await page.locator(".ribbon-card").first().evaluate((el) => (el as HTMLElement).style.transform)).toBe("");
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the ribbon is a readable list", async ({ page }) => {
    await page.goto("/lab");
    await expect(page.locator(".ribbon-title")).toHaveText(NAMES);
    for (const name of NAMES) await expect(page.getByRole("link", { name: `Read the ${name} case study` }).last()).toBeAttached();
    const opacities = await page.locator(".ribbon-card").evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity));
    expect(opacities).toEqual(["1", "1", "1", "1"]);
    expect(await page.locator(".ribbon-stage").evaluate((el) => getComputedStyle(el).position)).toBe("static");
  });
});
