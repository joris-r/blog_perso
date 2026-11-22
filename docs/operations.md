# Operations

## Généralités

- [refus] Une construction refusée se termine avec un statut de sortie
  non nul ; chaque message d'erreur nomme le fichier en cause, s'il y
  en a un.
- [sortie] Après un refus, le contenu de `_site/` est libre.

## État initial

- [vide] Le dossier de contenu ne contient aucun fichier.

## Construire le site

Trigger: `npm run build`, et /operations/publier.

Cases:
1. [fichier-inconnu] `autres` n'est pas vide : refusé ; le message
   nomme chacun de ces fichiers.
2. [donnees] `site` absent ou pas un objet JSON, ou un de ses champs
   `titre` et `auteur` absent, pas un texte ou vide : refusé.
3. [nom] Un article dont le nom n'est pas valide : refusé.
4. [entete] Un article sans en-tête, ou dont l'en-tête n'est pas un
   objet YAML aux valeurs textes ou nulles : refusé.
5. [titre] Un article sans `titre`, ou au `titre` vide : refusé.
6. [langue] Un article dont la `langue` est absente ou n'est ni `fr`
   ni `en` : refusé.
7. [champ-inconnu] Un article dont l'en-tête a un champ non reconnu :
   refusé.
8. [script] Un article dont le corps, rendu en HTML, contient un
   élément `script`, un attribut d'événement `on…` ou une adresse
   `javascript:` : refusé. Le texte d'un bloc de code ou de code en
   ligne n'en contient pas.
9. [alt] Une image du corps d'un article sans attribut `alt`, ou à
   l'`alt` vide : refusé.
10. [image-illisible] Une image du corps d'un article vers un fichier
   de `medias/` que la construction ne sait pas lire comme une image :
   refusé.
11. [lien-mort] Une page produite contient un lien interne dont la
   cible n'est ni une page ni un fichier du site produit : refusé ; le
   message nomme la cible et la page : le fichier de son article pour
   une Page d'article, son fichier sous `_site/` sinon.
12. [construit] Sinon : `_site/` contient le site, c'est-à-dire les
   pages de /ui.md, la feuille de style, les médias à
   `/medias/<chemin>`, les images optimisées, à des chemins libres, et
   le fichier `CNAME` contenant `jirm.eu` ; statut de sortie nul.

Lien interne : un attribut `href` ou `src` sans schéma et ne
commençant pas par `//`. Sa cible se résout depuis l'adresse de la
page, comme dans un navigateur, sans ses parties après `?` ou `#` ;
vide, c'est la page elle-même. La page `/<chemin>/` est atteinte par
`/<chemin>/`, `/<chemin>` et `/<chemin>/index.html` ; la page `/` par
`/` et `/index.html`.

## Publier

Trigger: un push sur la branche `main` du dépôt GitHub, ou un
lancement manuel du flux de publication par un membre du dépôt.

Cases:
- [publie] Les tests et /operations/construire-le-site réussissent :
  GitHub Pages sert `_site/` à https://jirm.eu/. (not testable)
- [echec] Un test échoue ou la construction est refusée : le site
  servi est inchangé.
  (not testable)
