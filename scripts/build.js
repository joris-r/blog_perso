// Construction du site : vérification du contenu, Eleventy, puis liens internes.
import { resolve } from "node:path";
import { verifierContenu } from "./contenu.js";
import { verifierLiens } from "./liens.js";

const contenu = resolve(process.env.CONTENT_DIR ?? "content");
const sortie = resolve(process.env.OUTPUT_DIR ?? "_site");
const serve = process.argv.includes("--serve");

function refuser(erreurs) {
  for (const e of erreurs) console.error(e);
  process.exit(1);
}

const { erreurs, site } = await verifierContenu(contenu);
if (erreurs.length) refuser(erreurs);

// Chargée après la vérification, pour qu'un refus sorte vite.
const { default: Eleventy } = await import("@11ty/eleventy");
const eleventy = new Eleventy(contenu, sortie, {
  quietMode: true,
  configPath: resolve(import.meta.dirname, "..", "eleventy.config.js"),
  runMode: serve ? "serve" : "build",
  config(cfg) {
    cfg.addGlobalData("site", site);
  },
});

if (serve) {
  await eleventy.init();
  await eleventy.watch();
  await eleventy.serve();
} else {
  try {
    await eleventy.write();
  } catch (e) {
    refuser([String(e?.message ?? e)]);
  }
  const morts = verifierLiens(sortie);
  if (morts.length) refuser(morts);
}
