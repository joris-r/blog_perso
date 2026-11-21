// Lecture et vérification de forme du dossier de contenu, avant la construction.
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";
import yaml from "js-yaml";
import markdownIt from "markdown-it";
import { parseHTML } from "linkedom";
import sharp from "sharp";

const CHAMPS = new Set(["titre", "langue", "résumé"]);
const NOM = /^(\d{4})-(\d{2})-(\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)$/;

/** Les fichiers du dossier, chemins relatifs avec `/`, hors segments commençant par `.`. */
function fichiers(dir) {
  const out = [];
  const walk = (d) => {
    for (const e of readdirSync(d)) {
      if (e.startsWith(".")) continue;
      const p = join(d, e);
      if (statSync(p).isDirectory()) walk(p);
      else out.push(relative(dir, p).split(sep).join("/"));
    }
  };
  if (existsSync(dir)) walk(dir);
  return out;
}

export function dateValide(nom) {
  const m = NOM.exec(nom);
  if (!m) return null;
  const [, a, mo, j] = m.map(Number);
  const d = new Date(0);
  d.setUTCFullYear(a, mo - 1, j);
  if (d.getUTCFullYear() !== a || d.getUTCMonth() !== mo - 1 || d.getUTCDate() !== j) return null;
  return d;
}

/** Sépare l'en-tête YAML du corps ; null sans en-tête. */
function separer(texte) {
  const lignes = texte.replace(/^\uFEFF/, "").split(/\r?\n/);
  if (lignes[0] !== "---") return null;
  const fin = lignes.indexOf("---", 1);
  if (fin < 0) return null;
  return { entete: lignes.slice(1, fin).join("\n"), corps: lignes.slice(fin + 1).join("\n") };
}

const vide = (v) => v === null || v === undefined || v === "";

function lireEntete(src) {
  let data;
  try {
    data = yaml.load(src);
  } catch {
    return { erreur: "en-tête YAML invalide" };
  }
  if (data === null || data === undefined) data = {};
  if (typeof data !== "object" || Array.isArray(data)) return { erreur: "l'en-tête n'est pas un objet YAML" };
  const norm = {};
  for (const [k, v] of Object.entries(data)) {
    if (v !== null && typeof v !== "string") return { erreur: `le champ « ${k} » n'est pas un texte` };
    norm[k.normalize("NFC")] = v;
  }
  return { data: norm };
}

const md = markdownIt({ html: true });

/** Vérifie le contenu ; renvoie { erreurs, site, articles }. */
export async function verifierContenu(dir) {
  const erreurs = [];
  const tous = fichiers(dir);
  const medias = new Set(tous.filter((f) => f.startsWith("medias/")).map((f) => f.slice("medias/".length)));
  const articlesMd = tous.filter((f) => /^articles\/[^/]+\.md$/.test(f));
  const autres = tous.filter((f) => f !== "site.json" && !f.startsWith("medias/") && !articlesMd.includes(f));

  // /operations/construire-le-site/fichier-inconnu
  for (const f of autres) erreurs.push(`${f} : fichier non reconnu dans le dossier de contenu`);

  // /operations/construire-le-site/donnees
  let site = null;
  if (!tous.includes("site.json")) {
    erreurs.push("site.json : données du site absentes");
  } else {
    try {
      const s = JSON.parse(readFileSync(join(dir, "site.json"), "utf8"));
      if (s === null || typeof s !== "object" || Array.isArray(s)) throw new Error("pas un objet");
      const manque = ["titre", "auteur"].filter((k) => typeof s[k] !== "string" || s[k] === "");
      if (manque.length) erreurs.push(`site.json : champ ${manque.join(", ")} absent, vide ou pas un texte`);
      else site = s;
    } catch {
      erreurs.push("site.json : pas un objet JSON valide");
    }
  }

  const articles = [];
  for (const f of articlesMd) {
    const nom = f.slice("articles/".length, -3);
    const err = (m) => erreurs.push(`${f} : ${m}`);
    if (!dateValide(nom)) {
      err("nom invalide, attendu AAAA-MM-JJ-<slug>");
      continue;
    }
    const parts = separer(readFileSync(join(dir, f), "utf8"));
    if (!parts) {
      err("en-tête absent");
      continue;
    }
    const { data, erreur } = lireEntete(parts.entete);
    if (erreur) {
      err(erreur);
      continue;
    }
    if (vide(data.titre)) err("titre absent");
    if (vide(data.langue)) err("langue absente");
    else if (!["fr", "en"].includes(data.langue)) err(`langue « ${data.langue} » ni fr ni en`);
    for (const k of Object.keys(data)) if (!CHAMPS.has(k)) err(`champ « ${k} » non reconnu`);
    await verifierCorps(parts.corps, nom, dir, medias, err);
    articles.push(nom);
  }
  return { erreurs, site, articles };
}

/** Script, texte alternatif, images illisibles ou absentes dans le corps rendu. */
async function verifierCorps(corps, nom, dir, medias, err) {
  const { document } = parseHTML(`<!doctype html><html><body>${md.render(corps)}</body></html>`);
  // /operations/construire-le-site/script
  if (document.querySelector("script")) err("le corps contient un élément script");
  for (const el of document.body.querySelectorAll("*")) {
    for (const a of el.attributes) {
      if (/^on/i.test(a.name)) err(`le corps contient un attribut d'événement ${a.name}`);
      if (/^javascript:/i.test(a.value.replace(/[\s\u0000-\u001f]/g, ""))) err("le corps contient une adresse javascript:");
    }
  }
  const page = `/articles/${nom}/`;
  for (const img of document.querySelectorAll("img")) {
    const src = img.getAttribute("src") ?? "";
    // /operations/construire-le-site/alt
    if (!img.getAttribute("alt")) err(`image ${src} sans texte alternatif`);
    // Les autres images internes sont vérifiées avec les liens, après la construction.
    if (!estInterne(src)) continue;
    const cible = chemin(src, page);
    if (cible === null) {
      err(`lien mort vers ${src}`);
      continue;
    }
    if (!cible.startsWith("/medias/")) continue;
    const media = cible.slice("/medias/".length);
    if (!medias.has(media)) {
      err(`lien mort vers ${src}`);
      continue;
    }
    // /operations/construire-le-site/image-illisible
    try {
      await sharp(join(dir, "medias", media)).metadata();
    } catch {
      err(`medias/${media} n'est pas une image lisible`);
    }
  }
}

/** Le chemin décodé que vise `url` depuis la page `page`, sans `?` ni `#` ; null s'il est mal encodé. */
export function chemin(url, page) {
  try {
    return decodeURIComponent(new URL(url, `http://site${page}`).pathname);
  } catch {
    return null;
  }
}

export function estInterne(url) {
  return !/^[a-z][a-z0-9+.-]*:/i.test(url) && !url.startsWith("//");
}
