/*
 * Concept C: Technical Evidence Explorer.
 *
 * A compact manifest of the six projects, then one evidence surface: a
 * Product pane (what a person sees) beside an Engineering pane (what makes
 * it work). Numbered markers on the product side are linked to the stages
 * that implement them; selecting either side highlights the other. Each
 * project gets its own product treatment, built only from evidence that
 * exists, and an evidence ledger that says what is missing.
 *
 * Atlas hotspot regions were measured on the source screenshots (see
 * shared/content.js). URL: ?project=<slug>&part=<id>; projects push history,
 * parts replace it. On narrow screens a Product / Engineering switch replaces
 * the side-by-side layout; nothing depends on hover.
 */
import { projects, alsoBuilt, KIND, caseStudy, STATUS_GLYPH } from "../shared/content.js";
import { illustration } from "../shared/illustrations.js";
import { $, $$, esc, reduced, status, mediaTag, header, cue, alsoBuiltHTML } from "../shared/shell.js";

header("Concept C · Technical Evidence Explorer", "c");

const P = Object.fromEntries(projects.map((p) => [p.slug, p]));
const surface = $("#surface");
const state = { slug: null, part: null, atlasView: 0, layersPage: 0, nexusStep: 0, pane: "product" };
const pct = (v, t) => `${((v / t) * 100).toFixed(3)}%`;

/* Which engineering stages (indexes into project.path) each product part maps to. */
const LINKS = {
  atlas: { mode: [3], status: [1, 4], evidence: [3, 4], sources: [1, 2], context: [], index: [1], footer: [] },
  extendspace: { window: [0, 1], frame: [2, 3, 4] },
};
/* What the evidence ledger shows per project (kind, label, present?). */
const LEDGER = {
  atlas: [["Screenshot", "Ask view", true], ["Screenshot", "Workspaces (paths masked)", true], ["Release", "v1.0.3", true], ["Repository", "MIT", true]],
  nexus: [["Illustration", "Request path", true], ["Trace", "Documented example request", true], ["Interface", "No published capture", false], ["Repository", "Private", false]],
  extendspace: [["Debug capture", "Tablet, 13 Oct 2026", true], ["Illustration", "Pipeline", true], ["Test record", "One PC, one tablet", true], ["Repository", "Not linked (stale)", false]],
  reflux: [["Illustration", "Media model", true], ["Worked example", "Illustrative names", true], ["Interface", "No capture yet", false], ["Repository", "Public, proprietary, lags", true]],
  layers: [["Emulator capture", "Three launcher pages", true], ["Device capture", "Not yet", false], ["Repository", "Private", false]],
  "bhatkal-time-luxe": [["Screenshots", "Delivered 2025 interface", true], ["Contribution", "Who did what", true], ["Repository", "Not linked", false]],
};
/* Layers: the merged widget families visible on each emulator page. */
const LAYERS_PAGES = [["Clock", "Battery"], ["Music", "Clock"], ["Calendar/Date", "Countdown", "Shortcuts"]];

/* ---------------------------------------------------------------- manifest */
$("#manifest").innerHTML = projects
  .map((p) => {
    const have = LEDGER[p.slug].filter((l) => l[2]).map((l) => l[0]);
    return `${p.hubzero ? '<li class="mf-group" aria-hidden="true">With HubZero</li>' : ""}<li><a class="mf" href="?project=${p.slug}" data-slug="${p.slug}">
      <span class="mf-name">${esc(p.title)}</span>
      <span class="mf-status" data-stage="${p.stage}"><svg class="glyph" viewBox="0 0 12 12" aria-hidden="true">${STATUS_GLYPH[p.stage]}</svg>${esc(p.status.split(" · ")[0])}</span>
      <span class="mf-ev">${esc([...new Set(have)].slice(0, 3).join(" · "))}</span></a></li>`;
  })
  .join("");
$("#also").innerHTML = alsoBuiltHTML(alsoBuilt, caseStudy);

/* ---------------------------------------------------------------- product panes */
const marker = (id, n, box, w, h, label) =>
  `<button type="button" class="hs" data-part="${id}" aria-label="${n}: ${esc(label)}" style="left:${pct(box[0], w)};top:${pct(box[1], h)};width:${pct(box[2], w)};height:${pct(box[3], h)}"><span class="hs-n" aria-hidden="true">${n}</span></button>`;

function product(p) {
  if (p.slug === "atlas" || p.slug === "extendspace") {
    const m = p.slug === "atlas" ? p.media[state.atlasView] : p.media[0];
    const offset = p.slug === "atlas" && state.atlasView === 1 ? p.media[0].spots.length : 0;
    const tabs = p.slug === "atlas" ? `<div class="seg" role="group" aria-label="Screen">${p.media.map((x, i) => `<button type="button" class="seg-b" data-atlas="${i}" aria-pressed="${i === state.atlasView}">${i ? "Workspaces" : "Ask"}</button>`).join("")}</div>` : "";
    return `${tabs}<figure class="pp-fig"><div class="pp-shot"><img src="${m.src}" width="${m.w}" height="${m.h}" alt="${esc(m.alt)}" decoding="async">${m.spots.map((s, i) => marker(s.id, i + 1 + offset, s.box, m.w, m.h, s.ui)).join("")}</div>
      <figcaption>${mediaTag(m, KIND)}<span>${esc(m.caption)}</span></figcaption></figure>
      <ol class="parts">${m.spots.map((s, i) => `<li><button type="button" class="part" data-part="${s.id}"><span class="part-n">${i + 1 + offset}</span>${esc(s.ui)}</button></li>`).join("")}</ol>
      ${p.slug === "extendspace" ? `<figure class="pp-ill">${illustration("extendspace", p.media[1].alt)}<figcaption>${mediaTag(p.media[1], KIND)}<span>${esc(p.media[1].caption)}</span></figcaption></figure>` : ""}`;
  }
  if (p.slug === "nexus") {
    const t = p.trace;
    return `<div class="trace" aria-label="Governed-request trace">
      <p class="trace-h"><span class="tag">Trace</span> Based on documented behaviour; not a capture of the software.</p>
      <p class="trace-req">${esc(t.request)}</p>
      <ol class="trace-steps">${t.steps.map(([h, b], i) => `<li class="${i === state.nexusStep ? "is-on" : i < state.nexusStep ? "is-past" : ""}"><button type="button" class="tstep" data-step="${i}" aria-current="${i === state.nexusStep}"><b>${esc(h)}</b><span>${esc(b)}</span></button></li>`).join("")}</ol>
      <div class="trace-nav"><button type="button" class="btn" data-nx="-1">Previous step</button><button type="button" class="btn btn-solid" data-nx="1">Next step</button></div>
    </div>
    <figure class="pp-ill">${illustration("nexus", p.media[0].alt)}<figcaption>${mediaTag(p.media[0], KIND)}<span>${esc(p.media[0].caption)}</span></figcaption></figure>`;
  }
  if (p.slug === "reflux") {
    return `<div class="rx-ex">
      <p class="trace-h"><span class="tag">Worked example</span> The knowledge base's illustrative names, not a capture.</p>
      <div class="rx-cols">
        <ol class="rx-files">${p.example.map(([src, file]) => `<li><span>${esc(src)}</span><b>${esc(file)}</b></li>`).join("")}</ol>
        <div class="rx-arrow" aria-hidden="true">→</div>
        <div class="rx-one"><b>Film (2021)</b><span>one work · three versions</span><span>watch and resume state belong here</span></div>
      </div>
      <ol class="rx-rules">
        <li>A title ends at the first unambiguous release token; ambiguous words are only hints.</li>
        <li>Embedded <code>{tmdb-…}</code> and IMDb IDs, and Plex <code>{edition-…}</code> tags, are honoured.</li>
        <li>A file without a year joins its title's only known year; with several, it stays separate.</li>
        <li>A metadata match is accepted only when strong and clearly ahead of the runner-up; otherwise it goes to Identify.</li>
      </ol>
    </div>
    <figure class="pp-ill">${illustration("reflux", p.media[0].alt)}<figcaption>${mediaTag(p.media[0], KIND)}<span>${esc(p.media[0].caption)}</span></figcaption></figure>`;
  }
  if (p.slug === "layers") {
    const m = p.media[state.layersPage];
    return `<div class="ly-x">
      <figure class="ly-main"><img src="${m.src}" width="${m.w}" height="${m.h}" alt="${esc(m.alt)}" decoding="async"><figcaption>${mediaTag(m, KIND)}<span>${esc(m.caption)}</span></figcaption></figure>
      <div class="ly-side">
        <div class="seg" role="group" aria-label="Launcher page">${p.media.map((_, i) => `<button type="button" class="seg-b" data-layers="${i}" aria-pressed="${i === state.layersPage}">Page ${i + 1}</button>`).join("")}</div>
        <p class="ly-fams"><b>Widget families on this page</b>${LAYERS_PAGES[state.layersPage].map((f) => `<span>${esc(f)}</span>`).join("")}</p>
        <p class="ly-note">All shown here are among the seven merged families. Notes and Photos exist on a branch only and are not shown. Captured on the Android emulator during the 4 Oct 2026 audit run.</p>
      </div>
    </div>`;
  }
  if (p.slug === "bhatkal-time-luxe") {
    const m = p.media[0];
    return `<figure class="pp-fig"><div class="pp-shot"><img src="${m.src}" width="${m.w}" height="${m.h}" alt="${esc(m.alt)}" decoding="async"></div><figcaption>${mediaTag(m, KIND)}<span>${esc(m.caption)}</span></figcaption></figure>
      <table class="split"><caption>Who did what</caption><tbody>${p.split.map(([a, b]) => `<tr><th scope="row">${esc(a)}</th><td>${esc(b)}</td></tr>`).join("")}</tbody></table>`;
  }
  return "";
}

/* ---------------------------------------------------------------- engineering pane */
function engineering(p) {
  const spots = p.media.flatMap((m) => m.spots ?? []);
  const sel = spots.find((s) => s.id === state.part);
  const lit = sel ? LINKS[p.slug]?.[sel.id] ?? [] : p.slug === "nexus" ? [[1, 2, 3, 3, 4][state.nexusStep]] : [];
  return `${sel ? `<div class="sel"><p class="sel-h">${esc(sel.ui)}</p><p>${esc(sel.eng)}</p></div>` : `<p class="eng-hint">${p.slug === "nexus" ? "Step through the trace; the stage it reaches is marked below." : spots.length ? "Select a numbered part of the interface." : "How it is built, in order."}</p>`}
    <ol class="path">${p.path.map(([a, b], i) => `<li class="${lit.includes(i) ? "is-lit" : ""}"><b>${esc(a)}</b><span>${esc(b)}</span></li>`).join("")}</ol>
    ${p.pathNote ? `<p class="eng-note">${esc(p.pathNote)}</p>` : ""}
    <details class="more"><summary>What works</summary><ul class="works">${p.works.map((w) => `<li>${esc(w)}</li>`).join("")}</ul></details>
    <details class="more"><summary>Limits and status</summary><p class="limits">${esc(p.limits)}</p><dl class="facts"><dt>Status</dt><dd>${esc(p.status)}</dd><dt>Runs on</dt><dd>${esc(p.platforms.join(", "))}</dd><dt>Licence</dt><dd>${esc(p.licence)}</dd><dt>Period</dt><dd>${esc(p.period)}</dd></dl></details>`;
}

function render({ animate = true } = {}) {
  const p = P[state.slug];
  const links = p.evidence.filter((e) => e[2]).map(([, l, h]) => `<a href="${h}">${esc(l)}</a>`).join("");
  surface.innerHTML = `
    <header class="sf-head">
      <div><p class="sf-line">${esc(p.line)}</p><h3 class="sf-title" tabindex="-1">${esc(p.title)}</h3></div>
      <div class="sf-meta">${status(p)}<p class="sf-owner">${esc(p.owner)}</p></div>
      <a class="btn btn-solid sf-cs" href="${caseStudy(p.slug)}">Case study</a>
    </header>
    <p class="sf-purpose">${esc(p.purpose)} <span class="sf-part">My part: ${esc(p.contribution)}</span></p>
    <ul class="ledger" aria-label="Evidence">${LEDGER[p.slug].map(([k, l, ok]) => `<li class="${ok ? "" : "is-missing"}"><b>${esc(k)}</b> ${esc(l)}</li>`).join("")}</ul>
    <div class="pane-switch" role="tablist" aria-label="Show">
      <button type="button" role="tab" class="ps-b" data-pane="product" aria-selected="${state.pane === "product"}">Product</button>
      <button type="button" role="tab" class="ps-b" data-pane="engineering" aria-selected="${state.pane === "engineering"}">Engineering</button>
    </div>
    <div class="panes" data-pane="${state.pane}">
      <div class="pane pane-product" role="region" aria-label="Product">${product(p)}</div>
      <div class="pane pane-eng" role="region" aria-label="Engineering" id="eng">${engineering(p)}</div>
    </div>
    ${links ? `<p class="sf-links">${links}</p>` : ""}`;
  syncParts();
  if (animate && !reduced()) surface.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 260, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
}

function syncParts() {
  $$(".hs, .part", surface).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.part === state.part)));
  $$(".mf").forEach((a) => (a.dataset.slug === state.slug ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
}
function refreshEng() { $("#eng").innerHTML = engineering(P[state.slug]); syncParts(); }

function select(slug, { push = true, focus = false } = {}) {
  if (!P[slug]) slug = projects[0].slug;
  const changed = slug !== state.slug;
  Object.assign(state, { slug, part: null, atlasView: 0, layersPage: 0, nexusStep: 0 });
  render({ animate: changed });
  if (push) history.pushState({ slug }, "", `?project=${slug}`);
  if (changed) cue();
  if (focus) $(".sf-title", surface).focus({ preventScroll: true });
}
function setPart(id) {
  state.part = state.part === id ? null : id;
  const q = new URLSearchParams(location.search);
  if (state.part) q.set("part", state.part); else q.delete("part");
  history.replaceState(history.state, "", `?${q}`);
  refreshEng();
  if (state.part) cue(620);
}

/* ---------------------------------------------------------------- events */
$("#manifest").addEventListener("click", (e) => {
  const a = e.target.closest(".mf");
  if (!a || e.metaKey || e.ctrlKey) return;
  e.preventDefault();
  select(a.dataset.slug, { focus: matchMedia("(max-width: 900px)").matches });
});
$("#manifest").addEventListener("keydown", (e) => {
  const d = { ArrowDown: 1, ArrowUp: -1 }[e.key];
  if (!d) return;
  e.preventDefault();
  const i = projects.findIndex((p) => p.slug === state.slug);
  const n = projects[Math.min(projects.length - 1, Math.max(0, i + d))].slug;
  select(n);
  $(`.mf[data-slug="${n}"]`).focus();
});
surface.addEventListener("click", (e) => {
  const t = e.target.closest(".hs, .part, .seg-b, .tstep, [data-nx], .ps-b");
  if (!t) return;
  if (t.dataset.part) return setPart(t.dataset.part);
  if (t.dataset.atlas) { state.atlasView = +t.dataset.atlas; state.part = null; render({ animate: false }); return; }
  if (t.dataset.layers) { state.layersPage = +t.dataset.layers; render({ animate: false }); $(`[data-layers="${t.dataset.layers}"]`, surface).focus(); return; }
  if (t.dataset.step || t.dataset.nx) {
    const n = t.dataset.step !== undefined ? +t.dataset.step : state.nexusStep + +t.dataset.nx;
    state.nexusStep = Math.max(0, Math.min(P.nexus.trace.steps.length - 1, n));
    const keep = t.dataset.nx ?? null;
    render({ animate: false });
    if (keep) $(`[data-nx="${keep}"]`, surface).focus();
    else $(`[data-step="${state.nexusStep}"]`, surface).focus();
    return;
  }
  if (t.dataset.pane) { state.pane = t.dataset.pane; $(".panes", surface).dataset.pane = state.pane; $$(".ps-b", surface).forEach((b) => b.setAttribute("aria-selected", String(b.dataset.pane === state.pane))); }
});
addEventListener("keydown", (e) => { if (e.key === "Escape" && state.part) setPart(state.part); });
addEventListener("popstate", () => {
  const q = new URLSearchParams(location.search);
  select(q.get("project"), { push: false });
});

const q = new URLSearchParams(location.search);
select(q.get("project") ?? projects[0].slug, { push: false });
if (q.get("part")) {
  const m = P[state.slug].media.findIndex((x) => x.spots?.some((s) => s.id === q.get("part")));
  if (m > 0) { state.atlasView = m; render({ animate: false }); }
  setPart(q.get("part"));
}
history.replaceState({ slug: state.slug }, "", location.search || `?project=${state.slug}`);
