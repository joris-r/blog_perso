# Model

## Contenu

Le dossier de contenu, lu de l'extérieur par la construction ; le
logiciel ne stocke rien d'autre. Les fichiers dont un segment du chemin
commence par `.` en sont exclus.

- `articles: set of /model/article`, les fichiers `articles/*.md`.
- `site: optional string`, le texte du fichier `site.json`.
- `medias: set of string`, les chemins des fichiers sous `medias/`,
  relatifs à `medias/`.
- `autres: set of string`, les chemins des autres fichiers du dossier.

Données du site : `site`, lu comme un objet JSON. Champs reconnus :
- `titre` : le nom du site ;
- `auteur` : le nom de l'auteur.
Les autres champs sont ignorés.

## Article

Un billet, écrit en Markdown, précédé d'un en-tête YAML.

- `nom: string`, le nom du fichier sans `.md`.
- `texte: string`, le contenu du fichier.

En-tête : le YAML entre une première ligne `---` et la ligne `---`
suivante. Corps : le texte qui suit l'en-tête.

Champs reconnus de l'en-tête :
- `titre` : le titre de l'article ;
- `langue` : `fr` ou `en` ;
- `résumé` : facultatif, une phrase ou deux.

Un champ reconnu de valeur vide ou nulle compte comme absent.

Nom valide : de la forme `AAAA-MM-JJ-<slug>`, où `AAAA-MM-JJ` est une
date du calendrier et `<slug>` est fait de lettres minuscules sans
accent, de chiffres et de tirets, sans commencer ni finir par un tiret.

Date de l'article : la date au début de son nom.
