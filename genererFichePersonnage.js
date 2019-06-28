const Personnage2pdf = require('./src/personnage2pdf').Personnage2pdf;

const usage = (error) => {
    if (error)
        console.error(error);
    console.error("USAGE :");
    console.error("\tnode genererFichePersonnage JSON_PERSO [IMAGE_PERSO] JSON_FICHE PDF_DEST");
};


let parametres = process.argv.slice(2, process.argv.length);
if (parametres.length < 3)
    usage("Paramètres manquants");
else if (parametres.length == 4)
    Personnage2pdf.convert(parametres[0], parametres[1], parametres[2], parametres[3]);
else
    Personnage2pdf.convert(parametres[0], null, parametres[1], parametres[2]);

