import { describe, expect, it } from "vitest";
import { createElement, lazy, Suspense } from "react";
import { render, renderComplete } from "./entry-server";

const Ok = () => createElement("p", null, "ready");
const Throws = (): never => {
  throw new Error("broken component");
};

describe("prerender renderer", () => {
  it("waits for lazy content instead of emitting the Suspense fallback", async () => {
    const Late = lazy(() => new Promise<{ default: typeof Ok }>((r) => setTimeout(() => r({ default: Ok }), 50)));
    const html = await renderComplete(createElement(Suspense, { fallback: createElement("i", null, "fallback") }, createElement(Late)), "lazy");
    expect(html).toContain("<p>ready</p>");
    expect(html).not.toContain("fallback");
  });

  it("rejects when a component inside a Suspense boundary throws (no client-rendered hole)", async () => {
    const page = createElement(Suspense, { fallback: null }, createElement(Throws));
    await expect(renderComplete(page, "inner error")).rejects.toThrow("broken component");
  });

  it("rejects when the shell itself throws", async () => {
    await expect(renderComplete(createElement(Throws), "shell error")).rejects.toThrow("broken component");
  });

  it("rejects instead of hanging when content never resolves", async () => {
    const Never = lazy(() => new Promise<{ default: typeof Ok }>(() => {}));
    const page = createElement(Suspense, { fallback: null }, createElement(Never));
    await expect(renderComplete(page, "/stuck", 200)).rejects.toThrow("prerender of /stuck did not finish within 200ms");
  });

  it("renders the lazy /lab route completely", async () => {
    const html = await render("/lab");
    expect(html).toContain("Selected work, isolated");
    expect(html).toContain('class="ribbon-stage"');
    expect(html).toContain("lab-motion-item");
    // Loaded before rendering, so inline: no Suspense boundary to hydrate later.
    expect(html).not.toContain("<!--$");
  });
});
