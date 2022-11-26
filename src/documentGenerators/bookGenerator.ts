import * as io from '../utils/io';
import Book from '../model/book';
import Theme from '../model/theme';
import MD2Tex from '../converters/md2tex';
import MD2HTML from '../converters/md2html';
import LaTeXCLI from '../cli/latexCLI';
import CalibreCLI from '../cli/calibreCLI';
import SolNetConverterConfig from '../model/config';

export default class BookGenerator {
    static async generateBook(book: Book, theme: Theme, output: string, config:SolNetConverterConfig) {
        const workingDirectory = './tmp/';

        // Clean working directory
        if(!io.fileExists(workingDirectory))
            await io.mkdir(workingDirectory);
        else
            await io.emptyDir(workingDirectory);

        // Copy ressources files
        for(const ressource of book.getRessources())
            await io.copy(book.getRoot()+ressource, workingDirectory+ressource);
        for(const ressource of theme.getRessources())
            await io.copy(theme.getRoot()+ressource, workingDirectory+ressource);

        // Generate document file
        if(theme.getType()=="tex") {
            await this.generateTexFile(book, theme, workingDirectory);
        } else if(theme.getType()=="html") {
            await this.generateHTMLFile(book, theme, workingDirectory);
        } else {
            throw new Error(`Unsupported theme type : ${theme.getType()}`);
        }

        // Compile the final file
        if(output.endsWith(".pdf")) {
            if(theme.getType()=="tex") {
                await LaTeXCLI.generatePDF(`${workingDirectory}${book.getTitle()}.tex`, config);
                await io.copy(`${workingDirectory}${book.getTitle()}.pdf`, output);
            } else if(theme.getType()=="html") {
                await this.generateHTMLFile(book, theme, workingDirectory);
                await CalibreCLI.convertHtmlToPdf(`${workingDirectory}${book.getTitle()}.html`, output, config);
            } else {
                throw new Error(`Unsupported theme type for PDF export : ${theme.getType()}`);
            }
        } else if(output.endsWith(".epub")) {
            if(theme.getType()!="html")
                throw new Error(`Unsupported theme type for EPUB export : ${theme.getType()}`);
            await CalibreCLI.convertHtmlToEpub(`${workingDirectory}${book.getTitle()}.html`, output, config);
        } else if(output.endsWith(".mobi")) {
            if(theme.getType()!="html")
                throw new Error(`Unsupported theme type for MOBI export : ${theme.getType()}`);
            await CalibreCLI.convertHtmlToMobi(`${workingDirectory}${book.getTitle()}.html`, output, config);
        } else if(output.endsWith(".html")) {
            if(theme.getType()!="html")
                throw new Error(`Unsupported theme type for HTML export : ${theme.getType()}`);
            await io.copy(`${workingDirectory}${book.getTitle()}.html`, output);
        } else {
            throw new Error(`Unsupported output file format`);
        }
    }

    private static async generateTexFile(book: Book, theme: Theme, workingDirectory: string): Promise<void> {
        const parts: string[] = [];
        parts.push(this.setDocumentMetadata(book, book.getCover(["pdf"]), theme.getStartCode()));
        for(const section of book.getSections()) {
            const style = theme.getStyle(section.getStyle());
            parts.push(style.getStartCode());
            parts.push(MD2Tex.convert(section.getText()));
            parts.push(style.getEndCode());
        }
        parts.push(theme.getEndCode());
        await io.writeFile(''.concat(...parts), `${workingDirectory}${book.getTitle()}.tex`);
    }

    private static async generateHTMLFile(book: Book, theme: Theme, workingDirectory: string): Promise<void> {
        const parts: string[] = [];
        parts.push(this.setDocumentMetadata(book, book.getCover(["png", "jpg", "jpeg"]), theme.getStartCode()));
        for(const section of book.getSections()) {
            const style = theme.getStyle(section.getStyle());
            parts.push(style.getStartCode());
            parts.push(MD2HTML.convert(section.getText()));
            parts.push(style.getEndCode());
        }
        parts.push(theme.getEndCode());
        await io.writeFile(''.concat(...parts), `${workingDirectory}${book.getTitle()}.html`);
    }

    private static setDocumentMetadata(book: Book, cover:string, text: string): string {
        return text.replace("%title%", book.getTitle())
            .replace("%author%", book.getAuthor())
            .replace("%cover%", cover)
            .replace("%description%", book.getDescription());
    }
}