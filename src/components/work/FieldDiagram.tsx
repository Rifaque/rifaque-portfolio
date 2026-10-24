import { useId, type CSSProperties } from "react";
import { NODE_COUNT, VIEW_H, VIEW_W, edgePath, fieldLayouts, type Anchor, type FieldLayout } from "./fieldLayouts";

type Props = {
  active: string;
  /** Layers to keep mounted. The pinned stage mounts all so they can crossfade. */
  slugs?: string[];
  label: string;
};

const labelOffset: Record<Anchor, { dx: number; dy: number; textAnchor: "start" | "middle" | "end" }> = {
  t: { dx: 0, dy: -18, textAnchor: "middle" },
  b: { dx: 0, dy: 30, textAnchor: "middle" },
  r: { dx: 15, dy: 6, textAnchor: "start" },
  l: { dx: -15, dy: 6, textAnchor: "end" },
};

/**
 * The shared node field.
 *
 * All motion is CSS transitions on transform, opacity and stroke-dashoffset
 * (see work.css), so nothing depends on a JavaScript animation loop: a
 * background tab, a slow device or reduced motion all just see the end state.
 * The drawing is one image named after the active project; the same path is
 * written out as text beside it.
 */
export function FieldDiagram({ active, slugs = [active], label }: Props) {
  const patternId = `dots-${useId().replace(/:/g, "")}`;
  const layout = fieldLayouts[active];

  return (
    <svg className="lf" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label={label}>
      <defs>
        <pattern id={patternId} width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" className="lf-dot" />
        </pattern>
      </defs>
      <rect width={VIEW_W} height={VIEW_H} fill={`url(#${patternId})`} />

      {slugs.map((slug) => (
        <Layer key={slug} layout={fieldLayouts[slug]} on={slug === active} />
      ))}

      {Array.from({ length: NODE_COUNT }, (_, i) => {
        const n = layout.nodes[i];
        const style = { transform: `translate(${n.x}px, ${n.y}px)` } as CSSProperties;
        return (
          <g key={i} className="lf-n" data-hidden={n.hidden || undefined} style={style}>
            <circle r={n.key ? 7 : 5} className={n.key ? "lf-node lf-node--key" : "lf-node"} />
            <circle r="15" className="lf-halo" data-on={n.key || undefined} />
          </g>
        );
      })}

      {slugs.map((slug) => (
        <Labels key={slug} layout={fieldLayouts[slug]} on={slug === active} />
      ))}
    </svg>
  );
}

function Layer({ layout: l, on }: { layout: FieldLayout; on: boolean }) {
  return (
    <g className="lf-layer" data-on={on}>
      {l.boxes?.map((b) => (
        <rect
          key={`${b.x}-${b.y}`}
          className={b.accent ? "lf-box lf-box--accent" : "lf-box"}
          x={b.x}
          y={b.y}
          width={b.w}
          height={b.h}
          rx="6"
        />
      ))}
      {l.edges.map(([from, to, kind = "main"]) => (
        <path
          key={`${from}-${to}`}
          d={edgePath(l.nodes[from], l.nodes[to])}
          className={`lf-edge lf-edge--${kind}${kind === "dashed" ? "" : " lf-edge--draw"}`}
          // Normalised length lets CSS draw any path with one dash value.
          pathLength={kind === "dashed" ? undefined : 1}
        />
      ))}
      {l.fragments?.map(([x, y]) => (
        <rect key={`${x}-${y}`} className="lf-fragment" x={x - 7} y={y - 2} width="14" height="4" rx="2" />
      ))}
    </g>
  );
}

function Labels({ layout: l, on }: { layout: FieldLayout; on: boolean }) {
  return (
    <g className="lf-labels" data-on={on}>
      {l.nodes.map((n, i) => {
        if (!n.label) return null;
        const o = labelOffset[n.anchor ?? "b"];
        return (
          <text
            key={i}
            x={n.x + o.dx}
            y={n.y + o.dy}
            textAnchor={o.textAnchor}
            className={`lf-label${n.mono ? " lf-label--mono" : ""}${n.key ? " lf-label--key" : ""}`}
          >
            {n.label}
          </text>
        );
      })}
      {l.notes?.map((n) => (
        <text
          key={n.text}
          x={n.x}
          y={n.y}
          textAnchor={n.anchor ?? "start"}
          className={`lf-note${n.accent ? " lf-note--accent" : ""}`}
          style={n.size ? { fontSize: n.size } : undefined}
        >
          {n.text}
        </text>
      ))}
    </g>
  );
}
