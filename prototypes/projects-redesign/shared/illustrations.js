/*
 * Technical illustrations for projects without a published interface. Each
 * draws the project's documented model (knowledge base diagram notes), never
 * an imitation of an interface, and every use is captioned "Illustration".
 * Colours come from CSS custom properties, so both themes are handled there.
 */
const svg = (body, label, vb = "0 0 600 400") =>
  `<svg class="il" viewBox="${vb}" role="img" aria-label="${label}">${body}</svg>`;
const box = (x, y, w, h, cls = "box", r = 8) => `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/>`;
const t = (x, y, s, cls = "", anchor = "start") => `<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${s}</text>`;

const art = {
  nexus: () => `
    ${t(24, 40, "Request", "t-strong")}${t(24, 56, "voice or hotkey")}
    <path class="ln-2" d="M60 68 V112 H96"/>
    ${box(96, 88, 170, 52, "box-strong")}${t(112, 112, "Command Fabric", "t-strong")}${t(112, 128, "recognise, route")}
    <path class="ln dash" d="M180 140 V232"/>${t(188, 192, "declined")}
    ${box(96, 232, 170, 52)}${t(112, 256, "Cortex", "t-strong")}${t(112, 272, "fallback, one decision")}
    <path class="ln" d="M210 88 V58 H244"/>${t(250, 62, "deterministic reply")}
    <path class="ln-2" d="M266 122 C320 122 330 190 384 196"/>${t(276, 114, "typed intent")}
    <path class="ln-2" d="M266 258 C320 258 330 206 384 204"/>${t(282, 300, "proposal")}
    <rect class="fill" x="384" y="96" width="14" height="94" rx="3"/><rect class="fill" x="384" y="210" width="14" height="94" rx="3"/>
    ${t(391, 84, "ToolRuntime", "t-strong", "middle")}${t(391, 324, "gate, policy, approval", "", "middle")}
    <path class="ln-strong" d="M384 200 H520"/><path class="ln-strong" d="M512 193 L522 200 L512 207"/>
    ${box(528, 178, 56, 44, "box-strong")}${t(556, 205, "Effect", "t-strong", "middle")}
    ${t(462, 226, "the only", "t-em", "middle")}${t(462, 240, "way through", "t-em", "middle")}
    <path class="ln dash" d="M556 222 V300"/>${t(556, 318, "ledger", "", "middle")}${t(556, 333, "hash-chained", "", "middle")}`,

  reflux: () => {
    const rows = [["Local folder", "Film (2021) 1080p"], ["Jellyfin", "Film (2021) 2160p"], ["Network share", "{edition-Extended}"]];
    let s = "";
    rows.forEach(([src, file], n) => {
      const y = 64 + n * 104;
      s += box(20, y, 118, 44) + t(34, y + 27, src, "t-strong");
      s += `<path class="ln" d="M138 ${y + 22} H164"/>` + box(164, y + 6, 150, 32, "box", 16) + t(239, y + 27, file, "", "middle");
      s += `<path class="ln-2" d="M314 ${y + 22} C360 ${y + 22} 360 200 392 200"/>`;
    });
    s += `<circle class="box-strong" cx="452" cy="200" r="62"/><circle class="ln-strong" cx="452" cy="200" r="70"/>`;
    s += t(452, 196, "One work", "t-strong", "middle") + t(452, 214, "watch state", "", "middle") + t(452, 228, "lives here", "", "middle");
    s += `<path class="ln-strong" d="M522 200 H584"/>` + t(556, 222, "best", "t-em", "middle") + t(556, 237, "version", "t-em", "middle");
    s += t(452, 300, "Media3 on Android,", "", "middle") + t(452, 315, "libmpv on desktop", "", "middle") + t(452, 112, "identification", "", "middle");
    return s;
  },

  extendspace: () => {
    const stages = [["Capture", "Windows desktop"], ["Encode", "hardware H.264"], ["USB link", "reconnects"], ["Decoder", "owner thread"], ["Surface", "tablet"]];
    let s = "";
    stages.forEach(([a, b], i) => {
      const x = 12 + i * 118;
      s += box(x, 150, 100, 64, i === 2 ? "box" : "box-strong") + t(x + 50, 178, a, "t-strong", "middle") + t(x + 50, 196, b, "", "middle");
      if (i < 4) s += `<path class="ln-2" d="M${x + 100} 182 H${x + 118}"/>`;
    });
    s += `<path class="ln dash" d="M12 120 H226"/>` + t(12, 108, "Windows host · WinUI 3");
    s += `<path class="ln dash" d="M366 120 H580"/>` + t(580, 108, "Android companion · Compose", "", "end");
    s += t(300, 252, "pulled cable → reconnect → next keyframe", "t-em", "middle");
    s += t(300, 290, "Connect is disabled in both apps", "", "middle");
    return s;
  },
};

export function illustration(id, label, attrs = "") {
  if (!art[id]) return "";
  return svg(art[id](), label).replace("<svg", `<svg ${attrs}`);
}
