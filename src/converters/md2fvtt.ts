import * as io from '../utils/io';

export default class MD2FVTT {
    /**
     * Convert a markdown article to a Foundry VTT HTML text
     * @param mdSource the markdown source file
     * @param fvttOutput the html destination file
     * @returns {Promise}
     */
    static async convertFile(mdSource: string, fvttOutput: string): Promise<void> {
        let markdown = await io.readFile(mdSource);
        let html = this.convert(markdown);
        await io.writeFile(html, fvttOutput);
    }

    /**
     * Convert markdown text to latex text
     * @param markdown the markdown source text
     * @returns the latex converted text
     */
    static convert(markdown: string): string {
        // Line segmentation
        markdown = markdown.replace(/\r/g, "");
        let rawLines = markdown.split(/\n/);
        let lines : {type:string, text:string}[] = [];
        for (let line of rawLines) {
            if (line.match(/^### /g))
                lines.push({ type: "H3", text: line.substring(4).trim() });
            else if (line.match(/^## /g))
                lines.push({ type: "H2", text: line.substring(3).trim() });
            else if (line.match(/^# /g))
                lines.push({ type: "H1", text: line.substring(2).trim() });
            else if (line.match(/^\* /g))
                lines.push({ type: "LI", text: line.substring(2).trim() });
            else if (line.match(/^>>$/g))
                lines.push({ type: "CITATION", text: "" });
            else if (line.match(/^>> /g))
                lines.push({ type: "CITATION", text: line.substring(2).trim() });
            else if (line.match(/^> ### /g))
                lines.push({ type: "HEADERENCART", text: line.substring(6).trim() });
            else if (line.match(/^> ## /g))
                lines.push({ type: "HEADERENCART", text: line.substring(5).trim()});
            else if (line.match(/^> # /g))
                lines.push({ type: "HEADERENCART", text: line.substring(4).trim() });
            else if (line.match(/^> \* /g))
                lines.push({ type: "LIENCART", text: line.substring(4).trim() });
            else if (line.match(/^>$/g))
                lines.push({ type: "ENCART", text: "" });
            else if (line.match(/^> /g))
                lines.push({ type: "ENCART", text: line.substring(2).trim() });
            else if (line.trim().match(/^<.*>$/))
                lines.push({ type: "HMTL", text: line });
            else if (line.trim().match(/^----$/))
                lines.push({ type: "SAUTPAGE", text: "" });
            else if (line.trim() == "***" || line.trim().match(/^[*]*FIN[*]*$/))
                lines.push({ type: "CENTRE", text: line.trim()});
            else if (line.trim() == "")
                lines.push({ type: "VIDE", text: "" });
            else
                lines.push({ type: "TEXT", text: line });
        }

        // Line processing
        let finalLines : string[] = [];
        for (let currentLine = 0; currentLine < lines.length; currentLine++) {
            let line = lines[currentLine];
            let previousLine = currentLine > 0 ? lines[currentLine - 1] : { type: "VIDE", texte: "" };
            let nextLine = currentLine < lines.length - 1 ? lines[currentLine + 1] : { type: "VIDE", texte: "" };

            switch (line.type) {
                case "H1":
                    finalLines.push(`<h1>${this._applyInlineStyles(line.text)}</h1>`);
                    break;
                case "H2":
                    finalLines.push(`<h2>${this._applyInlineStyles(line.text)}</h2>`);
                    break;
                case "H3":
                    finalLines.push(`<h3>${this._applyInlineStyles(line.text)}</h3>`);
                    break;
                case "LI":
                    if (previousLine.type != "LI")
                        finalLines.push(`<ul>`);
                    finalLines.push(`<li>${this._applyInlineStyles(line.text)}</li>`);
                    if (nextLine.type != "LI")
                        finalLines.push(`</ul>`);
                    break;
                case "TEXT":
                    finalLines.push(`${this._applyInlineStyles(line.text)}`);
                    if (nextLine.type != "TEXT")
                        finalLines.push(``);
                    break;
                case "CITATION":
                    if (previousLine.type != "CITATION")
                        finalLines.push(`<blockquote><p>`);
                    if (line.text.trim() == "") {
                        finalLines.push(`</p><p>`);
                    }
                    else
                        finalLines.push(`${this._applyInlineStyles(line.text)}`);
                    if (nextLine.type != "CITATION")
                        finalLines.push(`</p></blockquote>`);
                    break;
                case "HEADERENCART":
                    finalLines.push(`<blockquote><b>${this._applyInlineStyles(line.text)}</b></blockquote>`);
                    if (nextLine.type != "ENCART" && nextLine.type != "HEADERENCART" && nextLine.type != "LIENCART")
                        finalLines.push(`</blockquote>`);
                    break;
                case "LIENCART":
                    if (previousLine.type != "ENCART" && previousLine.type != "HEADERENCART" && previousLine.type != "LIENCART")
                        finalLines.push(`<blockquote>`);
                    if (previousLine.type != "LIENCART")
                        finalLines.push(`<ul>`);
                    finalLines.push(`<li>${this._applyInlineStyles(line.text)}</li>`);
                    if (nextLine.type != "LIENCART")
                        finalLines.push(`</ul>`);
                    if (nextLine.type != "ENCART" && nextLine.type != "HEADERENCART" && nextLine.type != "LIENCART")
                        finalLines.push(`</blockquote>`);
                    break;
                case "ENCART":
                    if (previousLine.type != "ENCART" && previousLine.type != "HEADERENCART" && previousLine.type != "LIENCART")
                    finalLines.push(`<blockquote>`);
                    if (previousLine.type != "ENCART")
                        finalLines.push(``);
                    finalLines.push(`${this._applyInlineStyles(line.text)}`);
                    if (nextLine.type != "ENCART" && nextLine.type != "HEADERENCART" && nextLine.type != "LIENCART")
                        finalLines.push(`</blockquote>`);
                    break;
                case "CENTRE":
                    finalLines.push(`<center>${line.text=="***"? line.text : this._applyInlineStyles(line.text)}</center>`);
                case "SAUTPAGE":
                    // Nothing to do
                    break;
                case "VIDE":
                    break;
                default:
                    finalLines.push(line.text);
            }
        }

        // Gathering document
        let fvtt = finalLines.join("\n");
        return fvtt;
    };

    /**
     * Apply inline styles
     * @param text the text to convert
     * @returns the converted text
     */
    static _applyInlineStyles(text: string): string {
        return text.replace("&", "&amp;")
            .replace(" ", "&nbsp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace(/!\[([^\[]+)]\(([^(]+)\)/g,'<img src="$2" alt="$1"/>')
            .replace(/\[([^\[]+)]\(([^(]+)\)/g,'<a href="$2">$1</a>')
            .replace(/\*\*([^ ][^\*]*[^ ]|[^*])\*\*/gm, "<b>$1</b>")
            .replace(/\*([^ ][^\*]*[^ ]|[^*])\*/gm, "<i>$1</i>");
    };
};