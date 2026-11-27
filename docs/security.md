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

- Dossier de contenu : lu par la construction ; la source d'un texte
  ou d'un fichier copié.
- Paquets npm : installés et exécutés par la construction, sur la
  machine de l'auteur et dans GitHub Actions ; l'éditeur d'un paquet
  npm.
- Flux de publication : `.github/workflows/` et ses actions ;
  l'éditeur d'une action.
- Dépôt GitHub : quiconque sur Internet, et qui prend le compte.
- Domaine `jirm.eu` : qui prend le domaine.

## Menaces

### Dossier de contenu

- [script] Un article contient un script, exécuté chez le lecteur.
  - Mitigated: la construction refuse les éléments `script`, les
    attributs d'événement et les adresses `javascript:`.
    - /operations/construire-le-site/script
    - /ui/generalites/sans-script
  - Accepted: un script passe encore par `srcdoc`, une adresse `data:`
    ou un fichier de `medias/` chargé par `iframe`, `object` ou
    `embed`, et s'exécute dans la page de l'article.
- [media-script] Un fichier de `medias/`, une image SVG ou une page
  HTML, contient un script, exécuté chez le lecteur qui l'ouvre.
  - Accepted: le script s'exécute sur l'origine https://jirm.eu/,
    quand le lecteur ouvre le fichier, ou quand un article le charge
    par `iframe`, `object` ou `embed` ; pas quand une page l'affiche
    comme image.
- [ressource-externe] Un article charge une ressource depuis un autre
  site, qui apprend la visite du lecteur.
  - Accepted: l'autre site apprend l'adresse IP et le navigateur du
    lecteur, la page lue, et ce que la ressource chargée peut
    recueillir.

### Paquets npm

- [nouvelle-version] Une version détournée d'un paquet npm, publiée
  après le choix des versions, s'installe sur la machine de l'auteur
  ou dans GitHub Actions.
  - Mitigated: les versions sont fixées et installées telles quelles.
    - /technical/dependances
- [installation] Une version choisie d'un paquet npm exécute du code
  malveillant à son installation.
  - Mitigated: aucun script de paquet ne s'exécute à l'installation.
    - /technical/dependances
- [construction] Une version choisie d'un paquet npm exécute du code
  malveillant pendant la construction.
  - Accepted: le code s'exécute avec les droits de l'auteur sur sa
    machine, et publie ce qu'il veut par GitHub Actions ; seulement
    depuis une version fixée par `package-lock.json`.

### Flux de publication

- [action] Une action compromise publie autre chose que le site
  construit.
  - Mitigated: le flux n'utilise que des actions de GitHub.
    - /technical/dependances

### Dépôt GitHub

- [pull-request] Un inconnu publie par une pull request.
  - Mitigated: seuls un push sur `main` et un lancement par un membre
    du dépôt publient.
    - /operations/publier
- [compte] Qui prend le compte GitHub de l'auteur publie ce qu'il
  veut.
  - Accepted: il publie ce qu'il veut sur https://jirm.eu/, jusqu'à ce
    que l'auteur reprenne le compte ; ce qu'il a poussé reste dans le
    dépôt, et s'exécute à la construction suivante.

### Domaine `jirm.eu`

- [domaine] Qui prend le domaine `jirm.eu` sert ce qu'il veut à son
  adresse.
  - Accepted: il sert ce qu'il veut à https://jirm.eu/ et voit les
    requêtes des lecteurs, jusqu'à ce que l'auteur reprenne le domaine
    et que les caches l'oublient.
