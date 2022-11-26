import * as io from '../utils/io';

export default class MD2HTML {
    /**
     * Convert a markdown article to an HTML file
     * @param mdSource the markdown source file
     * @param htmlOutput the HTML destination file
     */
    static async convertFile(mdSource: string, htmlOutput: string): Promise<void> {
        let markdown = await io.readFile(mdSource);
        let html = this.convert(markdown);
        await io.writeFile(html, htmlOutput);
    }

    /**
     * Convert a markdown text to HTML
     * @param markdown The markdown text to convert
     * @returns the html converted text
     */
    static convert(markdown: string): string {
        // Line segmentations
        let rawLines = markdown.split(/\n/);
        let lines : {type:string, text:string}[] = [];
        for (let line of rawLines) {
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
                lines.push({ type: "HMTL", text: line });
            else if (line.trim().match(/^----$/))
                lines.push({ type: "SAUTPAGE", text: "" });
            else if (line.trim() == "")
                lines.push({ type: "VIDE", text: "" });
            else
                lines.push({ type: "TEXT", text: line });
        }

        // Line processing
        let finalLines:string[] = [];
        for (let currentLine = 0; currentLine < lines.length; currentLine++) {
            let line = lines[currentLine];
            let previousLine = currentLine > 0 ? lines[currentLine - 1] : { type: "VIDE", texte: "" };
            let NextLine = currentLine < lines.length - 1 ? lines[currentLine + 1] : { type: "VIDE", texte: "" };

            switch (line.type) {
                case "H1":
                    finalLines.push(`<h1>${this._applyInlineStyles(line.text)}</h1>`);
                    break;
                case "H2":
                    finalLines.push(`<h2>${this._applyInlineStyles(line.text)}</h2>`);
                    break;
                case "LI":
                    if (previousLine.type != "LI")
                        finalLines.push(`<ul>`);
                    finalLines.push(`    <li>${this._applyInlineStyles(line.text)}</li>`);
                    if (NextLine.type != "LI")
                        finalLines.push(`</ul>`);
                    break;
                case "TEXT":
                    if (previousLine.type != "TEXT")
                        finalLines.push(`<p>`);
                    finalLines.push(`    ${this._applyInlineStyles(line.text)}`);
                    if (NextLine.type != "TEXT")
                        finalLines.push(`</p>`);
                    break;
                case "CITATION":
                    if (previousLine.type != "CITATION") {
                        finalLines.push(`<blockquote>`);
                        finalLines.push(`<p>`);
                    }
                    if (line.text.trim() == "") {
                        finalLines.push(`</p>`);
                        finalLines.push(`<p>`);
                    }
                    else
                        finalLines.push(`    ${this._applyInlineStyles(line.text)}`);
                    if (NextLine.type != "CITATION") {
                        finalLines.push(`</p>`);
                        finalLines.push(`</blockquote>`);
                    }
                    break;
                case "H3ENCART":
                    if (previousLine.type != "ENCART" && previousLine.type != "H3ENCART" && previousLine.type != "LIENCART")
                        finalLines.push(`<aside>`);
                    finalLines.push(`    <h3>${this._applyInlineStyles(line.text)}</h3>`);
                    if (NextLine.type != "ENCART" && NextLine.type != "H3ENCART" && NextLine.type != "LIENCART")
                        finalLines.push(`</aside>`);
                    break;
                case "LIENCART":
                    if (previousLine.type != "ENCART" && previousLine.type != "H3ENCART" && previousLine.type != "LIENCART")
                        finalLines.push(`<aside>`);
                    if (previousLine.type != "LIENCART")
                        finalLines.push(`    <ul>`);
                    finalLines.push(`        <li>${this._applyInlineStyles(line.text)}</li>`);
                    if (NextLine.type != "LIENCART")
                        finalLines.push(`    </ul>`);
                    if (NextLine.type != "ENCART" && NextLine.type != "H3ENCART" && NextLine.type != "LIENCART")
                        finalLines.push(`</aside>`);
                    break;
                case "ENCART":
                    if (previousLine.type != "ENCART" && previousLine.type != "H3ENCART" && previousLine.type != "LIENCART")
                        finalLines.push(`<aside>`);
                    if (previousLine.type != "ENCART")
                        finalLines.push(`    <p>`);

                    if (line.text.trim() == "") {
                        if (previousLine.type == "ENCART" && NextLine.type == "ENCART") {
                            finalLines.push(`    </p>`);
                            finalLines.push(`    <p>`);
                        }
                    }
                    else
                        finalLines.push(`        ${this._applyInlineStyles(line.text)}`);
                    if (NextLine.type != "ENCART")
                        finalLines.push(`    </p>`);
                    if (NextLine.type != "ENCART" && NextLine.type != "H3ENCART" && NextLine.type != "LIENCART")
                        finalLines.push(`</aside>`);
                    break;
                case "SAUTPAGE":
                    finalLines.push(`<div class="sautPage"></div>`);
                    break;
                default:
                    finalLines.push(line.text);
            }
        }

        // Gathering the document
        let html = "";
        for (let line of finalLines)
            html += `${line}\n`;
        return html;
    };

    
    /**
     * Apply inline syles
     * (Warning don't use on HTML as it replace '<' and '>' with their corresponding HTML entities.
     * @param text the text to process
     * @returns the processed text
     */
    static _applyInlineStyles(text: string): string {
        return text.replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace(/!\[([^\[]+)]\(([^(]+)\)/g,'<img src="$2" alt="$1"/>')
            .replace(/\[([^\[]+)]\(([^(]+)\)/g,'<a href="$2">$1</a>')
            .replace(/\*\*([^ ][^\*]*[^ ]|[^*])\*\*/gm, "<em>$1</em>")
            .replace(/\*([^ ][^\*]*[^ ]|[^*])\*/gm, "<cite>$1</cite>");
    };
};