import * as io from '../utils/io';

export type BookConfig = {
    title: string,
    author: string,
    description: string,
    cover: string[],
    structure: SectionConfig[]
}

export type SectionConfig = {
    source: string,
    style: string,
    level: number
};

export default class Book {
    /**
     * Load a book
     * @param path the path to the book json
     * @returns resolves to the loaded Book
     */
    static async loadBook(path: string): Promise<Book> {
        let root = path.replace(/[^\/\\]+$/, "");
        let json = await io.readFile(path);
        let bookConfig : BookConfig = JSON.parse(json);
        let sections : Section[] = [];
        for (let sectionConfig of bookConfig.structure)
            sections.push(await Section.loadSection(root, sectionConfig));
        return new Book(root, bookConfig.title, bookConfig.author, bookConfig.cover, bookConfig.description, sections);
    }

    private _root: string;
    private _title: string;
    private _author: string;
    private _cover: string[];
    private _description: string;
    private _sections: Section[];

    /**
     * @param root the root path of the book
     * @param title the title of the book
     * @param author the author of the book
     * @param cover the file used for the cover of the book
     * @param description the description of the book
     * @param sections the list of the sections of the book
     */
    private constructor(root: string, title: string, author: string, cover: string[], description: string, sections: Section[]) {
        this._root = root;
        this._title = title;
        this._author = author;
        this._cover = cover;
        this._description = description;
        this._sections = sections;
    }

    getRoot(): string {
        return this._root;
    }

    getTitle(): string {
        return this._title;
    }

    getAuthor(): string {
        return this._author;
    }

    getDescription(): string {
        return this._description;
    }

    getSectionCount(): number {
        return this._sections.length;
    }

    /**
     * @returns the i-th section (starts a 0)
     */
    getSection(i: number): Section {
        return this._sections[i];
    }

    /**
     * @returns the list of the sections
     */
    getSections(): Section[] {
        return this._sections;
    }

    /**
     * @param formats the files format accepted (.png, .jpg, .pdf, etc.)
     * @returns the cover file name
     */
    getCover(formats: string[]): string {
        for(const format of formats) {
            for(const cover of this._cover) {
                if(cover.endsWith(format))
                    return cover;
            }
        }
        throw new Error("No corresponding cover format found for "+formats);
    }

    getRessources(): string[] {
        let ressources: string[] = [];
        ressources.push(...this._cover);
        for (let section of this._sections) {
            ressources = ressources.concat(section.getRessources());
        }
        return ressources;
    }
};

export class Section {
    /**
     * Load a section of a book
     * @param root the root path of the book
     * @param sectionConfig the configuration of the section
     * @returns {Promise<Section>} une Promise résolvant la section chargée
     */
    static async loadSection(root: string, sectionConfig: SectionConfig): Promise<Section> {
        let subPath = sectionConfig.source.replace(/[^\/\\]*$/,"");
        let source = sectionConfig.source;
        let style = sectionConfig.style;
        let level = sectionConfig.level;
        let ressources = source.endsWith(".md") || source=="" ? [] : [source];

        let text = await this._loadText(root, source);
        let regex = /\!\[[^\]]*\]\(([^)]+)\)/g;
        let matches;
        while ((matches = regex.exec(text)) != null) {
            ressources.push(matches[1].replace(/%20/g, " "));
        }
        return new Section(root, source, style, text, level, ressources);
    }

    /**
     * Load the text of the section
     * @param racine the root path of the book
     * @param source the source path of the section
     */
    private static async _loadText(racine: string, source: string) : Promise<string> {
        if(!source.endsWith(".md"))
            return "";
        else
            return await io.readFile(racine + source);
    }

    private _root: string;
    private _source: string;
    private _style: string;
    private _text: string;
    private _level: number;
    private _ressources: string[];

    /**
     * @param root the root path of the book
     * @param source the source path of the section
     * @param style the style of the section
     * @param text the text of the section
     * @param level the level of the section
     * @param ressources the ressources (images) list of the section
     */
    private constructor(root: string, source: string, style: string, text: string, level: number, ressources: string[]) {
        this._root = root;
        this._source = source;
        this._style = style;
        this._text = text;
        this._level = level;
        this._ressources = ressources;
    }

    getSource(): string {
        return this._source;
    }

    getStyle(): string {
        return this._style;
    }

    getText(): string {
        return this._text;
    }

    getLevel(): number {
        return this._level;
    }

    getRessources(): string[] {
        return this._ressources;
    }
};
