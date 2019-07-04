const io = require('./io');

exports.MD2HTML = class {
    /**
     * Converti un article depuis le format MarkDown vers un format MarkDown HTML
     * @param {string} mdSource le nom du fichier MarkDown à charger
     * @param {string} htmlOutput le nom du fichier HTML à sauvegarder
     * @returns {Promise}
     */
    static convert(mdSource, htmlOutput) {
        let promise = Promise.resolve()
            .then(() => {
                return io.readFile(mdSource);
            })
            .then((markdown) => {
                let html = this._convertiMarkdownVersHTML(markdown);
                return io.writeFile(html, htmlOutput);
            })
            .catch((e) => {
                console.error(e);
            });
        return promise;
    }

    /**
     * Applique les styles inlines (<em>, <cite>, etc.) en remplaçant leurs équivalent Markdown par les balises HTML.
     * Ne pas utiliser sur du code HTML vu qu'il dégage aussi les '<' et '>'
     * @param {string} texte Le texte à traiter
     * @returns {string}
     */
    static _appliqueStyleInline(texte) {
        return texte
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace(/\*\*([^ ][^\*]*[^ ]|[^*])\*\*/gm, "<em>$1</em>")
            .replace(/\*([^ ][^\*]*[^ ]|[^*])\*/gm, "<cite>$1</cite>")
            ;
    };

    /**
     * Converti un texte en markdown vers du HTML
     * @param {string} markdown Le texte source au format Markdown
     * @returns {string}
     */
    static convertiMarkdownVersHTML(markdown) {
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
                lignes.push({ type: "HMTL", texte: ligne });
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
                    lignesFinales.push(`<h1>${this._appliqueStyleInline(ligne.texte)}</h1>`);
                    break;
                case "H2":
                    lignesFinales.push(`<h2>${this._appliqueStyleInline(ligne.texte)}</h2>`);
                    break;
                case "LI":
                    if (lignePrecedente.type != "LI")
                        lignesFinales.push(`<ul>`);
                    lignesFinales.push(`    <li>${this._appliqueStyleInline(ligne.texte)}</li>`);
                    if (ligneSuivante.type != "LI")
                        lignesFinales.push(`</ul>`);
                    break;
                case "TEXT":
                    if (lignePrecedente.type != "TEXT")
                        lignesFinales.push(`<p>`);
                    lignesFinales.push(`    ${this._appliqueStyleInline(ligne.texte)}`);
                    if (ligneSuivante.type != "TEXT")
                        lignesFinales.push(`</p>`);
                    break;
                case "CITATION":
                    if (lignePrecedente.type != "CITATION") {
                        lignesFinales.push(`<blockquote>`);
                        lignesFinales.push(`<p>`);
                    }
                    if (ligne.texte.trim() == "") {
                        lignesFinales.push(`</p>`);
                        lignesFinales.push(`<p>`);
                    }
                    else
                        lignesFinales.push(`    ${this._appliqueStyleInline(ligne.texte)}`);
                    if (ligneSuivante.type != "CITATION") {
                        lignesFinales.push(`</p>`);
                        lignesFinales.push(`</blockquote>`);
                    }
                    break;
                case "H3ENCART":
                    if (lignePrecedente.type != "ENCART" && lignePrecedente.type != "H3ENCART" && lignePrecedente.type != "LIENCART")
                        lignesFinales.push(`<aside>`);
                    lignesFinales.push(`    <h3>${this._appliqueStyleInline(ligne.texte)}</h3>`);
                    if (ligneSuivante.type != "ENCART" && ligneSuivante.type != "H3ENCART" && ligneSuivante.type != "LIENCART")
                        lignesFinales.push(`</aside>`);
                    break;
                case "LIENCART":
                    if (lignePrecedente.type != "ENCART" && lignePrecedente.type != "H3ENCART" && lignePrecedente.type != "LIENCART")
                        lignesFinales.push(`<aside>`);
                    if (lignePrecedente.type != "LIENCART")
                        lignesFinales.push(`    <ul>`);
                    lignesFinales.push(`        <li>${this._appliqueStyleInline(ligne.texte)}</li>`);
                    if (ligneSuivante.type != "LIENCART")
                        lignesFinales.push(`    </ul>`);
                    if (ligneSuivante.type != "ENCART" && ligneSuivante.type != "H3ENCART" && ligneSuivante.type != "LIENCART")
                        lignesFinales.push(`</aside>`);
                    break;
                case "ENCART":
                    if (lignePrecedente.type != "ENCART" && lignePrecedente.type != "H3ENCART" && lignePrecedente.type != "LIENCART")
                        lignesFinales.push(`<aside>`);
                    if (lignePrecedente.type != "ENCART")
                        lignesFinales.push(`    <p>`);

                    if (ligne.texte.trim() == "") {
                        if (lignePrecedente.type == "ENCART" && ligneSuivante.type == "ENCART") {
                            lignesFinales.push(`    </p>`);
                            lignesFinales.push(`    <p>`);
                        }
                    }
                    else
                        lignesFinales.push(`        ${this._appliqueStyleInline(ligne.texte)}`);
                    if (ligneSuivante.type != "ENCART")
                        lignesFinales.push(`    </p>`);
                    if (ligneSuivante.type != "ENCART" && ligneSuivante.type != "H3ENCART" && ligneSuivante.type != "LIENCART")
                        lignesFinales.push(`</aside>`);
                    break;
                case "SAUTPAGE":
                    lignesFinales.push(`<div class="sautPage"></div>`);
                    break;
                default:
                    lignesFinales.push(ligne.texte);
            }
        }

        // Recomposition du document
        let html = "";
        for (let ligne of lignesFinales)
            html += `${ligne}\n`;
        return html;
    };
};