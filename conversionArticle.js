const { ODT2HTML } = require("./src/odt2html");
const { HTML2EBOOK } = require("./src/html2ebook");
const { HTML2MD } = require("./src/html2md");
const config = require('./config.json');

let generationEbook = false;
let conversionODT = false;
let conversionMD = true;

// Constitution de la liste des articles
let articles = [];
for(let id in config.sources)
    articles.push(id);

let promise = Promise.resolve();

// Génération des fichiers HTML à partir des sources ODT
for(let i=0; i<articles.length; i++)
{
    let id = articles[i];
    promise = promise.then(()=>{
        console.log(`Conversion de ${config.sources[id]} (${id}) : ${i+1}/${articles.length}`);
        if(conversionODT)
            return ODT2HTML.convert(config.sources[id], `./outputHTML/${id}.html`);
    })
    .then(()=>{
        if(conversionMD)
            return HTML2MD.convert(`./outputHTML/${id}.html`, `./outputMD/${config.sources[id].replace(/.*\\(.*).odt/, "$1.md")}`);
    })
    .then(()=>{
        return new Promise((accept, reject)=>{
            setTimeout(accept(), 500);
        });
    });
}

if(generationEbook){
    // Génération du livre de base et des livrets des chapitres
    promise
    .then(()=>{
        return HTML2EBOOK.convert(config.book, "srcHTML/ebookHeader.html", "srcHTML/ebookFooter.html", "outputEbook/Solaires.mobi", "outputEbook/Solaires.epub", "outputEbook/Solaires.pdf");
    })
    .then(()=>{
        return HTML2EBOOK.convert(config.bookRegles, "srcHTML/ebookHeaderRegles.html", "srcHTML/ebookFooter.html", "outputEbook/Solaires - 1 - Jouer à Solaires.mobi", "outputEbook/Solaires - 1 - Jouer à Solaires.epub", "outputEbook/Solaires - 1 - Jouer à Solaires.pdf");
    })
    .then(()=>{
        return HTML2EBOOK.convert(config.bookPersonnages, "srcHTML/ebookHeaderPersonnages.html", "srcHTML/ebookFooter.html", "outputEbook/Solaires - 2 - Les Personnages.mobi", "outputEbook/Solaires - 2 - Les Personnages.epub", "outputEbook/Solaires - 2 - Les Personnages.pdf");
    })
    .then(()=>{
        return HTML2EBOOK.convert(config.bookContexte, "srcHTML/ebookHeaderContexte.html", "srcHTML/ebookFooter.html", "outputEbook/Solaires - 3 - Le contexte.mobi", "outputEbook/Solaires - 3 - Le contexte.epub", "outputEbook/Solaires - 3 - Le contexte.pdf");
    })
    .then(()=>{
        return HTML2EBOOK.convert(config.bookModeDeVie, "srcHTML/ebookHeaderVieSolaires.html", "srcHTML/ebookFooter.html", "outputEbook/Solaires - 4 - Vies de solaires.mobi", "outputEbook/Solaires - 4 - Vies de solaires.epub", "outputEbook/Solaires - 4 - Vies de solaires.pdf");
    })
    .then(()=>{
        return HTML2EBOOK.convert(config.bookCatalogue, "srcHTML/ebookHeaderCatalogue.html", "srcHTML/ebookFooter.html", "outputEbook/Solaires - 5 - Le catalogue.mobi", "outputEbook/Solaires - 5 - Le catalogue.epub", "outputEbook/Solaires - 5 - Le catalogue.pdf");
    })
}

promise.catch((e)=>{
    console.error(e);
});