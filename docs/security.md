# Security

## Actifs

- L'intégrité du site publié : https://jirm.eu/ ne sert que ce que
  l'auteur a écrit et construit.
- La vie privée des lecteurs : le site ne transmet rien sur ses
  lecteurs à un tiers, hormis GitHub Pages, qui le sert.
- La machine de l'auteur, où s'exécute le code des dépendances npm.

Rien de ce qui est poussé sur le dépôt n'est confidentiel :
brouillons et historique compris.

## Acteurs

- Quiconque sur Internet : lit le dépôt GitHub, public, et peut y
  proposer des pull requests.
- L'éditeur d'un paquet npm malveillant : une dépendance de la
  construction, directe ou transitive, détournée.
- L'éditeur d'une action GitHub compromise.
- La source d'un texte ou d'un fichier que l'auteur copie dans le
  contenu.
- Qui prend le compte GitHub de l'auteur ou le domaine `jirm.eu`.

GitHub, qui héberge le dépôt et le site, est de confiance.

## Frontières

- Le dossier de contenu, lu par la construction : la source d'un texte
  ou d'un fichier copié.
- Les paquets npm, installés et exécutés par la construction, sur la
  machine de l'auteur et dans GitHub Actions : l'éditeur d'un paquet
  npm.
- Le flux de publication, `.github/workflows/`, et ses actions :
  l'éditeur d'une action.
- Le dépôt GitHub : quiconque sur Internet, et qui prend le compte.
- Le domaine `jirm.eu` : qui prend le domaine.

## Menaces

- [script] Un article contient un script, exécuté chez le lecteur :
  /operations/construire-le-site/script, /ui/generalites/sans-script.
- [media-script] Un fichier de `medias/`, une image SVG ou une page
  HTML, contient un script, exécuté chez le lecteur qui l'ouvre :
  accepted.
- [ressource-externe] Un article charge une ressource depuis un autre
  site, qui apprend la visite du lecteur : accepted.
- [nouvelle-version] Une version détournée d'un paquet npm, publiée
  après le choix des versions, s'installe sur la machine de l'auteur
  ou dans GitHub Actions : /technical/dependances.
- [installation] Une version choisie d'un paquet npm exécute du code
  malveillant à son installation : /technical/dependances.
- [construction] Une version choisie d'un paquet npm exécute du code
  malveillant pendant la construction : accepted.
- [action] Une action compromise publie autre chose que le site
  construit : /technical/dependances.
- [pull-request] Un inconnu publie par une pull request :
  /operations/publier.
- [compte] Qui prend le compte GitHub de l'auteur ou le domaine
  `jirm.eu` publie ce qu'il veut : accepted.
