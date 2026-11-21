import { test, before } from "node:test";
import assert from "node:assert/strict";
import { SITE, PNG, article, buildFiles, page, text, siteFiles, resolve, reaches } from "./helpers.js";

const ALPHA = "2026-03-15-alpha";
const BRAVO = "2026-02-14-bravo";
const CHARLIE = "2026-01-21-charlie";
let out;

before(() => {
  const r = buildFiles("ui", {
    "site.json": SITE,
    "medias/a.png": PNG,
    [`articles/${ALPHA}.md`]: article(
      { titre: "Alpha", langue: "fr", "résumé": "Un résumé." },
      "Premier paragraphe en **gras**.\n\n![Une image](/medias/a.png)\n\n```js\nconst x = 1;\n```\n\nFin du corps.\n",
    ),
    [`articles/${BRAVO}.md`]: article({ titre: "Bravo", langue: "fr" }),
    [`articles/${CHARLIE}.md`]: article({ titre: "Charlie", langue: "en", "résumé": "" }, "Body text.\n"),
  });
  assert.equal(r.code, 0, r.output);
  out = r.outDir;
});

const PAGES = ["/", `/articles/${ALPHA}/`, `/articles/${BRAVO}/`, `/articles/${CHARLIE}/`];

// The produced file a URL of the page at `from` reaches.
function produced(files, from, url) {
  const p = resolve(from, url);
  return files.includes(p) || files.includes(p.replace(/\/?$/, "/index.html"));
}

// /ui/generalites/langue-page
test("chaque page déclare sa langue", () => {
  assert.equal(page(out, "/").documentElement.getAttribute("lang"), "fr");
  assert.equal(page(out, `/articles/${ALPHA}/`).documentElement.getAttribute("lang"), "fr");
  assert.equal(page(out, `/articles/${CHARLIE}/`).documentElement.getAttribute("lang"), "en");
});

// /ui/generalites/sans-script
test("aucune page produite ne contient de script", () => {
  const html = siteFiles(out).filter((f) => f.endsWith(".html"));
  assert.ok(html.length >= PAGES.length, `pages: ${html}`);
  for (const f of html) {
    const doc = page(out, f);
    assert.equal(doc.querySelectorAll("script").length, 0, f);
    for (const el of doc.querySelectorAll("*")) {
      for (const a of el.attributes) {
        assert.ok(!/^on/i.test(a.name), `${f}: ${a.name}`);
        assert.ok(!/^\s*javascript:/i.test(a.value), `${f}: ${a.value}`);
      }
    }
  }
});

// /ui/generalites/bandeau
test("chaque page montre en haut le titre du site, lien vers l'accueil", () => {
  const first = { "/": "Alpha", [`/articles/${ALPHA}/`]: "Alpha", [`/articles/${BRAVO}/`]: "Bravo", [`/articles/${CHARLIE}/`]: "Charlie" };
  for (const p of PAGES) {
    const doc = page(out, p);
    const links = [...doc.querySelectorAll("a")].filter((a) => a.textContent.trim() === "Blog de test");
    assert.ok(links.some((a) => reaches(resolve(p, a.getAttribute("href") ?? ""), "/")), p);
    const t = text(doc);
    assert.ok(t.indexOf("Blog de test") >= 0 && t.indexOf("Blog de test") < t.indexOf(first[p]), p);
  }
});

// /ui/generalites/pied
test("chaque page montre en bas l'auteur", () => {
  const last = { "/": "Charlie", [`/articles/${ALPHA}/`]: "Fin du corps.", [`/articles/${BRAVO}/`]: "Du texte.", [`/articles/${CHARLIE}/`]: "Body text." };
  for (const p of PAGES) {
    const t = text(page(out, p));
    assert.ok(t.lastIndexOf("A. Auteur") > t.lastIndexOf(last[p]), `${p}: ${t.slice(-80)}`);
  }
});

// /ui/generalites/date
test("les dates s'écrivent en toutes lettres dans la langue de la page", () => {
  const home = text(page(out, "/"));
  for (const d of ["15 mars 2026", "14 février 2026", "21 janvier 2026"]) assert.ok(home.includes(d), d);
  assert.ok(text(page(out, `/articles/${CHARLIE}/`)).includes("January 21, 2026"));
});

// /ui/page-daccueil/liste
// /ui/generalites/indicateur
test("l'accueil liste les articles du plus récent au plus ancien, avec date, langue et résumé", () => {
  const doc = page(out, "/");
  const t = text(doc);
  const at = ["Alpha", "Bravo", "Charlie"].map((x) => t.indexOf(x));
  assert.ok(at.every((i) => i >= 0) && at[0] < at[1] && at[1] < at[2], `order ${at}`);
  const items = [t.slice(at[0], at[1]), t.slice(at[1], at[2]), t.slice(at[2])];
  assert.ok(items[0].includes("15 mars 2026") && /\bFR\b/.test(items[0]) && items[0].includes("Un résumé."), items[0]);
  assert.ok(items[0].indexOf("Un résumé.") > items[0].indexOf("15 mars 2026"), "résumé before date");
  assert.ok(items[0].indexOf("Un résumé.") > items[0].search(/\bFR\b/), "résumé before indicator");
  assert.ok(items[1].includes("14 février 2026") && /\bFR\b/.test(items[1]), items[1]);
  assert.ok(items[2].includes("21 janvier 2026") && /\bEN\b/.test(items[2]), items[2]);
  for (const [title, nom] of [["Alpha", ALPHA], ["Bravo", BRAVO], ["Charlie", CHARLIE]]) {
    const a = [...doc.querySelectorAll("a")].find((x) => x.textContent.trim() === title);
    assert.ok(a, title);
    assert.ok(reaches(resolve("/", a.getAttribute("href") ?? ""), `/articles/${nom}/`), a.getAttribute("href"));
  }
});

// /ui/page-daccueil/aucun
test("sans article, l'accueil le dit", () => {
  const r = buildFiles("ui-aucun", { "site.json": SITE });
  assert.equal(r.code, 0, r.output);
  assert.ok(text(page(r.outDir, "/")).includes("Aucun article pour l'instant."));
});

// /ui/page-darticle/titre
// /ui/page-darticle/date
// /ui/page-darticle/corps
test("la page d'article montre son titre, sa date puis son corps", () => {
  const doc = page(out, `/articles/${ALPHA}/`);
  const h1 = doc.querySelectorAll("h1");
  assert.equal(h1.length, 1);
  assert.equal(h1[0].textContent.trim(), "Alpha");
  const t = text(doc);
  const iTitle = t.indexOf("Alpha");
  const iDate = t.indexOf("15 mars 2026");
  assert.ok(iTitle >= 0 && iTitle < iDate && iDate < t.indexOf("Premier paragraphe"));
  assert.ok([...doc.querySelectorAll("strong")].some((s) => s.textContent === "gras"));
});

// /ui/page-darticle/code
test("un bloc de code qui nomme son langage est coloré à la construction", () => {
  const pre = [...page(out, `/articles/${ALPHA}/`).querySelectorAll("pre")].find((p) => p.textContent.includes("const x = 1;"));
  assert.ok(pre, "no code block");
  const code = pre.querySelector("code") ?? pre;
  assert.ok(code.querySelectorAll("*").length > 0, "code block not highlighted");
});

// /ui/page-darticle/image
test("une image de medias/ est servie en plusieurs formats, avec dimensions et alt", () => {
  const from = `/articles/${ALPHA}/`;
  const doc = page(out, from);
  const img = doc.querySelector('img[alt="Une image"]');
  assert.ok(img, "no image");
  assert.ok(img.getAttribute("width") && img.getAttribute("height"), "no dimensions");
  const picture = img.closest("picture");
  assert.ok(picture, "no picture element");
  const files = siteFiles(out);
  const formats = new Set();
  for (const el of [...picture.querySelectorAll("source"), img]) {
    const set = el.getAttribute("srcset") || el.getAttribute("src") || "";
    const urls = set.split(",").map((part) => part.trim().split(/\s+/)[0]).filter(Boolean);
    assert.ok(urls.length > 0);
    for (const url of urls) {
      assert.ok(produced(files, from, url), `${url} not produced`);
      formats.add(el.getAttribute("type") || resolve(from, url).split(".").pop());
    }
  }
  assert.ok(formats.size >= 2, `formats: ${[...formats]}`);
});
