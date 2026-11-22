import { test } from "node:test";
import assert from "node:assert/strict";
import { SITE, VALID, PNG, article, buildFiles, siteFiles, read, page, resolve } from "./helpers.js";

const NAME = "articles/2026-01-21-un-article.md";

async function refused(name, files, ...mentions) {
  const r = await buildFiles(name, files);
  assert.ok(r.refused, `build should be refused\n${r.output}`);
  for (const m of mentions) assert.ok(r.output.includes(m), `message should name ${m}\n${r.output}`);
  return r;
}

async function accepted(name, files) {
  const r = await buildFiles(name, files);
  assert.ok(!r.refused, `build should succeed\n${r.output}`);
  return r;
}

// /operations/generalites/refus
// /operations/generalites/sortie : rien n'est attendu de la sortie après un refus.
test("un refus échoue et nomme le fichier en cause", async () => {
  await refused("refus", { "site.json": SITE, "articles/2026-13-01-x.md": VALID }, "2026-13-01-x");
});

// /operations/etat-initial/vide
// /operations/construire-le-site/donnees
test("le dossier de contenu initial, vide, est refusé", async () => {
  await refused("vide", {});
});

// /operations/construire-le-site/fichier-inconnu
// /operations/generalites/refus
test("un fichier hors articles/*.md, site.json et medias/ est refusé", async () => {
  await refused("inconnu", {
    "site.json": SITE,
    [NAME]: VALID,
    "notes.txt": "x",
    "articles/brouillon.txt": "x",
  }, "notes.txt", "brouillon.txt");
  await refused("inconnu-sous-dossier", { "site.json": SITE, "articles/sous/2026-01-21-x.md": VALID }, "2026-01-21-x");
});

// /model/contenu
// /operations/construire-le-site/construit
test("les fichiers dont un segment commence par un point sont ignorés", async () => {
  await accepted("points", {
    "site.json": SITE,
    [NAME]: VALID,
    ".DS_Store": "x",
    "articles/.brouillon.md": "pas un article",
    ".cache/notes.txt": "x",
  });
});

// /operations/construire-le-site/donnees
// /operations/generalites/refus
test("des données du site absentes, illisibles ou incomplètes sont refusées", async () => {
  await refused("donnees-absentes", { [NAME]: VALID });
  const cases = {
    "donnees-json": "{ titre: ",
    "donnees-tableau": "[]",
    "donnees-null": "null",
    "donnees-texte": '"x"',
    "donnees-sans-titre": JSON.stringify({ auteur: "A" }),
    "donnees-sans-auteur": JSON.stringify({ titre: "T" }),
    "donnees-titre-nombre": JSON.stringify({ titre: 42, auteur: "A" }),
    "donnees-auteur-nombre": JSON.stringify({ titre: "T", auteur: 1 }),
    "donnees-titre-vide": JSON.stringify({ titre: "", auteur: "A" }),
    "donnees-auteur-vide": JSON.stringify({ titre: "T", auteur: "" }),
    "donnees-titre-null": JSON.stringify({ titre: null, auteur: "A" }),
  };
  for (const [name, site] of Object.entries(cases)) await refused(name, { "site.json": site, [NAME]: VALID }, "site.json");
});

// /operations/construire-le-site/donnees
// /model/contenu
test("les autres champs des données du site sont ignorés", async () => {
  await accepted("donnees-extra", { "site.json": JSON.stringify({ titre: "T", auteur: "A", autre: 1 }), [NAME]: VALID });
});

// /operations/construire-le-site/nom
// /operations/generalites/refus
test("un article au nom invalide est refusé", async () => {
  const names = [
    "article",
    "2026-1-21-x",
    "2026-13-01-x",
    "2026-02-30-x",
    "2026-01-21-",
    "2026-01-21-Majuscule",
    "2026-01-21-été",
    "2026-01-21--x",
    "2026-01-21-x-",
    "2026-01-21-a_b",
  ];
  for (const [i, n] of names.entries()) await refused(`nom-${i}`, { "site.json": SITE, [`articles/${n}.md`]: VALID }, n);
});

// /operations/construire-le-site/nom
test("un nom fait de minuscules, chiffres et tirets intérieurs est valide", async () => {
  await accepted("nom-valide", { "site.json": SITE, "articles/2024-02-29-a1-b2-c.md": VALID });
});

// /operations/construire-le-site/entete
// /operations/generalites/refus
test("un article sans en-tête ou à l'en-tête mal formé est refusé", async () => {
  const texts = {
    "entete-absent": "Du texte sans en-tête.\n",
    "entete-yaml": "---\ntitre: [ouvert\n---\nx\n",
    "entete-liste": "---\n- a\n- b\n---\nx\n",
    "entete-non-ferme": "---\ntitre: T\nlangue: fr\nx\n",
    "entete-pas-en-tete": "\n---\ntitre: T\nlangue: fr\n---\nx\n",
    "entete-nombre": article("titre: Un titre\nlangue: fr\nrésumé: 42"),
    "entete-objet": article("titre: Un titre\nlangue: fr\nrésumé:\n  a: b"),
  };
  for (const [name, txt] of Object.entries(texts)) await refused(name, { "site.json": SITE, [NAME]: txt }, "2026-01-21-un-article");
});

// /operations/construire-le-site/entete
// /model/article
test("un champ reconnu de valeur nulle ou vide est accepté", async () => {
  await accepted("entete-null", { "site.json": SITE, [NAME]: article({ titre: "T", langue: "fr", "résumé": null }) });
  await accepted("entete-vide", { "site.json": SITE, [NAME]: article({ titre: "T", langue: "fr", "résumé": "" }) });
});

// /operations/construire-le-site/titre
// /operations/generalites/refus
test("un article sans titre ou au titre vide est refusé", async () => {
  await refused("titre-absent", { "site.json": SITE, [NAME]: article({ langue: "fr" }) }, "2026-01-21-un-article");
  await refused("titre-vide", { "site.json": SITE, [NAME]: article({ titre: "", langue: "fr" }) }, "2026-01-21-un-article");
  await refused("titre-null", { "site.json": SITE, [NAME]: article({ titre: null, langue: "fr" }) }, "2026-01-21-un-article");
});

// /operations/construire-le-site/langue
// /operations/generalites/refus
test("un article sans langue ou d'une autre langue que fr et en est refusé", async () => {
  await refused("langue-absente", { "site.json": SITE, [NAME]: article({ titre: "T" }) }, "2026-01-21-un-article");
  await refused("langue-de", { "site.json": SITE, [NAME]: article({ titre: "T", langue: "de" }) }, "2026-01-21-un-article");
  await refused("langue-null", { "site.json": SITE, [NAME]: article({ titre: "T", langue: null }) }, "2026-01-21-un-article");
  await refused("langue-vide", { "site.json": SITE, [NAME]: article({ titre: "T", langue: "" }) }, "2026-01-21-un-article");
  await refused("langue-FR", { "site.json": SITE, [NAME]: article({ titre: "T", langue: "FR" }) }, "2026-01-21-un-article");
});

// /operations/construire-le-site/langue
test("les langues fr et en sont acceptées", async () => {
  await accepted("langues", {
    "site.json": SITE,
    "articles/2026-01-21-a.md": article({ titre: "A", langue: "fr" }),
    "articles/2026-01-22-b.md": article({ titre: "B", langue: "en" }),
  });
});

// /operations/construire-le-site/champ-inconnu
// /operations/generalites/refus
test("un champ d'en-tête non reconnu est refusé, même vide", async () => {
  await refused("champ-inconnu", { "site.json": SITE, [NAME]: article({ titre: "T", langue: "fr", tags: "x" }) }, "2026-01-21-un-article");
  await refused("champ-inconnu-vide", { "site.json": SITE, [NAME]: article({ titre: "T", langue: "fr", titel: null }) }, "2026-01-21-un-article");
});

// /operations/construire-le-site/script
// /operations/generalites/refus
test("un corps qui contient un script est refusé", async () => {
  const bodies = {
    "script-element": "<script>alert(1)</script>\n",
    "script-majuscules": "<SCRIPT>alert(1)</SCRIPT>\n",
    "script-evenement": '<p onclick="alert(1)">x</p>\n',
    "script-adresse": '<a href="javascript:alert(1)">x</a>\n',
    "script-adresse-casse": '<a href="  JavaScript:alert(1)">x</a>\n',
    "script-adresse-src": '<iframe src="javascript:alert(1)"></iframe>\n',
  };
  for (const [name, body] of Object.entries(bodies)) {
    await refused(name, { "site.json": SITE, [NAME]: article({ titre: "T", langue: "fr" }, body) }, "2026-01-21-un-article");
  }
});

// /operations/construire-le-site/script
test("un script montré dans du code n'est pas un script", async () => {
  const body = "Le code `<script>x()</script>` :\n\n```html\n<script>alert(1)</script>\n<p onclick=\"f()\">x</p>\n<a href=\"javascript:f()\">x</a>\n```\n";
  await accepted("script-code", { "site.json": SITE, [NAME]: article({ titre: "T", langue: "fr" }, body) });
});

// /operations/construire-le-site/alt
// /operations/generalites/refus
test("une image sans alt ou à l'alt vide est refusée", async () => {
  const bodies = {
    "alt-markdown": "![](/medias/a.png)\n",
    "alt-html": '<img src="/medias/a.png">\n',
    "alt-vide": '<img src="/medias/a.png" alt="">\n',
    "alt-externe": '<img src="https://exemple.invalid/a.png">\n',
  };
  for (const [name, body] of Object.entries(bodies)) {
    await refused(name, { "site.json": SITE, "medias/a.png": PNG, [NAME]: article({ titre: "T", langue: "fr" }, body) }, "2026-01-21-un-article");
  }
});

// /operations/construire-le-site/image-illisible
// /operations/generalites/refus
test("une image vers un fichier de medias/ qui n'est pas une image est refusée", async () => {
  await refused("image-illisible", {
    "site.json": SITE,
    "medias/faux.png": "pas une image",
    [NAME]: article({ titre: "T", langue: "fr" }, "![Une image](/medias/faux.png)\n"),
  }, "faux.png");
});

// /operations/construire-le-site/lien-mort
// /operations/generalites/refus
test("un lien interne vers une cible absente est refusé, le message nomme l'article et la cible", async () => {
  const cases = {
    "mort-absolu": ["[x](/articles/2026-01-01-absent/)", "/articles/2026-01-01-absent/"],
    "mort-relatif": ["[x](../2026-01-01-absent/)", "2026-01-01-absent"],
    "mort-media": ['<a href="/medias/absent.pdf">x</a>', "/medias/absent.pdf"],
    "mort-image": ["![Une image](/medias/absente.png)", "/medias/absente.png"],
  };
  for (const [name, [body, target]] of Object.entries(cases)) {
    await refused(name, { "site.json": SITE, [NAME]: article({ titre: "T", langue: "fr" }, body + "\n") },
      "articles/2026-01-21-un-article.md", target);
  }
});

// /operations/construire-le-site/lien-mort
test("les formes admises d'un lien interne existant sont acceptées", async () => {
  const body = [
    "[a](/articles/2026-01-22-autre/)",
    "[b](/articles/2026-01-22-autre)",
    "[c](/articles/2026-01-22-autre/index.html)",
    "[d](/)",
    "[e](/index.html)",
    "[f](#section)",
    "[g](/articles/2026-01-22-autre/?q=1#x)",
    "[h](../2026-01-22-autre/)",
    "[i](/medias/doc.pdf)",
    '<a href="">j</a>',
    "[k](https://exemple.invalid/absent)",
    "[l](mailto:moi@exemple.invalid)",
    "[m](//exemple.invalid/absent)",
  ].join("\n\n");
  await accepted("liens-valides", {
    "site.json": SITE,
    "medias/doc.pdf": "%PDF-1.4",
    [NAME]: article({ titre: "T", langue: "fr" }, body + "\n"),
    "articles/2026-01-22-autre.md": VALID,
  });
});

// /operations/construire-le-site/construit
test("une construction réussie produit les pages, la feuille de style, les médias et CNAME", async () => {
  const r = await accepted("construit", {
    "site.json": SITE,
    "medias/doc.pdf": "%PDF-1.4",
    "medias/sous/b.png": PNG,
    [NAME]: VALID,
  });
  const files = siteFiles(r.outDir);
  for (const f of ["/index.html", "/articles/2026-01-21-un-article/index.html", "/medias/doc.pdf", "/medias/sous/b.png", "/CNAME"]) {
    assert.ok(files.includes(f), `${f} missing from ${files.join(", ")}`);
  }
  assert.equal(read(r.outDir, "CNAME").trim(), "jirm.eu");
  const css = [...page(r.outDir, "/").querySelectorAll('link[rel="stylesheet"]')].map((l) => l.getAttribute("href"));
  assert.ok(css.length > 0, "no stylesheet linked");
  for (const href of css) assert.ok(files.includes(resolve("/", href)), `${href} missing`);
});
