import SolNetConverterConfig from '../model/config';
import CLI from './CLI';

export default class LaTeXCLI {
    /**
     * Generate a PDF file from a latex file
     * @param inputFile the latex input file to convert to PDF (PDF file will have the same name with juste it's extension changed)
     * @param config the SolNetConverter configuration
     */
    static async generatePDF(inputFile: string, config:SolNetConverterConfig) : Promise<void> {
        const root = process.cwd();
        const workingDirectory = inputFile.replace(/[^\\\/]*$/, "");
        process.chdir(workingDirectory);
        let args = [inputFile.replace(workingDirectory, "")];
        await CLI.executeCommand(config.latex, args);
        await CLI.executeCommand(config.latex, args); //Twice to have the TOC
        process.chdir(root);
    }
};