import { site } from "../content/site";
import { canonicalFor, type RouteMeta } from "../content/routes";

type Tag =
  | { kind: "meta"; attr: "name" | "property"; key: string; content: string }
  | { kind: "link"; rel: string; href: string };

/** Every per-page head tag, used by the prerender and by client-side navigation. */
export function headTags(route: RouteMeta): Tag[] {
  const canonical = canonicalFor(route);
  const image = site.url + site.ogImage;
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
  // A page that must not be indexed names no canonical.
  if (route.indexable) {
    tags.push({ kind: "link", rel: "canonical", href: canonical });
    tags.push({ kind: "meta", attr: "property", key: "og:url", content: canonical });
  }
  return tags;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function headHTML(route: RouteMeta): string {
  const lines = [`<title>${esc(route.title)}</title>`];
  for (const t of headTags(route)) {
    lines.push(t.kind === "meta" ? `<meta ${t.attr}="${t.key}" content="${esc(t.content)}" />` : `<link rel="${t.rel}" href="${esc(t.href)}" />`);
  }
  if (route.jsonLd?.length) {
    const json = JSON.stringify({ "@context": "https://schema.org", "@graph": route.jsonLd }).replace(/</g, "\\u003c");
    lines.push(`<script type="application/ld+json">${json}</script>`);
  }
  return lines.join("\n    ");
}

/** Client-side: keep the head in step with in-app navigation. */
export function applyHead(route: RouteMeta) {
  document.title = route.title;
  document.querySelectorAll("head [data-route-head]").forEach((n) => n.remove());
  document.head.querySelectorAll('script[type="application/ld+json"]').forEach((n) => n.remove());
  for (const t of headTags(route)) {
    const sel = t.kind === "meta" ? `meta[${t.attr}="${t.key}"]` : `link[rel="${t.rel}"]`;
    document.head.querySelectorAll(sel).forEach((n) => n.remove());
    const el = document.createElement(t.kind);
    if (t.kind === "meta") {
      el.setAttribute(t.attr, t.key);
      el.setAttribute("content", t.content);
    } else {
      el.setAttribute("rel", t.rel);
      el.setAttribute("href", t.href);
    }
    el.setAttribute("data-route-head", "");
    document.head.appendChild(el);
  }
  if (route.jsonLd?.length) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": route.jsonLd });
    script.dataset.routeHead = "";
    document.head.appendChild(script);
  }
  if (!route.indexable) document.head.querySelectorAll('link[rel="canonical"], meta[property="og:url"]').forEach((n) => n.remove());
}
