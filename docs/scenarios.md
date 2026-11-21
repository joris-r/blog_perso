# Scenarios

## Deux articles

Le dossier de contenu contient les données du site, de titre
« Blog de test » et d'auteur « A. Auteur », et deux articles :
`2026-01-10-premier`, en français, de titre « Premier », avec un bloc
de code marqué `js` ; `2026-02-20-second`, en anglais, de titre
« Second », avec le résumé « Un résumé. » et un lien vers
`/articles/2026-01-10-premier/`.

- La construction réussit.
- La Page d'accueil montre « Second », `EN`, `20 février 2026` et
  « Un résumé. », puis « Premier », `FR`, `10 janvier 2026`.
- Le lien « Second » mène à sa Page d'article, en anglais, datée
  `February 20, 2026`.
- Son lien vers le premier article mène à la Page d'article
  « Premier », dont le bloc de code est coloré.

## Lien cassé

Le contenu du scénario Deux articles, où le lien de « Second » vise
`/articles/2026-01-11-premier/`.

- La construction est refusée ; son message nomme
  `articles/2026-02-20-second.md` et la cible.
