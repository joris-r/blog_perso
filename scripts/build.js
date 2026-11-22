// Commande de construction : `npm run build`, ou `--serve` pour servir en local.
import { resolve } from "node:path";
import { construire, eleventy } from "./construire.js";
import { verifierContenu } from "./contenu.js";

const contenu = resolve(process.env.CONTENT_DIR ?? "content");
const sortie = resolve(process.env.OUTPUT_DIR ?? "_site");

function refuser(erreurs) {
  for (const e of erreurs) console.error(e);
  process.exit(1);
}

if (process.argv.includes("--serve")) {
  const { erreurs, site } = await verifierContenu(contenu);
  if (erreurs.length) refuser(erreurs);
  const e = await eleventy({ contenu, sortie, site, serve: true });
  await e.init();
  await e.watch();
  await e.serve();
} else {
  const { erreurs } = await construire({ contenu, sortie });
  if (erreurs.length) refuser(erreurs);
}
