const InkscapeCLI = require('./inkscapeCLI').InkscapeCLI;
const PDFUniteCLI = require('./pdfuniteCLI').PDFUniteCLI;
const io = require('./io');

exports.Personnage2pdf = class {
    /**
     * Converti une personnage au format json en sa fiche au format pdf en se servant d'une définition au format json
     * @param {string} jsonFile le personnage au format json
     * @param {string} illustration l'illustration du personnage (ou null pour pas d'illustration)
     * @param {string} jsonTemplate la définition de la fiche (chemin vers le fichier json)
     * @param {string} pdfFile le fichier pdf à générer
     * @returns {Promise}
     */
    static convert(jsonFile, illustration, jsonTemplate, pdfFile) {
        let personnage;
        let template;
        let valeurs;
        let promise = Promise.resolve()
            .then(() => {
                return io.readFile(jsonTemplate);
            })
            .then((json) => {
                template = JSON.parse(json);
            })
            .then(() => {
                return io.readFile(jsonFile);
            })
            .then((json) => {
                personnage = JSON.parse(json);
            })
            .then(() => {
                valeurs = {};
                for (let nom in template.correspondances) {
                    let definition = template.correspondances[nom];
                    let valeur = this._getValeur(definition, personnage);
                    if (template.multilignes[nom]) {
                        let lignes = template.multilignes[nom];
                        for (let i = 0; i < lignes.length; i++) {
                            if (valeur.length <= lignes[i]) {
                                valeurs[nom + i] = valeur;
                                valeur = "";
                            } else {
                                let coupure = lignes[i];
                                for (let l = 0; l < lignes[i]; l++)
                                    if (valeur[l] == " ")
                                        coupure = l + 1;
                                valeurs[nom + i] = valeur.substring(0, coupure);
                                valeur = valeur.substring(coupure);
                            }
                        }
                    }
                    else {
                        valeurs[nom] = valeur;
                    }
                }
                if (illustration != null) {
                    valeurs["illustration"] = illustration;
                    valeurs["displayIllustration"] = "block";
                }
                else {
                    valeurs["displayIllustration"] = "none";
                }
            })
            .then(() => {
                let promise = Promise.resolve();
                for (let i = 0; i < template.svg.length; i++) {
                    let svg = template.svg[i];
                    promise = promise.then(() => {
                        return io.readFile(svg);
                    }).then((svg) => {
                        for (let nom in valeurs)
                            svg = svg.replace(`$${nom}`, valeurs[nom]);
                        return io.writeFile(svg, `tmp/page${i}.svg`);
                    }).then(() => {
                        return InkscapeCLI.generePDF(`tmp/page${i}.svg`, `tmp/page${i}.pdf`);
                    })
                }
                return promise;
            })
            .then(() => {
                let listePDF = [];
                for (let i = 0; i < template.svg.length; i++)
                    listePDF.push(`tmp/page${i}.pdf`);
                return PDFUniteCLI.unifiePDF(listePDF, pdfFile);
            });
        return promise;
    }

    /**
     * Récupére une valeur dans un objet en suivant une définition
     * @param {string} definition la définition de la valeur (contient le type et le chemin)
     * @param {*} objet l'objet dans lequel récupérer la valeur
     */
    static _getValeur(definition, objet) {
        let resultat = definition.match(/\((.*)\)(.*)/);
        let type = resultat[1];
        let chemin = resultat[2];
        let valeur = this._recupereValeur(chemin, objet);
        if (valeur === undefined)
            console.error("Valeur non trouvée : ", chemin);
        return this._convertiValeur(type, valeur);
    }

    /**
     * Récupère une valeur dans un objet en suivant le chemin spécifié
     * @param {string} chemin le chemin de la valeur
     * @param {Object} objet l'objet dans lequel cherche la valeur
     */
    static _recupereValeur(chemin, objet) {
        if (objet === undefined)
            return undefined;
        if (!chemin)
            return undefined;
        let resultat = chemin.match(/([^\.[]*)(\[(.*)\])?\.?(.*)/);
        let propriete = resultat[1];
        let indice = resultat[3];
        let cheminRestant = resultat[4];
        let valeur = objet[propriete];
        if (valeur === undefined)
            return undefined;
        if (indice !== undefined)
            valeur = valeur[parseInt(indice)];
        if (valeur === undefined)
            return undefined;
        if (cheminRestant == "")
            return valeur;
        return this._recupereValeur(cheminRestant, valeur);
    }

    /**
     * Converti une valeur dans le type donné
     * @param {string} type le type recherché
     * @param {*} valeur la valeur à convertir
     */
    static _convertiValeur(type, valeur) {
        if (valeur === undefined)
            return "";
        switch (type) {
            case "string":
                return "" + valeur;
            case "string[]":
                if (Array.isArray(valeur)) {
                    let chaine = "";
                    for (let texte of valeur)
                        chaine = chaine == "" ? "" + texte : `${chaine}, ${texte}`;
                    return chaine;
                }
                else
                    return "" + valeur;
            case "number":
                return "" + valeur;
            case "roles":
                const roles = {
                    "COMBAT": "Combat",
                    "ENQUETE": "Enquête",
                    "ESPACE": "Espace",
                    "INFILTRATION": "Infiltration",
                    "INFORMATIQUE": "Informatique",
                    "NEGOCIATION": "Negociation",
                    "RELATION": "Relation",
                    "TECHNOLOGIE": "Technologie"
                };
                let chaine = "";
                for (let role in valeur) {
                    let chaineRole = roles[role] ? roles[role] : "" + role;
                    chaine = chaine == "" ? "" + chaineRole : `${chaine}, ${chaineRole}`;
                }
                return chaine;
            case "esprit":
                const esprits = {
                    "NATURELLE": "Intelligence naturelle",
                    "PROVOLUEE": "Intelligence provoluée",
                    "SUPERVISEE": "Intelligence supervisée",
                    "PROVOLUEE_SUPERVISEE": "Intelligence provoluée supervisée",
                    "INFOMORPHISEE": "Intelligence informophisée",
                    "PROVOLUEE_INFOMORPHISEE": "Intelligence provoluée informophisée",
                    "SYNCHRO": "IA Synchro",
                    "WOLFA": "IA Wolfa",
                    "LEY_WAN": "IA de Ley-Wan"
                };
                if (!valeur || !valeur.id)
                    return "" + valeur;
                return esprits[valeur.id] ? esprits[valeur.id] : "" + valeur;
            case "enveloppe":
                const enveloppes = {
                    "BIOLOGIQUE": "Biologique",
                    "BIOMODIFIE": "Biomodifié",
                    "CYBORG": "Cyborg",
                    "PROVOLUE": "Provolué",
                    "PROVOLUE_BIOMODIFIE": "Provolué biomodifié",
                    "PROVOLUE_CYBORG": "Provolué cyborg",
                    "REPLICANT": "Réplicant",
                    "REPLICANT_CYBORG": "Réplicant cyborg",
                    "CHIMERE": "Chimère",
                    "CHIMERE_CYBORG": "Chimère cyborg",
                    "CYBERNETIQUE": "Cybernétique",
                    "HYPER_HYBRIDE": "Hyper hybride",
                    "INFORMORPHE": "Informorphe"
                };
                if (!valeur || !valeur.id)
                    return "" + valeur;
                return enveloppes[valeur.id] ? enveloppes[valeur.id] : "" + valeur;
            case "genre":
                const genres = {
                    "NEUTRE": "Neutre",
                    "MASCULIN": "Masculin",
                    "FEMININ": "Féminin",
                    "MIXTE": "Mixte",
                    "FLUIDE": "Fluide",
                    "INDEFINI": "Indéfini"
                };
                return genres[valeur] ? genres[valeur] : "" + valeur;
            case "null":
            default:
                return "";
        }
    }
};