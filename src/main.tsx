import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles/fonts.css";
import "@fontsource-variable/geist-mono/wght.css";
import "./index.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/work.css";
import "./styles/pages.css";
import "./styles/motion.css";
import { AppRoutes } from "./AppRoutes";
import { preloadLab } from "./labRoute";
import { ScrollManager } from "./components/motion/ScrollManager";
import { MotionRoot } from "./components/motion/MotionRoot";

const root = document.getElementById("root")!;
const app = (
  <StrictMode>
    <BrowserRouter>
      <ScrollManager />
      <MotionRoot />
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>
);

// Production pages arrive prerendered (scripts/prerender.mjs); attach to
// that markup. The dev server serves an empty root, so render from scratch.
const start = () => {
  if (root.firstElementChild) hydrateRoot(root, app);
  else createRoot(root).render(app);
};
// A direct visit to the lazy /lab route hydrates once its chunk is in (it is
// preloaded in lab.html), matching its prerendered HTML, which has no Suspense
// boundary (labRoute.ts); the prerendered page is on screen meanwhile.
if (root.firstElementChild && /^\/lab\/?$/.test(location.pathname)) preloadLab().then(start, start);
else start();
