/*
 * Signal Path prototype behaviour.
 *
 * Ribbon: the four segments form one chain. Each segment's left edge sits on
 * the previous segment's right edge, so the band stays connected at every
 * fold, including mid-animation and mid-drag (positions are recomputed from
 * the chain on every frame, never interpolated per segment). A fractional
 * selection value `s` drives the chain; requestAnimationFrame runs only while
 * `s` is settling or being dragged, never continuously.
 *
 * Input: buttons, arrow keys, Tab focus, click/tap, horizontal drag/swipe and
 * horizontal wheel. Vertical page scrolling is never intercepted.
 *
 * Dossier: a native <dialog> (focus containment, Escape, inert page) opened
 * with ?project=<slug>. Opening pushes a history entry, so Back closes it.
 */
(function () {
  const { projects, more } = window.SP;
  const $ = (s, el = document) => el.querySelector(s);
  const root = document.documentElement;
  const stage = $("#stage");
  const band = $("#band");
  const dialog = $("#dossier");
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  const reduced = () => root.dataset.motion === "reduce" || matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* -------------------------------------------------------------- glyphs */
  const G = {
    released: '<circle cx="8" cy="8" r="6" fill="currentColor"/>',
    "pre-release": '<circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 2a6 6 0 0 1 0 12z" fill="currentColor"/>',
    "in-development": '<circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 8V2.6" stroke="currentColor" stroke-width="1.5"/>',
    "private-alpha": '<circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2.4 2.2"/>',
    delivered: '<circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M5.2 8.2 7.2 10.1 10.9 6" fill="none" stroke="currentColor" stroke-width="1.5"/>',
    retired: '<circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1"/><path d="M4.2 11.8 11.8 4.2" stroke="currentColor" stroke-width="1"/>',
    role: '<rect x="3" y="3" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.5"/>',
  };
  const glyph = (stage) => `<svg class="glyph" viewBox="0 0 16 16" aria-hidden="true">${G[stage]}</svg>`;
  document.querySelectorAll(".glyph-slot").forEach((el) => (el.outerHTML = glyph(el.dataset.stage)));

  const pad = (i) => String(i + 1).padStart(2, "0");

  /* -------------------------------------------------------------- render */
  band.innerHTML = projects
    .map((p, i) => {
      const m = p.media;
      const media =
        m.kind === "screenshot"
          ? `<img src="${m.src}" srcset="${m.srcset}" sizes="60vw" width="${m.width}" height="${m.height}" alt="" draggable="false">`
          : m.svg;
      return `<li class="seg" data-index="${i}">
        <span class="seg-tag">${m.kind === "screenshot" ? "Screenshot" : "Illustration"}</span>
        <div class="seg-media">${media}</div>
        <div class="seg-plate"><span class="seg-index">${pad(i)}</span><span class="seg-title">${esc(p.title)}</span><span class="seg-status">${glyph(p.stage)}${esc(p.status)}</span></div>
        <span class="seg-hinge"></span><span class="seg-sweep"></span><span class="seg-lead"></span><span class="seg-tail"></span>
        <span class="seg-shade"></span>
        <button type="button" class="seg-hit" aria-label="${esc(p.title)}: ${esc(p.kicker)}. ${esc(p.status)}. Project ${i + 1} of ${projects.length}. Open dossier."></button>
      </li>`;
    })
    .join("");
  const segs = [...band.children];

  $("#ticks").innerHTML = projects
    .map((p, i) => `<li><button type="button" data-index="${i}">${glyph(p.stage)}<span class="t-name">${esc(p.title)}</span><span class="t-status">${esc(p.status)}</span></button></li>`)
    .join("");
  $("#count-all").textContent = pad(projects.length - 1);

  $("#more-list").innerHTML = more
    .map(
      (m) => `<li><p class="more-k">${esc(m.kicker)}</p><p class="more-t">${esc(m.title)}</p><p class="more-s">${glyph(m.stage)}${esc(m.status)}</p><p class="more-o">${esc(m.owner)}</p></li>`,
    )
    .join("");

  /* -------------------------------------------------------------- ribbon geometry */
  let W = 760, maxA = 64;
  function measure() {
    const w = stage.clientWidth;
    const small = w < 640;
    W = Math.round(Math.min(small ? w * 0.8 : w * 0.52, 860));
    const H = Math.round(W * 0.625);
    maxA = small ? 56 : 64;
    stage.style.setProperty("--seg-w", W + "px");
    stage.style.setProperty("--seg-h", H + "px");
    stage.style.setProperty("--stage-h", H + (small ? 44 : 64) + "px");
    stage.style.setProperty("--band-top", (small ? 14 : 24) + "px");
    stage.style.setProperty("--persp", Math.round(small ? 900 : Math.max(1400, w * 1.15)) + "px");
  }

  function layout(s) {
    const n = segs.length;
    const A = [], P = [{ x: 0, z: 0 }];
    for (let i = 0; i < n; i++) {
      const a = maxA * Math.tanh((i - s) * 0.85);
      const r = (a * Math.PI) / 180;
      A.push(a);
      P.push({ x: P[i].x + W * Math.cos(r), z: P[i].z - W * Math.sin(r) });
    }
    // Focus point: the centre of the (fractionally) selected segment.
    const t = Math.min(n, Math.max(0, s + 0.5));
    const i0 = Math.min(n - 1, Math.floor(t));
    const f = t - i0, r0 = (A[i0] * Math.PI) / 180;
    const F = { x: P[i0].x + f * W * Math.cos(r0), z: P[i0].z - f * W * Math.sin(r0) };
    segs.forEach((el, i) => {
      const r = (A[i] * Math.PI) / 180;
      el.style.transform = `translate3d(${(P[i].x - F.x).toFixed(2)}px,0,${(P[i].z - F.z).toFixed(2)}px) rotateY(${A[i].toFixed(3)}deg)`;
      const shade = Math.min(0.8, Math.abs(Math.sin(r)) * 0.85 + Math.max(0, Math.abs(i - s) - 1) * 0.12);
      el.style.setProperty("--shade", shade.toFixed(3));
    });
  }

  /* -------------------------------------------------------------- selection + animation */
  let s = 0, target = 0, raf = 0, last = 0, dragging = false;
  function frame(now) {
    const dt = Math.min(64, now - (last || now));
    last = now;
    if (!dragging) {
      s = target + (s - target) * Math.exp(-dt / 120);
      if (Math.abs(s - target) < 0.0008) s = target;
    }
    layout(s);
    if (dragging || s !== target) raf = requestAnimationFrame(frame);
    else { raf = 0; last = 0; }
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

  function go(i, { instant = false } = {}) {
    i = Math.max(0, Math.min(projects.length - 1, i));
    const changed = i !== target;
    target = i;
    segs.forEach((el, k) => el.classList.toggle("is-on", k === i));
    if (changed && !reduced()) {
      const on = segs[i];
      on.classList.remove("swept"); void on.offsetWidth; on.classList.add("swept");
    }
    document.querySelectorAll("#ticks button").forEach((b, k) => b.setAttribute("aria-current", String(k === i)));
    $("#count-now").textContent = pad(i);
    document.querySelector('[data-step="-1"]').disabled = i === 0;
    document.querySelector('[data-step="1"]').disabled = i === projects.length - 1;
    if (changed || !$("#readout").childElementCount) renderReadout(i);
    if (instant || reduced()) { s = i; layout(s); } else kick();
  }

  function renderReadout(i) {
    const p = projects[i];
    const ro = $("#readout");
    ro.innerHTML = `
      <div class="ro-anim"><p class="ro-title">${esc(p.title)}</p><p class="ro-kicker">${esc(p.kicker)}</p>
        <p class="ro-status">${glyph(p.stage)}<span>${esc(p.status)}</span></p></div>
      <div class="ro-anim" style="animation-delay:.05s"><p class="ro-q">${esc(p.question)}</p><p class="ro-sum">${esc(p.summary)}</p></div>
      <div class="ro-actions ro-anim" style="animation-delay:.1s">
        <button type="button" class="btn btn--primary" data-open="${i}">Open the dossier <span aria-hidden="true">→</span></button>
        <a class="btn" href="/work/${p.slug}" data-proto-route>Full case study <span aria-hidden="true">↗</span></a>
      </div>`;
  }

  /* -------------------------------------------------------------- ribbon input */
  document.querySelectorAll("[data-step]").forEach((b) => b.addEventListener("click", () => go(target + Number(b.dataset.step))));
  $("#ticks").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) go(Number(b.dataset.index)); });

  let suppressClick = false;
  band.addEventListener("click", (e) => {
    const hit = e.target.closest(".seg-hit");
    if (!hit || suppressClick) return;
    const i = Number(hit.parentElement.dataset.index);
    if (i !== target) go(i);
    else openDossier(i, { trigger: hit });
  });
  // Keyboard focus (Tab) selects; a mouse press does not, so the first click selects and the second opens.
  band.addEventListener("focusin", (e) => {
    const hit = e.target.closest(".seg-hit");
    if (hit && hit.matches(":focus-visible")) go(Number(hit.parentElement.dataset.index));
  });
  $("#ribbon").addEventListener("keydown", (e) => {
    const map = { ArrowLeft: target - 1, ArrowRight: target + 1, Home: 0, End: projects.length - 1 };
    if (!(e.key in map)) return;
    e.preventDefault();
    go(map[e.key]);
    segs[target].querySelector(".seg-hit").focus({ preventScroll: true });
  });

  // Horizontal drag / swipe. touch-action: pan-y leaves vertical scrolling to the browser.
  let start = null, vel = 0, lastX = 0, lastT = 0;
  stage.addEventListener("pointerdown", (e) => {
    if (e.button > 0) return;
    start = { x: e.clientX, y: e.clientY, s, id: e.pointerId };
    lastX = e.clientX; lastT = performance.now(); vel = 0;
  });
  stage.addEventListener("pointermove", (e) => {
    if (!start || e.pointerId !== start.id) return;
    const dx = e.clientX - start.x, dy = e.clientY - start.y;
    if (!dragging) {
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
      dragging = true;
      stage.setPointerCapture(e.pointerId);
      stage.classList.add("dragging");
      kick();
    }
    const now = performance.now();
    vel = (e.clientX - lastX) / Math.max(1, now - lastT);
    lastX = e.clientX; lastT = now;
    s = Math.max(-0.35, Math.min(projects.length - 0.65, start.s - dx / (W * 0.9)));
  });
  const endDrag = () => {
    if (dragging) {
      dragging = false;
      stage.classList.remove("dragging");
      suppressClick = true;
      setTimeout(() => (suppressClick = false), 0);
      go(Math.round(s - vel * 0.35));
      kick();
    }
    start = null;
  };
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);
  let wheelAcc = 0, wheelLock = 0;
  stage.addEventListener("wheel", (e) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; // vertical wheel scrolls the page as usual
    e.preventDefault();
    if (performance.now() < wheelLock) return;
    wheelAcc += e.deltaX;
    if (Math.abs(wheelAcc) > 50) { go(target + Math.sign(wheelAcc)); wheelAcc = 0; wheelLock = performance.now() + 380; }
  }, { passive: false });

  /* -------------------------------------------------------------- dossier */
  let openIndex = -1, trigger = null, pushed = false, anim = null;
  const DUR = 720;

  function dossierHTML(p, i) {
    const m = p.media;
    const fig =
      m.kind === "screenshot"
        ? `<figure class="ds-fig"><div class="ds-fig-frame"><img src="${m.src}" srcset="${m.srcset}" sizes="(min-width: 860px) 55vw, 92vw" width="${m.width}" height="${m.height}" alt="${esc(m.alt)}"></div>
            <figcaption><span class="ds-tag">Screenshot</span><span>${esc(m.caption)}</span></figcaption></figure>`
        : `<figure class="ds-fig"><div class="ds-fig-frame is-il" role="img" aria-label="${esc(m.label)}">${m.svg}</div>
            <figcaption><span class="ds-tag">Illustration</span><span>${esc(m.label)}</span></figcaption></figure>`;
    const diagram = p.diagram
      ? `<figure class="ds-fig" style="margin-top:22px"><div class="ds-fig-frame is-il" role="img" aria-label="${esc(p.diagram.label)}">${p.diagram.svg}</div>
          <figcaption><span class="ds-tag">Illustration</span><span>${esc(p.diagram.label)}</span></figcaption></figure>`
      : "";
    const links = p.links.length
      ? p.links.map(([l, h]) => `<a class="btn" href="${h}" rel="noopener" target="_blank">${esc(l)} <span aria-hidden="true">↗</span></a>`).join("")
      : `<p class="ds-note">${esc(p.noLinks)}</p>`;
    const sec = (title, body) => `<section class="ds-sec"><h3>${title}</h3><div class="ds-sec-body">${body}</div></section>`;
    const prev = projects[(i - 1 + projects.length) % projects.length];
    const next = projects[(i + 1) % projects.length];
    return `
      <header class="ds-head">
        <div>
          <p class="ds-kicker">${esc(p.kicker)}</p>
          <h2 class="ds-title" id="ds-title" tabindex="-1">${esc(p.title)}</h2>
          <p class="ds-status">${glyph(p.stage)}<span>${esc(p.status)}</span></p>
          <p class="ds-q">${esc(p.question)}</p>
          <dl class="ds-facts">
            <dt>Ownership</dt><dd>${esc(p.ownership)}</dd>
            <dt>Role</dt><dd>${esc(p.role)}</dd>
            <dt>Period</dt><dd>${esc(p.period)}</dd>
            <dt>Licence</dt><dd>${p.licence ? esc(p.licence) : '<span class="unverified">Not shown until verified</span>'}</dd>
          </dl>
        </div>
        ${fig}
      </header>
      <div class="ds-grid">
        ${sec("Why it exists", `<p class="ds-lead">${esc(p.summary)}</p>${p.why.map((t) => `<p>${esc(t)}</p>`).join("")}`)}
        ${sec("How it works", `<ol class="ds-flow">${p.how.map(([b, t]) => `<li><b>${esc(b)}</b><p>${esc(t)}</p></li>`).join("")}</ol>${diagram}`)}
        ${sec("Decisions and trade-offs", `<ul class="ds-dec">${p.decisions.map(([b, t]) => `<li><b>${esc(b)}</b><p>${esc(t)}</p></li>`).join("")}</ul>`)}
        ${sec("Stack, and why it matters", `<dl class="ds-stack">${p.stack.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>`)}
        ${sec("Status and limits", `<ul class="ds-limits">${p.limits.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`)}
        ${sec("Explore", `<div class="ds-next"><a class="btn btn--primary" href="/work/${p.slug}" data-proto-route>Read the full case study <span aria-hidden="true">→</span></a>${links}</div>`)}
      </div>
      <nav class="ds-foot" aria-label="More projects">
        <button type="button" data-dstep="-1"><small>Previous project</small><span>← ${esc(prev.title)}</span></button>
        <button type="button" data-dstep="1"><small>Next project</small><span>${esc(next.title)} →</span></button>
      </nav>`;
  }

  function fill(i) {
    const p = projects[i];
    openIndex = i;
    $("#ds-body").innerHTML = dossierHTML(p, i);
    $("#ds-count").textContent = `Dossier ${pad(i)} / ${pad(projects.length - 1)}`;
    $("#ds-prev").textContent = "← " + projects[(i - 1 + projects.length) % projects.length].title;
    $("#ds-next").textContent = projects[(i + 1) % projects.length].title + " →";
    $("#ds-scroll").scrollTop = 0;
  }

  function urlFor(slug) {
    const q = new URLSearchParams(location.search);
    if (slug) q.set("project", slug); else q.delete("project");
    const qs = q.toString();
    return location.pathname + (qs ? "?" + qs : "") + location.hash;
  }
  const safeHistory = (fn) => { try { fn(); return true; } catch { return false; } }; // file:// may refuse

  function rectInset(el) {
    const r = el.getBoundingClientRect(), vw = innerWidth, vh = innerHeight;
    const visible = r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw;
    const b = visible ? r : { top: vh * 0.3, bottom: vh * 0.7, left: vw * 0.3, right: vw * 0.7 };
    return `inset(${Math.max(0, b.top)}px ${Math.max(0, vw - b.right)}px ${Math.max(0, vh - b.bottom)}px ${Math.max(0, b.left)}px)`;
  }

  function openDossier(i, { trigger: t = null, push = true } = {}) {
    if (dialog.open) return;
    if (i !== target) go(i, { instant: true });
    trigger = t || document.activeElement;
    // Hide the content before it is inserted, so it never fades *out* while the paper opens.
    if (!reduced()) dialog.classList.add("is-entering");
    fill(i);
    pushed = push && safeHistory(() => history.pushState({ project: projects[i].slug }, "", urlFor(projects[i].slug)));
    const from = rectInset(segs[i].querySelector(".seg-media"));
    dialog.showModal();
    document.body.classList.add("reading");
    measure(); layout(s);
    if (anim) anim.cancel();
    if (reduced()) {
      anim = dialog.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 140 });
    } else {
      dialog.classList.add("is-entering");
      anim = dialog.animate([{ clipPath: from }, { clipPath: "inset(0px 0px 0px 0px)" }], { duration: DUR, easing: "cubic-bezier(0.7, 0, 0.2, 1)" });
      anim.finished.then(() => dialog.classList.remove("is-entering"), () => {});
    }
    $("#ds-title").focus({ preventScroll: true });
  }

  function closeDossier({ fromPop = false } = {}) {
    if (!dialog.open) return;
    if (!fromPop && pushed) { pushed = false; history.back(); return; } // popstate finishes the close
    if (!fromPop) safeHistory(() => history.replaceState(null, "", urlFor(null)));
    pushed = false;
    const i = openIndex;
    const finish = () => {
      dialog.close();
      dialog.classList.remove("is-entering");
      openIndex = -1;
      const back = trigger && document.contains(trigger) && trigger.offsetParent !== null ? trigger : segs[i].querySelector(".seg-hit");
      back.focus({ preventScroll: true });
    };
    document.body.classList.remove("reading");
    measure(); layout(s); // the page scrollbar is back; re-fit before measuring the return target
    if (anim) anim.cancel();
    if (reduced()) {
      anim = dialog.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120 });
    } else {
      dialog.classList.add("is-entering");
      const to = rectInset(segs[i].querySelector(".seg-media"));
      anim = dialog.animate([{ clipPath: "inset(0px 0px 0px 0px)" }, { clipPath: to }], { duration: DUR * 0.8, easing: "cubic-bezier(0.7, 0, 0.2, 1)", delay: 120 });
    }
    anim.finished.then(finish, finish);
  }

  function step(dir) {
    const i = (openIndex + dir + projects.length) % projects.length;
    go(i, { instant: true });
    safeHistory(() => history.replaceState({ project: projects[i].slug }, "", urlFor(projects[i].slug)));
    const swap = () => { fill(i); dialog.classList.remove("is-swapping"); $("#ds-title").focus({ preventScroll: true }); };
    if (reduced()) return swap();
    dialog.style.setProperty("--dir", String(dir));
    dialog.classList.add("is-swapping");
    setTimeout(swap, 170);
  }

  dialog.addEventListener("cancel", (e) => { e.preventDefault(); closeDossier(); }); // Escape
  $("#ds-close").addEventListener("click", () => closeDossier());
  dialog.addEventListener("click", (e) => {
    const b = e.target.closest("[data-dstep]");
    if (b) step(Number(b.dataset.dstep));
  });
  $("#readout").addEventListener("click", (e) => {
    const b = e.target.closest("[data-open]");
    if (b) openDossier(Number(b.dataset.open), { trigger: b });
  });
  // Case-study routes are built in Milestone 6; the prototype says so instead of 404ing.
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-proto-route]");
    if (!a) return;
    e.preventDefault();
    if (!a.dataset.noted) { a.dataset.noted = "1"; a.insertAdjacentHTML("afterend", `<span class="ds-note" role="status">Prototype: ${a.getAttribute("href")} is a Milestone 6 page.</span>`); }
  });

  addEventListener("popstate", () => {
    const slug = new URLSearchParams(location.search).get("project");
    const i = projects.findIndex((p) => p.slug === slug);
    if (i >= 0) {
      if (dialog.open) { if (i !== openIndex) { go(i, { instant: true }); fill(i); } }
      else openDossier(i, { push: false });
    } else if (dialog.open) closeDossier({ fromPop: true });
  });

  /* -------------------------------------------------------------- prototype controls */
  const sync = () => {
    document.querySelectorAll('.proto input[name="accent"]').forEach((r) => (r.checked = r.value === root.dataset.accent));
    document.querySelectorAll('.proto input[name="type"]').forEach((r) => (r.checked = r.value === root.dataset.type));
    $('.proto input[name="motion"]').checked = root.dataset.motion === "reduce";
  };
  document.querySelector(".proto").addEventListener("change", (e) => {
    const el = e.target;
    if (el.name === "accent" || el.name === "type") root.dataset[el.name] = el.value;
    if (el.name === "motion") { if (el.checked) root.dataset.motion = "reduce"; else delete root.dataset.motion; }
    if (el.name === "type") requestAnimationFrame(() => { measure(); layout(s); });
  });
  sync();

  /* -------------------------------------------------------------- start */
  measure();
  go(0, { instant: true });
  addEventListener("resize", () => { measure(); layout(s); });
  const initial = projects.findIndex((p) => p.slug === new URLSearchParams(location.search).get("project"));
  if (initial >= 0) openDossier(initial, { push: false });

  // Hooks for screenshot capture only.
  window.SPdebug = {
    select: (i) => go(i, { instant: true }),
    open: (i) => openDossier(i),
    freeze: (p) => { if (anim) { anim.pause(); anim.currentTime = p * DUR; } },
    finish: () => { if (anim) anim.finish(); },
  };
})();
