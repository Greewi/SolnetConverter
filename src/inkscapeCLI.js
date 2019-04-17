const { spawnSync } = require('child_process');
const config = require('../config.json')

exports.InkscapeCLI = class {

    static generePDF(inputSvg, ouputPdf){
        return this._executeCommande([
            "-z",
            "-f", inputSvg,
            "-A", ouputPdf,
            "--export-area-page"
        ]);
    };

    static generePNG(inputSvg, ouputPng){
        return this._executeCommande([
            "-z",
            "-f", inputSvg,
            "-e", ouputPng,
            "-d", "300",
            "--export-area-page"
        ]);
    };

    /**
     * @param {string[]} commande La commande à exécuter
     */
    static _executeCommande(commande){
        return new Promise((resolve, reject)=>{
            const resultat = spawnSync (config.inkscape, commande);
            console.error(`InkscapeCLI - log : ${resultat.stdout}`);
            console.error(`InkscapeCLI - err : ${resultat.stderr}`);
            console.error(`InkscapeCLI - Fin de la commande avec le code : ${resultat.status}`);
            resolve();
        });
    }
};