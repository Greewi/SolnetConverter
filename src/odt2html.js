const { LOfficeCLI } = require("./lofficeCLI");
const fs = require('fs');
var parser = new (require('xmldom').DOMParser)();

exports.ODT2HTML = class {

    /**
     * 
     * @param {*} odtFile 
     * @param {*} outputDir 
     * @returns {Promise}
     */
    static convert(odtFile, outputFile){
        let outdir = ".";
        let htmlFile = odtFile.replace(".odt", ".html").replace(/.*(\\|\/)([^\\\/]*)$/, "./$2");
        let tmpFile = "./tmp.html";
        return Promise.resolve()
        .then(()=>{
            return LOfficeCLI.convertOdtToHtml(odtFile, outdir);
        })
        .then(()=>{
            fs.renameSync(htmlFile, tmpFile);
            return new Promise((accept, reject)=>{
                fs.readFile(tmpFile, "utf8", function(err, html){
                    if(err)
                        reject(err);
                    else
                        accept(html);
                });
            })    
        })
        .then((html)=>{
            let dom = parser.parseFromString(html);
            let racine = dom.getElementsByTagName('body')[0];
            let rootLevel = dom.getElementsByTagName('h1').length>0 ? 1 : 2;
        
            let outputHTML = this._convertNode(dom.getElementsByTagName('body')[0], rootLevel);
            outputHTML = this._mergeSimilarTag(outputHTML);
            outputHTML = this._deleteEmptyTag(outputHTML);

            return outputHTML;
        })
        .then((html)=>{
            return new Promise((accept, reject)=>{
                fs.writeFile(outputFile, html, "utf8", (err)=>{
                    if(err)
                        reject(err);
                    else
                        accept();
                });
            })
        });
    }

    static _convertInternalNode (node, rootLevel){
        let output = "";
        for(let i=0; i<node.childNodes.length; i++)
        {
            output += this._convertNode(node.childNodes.item(i), rootLevel);
        }
        return output;
    }

    static _convertNode(node, rootLevel){
        if(node.nodeType==1)//ELEMENT_NODE
        {
            switch(node.nodeName)
            {
                case "h1":
                    return `<h1>${this._convertInternalNode(node, rootLevel)}</h1>\n`;
                case "h2":
                    if(rootLevel==1)
                        return `<h2>${this._convertInternalNode(node, rootLevel)}</h2>\n`;
                    return `<h1>${this._convertInternalNode(node, rootLevel)}</h1>\n`;
                case "h3":
                    if(rootLevel==1)
                        return `<h3>${this._convertInternalNode(node, rootLevel)}</h3>\n`;
                    return `<h2>${this._convertInternalNode(node, rootLevel)}</h2>\n`;
                case "p" :
                    if(node.hasAttribute("class"))
                    {
                        switch(node.getAttribute("class"))
                        {
                            case "corps-de-liste":
                            case "corps-de-liste-western":
                            return `<ul>\n\t<li>${this._convertInternalNode(node, rootLevel)}</li>\n</ul>\n`;

                            case "corps-de-citation":
                            case "corps-de-citation-western":
                            return `<blockquote>${this._convertInternalNode(node, rootLevel)}</blockquote>\n`;

                            case "encart---titre":
                            case "encart---titre-western":
                            return `<div class="encart">\n\t<h2 class="encart__titre">${this._convertInternalNode(node, rootLevel)}</h2>\n</div>\n`; 
                            
                            case "encart":
                            case "encart-western":
                            return `<div class="encart">\n\t<p class="encart__texte">${this._convertInternalNode(node, rootLevel)}</p>\n</div>\n`;
                            
                            case "encart---liste":
                            case "encart---liste-western":
                            return `<div class="encart">\n\t<ul>\n\t\t<li class="encart__liste">${this._convertInternalNode(node, rootLevel)}</li>\n\t</ul>\n</div>\n`;
                        }
                    }
                    return `<p>${this._convertInternalNode(node, rootLevel)}</p>\n`
                case "br" :
                    return "<br/>\n";
                case "samp" : 
                    return `<cite>${this._convertInternalNode(node, rootLevel)}</cite>`
                case "em" : 
                    return `<em>${this._convertInternalNode(node, rootLevel)}</em>`
                case "div" :
                    if(node.hasAttribute("title") && node.getAttribute("title")=="footer")
                        return "";
                    return this._convertInternalNode(node, rootLevel);
                case "table" :
                    return `<div class="table__conteneur">\n<table>\n${this._convertInternalNode(node, rootLevel)}</table>\n</div>\n`
                case "tr" :
                    return `\t<tr>\n${this._convertInternalNode(node, rootLevel)}\t</tr>\n`
                case "th" :
                    if(node.hasAttribute("colspan"))
                        return `\t\t<th colspan="${node.getAttribute("colspan")}">${this._convertInternalNode(node, rootLevel)}</th>\n`
                    else
                        return `\t\t<th>${this._convertInternalNode(node, rootLevel)}</th>\n`
                case "td" :
                    if(node.hasAttribute("colspan"))
                        return `\t\t<td colspan="${node.getAttribute("colspan")}">${this._convertInternalNode(node, rootLevel)}</td>\n`
                    else
                        return `\t\t<td>${this._convertInternalNode(node, rootLevel)}</td>\n`
                case "body" :
                case "ul" :
                case "li" :
                case "a" :
                case "i" :
                case "b" :
                case "span" :
                case "cite" :
                case "tbody" :
                case "col" :
                    return this._convertInternalNode(node, rootLevel);
                default :
                    console.log(`Ignored : ${node.nodeName} ${node.hasAttribute("class") ? node.getAttribute("class") : ""}`);
                    return "";
            }
        }
        else if(node.nodeType==3)//TEXTE_NODE
        {
            return node.nodeValue.replace(/(\n|\r| |\t)+/gi, " ");
        }
    }

    static _mergeSimilarTag(html){
        return html
            .replace(/\s*<\/em>\s*<em>/gi, "")
            .replace(/\s*<\/div>\s*<div[^>]*>/gi, "")
            .replace(/\s*<\/ul>\s*<ul[^>]*>/gi, "")
            .replace(/\s*<\/cite>\s*<cite>/gi, "");
    }

    static _deleteEmptyTag(html){
        return html
        .replace(/\s*<p>\s*<\/p>/gi, "")
        .replace(/\s*<p>\s*<br\/>\s*<\/p>/gi, "")
        .replace(/(<(td|th)(\s*colspan="[^"]*")?>)\s*<p>/gi, "$1")
        .replace(/<\/p>\s*(<\/(td|th)>)/gi, "$1");
    }
}
