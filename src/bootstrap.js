function log(msg) {
	Zotero.debug("[SKR]:" + msg);
}

function install() {
	log("Installed");
}

async function onMainWindowLoad({ window }, reason) {
	Zotero.skr.SmartKnowledgeReview.addToWindow(window);
}

async function onMainWindowUnload({ window }, reason) {
	// Zotero.skr.SmartKnowledgeReview.removeFromWindow(window);
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
	log(rootURI + 'utils/preferences.js');
	Services.scriptloader.loadSubScript(rootURI + 'utils/skr-user-paper.js');
	log("loadSubScript utils/skr-userpage.js");

	Services.scriptloader.loadSubScript(rootURI + 'utils/skr-user-tag.js');
	log("loadSubScript utils/skr-user-tag.js");

	Services.scriptloader.loadSubScript(rootURI + 'utils/smart-knowledge-review.js');
	log("utils/smart-knowledge-review.js");

	log("Loading menu item.....");
	Zotero.skr.SmartKnowledgeReview.init({ id, version, rootURI });
	Zotero.skr.SmartKnowledgeReview.addToAllWindows();
	await Zotero.skr.SmartKnowledgeReview.main();
}

function shutdown() {
	log("Shutting down");
	Zotero.skr.SmartKnowledgeReview.removeFromAllWindows();
}

function uninstall() {
	Zotero.skr = undefined;
	log("Uninstalled");
}
