const { spawn } = require('child_process');
const config = require('../config.json')

exports.CalibreCLI = class {
    /**
     * Convertit un fichier HTML au format MOBI
     * @param {string} inputFile Le nom et chemin du fichier HTML à convertir
     * @param {string} outputFile Le nom et chemin du fichier MOBI à produire
     */
    static convertHtmlToMobi(inputFile, outputFile){
        this._executeCommande([
            inputFile, outputFile,
            "--max-levels", "0",
            "--page-breaks-before" ,"//*[name()='h1'] | //*[name()='h2']",
            "--chapter", "//*[name()='h1'] | //*[name()='h2']"
        ]);
    }

    /**
     * Convertit un fichier HTML au format EPUB
     * @param {string} inputFile Le nom et chemin du fichier HTML à convertir
     * @param {string} outputFile Le nom et chemin du fichier EPUB à produire
     */
    static convertHtmlToEpub(inputFile, outputFile){
        this._executeCommande([
            inputFile, outputFile,
            "--max-levels", "0",
            "--no-default-epub-cover",
            "--page-breaks-before", "//*[name()='h1'] | //*[name()='h2']",
            "--chapter", "//*[name()='h1'] | //*[name()='h2']"
        ]);
    }

    /**
     * Convertit un fichier HTML au format PDF
     * @param {string} inputFile Le nom et chemin du fichier HTML à convertir
     * @param {string} outputFile Le nom et chemin du fichier PDF à produire
     */
    static convertHtmlToPdf(inputFile, outputFile){
        this._executeCommande([
            inputFile, outputFile,
            "--max-levels", "0",
            "--page-breaks-before", "//*[name()='h1'] | //*[name()='h2']",
            "--chapter", "//*[name()='h1'] | //*[name()='h2']",
            "--chapter-mark=none",
            "--margin-top=60",
            "--margin-left=40",
            "--margin-bottom=60",
            "--margin-right=40",
            "--paper-size=a5",
            "--pdf-page-numbers",
            "--base-font-size=9"
        ]);
    }

    /**
     * @param {string[]} commande La commande à exécuter
     */
    static _executeCommande(commande){
        return new Promise((resolve, reject)=>{
            const command = spawn (config.calibre, commande);

            command.stdout.on('data', (data) => {
                console.error(`CalibreCLI - log : ${data}`);
            });
            
            command.stderr.on('data', (data) => {
                console.error(`CalibreCLI - err : ${data}`);
            });
            
            command.on('exit', (code) => {
                console.error(`CalibreCLI - Fin de la commande avec le code : ${code}`);
                resolve();
            });
        });
    }
};