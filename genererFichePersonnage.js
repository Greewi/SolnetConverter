const Personnage2pdf = require('./src/personnage2pdf').Personnage2pdf;

const usage = (error)=>{
    if(error)
        console.error(error);
    console.error("USAGE :");
    console.error("\tnode genererFichePersonnage JSON_PERSO JSON_FICHE PDF_DEST");
};


let parametres = process.argv.slice(2, process.argv.length);
if(parametres.length<3)
    usage("Paramètres manquants");
else
    Personnage2pdf.convert(parametres[0], parametres[1], parametres[2]);
