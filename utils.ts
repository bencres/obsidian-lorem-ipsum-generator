import { LoremIpsum } from "lorem-ipsum";

export function generateSentences({
	amount,
	maxWords = 16,
	minWords = 4,
}: {
	amount: number;
	maxWords?: number;
	minWords?: number;
}): string {
	const lorem = new LoremIpsum({
		wordsPerSentence: {
			max: maxWords,
			min: minWords,
		},
	});

	return lorem.generateSentences(amount);
}

export function generateParagraphs({
	amount,
	maxWords = 16,
	minWords = 4,
	maxSentences = 5,
	minSentences = 1,
}: {
	amount: number;
	maxWords?: number;
	minWords?: number;
	maxSentences?: number;
	minSentences?: number;
}): string {
	const lorem = new LoremIpsum({
		sentencesPerParagraph: {
			max: maxSentences,
			min: minSentences,
		},
		wordsPerSentence: {
			max: maxWords,
			min: minWords,
		},
	});

	return lorem.generateParagraphs(amount);
}
