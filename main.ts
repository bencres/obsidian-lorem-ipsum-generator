import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";

import { generateParagraphs, generateSentences } from "./utils";

interface LoremIpsumPluginSettings {
	minWords: number;
	maxWords: number;
	minSentences: number;
	maxSentences: number;
}

const DEFAULT_SETTINGS: LoremIpsumPluginSettings = {
	minWords: 4,
	maxWords: 16,
	minSentences: 1,
	maxSentences: 5,
};

export default class LoremIpsumPlugin extends Plugin {
	settings: LoremIpsumPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: "generate-sentence",
			name: "Generate a sentence",
			editorCallback: (editor: Editor, _view: MarkdownView) => {
				const { minWords, maxWords } = this.settings;
				const text = generateSentences({
					amount: 1,
					minWords: minWords,
					maxWords: maxWords,
				});
				const cursorPos = editor.getCursor();
				editor.replaceRange(text, cursorPos);
				editor.setCursor(cursorPos.line, cursorPos.ch + text.length);
			},
		});

		this.addCommand({
			id: "generate-paragraph",
			name: "Generate a paragraph",
			editorCallback: (editor: Editor, _view: MarkdownView) => {
				const { minWords, maxWords, minSentences, maxSentences } =
					this.settings;
				const text = generateParagraphs({
					amount: 1,
					minWords: minWords,
					maxWords: maxWords,
					minSentences: minSentences,
					maxSentences: maxSentences,
				});
				const cursorPos = editor.getCursor();
				editor.replaceRange(text, cursorPos);
				editor.setCursor(cursorPos.line, cursorPos.ch + text.length);
			},
		});

		this.addCommand({
			id: "generate-custom-text",
			name: "Generate a custom amount of paragraphs",
			editorCallback: (editor: Editor, _view: MarkdownView) => {
				new ParagraphCountModal(this.app, (textAmounts) => {
					const { minWords, maxWords } = this.settings;
					const text = generateParagraphs({
						amount: textAmounts.paragraphAmount,
						minWords: minWords,
						maxWords: maxWords,
						minSentences: textAmounts.minSentences,
						maxSentences: textAmounts.maxSentences,
					});
					const cursorPos = editor.getCursor();
					editor.replaceRange(text, cursorPos);
					editor.setCursor(
						cursorPos.line,
						cursorPos.ch + text.length,
					);
				}).open();
			},
		});

		this.addSettingTab(new LoremIpsumSettingTab(this.app, this));

		this.registerDomEvent(document, "click", (evt: MouseEvent) => {
			console.log("click", evt);
		});
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData(),
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

export class LoremIpsumSettingTab extends PluginSettingTab {
	plugin: LoremIpsumPlugin;

	constructor(app: App, plugin: LoremIpsumPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		containerEl.createEl("h2", { text: "Lorem Ipsum Generator Settings" });

		new Setting(containerEl)
			.setName("Minimum words per sentence")
			.setDesc(
				"The smallest number of words a generated sentence can have.",
			)
			.addText((text) =>
				text
					.setPlaceholder("e.g. 4")
					.setValue(this.plugin.settings.minWords.toString())
					.onChange(async (value) => {
						const val = Number(value);
						if (!isNaN(val) && val > 0) {
							this.plugin.settings.minWords = val;
							await this.plugin.saveSettings();
						}
					}),
			);

		new Setting(containerEl)
			.setName("Maximum words per sentence")
			.setDesc(
				"The largest number of words a generated sentence can have.",
			)
			.addText((text) =>
				text
					.setPlaceholder("e.g. 16")
					.setValue(this.plugin.settings.maxWords.toString())
					.onChange(async (value) => {
						const val = Number(value);
						if (
							!isNaN(val) &&
							val >= this.plugin.settings.minWords
						) {
							this.plugin.settings.maxWords = val;
							await this.plugin.saveSettings();
						}
					}),
			);

		new Setting(containerEl)
			.setName("Minimum sentences per paragraph")
			.setDesc(
				"The smallest number of sentences a generated paragraph can have.",
			)
			.addText((text) =>
				text
					.setPlaceholder("e.g. 1")
					.setValue(this.plugin.settings.minSentences.toString())
					.onChange(async (value) => {
						const val = Number(value);
						if (!isNaN(val) && val > 0) {
							this.plugin.settings.minSentences = val;
							await this.plugin.saveSettings();
						}
					}),
			);

		new Setting(containerEl)
			.setName("Maximum sentences per paragraph")
			.setDesc(
				"The largest number of sentences a generated paragraph can have.",
			)
			.addText((text) =>
				text
					.setPlaceholder("e.g. 5")
					.setValue(this.plugin.settings.maxSentences.toString())
					.onChange(async (value) => {
						const val = Number(value);
						if (
							!isNaN(val) &&
							val >= this.plugin.settings.minSentences
						) {
							this.plugin.settings.maxSentences = val;
							await this.plugin.saveSettings();
						}
					}),
			);
	}
}

interface ParagraphModalValues {
	paragraphAmount: number;
}

export class ParagraphCountModal extends Modal {
	private onSubmit: (values: ParagraphModalValues) => void;

	constructor(app: App, onSubmit: (values: ParagraphModalValues) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen(): void {
		const { contentEl } = this;

		contentEl.empty();
		contentEl.createEl("h2", { text: "Generate Lorem Ipsum" });

		let paragraphAmount = 4;

		new Setting(contentEl).setName("Number of paragraphs").addText((text) =>
			text
				.setPlaceholder("e.g. 2")
				.setValue(String(paragraphAmount))
				.onChange((val) => {
					const num = Number(val);
					if (!isNaN(num) && num > 0) paragraphAmount = num;
				}),
		);

		new Setting(contentEl).addButton((btn) =>
			btn
				.setButtonText("Generate")
				.setCta()
				.onClick(() => {
					this.close();
					this.onSubmit({
						paragraphAmount,
					});
				}),
		);
	}

	onClose(): void {
		this.contentEl.empty();
	}
}
