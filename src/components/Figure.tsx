import type { Media } from "../content/types";
import { Illustration } from "./Illustration";

/** A project visual with its mandatory Screenshot / Illustration label. */
export function Figure({ media, sizes, eager = false, className = "" }: { media: Media; sizes: string; eager?: boolean; className?: string }) {
  if (media.kind === "screenshot") {
    return (
      <figure className={`fig ${className}`}>
        <div className="fig-frame fig-frame--shot">
          <img
            src={media.src}
            srcSet={media.srcSet}
            sizes={media.srcSet ? sizes : undefined}
            width={media.width}
            height={media.height}
            alt={media.alt}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
          />
        </div>
        <figcaption>
          <span className="tag">Screenshot</span>
          <span>{media.caption}</span>
        </figcaption>
      </figure>
    );
  }
  return (
    <figure className={`fig ${className}`}>
      <div className="fig-frame fig-frame--il" role="img" aria-label={media.label}>
        <Illustration id={media.id} />
      </div>
      <figcaption>
        <span className="tag">Illustration</span>
        <span>{media.caption}</span>
      </figcaption>
    </figure>
  );
}
