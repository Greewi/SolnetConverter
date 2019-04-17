const io = require("./src/io");
const { MD2HTML } = require("./src/md2html");
const { WkHtmlToPdfCLI } = require("./src/wkhtmltopdfCLI");
const { CalibreCLI } = require("./src/calibreCLI");

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
    let promise = Promise.resolve();

    // Récupération du livre et conversion des articles en html
    promise = promise.then(() => {
        return io.readFile(bookSrc);
    }).then((json) => {
        book = JSON.parse(json);
    }).then(() => {
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
    });

    // Conversion en PDF
    if (bookDest.endsWith(".pdf")) {
        promise = promise.then(() => {
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
        });
    }
    else if (bookDest.endsWith(".epub") || bookDest.endsWith(".mobi")) {
        promise = promise.then(() => {
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
            if (bookDest.endsWith(".epub"))
                return CalibreCLI.convertHtmlToEpub(`${book.titre}.html`, bookDest);
            else
                return CalibreCLI.convertHtmlToMobi(`${book.titre}.html`, bookDest);
        });
    }

    promise = promise.then(() => {
        //Nettoyage
        return Promise.all([
            io.emptyDir("tmp/"),
            io.remove(`${book.titre}.html`)
        ]);
    }).catch((e) => {
        usage(e);
    });
}
