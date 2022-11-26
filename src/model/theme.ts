import * as io from '../utils/io';

export type ThemeConfig = {
    type: "html"|"tex",
    ressources: string[],
    styles: string[]
};

export default class Theme {
    /**
     * Load a theme
     * @param path the path of the theme json file
     * @returns Resolves the loaded theme
     */
    static async loadTheme(path: string): Promise<Theme> {
        const json = await io.readFile(path);
        const config: ThemeConfig = JSON.parse(json);
        const root = path.replace(/[^\/]*.json/, "");
        const styles: Map<string, Style> = new Map();
        for(let style of config.styles)
            styles.set(style, await Style.loadStyle(root, style, config.type));
        let startCode = await io.readFile(`${root}template_start.${config.type}`);
        let endCode = await io.readFile(`${root}template_end.${config.type}`);
        return new Theme(root, config.type, styles, config.ressources, startCode, endCode);
    }

    private _root : string;
    private _type: string;
    private _styles: Map<string, Style>;
    private _ressources: string[];
    private _startCode: string;
    private _endCode: string;

    /**
     * @param root the root path of the theme
     * @param type the type of the theme (tex, html)
     * @param styles the list of the styles of the theme
     * @param ressources the list of the ressources to copy of the theme
     * @param startCode the starting code of a document using this theme
     * @param endCode the ending code of a document using this theme
     */
    private constructor(root: string, type: string, styles: Map<string, Style>, ressources:string[], startCode: string, endCode: string) {
        this._root = root;
        this._type = type;
        this._styles = styles;
        this._ressources = ressources;
        this._startCode = startCode;
        this._endCode = endCode;
    }
    
    getRoot(): string {
        return this._root;
    }

    getType(): string {
        return this._type;
    }

    getRessources(): string[] {
        return this._ressources;
    }

    getStyle(name:string): Style {
        const style = this._styles.get(name);
        if(!style)
            throw new Error(`Style not found : ${name}`);
        return style;
    }

    getStartCode() : string {
        return this._startCode;
    }
    
    getEndCode() : string {
        return this._endCode;
    }
};

export class Style {
    /**
     * Load a style
     * @param root the root path of the theme
     * @param name the name of the style
     * @param type the type of the theme
     * @returns the loaded style
     */
    static async loadStyle(root: string, name: string, type: string) : Promise<Style> {
        let startCode = await io.readFile(`${root}style_${name}_start.${type}`);
        let endCode = await io.readFile(`${root}style_${name}_end.${type}`);
        return new Style(name, startCode, endCode);
    }

    private _name: string;
    private _startCode: string;
    private _endCode: string;

    /**
     * @param name the name of the style
     * @param startCode the starting code of a section of this style
     * @param endCode the ending code of a section of this style
     */
    private constructor(name: string, startCode: string, endCode: string) {
        this._name = name;
        this._startCode = startCode;
        this._endCode = endCode;
    }

    getName(): string {
        return this._name;
    }

    getStartCode() : string {
        return this._startCode;
    }
    
    getEndCode() : string {
        return this._endCode;
    }
};
