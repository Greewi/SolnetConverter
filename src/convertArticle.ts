import HTML2MD from "./converters/html2md";
import MD2Creole from "./converters/md2creole";
import MD2HTML from "./converters/md2html";
import MD2Tex from "./converters/md2tex";
import CommandHelper from "./utils/commandHelper";

const cmd = new CommandHelper(
    "node convertArticle",
    "Convert an article from a format to an other.",
    {
        SOURCE: "source file path",
        DEST: "destination file path",
    }, {}
);

const sourcePath = cmd.get("SOURCE");
const destPath = cmd.get("DEST");

(async ()=>{
    try {
        // HTML -> MD
        if(sourcePath.endsWith(".html") && destPath.endsWith(".md"))
        {
            await HTML2MD.convert(sourcePath, destPath);
        }
        // MD -> Creole
        else if(sourcePath.endsWith(".md") && destPath.endsWith(".txt"))
        {
            await MD2Creole.convert(sourcePath, destPath);
        }
        // MD -> HTML
        else if(sourcePath.endsWith(".md") && destPath.endsWith(".html"))
        {
            await MD2HTML.convertFile(sourcePath, destPath);
        }
        // MD -> Tex
        else if(sourcePath.endsWith(".md") && destPath.endsWith(".tex"))
        {
            await MD2Tex.convertFile(sourcePath, destPath);
        }
        else
            cmd.usage(`Invalid operation`);
} catch(error) {
    console.error(error);
    cmd.usage("An error occured.");
}
})();