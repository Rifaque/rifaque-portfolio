// Network check of every external link in the built site. Not part of the
// build (it depends on third-party uptime); run with `npm run check:links`.
// LinkedIn answers automated requests with 999, which is reported as
// "blocked" rather than as a failure.

import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dist = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const files = [];
const walk = async (dir) => {
  for (const name of await readdir(dir)) {
    const p = join(dir, name);
    if ((await stat(p)).isDirectory()) await walk(p);
    else if (name.endsWith(".html")) files.push(p);
  }
};
await walk(dist);

const links = new Set();
for (const f of files) {
  for (const m of (await readFile(f, "utf8")).matchAll(/<a\b[^>]*\bhref="(https?:\/\/[^"]+)"/g)) links.add(m[1].replace(/&amp;/g, "&"));
}

let failed = 0;
for (const url of [...links].sort()) {
  let status;
  try {
    const res = await fetch(url, { method: "GET", redirect: "follow", headers: { "user-agent": "Mozilla/5.0 (link check)" } });
    status = res.status;
  } catch (e) {
    status = `error: ${e.cause?.code ?? e.message}`;
  }
  const blocked = status === 999 || (status === 403 && /linkedin\.com/.test(url));
  const ok = typeof status === "number" && status < 400;
  if (!ok && !blocked) failed += 1;
  console.log(`${ok ? "ok     " : blocked ? "blocked" : "FAIL   "} ${status}  ${url}`);
}
if (failed) {
  console.error(`${failed} external link(s) failed`);
  process.exit(1);
}
