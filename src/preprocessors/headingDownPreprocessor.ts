import Preprocessor from "./preprocessor";

export default class HeadingDownPreprocessor implements Preprocessor {
	process(source:string): string {
		return source.replace(/^#/gm, "##")
	}
}