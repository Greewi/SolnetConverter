const io = require("./src/io");
const { WkHtmlToPdfCLI } = require("./src/wkhtmltopdfCLI");
const { GhostscriptCLI } = require("./src/cli/ghostscriptCLI");
const { CalibreCLI } = require("./src/calibreCLI");
const Theme = require("./src/livres/theme").Theme;
const Livre = require("./src/livres/livre").Livre;

const tempDir = "tmp/";

/**
 * Affiche une erreur et l'usage
 * @param {string} error le message d'erreur
 */
const usage = (error) => {
    if (error)
        console.error(error);
    console.error("USAGE :");
    console.error("\tnode construireLivre JSON_LIVRE JSON_THEME DESTINATION");
};

let parametres = process.argv.slice(2, process.argv.length);
if (parametres.length < 3)
    usage("Paramètres manquants");
else {
    let sourceLivre = parametres[0];
    let sourceTheme = parametres[1];
    let destinationLivre = parametres[2];
    /**
     * @type {Livre}
     */
    let livre = null;
    /**
     * @type {Theme}
     */
    let theme = null;

    let promise = Promise.resolve();
    // Nettoyage des générations précédentes
    promise = promise.then(() => {
        io.emptyDir("tmp/");
    });

    // Chargement du livre et du thème
    promise = promise.then(() => {
        return Livre.chargeLivre(sourceLivre);
    }).then((livreCharge) => {
        livre = livreCharge;
    }).then(() => {
        return Theme.chargeTheme(sourceTheme);
    }).then((themeCharge) => {
        theme = themeCharge;
    });

    // Copie des ressources dans le répartoire de travail
    promise = promise.then(() => {
        let promiseRessources = Promise.resolve();
        let ressources = theme.getRessources();
        for (let ressource of ressources) {
            promiseRessources = promiseRessources.then(() => {
                return io.copy(theme.getRacine() + ressource, tempDir + ressource);
            });
        }
        ressources = livre.getRessources();
        for (let ressource of ressources) {
            promiseRessources = promiseRessources.then(() => {
                return io.copy(livre.getRacine() + ressource, tempDir + ressource);
            });
        }
        return promiseRessources;
    });

    // Livre PDF
    if (destinationLivre.endsWith(".pdf")) {
        let superSections = [];
        // Calcul des super-sections
        promise = promise.then(() => {
            let superSectionActuelle = null;
            for (let section of livre.getSections()) {
                let style = theme.getStyle(section.getStyle());
                let template = theme.getTemplate(style.getTemplate());
                if (superSectionActuelle == null || superSectionActuelle.template != template || template.getType() == "image") {
                    if (superSectionActuelle != null)
                        superSections.push(superSectionActuelle);
                    superSectionActuelle = {
                        template: template,
                        sections: [],
                        html: ""
                    };
                }
                superSectionActuelle.sections.push(section);
            }
            if (superSectionActuelle != null)
                superSections.push(superSectionActuelle);
        });

        // Génération des pdf des super-sections
        promise = promise.then(() => {
            for (let i = 0; i < superSections.length; i++) {
                let superSection = superSections[i];
                let template = superSection.template;
                for (let section of superSection.sections) {
                    if (template.getType() == "image")
                        superSection.html += template.getHTML().replace("%titre%", livre.getTitre()).replace("%source%", section.getSource());
                    else
                        superSection.html += template.getHTML().replace("%titre%", livre.getTitre()).replace("%contenu%", `<div class="${section.getStyle()}">${section.getHTML()}</div>`);
                }
            }
            let promiseEcriture = Promise.resolve();
            for (let i = 0; i < superSections.length; i++) {
                let superSection = superSections[i];
                let template = superSection.template;
                promiseEcriture = promiseEcriture.then(() => {
                    io.writeFile(superSection.html, `${tempDir}section${i}.html`)
                });
                if (template.getPage().footer) {
                    let templateFooter = theme.getTemplate(template.getPage().footer);
                    promiseEcriture = promiseEcriture.then(() => {
                        io.writeFile(templateFooter.getHTML(), `${tempDir}footer${i}.html`);
                    });
                }
                promiseEcriture = promiseEcriture.then(() => {
                    if (template.getPage().footer)
                        return WkHtmlToPdfCLI.convertHtmlToPdf(`${tempDir}section${i}.html`, `${tempDir}footer${i}.html`, `${tempDir}section${i}.pdf`, template.getPage());
                    else
                        return WkHtmlToPdfCLI.convertHtmlToPdf(`${tempDir}section${i}.html`, null, `${tempDir}section${i}.pdf`, template.getPage());
                });
            }
            return promiseEcriture;
        });

        // Génération du pdf final
        promise = promise.then(() => {
            console.log("HEEEEEEEEEEEEEEEEEYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY !")
            let listePDF = [];
            for (let i = 0; i < superSections.length; i++)
                listePDF.push(`${tempDir}section${i}.pdf`);
            return GhostscriptCLI.unifiePDF(listePDF, destinationLivre);
        });
    }
    // Livre Ebook
    else if (destinationLivre.endsWith(".epub") || destinationLivre.endsWith(".mobi")) {

        promise = promise.then(() => {
            let html = "";
            let template = null;
            for(let section of livre.getSections()) {
                let style = theme.getStyle(section.getStyle());
                template = theme.getTemplate(style.getTemplate());
                if (section.getHTML() == null)
                    html += `<img src="${section.getSource()}"/>`;
                else
                    html += `<div class="${section.getStyle()}">${section.getHTML()}</div>`;
            }
            html = template.getHTML().replace("%titre%", livre.getTitre()).replace("%contenu%", html);
            return io.writeFile(html, `${tempDir}livre.html`);
        }).then(() => {
            if (destinationLivre.endsWith(".epub"))
                return CalibreCLI.convertHtmlToEpub(`${tempDir}livre.html`, destinationLivre);
            else
                return CalibreCLI.convertHtmlToMobi(`${tempDir}livre.html`, destinationLivre);
        });
    }

    promise = promise.catch((e) => {
        usage(e);
    });
}
