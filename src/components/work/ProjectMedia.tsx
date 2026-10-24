import type { Media } from "../../content/projects";

type Props = { media: Media; className: string; sizes: string; eager?: boolean };

/** An authentic screenshot with its caption. Only real captures go here. */
export function ProjectMedia({ media, className, sizes, eager }: Props) {
  return (
    <figure className={className}>
      <img
        src={media.src}
        srcSet={media.srcSet}
        sizes={sizes}
        width={media.width}
        height={media.height}
        alt={media.alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
      <figcaption>{media.caption}</figcaption>
    </figure>
  );
}
