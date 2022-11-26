import SolNetConverterConfig from '../model/config';
import CLI from './CLI';

export default class CalibreCLI {
    /**
     * Convertit un fichier HTML au format MOBI
     * @param inputFile Le nom et chemin du fichier HTML à convertir
     * @param outputFile Le nom et chemin du fichier MOBI à produire
     * @param config the SolNetConverter configuration
     */
    static async convertHtmlToMobi(inputFile: string, outputFile: string, config:SolNetConverterConfig): Promise<void> {
        
        let args = [
            inputFile, outputFile,
            "--max-levels", "0",
            "--page-breaks-before" ,"//*[name()='h1'] | //*[name()='h2']",
            "--chapter", "//*[name()='h1'] | //*[name()='h2']"
        ];
        return await CLI.executeCommand(config.calibre, args);
    }

    /**
     * Convertit un fichier HTML au format EPUB
     * @param inputFile Le nom et chemin du fichier HTML à convertir
     * @param outputFile Le nom et chemin du fichier EPUB à produire
     * @param config the SolNetConverter configuration
     */
    static async convertHtmlToEpub(inputFile: string, outputFile: string, config:SolNetConverterConfig): Promise<void> {
        let args = [
            inputFile, outputFile,
            "--max-levels", "0",
            "--no-default-epub-cover",
            "--page-breaks-before", "//*[name()='h1'] | //*[name()='h2']",
            "--chapter", "//*[name()='h1'] | //*[name()='h2']"
        ];
        return await CLI.executeCommand(config.calibre, args);
    }

    /**
     * Convertit un fichier HTML au format PDF
     * @param inputFile Le nom et chemin du fichier HTML à convertir
     * @param outputFile Le nom et chemin du fichier PDF à produire
     * @param config the SolNetConverter configuration
     */
    static async convertHtmlToPdf(inputFile: string, outputFile: string, config:SolNetConverterConfig): Promise<void> {
        let args = [
            inputFile, outputFile,
            "--max-levels", "0",
            "--page-breaks-before", "//*[name()='h1'] | //*[name()='h2']",
            "--chapter", "//*[name()='h1'] | //*[name()='h2']",
            "--chapter-mark=none",
            "--margin-top=60",
            "--margin-left=40",
            "--margin-bottom=60",
            "--margin-right=40",
            "--paper-size=a5",
            "--pdf-page-numbers",
            "--base-font-size=9"
        ];
        return await CLI.executeCommand(config.calibre, args);
    }
};