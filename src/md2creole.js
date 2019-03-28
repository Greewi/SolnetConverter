const io = require('./io');

exports.MD2Creole = class {
    /**
     * Converti un article depuis le format MarkDown vers un format Creole
     * @param {string} mdSource le nom du fichier MarkDown à charger
     * @param {string} creoleOutput le nom du fichier Creole à sauvegarder
     * @returns {Promise}
     */
    static convert(mdSource, creoleOutput) {
        let promise = Promise.resolve()
            .then(() => {
                return io.readFile(mdSource);
            })
            .then((markdown) => {
                let creole = this._convertiMarkdownVersCreole(markdown);
                return io.writeFile(creole, creoleOutput);
            })
            .catch((e) => {
                console.error(e);
            });
        return promise;
    }

    /**
     * Applique les styles inlines (<em>, <cite>, etc.) en remplaçant leurs équivalent Markdown par la syntaxe creole.
     * Ne pas utiliser sur du code HTML vu qu'il dégage aussi les '<' et '>'
     * @param {string} texte Le texte à traiter
     * @returns {string}
     */
    static _appliqueStyleInline(texte) {
        return texte
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace(/\*\*([^ ][^\*]*[^ ]|[^*])\*\*/gm, "££$1££")
            .replace(/\*([^ ][^\*]*[^ ]|[^*])\*/gm, "//$1//")
            .replace(/££/gm, "**")
            ;
    };

    /**
     * Converti un texte en markdown vers du HTML
     * @param {string} markdown Le texte source au format Markdown
     * @returns {string}
     */
    static _convertiMarkdownVersCreole(markdown) {
        // Segmentation des lignes
        let lignesBrutes = markdown.split(/\n/);
        let lignes = [];
        for (let ligne of lignesBrutes) {
            if (ligne.match(/^## /gm))
                lignes.push({ type: "H2", texte: ligne.substr(3).trim() });
            else if (ligne.match(/^# /gm))
                lignes.push({ type: "H1", texte: ligne.substr(2).trim() });
            else if (ligne.match(/^\* /gm))
                lignes.push({ type: "LI", texte: ligne.substr(2).trim() });
            else if (ligne.match(/^>$/gm))
                lignes.push({ type: "CITATION", texte: "" });
            else if (ligne.match(/^> /gm))
                lignes.push({ type: "CITATION", texte: ligne.substr(2).trim() });
            else if (ligne.match(/^>> ### /gm))
                lignes.push({ type: "H3ENCART", texte: ligne.substr(7).trim() });
            else if (ligne.match(/^>> \* /gm))
                lignes.push({ type: "LIENCART", texte: ligne.substr(5).trim() });
            else if (ligne.match(/^>>$/gm))
                lignes.push({ type: "ENCART", texte: "" });
            else if (ligne.match(/^>> /gm))
                lignes.push({ type: "ENCART", texte: ligne.substr(3).trim() });
            else if (ligne.trim().match(/^<.*>$/))
                lignes.push({ type: "HTML", texte: ligne });
            else if (ligne.trim().match(/^----$/))
                lignes.push({ type: "SAUTPAGE", texte: "" });
            else if (ligne.trim() == "")
                lignes.push({ type: "VIDE", texte: "" });
            else
                lignes.push({ type: "TEXT", texte: ligne });
        }

        // Traitement individuel des lignes
        let lignesFinales = [];
        for (let ligneActuelle = 0; ligneActuelle < lignes.length; ligneActuelle++) {
            let ligne = lignes[ligneActuelle];
            let lignePrecedente = ligneActuelle > 0 ? lignes[ligneActuelle - 1] : { type: "VIDE", texte: "" };
            let ligneSuivante = ligneActuelle < lignes.length - 1 ? lignes[ligneActuelle + 1] : { type: "VIDE", texte: "" };

            switch (ligne.type) {
                case "H1":
                    lignesFinales.push(`= ${this._appliqueStyleInline(ligne.texte)}`);
                    break;
                case "H2":
                    lignesFinales.push(`== ${this._appliqueStyleInline(ligne.texte)}`);
                    break;
                case "LI":
                    lignesFinales.push(`* ${this._appliqueStyleInline(ligne.texte)}`);
                    break;
                case "TEXT":
                    lignesFinales.push(`${this._appliqueStyleInline(ligne.texte)}`);
                    break;
                case "CITATION":
                    if (ligneSuivante.type == "CITATION" && ligneSuivante.texte.trim() == "")
                        lignesFinales.push(`//${this._appliqueStyleInline(ligne.texte)}//\\\\`);
                    else if (ligne.texte.trim() != "")
                        lignesFinales.push(`//${this._appliqueStyleInline(ligne.texte)}//`);
                    break;
                case "H3ENCART":
                    lignesFinales.push(`[(${this._appliqueStyleInline(ligne.texte)})`);
                    if (ligneSuivante.type != "ENCART" && ligneSuivante.type != "H3ENCART" && ligneSuivante.type != "LIENCART")
                        lignesFinales.push(`\n)]`);
                    break;
                case "LIENCART":
                    if (lignePrecedente.type != "ENCART" && lignePrecedente.type != "H3ENCART" && lignePrecedente.type != "LIENCART")
                        lignesFinales.push(`[()`);
                    lignesFinales.push(`* ${this._appliqueStyleInline(ligne.texte)}`);
                    if (ligneSuivante.type != "ENCART" && ligneSuivante.type != "H3ENCART" && ligneSuivante.type != "LIENCART")
                        lignesFinales.push(`\n)]`);
                    break;
                case "ENCART":
                    if (lignePrecedente.type != "ENCART" && lignePrecedente.type != "H3ENCART" && lignePrecedente.type != "LIENCART")
                        lignesFinales.push(`[()`);
                    lignesFinales.push(`${this._appliqueStyleInline(ligne.texte)}`);
                    if (ligneSuivante.type != "ENCART" && ligneSuivante.type != "H3ENCART" && ligneSuivante.type != "LIENCART")
                        lignesFinales.push(`\n)]`);
                    break;
                case "SAUTPAGE":
                    lignesFinales.push(`~~`);
                    break;
                case "HTML":
                    if (lignePrecedente.type != "HTML")
                        lignesFinales.push(`<html>`);
                    lignesFinales.push(ligne.texte);
                    if (ligneSuivante.type != "HTML")
                        lignesFinales.push(`</html>`);
                    break;
                default:
                    lignesFinales.push(ligne.texte);
            }
        }

        // Recomposition du document
        let creole = "";
        for (let ligne of lignesFinales)
            creole += `${ligne}\n`;
        return creole;
    };
};