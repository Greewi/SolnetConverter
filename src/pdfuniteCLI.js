const { spawnSync } = require('child_process');
const config = require('../config.json')

exports.PDFUniteCLI = class {

    /**
     * Fusionne plusieurs fichiers PDF en un seul
     * @param {string[]} inputPdfs la liste des fichiers PDF à regrouper
     * @param {string} ouputPdf le fichier PDF à générer
     */
    static unifiePDF(inputPdfs, ouputPdf) {
        let commande = [];
        for (let pdf of inputPdfs)
            commande.push(pdf);
        commande.push(ouputPdf);
        return this._executeCommande(commande);
    };

    /**
     * @param {string[]} commande La commande à exécuter
     */
    static _executeCommande(commande) {
        return new Promise((resolve, reject) => {
            const resultat = spawnSync(config.pdfunite, commande);
            if (resultat.stdout)
                console.error(`PDFUniteCLI - log : ${resultat.stdout}`);
            if (resultat.stderr)
                console.error(`PDFUniteCLI - err : ${resultat.stderr}`);
            console.error(`PDFUniteCLI - Fin de la commande avec le code : ${resultat.status}`);
            resolve();
        });
    }
};