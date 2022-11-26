import * as io from "../utils/io";

export default class HTML2MD {
    
    /**
     * Convert a HTML article file to a markdown file
     * @param {string} htmlSource the html source file
     * @param {string} mdOutput the markdown destination file
     */
    static async convert(htmlSource: string, mdOutput: string): Promise<void>{
        let html = await io.readFile(htmlSource);
        let markdown = html;
        markdown = markdown.replace(/\t/g, ' ');
        markdown = markdown.replace(/ *<h1> *([^<]*) *<\/h1>.*/g, '# $1');
        markdown = markdown.replace(/ *<h2> *([^<]*) *<\/h2>.*/g, '## $1');
        markdown = markdown.replace(/ *\n *<ul> *\n/g, '');
        markdown = markdown.replace(/ *<\/ul>.*\n/g, '\n');
        markdown = markdown.replace(/ *<p> *(.*) *<\/p> */g, '$1\n');
        markdown = markdown.replace(/ *<li> *(.*) *<\/li> */g, '* $1');
        markdown = markdown.replace(/ *<h2 class="encart__titre"> *([^<]*) *<\/h2>.*/g, '### $1');
        markdown = markdown.replace(/ *<p class="encart__texte"> *(.*) *<\/p> */g, '$1\n');
        markdown = markdown.replace(/ *<li class="encart__liste"> *(.*) *<\/li> */g, '* $1');
        markdown = markdown.replace(/<em>\s*<br\/>\s*<\/em>/g, '\n');//Reliquat de style chelou
        markdown = markdown.replace(/<em>([^<]*)<\/em>/g, '**$1**');
        markdown = markdown.replace(/<cite>([^<]*)<\/cite>/g, '*$1*');

        markdown = markdown.replace(/ *<div class="table__conteneur">\n(.*?)\n<\/div> */gms, '$1\n');

        markdown = markdown.replace(/ *<(\/?table)> */g, '<$1>');
        markdown = markdown.replace(/ *<(\/?tr)> */g, '    <$1>');
        markdown = markdown.replace(/ *<(t[dh][^>]*)>\s*([^<]*)\s*<(\/t[dh])> */gm, '        <$1>$2<$3>');

        markdown = markdown.replace(/ *<blockquote>(.*?)<\/blockquote> */gms, (match, inner)=>{
            return inner.replace(/\s*(.+)\s*(<br\/>)*\s*/g, "> $1\n");
        });
        markdown = markdown.replace(/ *<div class="encart">(.*?)<\/div> */gms, (match, inner)=>{
            return inner.replace(/\n/g, '\n>> ').replace(/(\n>> )*$/, '');
        });

        markdown = markdown.replace(/<br\/>\n/g, '\n\n');
        markdown = markdown.replace(/\s*$/g, '');
        markdown = this.decodeEntities(markdown);
        await io.writeFile(markdown, mdOutput);
    }

    static decodeEntities(encodedString: string) : string {
        var translate_re = /&(nbsp|amp|quot|lt|gt|laquo|raquo|ldquo|rdquo|ndash|Agrave|agrave|Acirc|acirc|Eacute|Egrave|Ecirc|eacute|egrave|ecirc|ugrave|ucric|Ocirc|ocirc|oelig|OElig|aelig|AElig|rsquo|hellip);/g;
        var translate : {[key: string]: string} = {
            "nbsp":" ",
            "amp" : "&",
            "quot": "\"",
            "lt"  : "<",
            "gt"  : ">",
            "laquo" :"«",
            "raquo" :"»",
            "ldquo" :"«",
            "rdquo" :"»",
            "ndash" : "–",
            "Agrave" :"À",
            "agrave" :"à",
            "Acirc" :"Â",
            "acirc" :"â",
            "Eacute" :"É",
            "Egrave" :"È",
            "Ecirc" :"Ê",
            "eacute" :"é",
            "egrave" :"è",
            "ecirc" :"ê",
            "ugrave" : "ù",
            "ucric" : "û",
            "Ocirc" :"Ô",
            "ocirc" :"ô",
            "oelig" : "œ",
            "OElig" : "Œ",
            "aelig" : "æ",
            "AElig" : "Æ",
            "rsquo" : "’",
            "hellip" : "…"
        };
        return encodedString.replace(translate_re, function(match, entity) {
            return translate[entity];
        }).replace(/&#(\d+);/gi, function(match, numStr) {
            var num = parseInt(numStr, 10);
            return String.fromCharCode(num);
        });
    }
};