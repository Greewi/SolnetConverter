import Preprocessor from "./preprocessor";

const sectionRegexp = /^\[([^\[\]]+)\]/gm;
const referenceRegexp = />\[([^\[\]]+)\]/gm;
const elementRegexp = /\+\[([^\[\]]*)\(([A-Za-z]+) ?, ?([0-9]+)\)\]/gm;

/**
 * This preprocessor convert label reference in a gamebook to numbers and make some consistency checks.
 */
export default class GamebookPreprocessor implements Preprocessor {
	/**
	 * Execute this preprocessor on a text
	 * @param source the text source to process
	 * @returns the processed text
	 */
	process(source:string):string {
		const sections:Map<string, {number:number, found:boolean}> = new Map();
		
		// Replacing section references
		let sectionCount = 0;
		source = source.replace(sectionRegexp, (substring, ref) => {
			++sectionCount;
			sections.set(ref, {number:sectionCount, found:false});
			return `## ${sectionCount}.`;
		});

		// Replacing reference to the sections
		source = source.replace(referenceRegexp, (substring, ref) => {
			const section = sections.get(ref);
			if(section !== undefined) {
				section.found = true;
				return `${section.number}`;
			} else {
				console.warn(`[GamebookPreprocessor] Warning : missing section ${ref}`);
				return 'TODO';
			}
		});

		// Replacing element markup
		source = source.replace(elementRegexp, (substring, element, category, level) => {
			return `${element.trim()} (${category.trim()}, ${level.trim()})`;
		});

		// Checking for orphan section
		for(const ref in sections.keys) {
			const section = sections.get(ref);
			if(section!==undefined && !section.found) {
				console.warn(`[GamebookPreprocessor] Warning : orphan section ${ref}`);
			}
		}

		return source;
	}
}