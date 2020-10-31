const io = require("../io");
const { MD2HTML } = require("../md2html");

/**
 * Représente un livre
 */
const Livre = class {
    /**
     * Charge un livre
     * @param {string} chemin chemin vers le fichier json du livre
     * @returns {Promise<Livre>} une Promise résolvant le livre chargé
     */
    static chargeLivre(chemin) {
        let racine = chemin.replace(/[^\/\\]+$/, "");
        let config = null;
        let sections = null;
        return Promise.resolve().then(() => {
            return io.readFile(chemin);
        }).then((json) => {
            config = JSON.parse(json);
        }).then(() => {
            return this.chargeSections(racine, config.structure);
        }).then((sectionsChargees) => {
            sections = sectionsChargees;
        }).then(() => {
            return new Livre(racine, config.titre, config.auteur, config.description, sections);
        });
    }

    /**
     * Charge les sections d'un livre
     * @param {string} racine la racine du livre
     * @param {*} configSections la configuration de la section
     * @returns {Promise<Section[]>} une Promise résolvant la liste des sections chargées
     */
    static chargeSections(racine, configSections) {
        let sections = [];
        let promise = Promise.resolve();
        for (let configSection of configSections) {
            promise = promise.then(() => {
                return Section.chargeSection(racine, configSection);
            }).then((section) => {
                sections.push(section);
            });
        }
        return promise.then(() => {
            return sections;
        });
    }

    /**
     * @param {string} racine le chemin racine du livre
     * @param {string} titre le titre du livre
     * @param {string} auteur le ou les auteurs du livre
     * @param {string} description la description du livre
     * @param {Section[]} sections la liste des sections du livre
     */
    constructor(racine, titre, auteur, description, sections) {
        this._racine = racine;
        this._titre = titre;
        this._auteur = auteur;
        this._description = description;
        this._sections = sections;
    }

    /**
     * @returns {string} la racine du livre
     */
    getRacine() {
        return this._racine;
    }

    /**
     * @returns {string} le titre du livre
     */
    getTitre() {
        return this._titre;
    }

    /**
     * @returns {string} le ou les auteurs du livre
     */
    getAuteur() {
        return this._auteur;
    }

    /**
     * @return {string} la description du livre
     */
    getDescription() {
        return this._description;
    }

    /**
     * @returns {number} le nombre de section du livre
     */
    getNombreSections() {
        return this._sections.length;
    }

    /**
     * @returns {Section} la i-ième section du livre (commence à 0)
     */
    getSection(i) {
        return this._sections[i];
    }

    /**
     * @returns {Section[]} la liste des sections
     */
    getSections() {
        return this._sections;
    }

    getRessources() {
        let ressources = [];
        for (let section of this._sections) {
            ressources = ressources.concat(section.getRessources());
        }
        return ressources;
    }
};

/**
 * Représente une section d'un livre
 */
const Section = class {
    /**
     * Charge une section d'un livre
     * @param {string} racine la racine du livre
     * @param {*} configSection la configuration de la section
     * @returns {Promise<Section>} une Promise résolvant la section chargée
     */
    static chargeSection(racine, configSection) {
        let subPath = configSection.source.replace(/[^\/\\]*$/,"");
        let source = configSection.source;
        let style = configSection.style;
        let texte = null;
        let niveau = configSection.niveau;
        let ressources = source.endsWith(".md") || source=="" ? [] : [source];
        return Promise.resolve().then(() => {
            return this.chargeTexte(racine, source);
        }).then((texteCharge) => {
            texte = texteCharge;
            if (texte != null) {

                let regex = /\!\[[^\]]*\]\(([^)]+)\)/g;
                let matches;
                while ((matches = regex.exec(texte)) != null) {
                    ressources.push(subPath+matches[1].replace(/%20/g, " "));
                }
            }
        }).then(() => {
            return new Section(racine, source, style, texte, niveau, ressources);
        });
    }

    /**
     * Charge le texte de la section
     * @param {string} racine la racine du livre
     * @param {string} source la source de la section
     */
    static chargeTexte(racine, source) {
        return Promise.resolve().then(() => {
            if (!source.endsWith(".md"))
                return null;
            return io.readFile(racine + source).then((texte) => {
                return texte;
            });
        });
    }

    /**
     * @param {string} racine la racine du livre
     * @param {string} source la source de la section
     * @param {string} style le style de la section
     * @param {string} texte le texte de la section (null si c'est pas une section de texte)
     * @param {number} niveau le niveau de titre de la section
     * @param {string[]} ressources la liste des ressources (images) de la section
     */
    constructor(racine, source, style, texte, niveau, ressources) {
        this._racine = racine;
        this._source = source;
        this._style = style;
        this._texte = texte;
        this._niveau = niveau;
        this._ressources = ressources;
    }

    /**
     * @returns {string} la source de la section
     */
    getSource() {
        return this._source;
    }

    /**
     * @returns {string} le style de la section
     */
    getStyle() {
        return this._style;
    }

    /**
     * @returns {string} le texte de la section (ou null si ce n'est pas une section contenant du texte)
     */
    getTexte() {
        return this._texte;
    }

    /**
     * @returns {string} le texte de la section au format HTML (ou null si ce n'est pas une section contenant du texte)
     */
    getHTML() {
        if (this._texte == null)
            return null;
        let html = MD2HTML.convertiMarkdownVersHTML(this._texte);
        if (this._niveau == 2)
            html = html.replace(/<(\/?)h2>/g, '<$1h3>').replace(/<(\/?)h1>/g, '<$1h2>')
        return html;
    }

    /**
     * @returns {number} le niveau de titre de la section
     */
    getNiveau() {
        return this._niveau;
    }

    /**
     * @returns {string[]} la liste des ressources de la section
     */
    getRessources() {
        return this._ressources;
    }
};

exports.Livre = Livre;