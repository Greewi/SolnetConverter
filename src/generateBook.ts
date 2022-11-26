import BookGenerator from "./documentGenerators/bookGenerator";
import Book from "./model/book";
import SolNetConverterConfig from "./model/config";
import Theme from "./model/theme";
import CommandHelper from "./utils/commandHelper";

const cmd = new CommandHelper(
    "node convertArticle",
    "Convert an article from a format to an other.",
    {
        SOURCE: "source file path",
        THEME: "theme file path",
        DEST: "destination file path",
    }, {}
);

const sourcePath = cmd.get("SOURCE");
const themePath = cmd.get("THEME");
const destPath = cmd.get("DEST");

(async ()=>{
    try {
        const config = await SolNetConverterConfig.loadConfig();
        const book = await Book.loadBook(sourcePath);
        const theme = await Theme.loadTheme(themePath);
        await BookGenerator.generateBook(book, theme, destPath, config);
    } catch(error) {
        console.error(error);
        cmd.usage("An error occured.");
    }
})();
