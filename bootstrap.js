var MakeItRed;

function log(msg) {
	Zotero.debug("Make It Red: " + msg);
}

function install() {
	log("Installed");
}

async function startup({ id, version, rootURI }) {
	log("Starting");
	
	Zotero.PreferencePanes.register({
		pluginID: 'SKR@zotero.org',
		src: rootURI + 'preferences.xhtml',
		scripts: [rootURI + 'preferences.js']
	});
	// Zotero.Prefs.set("extensions.zotero.review.apiurl", "http://182.92.188.222:8050/v1/chat/completions");
	// Zotero.Prefs.set("extensions.zotero.review.apikey", "qwen2.5-72b");
	// Zotero.Prefs.set("extensions.zotero.review.model", "Qwen2.5-72B-Instruct-GPTQ-Int4");

	// 注册右键菜单项
	// Zotero.Reader.registerEventListener("Smart-Knowledge-Review-Right", {
	// 	label: "请求综述内容",
	// 	command: async () => {
	// 	const items = Zotero.getActiveZoteroPane().getSelectedItems();
	// 	for (const item of items) {
	// 		const abstract = item.getField('abstractNote');
	// 		if (abstract) {
	// 			Zotero.debug(abstract);
	// 		}
	// 	}
	// 	Zotero.alert("完成", "摘要已发送到后端！");
	// 	},
	// 	// 仅在有选中文献时显示菜单
	// 	condition: () => Zotero.getActiveZoteroPane().getSelectedItems().length > 0
	// });
	
	Services.scriptloader.loadSubScript(rootURI + 'make-it-red.js');
	MakeItRed.init({ id, version, rootURI });
	MakeItRed.addToAllWindows();
	await MakeItRed.main();
}

function shutdown() {
	log("Shutting down");
	MakeItRed.removeFromAllWindows();
	MakeItRed = undefined;
}

function uninstall() {
	log("Uninstalled");
	// Zotero.Prefs.set("extensions.zotero.review.apiurl", "http://182.92.188.222:8050/v1/chat/completions");
	// Zotero.Prefs.set("extensions.zotero.review.apikey", "qwen2.5-72b");
	// Zotero.Prefs.set("extensions.zotero.review.model", "Qwen2.5-72B-Instruct-GPTQ-Int4");
	MakeItRed.removeFromWindow();
	MakeItRed = undefined;
}
