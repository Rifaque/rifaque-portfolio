/**
 * Bill of materials: technology → the projects that used it, grouped into
 * families. Derived from each project's stack in the knowledge base; nothing
 * is listed without a project. Ported unchanged from the accepted portfolio
 * design (prototypes/projection, content.js `materials`).
 */

/** The projects as the bill of materials lists them, in its order, with short names. */
export const bomProjects: { slug: string; short: string }[] = [
  { slug: "atlas", short: "Atlas" },
  { slug: "nexus", short: "Nexus" },
  { slug: "reflux", short: "Reflux" },
  { slug: "extendspace", short: "ExtendSpace" },
  { slug: "layers-by-rsx", short: "Layers" },
  { slug: "bluetap", short: "BlueTap" },
  { slug: "bhatkal-time-luxe", short: "BTL" },
  { slug: "querycraft", short: "QueryCraft" },
];

export const materials: [family: string, rows: [tech: string, slugs: string[]][]][] = [
  ["Languages", [
    ["TypeScript", ["atlas", "bhatkal-time-luxe"]],
    ["Rust", ["atlas"]],
    ["Python", ["nexus", "querycraft"]],
    ["Kotlin", ["reflux", "extendspace", "layers-by-rsx", "bluetap"]],
    ["C# / .NET 10", ["extendspace"]],
  ]],
  ["Interfaces", [
    ["React", ["atlas"]],
    ["Next.js", ["bhatkal-time-luxe", "querycraft"]],
    ["Tauri 2", ["atlas"]],
    ["Compose", ["reflux", "extendspace", "layers-by-rsx"]],
    ["Glance / RemoteViews", ["bluetap", "layers-by-rsx"]],
    ["WinUI 3", ["extendspace"]],
  ]],
  ["Back end and data", [
    ["Node.js", ["bhatkal-time-luxe", "querycraft"]],
    ["FastAPI", ["nexus"]],
    ["PostgreSQL + pgvector", ["nexus"]],
    ["MongoDB", ["bhatkal-time-luxe", "querycraft"]],
    ["LanceDB", ["atlas"]],
  ]],
  ["AI and retrieval", [
    ["Ollama (local models)", ["nexus", "atlas", "querycraft"]],
    ["BM25 + embeddings, RRF", ["atlas"]],
    ["faster-whisper", ["nexus"]],
  ]],
  ["Media and devices", [
    ["Media3 / libmpv", ["reflux"]],
    ["H.264, MediaCodec", ["extendspace"]],
  ]],
  ["Delivery", [
    ["Vercel", ["bhatkal-time-luxe"]],
    ["Ubuntu, self-hosted", ["bhatkal-time-luxe", "querycraft"]],
  ]],
];
