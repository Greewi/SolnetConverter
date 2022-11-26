import SolNetConverterConfig from '../model/config';
import CLI from './CLI';

export default class InkscapeCLI {
    /**
     * Generate a PDF file from a SVG
     * @param inputSvg The input svg file
     * @param ouputPdf the ouput pdf file
     * @param config the SolNetConverter configuration
     */
    static async generatePDF(inputSvg: string, ouputPdf: string, config:SolNetConverterConfig): Promise<void> {
        let args = ["-z", "-f", inputSvg, "-A", ouputPdf, "--export-area-page"];
        return await CLI.executeCommand(config.inkscape, args);
    };

    /**
     * Generate a PNG image file from a SVG
     * @param inputSvg The input svg file
     * @param ouputPng the ouput png image file
     * @param config the SolNetConverter configuration
     */
    static async generePNG(inputSvg: string, ouputPng: string, config:SolNetConverterConfig): Promise<void> {
        let args = ["-z", "-f", inputSvg, "-e", ouputPng, "-d", "300", "--export-area-page"];
        return await CLI.executeCommand(config.inkscape, args);
    };
};