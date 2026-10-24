import { site } from "../content/site";
import { canonicalFor, type RouteMeta } from "../content/routes";

/**
 * Head tags for a route, as data. The prerender step serialises them into
 * each page's HTML; on the client, RouteHead applies the same values after
 * in-app navigation, so the canonical never disagrees with the original HTML.
 */

type Tag =
  | { kind: "meta"; attr: "name" | "property"; key: string; content: string }
  | { kind: "link"; rel: string; href: string };

export function headTags(route: RouteMeta): Tag[] {
  const canonical = canonicalFor(route);
  const image = `${site.url}${site.ogImage}`;
  const tags: Tag[] = [
    { kind: "meta", attr: "name", key: "description", content: route.description },
    { kind: "meta", attr: "name", key: "robots", content: route.indexable ? "index, follow, max-image-preview:large" : "noindex, nofollow" },
    { kind: "meta", attr: "property", key: "og:type", content: route.ogType },
    { kind: "meta", attr: "property", key: "og:site_name", content: site.name },
    { kind: "meta", attr: "property", key: "og:locale", content: site.locale },
    { kind: "meta", attr: "property", key: "og:title", content: route.title },
    { kind: "meta", attr: "property", key: "og:description", content: route.description },
    { kind: "meta", attr: "property", key: "og:image", content: image },
    { kind: "meta", attr: "property", key: "og:image:width", content: "1200" },
    { kind: "meta", attr: "property", key: "og:image:height", content: "630" },
    { kind: "meta", attr: "property", key: "og:image:alt", content: site.ogImageAlt },
    { kind: "meta", attr: "name", key: "twitter:card", content: "summary_large_image" },
    { kind: "meta", attr: "name", key: "twitter:title", content: route.title },
    { kind: "meta", attr: "name", key: "twitter:description", content: route.description },
    { kind: "meta", attr: "name", key: "twitter:image", content: image },
  ];
  // A page that must not be indexed should not name a canonical either.
  if (route.indexable) {
    tags.push({ kind: "link", rel: "canonical", href: canonical });
    tags.push({ kind: "meta", attr: "property", key: "og:url", content: canonical });
  }
  return tags;
}

export function jsonLdFor(route: RouteMeta) {
  if (!route.jsonLd?.length) return null;
  return { "@context": "https://schema.org", "@graph": route.jsonLd };
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function renderHead(route: RouteMeta): string {
  const lines = [`<title>${esc(route.title)}</title>`];
  for (const t of headTags(route)) {
    lines.push(
      t.kind === "meta"
        ? `<meta ${t.attr}="${t.key}" content="${esc(t.content)}" data-head />`
        : `<link rel="${t.rel}" href="${esc(t.href)}" data-head />`,
    );
  }
  const ld = jsonLdFor(route);
  if (ld) {
    // "<" is escaped so the payload can never close its own script element.
    lines.push(`<script type="application/ld+json" data-head>${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>`);
  }
  return lines.join("\n    ");
}

/** Client-side counterpart of renderHead, for in-app navigation. */
export function applyHead(route: RouteMeta) {
  document.title = route.title;
  document.head.querySelectorAll("[data-head]").forEach((el) => el.remove());
  const frag = document.createDocumentFragment();
  for (const t of headTags(route)) {
    if (t.kind === "meta") {
      const m = document.createElement("meta");
      m.setAttribute(t.attr, t.key);
      m.content = t.content;
      m.dataset.head = "";
      frag.appendChild(m);
    } else {
      const l = document.createElement("link");
      l.rel = t.rel;
      l.href = t.href;
      l.dataset.head = "";
      frag.appendChild(l);
    }
  }
  const ld = jsonLdFor(route);
  if (ld) {
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(ld);
    s.dataset.head = "";
    frag.appendChild(s);
  }
  document.head.appendChild(frag);
}
