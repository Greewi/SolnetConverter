import GamebookPreprocessor from "./gamebookPreprocessor";
import HeadingDownPreprocessor from "./headingDownPreprocessor";
import Preprocessor from "./preprocessor";

export default class PreprocessorFactory {
	/**
	 * Get a preprocessor
	 * @param id the preprocessor id
	 * @returns the corresponding preprocessor ou null if not found
	 */
	static getPreprocessor(id:string): Preprocessor|null {
		switch(id) {
			case "gamebook":
				return new GamebookPreprocessor();
			case "leveldown":
			case "hdown":
			case "headingdown":
				return new HeadingDownPreprocessor();
			default:
				return null;
		}
	}

	/**
	 * Process a text with a preprocessor
	 * @param preprocessorId the preprocessor id
	 * @param sourceText the text to process
	 * @returns the processed text (same as the source text if no preprocessor has been found)
	 */
	static process(preprocessorId:string, sourceText:string) : string {
		const preprocessor = this.getPreprocessor(preprocessorId);
		if(preprocessor==null) {
			console.warn(`[PreprocessorFactory] preprcessor ${preprocessorId} not found`);
			return sourceText;
		}
		return preprocessor.process(sourceText);
	}
}