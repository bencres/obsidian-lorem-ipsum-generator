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
	addNewline = false,
	prependText = "",
}: {
	amount: number;
	maxWords?: number;
	minWords?: number;
	maxSentences?: number;
	minSentences?: number;
	addNewline?: boolean;
	prependText?: string;
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

	const paragraphs = Array.from({ length: amount }, (_, i) => {
		const text = lorem.generateParagraphs(1);
		if (prependText === "num") {
			return `${i + 1}. ${text}`;
		}
		return prependText ? `${prependText}${text}` : text;
	});

	return addNewline ? paragraphs.join("\n\n") : paragraphs.join("\n");
}
