var SmartKnowledgeReview;

function log(msg) {
	Zotero.debug("Smart Knowledge Review : " + msg);
}

function install() {
	log("Installed");
}

async function startup({ id, version, rootURI }) {
	log("Starting");

	// Services.scriptloader.loadSubScript(rootURI + '/chrome/modules/zot-include.js', { id, version, rootURI });
	Services.scriptloader.loadSubScript(rootURI + '/chrome/modules/zot-include.js', { id, version, rootURI });
	Zotero.ZotCard.Logger.log("loadSubScript zot-include.js");

	//将本地目录文件地址映射成网络地址，避免本地文件访问冲突
	var aomStartup = Cc["@mozilla.org/addons/addon-manager-startup;1"].getService(Ci.amIAddonManagerStartup);
    var manifestURI = Services.io.newURI(rootURI + "manifest.json");
    chromeHandle = aomStartup.registerChrome(manifestURI, [
        ["content", "skr", rootURI + "chrome/content/"]
    ]);
	
	
	Zotero.PreferencePanes.register({
		pluginID: 'SKR@zotero.org',
		src: rootURI + 'chrome/content/prefernces/preferences.xhtml',
		scripts: [rootURI + 'utils/preferences.js']
	});
	Zotero.debug(rootURI + 'utils/preferences.js');
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
	
	Services.scriptloader.loadSubScript(rootURI + 'utils/skr-userpage.js');
	Zotero.debug("loadSubScript utils/skr-userpage.js");

	Services.scriptloader.loadSubScript(rootURI + 'utils/smart-knowledge-review.js');
	Zotero.debug("utils/smart-knowledge-review.js");


	SmartKnowledgeReview.init({ id, version, rootURI });
	SmartKnowledgeReview.addToAllWindows();
	await SmartKnowledgeReview.main();
}

function shutdown() {
	log("Shutting down");
	SmartKnowledgeReview.removeFromAllWindows();
	SmartKnowledgeReview = undefined;
}

function uninstall() {
	log("Uninstalled");
	// Zotero.Prefs.set("extensions.zotero.review.apiurl", "http://182.92.188.222:8050/v1/chat/completions");
	// Zotero.Prefs.set("extensions.zotero.review.apikey", "qwen2.5-72b");
	// Zotero.Prefs.set("extensions.zotero.review.model", "Qwen2.5-72B-Instruct-GPTQ-Int4");
	// SmartKnowledgeReview.removeFromAllWindows();
	// SmartKnowledgeReview = undefined;
}
