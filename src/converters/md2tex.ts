import * as io from '../utils/io';

export default class MD2Tex {
    /**
     * Convert a markdown article to a LaTeX snippet
     * @param mdSource the markdown source file
     * @param texOutput the LaTeX destination file
     * @returns {Promise}
     */
    static async convertFile(mdSource: string, texOutput: string): Promise<void> {
        let markdown = await io.readFile(mdSource);
        let html = this.convert(markdown);
        await io.writeFile(html, texOutput);
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
                    finalLines.push(`\\chapter*{${this._applyInlineStyles(line.text)}}\n\\addcontentsline{toc}{chapter}{${this._applyInlineStyles(line.text)}}\n\\markboth{${this._applyInlineStyles(line.text)}}{}`);
                    break;
                case "H2":
                    finalLines.push(`\\section*{${this._applyInlineStyles(line.text)}}\n\\addcontentsline{toc}{section}{${this._applyInlineStyles(line.text)}}\n\\markright{${this._applyInlineStyles(line.text)}}`);
                    break;
                case "H3":
                    finalLines.push(`\\subsection*{${this._applyInlineStyles(line.text)}}\n\\addcontentsline{toc}{subsection}{${this._applyInlineStyles(line.text)}}\n\\markright{${this._applyInlineStyles(line.text)}}`);
                    break;
                case "LI":
                    if (previousLine.type != "LI")
                        finalLines.push(`\\begin{itemize}`);
                    finalLines.push(`\\item ${this._applyInlineStyles(line.text)}`);
                    if (nextLine.type != "LI")
                        finalLines.push(`\\end{itemize}`);
                    break;
                case "TEXT":
                    finalLines.push(`${this._applyInlineStyles(line.text)}`);
                    if (nextLine.type != "TEXT")
                        finalLines.push(``);
                    break;
                case "CITATION":
                    if (previousLine.type != "CITATION")
                        finalLines.push(`\\epigraph{`);
                    if (line.text.trim() == "") {
                        finalLines.push(`}{`);
                    }
                    else
                        finalLines.push(`${this._applyInlineStyles(line.text)}`);
                    if (nextLine.type != "CITATION")
                        finalLines.push(`}`);
                    break;
                case "HEADERENCART":
                    finalLines.push(`\\begin{tcolorbox}[title={\\textbf{${this._applyInlineStyles(line.text)}}}]`);
                    if (nextLine.type != "ENCART" && nextLine.type != "HEADERENCART" && nextLine.type != "LIENCART")
                        finalLines.push(`\\end{tcolorbox}`);
                    break;
                case "LIENCART":
                    if (previousLine.type != "ENCART" && previousLine.type != "HEADERENCART" && previousLine.type != "LIENCART")
                        finalLines.push(`\\begin{tcolorbox}[]`);
                    if (previousLine.type != "LIENCART")
                        finalLines.push(`\\begin{asideitemize}`);
                    finalLines.push(`\\item ${this._applyInlineStyles(line.text)}`);
                    if (nextLine.type != "LIENCART")
                        finalLines.push(`\\end{asideitemize}`);
                    if (nextLine.type != "ENCART" && nextLine.type != "HEADERENCART" && nextLine.type != "LIENCART")
                        finalLines.push(`\\end{tcolorbox}`);
                    break;
                case "ENCART":
                    if (previousLine.type != "ENCART" && previousLine.type != "HEADERENCART" && previousLine.type != "LIENCART")
                    finalLines.push(`\\begin{tcolorbox}[]`);
                    if( line.text.trim()=="" && (previousLine.type == "ENCART" || previousLine.type == "LIENCART"))
                        finalLines.push("\n \n");
                    else
                        finalLines.push(`${this._applyInlineStyles(line.text)}`);
                    if (nextLine.type != "ENCART" && nextLine.type != "HEADERENCART" && nextLine.type != "LIENCART")
                        finalLines.push(`\\end{tcolorbox}`);
                    break;
                case "CENTRE":
                    finalLines.push(`{\n\\centering\n${line.text=="***"? line.text : this._applyInlineStyles(line.text)}\\par\n}`);
                case "SAUTPAGE":
                    finalLines.push(`\\pagebreak`);
                    break;
                case "VIDE":
                    break;
                default:
                    finalLines.push(this._applyInlineStyles(line.text));
            }
        }

        // Gathering document
        let tex = finalLines.join("\n");
        return tex;
    };

    /**
     * Apply inline styles
     * @param text the text to convert
     * @returns the converted text
     */
    static _applyInlineStyles(text: string): string {
        return text
            .replace(/<!--[^>]*-->/g, "")
            .replace(/`([^`]+)`|\\/g,(match, code)=>{
                if(match=="\\")
                    return "{\\textbackslash}";
                code = code.replace(/([\[\]{}@])/g, "$1");
                return `\\lstinline{${code}}`;
            })
            .replace(/!\[([^\[]+)]\(([^()]+)\)/g,'\\includegraphics{$2}')
            .replace(/\[([^\[]+)]\(([^()]+)\)/g,'\\href{$2}{$1}')
            .replace(/\*\*([^ ][^\*]*[^ ]|[^*])\*\*/g, "\\textbf{$1}")
            .replace(/\*([^ ][^\*]*[^ ]|[^*])\*/g, "\\textit{$1}")
            .replace(/([%])/g, "\\$1");
    };
};