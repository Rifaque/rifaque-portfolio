/*
 * Concept B: Interactive Project Space.
 *
 * The space is a workbench of the devices the projects actually run on. In
 * the overview each device's screen lists its projects, so the arrangement
 * itself says where each piece of software lives (and multi-platform
 * projects visibly appear on several devices). Choosing a project brings its
 * device or devices forward and puts its evidence on their screens:
 *   Atlas, Nexus -> desktop; ExtendSpace -> desktop and tablet, linked by USB;
 *   Reflux -> desktop, tablet and phone; Layers -> phone; BTL -> browser.
 * Screens show a real capture, a labelled illustration, or an explicit
 * "no capture published" state; nothing imitates an interface.
 *
 * Narrow screens get a plain list and the same detail, without devices.
 * URL: ?project=<slug>, pushed, so Back returns to the overview.
 */
import { projects, alsoBuilt, KIND, caseStudy, STATUS_GLYPH } from "../shared/content.js";
import { illustration } from "../shared/illustrations.js";
import { $, $$, esc, reduced, status, mediaTag, header, cue, alsoBuiltHTML } from "../shared/shell.js";

header("Concept B · Interactive Project Space", "b");

const P = Object.fromEntries(projects.map((p) => [p.slug, p]));
const DEVICES = [
  { id: "desktop", kind: "monitor", label: "Windows desktop", items: [["atlas", ""], ["nexus", ""], ["extendspace", "host"], ["reflux", "desktop"]] },
  { id: "tablet", kind: "tablet", label: "Android tablet", items: [["extendspace", "companion"], ["reflux", "tablet and TV"]] },
  { id: "phone", kind: "phone", label: "Android phone", items: [["layers", ""], ["reflux", "phone"]] },
  { id: "web", kind: "browser", label: "Web · client work with HubZero", items: [["bhatkal-time-luxe", ""]] },
];
const FOCUS = { atlas: ["desktop"], nexus: ["desktop"], extendspace: ["desktop", "tablet"], reflux: ["desktop", "tablet", "phone"], layers: ["phone"], "bhatkal-time-luxe": ["web"] };

const space = $("#space");
const stage = $("#stage");
const detail = $("#detail");
let current = null;
let layersPage = 0;

/* ---------------------------------------------------------------- screens */
const img = (m) => `<img src="${m.src}" width="${m.w}" height="${m.h}" alt="${esc(m.alt)}" decoding="async">`;
const label = (m, extra = "") => `<p class="scr-tag">${mediaTag(m, KIND)}${extra ? `<span>${esc(extra)}</span>` : ""}</p>`;
const none = (text) => `<div class="scr-none"><p><b>No capture published</b></p><p>${esc(text)}</p></div>`;

function focusScreen(slug, dev) {
  const p = P[slug];
  if (slug === "atlas") return `<div class="scr-media">${img(p.media[0])}</div>${label(p.media[0], "Atlas 1.0, Ask view")}`;
  if (slug === "nexus") return `<div class="scr-media scr-ill">${illustration("nexus", p.media[0].alt)}</div>${label(p.media[0], "No published interface")}`;
  if (slug === "extendspace" && dev === "desktop") return `<div class="scr-media scr-ill">${illustration("extendspace", p.media[1].alt)}</div>${label(p.media[1], "Host pipeline")}`;
  if (slug === "extendspace" && dev === "tablet") return `<div class="scr-media">${img(p.media[0])}</div>${label(p.media[0], "Debug build only")}`;
  if (slug === "reflux" && dev === "desktop") return `<div class="scr-media scr-ill">${illustration("reflux", p.media[0].alt)}</div>${label(p.media[0], "Media model")}`;
  if (slug === "reflux") return none(dev === "tablet" ? "Android and Android TV builds, verified mainly on emulators." : "Android phone build, verified mainly on emulators.");
  if (slug === "layers") {
    const m = p.media[layersPage];
    return `<div class="scr-media">${img(m)}</div>
      <div class="scr-pager"><button class="pg" type="button" data-pg="-1" aria-label="Previous widget page">‹</button><span>${layersPage + 1} of ${p.media.length}</span><button class="pg" type="button" data-pg="1" aria-label="Next widget page">›</button></div>
      ${label(m, "Android emulator")}`;
  }
  if (slug === "bhatkal-time-luxe") return `<div class="scr-media">${img(p.media[0])}</div>${label(p.media[0], "Delivered 2025 interface")}`;
  return "";
}

function menu(dev) {
  return `<div class="scr-menu"><p class="menu-h">Runs here</p>${dev.items
    .map(([slug, role], i) => {
      const p = P[slug];
      // A project listed on several devices is focusable once, from its first device.
      const primary = DEVICES.find((d) => d.items.some(([s]) => s === slug)).id === dev.id;
      return `<button type="button" class="menu-item" data-slug="${slug}"${primary ? "" : ' tabindex="-1"'}>
        <span class="mi-name">${esc(p.short ?? p.title)}</span>${role ? `<span class="mi-role">${esc(role)}</span>` : ""}
        <svg class="glyph" viewBox="0 0 12 12" aria-hidden="true" data-stage="${p.stage}">${STATUS_GLYPH[p.stage]}</svg></button>`;
    })
    .join("")}</div>`;
}

function renderStage() {
  stage.innerHTML = DEVICES.map((d) => `
    <div class="dev dev-${d.kind}${d.id === "web" ? " dev-hz" : ""}${current && !FOCUS[current].includes(d.id) ? " is-out" : ""}" data-dev="${d.id}">
      ${d.id === "web" ? '<p class="hz-label">With HubZero</p>' : ""}
      <div class="dev-body">${d.kind === "browser" ? '<div class="dev-chrome" aria-hidden="true"><i></i><i></i><i></i></div>' : ""}<div class="dev-screen">${current && FOCUS[current].includes(d.id) ? focusScreen(current, d.id) : menu(d)}</div></div>
      <p class="dev-label">${esc(d.label)}</p>
    </div>`).join("") + '<div class="link-usb" aria-hidden="true"><span>USB</span></div><p class="link-work" aria-hidden="true">One work, several devices</p>';
}

function detailHTML(p) {
  const shown = FOCUS[p.slug];
  const links = [`<a class="btn btn-solid" href="${caseStudy(p.slug)}">Case study</a>`, ...p.evidence.filter((e) => e[2]).map(([, l, h]) => `<a class="btn" href="${h}">${esc(l.replace(/ \(.*\)$/, ""))}</a>`)].join("");
  // On narrow screens the media appears here, without device frames.
  const flat = p.media.map((m) => `<figure class="flat">${m.kind === "illustration" ? illustration(m.id, m.alt) : img(m)}<figcaption>${mediaTag(m, KIND)}<span>${esc(m.caption)}</span></figcaption></figure>`).join("");
  return `<p class="d-line">${esc(p.line)}</p>
    <h3 class="d-title" tabindex="-1">${esc(p.title)}</h3>
    ${status(p)}
    <p class="d-purpose">${esc(p.purpose)}</p>
    <div class="d-flat">${flat}</div>
    <dl class="facts"><dt>Owner</dt><dd>${esc(p.owner)}</dd><dt>My part</dt><dd>${esc(p.contribution)}</dd><dt>Runs on</dt><dd>${esc(p.platforms.join(", "))}</dd><dt>Licence</dt><dd>${esc(p.licence)}</dd></dl>
    <ul class="works">${p.works.map((w) => `<li>${esc(w)}</li>`).join("")}</ul>
    <p class="limits">${esc(p.limits)}</p>
    ${p.missing.length ? `<p class="d-missing"><b>Not shown:</b> ${p.missing.map(esc).join(" ")}</p>` : ""}
    <p class="d-shown">On screen: ${shown.map((d) => DEVICES.find((x) => x.id === d).label.split(" ·")[0]).join(", ")}.</p>
    <div class="d-links">${links}</div>`;
}

/* ---------------------------------------------------------------- views */
function flip(change) {
  const before = new Map($$(".dev", stage).map((d) => [d.dataset.dev, d.getBoundingClientRect()]));
  change();
  if (reduced()) return;
  for (const d of $$(".dev", stage)) {
    if (getComputedStyle(d).display === "none") continue;
    const a = before.get(d.dataset.dev);
    const b = d.getBoundingClientRect();
    if (!a || !b.width) continue;
    const sx = a.width / b.width, sy = a.height / b.height;
    d.animate(
      [{ transformOrigin: "0 0", transform: `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${sx}, ${sy})` }, { transformOrigin: "0 0", transform: "none" }],
      { duration: 520, easing: "cubic-bezier(0.77, 0, 0.175, 1)" },
    );
    d.querySelector(".dev-screen")?.animate([{ opacity: 0 }, { opacity: 0 }, { opacity: 1 }], { duration: 520, easing: "ease-out" });
  }
}

function show(slug, { push = true, focus = true } = {}) {
  if (slug && !P[slug]) slug = null;
  const prev = current;
  flip(() => {
    current = slug;
    layersPage = 0;
    space.dataset.view = slug ? "focus" : "overview";
    space.dataset.project = slug ?? "";
    renderStage();
    $("#bar").hidden = !slug;
    detail.hidden = !slug;
    if (slug) detail.innerHTML = detailHTML(P[slug]);
    $$("#switch .sw").forEach((b) => (b.dataset.slug === slug ? b.setAttribute("aria-current", "true") : b.removeAttribute("aria-current")));
    $$("#list .li-btn").forEach((b) => b.setAttribute("aria-expanded", String(b.dataset.slug === slug)));
  });
  if (push) {
    history.pushState({ slug }, "", slug ? `?project=${slug}` : location.pathname);
  }
  if (slug && slug !== prev) cue();
  if (focus) {
    if (slug) $(".d-title", detail)?.focus({ preventScroll: true });
    else if (prev) $(`.menu-item[data-slug="${prev}"]:not([tabindex="-1"])`, stage)?.focus({ preventScroll: true });
  }
  if (slug && matchMedia("(max-width: 760px)").matches) detail.scrollIntoView({ block: "start", behavior: reduced() ? "auto" : "smooth" });
}

/* ---------------------------------------------------------------- wiring */
$("#switch").innerHTML = projects.map((p) => `<button type="button" class="sw" data-slug="${p.slug}">${esc(p.short ?? p.title)}</button>`).join("");
$("#list").innerHTML = projects
  .map((p) => `${p.hubzero ? '<li class="li-group" aria-hidden="true">With HubZero</li>' : ""}<li><button type="button" class="li-btn" data-slug="${p.slug}" aria-expanded="false" aria-controls="detail"><span class="li-name">${esc(p.title)}</span><span class="li-meta">${esc(p.platforms.join(" · "))}</span>${status(p)}</button></li>`)
  .join("");
$("#also").innerHTML = alsoBuiltHTML(alsoBuilt, caseStudy);

document.addEventListener("click", (e) => {
  const t = e.target.closest(".menu-item, .sw, .li-btn");
  if (t) return show(t.dataset.slug === current && t.classList.contains("li-btn") ? null : t.dataset.slug);
  const pg = e.target.closest(".pg");
  if (pg && current === "layers") {
    layersPage = (layersPage + Number(pg.dataset.pg) + P.layers.media.length) % P.layers.media.length;
    $('.dev[data-dev="phone"] .dev-screen', stage).innerHTML = focusScreen("layers", "phone");
    $(`.pg[data-pg="${pg.dataset.pg}"]`, stage)?.focus();
  }
});
$("#back").addEventListener("click", () => show(null));
addEventListener("keydown", (e) => { if (e.key === "Escape" && current) show(null); });
addEventListener("popstate", () => show(new URLSearchParams(location.search).get("project"), { push: false, focus: false }));

renderStage();
const initial = new URLSearchParams(location.search).get("project");
if (initial) show(initial, { push: false, focus: false });
