window.addEventListener("load", function() {
    let io = window.arguments && window.arguments.length > 0 ? window.arguments[0] : null;
    let dataIn = io ? io.dataIn : [];
    if (!dataIn || dataIn.length === 0) return;
    const l10n = (key) => Zotero.skr && Zotero.skr.L10ns ? Zotero.skr.L10ns.getString(key) : key;
    
    let json = Zotero.Prefs.get("extensions.zotero.skr.review.customBibStyles");
    let customBibs = [];
    if (json) {
        try { customBibs = JSON.parse(json); } catch(e) {}
    }
    if (customBibs.length === 0) {
        customBibs = [{ name: "APA", styleID: "http://www.zotero.org/styles/apa" }];
    }
    
    let trigger = document.getElementById("custom-select-trigger");
    let textSpan = document.getElementById("custom-select-text");
    let optionsList = document.getElementById("custom-select-options");

    trigger.addEventListener("click", () => {
        optionsList.style.display = optionsList.style.display === "none" ? "block" : "none";
    });

    // Close on outside click
    document.addEventListener("click", (e) => {
        if (!trigger.contains(e.target) && !optionsList.contains(e.target)) {
            optionsList.style.display = "none";
        }
    });

    customBibs.forEach((item, index) => {
        let li = document.createElement("li");
        li.textContent = item.name;
        li.style.padding = "8px 12px";
        li.style.cursor = "pointer";
        li.style.borderBottom = "1px solid #f3f4f6";
        li.style.color = "#374151";
        li.style.fontSize = "14px";
        
        li.addEventListener("mouseover", () => li.style.background = "#f3f4f6");
        li.addEventListener("mouseout", () => li.style.background = "white");
        
        li.addEventListener("click", () => {
            textSpan.textContent = item.name;
            optionsList.style.display = "none";
            generateBib(item.styleID);
        });
        optionsList.appendChild(li);
    });
    
    let textarea = document.getElementById("bibContent");
    
    const generateBib = (styleID) => {
        let format = { mode: 'bibliography', id: styleID };
        textarea.value = l10n("skr-copy-bib-generating");
        
        Promise.resolve(Zotero.QuickCopy.getContentFromItems(dataIn, format)).then(content => {
            let bibText = l10n("skr-copy-bib-generate-failed");
            if (content) {
                if (typeof content === "string") {
                    bibText = content;
                } else if (content.text) {
                    bibText = content.text;
                } else if (content.html) {
                    let tmp = document.createElement("DIV");
                    tmp.innerHTML = content.html;
                    bibText = tmp.textContent || tmp.innerText || "";
                } else {
                    bibText = JSON.stringify(content);
                }
            }
            textarea.value = bibText;
            textarea.select();
        }).catch(err => {
            textarea.value = l10n("skr-copy-bib-error") + ": " + err.message;
        });
    };
    
    // Initial generation
    if (customBibs.length > 0) {
        textSpan.textContent = customBibs[0].name;
        generateBib(customBibs[0].styleID);
    }

    document.getElementById("copyBtn").addEventListener("click", function() {
        textarea.select();
        document.execCommand('copy');
        let copyBtn = document.getElementById("copyBtn");
        let oldText = copyBtn.textContent;
        copyBtn.textContent = l10n("skr-copy-bib-copied");
        setTimeout(() => { copyBtn.textContent = oldText; }, 2000);
    });
});
