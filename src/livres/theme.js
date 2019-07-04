const io = require("../io");

/**
 * Représente un thème
 */
const Theme = class {
    /**
     * Charge un thème
     * @param {string} nomTheme le nom du thème
     * @returns {Promise<Theme>} une Promise résolvant le thème chargé
     */
    static chargeTheme(nomTheme) {
        let config = null;
        let styles = {};
        let templates = {};
        return Promise.resolve().then(() => {
            return io.readFile(`./themes/${nomTheme}/theme.json`);
        }).then((json) => {
            config = JSON.parse(json);
        }).then(() => {
            return this.chargeStyles(nomTheme, config.styles);
        }).then((stylesCharges) => {
            styles = stylesCharges;
        }).then(() => {
            return this.chargeTemplates(nomTheme, config.templates);
        }).then((templatesCharges) => {
            templates = templatesCharges;
        }).then(() => {
            return new Theme(nomTheme, styles, templates);
        });
    }

    /**
     * Charge les styles d'un thème
     * @param {string} nomTheme le nom du thème
     * @param {*} configStyles la liste des configurations des styles
     * @return {Promise<Object.<string,Style>>} une Promise résolvant la liste des styles chargés
     */
    static chargeStyles(nomTheme, configStyles) {
        let styles = {};
        for (let nomStyle in configStyles) {
            let configStyle = configStyles[nomStyle];
            styles[nomStyle] = new Style(nomTheme, nomStyle, configStyle.classe, configStyle.template);
        }
        return Promise.resolve(styles);
    }

    /**
     * Charge les templates d'un thème
     * @param {string} nomTheme le nom du thème
     * @param {*} configTemplates la liste des configurations des templates
     */
    static chargeTemplates(nomTheme, configTemplates) {
        let templates = {};
        let promise = Promise.resolve();
        for (let nomTemplate in configTemplates) {
            let configTemplate = configTemplates[nomTemplate];
            promise = promise.then(() => {
                return Template.chargeTemplate(nomTheme, nomTemplate, configTemplate.type, configTemplate.page);
            }).then((template) => {
                templates[nomTemplate] = template;
            });
        }
        return promise.then(() => {
            return templates;
        });
    }

    /**
     * @param {string} nom le nom du template
     * @param {Object.<string, Style>} styles les styles du thème
     * @param {Object.<string, Template>} templates les templates du thème
     */
    constructor(nom, styles, templates) {
        this._nom = nom;
        this._styles = styles;
        this._templates = templates;
    }

    /**
     * @returns {string} le nom du thème
     */
    getNom() {
        return this._nom;
    }

    /**
     * @returns {string} la racine du thème
     */
    getRacine() {
        return `./themes/${this._nom}/`;
    }

    /**
     * @param {string} nomStyle le nom du style
     * @returns {Style} le style demandé
     */
    getStyle(nomStyle) {
        return this._styles[nomStyle];
    }

    /**
     * @param {string} nomTemplate le nom du template
     * @returns {Template} le template demandé
     */
    getTemplate(nomTemplate) {
        return this._templates[nomTemplate];
    }

    /**
     * @returns {Template[]} la liste des templates de ce thème
     */
    getListeTemplates() {
        let templates = [];
        for (let nomTemplate in this._templates) {
            let template = this._templates[nomTemplate];
            templates.push(template);
        }
        return templates;
    }

    /**
     * @returns {string[]} la liste des ressources de ce thème
     */
    getRessources() {
        let ressources = [];
        for (let nomTemplate in this._templates) {
            let template = this._templates[nomTemplate];
            ressources.push(`${template.getNom()}.css`);
            ressources = ressources.concat(template.getRessources());
        }
        return ressources;
    }
};

/**
 * Représente un style
 */
const Style = class {
    /**
     * @param {string} nomTheme le nom du thème
     * @param {string} nomStyle le nom du style
     * @param {string} classe la classe CSS du style
     * @param {string} template le nom du template
     */
    constructor(nomTheme, nomStyle, classe, template) {
        this._nomTheme = nomTheme;
        this._nomStyle = nomStyle;
        this._classe = classe;
        this._template = template;
    }

    /**
     * @returns {string} le nom du style
     */
    getNom() {
        return this._nomStyle;
    }

    /**
     * @returns {string} la classe de ce style
     */
    getClasse() {
        return this._classe;
    }

    /**
     * @returns {string} le template de ce style
     */
    getTemplate() {
        return this._template;
    }
};

/**
 * Représente un template. Il s'agit d'un fichier HTML avec sa feuille de style et les images associées.
 */
const Template = class {
    /**
     * Charge un template
     * @param {string} nomTheme le nom du thème
     * @param {string} nomTemplate le nom du template
     * @param {string} type le type du template
     * @param {Object.<string, string>} page les parametres de mise en page
     * @returns {Promise<Template>} renvoie une Promise résolvant le template chargé
     */
    static chargeTemplate(nomTheme, nomTemplate, type, page) {
        let html = null;
        let css = null;
        let ressources = [];
        return Promise.resolve().then(() => {
            return io.readFile(`./themes/${nomTheme}/${nomTemplate}.html`);
        }).then((data) => {
            html = data;
        }).then(() => {
            return io.readFile(`./themes/${nomTheme}/${nomTemplate}.css`);
        }).then((data) => {
            css = data;
            let regex = /url\('?([^')]+)'?\)/g;
            let matches;
            while((matches = regex.exec(css)) != null) {
                ressources.push(matches[1]);
            }
        }).then(() => {
            return new Template(nomTheme, nomTemplate, type, page, html, css, ressources);
        });
    }

    /**
     * @param {string} nomTheme le nom du thème
     * @param {string} nomTemplate le nom du template
     * @param {string} type le type du template
     * @param {Object.<string, string>} page les parametres de mise en page
     * @param {string} html le html du template
     * @param {string} css le css du template
     * @param {string[]} ressources les noms de fichiers des ressources du template
     */
    constructor(nomTheme, nomTemplate, type, page, html, css, ressources) {
        this._nom = nomTemplate;
        this._theme = nomTheme;
        this._type = type;
        this._page = page;
        this._html = html;
        this._css = css;
        this._ressources = ressources;
    }

    /**
     * @returns {string} le nom de ce template
     */
    getNom() {
        return this._nom;
    }

    /**
     * @returns {string} le type de ce template
     */
    getType() {
        return this._type;
    }

    /**
     * @returns {Object.<string, string>} le format de la page
     */
    getPage() {
        return this._page;
    }

    /**
     * @returns {string} le HTML de ce template
     */
    getHTML() {
        return this._html;
    }

    /**
     * @returns {string} le CSS de ce template
     */
    getCSS() {
        return this._css;
    }

    /**
     * @returns {string[]} la liste des ressources de ce template
     */
    getRessources() {
        return this._ressources;
    }
};

exports.Theme = Theme;
exports.Style = Style;
exports.Template = Template;
