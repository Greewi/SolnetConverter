const fs = require('fs-extra');

/**
 * @param {string} source la source du HTML à charger
 * @returns {Promise<string>} une promise qui résoud le HTML chargé
 */
exports.readFile = (source) => {
    return new Promise((accept, reject) => {
        fs.readFile(source, "utf8", (err, htmlSource) => {
            if (err)
                reject(err);
            else {
                accept(htmlSource);
            }
        });
    });
}

/**
 * Ecrit un fichier md
 * @param {string} data 
 * @param {string} dest 
 * @returns {Promise}
 */
exports.writeFile = (data, dest) => {
    return new Promise((accept, reject) => {
        fs.writeFile(dest, data, "utf8", (err) => {
            if (err)
                reject(err);
            else
                accept();
        });
    })
};

/**
 * Créé un repertoire récursivement
 * @param {string} path le chemin à créer
 * @returns {Promise}
 */
exports.mkdir = (path) => {
    return new Promise((accept, reject) => {
        fs.mkdir(path, { recursive: true }, (err) => {
            if (err)
                reject(err);
            else
                accept();
        });
    });
};

/**
 * Vide un repertoire
 * @param {string} path le chemin du répertoire à vider
 * @returns {Promise}
 */
exports.emptyDir = (path) => {
    return new Promise((accept, reject) => {
        fs.emptyDir(path, (err) => {
            if (err)
                reject(err);
            else
                accept();
        });
    });
};

/**
 * Supprime un fichier
 * @param {string} path le chemin du fichier à supprimer
 * @returns {Promise}
 */
exports.remove = (path) => {
    return new Promise((accept, reject) => {
        fs.remove(path, (err) => {
            if (err)
                reject(err);
            else
                accept();
        });
    });
};

/**
 * Copie un fichier
 * @param {string} source le chemin de la source
 * @param {string} dest le nom et chemin de destination
 * @returns {Promise}
 */
exports.copy = (source, dest) => {
    return new Promise((accept, reject) => {
        fs.copyFile(source, dest, (err) => {
            if (err)
                reject(err);
            else
                accept();
        });
    });
};

/**
 * Détermine si un fichier ou un chemin existe.
 * @returns {boolean} vrai si le chemin existe
 */
exports.fileExists = (path) => {
    return fs.existsSync(path);
};