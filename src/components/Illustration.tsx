import type { JSX } from "react";
import type { IllustrationId } from "../content/types";

/*
 * Explanatory diagrams, drawn from the descriptions in the knowledge base.
 * They are always labelled "Illustration" and never styled as screenshots.
 * Colours come from CSS (.il-* classes), so the same drawing works on ink
 * (the ribbon) and on paper (dossier and case studies).
 */

const Grid = () => (
  <g className="il-grid">
    <path d="M0 125H800M0 250H800M0 375H800M200 0V500M400 0V500M600 0V500" />
  </g>
);

const Node = ({ x, y, r = 7, k = false }: { x: number; y: number; r?: number; k?: boolean }) => (
  <circle cx={x} cy={y} r={r} className={k ? "il-node il-node--key" : "il-node"} />
);

const T = ({ x, y, c = "lab", a, children }: { x: number; y: number; c?: "lab" | "cap" | "cap-key" | "mono"; a?: "middle" | "end"; children: string }) => (
  <text x={x} y={y} className={c === "cap-key" ? "il-cap il-cap--key" : `il-${c}`} textAnchor={a}>
    {children}
  </text>
);

const drawings: Record<IllustrationId, JSX.Element> = {
  nexus: (
    <>
      <rect x="420" y="130" width="340" height="290" className="il-box il-box--key" />
      <T x={436} y={452} c="cap-key">TOOLRUNTIME · THE ONLY PLACE EFFECTS HAPPEN</T>
      <path d="M70 250H190" className="il-edge" />
      <path d="M240 250C290 250 300 140 340 140" className="il-edge" />
      <path d="M240 250C290 250 300 360 340 360" className="il-edge il-edge--dash" />
      <path d="M240 250H460" className="il-edge" />
      <path d="M340 360C390 360 410 315 460 315" className="il-edge il-edge--dash" />
      <path d="M460 190V380" className="il-edge il-edge--key" />
      <Node x={70} y={250} /><T x={70} y={282} a="middle">Request</T>
      <Node x={240} y={250} r={9} /><T x={240} y={222} a="middle">Command Fabric</T>
      <T x={200} y={282} c="cap" a="middle">recognise · route</T>
      <Node x={340} y={140} /><T x={340} y={116} a="middle">Deterministic reply</T>
      <Node x={340} y={360} /><T x={340} y={394} a="middle">Cortex · fallback</T>
      <T x={272} y={338} c="cap" a="end">declined</T>
      <Node x={460} y={190} r={8} k /><T x={480} y={196}>Capability gate</T>
      <Node x={460} y={250} r={8} k /><T x={480} y={256}>Policy · deny wins</T>
      <Node x={460} y={315} r={8} k /><T x={480} y={321}>Hash-bound approval</T>
      <Node x={460} y={380} r={8} k /><T x={480} y={386}>Effect</T>
    </>
  ),
  atlas: (
    <>
      <path d="M70 250C130 250 130 170 190 170M70 250C130 250 130 330 190 330" className="il-edge" />
      <path d="M190 170C250 170 250 250 310 250M190 330C250 330 250 250 310 250" className="il-edge" />
      <path d="M310 250H560" className="il-edge il-edge--key" />
      <path d="M430 250C430 330 360 400 300 400" className="il-edge il-edge--dash" />
      <path d="M560 250H700" className="il-edge il-edge--key" />
      <path d="M560 250C560 180 600 120 640 120" className="il-edge il-edge--dash" />
      <Node x={70} y={250} /><T x={70} y={282} a="middle">Question</T>
      <Node x={190} y={170} /><T x={190} y={148} a="middle">Semantic</T>
      <Node x={190} y={330} /><T x={190} y={364} a="middle">BM25</T>
      <Node x={310} y={250} r={9} k /><T x={310} y={222} a="middle">RRF</T>
      <Node x={430} y={250} /><T x={430} y={222} a="middle">Relevance</T>
      <Node x={300} y={400} /><T x={300} y={434} a="middle">No evidence → decline</T>
      <Node x={560} y={250} /><T x={560} y={282} a="middle">Bounded evidence</T>
      <Node x={700} y={250} r={9} k /><T x={700} y={222} a="middle">Answer</T>
      <Node x={640} y={120} /><T x={656} y={126}>Secret Shield</T>
      <T x={656} y={148} c="cap">opt-in cloud path only</T>
    </>
  ),
  reflux: (
    <>
      <path d="M90 130H170M90 250H170M90 370H170" className="il-edge" />
      <path d="M330 130C380 130 390 250 440 250M330 250H440M330 370C380 370 390 250 440 250" className="il-edge" />
      <path d="M440 250H580" className="il-edge il-edge--key" />
      <path d="M580 250C630 250 640 170 700 170" className="il-edge il-edge--key" />
      <Node x={90} y={130} /><T x={90} y={108} a="middle">Local folder</T>
      <Node x={90} y={250} /><T x={90} y={228} a="middle">Jellyfin</T>
      <Node x={90} y={370} /><T x={90} y={348} a="middle">Network share</T>
      <rect x="170" y="114" width="160" height="32" className="il-box" /><T x={250} y={135} c="mono" a="middle">Film (2021) 1080p</T>
      <rect x="170" y="234" width="160" height="32" className="il-box" /><T x={250} y={255} c="mono" a="middle">Film (2021) 2160p</T>
      <rect x="170" y="354" width="160" height="32" className="il-box" /><T x={250} y={375} c="mono" a="middle">{"{edition-Extended}"}</T>
      <Node x={440} y={250} r={8} /><T x={440} y={222} a="middle">Identification</T>
      <Node x={580} y={250} r={11} k /><T x={580} y={222} a="middle">One work</T>
      <T x={580} y={284} c="cap-key" a="middle">watch state lives here</T>
      <Node x={700} y={170} r={8} /><T x={700} y={148} a="middle">Best version</T>
      <T x={700} y={200} c="cap" a="middle">Media3 · libmpv</T>
    </>
  ),
  extendspace: (
    <>
      <rect x="40" y="150" width="320" height="200" className="il-box" />
      <T x={56} y={176} c="cap">WINDOWS HOST · WINUI 3</T>
      <rect x="470" y="150" width="290" height="200" className="il-box" />
      <T x={486} y={176} c="cap">ANDROID CLIENT · COMPOSE</T>
      <path d="M80 270H320" className="il-edge" />
      <path d="M320 270H510" className="il-edge il-edge--key" />
      <path d="M510 270H720" className="il-edge" />
      <path d="M415 282V392" className="il-edge il-edge--dash" />
      <Node x={80} y={270} /><T x={80} y={304} a="middle">Desktop</T>
      <Node x={170} y={270} /><T x={170} y={242} a="middle">Capture</T>
      <Node x={270} y={270} /><T x={270} y={304} a="middle">H.264 (hw)</T>
      <Node x={415} y={270} r={10} k /><T x={415} y={242} a="middle">USB</T>
      <Node x={540} y={270} r={9} k /><T x={540} y={304} a="middle">Decoder owner</T>
      <Node x={640} y={270} /><T x={640} y={242} a="middle">Surface</T>
      <Node x={720} y={270} /><T x={720} y={304} a="middle">Tablet</T>
      <T x={415} y={418} c="cap-key" a="middle">pulled cable → reconnect → next keyframe</T>
    </>
  ),
  layers: (
    <>
      <rect x="60" y="210" width="150" height="80" className="il-box il-box--key" />
      <T x={135} y={256} c="mono" a="middle">.layers</T>
      <T x={135} y={318} c="cap" a="middle">portable definition</T>
      <path d="M210 250H330" className="il-edge il-edge--key" />
      <rect x="330" y="200" width="160" height="100" className="il-box" />
      <T x={410} y={246} a="middle">Runtime</T>
      <T x={410} y={270} c="cap" a="middle">validate · resolve</T>
      <path d="M490 250C540 250 540 140 590 140" className="il-edge" />
      <path d="M490 250H590" className="il-edge" />
      <path d="M490 250C540 250 540 370 590 370" className="il-edge" />
      <rect x="590" y="116" width="90" height="48" className="il-box" />
      <rect x="590" y="214" width="64" height="72" className="il-box" />
      <rect x="590" y="330" width="150" height="80" className="il-box" />
      <T x={410} y={340} c="cap" a="middle">editor · themes · presets</T>
    </>
  ),
  bluetap: (
    <>
      <rect x="90" y="180" width="230" height="120" rx="18" className="il-box il-box--key" />
      <T x={205} y={232} a="middle">Widget</T>
      <T x={205} y={262} c="cap" a="middle">2×1 · preset</T>
      <circle cx="610" cy="240" r="58" className="il-node" />
      <T x={610} y={246} a="middle">Earbuds</T>
      <T x={610} y={330} c="cap" a="middle">already paired</T>
      <path d="M320 215H552" className="il-edge il-edge--key" />
      <T x={436} y={200} c="cap" a="middle">assign · customise</T>
      <path d="M320 265H552" className="il-edge il-edge--dash" />
      <T x={436} y={292} c="cap" a="middle">tap to connect: not yet</T>
    </>
  ),
  querycraft: (
    <>
      <path d="M80 250H220" className="il-edge" />
      <path d="M220 250H360" className="il-edge" />
      <path d="M360 250H500" className="il-edge il-edge--dash" />
      <path d="M500 250H640" className="il-edge il-edge--key" />
      <path d="M640 250H730" className="il-edge il-edge--key" />
      <Node x={80} y={250} /><T x={80} y={222} a="middle">Question</T>
      <T x={80} y={200} c="cap" a="middle">plain English</T>
      <Node x={220} y={250} r={8} /><T x={220} y={286} a="middle">Local model</T>
      <T x={220} y={308} c="cap" a="middle">Qwen · Mistral</T>
      <Node x={360} y={250} r={8} /><T x={360} y={222} a="middle">Query + explanation</T>
      <T x={360} y={200} c="cap" a="middle">a proposal</T>
      <Node x={500} y={250} r={9} k /><T x={500} y={286} a="middle">User chooses</T>
      <Node x={640} y={250} r={9} k /><T x={640} y={222} a="middle">Validation</T>
      <T x={640} y={200} c="cap-key" a="middle">blocks destructive</T>
      <Node x={730} y={250} /><T x={730} y={286} a="middle">Database</T>
    </>
  ),
};

/**
 * The main route through each diagram, as the knowledge base describes it.
 * On the ribbon, the selected diagram sends one signal along it.
 */
const pulses: Record<IllustrationId, string> = {
  nexus: "M70 250H460V380",
  atlas: "M70 250C130 250 130 170 190 170C250 170 250 250 310 250H700",
  reflux: "M90 250H440H580C630 250 640 170 700 170",
  extendspace: "M80 270H720",
  layers: "M135 250H590",
  bluetap: "M205 215H552",
  querycraft: "M80 250H730",
};

export function Illustration({ id, live = false }: { id: IllustrationId; live?: boolean }) {
  return (
    <svg className="il" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
      <Grid />
      {drawings[id]}
      {live && <path className="il-pulse" d={pulses[id]} pathLength={1000} />}
    </svg>
  );
}
