import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { AppRoutes } from "./AppRoutes";
import { renderHead } from "./lib/head";
import { notFoundRoute, redirects, routes } from "./content/routes";
import { site } from "./content/site";

/** Used only at build time by scripts/prerender.mjs. */
export function render(url: string) {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <AppRoutes />
      </StaticRouter>
    </StrictMode>,
  );
}

export { renderHead, routes, notFoundRoute, redirects, site };
