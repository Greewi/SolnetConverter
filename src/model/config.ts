import * as io from '../utils/io';

export default class SolNetConverterConfig {
    calibre: string = "";
    inkscape: string = "";
    latex: string = "";

    static async loadConfig(): Promise<SolNetConverterConfig> {
        return JSON.parse(await io.readFile("config.json"));
    }
};