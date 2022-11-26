import CalibreCLI from "./calibreCLI";
import fs from 'fs';

exports.HTML2EBOOK = class {

    /**
     * Assemble les fichiers html d'un livre et l'exporte sous les format MOBI, EPUB et PDF.
     * @param {Object.<string,string[]>} book La structure du livre
     * @param {string} htmlHeader le HTML contenant le header (début) du fichier html final (tout ce qui se trouve avant la balise body)
     * @param {string} htmlFooter le HTML contenant la fin du fichier html final (la fermeture de la balsie body et ce qui se trouve après)
     * @param {string} mobiOutput le nom du fichier mobi à sauvegarder
     * @param {string} epubOutput le nom du fichier epub à sauvegarder 
     * @param {string} pdfOutput le nom du fichier pdf à sauvegarder 
     */
    static convert(book, htmlHeader, htmlFooter, mobiOutput, epubOutput, pdfOutput){
        let promise = this.getHTML("", htmlHeader);
        for(let idSection in book){
            if(book[idSection].length == 0) // Section titre
            {
                promise = promise.then((html)=>{
                    return this.getHTML(html, `outputHTML/${idSection}.html`, true);
                });
            }
            else // Section normale
            {
                // Introduction de la section
                promise = promise.then((html)=>{
                    return this.getHTML(html, `outputHTML/${idSection}.html`);
                });
    
                // Articles de la section
                for(let idArticle of book[idSection]){
                    promise = promise.then((html)=>{
                        return this.getHTML(html, `outputHTML/${idArticle}.html`, true);
                    });
                }
            }
        }

        promise = promise.then((html)=>{
            return this.getHTML(html, htmlFooter);
        })
        .then((html)=>{
            return this.writeHTML(html, `outputHTML/ebook.html`);
        })
        .then(()=>{
            console.log("Generation de " + epubOutput);
            return CalibreCLI.convertHtmlToEpub(`outputHTML/ebook.html`, epubOutput);
        })
        .then(()=>{
            console.log("Generation de " + mobiOutput);
            return CalibreCLI.convertHtmlToMobi(`outputHTML/ebook.html`, mobiOutput);
        })
        .then(()=>{
            console.log("Generation de " + pdfOutput);
            return CalibreCLI.convertHtmlToPdf(`outputHTML/ebook.html`, pdfOutput);
        });

        return promise;
    }

    /**
     * @param {string} html Le HTML déjà construit
     * @param {string} source la source du HTML à ajouter
     * @param {boolean} [convertToLevel2] si vrai : les titres seront déclé d'un niveau (h1->h2, et h2->h3)
     * @returns {Promise} une promise qui résoud le HTML concaténé
     */
    static getHTML(html, source, convertToLevel2){
        return new Promise((accept, reject)=>{
            fs.readFile(source, "utf8", (err, htmlSource)=>{
                if(err)
                    reject(err);
                else{
                    if(convertToLevel2)
                        accept(html+this.convertToLevel2(htmlSource));
                    else
                        accept(html+htmlSource);
                }
            });
        });
    }

    /**
     * Ecrit un fichier html
     * @param {*} html 
     * @param {*} dest 
     */
    static writeHTML(html, dest){
        return new Promise((accept, reject)=>{
            fs.writeFile(dest, html, "utf8", (err)=>{
                if(err)
                    reject(err);
                else
                    accept();
            });
        })
    };

    /**
     * @param {string} html 
     */
    static convertToLevel2(html){
        return html.replace(/<h2/g, "<h3").replace(/<\/h2>/g, "</h3>").replace(/<h1/g, "<h2").replace(/<\/h1>/g, "</h2>");
    }
};
