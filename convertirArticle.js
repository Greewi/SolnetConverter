const { ODT2HTML } = require("./src/odt2html");
const { HTML2EBOOK } = require("./src/html2ebook");
const { HTML2MD } = require("./src/html2md");
const { MD2HTML } = require("./src/md2html");
const config = require('./config.json');

const usage = (error)=>{
    if(error)
        console.error(error);
    console.error("USAGE :");
    console.error("\tnode convertirArticle SOURCE DEST");
};

let parametres = process.argv.slice(2, process.argv.length);
if(parametres.length<2)
    usage("Paramètres manquants");
// HTML -> MD
else if(parametres[0].endsWith(".html") && parametres[1].endsWith(".md"))
{
    HTML2MD.convert(parametres[0], parametres[1]);
}
// MD -> HTML
else if(parametres[0].endsWith(".md") && parametres[1].endsWith(".html"))
{
    MD2HTML.convert(parametres[0], parametres[1]);
}
// ODT -> HTML
else if(parametres[0].endsWith(".odt") && parametres[1].endsWith(".html"))
{
    ODT2HTML.convert(parametres[0], parametres[1])
}
else
    usage("Operation invalide");