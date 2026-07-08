if (!Zotero.skr) Zotero.skr = {};

Zotero.skr.SmartKnowledgeReview = {
	id: null,
	version: null,
	rootURI: null,
	initialized: false,
	addedElementIDs: [],
	
	init({ id, version, rootURI  }) {
		if (this.initialized) return;
		this.id = id;
		this.version = version;
		this.rootURI = rootURI;
		this.initialized = true;
		// Use Fluent for localization
	},
	
	log(msg) {
		Zotero.debug("[SKR]: " + msg);
	},
	addToWindow(window) {
		this.removeFromWindow(window);
		var doc = window.document;
		let pluginID = "skr@zotero.org";
		
		// 增加到右键菜单的范例
		let skr_menu_review = doc.createXULElement('menuitem');
		skr_menu_review.id = 'smart-knowledge-review-right-key';
		skr_menu_review.setAttribute('type', 'checkbox');
		skr_menu_review.setAttribute('label', Zotero.skr.L10ns.getString('smart-knowledge-review-right-key'));
		// MozMenuItem#checked is available in Zotero 7
		skr_menu_review.addEventListener('command', () => {
				const items = Zotero.getActiveZoteroPane().getSelectedItems();
				Zotero.debug("[SKR] 展开用户的交互页面....");
				Zotero.skr.UserPage.openCardManagerTab(items);
			});
		doc.getElementById('zotero-itemmenu').appendChild(skr_menu_review);
		this.storeAddedElement(skr_menu_review);

		// 增加到右键菜单的范例
		let skr_menu_review_example = doc.createXULElement('menuitem');
		skr_menu_review_example.id = 'smart-knowledge-example-dislay';
		skr_menu_review_example.setAttribute('type', 'checkbox');
		skr_menu_review_example.setAttribute('label', Zotero.skr.L10ns.getString('smart-knowledge-example-dislay-right-key'));
		// MozMenuItem#checked is available in Zotero 7
		skr_menu_review_example.addEventListener('command', () => {
				const items = Zotero.getActiveZoteroPane().getSelectedItems();
				Zotero.debug("[SKR] 展开用户的交互页面....");
				Zotero.skr.UserPage.openExample(items);
			});
		doc.getElementById('zotero-itemmenu').appendChild(skr_menu_review_example);
		this.storeAddedElement(skr_menu_review_example);
		
		if (!doc.skrPopupShowingListenerAdded) {
			doc.getElementById('zotero-itemmenu').addEventListener('popupshowing', () => {
				const items = Zotero.getActiveZoteroPane().getSelectedItems();
				let elem = doc.getElementById('smart-knowledge-example-dislay');
				if (elem) {
					// Hide if not exactly 1 regular item
					elem.hidden = items.length !== 1 || !items[0].isRegularItem();
				}
			});
			doc.skrPopupShowingListenerAdded = true;
		}
		
		// 复制参考文献
		let skr_menu_copy_bib = doc.createXULElement('menuitem');
		skr_menu_copy_bib.id = 'smart-knowledge-review-copy-bib';
		skr_menu_copy_bib.setAttribute('label', Zotero.skr.L10ns.getString('smart-knowledge-review-copy-bibliography'));
		skr_menu_copy_bib.addEventListener('command', () => {
			const items = Zotero.getActiveZoteroPane().getSelectedItems();
			if (!items || items.length === 0) return;
			Zotero.skr.UserPage.openCopyBib(items);
		});
		doc.getElementById('zotero-itemmenu').appendChild(skr_menu_copy_bib);
		this.storeAddedElement(skr_menu_copy_bib);
		
		// 增加到顶部菜单的范例
		let skr_menuitem = doc.createXULElement('menuitem');
		skr_menuitem.id = 'smart-knowledge-review-menu';
		skr_menuitem.setAttribute('type', 'checkbox');
		// skr_menuitem.setAttribute('label', '智能知识顶部菜单');
		skr_menuitem.setAttribute('label', Zotero.skr.L10ns.getString('smart-knowledge-review-menu-name'));
		// MozMenuItem#checked is available in Zotero 7
		skr_menuitem.addEventListener('command', () => {
			Zotero.skr.UserTag.openCardManagerTab();
		});
		doc.getElementById('menu_viewPopup').appendChild(skr_menuitem);
		this.storeAddedElement(skr_menuitem);

		this.log(JSON.stringify(this.addedElementIDs));
		this.log(skr_menu_review);
		this.log(skr_menu_review_example);
		this.log(skr_menuitem);
		
	},
	addToAllWindows() {
		var enumerator = Services.wm.getEnumerator("navigator:browser");
		while (enumerator.hasMoreElements()) {
			let win = enumerator.getNext();
			if (!win.ZoteroPane) continue;
			this.addToWindow(win);
		}
	},
	
	storeAddedElement(elem) {
		if (!elem.id) {
			throw new Error("Element must have an id");
		}
		this.addedElementIDs.push(elem.id);
	},
	
	removeFromWindow(window) {
		var doc = window.document;
		// Use known IDs to aggressively remove all matching elements, including duplicates caused by previous bugs
		let ids = [
			'smart-knowledge-review-right-key',
			'smart-knowledge-example-dislay',
			'smart-knowledge-review-copy-bib',
			'smart-knowledge-review-menu'
		];
		for (let id of ids) {
			let elements = doc.querySelectorAll('#' + id);
			for (let elem of elements) {
				elem.remove();
			}
		}
		this.addedElementIDs.length = 0;
	},
	
	removeFromAllWindows() {
		var enumerator = Services.wm.getEnumerator("navigator:browser");
		while (enumerator.hasMoreElements()) {
			let win = enumerator.getNext();
			if (!win.ZoteroPane) continue;
			this.removeFromWindow(win);
		}
	},
	
	async main() {
		// Global properties are included automatically in Zotero 7
		var host = new URL('https://foo.com/path').host;
		this.log(`Host is ${host}`);
		
		// Retrieve a global pref
		this.log(`Intensity is ${Zotero.Prefs.get('extensions.make-it-red.intensity', true)}`);
	},
};
