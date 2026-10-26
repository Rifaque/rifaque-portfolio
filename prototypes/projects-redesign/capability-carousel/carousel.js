/*
 * Concept A: Capability Carousel.
 *
 * Desktop ("pinned"): a sticky frame holds a project rail and a stage. Six
 * invisible scroll stations, each about 70vh long, sit behind it; whichever
 * station crosses the reading line becomes the current project. The change
 * is a discrete state switch with a project-specific transition, never a
 * scroll-scrubbed animation, so nothing is half-visible while reading.
 *
 * Small screens, short windows, reduced motion and no JavaScript ("flow"):
 * the same stations are an ordinary vertical sequence in their final state,
 * with the rail as a sticky row of chips.
 *
 * URL: #<slug>. Rail choices push history (Back returns to the previous
 * project); scrolling only replaces it.
 */
import { projects, alsoBuilt, KIND, caseStudy, STATUS_GLYPH } from "../shared/content.js";
import { illustration } from "../shared/illustrations.js";
import { $, $$, esc, reduced, status, mediaTag, header, cue, alsoBuiltHTML } from "../shared/shell.js";

header("Concept A · Capability Carousel", "a");

const section = $("#projects");
const track = $("#cc-track");
const stage = $("#cc-stage");
const rail = $("#cc-rail");
const markersEl = $("#cc-markers");
const STEP = 70; // vh per station

/* ---------------------------------------------------------------- visuals */
const pct = (v, total) => `${((v / total) * 100).toFixed(3)}%`;
const fig = (m, inner, cls = "") => `<figure class="v ${cls}">${inner}<figcaption>${mediaTag(m, KIND)}<span>${esc(m.caption)}</span></figcaption></figure>`;

const VISUAL = {
  // Real interface; on arrival, two regions of the screenshot are marked and named.
  atlas: (p) => {
    const m = p.media[0];
    const marks = m.spots.filter((s) => ["sources", "evidence"].includes(s.id)).map((s, i) => {
      const [x, y, w, h] = s.box;
      return `<span class="hl hl-${i + 1}" style="left:${pct(x, m.w)};top:${pct(y, m.h)};width:${pct(w, m.w)};height:${pct(h, m.h)}"><span class="hl-label">${esc(s.ui)}</span></span>`;
    }).join("");
    return fig(m, `<div class="shot"><img src="${m.src}" width="${m.w}" height="${m.h}" alt="${esc(m.alt)}" decoding="async">${marks}</div>`, "v-atlas");
  },
  // No interface exists: the governed path draws itself, labelled as an illustration.
  nexus: (p) => fig(p.media[0], illustration("nexus", p.media[0].alt), "v-nexus"),
  // The picture travels from the Windows host to the tablet, as the stream does.
  extendspace: (p) => {
    const [cap, ill] = p.media;
    return fig(cap, `<div class="es">
      <div class="es-host"><p class="es-label">Windows host</p>${illustration("extendspace", ill.alt)}<p class="es-note">${mediaTag(ill, KIND)} Pipeline illustration</p></div>
      <div class="es-tablet"><p class="es-label">Android tablet, debug screen</p><div class="es-screen"><img src="${cap.src}" width="${cap.w}" height="${cap.h}" alt="${esc(cap.alt)}" decoding="async"></div></div>
    </div>`, "v-es");
  },
  // Three versions converge on one work.
  reflux: (p) => {
    const m = p.media[0];
    return fig(m, `<div class="rx" role="img" aria-label="${esc(m.alt)}">
      ${p.example.map(([src, file], i) => `<div class="rx-v rx-v${i}"><span>${esc(src)}</span><b>${esc(file)}</b></div>`).join("")}
      <div class="rx-work"><b>One work</b><span>watch state lives here</span></div>
    </div>`, "v-rx");
  },
  // Emulator captures fan out: one runtime, several widget families.
  layers: (p) => fig(p.media[0], `<div class="ly">${p.media.map((m, i) => `<img class="ly-${i}" src="${m.src}" width="${m.w}" height="${m.h}" alt="${esc(m.alt)}" decoding="async">`).join("")}</div>`, "v-ly"),
  // The delivered interface settles from close-up to the whole composite.
  "bhatkal-time-luxe": (p) => {
    const m = p.media[0];
    return fig(m, `<div class="bt"><img src="${m.src}" width="${m.w}" height="${m.h}" alt="${esc(m.alt)}" decoding="async"></div>
      <dl class="bt-split">${p.split.map(([a, b]) => `<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join("")}</dl>`, "v-bt");
  },
};

function stationHTML(p, i) {
  const links = [`<a class="btn" href="${caseStudy(p.slug)}">Case study</a>`, ...p.evidence.filter((e) => e[2]).map(([, label, href]) => `<a class="btn" href="${href}">${esc(label.replace(/ \(.*\)$/, ""))}</a>`)].join("");
  return `<article class="st st-${p.slug}" data-i="${i}" aria-labelledby="st-${p.slug}-t">
    <div class="st-visual">${VISUAL[p.slug](p)}</div>
    <div class="st-text">
      <p class="st-line">${esc(p.line)}</p>
      <h3 class="st-title" id="st-${p.slug}-t">${esc(p.title)}</h3>
      ${status(p)}
      <p class="st-purpose">${esc(p.purpose)}</p>
      <dl class="facts"><dt>Owner</dt><dd>${esc(p.owner)}</dd><dt>My part</dt><dd>${esc(p.contribution)}</dd><dt>Runs on</dt><dd>${esc(p.platforms.join(", "))}</dd><dt>Licence</dt><dd>${esc(p.licence)}</dd></dl>
      <ul class="works">${p.works.map((w) => `<li>${esc(w)}</li>`).join("")}</ul>
      <p class="limits">${esc(p.limits)}</p>
      <div class="st-links">${links}</div>
    </div>
  </article>`;
}

stage.innerHTML = projects.map(stationHTML).join("");
rail.innerHTML = projects
  .map((p, i) => `${p.hubzero ? '<li class="rail-group" aria-hidden="true">With HubZero</li>' : ""}<li><a class="rail-btn" href="#${p.slug}" data-i="${i}"><span class="rail-name">${esc(p.short ?? p.title)}</span><svg class="glyph" viewBox="0 0 12 12" aria-hidden="true" data-stage="${p.stage}">${STATUS_GLYPH[p.stage]}</svg></a></li>`)
  .join("");
markersEl.innerHTML = projects.map((p, i) => `<div class="cc-marker" data-i="${i}" style="top:${i * STEP}vh"></div>`).join("");
$("#also").innerHTML = alsoBuiltHTML(alsoBuilt, caseStudy);
// SVG paths draw in proportionally.
$$(".v-nexus .il path, .v-es .il path").forEach((p) => p.setAttribute("pathLength", "1"));

const stations = $$(".st", stage);
const railBtns = $$(".rail-btn", rail);
const markers = $$(".cc-marker", markersEl);
let current = -1;
let io = null;

/* ---------------------------------------------------------------- mode */
const pinnedQuery = matchMedia("(min-width: 1000px) and (min-height: 620px)");
const isPinned = () => pinnedQuery.matches && !reduced();

function setMode() {
  const pinned = isPinned();
  section.dataset.mode = pinned ? "pinned" : "flow";
  track.style.height = pinned ? `calc(${(projects.length - 1) * STEP}vh + 100svh - 64px)` : "";
  // Anchors point at whatever represents a project in this mode.
  projects.forEach((p, i) => {
    markers[i].id = pinned ? p.slug : "";
    stations[i].id = pinned ? "" : p.slug;
  });
  io?.disconnect();
  io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) activate(Number(e.target.dataset.i), { from: "scroll" });
  }, { rootMargin: "-45% 0px -54% 0px" });
  (pinned ? markers : stations).forEach((el) => io.observe(el));
  if (current < 0) activate(0, { from: "init" });
  else activate(current, { from: "init", force: true });
}

function activate(i, { from = "scroll", force = false } = {}) {
  if (i === current && !force) return;
  current = i;
  stations.forEach((s, n) => {
    const on = n === i;
    s.classList.toggle("is-on", on);
    // Only the current project is reachable while pinned.
    s.inert = section.dataset.mode === "pinned" && !on;
  });
  railBtns.forEach((b, n) => (n === i ? b.setAttribute("aria-current", "true") : b.removeAttribute("aria-current")));
  $(".cc-rail").style.setProperty("--i", i);
  if (from === "scroll" && location.hash !== `#${projects[i].slug}`) history.replaceState(null, "", `#${projects[i].slug}`);
}

function goTo(i, { push = true } = {}) {
  const slug = projects[i].slug;
  if (push && location.hash !== `#${slug}`) history.pushState(null, "", `#${slug}`);
  const target = section.dataset.mode === "pinned" ? markers[i] : stations[i];
  const y = target.getBoundingClientRect().top + scrollY - (section.dataset.mode === "pinned" ? 0 : 120);
  scrollTo({ top: section.dataset.mode === "pinned" ? y + 2 : y, behavior: reduced() ? "auto" : "smooth" });
  activate(i, { from: "nav" });
  cue();
}

rail.addEventListener("click", (e) => {
  const b = e.target.closest(".rail-btn");
  if (!b) return;
  e.preventDefault();
  goTo(Number(b.dataset.i));
  b.focus({ preventScroll: true });
});
rail.addEventListener("keydown", (e) => {
  const d = { ArrowDown: 1, ArrowUp: -1, ArrowRight: 1, ArrowLeft: -1 }[e.key];
  if (!d) return;
  e.preventDefault();
  const n = Math.min(projects.length - 1, Math.max(0, current + d));
  goTo(n);
  railBtns[n].focus({ preventScroll: true });
});
addEventListener("popstate", () => {
  const n = projects.findIndex((p) => `#${p.slug}` === location.hash);
  if (n >= 0) goTo(n, { push: false });
});

pinnedQuery.addEventListener("change", setMode);
matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", setMode);
setMode();
const start = projects.findIndex((p) => `#${p.slug}` === location.hash);
if (start > 0) requestAnimationFrame(() => goTo(start, { push: false }));
