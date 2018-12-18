const { LOfficeCLI } = require("./lofficeCLI");
const fs = require('fs');
var parser = new (require('xmldom').DOMParser)();

exports.ODTConverter = class {

    /**
     * 
     * @param {*} odtFile 
     * @param {*} outputDir 
     * @returns {Promise}
     */
    static convertODT(odtFile, outputFile){
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
                    if(node.hasAttribute("class") && node.getAttribute("class")=="corps-de-liste-western")
                        return `    <li>${this._convertInternalNode(node, rootLevel)}</li>\n`;
                    if(node.hasAttribute("class") && node.getAttribute("class")=="corps-de-citation-western")
                        return `<blockquote>${this._convertInternalNode(node, rootLevel)}</blockquote>\n`;                
                    return `<p>${this._convertInternalNode(node, rootLevel)}</p>\n`
                case "br" :
                    return "<br/>\n";
                case "ul" :
                    return `<ul>\n${this._convertInternalNode(node, rootLevel)}</ul>\n`;
                case "samp" : 
                    return `<cite>${this._convertInternalNode(node, rootLevel)}</cite>`
                case "em" : 
                    return `<em>${this._convertInternalNode(node, rootLevel)}</em>`
                case "div" :
                    if(node.hasAttribute("title") && node.getAttribute("title")=="footer")
                        return "";
                    return this._convertInternalNode(node, rootLevel);
                case "table" :
                    return `<table>${this._convertInternalNode(node, rootLevel)}</table>\n`
                case "tr" :
                    return `\t<tr>${this._convertInternalNode(node, rootLevel)}</tr>\n`
                case "th" :
                    return `\t\t<th>${this._convertInternalNode(node, rootLevel)}</th>\n`
                case "td" :
                    return `\t\t<td>${this._convertInternalNode(node, rootLevel)}</td>\n`
                case "body" :
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
            return node.nodeValue.replace(/(\n|\r| |\t)+/gi, " ").trim();
        }
    }

    static _mergeSimilarTag(html){
        return html
            .replace(/<\/em><em>/gi, "")
            .replace(/<\/cite><cite>/gi, "");
    }

    static _deleteEmptyTag(html){
        return html
        .replace(/<p><\/p>\n?/gi, "");
    }
}
