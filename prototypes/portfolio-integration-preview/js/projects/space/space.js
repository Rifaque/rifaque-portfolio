/*
 * Concept D: Project Space. Concept A's persistent sidebar and three-column
 * composition, with Concept B's device-aware stage in the centre.
 *
 *   sidebar (choose)  |  stage (the project where it runs)  |  info (who, what, status)
 *
 * The page carries only what is needed to choose: name, one or two
 * sentences, my part and status. "Explore" opens a focused overlay with the
 * larger media, highlights, attribution, limits and links.
 *
 * The stage is a small CSS 3D scene per project (scenes.js for what is
 * shown, stage3d.js for geometry, rotation and transitions). Devices that
 * belong together turn as one group; idle scenes never move. Screens show a
 * real capture or plainly labelled text, never an imitation interface.
 *
 * URL: ?project=<slug> and &open=1, both pushed, so Back closes the overlay
 * and then steps back through earlier selections.
 *
 * Portfolio integration preview: copied from
 * prototypes/projects-redesign/project-space/space.js and placed in
 * Projection's page as its Projects section (#work). Changes: no concept
 * header (Projection's header, theme and sound are the page's own); buttons
 * use Projection's primary style; a close cue; and selectProject() lets the
 * rest of the page (About, Bill of materials) open a project here.
 */
import { STATUS_GLYPH } from "../shared/content.js";
import { illustration } from "../shared/illustrations.js";
import { $, $$, esc, reduced, status, cue, alsoBuiltHTML } from "../shared/shell.js";
import { sound } from "../../sound.js";
import { projects, alsoBuilt, caseStudy, caseStudyD } from "./data.js";
import { SCENES, tag } from "./scenes.js";
import { mount, watch } from "./stage3d.js";

const P = Object.fromEntries(projects.map((p) => [p.slug, p]));
const side = $("#side");
const stage = $("#stage");
const info = $("#info");
const dialog = $("#detail");
const panel = $("#dt-panel");
let current = null;
let turn = null;

/* ---------------------------------------------------------------- atoms */
const glyph = (p) => `<svg class="glyph" viewBox="0 0 12 12" aria-hidden="true" data-stage="${p.stage}">${STATUS_GLYPH[p.stage]}</svg>`;
const img = (m) => `<img src="${m.src}" width="${m.w}" height="${m.h}" alt="${esc(m.alt)}" decoding="async">`;
const ill = (p, m) => illustration(m.id, m.alt);
const capHTML = (items) => items.map(([k, text]) => `<span>${k ? tag(k) : ""}${esc(text)}</span>`).join("");

/* ---------------------------------------------------------------- stage */
// Built once: the scene host, the supporting strip, the caption and the view controls.
stage.innerHTML = `<div class="stage3" id="stage3"></div>
  <div class="scene-aside" id="aside"></div>
  <div class="scene-foot">
    <p class="scene-cap" id="cap"></p>
    <button type="button" class="view-reset" id="turn-reset"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4.6 10a5.4 5.4 0 1 0 1.7-3.9"/><path d="M4 4.5v3.6h3.6"/></svg><span class="vr-text">Reset view</span></button>
  </div>`;
const host = $("#stage3");
watch();
host.addEventListener("turn", (e) => { if (e.target.closest(".scene:not(.leaving)")) stage.dataset.turned = e.target.dataset.turned; });

function showScene(p, animate) {
  const s = SCENES[p.slug](p);
  turn = mount(host, p.slug, `${p.title}: devices and media, a 3D view`, s, { animate });
  const aside = $("#aside"), cap = $("#cap");
  aside.innerHTML = s.aside ?? "";
  aside.hidden = !s.aside;
  cap.innerHTML = capHTML(s.cap);
  for (const el of [aside, cap]) {
    el.getAnimations().forEach((a) => a.cancel());
    if (animate) el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, delay: 380, easing: "ease-out", fill: "backwards" });
  }
  if (animate) $$(".pipe li, .road li", aside).forEach((li, i) => li.animate([{ opacity: 0, translate: "-6px 0" }, { opacity: 1, translate: "0 0" }], { duration: 240, delay: 420 + i * 50, easing: "ease-out", fill: "backwards" }));
}

// Reset view is shown only once the scene has been turned. It hides itself as it
// resets, so focus moves to the scene rather than being lost.
$("#turn-reset").addEventListener("click", () => {
  turn?.reset();
  $(".scene:not(.leaving)", host)?.focus({ preventScroll: true });
});

/* ---------------------------------------------------------------- chip row */
// Fade an edge of the scrolling chip row only while more chips lie beyond it.
function fades() {
  side.classList.toggle("more-l", side.scrollLeft > 2);
  side.classList.toggle("more-r", side.scrollLeft + side.clientWidth < side.scrollWidth - 2);
}
/** Centre the selected chip in the row. Only the row scrolls, never the page. */
function centreChip(behavior = "auto") {
  const el = $('.sd-btn[aria-current="true"]', side);
  if (el && side.scrollWidth > side.clientWidth) {
    const chip = el.getBoundingClientRect(), row = side.getBoundingClientRect();
    side.scrollTo({ left: side.scrollLeft + chip.left - row.left - (side.clientWidth - chip.width) / 2, behavior });
  }
  fades();
}
side.addEventListener("scroll", fades, { passive: true });
addEventListener("resize", () => centreChip());
// Chip widths change when the web fonts arrive; centre again then.
document.fonts?.ready.then(() => centreChip());

/* ---------------------------------------------------------------- render */
function renderSide() {
  side.innerHTML = projects
    .map((p) => `${p.hubzero ? '<li class="sd-group" aria-hidden="true">With HubZero</li>' : ""}<li><button type="button" class="sd-btn" data-slug="${p.slug}" aria-controls="info">
      <span class="sd-name">${esc(p.title)}${glyph(p)}</span><span class="sd-line">${esc(p.line.replace(/^Client project · HubZero$/, "Client project, HubZero"))}</span></button></li>`)
    .join("");
}

function infoHTML(p) {
  return `<div class="in-a">
      <p class="in-line">${esc(p.hubzero ? "With HubZero · client work" : p.line)}</p>
      <h3 class="in-title">${esc(p.title)}</h3>
      ${status(p)}
      <p class="in-blurb">${esc(p.blurb)}</p>
    </div>
    <div class="in-b">
      <p class="in-part"><b>My part</b>${esc(p.part)}</p>
      <p class="in-runs">Runs on ${esc(p.platforms.join(", "))}</p>
      <button type="button" class="btn btn-primary in-cta" id="explore" aria-haspopup="dialog">Explore project<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg></button>
    </div>`;
}

function select(slug, { push = true, announce = true } = {}) {
  if (!P[slug] || slug === current) return;
  const first = current === null;
  current = slug;
  const p = P[slug];
  const animate = !first && !reduced();
  $$(".sd-btn", side).forEach((b) => b.setAttribute("aria-current", String(b.dataset.slug === slug)));
  centreChip(animate ? "smooth" : "auto");
  if (push) history.pushState({ slug }, "", url(slug, false));
  // Text changes at once; only a short fade marks it.
  info.innerHTML = infoHTML(p);
  info.getAnimations().forEach((a) => a.cancel());
  if (animate) info.animate([{ opacity: 0.25 }, { opacity: 1 }], { duration: 220, easing: "ease-out" });
  showScene(p, animate);
  if (!first) cue();
  if (announce) $("#announce").textContent = `${p.title} selected.`;
}

/* ---------------------------------------------------------------- detail */
function gallery(p) {
  if (p.slug === "layers") return [p.tablet, ...p.media];
  return p.media;
}

function figure(p, m) {
  const body = m.kind === "illustration" ? ill(p, m) : img(m);
  // The tag already says "Illustration"; the caption need not repeat it.
  return `${body}<figcaption>${tag(m.kind)}<span>${esc(m.caption.replace(/^Illustration, not a screenshot\. /, ""))}</span></figcaption>`;
}

function detailHTML(p) {
  const items = gallery(p);
  const thumbs = items.length > 1
    ? `<div class="dt-thumbs" role="group" aria-label="${esc(p.title)} media">${items
        .map((m, i) => `<button type="button" class="th" data-i="${i}" aria-pressed="${i === 0}" aria-label="Show ${esc(m.caption.replace(/\.$/, ""))}">${m.kind === "illustration" ? "Illustration" : `<img src="${m.src}" alt="" loading="lazy">`}</button>`)
        .join("")}</div>`
    : "";
  const studio = p.studio
    ? `<div class="studio"><b>Layers Studio ${tag("planned")}</b><p>A browser editor, specified but not built: no Studio source exists yet, so there is nothing to show. It is planned to offer:</p><ul class="works">${p.studio.map((s) => `<li>${esc(s)}</li>`).join("")}</ul></div>`
    : "";
  const part = p.split
    ? `<dl class="split">${p.split.map(([a, b]) => `<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join("")}</dl>`
    : `<p>${esc(p.contribution)}</p>`;
  // One primary action (the full case study); the project's own links are secondary.
  const links = p.evidence
    .filter((e) => e[2] && !(p.slug === "reflux" && e[0] === "repo"))
    .map(([, l, h]) => `<a class="btn btn-small" href="${h}" data-sound="press">${esc(l.replace(/ \(.*\)$/, ""))}</a>`);
  return `<header class="dt-head">
      <div class="dt-id"><h2 id="dt-title">${esc(p.title)}</h2><p class="in-line">${esc(p.line)}</p></div>
      <button type="button" class="icon-btn square dt-close" id="dt-close" aria-label="Close ${esc(p.title)} details" title="Close (Esc)"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15"/></svg></button>
    </header>
    <section class="dt-media" aria-labelledby="dt-ev"><h3 class="dt-label" id="dt-ev">Evidence</h3><figure class="dt-fig" id="dt-fig">${figure(p, items[0])}</figure>${thumbs}${p.liveNote ? `<p class="dt-note">${esc(p.liveNote)}</p>` : ""}${studio}</section>
    <div class="dt-text">
      <section class="dt-sec dt-lead" aria-label="Summary">${status(p)}<p class="dt-sum">${esc(p.purpose)}</p>
        <a class="btn btn-primary dt-cta" href="${caseStudyD(p.slug)}" data-sound="open">Read the case study<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg></a></section>
      <section class="dt-sec" aria-labelledby="dt-part"><h3 id="dt-part">My part</h3>${part}<p class="dt-note">${esc(p.owner)}</p></section>
      <section class="dt-sec" aria-labelledby="dt-facts"><h3 id="dt-facts">Facts</h3>
        <dl class="facts"><dt>Runs on</dt><dd>${esc(p.platforms.join(", "))}</dd><dt>Period</dt><dd>${esc(p.period)}</dd><dt>Licence</dt><dd>${esc(p.licence)}</dd></dl></section>
      <section class="dt-sec" aria-labelledby="dt-hl"><h3 id="dt-hl">Highlights</h3><dl class="hl">${p.highlights.map(([a, b]) => `<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join("")}</dl></section>
      <section class="dt-sec" aria-labelledby="dt-lim"><h3 id="dt-lim">Limits</h3>
        <p class="limits">${esc(p.limits)}</p>${p.missing.length ? `<p class="limits">${p.missing.map(esc).join(" ")}</p>` : ""}</section>
      ${links.length ? `<section class="dt-sec" aria-labelledby="dt-links"><h3 id="dt-links">Links</h3><div class="dt-links">${links.join("")}</div></section>` : ""}
    </div>`;
}

function openDetail({ push = true } = {}) {
  if (dialog.open) return;
  const p = P[current];
  panel.innerHTML = detailHTML(p);
  dialog.scrollTop = 0;
  dialog.showModal();
  $("#dt-close").focus();
  if (push) history.pushState({ slug: current, open: true }, "", url(current, true));
  if (!reduced()) dialog.animate([{ opacity: 0, translate: "0 18px" }, { opacity: 1, translate: "0 0" }], { duration: 280, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
  cue(660);
}

function closeDetail({ fromHistory = false } = {}) {
  if (!dialog.open) return;
  // If this page pushed the open state, step back so Forward can reopen it.
  if (!fromHistory && history.state?.open) return history.back();
  if (!fromHistory) history.replaceState({ slug: current }, "", url(current, false));
  sound.play("close");
  dialog.close();
}
dialog.addEventListener("close", () => {
  // Closed some other way (the browser can force-close on repeated Esc): keep the URL honest.
  if (fromURL().open) history.state?.open ? history.back() : history.replaceState({ slug: current }, "", url(current, false));
  $("#explore")?.focus();
});
dialog.addEventListener("cancel", (e) => { e.preventDefault(); closeDetail(); });
dialog.addEventListener("click", (e) => {
  if (e.target === dialog || e.target.closest("#dt-close")) return closeDetail();
  const th = e.target.closest(".th");
  if (!th) return;
  const p = P[current];
  $("#dt-fig").innerHTML = figure(p, gallery(p)[Number(th.dataset.i)]);
  $$(".th", dialog).forEach((b) => b.setAttribute("aria-pressed", String(b === th)));
});

/* ---------------------------------------------------------------- url */
function url(slug, open) {
  const q = new URLSearchParams(location.search);
  q.set("project", slug);
  if (open) q.set("open", "1"); else q.delete("open");
  return `?${q}`;
}
function fromURL() {
  const q = new URLSearchParams(location.search);
  const slug = P[q.get("project")] ? q.get("project") : projects[0].slug;
  return { slug, open: q.get("open") === "1" };
}
addEventListener("popstate", () => {
  const s = fromURL();
  if (!s.open && dialog.open) closeDetail({ fromHistory: true });
  select(s.slug, { push: false });
  if (s.open && !dialog.open) openDetail({ push: false });
});

/* ---------------------------------------------------------------- wiring */
renderSide();
$("#also").innerHTML = alsoBuiltHTML(alsoBuilt, caseStudy);

side.addEventListener("click", (e) => {
  const b = e.target.closest(".sd-btn");
  if (b) select(b.dataset.slug);
});
// Arrow keys move through the list (up/down on the sidebar, left/right on the chip row).
side.addEventListener("keydown", (e) => {
  const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1, Home: "first", End: "last" };
  if (!(e.key in keys)) return;
  const btns = $$(".sd-btn", side);
  const i = btns.indexOf(document.activeElement);
  if (i < 0) return;
  e.preventDefault();
  const k = keys[e.key];
  const next = btns[k === "first" ? 0 : k === "last" ? btns.length - 1 : (i + k + btns.length) % btns.length];
  next.focus();
  next.scrollIntoView({ block: "nearest", inline: "nearest" });
  select(next.dataset.slug);
});
info.addEventListener("click", (e) => { if (e.target.closest("#explore")) openDetail(); });

const start = fromURL();
select(start.slug, { push: false, announce: false });
if (start.open) openDetail({ push: false });

/** Whether a slug is one of the six featured projects shown here. */
export const featured = (slug) => !!P[slug];
/**
 * Select a project from elsewhere on the page (About, Bill of materials),
 * bring the section into view and put focus on its entry in the list.
 */
export function selectProject(slug) {
  if (!P[slug]) return false;
  select(slug);
  $("#work").scrollIntoView({ behavior: reduced() ? "auto" : "smooth" });
  setTimeout(() => $(`.sd-btn[data-slug="${slug}"]`, side)?.focus({ preventScroll: true }), reduced() ? 0 : 450);
  return true;
}
