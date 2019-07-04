const { spawn } = require("child_process");

exports.CLI = class {
    /**
     * Exécute une commande système
     * @param {string} commande la commande à exécuter
     * @param {string[]} parametres les paramètres de la commande
     * @param {object} options les options spécifiques
     * @param {boolean} options.ignorerEchec si défini et vrai, ne lève
     *  pas d'execption si la commande ne se termine pas avec le code 0.
     * @returns {Promise} une promesse résolue à la fin de la commande
     */
    static executeCommande(commande, parametres, options) {
        return new Promise((resolve, reject) => {

            let nomCommande = commande.match(/[^\\\/]+$/);
            if (Array.isArray(nomCommande))
                nomCommande = nomCommande[0];

            const processus = spawn(commande, parametres);

            processus.stdout.on("data", (data) => {
                console.log(`${nomCommande} - log : ${data}`);
            });

            processus.stderr.on("data", (data) => {
                console.error(`${nomCommande} - err : ${data}`);
            });

            processus.on("close", (code) => {
                console.log(`${nomCommande} - Fin de la commande avec le code : ${code}`);
                if (code != 0 && (!options || !options.ignorerEchec))
                    reject(`Echec de la commande ${nomCommande} avec le code d'erreur ${code}`);
                else
                    resolve();
            });
        });
    }
};