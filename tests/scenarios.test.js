import { test } from "node:test";
import assert from "node:assert/strict";
import { build, copyFixture, page, text } from "./helpers.js";

function follow(from, href) {
  const url = new URL(href, `http://site${from}`).pathname;
  return url.endsWith("/") || url.endsWith(".html") ? url : `${url}/`;
}

// /scenarios/deux-articles
test("scénario : deux articles", () => {
  const r = build(copyFixture("deux-articles", "scenario-deux-articles"));
  assert.equal(r.code, 0, r.output);

  const home = page(r.outDir, "/");
  const t = text(home);
  const iSecond = t.indexOf("Second");
  const iPremier = t.indexOf("Premier");
  assert.ok(iSecond >= 0 && iSecond < iPremier);
  const second = t.slice(iSecond, iPremier);
  for (const x of ["EN", "20 février 2026", "Un résumé."]) assert.ok(second.includes(x), x);
  const premier = t.slice(iPremier);
  for (const x of ["FR", "10 janvier 2026"]) assert.ok(premier.includes(x), x);

  const link = [...home.querySelectorAll("a")].find((a) => a.textContent.trim() === "Second");
  assert.ok(link, "no link to Second");
  const secondUrl = follow("/", link.getAttribute("href"));
  const secondPage = page(r.outDir, secondUrl);
  assert.equal(secondPage.documentElement.getAttribute("lang"), "en");
  assert.ok(text(secondPage).includes("February 20, 2026"));

  const toFirst = [...secondPage.querySelectorAll("a")].find((a) => (a.getAttribute("href") ?? "").includes("2026-01-10-premier"));
  assert.ok(toFirst, "no link to the first article");
  const firstPage = page(r.outDir, follow(secondUrl, toFirst.getAttribute("href")));
  assert.equal(firstPage.querySelector("h1").textContent.trim(), "Premier");
  const pre = [...firstPage.querySelectorAll("pre")].find((p) => p.textContent.includes("const premier"));
  assert.ok(pre && (pre.querySelector("code") ?? pre).querySelectorAll("*").length > 0, "code not highlighted");
});

// /scenarios/lien-casse
test("scénario : lien cassé", () => {
  const second = "---\ntitre: Second\nlangue: en\nrésumé: Un résumé.\n---\nSee [the first one](/articles/2026-01-11-premier/).\n";
  const r = build(copyFixture("deux-articles", "scenario-lien-casse", { "articles/2026-02-20-second.md": second }));
  assert.notEqual(r.code, 0, r.output);
  assert.ok(r.output.includes("articles/2026-02-20-second.md"), r.output);
  assert.ok(r.output.includes("/articles/2026-01-11-premier/"), r.output);
});
