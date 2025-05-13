if (!Zotero.skr) Zotero.skr = {};
if (!Zotero.skr.UserPage) Zotero.skr.UserPage = {};

Zotero.skr.UserPage = Object.assign(Zotero.skr.UserPage, {

	// http://udn.realityripple.com/docs/Web/API/Window/open#Window_features

	openCardManager(items) {
        Zotero.debug("[skr] start load script skr-userpage.js");
		let io = {
			dataIn: items,
		}
		let win = Zotero.getMainWindow().openDialog('chrome://skr/content/user-paper/user-paper.html', 'user-papaper', 'chrome,menubar=no,toolbar=no,dialog=no,resizable,centerscreen,height=' + (Zotero.getMainWindow().screen.availHeight*0.75) + ',width=' + (Zotero.getMainWindow().screen.availWidth*0.75), io);
        win.focus();

	},

	findCardManager() {
		var wm = Services.wm;
		var e = wm.getEnumerator(null);
		let winCardManager;
		while (e.hasMoreElements()) {
		  win = e.getNext();
		  if (win.name === 'skr-userpage') {
			winCardManager = win;
			break;
		  }
		}
		return winCardManager;
	},

	openCardManagerTab(items) {
		let { id, container } = Zotero.getMainWindow().Zotero_Tabs.add({
			id: 'skr-user-paper-' + Zotero.Utilities.randomString(),
			type: 'library',
			title: Zotero.skr.L10ns.getString('skr-multi-user-paper'),
			index: Zotero.getMainWindow().Zotero_Tabs._tabs.length,
			data: {
				dataIn: items,
			},
			select: true,
			preventJumpback: true,
			onClose: () => {
				Zotero.getMainWindow().Zotero_Tabs.select('zotero-pane');
			}
		});
		
		let iframe = Zotero.getMainWindow().document.createXULElement('browser');
		iframe.setAttribute('class', 'skr-userpage');
		iframe.setAttribute('flex', '1');
		iframe.setAttribute('type', 'content');
		iframe.setAttribute('src', 'chrome://skr/content/user-paper/user-paper.html');
		container.appendChild(iframe);

		iframe.docShell.windowDraggingAllowed = true;
	},

	findCardManagerTabs() {
		let tabCardManagers = [];
		for (let index = 0; index < Zotero.getMainWindow().Zotero_Tabs._tabs.length; index++) {
			const element = Zotero.getMainWindow().Zotero_Tabs._tabs[index];
			if (element.id.startsWith('skr-user-paper-')) {
				tabCardManagers.push(element);
			}
		}
		return tabCardManagers;
	},

});