---
titre: Eleventy - Présentation et tutoriel
langue: fr
résumé: Présentation d'Eleventy, générateur de sites statiques, et mini tutoriel pour démarrer.
---

Article publié initialement sur [linuxfr.org](https://linuxfr.org/users/outs/journaux/eleventy-presentation-et-mini-tutoriel).

## Présentation 

[Eleventy](https://www.11ty.dev/), de son petit nom `11ty`, est un générateur statique de site web (SSG - <i>Static Site Generator</i>).

Générateur *statique* car l'ensemble des pages du site est généré en une fois avant d'être placées sur le serveur web. C'est un logiciel écrit en javascript prévu pour s'exécuter dans l'environnement [NodeJS](https://nodejs.org/fr). Les pages sont générées à l'aide de divers moteurs de <i>template</i> (comme [Liquid](https://liquidjs.com/) ou [Nunjucks](https://mozilla.github.io/nunjucks/)) qui s'exécutent sur des données structurée et des contenus en HTML ou [Markdown](https://www.markdownguide.org/). Il est également possible d'utiliser directement du Javascript au lieu des moteurs de template. L'intéret d'Eleventy est de combiner ces outils ensemble.

Le projet Eleventy est principalement développé par [Zach Leatherman](https://www.zachleat.com/) avec l'aide de la communauté. En ce moment, Zach est rémunéré par [Font Awesome](https://blog.fontawesome.com/eleventy-joins-font-awesome/).

Quelques mots sur les autres SSG, le plus connu est probablement [Jekyll](https://jekyllrb.com/). À un moment donné, le couple Jekyll et [GitHub Pages](https://pages.github.com/) était un grand classique pour les sites web perso ou pro des développeurs. On peut également citer [Hugo](https://gohugo.io/) ainsi que [Astro](https://astro.build/), même si ce dernier n'est pas seulement un SSG (il fait également du SSR - <i>Server-Side Rendering</i>).

Eleventy est connu pour être rapide et avoir une liste réduite de dépendance [NPM](https://docs.npmjs.com/about-npm). Un soin particulier est donné à cela, par exemple pour la v3, le nombre de dépendances a significativement baissé par rapport à la version v2.0.1 (voir la [Release note](https://github.com/11ty/eleventy/releases/tag/v3.0.0). Il est également connu pour être <i>unopinionated</i>, c'est à dire que l'utilisateur a un large choix quand à la façon d'utiliser Eleventy. Une douzaine de [moteur de template](https://www.11ty.dev/docs/languages/) sont gérés de base et on peut en ajouter au besoin. Un ensemble de [plugins officiels](https://www.11ty.dev/docs/plugins/official/) est disponible pour les besoins plus spécifiques.

## Vocabulaire

Vocabulaire spécifique à Eleventy ou aux générateurs statiques.

Les fichiers de contenu (de pages, de billets, etc) sont appelés les [<i>template</i>](https://www.11ty.dev/docs/glossary/#template). C'est à dire que c'est ce qui va générer une page web par l'application d'un moteur de template sur des données ou des contenus textuels.

Les [<i>Collections</i>](https://www.11ty.dev/docs/glossary/#collection) permettent d'organiser les templates (et donc les pages web) entre elles. Typiquement cela permet de cataloguer la suite de billets d'un blog, les catégories de pages et donc les menus d'un site web.

Les [<i>layouts</i>](https://www.11ty.dev/docs/glossary/#layout) servent à factoriser les différentes parties communes entre les pages (comme les menu, en-tête ou pied de page). Il sont également gérés par un moteur de template.

Le [<i>Front Matter Data</i>](https://www.11ty.dev/docs/data-frontmatter/) est un entête qu'on peut placer dans n'importe quelle fichier de contenu (un <i>template</i> donc). En général au format YAML, il permet de définir des données structurées qui seront ensuite utilisées lors de la génération. Très pratique pour écrire des templates efficaces.

En fait, Eleventy peut utiliser toutes sortes de sources de données : les <i>Front Matter</i> donc, mais aussi des fichiers JSON ainsi que des données distantes depuis des API (on peut le relier à un <i>headless</i> CMS par exemple) et plus généralement d'importe quel résultat d'exécution de javascript. La façon dont les données sont récupérée, générées et fusionnées s'appelle la [<i>data cascade</i>](https://www.11ty.dev/docs/glossary/#data-cascade). C'est un point à comprendre pour utiliser Eleventy. En particulier, il faut avoir en tête que chaque <i>template</i> va avoir accès à un ensemble différent de données (selon sa place dans les répertoires, sa place dans les collections, son <i>front matter</i>, les <i>layouts</i> qu'il utilise).

## Tutoriel

Une chose à comprendre, c'est qu'Eleventy utilise beaucoup de bibliotheques tierces. En particulier aucun des moteurs de <i>template</i> n'a été créé pour Eleventy, le projet va simplement réutiliser ce qui a été fait ailleurs. Donc, et par exemple, si on souhaite écrire des templates avec Nunjucks aller voir la [documentation Eleventy dédiée](https://www.11ty.dev/docs/languages/nunjucks/) n'apporte pas grand chose. Il faut plutot aller voir la [page officielle de Mozilla](https://mozilla.github.io/nunjucks/).

Dans ce tutoriel, nous allons surtout utiliser Nunjucks et évidement écrire du HTML et du CSS.

## Pré-requis

Il vous faudra NodeJS. Personnellement je vous conseille de prendre la dernière LTS (c'est à dire la v22 au moment où j'écris ces lignes).

Pour cela, je vous propose d'utiliser [Node Version Manager](https://github.com/nvm-sh/nvm). Voir leur documentation, mais globalement il faut faire ceci (si vous acceptez d'exécuter un script bash téléchargé) :

```shell
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash
nvm install --lts
```

Pour travailler, il vous faudra un éditeur de texte. N'importe lequel conviendra mais si vous voulez être à la mode <i>cool kids in town</i> et avoir accès à toutes les extensions du moment prenez [vscode](https://code.visualstudio.com/download). Alors évidement c'est [pas terrible](https://medium.com/@adnanribic/debunking-the-myth-why-visual-studio-code-isnt-truly-open-source-3b7b05a1d9fa) niveau philosophie du libre (j'ai pas encore essayé [VSCodium](https://vscodium.com/)).

## Installation

Maintenant qu'on a l'environnement, il suffit des commandes ci-dessous pour installer Eleventy (localement dans un répertoire). Voir [la doc 11ty](https://www.11ty.dev/docs/#step-2-install-eleventy) pour plus d'info.

```shell
mkdir my_great_site && cd "$_"
npm init -y
npm pkg set type="module"
npm install @11ty/eleventy
```

Alors petite chose à savoir, là on a configuré le [projet avec ESM](https://www.11ty.dev/docs/cjs-esm/) le nouveau standard de module JavaScript (celui avec `import()` et pas des `require`). C'est un peu pénible car il existe encore beaucoup de documentation sur le Net avec l'ancienne syntaxe.

## Mise en place

On va configurer quelques petites choses. Créez un fichier `eleventy.config.js` avec le contenu ci-dessous. J'ai configuré les répertoires et j'ai choisi le moteur de template nunjucks pour les fichiers markdown et html.

```shell
export const config = {
    // Directory configuration
    dir: {
        input: "content",          // default: "."
        includes: "../_includes",  // default: "_includes" (`input` relative)
        data: "../_data",          // default: "_data" (`input` relative)
        output: "_site"
    },

    // Pre-process *.md files with nunjucks (default: `liquid`)
    markdownTemplateEngine: "njk",

    // Pre-process *.html files with nunjucks (default: `liquid`)
    htmlTemplateEngine: "njk",

};

export default async function (eleventyConfig) {

    // Copy the contents of the `public` folder to the output folder
    // For example, `./public/css/` ends up in `_site/css/`
    eleventyConfig
        .addPassthroughCopy({
            "./public/": "/"
        })

};
```

Et créez les répertoires correspondants :

```shell
mkdir _data _includes content public public/{css,img}
```

On va aussi préparer l'usage de git. Créez le fichier `.gitignore` avec le contenu suivant.

```shell
node_modules
_site
.cache
```

On se retrouve normalement avec ceci :

```shell
├── content     # Ici c'est les pages web (les templates)
├── _data       # là les donnéess structurées (typiquement en JSON)
├── _includes   # les layouts
└── public
    ├── css     # les feuilles de style CSS
    └── img     # et les images (qui doivent déjà être
                #  optimisée pour le web)
```

## Allez ca suffit là, on affiche quelque chose maintenant

Donc, ouvrons un fichier `index.md` dans le répertoire `content` avec quelque lignes de textes dedans. Comme par exemple :

```
Bonjour le monde !
```

Ca y est, vous y êtes ? Alors maintenant la commande magique :

```shell
npx @11ty/eleventy --serve
```

Et normalement vous voyez vos lignes à l'adresse [http://localhost:8080/](http://localhost:8080/). C'est un serveur de développement. Il est intégré à Eleventy et mise à jour le site automatiquement à chaque changement de fichiers.

## Le premier layout

On a pas encore d'HTML complet mais seulement un `<p>Bonjour le monde !</p>` qui provient de la transcription du fichier mardown `index.md`.

Créez un fichier `base.njk` dans le répertoire `_includes` avec le contenu ci-dessous.

```html
<!doctype html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="generator" content="{{ eleventy.generator }}">
    <title>{{title }}</title>
</head>
<body>
{{content | safe }}
</body>
</html> 
```

Ce fichier est écrit dans un mélange d'HTML et de Nunjucks (extension de fichier `.njk`). Les parties en Nunjucks sont encadrée `{{comme ça}}` (cette syntaxe en "moustache" est commune a plusieurs moteur de template).

Ici on a :

*   `{{title}}` qui sera [remplacé par le contenu de la variable](https://mozilla.github.io/nunjucks/templating.html#variables) `title`
    
*   `{{content | safe }}` idem mais [sans échappement du HTML contenu](https://mozilla.github.io/nunjucks/templating.html#safe)
    
*   et j'ai ajouté un petit meta pour dire que votre site dise au monde entier qu'il utilise Eleventy (mais avec discretion et classe)
    

## Usage du layout

Pour utiliser ce layout, on va ajouter un entête <i>>Front Matter Data</i>. Modifiez donc votre template `index.md` pour qu'il ressemble à ceci.

```md
---
title: Hello
layout: base.njk
---

Bonjour le monde !
```

C'est assez simple, mais il faut remarquer que l'entête en [YAML](https://yaml.org/) est transformé en donnée javascript qui sont ensuite utilisable dans le layout. La ligne `layout` a une signification particulière et indique quel fichier de layout doit être utilisé pour rendre ce template. Le contenu du fichier mardown est tranformé en HTML et est disponible dans la variable `content` de la <i>data cascade</i>.

## Une page en plus

Pour faire bonne mesure rajoutons une page. Ouvrez un fichier `blague.md` avec le contenu suivant.

```md
---
title: Une blague
layout: base.njk
---

Comment vas-tu yau de poêle ?
```

Dans le fichier `index.md` ajoutez la ligne.

```md
Allez voir [mon autre page](blague).
```

Petite remarque : avec cette façon de faire on utilise des URLS de la forme `http://localhost:8080/blague/` plutot que `http://localhost:8080/blague.html`.

Je vous laisse méditer sur les [avantages et implications](https://www.11ty.dev/docs/permalinks/#cool-uris-dont-change) de cela.

## Du style

Ajoutons un fichier de style CSS. Ouvrez donc `style.css` dans le répertoire `public/css` avec le contenu suivant.

```css
body {
    font-family: Helvetica, Arial, sans-serif;
    background-color: cadetblue;
    max-width: 80ch;
    text-wrap: pretty;
    margin-inline: auto;
}

h1, h2, h3 {
  text-wrap: balance;
}

h1 {
  text-align: center;
}
```

Et il faut évidement ajouter la ligne suivante dans le `head` de `base.njk`

```html
<link rel="stylesheet" href="/css/style.css">
```

## Mise en ligne

Maintenant il faut mettre cela en ligne, le [déployer quoi](https://www.11ty.dev/docs/deployment/).

La méthode <i>>old-school</i> consiste à générer les fichiers puis à les téléverser sur un serveur web. Pour cela, lancez la commande suivante.

```shell
npx @11ty/eleventy
```

et votre site web se retrouve dans le répertoire `_site/`. Cela peut être pas mal de vider ce répertoire avant car des anciens fichiers générés peuvent s'y trouver (si vous avez renommé ou déplacé des choses par exemple).

À partir de là, on peut téléverser avec FTP, Rsync etc.

Mais bon, nous on est moderne ! On fait du [<i>Jamstack</i>](https://jamstack.org/), yeah ! Avec cette approche, les sources sont placées dans un dépôt git (souvent sur github) et le site est construit automatiquement lorsqu'on <i>push</i> sur le dépot. Les fournisseurs <i>serverless</i> pour ce genre de service sont typiquement [netlify](https://www.netlify.com/) ou [Vercel](https://vercel.com/) ou encore sur [cloudfare page](https://pages.cloudflare.com/) (ce dernier est plus un CDN qui fait aussi du serverless). C'est souvent gratuit jusqu'à une certaine limite de temps de build et de quantité de données servies.

Évidement, tout cela est au État-unis. Par les temps qui cours, ca peut être instructif d'aller faire un tour sur [European Alternatives](https://european-alternatives.eu/category/jamstack-hosting). J'ai choisi d'essayer [statichost](https://www.statichost.eu/), que je connaissais pas avant.

Donc, il va falloir expliquer à statichost qu'on veut utiliser Eleventy, pour cela créez le fichier `statichost.yml` avec le contenu suivant.

```yml
image: node:22
command: npm install && npx @11ty/eleventy
public: _site
```

Ici on configure :

*   l'usage d'un conteneur docker pour nodejs en version 22
    
*   la commande pour générer le site web
    
*   et le répertoire ou se trouve le résultat
    

Je vous laisse créer le dépot git et le pousser sur [github](https://github.com/) ou [ailleurs](https://european-alternatives.eu/alternative-to/github). Là j'ai plus le courage de détailler.

Ensuite il suffit de créer un compte sur le fournisseur serveur que vous avez choisi et de créer un site en lui fournissant l'URL du dépot git.

Et [voilà](https://my-great-site.statichost.eu/) !

Pour référence, mon dépot sur trouve là : `https://github.com/joris-r/my_great_site.git`

## Ouf, c'est fini ?

C'est tout pour le tutoriel, je pense que c'est le minimum à savoir pour bien commencer avec Eleventy.

Pour un site "normal", il y a encore un peu de travail. Vous pouvez jeter un oeil sur <i>Starter Projects</i> [Base Blog](https://github.com/11ty/eleventy-base-blog) fait par le créateur d'Eleventy. Il sert souvent de référence en matière de bonne pratique.

Sinon, vous pouvez explorer [les tutoriels de la communautées](https://www.11ty.dev/docs/tutorials/) ou le contenu aggrégé sur [11tybundle](https://11tybundle.dev/).