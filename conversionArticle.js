const { ODT2HTML } = require("./src/odt2html");
const { HTML2EBOOK } = require("./src/html2ebook");

const config = require('./config.json')

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
        return ODT2HTML.convert(config.sources[id], `./outputHTML/${id}.html`);
    }).then(()=>{
        return new Promise((accept, reject)=>{
            setTimeout(accept(), 100);
        });
    });
}

// Génération du livre de base
promise.then(()=>{
    HTML2EBOOK.convert(config.book, "srcHTML/ebookHeader.html", "srcHTML/ebookFooter.html", "outputEbook/Solaires.mobi", "outputEbook/Solaires.epub", "outputEbook/Solaires.pdf");
});

