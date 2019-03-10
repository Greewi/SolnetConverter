const fs = require('fs');

/**
 * @param {string} source la source du HTML à charger
 * @returns {Promise<string>} une promise qui résoud le HTML chargé
 */
exports.readFile = (source)=>{
    return new Promise((accept, reject)=>{
        fs.readFile(source, "utf8", (err, htmlSource)=>{
            if(err)
                reject(err);
            else{
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
exports.writeFile = (data, dest)=>{
    return new Promise((accept, reject)=>{
        fs.writeFile(dest, data, "utf8", (err)=>{
            if(err)
                reject(err);
            else
                accept();
        });
    })
};

exports.mkdir = (path)=>{
    return new Promise((accept, reject)=>{
        fs.mkdir(path, {recursive:true}, (err)=>{
            if(err)
                reject(err);
            else
                accept();
        });
    });
};
