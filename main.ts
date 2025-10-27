import { text } from "node:stream/consumers";
import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";

import { generateParagraphs, generateSentences } from "./utils";

interface LoremIpsumPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: LoremIpsumPluginSettings = {
	mySetting: "default",
};

export default class LoremIpsumPlugin extends Plugin {
	settings: LoremIpsumPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: "generate-sentence",
			name: "Generate a sentence",
			editorCallback: (editor: Editor, _view: MarkdownView) => {
				const text = generateSentences({ amount: 1 });
				const cursorPos = editor.getCursor();
				editor.replaceRange(text, cursorPos);
				editor.setCursor(cursorPos.line, cursorPos.ch + text.length);
			},
		});

		this.addCommand({
			id: "generate-paragraph",
			name: "Generate a paragraph",
			editorCallback: (editor: Editor, _view: MarkdownView) => {
				const text = generateParagraphs({ amount: 1 });
				const cursorPos = editor.getCursor();
				editor.replaceRange(text, cursorPos);
				editor.setCursor(cursorPos.line, cursorPos.ch + text.length);
			},
		});

		this.addCommand({
			id: "generate-custom-text",
			name: "Generate a custom amount of text",
			editorCallback: (editor: Editor, _view: MarkdownView) => {
				new ParagraphCountModal(this.app, (textAmounts) => {
					const text = generateParagraphs({
						amount: textAmounts.paragraphAmount,
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

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
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

class SampleSettingTab extends PluginSettingTab {
	plugin: LoremIpsumPlugin;

	constructor(app: App, plugin: LoremIpsumPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Setting #1")
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.mySetting)
					.onChange(async (value) => {
						this.plugin.settings.mySetting = value;
						await this.plugin.saveSettings();
					}),
			);
	}
}

interface ParagraphModalValues {
	paragraphAmount: number;
	minSentences: number;
	maxSentences: number;
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

		let paragraphAmount = 1;
		let minSentences = 1;
		let maxSentences = 5;

		new Setting(contentEl)
			.setName("Min sentences per paragraph")
			.addText((text) =>
				text
					.setPlaceholder("e.g. 1")
					.setValue(String(minSentences))
					.onChange((val) => {
						const num = Number(val);
						if (!isNaN(num) && num > 0) minSentences = num;
					}),
			);

		new Setting(contentEl)
			.setName("Max sentences per paragraph")
			.addText((text) =>
				text
					.setPlaceholder("e.g. 5")
					.setValue(String(maxSentences))
					.onChange((val) => {
						const num = Number(val);
						if (!isNaN(num) && num >= minSentences)
							maxSentences = num;
					}),
			);

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
						minSentences,
						maxSentences,
					});
				}),
		);
	}

	onClose(): void {
		this.contentEl.empty();
	}
}
