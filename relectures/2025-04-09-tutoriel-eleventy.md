# Relecture : Eleventy - Présentation et tutoriel

Lecture : un tutoriel pour développeurs qui découvrent les SSG.
Eleventy est *unopinionated* et le débutant s'y perd. Le tutoriel fait
donc les choix à sa place, et les assume.

## Angle de l'article

- Constat : « Présentation » vante *unopinionated* et ne dit pas que le
  tutoriel fait des choix pour le lecteur.
- Proposition (retenue) : poser l'angle dans l'introduction, en une ou
  deux phrases.

## Introduction et vocabulaire

- Constat : cinq définitions avant la première commande ; *collections*
  et *data cascade* ne servent pas dans le tutoriel. Le paragraphe sur
  les bibliothèques tierces arrive avant tout code.
- Proposition (retenue) : une introduction courte, avec Jekyll et Hugo
  comme jalons historiques. Définir *template*, *layout* et
  *front matter* là où ils servent. *Collections* et *data cascade*
  passent dans une section finale « Pour aller plus loin ». Le
  paragraphe sur les bibliothèques va juste avant `base.njk`.

## Mise en ligne

- Constat : la raison de préférer un fournisseur européen reste
  implicite. statichost n'est pas justifié, `statichost.yml` ne sert que
  chez lui, et la création du dépôt git est sautée.
- Proposition (retenue) : une section neutre, avec les options classées
  par mécanisme (envoi de `_site`, build à chaque push, conteneur,
  hébergeurs alternatifs). rsync est déroulé en entier, avec `--delete`.
  Les autres méthodes sont annoncées comme de futurs articles.
  statichost est retiré.

## Répertoires de « Mise en place »

- Constat : la configuration modifie les répertoires par défaut sans
  dire pourquoi. Le soulignement des noms n'est pas expliqué.
- Proposition (retenue) : une phrase sur le choix (séparer le contenu
  de la mécanique du site) et une sur le soulignement (simple
  convention : pas de contenu dans ce répertoire).

## ESM et CommonJS

- Constat : le passage sur ESM signale la gêne, mais n'aide pas le
  lecteur à s'en sortir. « `import()` » désigne l'import dynamique.
- Proposition (à développer) : montrer les deux syntaxes côte à côte
  (`require` / `import`, `module.exports` / `export default`), et à quoi
  on reconnaît un projet ESM.

## Titre et résumé

- Constat : « Présentation et tutoriel » ne porte pas l'angle.
- Proposition (non tranchée) : « Eleventy laisse tout choisir ; ce
  tutoriel fait les choix pour vous, d'un dossier vide à un site en
  ligne. »

## Non discuté

- « Pré-requis » : la digression sur vscode et VSCodium est hors sujet.
- `eleventy.config.js` est présenté dans un bloc `shell` au lieu de `js`.
