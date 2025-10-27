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

import { generateSentence } from "./utils";

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
			name: "Generate a single sentence",
			editorCallback: (editor: Editor, _view: MarkdownView) => {
				editor.replaceRange(generateSentence(), editor.getCursor());
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
