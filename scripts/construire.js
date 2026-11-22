// Construction du site, appelable dans un processus : vérification du
// contenu, Eleventy, puis liens internes. Rend les erreurs au lieu de sortir.
import { resolve } from "node:path";
import { verifierContenu } from "./contenu.js";
import { verifierLiens } from "./liens.js";

const CONFIG = resolve(import.meta.dirname, "..", "eleventy.config.js");

/** L'instance d'Eleventy pour un dossier de contenu vérifié. */
export async function eleventy({ contenu, sortie, site, serve = false }) {
  // Chargée après la vérification, pour qu'un refus sorte vite.
  const { default: Eleventy } = await import("@11ty/eleventy");
  return new Eleventy(contenu, sortie, {
    quietMode: true,
    configPath: CONFIG,
    runMode: serve ? "serve" : "build",
    config(cfg) {
      cfg.addGlobalData("site", site);
    },
  });
}

/** Construit le site ; `erreurs` est vide si et seulement si la construction réussit. */
export async function construire({ contenu, sortie }) {
  contenu = resolve(contenu);
  sortie = resolve(sortie);
  const { erreurs, site } = await verifierContenu(contenu);
  if (erreurs.length) return { erreurs };
  try {
    await (await eleventy({ contenu, sortie, site })).write();
  } catch (e) {
    return { erreurs: [String(e?.message ?? e) || "Échec de la construction."] };
  }
  return { erreurs: verifierLiens(sortie) };
}
