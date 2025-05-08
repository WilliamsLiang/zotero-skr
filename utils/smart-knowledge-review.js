SmartKnowledgeReview = {
	id: null,
	version: null,
	rootURI: null,
	initialized: false,
	addedElementIDs: [],
	
	init({ id, version, rootURI }) {
		if (this.initialized) return;
		this.id = id;
		this.version = version;
		this.rootURI = rootURI;
		this.initialized = true;
	},
	
	log(msg) {
		Zotero.debug("Smart Knowledge Review: " + msg);
	},
	
	addToWindow(window) {
		let doc = window.document;
		
		// Add a stylesheet to the main Zotero pane
		// let link1 = doc.createElement('link');
		// link1.id = 'make-it-red-stylesheet';
		// link1.type = 'text/css';
		// link1.rel = 'stylesheet';
		// link1.href = this.rootURI + 'style.css';
		// doc.documentElement.appendChild(link1);
		// this.storeAddedElement(link1);
		
		// Use Fluent for localization
		window.MozXULElement.insertFTLIfNeeded("smart-knowledge-review.ftl");
		
		// 增加到右键菜单的范例
		let menu_review = doc.createXULElement('menuitem');
		menu_review.id = 'smart-knowledge-review-right-key';
		menu_review.setAttribute('type', 'checkbox');
		menu_review.setAttribute('data-l10n-id', 'smart-knowledge-review-right-key');
		// MozMenuItem#checked is available in Zotero 7
		menu_review.addEventListener('command', () => {
				const items = Zotero.getActiveZoteroPane().getSelectedItems();
				for (const item of items) {
					const abstract = item.getField('abstractNote');
					const title = item.getField('title');
					if (abstract) {
						Zotero.debug(abstract);
					}
				}
				// Zotero.alert("完成", "摘要已发送到后端！");
				Zotero.debug("[SKR] 展开用户的交互页面....");
				Zotero.skr.UserPage.openCardManagerTab(items);
			});
		doc.getElementById('zotero-itemmenu').appendChild(menu_review);
		this.storeAddedElement(menu_review);
		
		// 增加到顶部菜单的范例
		let menuitem = doc.createXULElement('menuitem');
		menuitem.id = 'smart-knowledge-review-menu';
		menuitem.setAttribute('type', 'checkbox');
		menuitem.setAttribute('data-l10n-id', 'smart-knowledge-review-menu-name');
		// MozMenuItem#checked is available in Zotero 7
		menuitem.addEventListener('command', () => {
			Zotero.skr.UserPage.openCardManager({});
		});
		doc.getElementById('menu_viewPopup').appendChild(menuitem);

		this.storeAddedElement(menuitem);


		
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
		// Remove all elements added to DOM
		for (let id of this.addedElementIDs) {
			doc.getElementById(id)?.remove();
		}
		doc.querySelector('[href="smart-knowledge-review.ftl"]').remove();
	},
	
	removeFromAllWindows() {
		var enumerator = Services.wm.getEnumerator("navigator:browser");
		while (enumerator.hasMoreElements()) {
			let win = enumerator.getNext();
			if (!win.ZoteroPane) continue;
			this.removeFromWindow(win);
		}
	},
	
	toggleGreen(window, enabled) {
		window.document.documentElement
			.toggleAttribute('data-green-instead', enabled);
	},
	
	async main() {
		// Global properties are included automatically in Zotero 7
		var host = new URL('https://foo.com/path').host;
		this.log(`Host is ${host}`);
		
		// Retrieve a global pref
		this.log(`Intensity is ${Zotero.Prefs.get('extensions.make-it-red.intensity', true)}`);
	},
};
