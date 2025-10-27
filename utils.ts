import { LoremIpsum } from "lorem-ipsum";

export function generateSentence(): string {
	const lorem = new LoremIpsum({
		sentencesPerParagraph: {
			max: 5,
			min: 1,
		},
		wordsPerSentence: {
			max: 16,
			min: 4,
		},
	});

	return lorem.generateSentences(1);
}
