/*
 * Projection prototype: home page.
 *
 * Motion system (one vocabulary, one tool per job):
 *  - CSS transitions: hover, press, toggles, indicators, theme cross-fade.
 *  - Motion `animate` (springs): the work drawing moving between views,
 *    interruptible mid-gesture.
 *  - WAAPI: one-shot entries with a fixed path (a project being set down).
 *  - Cross-document View Transitions: the drawing becoming the case study's
 *    figure when a case-study page opens (no library).
 *  - Three.js: the hero only.
 * Every state is reachable without motion; reduced motion swaps movement for
 * immediate changes.
 *
 * Portfolio integration preview: copied from prototypes/projection/js/app.js.
 * The work bench ("The work") is replaced by Concept D's Project Space
 * (./projects/space/space.js), so its code is removed here; links elsewhere on
 * the page that opened a project on the bench now select it in Project
 * Space, or lead to the case study for the two Also built projects.
 */
import { projects, principles, chronicle, materials, site } from "./content.js";
import { posterSVG, createHero } from "./hero.js";
import { $, $$, esc, reduced, initShell } from "./shell.js";
import { featured, selectProject } from "./projects/space/space.js";

const root = document.documentElement;
const params = new URLSearchParams(location.search);
const fine = matchMedia("(hover: hover) and (pointer: fine)");

// Case studies are their own pages now; old ?work= links still arrive.
if (params.get("work")) location.replace(`work/${params.get("work")}/`);

let hero = null;
const { sound } = initShell({ onTheme: (t) => hero?.theme(t) });

/* ------------------------------------------------------------------ hero */
const heroStage = $("#hero-stage");
const heroObject = $("#hero-object");
const viewsEl = $("#views");
const VIEW_TEXT = {
  axo: "Its three shadows each spell a letter.",
  r: "Seen along x, the solid is its own R.",
  s: "Seen from above, it is the S on the floor.",
  x: "Seen along z, it reads X.",
};
heroStage.innerHTML = posterSVG({ label: "A solid made of small cubes in the corner of a room. Its shadows on the two walls and the floor spell R, S and X." });
const poster = $(".hero-poster", heroStage);

/**
 * Where the solid sits: the centre of the object column of the content grid,
 * so text and object stay related at every width. The room still fills the
 * whole hero.
 */
function heroFrame() {
  const s = heroStage.getBoundingClientRect();
  const o = heroObject.getBoundingClientRect();
  const stacked = innerWidth <= 900;
  const cx = (o.left + o.width / 2 - s.left) / s.width;
  const cy = stacked ? 0.5 : (o.top + o.height * 0.44 - s.top) / s.height;
  // World units visible vertically: the solid takes about 40% of the hero
  // height on wide screens and a little more when stacked.
  const height = stacked ? 33 : Math.max(40, Math.min(48, 40 * (860 / Math.max(s.height, 560))));
  return { cx, cy, height };
}
function placePoster() {
  const r = heroStage.getBoundingClientRect();
  const f = heroFrame();
  const vb = poster.viewBox.baseVal;
  const scale = r.height / f.height;
  Object.assign(poster.style, {
    width: `${vb.width * scale}px`,
    height: `${vb.height * scale}px`,
    left: `${f.cx * r.width + vb.x * scale}px`,
    top: `${f.cy * r.height + vb.y * scale}px`,
  });
}
const reframe = () => { placePoster(); hero?.frame(heroFrame()); };
new ResizeObserver(reframe).observe(heroStage);
reframe();

function setHeroView(name) {
  for (const b of $$(".view-key[data-view]", viewsEl)) b.setAttribute("aria-pressed", String(b.dataset.view === name));
  $("#solid-now").textContent = VIEW_TEXT[name];
}
viewsEl.addEventListener("click", (e) => {
  const b = e.target.closest(".view-key");
  if (!b) return;
  if (b.id === "nudge") { hero?.nudge(); sound.play("press"); return; }
  if (!hero || b.getAttribute("aria-pressed") === "true") return;
  sound.play("turn");
  hero.setView(b.dataset.view);
});
$("#solid-hint").textContent = fine.matches ? "Drag the solid to turn it. It settles back into place." : "Swipe sideways across the solid to turn it.";

const glOK = (() => {
  if (params.get("webgl") === "off") return false;
  try { return !!document.createElement("canvas").getContext("webgl2"); } catch { return false; }
})();
function heroFallback() {
  heroStage.classList.remove("gl-pending"); // the drawing is now the deliberate fallback
  viewsEl.hidden = true;
  $("#solid-hint").textContent = "This is a drawing of the solid. Turning it needs WebGL.";
}
if (glOK) {
  // Until the scene is ready the room stays empty: the poster shows the finished solid,
  // which the entrance would then take apart, so it is kept for the fallback only.
  heroStage.classList.add("gl-pending");
  createHero(heroStage, { reduced, onView: setHeroView, onSettle: () => sound.play("settle") })
    .then((h) => {
      if (!h) return heroFallback();
      hero = h;
      if (params.has("debug")) window.__hero = h;
      h.frame(heroFrame());
      h.theme(root.dataset.theme);
      const v = params.get("heroview");
      if (v) h.setView(v, { instant: true });
      let played = false;
      try { played = sessionStorage.getItem("rsx-intro") === "1"; } catch { /* fine */ }
      if (!played && !params.has("nointro")) {
        h.intro();
        try { sessionStorage.setItem("rsx-intro", "1"); } catch { /* fine */ }
      }
      requestAnimationFrame(() => {
        h.canvas.classList.add("is-ready");
        heroStage.classList.add("has-gl");
        heroStage.classList.remove("gl-pending");
      });
    })
    .catch((e) => { console.warn("Hero scene unavailable:", e); heroFallback(); });
} else heroFallback();

/* ------------------------------------------------------------------ links into Projects */
// A link to a featured project selects it in Project Space; the Also built
// projects have no place there, so they go to their case-study page instead.
const projectLink = (slug, text) =>
  featured(slug) ? `<a href="#work" data-project="${slug}">${text}</a>` : `<a href="work/${slug}/">${text}</a>`;
document.addEventListener("click", (e) => {
  const a = e.target.closest("[data-project]");
  if (!a || !featured(a.dataset.project)) return;
  e.preventDefault();
  selectProject(a.dataset.project);
});

/* ------------------------------------------------------------------ about */
const linkify = (text) => text.replace(/\b(Nexus|Atlas)\b/g, (m) => `<a class="inline-link" href="#work" data-project="${m.toLowerCase()}">${m}</a>`);
$("#principles").innerHTML = principles
  .map(([h, b], i) => `<li class="principle"><span class="p-num" aria-hidden="true">${["I", "II", "III", "IV"][i]}</span><h3>${esc(h)}</h3><p>${linkify(esc(b))}</p></li>`)
  .join("");

/* ------------------------------------------------------------------ experience */
const START = [2022, 1];
const NOW = [2026, 10];
const span = (NOW[0] - START[0]) * 12 + NOW[1] - START[1] + 1;
const pos = ([y, m], end = false) => {
  const month = m ?? (end ? 12 : 1);
  return Math.min(100, (((y - START[0]) * 12 + month - START[1] + (end ? 1 : 0)) / span) * 100);
};
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmt = ([y, m]) => (m ? `${MONTHS[m - 1]} ${y}` : `${y}`);
const KIND = {
  Employment: "work", "Co-founder": "work",
  "Personal project": "own", "Personal projects": "own",
  "Collaborative project": "team", "Client project": "team",
  Education: "study",
};
function chron() {
  const years = [];
  for (let y = START[0]; y <= NOW[0]; y++) years.push(`<span class="ch-year" style="left:${pos([y, 1])}%">${y}</span>`);
  const rows = chronicle.map((c) => {
    const l = pos(c.from);
    const r = c.to ? pos(c.to, true) : 100;
    const dates = c.exact || c.to ? `${fmt(c.from)} to ${c.to ? fmt(c.to) : "now"}` : `${fmt(c.from)} to now`;
    const title = c.slug ? `<a href="work/${c.slug}/">${esc(c.title)}</a>` : esc(c.title);
    return `<li class="ch-row" data-kind="${KIND[c.kind]}">
      <p class="ch-dates"><span>${dates}</span>${c.exact ? "" : '<span class="ch-approx">year only</span>'}</p>
      <div class="ch-main">
        <h3 class="ch-title">${title}</h3>
        <p class="ch-org"><span class="ch-kind">${esc(c.kind)}</span> ${esc(c.org)}</p>
        <p class="ch-note">${esc(c.note)}${c.link ? ` <a class="link" href="${c.link.href}">${esc(c.link.label)}</a>` : ""}</p>
      </div>
      <div class="ch-track" aria-hidden="true"><span class="ch-bar${c.exact ? "" : " is-approx"}${c.to ? "" : " is-open"}" style="left:${l}%;width:${Math.max(1.2, r - l)}%"></span></div>
    </li>`;
  }).join("");
  $("#chron").innerHTML = `
    <div class="ch-head" aria-hidden="true">
      <p class="ch-legend"><span data-kind="work"><i></i>Employment</span><span data-kind="team"><i></i>With HubZero or a team</span><span data-kind="own"><i></i>Personal project</span><span data-kind="study"><i></i>Education</span>${chronicle.some((c) => !c.exact) ? '<span class="ch-legend-approx"><i></i>Known only to the year</span>' : ""}</p>
      <div class="ch-axis-row"><span></span><span></span><div class="ch-axis">${years.join("")}<span class="ch-now">now</span></div></div>
    </div>
    <ol class="ch-list">${rows}</ol>`;
}
chron();

/* ------------------------------------------------------------------ bill of materials */
function bom() {
  const bySlug = Object.fromEntries(projects.map((p) => [p.slug, p]));
  const short = (p) => p.short ?? p.title.replace(" by RSX", "");
  const techs = materials.flatMap(([fam, rows]) => rows.map(([name, used]) => ({ fam, name, used })));
  const list = (names) => (names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : names[0]);
  $("#bom").innerHTML = `
    <div class="bom-projects" role="group" aria-label="Projects">
      ${projects.map((p) => `<button type="button" class="bom-p" data-slug="${p.slug}" aria-pressed="false">${esc(short(p))}</button>`).join("")}
    </div>
    <div class="bom-fams">
      ${materials.map(([fam, rows]) => `<div class="bom-fam"><h3>${esc(fam)}</h3><div class="bom-chips" role="group" aria-label="${esc(fam)}">
        ${rows.map(([name, used]) => `<button type="button" class="bom-t" data-tech="${esc(name)}" aria-pressed="false">${esc(name)}<span class="sr-only">, used in ${esc(list(used.map((s) => short(bySlug[s]))))}</span><span class="bom-n" aria-hidden="true">${used.length}</span></button>`).join("")}
      </div></div>`).join("")}
    </div>
    <p class="bom-out" id="bom-out" aria-live="polite"></p>`;
  const box = $("#bom");
  const out = $("#bom-out");
  let pinned = null;
  const join = (items) => items.reduce((acc, a, i, arr) => acc + (i === 0 ? "" : i === arr.length - 1 ? " and " : ", ") + a, "");
  const show = (sel) => {
    box.classList.toggle("has-sel", !!sel);
    for (const b of $$(".bom-p", box)) {
      const on = sel && (sel.type === "tech" ? techs.find((t) => t.name === sel.id).used.includes(b.dataset.slug) : b.dataset.slug === sel.id);
      b.classList.toggle("is-on", !!on);
    }
    for (const b of $$(".bom-t", box)) {
      const t = techs.find((x) => x.name === b.dataset.tech);
      b.classList.toggle("is-on", !!(sel && (sel.type === "tech" ? t.name === sel.id : t.used.includes(sel.id))));
    }
    if (!sel) { out.textContent = "Choose a technology or a project."; return; }
    if (sel.type === "tech") {
      const t = techs.find((x) => x.name === sel.id);
      out.innerHTML = `<b>${esc(t.name)}</b> is used in ${join(t.used.map((s) => projectLink(s, esc(bySlug[s].title))))}.`;
    } else {
      const p = bySlug[sel.id];
      out.innerHTML = `<b>${esc(p.title)}</b> uses ${join(techs.filter((t) => t.used.includes(sel.id)).map((t) => esc(t.name)))}. ${projectLink(p.slug, featured(p.slug) ? "Open it in Projects" : "Read the case study")}.`;
    }
  };
  const pressed = () => {
    for (const b of $$("[aria-pressed]", box)) b.setAttribute("aria-pressed", String(!!pinned && (b.dataset.tech === pinned.id || b.dataset.slug === pinned.id)));
  };
  box.addEventListener("click", (e) => {
    const b = e.target.closest(".bom-t, .bom-p");
    if (!b) return;
    const sel = b.dataset.tech ? { type: "tech", id: b.dataset.tech } : { type: "project", id: b.dataset.slug };
    pinned = pinned && pinned.id === sel.id ? null : sel;
    sound.play("select");
    pressed();
    show(pinned);
  });
  const preview = (e) => {
    const b = e.target.closest(".bom-t, .bom-p");
    if (b) show(b.dataset.tech ? { type: "tech", id: b.dataset.tech } : { type: "project", id: b.dataset.slug });
  };
  box.addEventListener("pointerover", (e) => { if (fine.matches) preview(e); });
  box.addEventListener("pointerleave", () => show(pinned));
  show(null);
}
bom();

/* ------------------------------------------------------------------ contact */
$("#copy-email").addEventListener("click", async () => {
  const st = $("#copy-status");
  try {
    await navigator.clipboard.writeText(site.email);
    st.textContent = "Email address copied.";
    sound.play("press");
  } catch {
    st.textContent = `Copy failed. The address is ${site.email}.`;
  }
});

/* ------------------------------------------------------------------ prototype panel */
const protoToggle = $(".proto-toggle");
protoToggle.addEventListener("click", () => {
  const open = protoToggle.getAttribute("aria-expanded") !== "true";
  protoToggle.setAttribute("aria-expanded", String(open));
  $("#proto-body").hidden = !open;
});
$("#p-reduce").checked = root.dataset.motion === "reduce";
$("#p-reduce").addEventListener("change", (e) => {
  if (e.target.checked) root.dataset.motion = "reduce";
  else delete root.dataset.motion;
});
$("#p-nogl").checked = params.get("webgl") === "off";
$("#p-nogl").addEventListener("change", (e) => {
  const q = new URLSearchParams(location.search);
  if (e.target.checked) q.set("webgl", "off");
  else q.delete("webgl");
  location.search = q.toString();
});
$("#p-intro").addEventListener("click", () => hero?.intro());

// Self-check: the solid must be exact.
import("./triplet.js").then(({ verify }) => { const m = verify(); if (m) console.warn(`RSX solid: ${m} letter pixels uncovered`); });
