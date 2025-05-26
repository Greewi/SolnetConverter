export default interface Preprocessor {
	/**
	 * Execute this preprocessor on a text
	 * @param source the text source to process
	 * @returns the processed text
	 */
	process(source:string):string
}