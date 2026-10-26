import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import App from "./App";
import { headHTML } from "./lib/head";
import { notFoundRoute, routeFor, routes, redirects } from "./content/routes";

/** Build-time renderer used by scripts/prerender.mjs. */
export function render(url: string) {
  const route = url === notFoundRoute.path ? notFoundRoute : routeFor(url);
  const html = renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  );
  return { html, head: headHTML(route), env: route.env };
}

export { routes, notFoundRoute, redirects };
export { site } from "./content/site";
