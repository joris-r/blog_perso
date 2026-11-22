import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync, readFileSync, existsSync, readdirSync, statSync, cpSync } from "node:fs";
import { dirname, join, relative, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";
import { parseHTML } from "linkedom";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TMP = join(ROOT, "tests", "fixtures", "tmp");

// A valid 40x30 PNG image.
export const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAACgAAAAeCAIAAADRv8uKAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAPUlEQVRIie3VQQ0AMAwCwMlBDrKRNRnb45L+mzSUO2uezLG4Tj3hineqApnKDCSKxWCxWBwWg8VicV+xeAEvntxMzTu5rAAAAABJRU5ErkJggg==",
  "base64",
);

export const SITE = JSON.stringify({ titre: "Blog de test", auteur: "A. Auteur" });

/** Text of an article file: a YAML header from `fields` (raw lines allowed), then `body`. */
export function article(fields, body = "Du texte.\n") {
  const lines = typeof fields === "string"
    ? fields
    : Object.entries(fields).map(([k, v]) => `${k}: ${v === null ? "" : JSON.stringify(v)}`).join("\n");
  return `---\n${lines}\n---\n${body}`;
}

/** A valid article file for name-independent tests. */
export const VALID = article({ titre: "Un titre", langue: "fr" });

/** Writes a content folder under tests/fixtures/tmp/<name>/content from {path: text|Buffer}. */
export function makeContent(name, files) {
  const dir = join(TMP, name, "content");
  rmSync(join(TMP, name), { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  for (const [path, data] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), data);
  }
  return dir;
}

/** Copies a committed fixture folder of tests/fixtures/ to tmp, then applies `changes`. */
export function copyFixture(fixture, name, changes = {}) {
  const dir = join(TMP, name, "content");
  rmSync(join(TMP, name), { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  cpSync(join(ROOT, "tests", "fixtures", fixture), dir, { recursive: true });
  for (const [path, data] of Object.entries(changes)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), data);
  }
  return dir;
}

/** Runs `npm run build` on a content folder; the site goes next to it, in `site/`. */
export function buildCommand(contentDir) {
  const outDir = join(dirname(contentDir), "site");
  rmSync(outDir, { recursive: true, force: true });
  const r = spawnSync("npm", ["run", "--silent", "build"], {
    cwd: ROOT,
    env: { ...process.env, CONTENT_DIR: contentDir, OUTPUT_DIR: outDir },
    encoding: "utf8",
  });
  return { code: r.status, output: `${r.stdout}\n${r.stderr}`, outDir };
}

// eleventy-img keeps module-level caches (of images and of folders it created)
// across builds: two in-process builds into the same output folder diverge from
// `npm run build`. Each output folder is therefore built once per process.
const built = new Set();

/** Calls the build in this process on a content folder; the site goes next to it, in `site/`. */
export async function build(contentDir) {
  const outDir = resolvePath(dirname(contentDir), "site");
  if (built.has(outDir)) throw new Error(`${outDir} already built in this test process`);
  built.add(outDir);
  rmSync(outDir, { recursive: true, force: true });
  const { construire } = await import("../scripts/construire.js");
  const { erreurs } = await construire({ contenu: contentDir, sortie: outDir });
  return { refused: erreurs.length > 0, output: erreurs.join("\n"), outDir };
}

/** Builds in this process a content folder made from `files`, under a tmp name. */
export function buildFiles(name, files) {
  return build(makeContent(name, files));
}

/** The DOM document of the page at URL `path` of a produced site. */
export function page(outDir, path) {
  const file = path.endsWith("/") ? join(outDir, path, "index.html") : join(outDir, path);
  return parseHTML(readFileSync(file, "utf8")).document;
}

/** Normalized visible text of a document's body. */
export function text(doc) {
  return doc.body.textContent.replace(/\s+/g, " ").trim();
}

/** All files of a produced site, as URL paths. */
export function siteFiles(outDir) {
  const out = [];
  const walk = (d) => {
    for (const e of readdirSync(d)) {
      const p = join(d, e);
      if (statSync(p).isDirectory()) walk(p);
      else out.push("/" + relative(outDir, p).split("\\").join("/"));
    }
  };
  if (existsSync(outDir)) walk(outDir);
  return out;
}

/** The URL path that `href` reaches from the page at URL `from`, without query or fragment. */
export function resolve(from, href) {
  return new URL(href, `http://site${from}`).pathname;
}

/** Whether URL `url` reaches the page `/<path>/` (or `/` itself). */
export function reaches(url, pagePath) {
  if (pagePath === "/") return url === "/" || url === "/index.html";
  const base = pagePath.replace(/\/$/, "");
  return [base, `${base}/`, `${base}/index.html`].includes(url);
}

export function read(outDir, path) {
  return readFileSync(join(outDir, path), "utf8");
}
