import { readFileSync } from "node:fs";
import { basename, join, relative, sep } from "node:path";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import { parseHTML } from "linkedom";
import { dateValide, estInterne, chemin } from "./scripts/contenu.js";

const SRC = join(import.meta.dirname, "src");

const nomDe = (inputPath) => basename(inputPath, ".md");

function dateTexte(nom, langue) {
  return new Intl.DateTimeFormat(langue === "en" ? "en-US" : "fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(dateValide(nom));
}

/** Valeur d'attribut telle que posthtml la donne, entités HTML décodées. */
function decoderEntites(brut) {
  return parseHTML(`<p>${brut.replace(/</g, "&lt;")}</p>`).document.querySelector("p").textContent;
}

/** Avant eleventy-img : seules les images de /medias/ sont transformées, par leur chemin résolu. */
function imagesDeMedias(context) {
  return (tree) => {
    tree.match({ tag: "img" }, (img) => {
      const src = decoderEntites(img.attrs?.src ?? "");
      const cible = estInterne(src) ? chemin(src, context?.url ?? "/") : null;
      // eleventy-img décode le chemin une fois : on le lui donne encodé.
      if (cible && cible.startsWith("/medias/")) img.attrs.src = encodeURI(cible);
      else img.attrs = { ...img.attrs, "eleventy:ignore": "" };
      return img;
    });
    return tree;
  };
}

export default function (cfg) {
  const input = cfg.directories.input;
  cfg.setUseGitIgnore(false);
  // Le .eleventyignore du contenu est un fichier en « . », exclu : on retire ses motifs, les
  // seuls relatifs parmi ceux d'Eleventy, hormis .git (sortie, gabarits, _data, node_modules).
  cfg.on("eleventy.ignores", (ignores) => {
    for (let i = ignores.length - 1; i >= 0; i--) {
      const p = ignores[i];
      if (!p.startsWith("/") && !p.startsWith("**/") && p !== "./.git/**") ignores.splice(i, 1);
    }
  });

  // Seuls articles/*.md et la page d'accueil sont des gabarits.
  cfg.addPreprocessor("gabarits", "md,njk", (data) => {
    const rel = relative(input, data.page.inputPath).split(sep);
    const article = rel.length === 2 && rel[0] === "articles" && !rel[1].startsWith(".") && rel[1].endsWith(".md");
    const accueil = rel.length === 1 && rel[0] === "index.njk";
    if (!article && !accueil) return false;
  });

  cfg.addPlugin(syntaxHighlight);
  cfg.htmlTransformer.addPosthtmlPlugin("html", imagesDeMedias, { priority: 10 });
  cfg.addPlugin(eleventyImageTransformPlugin, {
    formats: ["avif", "webp", "auto"],
    widths: ["auto"],
    htmlOptions: { imgAttributes: { loading: "lazy", decoding: "async" } },
  });

  cfg.addPassthroughCopy(
    { [join(input, "medias")]: "medias" },
    { filter: (p) => !p.split("/").some((s) => s.startsWith(".")) },
  );
  cfg.addPassthroughCopy({ [join(SRC, "style.css")]: "style.css", [join(SRC, "CNAME")]: "CNAME" });

  cfg.addFilter("dateTexte", dateTexte);
  cfg.addFilter("indicateur", (langue) => (langue === "en" ? "EN" : "FR"));

  // Données communes aux articles ; la page d'accueil les remplace.
  cfg.addGlobalData("layout", "article.njk");
  cfg.addGlobalData("permalink", () => (data) => `/articles/${nomDe(data.page.inputPath)}/`);
  cfg.addGlobalData("eleventyComputed", {
    nom: (data) => nomDe(data.page.inputPath),
    // Le nom du champ peut être écrit en Unicode décomposé.
    "résumé": (data) => Object.entries(data).find(([k]) => k.normalize("NFC") === "résumé")?.[1],
  });

  cfg.addCollection("articles", (api) =>
    api
      .getAll()
      .filter((p) => p.data.layout === "article.njk")
      .sort((a, b) => (a.data.nom < b.data.nom ? 1 : -1)),
  );

  cfg.addTemplate("index.njk", readFileSync(join(SRC, "index.njk"), "utf8"), {
    layout: "base.njk",
    permalink: "/",
  });

  return {
    templateFormats: ["md", "njk"],
    markdownTemplateEngine: false,
    dir: { includes: relative(input, join(SRC, "_includes")) },
  };
}
