const io = require("./src/io");
const { MD2HTML } = require("./src/md2html");
const { WkHtmlToPdfCLI } = require("./src/wkhtmltopdfCLI");
const config = require('./config.json');

const usage = (error) => {
    if (error)
        console.error(error);
    console.error("USAGE :");
    console.error("\tnode construireLivre JSON_LIVRE");
};

let parametres = process.argv.slice(2, process.argv.length);
if (parametres.length < 2)
    usage("Paramètres manquants");
let bookSrc = parametres[0];
let bookDest = parametres[1];

let book = null;
io.readFile(bookSrc)
    .then((json) => {
        book = JSON.parse(json);

        let promises = [];
        for (let article of book.structure) {
            promises.push(
                io.mkdir(`outputHTML/${article.source.replace(/\\?([^\\]*)$/, "")}`).then(() => {
                    return MD2HTML.convert(`${book.racine}${article.source}.md`, `outputHTML/${article.source}.html`);
                }).then(() => {
                    return io.readFile(`outputHTML/${article.source}.html`);
                }).then((html) => {
                    if (article.niveau == 2)
                        html = html.replace(/<(\/?)h2>/g, '<$1h3>')
                            .replace(/<(\/?)h1>/g, '<$1h2>')
                    article.html = `<div class="${article.style}">\n${html}\n</div>\n`;
                })
            )
        }

        return Promise.all(promises);
    })
    .then(()=>{
        return io.readFile(`themes/${book.theme}/template.html`);
    })
    .then((template) => {
        let htmlComplet = "";
        for (let article of book.structure)
            htmlComplet += article.html;
        htmlComplet = template.replace("%content%", htmlComplet).replace("%title%", book.titre);
        return io.writeFile(htmlComplet, "tmp.html");
    })
    .then(()=>{
        return WkHtmlToPdfCLI.convertHtmlToPdf("tmp.html", bookDest, book);
    })
    .catch((e) => {
        usage(e);
    });