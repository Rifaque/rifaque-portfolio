/*
 * Case-study prototypes for Concept D. Each page is static HTML with its own
 * writing; this module fills in what is shared with Project Space so nothing
 * drifts: status, real media (paths, alt text, labels), diagrams, links and
 * the interactive 3D objects, which reuse the Projects scenes and the same
 * stage3d.js rotation and device components.
 *
 *   <div class="cs-3d" data-scene="atlas"></div>             the whole linked scene
 *   <div class="cs-3d" data-scene="bhatkal-time-luxe" data-only="phone" data-w="26" data-ar="1 / 1.1"></div>
 *   <figure class="cs-fig" data-media="atlas 0"></figure>      a real capture, labelled
 *   <figure class="cs-fig" data-dia="atlas-retrieval" data-cap="…"></figure>  an illustration
 */
import { $, $$, esc, header, status } from "../../shared/shell.js";
import { projects, caseStudyD } from "../data.js";
import { SCENES, tag } from "../scenes.js";
import { mount, watch } from "../stage3d.js";
import { diagram } from "./diagrams.js";

const P = Object.fromEntries(projects.map((p) => [p.slug, p]));
const slug = document.body.dataset.project;
const p = P[slug];
const home = new URL("../../", location.href); // project-space/

/* ---------------------------------------------------------------- header */
header("Concept D · Case study", "d");
// The shared header writes its links for pages one level below projects-redesign/.
for (const a of $$(".site-head a[href]")) a.href = new URL(a.getAttribute("href"), home).href;
$("#theme-btn").insertAdjacentHTML("beforebegin", `<a href="${home.href}">D</a>`);

/* ---------------------------------------------------------------- facts from data */
for (const el of $$("[data-status]")) el.innerHTML = status(p);
for (const el of $$("[data-back]")) el.href = `${home.href}?project=${slug}`;

/* ---------------------------------------------------------------- media and diagrams */
const caption = (kind, text) => `<figcaption>${tag(kind)}<span>${esc(text)}</span></figcaption>`;
for (const fig of $$("[data-media]")) {
  const [s, key] = fig.dataset.media.split(" ");
  const m = key === "tablet" ? P[s].tablet : P[s].media[Number(key)];
  fig.innerHTML = `<img src="${m.src}" width="${m.w}" height="${m.h}" alt="${esc(m.alt)}" loading="lazy" decoding="async">${caption(m.kind, fig.dataset.cap ?? m.caption)}`;
  if (m.h > m.w) fig.classList.add("is-tall");
}
for (const fig of $$("[data-dia]")) {
  fig.innerHTML = `<div class="cs-dia">${diagram(fig.dataset.dia)}</div>${caption("illustration", fig.dataset.cap ?? "")}`;
}
// A diagram box that scrolls sideways (narrow screens) must be reachable by keyboard.
const scrollers = () => {
  for (const box of $$(".cs-dia")) {
    if (box.scrollWidth > box.clientWidth + 1) {
      box.tabIndex = 0;
      box.setAttribute("role", "region");
      box.setAttribute("aria-label", `${box.querySelector("svg")?.getAttribute("aria-label") ?? "Diagram"} Scrolls sideways.`);
    } else { box.removeAttribute("tabindex"); box.removeAttribute("role"); box.removeAttribute("aria-label"); }
  }
};
scrollers();
addEventListener("resize", scrollers);

/* ---------------------------------------------------------------- 3D objects */
watch();
$$(".cs-3d").forEach((el) => {
  const sp = P[el.dataset.scene];
  const full = SCENES[el.dataset.scene](sp);
  let s = full;
  if (el.dataset.only) {
    // One object from the scene, centred on its own stage.
    const d = full.devices.find((x) => x.id === el.dataset.only);
    const w = Number(el.dataset.w ?? 40);
    // The page states what kind of evidence the object carries (data-kind).
    const kind = el.dataset.kind ?? (d.real ? "screenshot" : "illustration");
    s = { view: [-6, -22], devices: [{ ...d, at: [0, 0, 0, w], phone: [0, 0, 0, Number(el.dataset.pw ?? Math.min(80, w * 1.4))], ry: 0, origin: undefined, label: undefined }], cap: [[kind, el.dataset.cap ?? ""]] };
  }
  const label = `${sp.title}: ${el.dataset.label ?? "a 3D view"}`;
  el.innerHTML = `<div class="stage3"${el.dataset.ar ? ` style="--sar: ${el.dataset.ar}"` : ""}></div>
    ${!el.dataset.only && s.aside ? `<div class="scene-aside">${s.aside}</div>` : ""}
    <div class="scene-foot"><p class="scene-cap">${s.cap.map(([k, t]) => `<span>${k ? tag(k) : ""}${esc(t)}</span>`).join("")}</p>
      <button type="button" class="view-reset cs-reset"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4.6 10a5.4 5.4 0 1 0 1.7-3.9"/><path d="M4 4.5v3.6h3.6"/></svg><span class="vr-text">Reset view</span></button></div>`;
  // Reset view appears only once this object has been turned.
  el.addEventListener("turn", (e) => { el.dataset.turned = e.target.dataset.turned; });
  const turn = mount($(".stage3", el), el.dataset.scene, label, s, { animate: false });
  $(".cs-reset", el).addEventListener("click", () => { turn.reset(); $(".scene", el).focus({ preventScroll: true }); });
});

/* ---------------------------------------------------------------- links and neighbours */
for (const el of $$("[data-links]")) {
  const links = p.evidence.filter((e) => e[2] && !(el.dataset.skip ?? "").split(",").includes(e[0]));
  el.innerHTML = links.length
    ? links.map(([, l, h]) => `<a class="btn" href="${h}">${esc(l.replace(/ \(.*\)$/, ""))}</a>`).join("")
    : `<p class="cs-note">${esc(el.dataset.none ?? "No public links.")}</p>`;
}
const i = projects.findIndex((x) => x.slug === slug);
const prev = projects[(i + projects.length - 1) % projects.length], next = projects[(i + 1) % projects.length];
const nav = $("#cs-next");
if (nav) nav.innerHTML = `<a href="${caseStudyD(prev.slug)}"><small>Previous</small><b>${esc(prev.title)}</b></a>
  <a href="${home.href}?project=${slug}"><small>Back to</small><b>Project Space</b></a>
  <a href="${caseStudyD(next.slug)}"><small>Next</small><b>${esc(next.title)}</b></a>`;
