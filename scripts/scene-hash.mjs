// Fingerprint of everything that decides how the hero scene looks. The gate's
// posters are pictures of that scene, so check-dist compares this with the value
// make-gate-posters.mjs recorded, and fails the build when they differ.
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCES = ["src/hero/hero.js", "src/hero/triplet.js", "src/hero/vendor/three.min.js"];

export async function sceneHash() {
  const hash = createHash("sha256");
  // Line endings differ between checkouts and do not change the scene.
  for (const f of SOURCES) hash.update((await readFile(join(root, f), "utf8")).replace(/\r\n/g, "\n"));
  return hash.digest("hex");
}
