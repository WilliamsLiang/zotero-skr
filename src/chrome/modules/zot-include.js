(function() {
    Services.scriptloader.loadSubScript(rootURI + 'chrome/modules/zot-l10.js');
    Zotero.skr.L10ns.init();
    Zotero.debug("loadSubScript zot-l10.js");

    Services.scriptloader.loadSubScript(rootURI + 'chrome/modules/zot-llm-api.js');
    Zotero.skr.requestLLM.init();
    Zotero.debug("loadSubScript llm-api.js");

    Services.scriptloader.loadSubScript(rootURI + 'chrome/modules/zot-data-api.js');
    Zotero.skr.sqlconnector.init();
    Zotero.debug("loadSubScript zot-data-api.js");

    Services.scriptloader.loadSubScript(rootURI + 'chrome/modules/zot-prompt-list.js');
    Zotero.skr.prompt.init();
    Zotero.debug("loadSubScript zot-prompt-list.js");

})();