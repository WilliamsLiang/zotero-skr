if (!Zotero.skr) Zotero.skr = {};
if (!Zotero.skr.L10ns) Zotero.skr.L10ns = {};

Zotero.skr.L10ns = Object.assign(Zotero.skr.L10ns, {
    _l10n: new Localization(["smart-knowledge-review.ftl"], true),
    
    init() {
        Zotero.debug('Zotero.skr.L10ns inited.');
    },
    
    getString(name, params) {
        if (params) {
            return this._l10n.formatValueSync(name, params);
        }
    
        return this._l10n.formatValueSync(name);
    },
    
    getStringFtl(ftl, name, params) {
        let l10n = new Localization([ftl], true);
        if (params) {
            return this.l10n.formatValueSync(name, params);
        }
    
        return this.l10n.formatValueSync(name);
    },
  });
