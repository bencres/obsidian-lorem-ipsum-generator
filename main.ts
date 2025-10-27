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
			id: "generate-paragraph-custom-amount",
			name: "Generate a custom amount of paragraphs",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				new ParagraphCountModal(this.app, (amount) => {
					const text = generateParagraphs({ amount });
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

class ParagraphCountModal extends Modal {
	private onSubmit: (amount: number) => void;

	constructor(app: App, onSubmit: (amount: number) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h2", { text: "How many paragraphs?" });

		let amount = 1;
		new Setting(contentEl)
			.setName("Paragraph count")
			.addText((text) =>
				text
					.setValue(String(amount))
					.onChange((val) => (amount = Number(val))),
			);

		new Setting(contentEl).addButton((btn) =>
			btn
				.setButtonText("Generate")
				.setCta()
				.onClick(() => {
					this.close();
					this.onSubmit(amount);
				}),
		);
	}
}
