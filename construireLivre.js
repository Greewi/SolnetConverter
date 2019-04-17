const io = require("./src/io");
const { MD2HTML } = require("./src/md2html");
const { WkHtmlToPdfCLI } = require("./src/wkhtmltopdfCLI");

const usage = (error) => {
    if (error)
        console.error(error);
    console.error("USAGE :");
    console.error("\tnode construireLivre JSON_LIVRE DESTINATION");
};

let parametres = process.argv.slice(2, process.argv.length);
if (parametres.length < 2)
    usage("Paramètres manquants");
else {
    let bookSrc = parametres[0];
    let bookDest = parametres[1];

    let book = null;
    Promise.resolve().then(() => {
        // Récupération du livre
        return io.readFile(bookSrc);
    }).then((json) => {
        book = JSON.parse(json);
    }).then(() => {
        // Récupération des articles
        let promises = [];
        for (let article of book.structure) {
            promises.push(
                io.mkdir(`tmp/${article.source.replace(/\\?([^\\]*)$/, "")}`).then(() => {
                    return MD2HTML.convert(`${book.racine}${article.source}.md`, `tmp/${article.source}.html`);
                }).then(() => {
                    return io.readFile(`tmp/${article.source}.html`);
                }).then((html) => {
                    if (article.niveau == 2)
                        html = html.replace(/<(\/?)h2>/g, '<$1h3>')
                            .replace(/<(\/?)h1>/g, '<$1h2>')
                    article.html = `<div class="${article.style}">\n${html}\n</div>\n`;
                })
            )
        }
        return Promise.all(promises);
    }).then(() => {
        // Récupération du template
        return io.readFile(`themes/${book.theme}/template.html`);
    }).then((template) => {
        // Remplissage du template
        let htmlComplet = "";
        for (let article of book.structure)
            htmlComplet += article.html;
        htmlComplet = template.replace("%content%", htmlComplet).replace("%title%", book.titre);
        // Écriture du template
        return io.writeFile(htmlComplet, `${book.titre}.html`);
    }).then(() => {
        // Construciton du livre PDF
        return WkHtmlToPdfCLI.convertHtmlToPdf(`${book.titre}.html`, bookDest, book);
    }).then(() => {
        //Nettoyage
        return Promise.all([
            io.emptyDir("tmp/"),
            io.remove(`${book.titre}.html`)
        ]);
    }).catch((e) => {
        usage(e);
    });
}
