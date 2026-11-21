// Vérification des liens internes du site produit.
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { parseHTML } from "linkedom";
import { estInterne, chemin } from "./contenu.js";

function fichiers(dir) {
  const out = [];
  const walk = (d) => {
    for (const e of readdirSync(d)) {
      const p = join(d, e);
      if (statSync(p).isDirectory()) walk(p);
      else out.push("/" + relative(dir, p).split(sep).join("/"));
    }
  };
  walk(dir);
  return out;
}

/** Renvoie la liste des messages de liens morts. */
export function verifierLiens(sortie) {
  const tous = new Set(fichiers(sortie));
  const existe = (p) => tous.has(p) || tous.has(p.replace(/\/?$/, "/index.html"));
  const erreurs = [];
  for (const f of tous) {
    if (!f.endsWith(".html")) continue;
    const url = f.endsWith("/index.html") ? f.slice(0, -"index.html".length) : f;
    const article = /^\/articles\/([^/]+)\/$/.exec(url);
    const nomme = article ? `articles/${article[1]}.md` : f.slice(1);
    const { document } = parseHTML(readFileSync(join(sortie, f), "utf8"));
    for (const el of document.querySelectorAll("[href], [src]")) {
      for (const attr of ["href", "src"]) {
        const v = el.getAttribute(attr);
        if (v === null || !estInterne(v)) continue;
        const cible = chemin(v, url);
        if (cible === null || !existe(cible)) erreurs.push(`${nomme} : lien mort vers ${v}`);
      }
    }
  }
  return erreurs;
}
