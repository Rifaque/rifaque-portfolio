/**
 * Hand-built architecture diagrams. Inline SVG so they inherit the theme
 * tokens, scale cleanly, and carry a real text description for screen readers.
 */

const teal = "hsl(var(--aurora-teal))";
const line = "hsl(var(--foreground) / 0.22)";
const faint = "hsl(var(--foreground) / 0.12)";
const label = "hsl(var(--foreground) / 0.85)";
const sub = "hsl(var(--foreground) / 0.5)";
const surface = "hsl(var(--foreground) / 0.035)";

const Arrow = ({ x, y1, y2 }: { x: number; y1: number; y2: number }) => (
  <>
    <line x1={x} y1={y1} x2={x} y2={y2 - 7} stroke={line} strokeWidth="1.5" />
    <path
      d={`M ${x - 4} ${y2 - 8} L ${x} ${y2 - 1} L ${x + 4} ${y2 - 8} Z`}
      fill={line}
    />
  </>
);

const Box = ({
  x,
  y,
  w,
  h,
  title,
  note,
  accent = false,
  dashed = false,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  note?: string;
  accent?: boolean;
  dashed?: boolean;
}) => (
  <g>
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx="8"
      fill={accent ? "hsl(var(--aurora-teal) / 0.07)" : surface}
      stroke={accent ? "hsl(var(--aurora-teal) / 0.45)" : faint}
      strokeWidth="1"
      strokeDasharray={dashed ? "4 4" : undefined}
    />
    <text
      x={x + w / 2}
      y={note ? y + h / 2 - 5 : y + h / 2 + 4}
      textAnchor="middle"
      fontSize="12.5"
      fontWeight="500"
      fill={accent ? teal : label}
    >
      {title}
    </text>
    {note && (
      <text
        x={x + w / 2}
        y={y + h / 2 + 13}
        textAnchor="middle"
        fontSize="10.5"
        fill={sub}
      >
        {note}
      </text>
    )}
  </g>
);

// ---------------------------------------------------------------- NEXUS

export const NexusDiagram = () => (
  <figure className="my-2">
    <div className="overflow-x-auto rounded-xl border border-foreground/[0.07] bg-foreground/[0.015] p-4">
      <svg
        viewBox="0 0 520 610"
        className="mx-auto h-auto w-full min-w-[440px] max-w-[520px]"
        role="img"
        aria-labelledby="nexus-diagram-title nexus-diagram-desc"
      >
        <title id="nexus-diagram-title">Nexus tool-call pipeline</title>
        <desc id="nexus-diagram-desc">
          A model proposes a tool call. It passes a capability gate, then a
          policy engine that composes deny-overrides and takes advisory input
          from a pure risk analyzer. The executor — not the model — computes the
          concrete effect. A human approves that effect, and the approval is
          bound to it by a hash; if state drifts the approval is void. Execution
          is confined to a path jail and checkpointed against a shadow git
          index. Every terminal path, including denials, appends to an
          append-only hash-chained ledger.
        </desc>

        <Box x={140} y={10} w={240} h={44} title="Model proposes a tool call" note="untrusted" dashed />
        <Arrow x={260} y1={54} y2={80} />

        <Box x={140} y={80} w={240} h={44} title="Gate 1 — Capability" note="fail closed" />
        <Arrow x={260} y1={124} y2={150} />

        <Box x={140} y={150} w={240} h={48} title="Gate 2 — Policy engine" note="deny overrides allow" />
        {/* advisory input */}
        <Box x={10} y={152} w={110} h={44} title="Risk analyzer" note="pure · advisory" dashed />
        <line x1={120} y1={174} x2={133} y2={174} stroke={line} strokeWidth="1.5" strokeDasharray="3 3" />
        <path d={`M 132 170 L 139 174 L 132 178 Z`} fill={line} />

        {/* denial path */}
        <path
          d="M 380 174 L 452 174 L 452 545"
          fill="none"
          stroke={line}
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <text x={392} y={166} fontSize="10.5" fill={sub}>
          deny
        </text>

        <Arrow x={260} y1={198} y2={224} />
        <Box
          x={110}
          y={224}
          w={300}
          h={50}
          title="Executor computes the effect"
          note="the model does not define what happens"
          accent
        />
        <Arrow x={260} y1={274} y2={300} />

        <Box
          x={110}
          y={300}
          w={300}
          h={50}
          title="Human approves that concrete effect"
          note="approval carries a hash of it"
          accent
        />
        <Arrow x={260} y1={350} y2={376} />

        <Box x={110} y={376} w={300} h={48} title="Re-verify hash" note="state drifted → approval void" />
        <Arrow x={260} y1={424} y2={450} />

        <Box x={110} y={450} w={300} h={50} title="Execute" note="path-jailed · checkpointed · bounded" />
        <Arrow x={260} y1={500} y2={526} />

        <Box
          x={70}
          y={526}
          w={380}
          h={46}
          title="Append-only hash-chained ledger"
          note="denials and failures are observations too"
        />
      </svg>
    </div>
    <figcaption className="mt-3 text-xs leading-relaxed text-foreground/45">
      Two independent gates, an effect the model never authors, and an approval
      that stops being valid the moment the world moves underneath it.
    </figcaption>
  </figure>
);

// ---------------------------------------------------------------- ATLAS

export const AtlasDiagram = () => (
  <figure className="my-2">
    <div className="overflow-x-auto rounded-xl border border-foreground/[0.07] bg-foreground/[0.015] p-4">
      <svg
        viewBox="0 0 520 540"
        className="mx-auto h-auto w-full min-w-[440px] max-w-[520px]"
        role="img"
        aria-labelledby="atlas-diagram-title atlas-diagram-desc"
      >
        <title id="atlas-diagram-title">Atlas retrieval pipeline</title>
        <desc id="atlas-diagram-desc">
          On indexing, a crawler that respects gitignore walks the workspace and
          an mtime manifest limits work to changed files. Files are split into
          small child chunks with larger parent windows; Tree-sitter extracts a
          cross-file symbol reference graph. Embeddings come from a local Ollama
          model and are stored in LanceDB on Apache Arrow. On query, a dense
          vector search and an exact keyword match are merged with exact matches
          prioritised, the matching parent windows are assembled into context,
          and a local model answers with file and line citations.
        </desc>

        <text x={16} y={20} fontSize="10.5" fontWeight="600" fill={sub} letterSpacing="1.4">
          INDEX
        </text>

        <Box x={140} y={32} w={240} h={42} title="Workspace crawler" note="respects .gitignore" />
        <Arrow x={260} y1={74} y2={98} />
        <Box x={140} y={98} w={240} h={42} title="mtime manifest" note="only re-index what changed" />
        <Arrow x={260} y1={140} y2={164} />
        <Box
          x={110}
          y={164}
          w={300}
          h={50}
          title="Parent–child chunking"
          note="~512B child indexed · ~2KB parent kept"
          accent
        />
        <Arrow x={260} y1={214} y2={238} />
        <Box x={140} y={238} w={240} h={42} title="Ollama embeddings" note="nomic-embed-text" />

        <Box x={396} y={164} w={112} h={50} title="Tree-sitter" note="symbol graph" dashed />
        <line x1={396} y1={189} x2={412} y2={189} stroke={line} strokeWidth="1.5" strokeDasharray="3 3" />

        <Arrow x={260} y1={280} y2={304} />
        <Box x={140} y={304} w={240} h={44} title="LanceDB · Apache Arrow" note="local vector store" />

        <line x1={16} y1={368} x2={504} y2={368} stroke={faint} strokeWidth="1" />
        <text x={16} y={392} fontSize="10.5" fontWeight="600" fill={sub} letterSpacing="1.4">
          QUERY
        </text>

        <Box x={20} y={404} w={220} h={44} title="Dense vector search" />
        <Box x={280} y={404} w={220} h={44} title="Exact keyword match" />
        <line x1={130} y1={448} x2={130} y2={462} stroke={line} strokeWidth="1.5" />
        <line x1={390} y1={448} x2={390} y2={462} stroke={line} strokeWidth="1.5" />
        <line x1={130} y1={462} x2={390} y2={462} stroke={line} strokeWidth="1.5" />
        <Arrow x={260} y1={462} y2={478} />

        <Box
          x={90}
          y={478}
          w={340}
          h={46}
          title="Merge → parent windows → local model"
          note="exact matches prioritised · cited by file and line"
          accent
        />
      </svg>
    </div>
    <figcaption className="mt-3 text-xs leading-relaxed text-foreground/45">
      Small chunks make the search precise; the parent window makes the answer
      useful. Everything above runs on the machine holding the code.
    </figcaption>
  </figure>
);
