# UI

## Généralités

- [langue-page] Chaque page déclare la langue `fr`, sauf la Page
  d'article, qui déclare la langue de son article.
- [sans-script] Aucune page ne contient de script.
- [bandeau] Chaque page montre en haut le `titre` des données du site,
  lien vers `/`.
- [pied] Chaque page montre en bas l'`auteur` des données du site.
- [date] Une date s'écrit en toutes lettres dans la langue de la page :
  `21 novembre 2026` en français, `November 21, 2026` en anglais.
- [indicateur] L'indicateur de langue d'un article est `FR` pour `fr`,
  `EN` pour `en`.

## Page d'accueil

À `/`.

Montre, par état :
- [liste] Au moins un article : les articles, du plus récent au plus
  ancien par date ; l'ordre entre articles de même date est libre.
  Pour chacun : son `titre`, lien vers sa Page d'article, sa date, son
  indicateur de langue, puis son `résumé` s'il en a un.
- [aucun] Aucun article : `Aucun article pour l'instant.`

## Page d'article

À `/articles/<nom>/`, une par article.

Montre, de haut en bas :
- [titre] son `titre`, comme titre principal de la page ;
- [date] sa date ;
- [corps] son corps, rendu de Markdown en HTML ;
- [image] dans le corps, une image vers un fichier de `medias/` est
  servie en plusieurs formats optimisés produits à la construction,
  avec ses dimensions et son texte alternatif ; les formats et les
  tailles sont libres ;
- [code] dans le corps, un bloc de code qui nomme son langage est
  coloré par des éléments HTML produits à la construction.
