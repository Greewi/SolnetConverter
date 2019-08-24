const CLI = require('./CLI').CLI;
const config = require('../../config.json');
const io = require('../io');

exports.PDFTKCLI = class {

    /**
     * Fusionne plusieurs fichiers PDF en un seul
     * @param {string[]} inputPdfs la liste des fichiers PDF à regrouper
     * @param {string} ouputPdf le fichier PDF à générer
     */
    static unifiePDF(inputPdfs, ouputPdf) {
        let commande = [];
        for (let pdf of inputPdfs)
            commande.push(pdf);
        commande.push("cat");
        commande.push("output");
        commande.push(ouputPdf);
        return CLI.executeCommande(config.pdftk, commande);
    };

    /**
     * Récupère les informations du PDF et extrait les signets
     * @param {string} inputPDF le fichier PDF à lire et à analyser
     * @returns {Promise.object[]} une promesse résolvant un tableau de titre. Chaque titre est un objet contenant les propriétés texte, niveau et page.
     */
    static getOutline(inputPDF) {
        const fichierData = inputPDF.replace(".pdf", ".data");
        const commande = [inputPDF, "dump_data", "output", fichierData];
        return CLI.executeCommande(config.pdftk, commande)
            .then(() => {
                return io.readFile(fichierData)
            }).then((data) => {
                let regexLigne = /^Bookmark([a-zA-Z]+): (.*)/;
                let outlines = [];
                data = data.split("\n");
                for (let ligne of data) {
                    if (ligne.startsWith("BookmarkBegin")) {
                        outlines.push({ texte: "", niveau: 0, page: 0 });
                    } else {
                        let match = regexLigne.exec(ligne);
                        if (match) {
                            if (match[1] == "Title")
                                outlines[outlines.length - 1].texte = match[2];
                            else if (match[1] == "Level")
                                outlines[outlines.length - 1].niveau = parseInt(match[2]);
                            else if (match[1] == "PageNumber")
                                outlines[outlines.length - 1].page = parseInt(match[2]);
                        }
                    }
                }
                return outlines;
            });
    }
};