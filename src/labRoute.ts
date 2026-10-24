import { lazy } from "react";

/*
 * The review-only /lab route, in its own chunk so production pages never
 * load it.
 *
 * A page rendered while its module is already loaded needs no Suspense
 * boundary, and should not have one: React hydrates a server-rendered
 * boundary in a later pass than the page around it, after html.motion-ready
 * is set (MotionRoot), so the lab's reveal effects would run late and
 * on-screen content would fade in. So the prerender (entry-server.tsx) and a
 * direct visit (main.tsx) load the module first and render it without one;
 * only a client-side navigation before the chunk has ever loaded suspends
 * (AppRoutes.tsx).
 */

type LabModule = typeof import("./lab/LabPage");
let labModule: LabModule | null = null;

const loadLab = () =>
  import("./lab/LabPage").then((m) => {
    labModule = m;
    return m;
  });

/** Loads the lab chunk ahead of rendering. */
export async function preloadLab() {
  await loadLab();
}

/** Whether the lab can render without suspending. */
export const labLoaded = () => labModule !== null;

/** The lab page. Once its module is loaded it is handed over synchronously, so React does not suspend. */
export const LabPage = lazy(() => {
  const loaded = labModule;
  if (!loaded) return loadLab();
  // React's lazy() accepts any thenable; one that resolves synchronously
  // means the page renders (or hydrates) without suspending.
  return { then: (resolve: (m: LabModule) => void) => resolve(loaded) } as unknown as Promise<LabModule>;
});
