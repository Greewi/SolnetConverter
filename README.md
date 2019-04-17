# Outils de conversion et de génération de documents pour Solaires

Le projet SolNet Converter est une collection d'outils destinés à générer des documents et les convertir dans différents formats. Le projet est centré sur Solaires et ses projets dérivés.

## Prérequis
Pour fonctionner, ce projet besoin des logiciels suivants :
* **LibreOffice** (https://fr.libreoffice.org/) : conversion des anciens articles vers le format html/md ;
* **Calibre** (https://calibre-ebook.com/) : génère les livres aux formats EPUB et MOBI ;
* **wkhtmltopdf** (https://wkhtmltopdf.org/) : génère les livres au format PDF ;
* **Inkscape** (https://inkscape.org/) : utilisé pour générer les fiches de personnages ;
* **pdfunite** (poppler, via cygwin sur windows : https://www.cygwin.com/) : sert à assembler des documents PDF, notamment rassembler les pages des fiches de personnage.
* **nodejs** (https://nodejs.org/) : nécessaire pour tous les outils de SolNet Converter.

Tous les outils ne sont pas nécessaires pour toutes les fonctionnalités (par exemple, si vous ne voulez que générer des fiches de personnage, vous n'aurez pas besoin de LibreOffice, Calibre, ni wkhtmltopdf).

## Installation
Clonez le dépôt sur votre machine puis rendez-vous dans le répertoire du dépôt. À la racine entrez la commande :

`npm install`

Copiez ensuite le fichier `config-dist.json` vers `config.json` et modifiez ce dernier pour y placer les bons chemins vers les exécutables des outils externes :
* loffice : chemin vers LibreOffice/program/soffice.exe ;
* calibre : chemin vers Calibre2/ebook-convert.exe ;
* inkscape : chemin vers Inkscape/inkscape.exe ;
* wkhtmltopdf : chemin vers wkhtmltopdf/bin/wkhtmltopdf.exe ;
* pdfunite : chemin vers cygwin64/bin/pdfunite.exe.

>> Note sur windows les chemins utilisent des `\` (antislash) qui doivent être doublés dans le fichier de configuration. Par exemple :
>>
>> `"loffice" : "C:\\Program Files\\LibreOffice\\program\\soffice.exe"`

>> Note 2 : les autres options de `config.json` ne sont normalement plus utilisées.

Créez un dossier `tmp` à la racine du dépôt, il sera utilisé comme répertoire de travail par les différents outils.

## Générer une fiche de personnage
Pour générer une fiche de personnage vous aurez besoin de récupérer le fichier json exporté par SolNet (https://solnet.feerie.net).

À la racine du projet, entrez la commande suivante :

`node genererFichePersonnage JSON_PERSONNAGE TEMPLATE_FICHE PDF_DESTINATION`

>> `JSON_PERSONNAGE` chemin vers le fichier json du personnage exporté.
>>
>> `TEMPLATE_FICHE` est le fichier json qui définit le modèle de la fiche de personnage à construire. Ces modèles sont normalement rangées dans le répertoire `fiches` du dépôt.
>>
>> `PDF_DESTINATION` chemin vers le fichier PDF à générer.

Par exemple : 

`node genererFichePersonnage.js Nightly.json fiches/fiche\ perso\ 5.14/Fiche.json Nightly.pdf`

## Convertir un article vers un autre format

À la racine du projet, entrez la commande suivante :

`node convertirArticle SOURCE DESTINATION`

>> `SOURCE` chemin vers le fichier source
>>
>> `DESTINATION` chemin vers le fichier de destination

>> NOTE : pour l'heure seules les conversions suivantes sont autorisées :
>> * Markdown vers HTML
>> * Markdown vers Creole (attention, variante spéciale pour le site feerie.net)
>> * HTML vers Markdown (Bogué, obsolète pour les projets de Solaire)
>> * ODT vers HTML (Bogué, obsolète pour les projets de Solaire)

## Assembler et générer un livre

À la racine du projet, entrez la commande suivante :

`node construireLivre JSON_LIVRE DESTINATION`

>> `JSON_LIVRE` est un json définissant toutes les options du livre à générer. Ces livres sont normalement rangés dans le répertoire livres. Ils contiennent des références aux articles à intégrer et il est donc nécessaire de mettre à jour les références à ces textes s'ils ne se trouvent pas au même endroit que sur ma (Greewi) machine, ce qui est extrêmement probable.
>>
>> `DESTINATION` le chemin et nom du fichier à générer. Note : pour le moment, seul le format PDF est utilisable.
