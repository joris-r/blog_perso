# Technical

## Pile

- Site statique généré par Eleventy v3, sur Node.js 24 LTS, avec npm.
- Gabarits Nunjucks ; Markdown rendu par le moteur intégré
  d'Eleventy.
- Coloration du code à la construction, par
  `@11ty/eleventy-plugin-syntaxhighlight`.
- Images optimisées à la construction, par `@11ty/eleventy-img`,
  sous la forme de sa transformation du HTML produit.
- Hébergement GitHub Pages, sur le domaine `jirm.eu`, déployé par
  GitHub Actions.

## Frontière entre contenu et logiciel

- Le contenu est le dossier `content/` : les articles, les données du
  site et les médias (voir /model/contenu). Il n'est ni spécifié en
  détail ni testé ; seule sa forme est vérifiée, par
  /operations/construire-le-site.
- Le logiciel est tout le reste du dépôt. Il est spécifié et testé.
- Les tests n'utilisent jamais `content/` : ils construisent des
  dossiers de contenu de test, sous `tests/fixtures/`.
- Le dossier de contenu lu par la construction est `content/` par
  défaut ; la variable d'environnement `CONTENT_DIR` le remplace.
- Le dossier de sortie est `_site/` par défaut ; la variable
  d'environnement `OUTPUT_DIR` le remplace.

## Organisation du dépôt

- `content/` : le contenu.
- `src/` : gabarits, feuille de style, et fichiers copiés tels quels
  dans le site, dont `CNAME`.
- `eleventy.config.js` : la configuration d'Eleventy.
- `scripts/` : les vérifications de forme.
- `tests/` : les tests et leurs dossiers de contenu.
- `.github/workflows/` : la publication.
- `_site/` : le site produit, non versionné.

## Dépendances

- Les versions des dépendances npm sont fixées par
  `package-lock.json`, versionné ; la publication les installe par
  `npm ci`.
- Sur la machine de l'auteur aussi, les dépendances s'installent par
  `npm ci`, sauf dans un incrément qui les met à jour.
- Une dépendance n'est mise à jour que dans un incrément dédié.
- Le flux de publication n'utilise que des actions de l'organisation
  `actions` de GitHub.

## Commandes

- `npm run build` : /operations/construire-le-site.
- `npm run serve` : construit et sert le site en local, avec
  rechargement.
- `npm test` : tous les tests.

## Conventions

- Les messages d'erreur de la construction ne sont pas spécifiés, sauf
  ce que dit /operations/construire-le-site.
- Les textes de l'interface sont en français.

## Politique de tests

- La construction dans le processus : un test appelle la construction
  dans son propre processus, sur un dossier de contenu de test, puis
  observe son refus ou son succès, ses messages et les fichiers
  produits dans le dossier de sortie, HTML compris.
- La commande : un test lance `npm run build` sur un dossier de
  contenu de test, puis observe en plus son statut de sortie. Les
  scénarios, et seulement eux, sont à ce niveau.
- Test runner : `node:test`.
