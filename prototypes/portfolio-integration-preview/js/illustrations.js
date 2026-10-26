/*
 * Technical illustrations for projects without a published screenshot.
 * Each one draws the project's real model as recorded in the knowledge base
 * (nodes and edges from the project's diagram notes), never an imitation of
 * an interface. They are always captioned "Illustration, not a screenshot".
 * Colours come from tokens, so both themes are handled by CSS.
 */

const svg = (body, label) =>
  `<svg class="il" viewBox="0 0 600 400" role="img" aria-label="${label}">${body}</svg>`;

const box = (x, y, w, h, cls = "box", r = 8) => `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/>`;
const t = (x, y, s, cls = "", anchor = "start") => `<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${s}</text>`;

const art = {
  nexus: () => `
    ${t(24, 40, "Request", "t-strong")}
    ${t(24, 56, "voice or hotkey")}
    <path class="ln-2" d="M60 68 V112 H96"/>
    ${box(96, 88, 170, 52, "box-strong")}
    ${t(112, 112, "Command Fabric", "t-strong")}
    ${t(112, 128, "recognise, route")}
    <path class="ln dash" d="M180 140 V232"/>
    ${t(188, 192, "declined")}
    ${box(96, 232, 170, 52)}
    ${t(112, 256, "Cortex", "t-strong")}
    ${t(112, 272, "fallback, one decision")}
    <path class="ln" d="M210 88 V58 H244"/>
    ${t(250, 62, "deterministic reply")}
    <path class="ln-2" d="M266 122 C320 122 330 190 384 196"/>
    ${t(276, 114, "typed intent")}
    <path class="ln-2" d="M266 258 C320 258 330 206 384 204"/>
    ${t(282, 300, "proposal")}
    <rect class="fill" x="384" y="96" width="14" height="94" rx="3"/>
    <rect class="fill" x="384" y="210" width="14" height="94" rx="3"/>
    ${t(391, 84, "ToolRuntime", "t-strong", "middle")}
    ${t(391, 324, "gate, policy, approval", "", "middle")}
    <path class="ln-acc" d="M384 200 H520"/>
    <path class="ln-acc" d="M512 193 L522 200 L512 207"/>
    ${box(528, 178, 56, 44, "box-strong")}
    ${t(556, 205, "Effect", "t-strong", "middle")}
    ${t(462, 226, "the only", "t-acc", "middle")}
    ${t(462, 240, "way through", "t-acc", "middle")}
    <path class="ln dash" d="M556 222 V300"/>
    ${t(556, 318, "ledger", "", "middle")}
    ${t(556, 333, "hash-chained", "", "middle")}`,

  reflux: () => {
    const rows = [
      ["Local folder", "Film (2021) 1080p"],
      ["Jellyfin", "Film (2021) 2160p"],
      ["Network share", "{edition-Extended}"],
    ];
    let s = "";
    rows.forEach(([src, file], n) => {
      const y = 64 + n * 104;
      s += box(20, y, 118, 44);
      s += t(34, y + 27, src, "t-strong");
      s += `<path class="ln" d="M138 ${y + 22} H164"/>`;
      s += box(164, y + 6, 150, 32, "box", 16);
      s += t(239, y + 27, file, "", "middle");
      s += `<path class="ln-2" d="M314 ${y + 22} C360 ${y + 22} 360 200 392 200"/>`;
    });
    s += `<circle class="box-strong" cx="452" cy="200" r="62"/>`;
    s += `<circle class="ln-acc" cx="452" cy="200" r="70"/>`;
    s += t(452, 196, "One work", "t-strong", "middle");
    s += t(452, 214, "watch state", "", "middle");
    s += t(452, 228, "lives here", "", "middle");
    s += `<path class="ln-acc" d="M522 200 H584"/>`;
    s += t(556, 222, "best", "t-acc", "middle");
    s += t(556, 237, "version", "t-acc", "middle");
    s += t(452, 300, "Media3 on Android,", "", "middle");
    s += t(452, 315, "libmpv on desktop", "", "middle");
    s += t(452, 112, "identification", "", "middle");
    return s;
  },

  extendspace: () => {
    const bars = ["#d9dce2", "#c3c7cf", "#a9afb9", "#8c939e", "#6f7782", "#545b65", "#3b4149"];
    let pattern = "";
    bars.forEach((c, n) => { pattern += `<rect x="${384 + n * 24}" y="132" width="24" height="132" fill="${c}"/>`; });
    return `
    ${box(24, 84, 224, 146, "box-strong", 6)}
    <path class="ln-2" d="M116 230 V258 M84 258 H148"/>
    ${t(136, 140, "Windows desktop", "t-strong", "middle")}
    ${t(136, 160, "capture", "", "middle")}
    ${t(136, 176, "hardware H.264", "", "middle")}
    ${t(136, 196, "session owner", "", "middle")}
    <path class="ln-2" d="M248 200 C290 200 286 286 314 286"/>
    <path class="ln-2" d="M330 286 C356 286 350 200 368 200"/>
    <path class="ln-acc" d="M314 278 V294 M330 278 V294"/>
    ${t(322, 318, "pulled cable", "t-acc", "middle")}
    ${t(322, 334, "reconnects", "", "middle")}
    ${t(322, 350, "next keyframe", "", "middle")}
    <rect class="box-strong" x="368" y="112" width="200" height="172" rx="16"/>
    <clipPath id="es-clip"><rect x="384" y="132" width="168" height="132" rx="4"/></clipPath>
    <g clip-path="url(#es-clip)">${pattern}</g>
    ${t(468, 306, "decoder owner, surface", "", "middle")}
    ${t(24, 60, "Connect is disabled in both apps", "t-acc")}`;
  },

  layers: () => `
    <path class="box-strong" d="M28 96 H128 L156 124 V300 H28 Z"/>
    <path class="ln" d="M128 96 V124 H156"/>
    ${t(44, 150, ".layers", "t-strong")}
    <path class="ln" d="M44 172 H132 M44 190 H118 M56 208 H138 M56 226 H110 M44 244 H126"/>
    ${t(92, 330, "one definition", "", "middle")}
    <path class="ln-2" d="M156 198 H200"/>
    ${box(200, 140, 126, 116, "box-strong")}
    ${t(263, 176, "runtime", "t-strong", "middle")}
    ${t(263, 198, "validate", "", "middle")}
    ${t(263, 214, "theme", "", "middle")}
    ${t(263, 230, "size", "", "middle")}
    <path class="ln-2" d="M326 170 C350 170 350 92 372 92"/>
    <path class="ln-2" d="M326 198 H372"/>
    <path class="ln-2" d="M326 226 C350 226 350 292 372 292"/>
    ${box(372, 66, 96, 52, "box", 12)}
    ${t(420, 97, "2 × 1", "", "middle")}
    ${box(372, 150, 96, 96, "box", 12)}
    ${t(420, 203, "2 × 2", "", "middle")}
    <rect class="box" x="372" y="266" width="200" height="96" rx="12"/>
    ${t(472, 319, "4 × 2", "", "middle")}
    <rect class="fill-acc" x="386" y="80" width="8" height="24" rx="2"/>
    <rect class="fill-acc" x="386" y="164" width="8" height="24" rx="2"/>
    <rect class="fill-acc" x="386" y="280" width="8" height="24" rx="2"/>
    ${t(472, 52, "rendered with RemoteViews", "", "middle")}`,

  bluetap: () => `
    ${box(40, 140, 196, 96, "box-strong", 22)}
    <circle class="fill-2" cx="88" cy="188" r="26"/>
    <path class="ln-2" d="M80 176 a8 10 0 1 1 0 20 M96 176 a8 10 0 1 0 0 20"/>
    ${t(128, 182, "Earbuds", "t-strong")}
    ${t(128, 200, "Outline style")}
    ${t(138, 268, "home-screen widget, 2 × 1", "", "middle")}
    <path class="ln-2" d="M236 170 H420"/>
    ${t(328, 160, "assign, customise", "", "middle")}
    <path class="ln-acc dash" d="M420 206 H236"/>
    ${t(328, 228, "tap to connect: not yet", "t-acc", "middle")}
    <path class="box-strong" d="M452 150 q0 -24 24 -24 q24 0 24 24 v38 q0 14 -12 14 h-4 v38 h-16 v-38 h-4 q-12 0 -12 -14 z"/>
    <path class="box-strong" d="M516 150 q0 -24 24 -24 q24 0 24 24 v38 q0 14 -12 14 h-4 v38 h-16 v-38 h-4 q-12 0 -12 -14 z"/>
    ${t(508, 276, "already paired", "", "middle")}
    ${t(508, 292, "public APIs only", "", "middle")}`,

  querycraft: () => `
    <path class="box-strong" d="M24 70 h200 a10 10 0 0 1 10 10 v54 a10 10 0 0 1 -10 10 h-150 l-18 16 v-16 h-32 a10 10 0 0 1 -10 -10 v-54 a10 10 0 0 1 10 -10z"/>
    ${t(40, 100, "plain English", "t-strong")}
    ${t(40, 120, "a question about the data")}
    <path class="ln-2" d="M234 108 H282"/>
    ${box(282, 76, 140, 64)}
    ${t(352, 104, "local model", "t-strong", "middle")}
    ${t(352, 122, "Qwen, Mistral", "", "middle")}
    <path class="ln-2" d="M352 140 V176"/>
    ${box(196, 176, 312, 104, "box-strong", 10)}
    ${t(214, 202, "proposed query", "t-strong")}
    <path class="ln" d="M214 220 H470 M214 236 H430 M214 252 H380"/>
    <rect class="ln-acc" x="420" y="242" width="72" height="26" rx="13"/>
    ${t(456, 260, "run", "t-acc", "middle")}
    <path class="ln-2" d="M352 280 V312"/>
    ${t(370, 304, "validated first", "")}
    <ellipse class="box-strong" cx="352" cy="324" rx="58" ry="12"/>
    <path class="box-strong" d="M294 324 v38 a58 12 0 0 0 116 0 v-38"/>
    ${t(352, 352, "database", "", "middle")}
    ${t(40, 300, "nothing runs until", "t-acc")}
    ${t(40, 316, "the user chooses", "t-acc")}`,
};

export function illustration(id, label) {
  return art[id] ? svg(art[id](), label) : "";
}
