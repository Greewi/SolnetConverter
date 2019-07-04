const CLI = require('./CLI').CLI;
const config = require('../../config.json');

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
};