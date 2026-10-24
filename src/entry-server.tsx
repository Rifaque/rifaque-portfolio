import { StrictMode, type ReactNode } from "react";
import { renderToPipeableStream } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { Writable } from "node:stream";
import { AppRoutes } from "./AppRoutes";
import { preloadLab } from "./labRoute";
import { renderHead } from "./lib/head";
import { notFoundRoute, redirects, routes } from "./content/routes";
import { site } from "./content/site";

/** A render that has not finished by now has hung: fail the build. */
const TIMEOUT_MS = 10_000;

/**
 * Used only at build time by scripts/prerender.mjs. The lazy lab route is
 * loaded first, so it renders inline, without a Suspense boundary, exactly as
 * a direct visit hydrates it (labRoute.ts).
 */
export async function render(url: string): Promise<string> {
  await preloadLab();
  return renderComplete(
    <StrictMode>
      <StaticRouter location={url}>
        <AppRoutes />
      </StaticRouter>
    </StrictMode>,
    url,
  );
}

/**
 * Streams `node` and resolves with its HTML once everything has rendered,
 * lazy routes included (onAllReady), so the result is complete, never a
 * Suspense fallback. Any render error rejects, even one React could recover
 * from on the client: a prerendered page must not ship with a hole in it.
 * A render still pending after `timeoutMs` is aborted and rejects, so a
 * broken page fails the build instead of hanging it.
 */
export function renderComplete(node: ReactNode, label: string, timeoutMs = TIMEOUT_MS): Promise<string> {
  return new Promise((resolve, reject) => {
    let failed: Error | null = null;
    const chunks: Buffer[] = [];
    const sink = new Writable({
      write(chunk, _encoding, done) {
        chunks.push(Buffer.from(chunk));
        done();
      },
      final(done) {
        clearTimeout(timer);
        if (failed) reject(failed);
        else resolve(Buffer.concat(chunks).toString("utf8"));
        done();
      },
    });

    const stream = renderToPipeableStream(node, {
      onAllReady() {
        if (failed) {
          clearTimeout(timer);
          reject(failed);
          stream.abort();
        } else stream.pipe(sink);
      },
      onShellError(error) {
        clearTimeout(timer);
        reject(error);
      },
      onError(error) {
        failed ??= error instanceof Error ? error : new Error(String(error));
      },
    });

    const timer = setTimeout(() => {
      reject(new Error(`prerender of ${label} did not finish within ${timeoutMs}ms`));
      stream.abort();
    }, timeoutMs);
  });
}

export { renderHead, routes, notFoundRoute, redirects, site };
