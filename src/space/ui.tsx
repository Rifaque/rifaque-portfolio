import { Fragment, type ReactNode } from "react";
import { KIND_LABEL, TEXT, isReal, type Aside, type Kind, type Rich } from "./data";
import { diagram, type DiagramId } from "./diagrams";
import type { Shot } from "./data";

/** An evidence label: filled for genuine captures, outlined for illustrations and plans. */
export function Tag({ kind }: { kind: Kind }) {
  return <span className={isReal(kind) ? "ps-tag ps-tag-real" : "ps-tag"}>{KIND_LABEL[kind]}</span>;
}

/** Text with **bold** runs. */
export function RichText({ text }: { text: Rich }): ReactNode {
  return text.split("**").map((part, i) => (i % 2 ? <b key={i}>{part}</b> : <Fragment key={i}>{part}</Fragment>));
}

/** The caption line under a scene: each label with its explanation. */
export function Caption({ items }: { items: [Kind | null, string][] }) {
  return (
    <p className="ps-cap">
      {items.map(([k, text]) => (
        <span key={text}>
          {k && <Tag kind={k} />}
          {text}
        </span>
      ))}
    </p>
  );
}

/** An illustration as a figure: the drawing, its label and a caption. */
export function DiagramFigure({ id, caption, className = "psc-fig" }: { id: DiagramId; caption: string; className?: string }) {
  return (
    <figure className={className}>
      <div className="psc-dia" dangerouslySetInnerHTML={{ __html: diagram(id) }} />
      <figcaption>
        <Tag kind="illustration" />
        <span>{caption}</span>
      </figcaption>
    </figure>
  );
}

/** A genuine capture as a figure, with its own label and caption. */
export function ShotFigure({ media, caption, className = "psc-fig", eager = false }: { media: Shot; caption?: string; className?: string; eager?: boolean }) {
  return (
    <figure className={media.h > media.w ? `${className} is-tall` : className}>
      <img src={media.src} width={media.w} height={media.h} alt={media.alt} loading={eager ? "eager" : "lazy"} decoding="async" />
      <figcaption>
        <Tag kind={media.kind} />
        <span>{caption ?? media.caption}</span>
      </figcaption>
    </figure>
  );
}

/** The flat strip under a scene: order of work, a planned note, or a drawing as text. */
export function AsideStrip({ kind }: { kind: Aside }) {
  if (kind === "road")
    return (
      <>
        <p className="ps-road">
          <span className="ps-road-now">
            <b>Now:</b> USB, wired, the current focus
          </span>
          <span className="ps-road-next">
            <b>Next:</b> Wi-Fi, wireless. Planned after the wired milestone, when development resumes.
          </span>
        </p>
        <p className="ps-pipe" aria-label="Pipeline: capture, H.264 encode, USB, decode, surface">
          <span>Capture</span>
          <span>H.264</span>
          <span>USB</span>
          <span>Decode</span>
          <span>Surface</span>
        </p>
      </>
    );
  if (kind === "studio")
    return (
      <p className="ps-studio-flat">
        <Tag kind="planned" />
        <span>
          <b>Layers Studio</b>, a browser editor: not built. No source exists yet.
        </span>
      </p>
    );
  const which = kind === "text-nexus" ? "nexus" : "reflux";
  return (
    <details className="ps-as-text">
      <summary>{which === "nexus" ? "Request path" : "Media model"} as text</summary>
      <ol>
        {TEXT[which].map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ol>
    </details>
  );
}
