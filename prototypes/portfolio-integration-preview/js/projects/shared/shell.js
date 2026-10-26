/*
 * Portfolio integration preview: what Project Space needs from a page shell.
 *
 * Adapted from prototypes/projects-redesign/shared/shell.js. In the concept
 * prototype this module also drew a concept header with its own theme and
 * sound controls. Here the page is Projection's: its header, theme switch and
 * sound (js/shell.js, js/sound.js) are used instead, so this module keeps only
 * the helpers and routes Project Space's cues into Projection's sound set.
 */
import { STATUS_GLYPH } from "./content.js";
import { sound } from "../../sound.js";

export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const root = document.documentElement;
const mq = matchMedia("(prefers-reduced-motion: reduce)");
export const reduced = () => mq.matches || root.dataset.motion === "reduce";
export const status = (p) => `<span class="status" data-stage="${p.stage}"><svg class="glyph" viewBox="0 0 12 12" aria-hidden="true">${STATUS_GLYPH[p.stage]}</svg><span>${esc(p.status)}</span></span>`;
export const mediaTag = (m, KIND) => `<span class="tag${m.kind === "illustration" ? "" : " tag-real"}">${KIND[m.kind]}</span>`;

/**
 * Project Space's two cues, played through Projection's sound: selecting a
 * project (cue()) and opening its details (cue(660)). Sound follows the
 * header's Sound switch; nothing plays before the visitor turns it on.
 */
export function cue(freq) {
  sound.play(freq ? "open" : "select");
}

/* ---------------------------------------------------------------- also built */
export function alsoBuiltHTML(alsoBuilt, caseStudy) {
  return `<aside class="also" aria-labelledby="also-title"><h3 id="also-title">Also built</h3>${alsoBuilt
    .map((a) => `<p><b>${a.slug ? `<a href="${caseStudy(a.slug)}" data-sound="press">${esc(a.title)}</a>` : a.href ? `<a href="${a.href}" data-sound="press">${esc(a.title)}</a>` : esc(a.title)}</b>. ${esc(a.note)}</p>`)
    .join("")}</aside>`;
}
