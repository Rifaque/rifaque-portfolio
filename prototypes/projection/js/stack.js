/*
 * The work drawing: a project as a stack of plates.
 *
 *   top plate    what it is: the real interface, or a labelled illustration
 *   path plates  how it works: the project's layers, in request order
 *   ghost plates where it stands: parts that are partial or not built yet
 *
 * Three views of one object:
 *   front   looking straight down: the top plate, face-on and full size
 *   inside  tilted into an axonometric, the plates separated to show the layers
 *   state   the same structure, each plate marked built, partial or not built,
 *           with the unbuilt parts added as dashed ghosts
 *
 * Geometry is a small orthographic projection. A plate is a flat rectangle,
 * so its projection is affine and each top face is drawn with an exact SVG
 * matrix: the interface stays crisp when face-on and is the same element
 * when tilted. Labels are ordinary HTML beside the drawing, so nothing is
 * readable only inside the graphic.
 */
import { animate } from "../vendor/motion.min.js";
import { illustration } from "./illustrations.js";
import { STATE_TEXT } from "./content.js";

const NS = "http://www.w3.org/2000/svg";
const W = 300; // plate width (world units)
let D = 200; // plate depth: set per project from the interface's own proportions
const T = 9; // plate thickness
const rad = Math.PI / 180;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const VIEW = {
  front: { phi: 0, psi: 0, labels: 0, ghosts: 0, marks: 0 },
  inside: { phi: 57, psi: -32, labels: 1, ghosts: 0, marks: 0 },
  state: { phi: 57, psi: -32, labels: 1, ghosts: 1, marks: 1 },
};

const el = (tag, attrs = {}) => {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
};

export function createStack(host, { reduced, onLayer } = {}) {
  host.innerHTML = `
    <div class="stack-draw">
      <svg class="stack-svg" aria-hidden="true">
        <defs><pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" class="hatch-line"/></pattern></defs>
        <g class="stack-leaders"></g><g class="stack-plates"></g>
      </svg>
      <div class="stack-face" role="img"></div>
      <ol class="stack-labels"></ol>
    </div>`;
  const draw = host.querySelector(".stack-draw");
  const svg = host.querySelector(".stack-svg");
  const platesG = host.querySelector(".stack-plates");
  const leadersG = host.querySelector(".stack-leaders");
  const faceA11y = host.querySelector(".stack-face");
  const labelsEl = host.querySelector(".stack-labels");

  let project = null;
  let plates = []; // { kind: "top"|"path"|"ghost", g, top, edges, label, state, index }
  let view = "front";
  let P = { phi: 0, psi: 0, gap: 0, scale: 1, ox: 0, oy: 0, labels: 0, ghosts: 0, marks: 0 };
  let spinOffset = 0; // the visitor's own turn of the axonometric, kept across projects
  let anim = null;
  let active = 0;
  let box = { w: 600, h: 420 };

  /* ------------------------------------------------------------ layout */
  const narrow = () => box.w < 560;
  function areaFor(v) {
    // Front: the whole stage. Other views: the drawing on the left, labels on the right.
    if (v === "front") return { x: 0, y: 0, w: box.w, h: box.h };
    const share = narrow() ? 0.5 : 0.55;
    return { x: 0, y: 8, w: box.w * share, h: box.h - 16 };
  }
  const gapFor = () => (narrow() ? 70 : 64);

  function projectPt(u, v, z, p) {
    const cs = Math.cos(p.psi * rad), sn = Math.sin(p.psi * rad);
    const cf = Math.cos(p.phi * rad), sf = Math.sin(p.phi * rad);
    const X = u - W / 2, Y = v - D / 2;
    const X1 = X * cs - Y * sn, Y1 = X * sn + Y * cs;
    return [p.ox + p.scale * X1, p.oy + p.scale * (Y1 * cf - z * sf)];
  }
  const zOf = (i, p) => -i * p.gap;

  /** Scale and offset that fit a view's visible plates into its area. */
  function fit(v) {
    const base = { ...VIEW[v], psi: VIEW[v].psi + (v === "front" ? 0 : spinOffset), gap: v === "front" ? 0 : gapFor(), scale: 1, ox: 0, oy: 0 };
    const count = plates.filter((pl) => pl.kind !== "ghost" || base.ghosts).length;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (let i = 0; i < count; i++)
      for (const [u, vv] of [[0, 0], [W, 0], [W, D], [0, D]])
        for (const z of [zOf(i, base), zOf(i, base) - T]) {
          const [x, y] = projectPt(u, vv, z, base);
          x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
        }
    const a = areaFor(v);
    const scale = Math.min(a.w / (x1 - x0), a.h / (y1 - y0)) * (v === "front" ? 1 : 0.94);
    return { ...base, scale, ox: a.x + a.w / 2 - scale * (x0 + x1) / 2, oy: a.y + a.h / 2 - scale * (y0 + y1) / 2 };
  }

  /* ------------------------------------------------------------ build */
  function faceContent(p) {
    const f = p.face;
    const pad = 10;
    if (f.kind === "screenshot")
      return `<rect class="plate-face" width="${W}" height="${D}" rx="3"/><image href="${f.src}" x="${pad}" y="${pad}" width="${W - 2 * pad}" height="${D - 2 * pad}" preserveAspectRatio="xMidYMid meet"/>`;
    return `<rect class="plate-face" width="${W}" height="${D}" rx="3"/>${illustration(f.id, "").replace('<svg class="il"', `<svg class="il" x="${pad}" y="${pad}" width="${W - 2 * pad}" height="${D - 2 * pad}" aria-hidden="true"`)}`;
  }

  function build(p) {
    // A screenshot plate takes the screenshot's shape (within limits); illustrations are 3:2.
    D = p.face.kind === "screenshot" ? Math.round(Math.min(220, Math.max(110, (W * p.face.h) / p.face.w))) : 200;
    platesG.replaceChildren();
    leadersG.replaceChildren();
    labelsEl.replaceChildren();
    plates = [];
    const items = [
      { kind: "top", name: p.face.kind === "screenshot" ? "Interface" : "Illustration", note: p.face.kind === "screenshot" ? "Screenshot" : "Not a screenshot", state: ["built", ""] },
      ...p.path.map(([name, note], i) => ({ kind: "path", name, note, state: p.state[i] })),
      ...p.ghosts.map(([name, state, note]) => ({ kind: "ghost", name, note: "", state: [state, note] })),
    ];
    items.forEach((it, i) => {
      const g = el("g", { class: `plate plate-${it.kind}`, "data-state": it.state[0] });
      const edges = [0, 1, 2, 3].map(() => {
        const e = el("polygon", { class: "plate-edge" });
        g.append(e);
        return e;
      });
      const top = el("g", { class: "plate-skin" });
      if (it.kind === "top") top.innerHTML = faceContent(p);
      else top.innerHTML = `<rect class="plate-face" width="${W}" height="${D}" rx="3"/><rect class="plate-mark" width="${W}" height="${D}" rx="3" fill="url(#hatch)"/><text class="plate-num" x="16" y="30">${String(i).padStart(2, "0")}</text>`;
      g.append(top);
      platesG.prepend(g); // the top plate is drawn last
      const leader = el("polyline", { class: "leader" });
      leadersG.append(leader);
      let label = null;
      if (it.kind !== "top") {
        label = document.createElement("li");
        label.className = `slabel slabel-${it.kind}`;
        label.dataset.state = it.state[0];
        label.innerHTML = `<button type="button" class="slabel-btn">
            <span class="slabel-num" aria-hidden="true">${String(i).padStart(2, "0")}</span>
            <span class="slabel-text"><b>${esc(it.name)}</b>
              <span class="l-how">${esc(it.note)}</span>
              <span class="l-state"><i class="mark" aria-hidden="true"></i><span>${STATE_TEXT[it.state[0]]}${it.state[1] ? `: ${esc(it.state[1])}` : ""}</span></span>
            </span></button>`;
        labelsEl.append(label);
        const btn = label.querySelector("button");
        btn.addEventListener("pointerenter", () => setActive(i));
        btn.addEventListener("focus", () => setActive(i));
        btn.addEventListener("click", () => setActive(i, true));
      }
      plates.push({ ...it, g, top, edges, leader, label, index: i });
    });
    faceAlt(p);
  }

  function faceAlt(p) {
    faceA11y.setAttribute("aria-label", p.face.alt);
  }

  function setActive(i, announce = false) {
    active = i;
    for (const pl of plates) pl.g.classList.toggle("is-active", pl.index === i);
    for (const pl of plates) pl.label?.classList.toggle("is-active", pl.index === i);
    render();
    if (announce) onLayer?.(plates[i]);
  }

  /* ------------------------------------------------------------ render */
  function render() {
    if (!plates.length) return;
    svg.setAttribute("viewBox", `0 0 ${box.w} ${box.h}`);
    const p = P;
    const cs = Math.cos(p.psi * rad), sn = Math.sin(p.psi * rad);
    const cf = Math.cos(p.phi * rad), sf = Math.sin(p.phi * rad);
    const s = p.scale;
    const anchors = [];
    for (const pl of plates) {
      const i = pl.index;
      const ghost = pl.kind === "ghost";
      // The highlighted layer slides a little out of the stack, toward the viewer's right.
      const pull = pl.index === active && pl.kind !== "top" && p.labels > 0.5 ? 18 * p.labels : 0;
      const z = zOf(i, p);
      const du = pull;
      const a = s * cs, b = s * sn * cf, c = -s * sn, d = s * cs * cf;
      const e = p.ox + s * ((-W / 2 + du) * cs + (D / 2) * sn);
      const f = p.oy + s * (((-W / 2 + du) * sn - (D / 2) * cs) * cf - z * sf);
      pl.top.setAttribute("transform", `matrix(${a} ${b} ${c} ${d} ${e} ${f})`);
      const corners = [[0, 0], [W, 0], [W, D], [0, D]].map(([u, v]) => [projectPt(u + du, v, z, p), projectPt(u + du, v, z - T, p)]);
      pl.edges.forEach((edge, k) => {
        const [A, A2] = corners[k], [B, B2] = corners[(k + 1) % 4];
        edge.setAttribute("points", `${A} ${B} ${B2} ${A2}`);
      });
      const vis = ghost ? p.ghosts : i === 0 ? 1 : p.phi > 1 ? 1 : 0;
      pl.g.style.opacity = vis.toFixed(3);
      pl.g.style.setProperty("--marks", p.marks.toFixed(3));
      // Label anchor: the plate corner furthest to the right.
      const right = corners.map((c2) => c2[0]).reduce((m, q) => (q[0] > m[0] ? q : m));
      anchors.push({ pl, x: right[0], y: right[1], vis });
    }
    placeLabels(anchors);
  }

  function placeLabels(anchors) {
    const p = P;
    const left = areaFor("inside").w + (narrow() ? 6 : 28);
    const items = anchors.filter((a) => a.pl.label);
    // Spread labels so none overlap, keeping each as close as possible to its plate.
    let y = -Infinity;
    const placed = items.map((a) => {
      const h = a.pl.label.offsetHeight || 34;
      const top = Math.max(a.y - h / 2, y + 6);
      y = top + h;
      return { a, top, h };
    });
    const over = y - box.h;
    if (over > 0) for (const q of placed) q.top -= over;
    for (const { a, top, h } of placed) {
      const alpha = p.labels * a.vis;
      const lab = a.pl.label;
      lab.style.transform = `translate(${left}px, ${top}px)`;
      lab.style.opacity = alpha.toFixed(3);
      lab.style.visibility = alpha < 0.02 ? "hidden" : "visible";
      lab.inert = alpha < 0.5;
      const ly = top + h / 2;
      a.pl.leader.setAttribute("points", `${a.x + 4},${a.y} ${left - 18},${ly} ${left - 6},${ly}`);
      a.pl.leader.style.opacity = (alpha * 0.9).toFixed(3);
    }
    plates[0].leader.style.opacity = 0;
  }

  /* ------------------------------------------------------------ transitions */
  function go(target, { instant = false } = {}) {
    anim?.stop();
    const from = { ...P };
    if (instant || reduced()) {
      P = target;
      render();
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      anim = animate(0, 1, {
        type: "spring",
        duration: 0.75,
        bounce: 0.06,
        onUpdate: (t) => {
          for (const k of Object.keys(target)) P[k] = from[k] + (target[k] - from[k]) * t;
          render();
        },
        onComplete: resolve,
      });
    });
  }

  /* ------------------------------------------------------------ drag */
  // Sideways drag turns the axonometric around its vertical axis; the turn is
  // kept (the visitor chooses the angle). In the front view a downward drag
  // tilts the object open into "How it works".
  let drag = null;
  draw.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || e.target.closest("button, a")) return;
    drag = { x: e.clientX, y: e.clientY, id: e.pointerId, axis: null, spin0: spinOffset, phi0: P.phi };
  });
  draw.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.axis) {
      if (Math.hypot(dx, dy) < 6) return;
      const horiz = Math.abs(dx) > Math.abs(dy);
      if (view === "front" ? horiz || e.pointerType === "touch" : !horiz) return (drag = null);
      drag.axis = horiz ? "spin" : "tilt";
      draw.setPointerCapture(e.pointerId);
      draw.classList.add("is-dragging");
      anim?.stop();
    }
    if (drag.axis === "spin") {
      spinOffset = Math.max(-40, Math.min(34, drag.spin0 + dx * 0.25));
      P.psi = VIEW[view].psi + spinOffset;
    } else {
      P.phi = Math.max(0, Math.min(VIEW.inside.phi, drag.phi0 + dy * 0.3));
      P.gap = gapFor() * (P.phi / VIEW.inside.phi);
      P.labels = P.phi / VIEW.inside.phi;
      const f0 = fit("front"), f1 = fit("inside"), t = P.labels;
      for (const k of ["scale", "ox", "oy"]) P[k] = f0[k] + (f1[k] - f0[k]) * t;
    }
    render();
  });
  const endDrag = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag;
    drag = null;
    draw.classList.remove("is-dragging");
    if (d.axis === "tilt") api.onTiltRelease?.(P.phi > VIEW.inside.phi * 0.35 ? "inside" : "front");
    else if (d.axis === "spin") go(fit(view));
  };
  draw.addEventListener("pointerup", endDrag);
  draw.addEventListener("pointercancel", endDrag);

  /* ------------------------------------------------------------ api */
  const api = {
    get view() { return view; },
    show(p, v, { instant = false } = {}) {
      project = p;
      view = v;
      build(p);
      active = 1;
      setActive(1);
      P = fit(v);
      render();
      if (!instant && !reduced()) {
        // A new project is set down: it arrives lifted and settles.
        draw.animate([{ transform: "translateY(18px)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 420, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
      }
    },
    setView(v, opts) {
      view = v;
      host.dataset.view = v;
      return go(fit(v), opts);
    },
    resize() {
      const r = draw.getBoundingClientRect();
      box = { w: Math.max(200, r.width), h: Math.max(200, r.height) };
      if (project) { P = { ...P, ...fit(view), labels: P.labels, ghosts: P.ghosts, marks: P.marks }; render(); }
    },
    layers: () => plates,
    onTiltRelease: null,
  };
  host.dataset.view = view;
  new ResizeObserver(() => api.resize()).observe(draw);
  return api;
}
