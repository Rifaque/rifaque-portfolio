/*
 * A case-study page: work/<slug>/. It is a page of its own, so it works when
 * opened directly, refreshed, bookmarked or shared; arriving from the work
 * bench, the browser carries the drawing into this page's figure with a
 * cross-document View Transition where supported.
 */
import { projects, STATE_TEXT } from "./content.js";
import { illustration } from "./illustrations.js";
import { $, esc, status, initShell } from "./shell.js";

initShell();
const slug = document.documentElement.dataset.slug;
const n = projects.findIndex((p) => p.slug === slug);
const p = projects[n];
const prev = projects[(n - 1 + projects.length) % projects.length];
const next = projects[(n + 1) % projects.length];
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
  <nav class="crumbs" aria-label="Breadcrumb"><a href="${home}?project=${p.slug}#work">The work</a><span aria-hidden="true">/</span><span aria-current="page">${esc(p.title)}</span></nav>
  <header class="st-head">
    <p class="st-kicker">${esc(p.kicker)}</p>
    <h1 class="st-title">${esc(p.title)}</h1>
    ${status(p)}
    ${p.question ? `<p class="st-q">${esc(p.question)}</p>` : ""}
    <dl class="st-meta"><div><dt>Period</dt><dd>${esc(p.period)}</dd></div><div><dt>Ownership</dt><dd>${esc(p.ownership)}</dd></div><div><dt>Licence</dt><dd>${esc(p.licence)}</dd></div></dl>
    ${p.credit ? `<p class="ro-credit">${esc(p.credit)}</p>` : ""}
  </header>
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
    <a href="../${prev.slug}/"><small>Previous</small>${esc(prev.title)}</a>
    <a href="../${next.slug}/"><small>Next</small>${esc(next.title)}</a>
  </nav>`;
