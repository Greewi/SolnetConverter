import * as io from '../utils/io';

export default class MD2Creole {
    /**
     * Convert a markdown article to a wiki creole file
     * @param mdSource the markdown source file
     * @param creoleOutput the wiki creole destination file
     */
    static convert(mdSource: string, creoleOutput: string): Promise<void> {
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
    static _applyInlineStyle(texte: string): string {
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
    static _convertiMarkdownVersCreole(markdown: string): string {
        // Lines segmentations
        let rawlines = markdown.split(/\n/);
        let lines : {type:string, text:string}[] = [];
        for (let line of rawlines) {
            if (line.match(/^## /gm))
                lines.push({ type: "H2", text: line.substring(3).trim() });
            else if (line.match(/^# /gm))
                lines.push({ type: "H1", text: line.substring(2).trim() });
            else if (line.match(/^\* /gm))
                lines.push({ type: "LI", text: line.substring(2).trim() });
            else if (line.match(/^>$/gm))
                lines.push({ type: "CITATION", text: "" });
            else if (line.match(/^> /gm))
                lines.push({ type: "CITATION", text: line.substring(2).trim() });
            else if (line.match(/^>> ### /gm))
                lines.push({ type: "H3ENCART", text: line.substring(7).trim() });
            else if (line.match(/^>> \* /gm))
                lines.push({ type: "LIENCART", text: line.substring(5).trim() });
            else if (line.match(/^>>$/gm))
                lines.push({ type: "ENCART", text: "" });
            else if (line.match(/^>> /gm))
                lines.push({ type: "ENCART", text: line.substring(3).trim() });
            else if (line.trim().match(/^<.*>$/))
                lines.push({ type: "HTML", text: line });
            else if (line.trim().match(/^----$/))
                lines.push({ type: "SAUTPAGE", text: "" });
            else if (line.trim() == "")
                lines.push({ type: "VIDE", text: "" });
            else
                lines.push({ type: "TEXT", text: line });
        }

        // Individual lines processing
        let finalLines: string[] = [];
        for (let currentLine = 0; currentLine < lines.length; currentLine++) {
            let line = lines[currentLine];
            let previousLine = currentLine > 0 ? lines[currentLine - 1] : { type: "VIDE", text: "" };
            let nextLine = currentLine < lines.length - 1 ? lines[currentLine + 1] : { type: "VIDE", text: "" };

            switch (line.type) {
                case "H1":
                    finalLines.push(`= ${this._applyInlineStyle(line.text)}`);
                    break;
                case "H2":
                    finalLines.push(`== ${this._applyInlineStyle(line.text)}`);
                    break;
                case "LI":
                    finalLines.push(`* ${this._applyInlineStyle(line.text)}`);
                    break;
                case "TEXT":
                    finalLines.push(`${this._applyInlineStyle(line.text)}`);
                    break;
                case "CITATION":
                    if (nextLine.type == "CITATION" && nextLine.text.trim() == "")
                        finalLines.push(`//${this._applyInlineStyle(line.text)}//\\\\`);
                    else if (line.text.trim() != "")
                        finalLines.push(`//${this._applyInlineStyle(line.text)}//`);
                    break;
                case "H3ENCART":
                    finalLines.push(`[(${this._applyInlineStyle(line.text)})`);
                    if (nextLine.type != "ENCART" && nextLine.type != "H3ENCART" && nextLine.type != "LIENCART")
                        finalLines.push(`\n)]`);
                    break;
                case "LIENCART":
                    if (previousLine.type != "ENCART" && previousLine.type != "H3ENCART" && previousLine.type != "LIENCART")
                        finalLines.push(`[()`);
                    finalLines.push(`* ${this._applyInlineStyle(line.text)}`);
                    if (nextLine.type != "ENCART" && nextLine.type != "H3ENCART" && nextLine.type != "LIENCART")
                        finalLines.push(`\n)]`);
                    break;
                case "ENCART":
                    if (previousLine.type != "ENCART" && previousLine.type != "H3ENCART" && previousLine.type != "LIENCART")
                        finalLines.push(`[()`);
                    finalLines.push(`${this._applyInlineStyle(line.text)}`);
                    if (nextLine.type != "ENCART" && nextLine.type != "H3ENCART" && nextLine.type != "LIENCART")
                        finalLines.push(`\n)]`);
                    break;
                case "SAUTPAGE":
                    finalLines.push(`~~`);
                    break;
                case "HTML":
                    if (previousLine.type != "HTML")
                        finalLines.push(`<html>`);
                    finalLines.push(line.text);
                    if (nextLine.type != "HTML")
                        finalLines.push(`</html>`);
                    break;
                default:
                    finalLines.push(line.text);
            }
        }

        // Recomposition du document
        let creole = "";
        for (let line of finalLines)
            creole += `${line}\n`;
        return creole;
    };
};