const { CLI } = require('./CLI');
const config = require('../../config.json');
const io = require('../io');

exports.GhostscriptCLI = class {

    /**
     * Fusionne plusieurs fichiers PDF en un seul
     * @param {string[]} inputPdfs la liste des fichiers PDF à regrouper
     * @param {string} ouputPdf le fichier PDF à générer
     */
    static unifiePDF(inputPdfs, ouputPdf) {
        let commande = [];
        commande.push("-sDEVICE=pdfwrite");
        commande.push("-o");
        commande.push(ouputPdf);
        for (let pdf of inputPdfs)
            commande.push(pdf);
        return CLI.executeCommande(config.ghostscript, commande);
    };

    static reparePDF(pdf) {
        return this.unifiePDF([pdf], "tmp.ghostscript.pdf")
            .then(() => {
                return io.copy("tmp.ghostscript.pdf", pdf);
            })
            .then(() => {
                return io.remove("tmp.ghostscript.pdf");
            });
    }

};