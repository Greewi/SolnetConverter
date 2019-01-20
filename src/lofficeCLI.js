const { spawn } = require('child_process');
const config = require('../config.json')

exports.LOfficeCLI = class {
    static convertOdtToHtml(inputFile, outputDir){
        return new Promise((resolve, reject)=>{
            const command = spawn (config.loffice, ['--headless', '--convert-to', 'html', '--outdir', outputDir, inputFile]);

            command.stdout.on('data', (data) => {
                console.error(`LOfficeCLI - log : ${data}`);
            });
            
            command.stderr.on('data', (data) => {
                console.error(`LOfficeCLI - err : ${data}`);
            });
            
            command.on('close', (code) => {
                console.error(`LOfficeCLI - Fin de la commande avec le code : ${code}`);
                resolve();
            });
        });
    }
};