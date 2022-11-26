# Outils de conversion et de génération de documents pour Féerie.net

Le projet SolNet Converter est une collection d'outils destinés à générer des documents et les convertir dans différents formats. Le projet est destiné à Féerie.net et ses projets.

## Prérequis
Pour fonctionner, ce projet besoin des logiciels suivants :
* **nodejs** (https://nodejs.org/) : nécessaire pour tous les outils de SolNet Converter.
* **Typescript** (https://www.typescriptlang.org/) : nécessaire pour compiler les sources (`npm install typescript -g`)
* **Inkscape** (https://inkscape.org/) : nécessaire pour génèrer les fiches de personnage ;
* **Calibre** (https://calibre-ebook.com/) : nécessaire pour génèrer les livres aux formats EPUB et MOBI (et des PDF bien laids) ;
* **LaTeX** (https://www.latex-project.org/) : nécessaire pour générer les livres au format PDF (je recommande d'utiliser la commande `sudo apt install tex-live-full` pour l'installer sur ubuntu) ;

Tous les outils ne sont pas nécessaires pour toutes les fonctionnalités (par exemple, si vous ne voulez que générer des fiches de personnage, vous n'aurez pas besoin de Calibre). Les outils nécessaires seront indiqués avec les opérations décrites plus bas.

## Installation
Clonez le dépôt sur votre machine puis rendez-vous dans le répertoire du dépôt. À la racine entrez la commande :

`npm install`

Copiez ensuite le fichier `config-dist.json` vers `config.json` et modifiez ce dernier pour y placer les bons chemins vers les exécutables des outils externes (par défaut le fichier contient le nécessaire pour fonctionner sous linux) :
* calibre : chemin vers Calibre2/ebook-convert.exe ;
* inkscape : chemin vers Inkscape/inkscape.exe ;
* latex : chemin vers lualatex.exe.

>> Note sur windows les chemins utilisent des `\` (antislash) qui doivent être doublés dans le fichier de configuration. Par exemple :
>>
>> `"calibre" : "C:\\Program Files\\Calibre2\\ebook-convert.exe"`

Créez un dossier `tmp` à la racine du dépôt, il sera utilisé comme répertoire de travail par les différents outils.

Compilez les sources en entrant la commande `tsc`.

## Générer une fiche de personnage

>> 💣 Cette fonctionnalité est actuellement non fonctionnelle !

Pour générer une fiche de personnage vous aurez besoin de récupérer le fichier json exporté par SolNet (https://solnet.feerie.net).

>> Si une image PNG porte le même nom que le fichier JSON et est placée dans le même répertoire, elle sera incluse comme portrait sur la fiche.

Requiert : nodejs, Inkscape, Ghostscript

À la racine du projet, entrez la commande suivante :

`node genererFichePersonnage JSON_PERSONNAGE TEMPLATE_FICHE PDF_DESTINATION`

>> `JSON_PERSONNAGE` chemin vers le fichier json du personnage exporté.
>>
>> `TEMPLATE_FICHE` est le fichier json qui définit le modèle de la fiche de personnage à construire. Ces modèles sont normalement rangées dans le répertoire `fiches` du dépôt.
>>
>> `PDF_DESTINATION` chemin vers le fichier PDF à générer.

Par exemple : 

`node genererFichePersonnage.js Nightly.json fiches/fiche\ perso\ 5.14/Fiche.json Nightly.pdf`


## Assembler et générer un livre

Cet outil construit un livre à partir de sources au format markdown. Il est possible d'exporter le résultat au format pdf, mobi ou epub.

Requiert : nodejs, Calibre, LaTeX

À la racine du projet, entrez la commande suivante :

`node dist/generateBook JSON_LIVRE JSON_THEME DESTINATION`

>> `JSON_LIVRE` est un fichier json définissant la structure du livre à générer. Ces livres sont normalement placés à côté des sources markdown qui leur sont associées.
>>
>> `JSON_THEME` est un fichier json définissant le formats et les styles du livre à générer. Ces thèmes sont normalement rangés dans le répertoire `themes` de ce projet.
>>
>> `DESTINATION` le chemin et nom du fichier à générer. Note : pour le moment, seul les formats PDF, EPUB et MOBI sont supportés.


## Convertir un article vers un autre format

Cet outil sert à convertir certains fichiers vers d'autres formats.

Requiert : nodejs

À la racine du projet, entrez la commande suivante :

`node dist/convertArticle SOURCE DESTINATION`

>> `SOURCE` chemin vers le fichier source
>>
>> `DESTINATION` chemin vers le fichier de destination

>> NOTE : pour l'heure seules les conversions suivantes sont autorisées :
>> * Markdown vers HTML
>> * Markdown vers LaTeX
>> * Markdown vers Creole (attention, variante spéciale pour l'ancien site feerie.net)
>> * HTML vers Markdown (Bogué)
