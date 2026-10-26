/*
 * Hero scene: the RSX solid in the corner of a room.
 *
 * Three parallel lights point along x, y and z. Each wall (and the floor) is
 * perpendicular to exactly one of them, so each receives exactly one shadow:
 * R on the left wall, X on the right wall, S on the floor. The camera is
 * orthographic, so looking straight along an axis turns the solid itself
 * into the same letter as its shadow, at the same size.
 *
 * The entrance shows how the solid is made: each letter crosses the room as
 * a thin plate along its own axis, and a cell is set wherever all three
 * plates have passed. The room light comes up as the shadows resolve.
 *
 * Rendering is on demand: frames are drawn only while something moves (the
 * entrance, a camera move, a drag or its settle). At rest nothing runs.
 * A static SVG drawing of the same geometry is the poster and the no-WebGL
 * fallback.
 */
import { cells, glyphs, N } from "./triplet.js";
// Three.js (vendored, MIT) is emitted as its own hashed file and loaded only when the hero starts.
import threeUrl from "./vendor/three.min.js?url";

const H = (N - 1) / 2; // cell centres run from -H to +H
const L = 9; // walls sit at -L on each axis: far enough that no shadow hides behind the solid

export const VIEWS = {
  axo: { dir: [1, 0.84, 1], up: [0, 1, 0], zoom: 1 },
  r: { dir: [1, 0, 0], up: [0, 1, 0], zoom: 0.8 },
  s: { dir: [0, 1, 0], up: [-1, 0, 0], zoom: 0.8 },
  x: { dir: [0, 0, 1], up: [0, 1, 0], zoom: 0.8 },
};

const THEMES = {
  dark: {
    wallL: 0x353a42, wallR: 0x2c3037, floor: 0x24272d, solid: 0xe6e8ec, rough: 0.42,
    key: 3.1, fill: 0.12, pool: [1, 0.03], fillSky: 0x9aa3b5, fillGround: 0x0b0c0f, bar: 0xdfe3ea, barOpacity: 0.55,
  },
  light: {
    wallL: 0xf6f7f9, wallR: 0xeceef2, floor: 0xe3e6ea, solid: 0x262a31, rough: 0.5,
    key: 1.75, fill: 1.75, pool: [1, 0.9], fillSky: 0xffffff, fillGround: 0xc9ced6, bar: 0x30353d, barOpacity: 0.45,
  },
};

const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOut = (t) => 1 - (1 - t) ** 4;
const clamp01 = (t) => Math.min(1, Math.max(0, t));

/* ------------------------------------------------------------------ SVG poster */

/** Isometric drawing of the room, the solid and its three shadows, from the same cells. */
export function posterSVG({ label }) {
  const c30 = Math.cos(Math.PI / 6);
  const k = Math.sqrt(2 / 3); // true orthographic scale of an isometric view
  const P = (x, y, z) => [(x - z) * c30 * k, ((x + z) * 0.5 - y) * k];
  const poly = (pts, cls) => `<path class="${cls}" d="M${pts.map((p) => P(...p).map((v) => v.toFixed(3)).join(" ")).join("L")}Z"/>`;
  const W = 16;
  let out = "";
  out += poly([[-L, -L, -L], [-L, W, -L], [-L, W, W], [-L, -L, W]], "p-wall-l");
  out += poly([[-L, -L, -L], [W, -L, -L], [W, W, -L], [-L, W, -L]], "p-wall-r");
  out += poly([[-L, -L, -L], [W, -L, -L], [W, -L, W], [-L, -L, W]], "p-floor");
  for (let row = 0; row < N; row++)
    for (let col = 0; col < N; col++) {
      const yv = H - row;
      if (glyphs.R[row][col]) {
        const z = H - col;
        out += poly([[-L, yv - 0.5, z - 0.5], [-L, yv + 0.5, z - 0.5], [-L, yv + 0.5, z + 0.5], [-L, yv - 0.5, z + 0.5]], "p-shadow");
      }
      if (glyphs.X[row][col]) {
        const x = col - H;
        out += poly([[x - 0.5, yv - 0.5, -L], [x + 0.5, yv - 0.5, -L], [x + 0.5, yv + 0.5, -L], [x - 0.5, yv + 0.5, -L]], "p-shadow");
      }
      if (glyphs.S[row][col]) {
        const x = col - H, z = row - H;
        out += poly([[x - 0.5, -L, z - 0.5], [x + 0.5, -L, z - 0.5], [x + 0.5, -L, z + 0.5], [x - 0.5, -L, z + 0.5]], "p-shadow");
      }
    }
  const sorted = [...cells].sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]));
  const s = 0.47;
  for (const [i, j, kk] of sorted) {
    const x = i - H, y = j - H, z = kk - H;
    out += poly([[x + s, y - s, z - s], [x + s, y + s, z - s], [x + s, y + s, z + s], [x + s, y - s, z + s]], "p-fx");
    out += poly([[x - s, y + s, z - s], [x + s, y + s, z - s], [x + s, y + s, z + s], [x - s, y + s, z + s]], "p-fy");
    out += poly([[x - s, y - s, z + s], [x + s, y - s, z + s], [x + s, y + s, z + s], [x - s, y + s, z + s]], "p-fz");
  }
  const [x0, y0] = [(-W * c30 - 1) * k, (-W - 2) * k];
  return `<svg class="hero-poster" viewBox="${x0} ${y0} ${(2 * W * c30 + 2) * k} ${(W + L + W * 0.5 + 6) * k}" role="img" aria-label="${label}" preserveAspectRatio="xMidYMid meet">${out}</svg>`;
}

/* ------------------------------------------------------------------ WebGL */

export async function createHero(host, { onView, onSettle, reduced } = {}) {
  const T = await import(/* @vite-ignore */ threeUrl);
  const canvas = document.createElement("canvas");
  canvas.className = "hero-canvas";
  canvas.setAttribute("aria-hidden", "true");
  let renderer;
  try {
    renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  } catch (e) {
    console.warn("WebGL renderer unavailable:", e);
    return null;
  }
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.NoToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFShadowMap;
  renderer.setClearColor(0x000000, 0);

  const scene = new T.Scene();
  const camera = new T.OrthographicCamera(-1, 1, 1, -1, 1, 1200);

  const mkLight = (x, y, z) => {
    const l = new T.DirectionalLight(0xffffff, 2);
    l.position.set(x, y, z);
    l.castShadow = true;
    l.shadow.mapSize.set(1024, 1024);
    Object.assign(l.shadow.camera, { left: -6.5, right: 6.5, top: 6.5, bottom: -6.5, near: 1, far: 140 });
    l.shadow.bias = -0.0004;
    l.shadow.normalBias = 0.02;
    l.shadow.radius = 2;
    scene.add(l, l.target);
    return l;
  };
  const lights = { r: mkLight(70, 0, 0), s: mkLight(0, 70, 0), x: mkLight(0, 0, 70) };
  const fill = new T.HemisphereLight(0xffffff, 0x000000, 0.3);
  scene.add(fill);

  /* Pools of light: a radial falloff baked into each plane's colour map. */
  const poolTexture = (centre, edge) => {
    const c = document.createElement("canvas");
    c.width = c.height = 1024;
    const g = c.getContext("2d");
    const grad = g.createRadialGradient(512, 512, 0, 512, 512, 512);
    const tone = (v) => `rgb(${Math.round(v * 255)},${Math.round(v * 255)},${Math.round(v * 255)})`;
    // Fractions of the plane's half-size (120 units): flat to ~8 units, then a long falloff.
    grad.addColorStop(0, tone(centre));
    grad.addColorStop(0.07, tone(centre));
    grad.addColorStop(0.13, tone(edge + (centre - edge) * 0.55));
    grad.addColorStop(0.21, tone(edge + (centre - edge) * 0.16));
    grad.addColorStop(0.32, tone(edge + (centre - edge) * 0.03));
    grad.addColorStop(1, tone(edge));
    g.fillStyle = grad;
    g.fillRect(0, 0, 1024, 1024);
    const t = new T.CanvasTexture(c);
    t.colorSpace = T.SRGBColorSpace;
    return t;
  };

  const SIZE = 240; // big enough that no wall edge enters the frame
  const plane = (rotate, pos) => {
    const m = new T.Mesh(new T.PlaneGeometry(SIZE, SIZE), new T.MeshLambertMaterial());
    rotate(m);
    m.position.set(...pos);
    m.receiveShadow = true;
    scene.add(m);
    return m;
  };
  const walls = {
    r: plane((m) => (m.rotation.y = Math.PI / 2), [-L, 0, 0]),
    x: plane(() => {}, [0, 0, -L]),
    s: plane((m) => (m.rotation.x = -Math.PI / 2), [0, -L, 0]),
  };

  /* The solid: one instanced, slightly rounded cell. Walls are matte (Lambert);
     the solid has a satin finish (Standard, no metalness) so its faces catch
     light differently from the room. */
  const { RoundedBoxGeometry } = T;
  const geo = new RoundedBoxGeometry(0.95, 0.95, 0.95, 2, 0.06);
  const solidMat = new T.MeshStandardMaterial({ roughness: 0.42, metalness: 0 });
  const solid = new T.InstancedMesh(geo, solidMat, cells.length);
  solid.castShadow = true;
  solid.receiveShadow = true;
  const group = new T.Group();
  group.add(solid);
  scene.add(group);

  const home = cells.map(([i, j, k]) => new T.Vector3(i - H, j - H, k - H));
  const tmp = new T.Object3D();
  const placeCells = (scale) => {
    home.forEach((p, n) => {
      const s = scale ? scale[n] : 1;
      tmp.position.copy(p);
      tmp.rotation.set(0, 0, 0);
      tmp.scale.setScalar(Math.max(0.0001, s));
      tmp.updateMatrix();
      solid.setMatrixAt(n, tmp.matrix);
    });
    solid.instanceMatrix.needsUpdate = true;
  };
  placeCells(null);

  /* The entrance: each letter crosses the room as a thin plate (a scan plane
     in the shape of the glyph), moving along the axis it is projected on.
     A cell is set in place once all three plates have passed through it, so
     the solid is built by exactly the rule that defines it. Plates cast no shadow. */
  const sweeps = ["x", "z", "y"].map((axis, set) => {
    const g = [glyphs.R, glyphs.X, glyphs.S][set];
    const tiles = [];
    for (let row = 0; row < N; row++)
      for (let col = 0; col < N; col++) {
        if (!g[row][col]) continue;
        if (axis === "x") tiles.push([H - row, H - col]); // (y, z)
        if (axis === "z") tiles.push([H - row, col - H]); // (y, x)
        if (axis === "y") tiles.push([col - H, row - H]); // (x, z)
      }
    const mat = new T.MeshLambertMaterial({ transparent: true, opacity: 0, depthWrite: false });
    const mesh = new T.InstancedMesh(new RoundedBoxGeometry(0.12, 0.92, 0.92, 1, 0.03), mat, tiles.length);
    mesh.visible = false;
    scene.add(mesh);
    return { axis, tiles, mat, mesh };
  });
  const placeSweep = (sw, at) => {
    sw.tiles.forEach(([a, b], n) => {
      tmp.scale.set(1, 1, 1);
      tmp.rotation.set(0, 0, 0);
      if (sw.axis === "x") tmp.position.set(at, a, b);
      if (sw.axis === "z") { tmp.position.set(b, a, at); tmp.rotation.set(0, Math.PI / 2, 0); }
      if (sw.axis === "y") { tmp.position.set(a, at, b); tmp.rotation.set(0, 0, Math.PI / 2); }
      tmp.updateMatrix();
      sw.mesh.setMatrixAt(n, tmp.matrix);
    });
    sw.mesh.instanceMatrix.needsUpdate = true;
  };

  /* ---------------------------------------------------------------- framing */
  let frame = { cx: 0.5, cy: 0.5, height: 40 };
  let zoom = 1;
  let size = { w: 1, h: 1 };
  const applyFrustum = () => {
    const aspect = size.w / size.h;
    const hgt = frame.height * zoom;
    const wid = hgt * aspect;
    camera.left = -frame.cx * wid;
    camera.right = (1 - frame.cx) * wid;
    camera.top = frame.cy * hgt;
    camera.bottom = -(1 - frame.cy) * hgt;
    camera.updateProjectionMatrix();
  };

  const cam = { dir: new T.Vector3(...VIEWS.axo.dir).normalize(), up: new T.Vector3(0, 1, 0) };
  const placeCamera = () => {
    camera.position.copy(cam.dir).multiplyScalar(400);
    camera.up.copy(cam.up);
    camera.lookAt(0, 0, 0);
  };
  placeCamera();

  /* ---------------------------------------------------------------- theme */
  let theme = "dark";
  let view = "axo";
  let lightLevel = 1; // the entrance brings the room up from a lower level
  const applyLights = () => {
    const t = THEMES[theme];
    // The wall being looked at is lit a little more: state shown by light, not hue.
    for (const [k, l] of Object.entries(lights)) l.intensity = t.key * lightLevel * (k === view ? 1.12 : 1);
    fill.intensity = t.fill * (0.55 + 0.45 * lightLevel);
  };
  const applyTheme = () => {
    const t = THEMES[theme];
    walls.r.material.color.set(t.wallL);
    walls.x.material.color.set(t.wallR);
    walls.s.material.color.set(t.floor);
    for (const w of Object.values(walls)) {
      w.material.map?.dispose();
      w.material.map = poolTexture(...t.pool);
      w.material.needsUpdate = true;
    }
    solidMat.color.set(t.solid);
    solidMat.roughness = t.rough;
    for (const sw of sweeps) sw.mat.color.set(t.bar);
    fill.color.set(t.fillSky);
    fill.groundColor.set(t.fillGround);
    applyLights();
  };

  /* ---------------------------------------------------------------- animation */
  const anim = { intro: null, camera: null };
  let raf = 0;
  const request = () => { if (!raf) raf = requestAnimationFrame(tick); };

  const spin = { yaw: 0, pitch: 0, vy: 0, vp: 0, dragging: false };
  const qa = new T.Quaternion();
  const qb = new T.Quaternion();
  const right = new T.Vector3();
  const applySpin = () => {
    right.crossVectors(cam.up, cam.dir).normalize();
    qa.setFromAxisAngle(cam.up, spin.yaw);
    qb.setFromAxisAngle(right, spin.pitch);
    group.quaternion.multiplyQuaternions(qb, qa);
  };

  // Entrance timeline, in ms. Each plate travels from its wall to just past
  // the far side of the solid; R, X and S start a little apart.
  const FROM = -L, TO = H + 1.2;
  const SWEEP = [[140, 980], [300, 1140], [460, 1300]];
  const LIGHT = [0, 460];
  const END = 1640;
  // When does plate k pass coordinate c (eased in/out over its run)?
  const passTime = (k, c) => {
    const [a, b] = SWEEP[k];
    const f = clamp01((c - FROM) / (TO - FROM));
    // Invert easeIO numerically (monotone), close enough for scheduling.
    let lo = 0, hi = 1;
    for (let i = 0; i < 18; i++) { const m = (lo + hi) / 2; if (easeIO(m) < f) lo = m; else hi = m; }
    return a + (b - a) * lo;
  };
  const cellAt = home.map((p) => Math.max(passTime(0, p.x), passTime(1, p.z), passTime(2, p.y)));

  function introFrame(t) {
    lightLevel = 0.3 + 0.7 * easeOut(clamp01((t - LIGHT[0]) / (LIGHT[1] - LIGHT[0])));
    applyLights();
    sweeps.forEach((sw, k) => {
      const [a, b] = SWEEP[k];
      const p = clamp01((t - a) / (b - a));
      placeSweep(sw, FROM + (TO - FROM) * easeIO(p));
      const fadeIn = clamp01((t - a) / 120);
      const fadeOut = 1 - clamp01((t - b) / 220);
      sw.mat.opacity = THEMES[theme].barOpacity * fadeIn * fadeOut;
    });
    // A cell is set once the last plate has passed it: a short, firm scale-in.
    placeCells(cellAt.map((c) => 0.5 + 0.5 * easeOut(clamp01((t - c) / 200)) - (t < c ? 0.5 : 0)));
    if (t < END) return true;
    for (const sw of sweeps) sw.mesh.visible = false;
    lightLevel = 1;
    applyLights();
    placeCells(null);
    return false;
  }

  let lastT = 0;
  function tick(now) {
    raf = 0;
    const dt = Math.min(0.05, lastT ? (now - lastT) / 1000 : 1 / 60);
    lastT = now;
    let more = false;

    if (anim.intro) {
      if (introFrame(now - anim.intro.t0)) more = true;
      else anim.intro = null;
    }

    if (anim.camera) {
      const { t0, dur, fromDir, toDir, fromUp, toUp, fromZoom, toZoom } = anim.camera;
      const p = Math.min(1, (now - t0) / dur);
      const e = easeIO(p);
      cam.dir.copy(fromDir).lerp(toDir, e).normalize();
      cam.up.copy(fromUp).lerp(toUp, e);
      cam.up.sub(cam.dir.clone().multiplyScalar(cam.up.dot(cam.dir))).normalize();
      zoom = fromZoom + (toZoom - fromZoom) * e;
      applyFrustum();
      placeCamera();
      if (p >= 1) anim.camera = null;
      else more = true;
    }

    const moving = Math.abs(spin.yaw) > 1e-4 || Math.abs(spin.pitch) > 1e-4 || Math.abs(spin.vy) > 1e-3 || Math.abs(spin.vp) > 1e-3;
    if (!spin.dragging && moving) {
      // Return to alignment, close to critically damped: it lands cleanly
      // with at most a trace of overshoot.
      const k = 140, c = 21;
      spin.vy += (-k * spin.yaw - c * spin.vy) * dt;
      spin.vp += (-k * spin.pitch - c * spin.vp) * dt;
      spin.yaw += spin.vy * dt;
      spin.pitch += spin.vp * dt;
      if (Math.abs(spin.yaw) < 2e-4 && Math.abs(spin.pitch) < 2e-4 && Math.abs(spin.vy) < 2e-3 && Math.abs(spin.vp) < 2e-3) {
        spin.yaw = spin.pitch = spin.vy = spin.vp = 0;
        onSettle?.();
      } else more = true;
    }
    applySpin();

    renderer.render(scene, camera);
    if (more) request();
    else lastT = 0;
  }

  /* ---------------------------------------------------------------- input */
  let drag = null;
  canvas.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    canvas.setPointerCapture(e.pointerId);
    drag = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId };
    spin.dragging = true;
    spin.vy = spin.vp = 0;
    canvas.classList.add("is-dragging");
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const now = performance.now();
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    const dts = Math.max(0.008, (now - drag.t) / 1000);
    // A drag across the stage's short side is about half a turn.
    const k = Math.PI / Math.max(320, Math.min(size.w, size.h));
    spin.yaw = Math.max(-2.6, Math.min(2.6, spin.yaw + dx * k));
    spin.pitch = Math.max(-1.1, Math.min(1.1, spin.pitch + dy * k));
    // Smoothed release velocity, so one slow final pixel doesn't cancel a flick.
    spin.vy = spin.vy * 0.5 + ((dx * k) / dts) * 0.5;
    spin.vp = spin.vp * 0.5 + ((dy * k) / dts) * 0.5;
    drag.x = e.clientX;
    drag.y = e.clientY;
    drag.t = now;
    request();
  });
  const end = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    drag = null;
    spin.dragging = false;
    spin.vy = Math.max(-5, Math.min(5, spin.vy));
    spin.vp = Math.max(-5, Math.min(5, spin.vp));
    canvas.classList.remove("is-dragging");
    request();
  };
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);

  /* ---------------------------------------------------------------- size */
  const resize = () => {
    const r = host.getBoundingClientRect();
    size = { w: Math.max(1, r.width), h: Math.max(1, r.height) };
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(size.w, size.h, false);
    applyFrustum();
    request();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  host.appendChild(canvas);
  applyTheme();
  resize();

  return {
    canvas,
    get view() { return view; },
    frame(f) { frame = { ...frame, ...f }; applyFrustum(); request(); },
    theme(name) { theme = name; applyTheme(); request(); },
    setView(name, { instant = false } = {}) {
      if (!VIEWS[name] || name === view) return;
      view = name;
      applyLights();
      const toDir = new T.Vector3(...VIEWS[name].dir).normalize();
      const toUp = new T.Vector3(...VIEWS[name].up);
      if (instant || reduced()) {
        cam.dir.copy(toDir);
        cam.up.copy(toUp);
        zoom = VIEWS[name].zoom;
        applyFrustum();
        placeCamera();
        anim.camera = null;
      } else {
        anim.camera = { t0: performance.now(), dur: 950, fromDir: cam.dir.clone(), toDir, fromUp: cam.up.clone(), toUp, fromZoom: zoom, toZoom: VIEWS[name].zoom };
      }
      onView?.(name);
      request();
    },
    /** The construction entrance. Never needed to read or use the page. */
    intro() {
      if (reduced()) return;
      for (const sw of sweeps) { sw.mesh.visible = true; sw.mat.opacity = 0; placeSweep(sw, FROM); }
      anim.intro = { t0: performance.now() + 60 };
      lightLevel = 0.3;
      applyLights();
      placeCells(home.map(() => 0));
      request();
    },
    nudge() {
      if (reduced()) return;
      spin.vy = 4.6;
      spin.vp = -2;
      request();
    },
    render: request,
    /** Prototype review only: render the entrance frozen at time t (ms). */
    seek(t) {
      for (const sw of sweeps) sw.mesh.visible = true;
      anim.intro = null;
      if (!introFrame(t)) placeCells(null);
      renderer.render(scene, camera);
    },
    debug: () => ({ intro: anim.intro, light: lightLevel, sweepVisible: sweeps.map((sw) => sw.mesh.visible), opacity: sweeps.map((sw) => sw.mat.opacity) }),
    destroy() { ro.disconnect(); cancelAnimationFrame(raf); renderer.dispose(); canvas.remove(); },
  };
}
