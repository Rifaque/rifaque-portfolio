/*
 * A case-study page: work/<slug>/. It is a page of its own, so it works when
 * opened directly, refreshed, bookmarked or shared; arriving from the work
 * bench, the browser carries the drawing into this page's figure with a
 * cross-document View Transition where supported.
 *
 * Portfolio integration preview: this page now renders only the two "Also
 * built" case studies (QueryCraft, BlueTap); the six featured projects have
 * Project Space case studies. So the breadcrumb leads to Projects, and the
 * page links back to Projects and to the other Also built case study.
 */
import { projects, STATE_TEXT } from "./content.js";
import { illustration } from "./illustrations.js";
import { $, esc, status, initShell } from "./shell.js";
import { ALSO_SCENES, ALSO_AR } from "./projects/space/also-scenes.js";
import { tag as kindTag } from "./projects/space/scenes.js";
import { mount, watch } from "./projects/space/stage3d.js";

initShell();
const slug = document.documentElement.dataset.slug;
const n = projects.findIndex((p) => p.slug === slug);
const p = projects[n];
const ALSO = ["querycraft", "bluetap"];
const other = projects.find((x) => x.slug === ALSO.find((s) => s !== slug));
const home = "../../";

document.title = `${p.title} · Rifaque Akrami`;
$('meta[name="description"]').content = p.summary;

const f = p.face;
const fig = f.kind === "screenshot"
  ? `<img src="${f.src}" width="${f.w}" height="${f.h}" alt="${esc(f.alt)}" decoding="async">`
  : illustration(f.id, f.alt);
const tag = f.kind === "screenshot" ? '<span class="tag tag-shot">Screenshot</span>' : '<span class="tag">Illustration</span>';
const links = p.links.map((l) => `<a class="btn btn-small" href="${l.href}">${esc(l.label)}</a>`).join("");
const layer = ([name, note], i) => {
  const [st, why] = p.state[i];
  return `<li data-state="${st}"><span class="st-n" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span><div><b>${esc(name)}</b><span>${esc(note)}</span></div><span class="st-state"><i class="mark" data-state="${st}" aria-hidden="true"></i>${STATE_TEXT[st]}${why ? `<small>${esc(why)}</small>` : ""}</span></li>`;
};

$("#study").innerHTML = `
  <nav class="crumbs" aria-label="Breadcrumb"><a href="${home}#work">Projects</a><span aria-hidden="true">/</span><span aria-current="page">${esc(p.title)}</span></nav>
  <header class="st-head">
    <p class="st-kicker">${esc(p.kicker)}</p>
    <h1 class="st-title">${esc(p.title)}</h1>
    ${status(p)}
    ${p.question ? `<p class="st-q">${esc(p.question)}</p>` : ""}
    <dl class="st-meta"><div><dt>Period</dt><dd>${esc(p.period)}</dd></div><div><dt>Ownership</dt><dd>${esc(p.ownership)}</dd></div><div><dt>Licence</dt><dd>${esc(p.licence)}</dd></div></dl>
    ${p.credit ? `<p class="ro-credit">${esc(p.credit)}</p>` : ""}
  </header>
  <section class="cs-3d st-3d" aria-label="${esc(p.title)}, in 3D"></section>
  <figure class="st-fig"><div class="st-pic${f.w / f.h > 2 ? " is-wide" : ""}">${fig}</div><figcaption>${tag}<span>${esc(f.caption)}</span></figcaption></figure>
  <section class="st-cols"><h2>What it is</h2><div class="st-text"><p>${esc(p.summary)}</p>${p.why.map((w) => `<p>${esc(w)}</p>`).join("")}</div></section>
  <section class="st-cols"><h2>How it works</h2><div><ol class="st-layers">${p.path.map(layer).join("")}</ol>${p.pathNote ? `<p class="st-note">${esc(p.pathNote)}</p>` : ""}</div></section>
  <section class="st-cols"><h2>Decisions</h2><div class="st-dec">${p.decisions.map(([h, b]) => `<div><h3>${esc(h)}</h3><p>${esc(b)}</p></div>`).join("")}</div></section>
  <section class="st-cols"><h2>Where it stands</h2><div>
    ${p.ghosts.length ? `<ul class="st-ghosts">${p.ghosts.map(([name, st, why]) => `<li data-state="${st}"><i class="mark" data-state="${st}" aria-hidden="true"></i><b>${esc(name)}</b><span>${STATE_TEXT[st]}: ${esc(why)}</span></li>`).join("")}</ul>` : ""}
    <ul class="st-limits">${p.limits.map((l) => `<li>${esc(l)}</li>`).join("")}</ul></div></section>
  <section class="st-cols"><h2>Stack</h2><ul class="st-stack">${p.stack.map((s) => `<li>${esc(s)}</li>`).join("")}</ul></section>
  <section class="st-cols"><h2>Links</h2><div>${links ? `<div class="st-links">${links}</div>` : ""}${p.linksNote ? `<p class="st-note">${esc(p.linksNote)}</p>` : links ? "" : '<p class="st-note">No public links.</p>'}</div></section>
  <nav class="st-next" aria-label="Other case studies">
    <a href="${home}#work"><small>Back to</small>Projects</a>
    <a href="../${other.slug}/"><small>Also built</small>${esc(other.title)}</a>
  </nav>`;

/* ------------------------------------------------------------------ 3D object */
// Preview: the same stage as Project Space's case studies. Reset view appears
// once the object has been turned.
const host3d = $(".st-3d");
const scene = ALSO_SCENES[slug]?.();
if (host3d && scene) {
  watch();
  host3d.innerHTML = `<div class="stage3" style="--sar: ${ALSO_AR[slug]}"></div>
    <div class="scene-foot"><p class="scene-cap">${scene.cap.map(([k, t]) => `<span>${kindTag(k)}${esc(t)}</span>`).join("")}</p>
      <button type="button" class="view-reset cs-reset"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4.6 10a5.4 5.4 0 1 0 1.7-3.9"/><path d="M4 4.5v3.6h3.6"/></svg><span class="vr-text">Reset view</span></button></div>`;
  host3d.addEventListener("turn", (e) => { host3d.dataset.turned = e.target.dataset.turned; });
  const turn = mount($(".stage3", host3d), slug, `${p.title}: an illustration in 3D`, scene, { animate: false });
  $(".cs-reset", host3d).addEventListener("click", () => { turn.reset(); $(".scene", host3d).focus({ preventScroll: true }); });
} else host3d?.remove();
