var LLMConnectionTester = {
    // 获取当前配置
    getConfig() {
        return {
            apiUrl: Zotero.Prefs.get("extensions.zotero.skr.review.apiurl"),
            apiKey: Zotero.Prefs.get("extensions.zotero.skr.review.apikey"),
            model: Zotero.Prefs.get("extensions.zotero.skr.review.model"),
            apiprovider: Zotero.Prefs.get("extensions.zotero.skr.review.apiprovider") || "openai",
        };
    },
    // 更新状态提示
    updateStatus(text, color = '#666') {
        const label = document.getElementById('api-requests-status');
        if (label) {
            label.textContent = text;
            label.style.color = color;
        }
    },
    // 核心测试逻辑
    async testConnection() {
        const { apiUrl, apiKey, model, apiprovider } = this.getConfig();
        const btn = document.getElementById('prefs-button-for-check');
        Zotero.debug(apiUrl);
        // 输入验证
        if (!apiUrl || !apiKey) {
            this.updateStatus('❌ ' + Zotero.skr.L10ns.getString('skr-api-write-info'), '#f56c6c');
            return;
        }

        // 禁用按钮防止重复点击
        btn.disabled = true;
        this.updateStatus('⌛ ' + Zotero.skr.L10ns.getString('skr-api-loading-info'), '#409eff');

        const messages = [{ role: "user", content: "who are you?" }];

        try {
            // 发送测试请求
            let result_obj = Zotero.skr.requestLLM.requestStream(messages, apiUrl, apiKey, model, apiprovider);
            let tmp_status = result_obj.next();
            while(!tmp_status.finished){
                if(tmp_status.msg.length > 0){
                    if(tmp_status.code != 200){
                        this.updateStatus(`❌ ` + Zotero.skr.L10ns.getString('skr-api-error-info')+` ${tmp_status.code} : ` + `${tmp_status.msg}`, '#f56c6c');
                        break;
                    }else{
                        this.updateStatus('✅ ' + Zotero.skr.L10ns.getString('skr-api-connect-info'), '#67c23a');
                    }
                }   
                await Zotero.skr.requestLLM.sleep(15);
                tmp_status = result_obj.next();
            }
            Zotero.debug("[SKR]大模型请求状态: " + JSON.stringify(tmp_status));
            if(tmp_status.msg.length > 0){
                if(tmp_status.code != 200){
                    this.updateStatus(`❌ ` + Zotero.skr.L10ns.getString('skr-api-error-info')+` ${tmp_status.code} : ` + `${tmp_status.msg}`, '#f56c6c');
                }else{
                    this.updateStatus('✅ ' + Zotero.skr.L10ns.getString('skr-api-connect-info'), '#67c23a');
                }
            }   
        } catch (err) {
            // 错误分类处理
            const msg = '⏳ ' + Zotero.skr.L10ns.getString('skr-api-timeout-info');
            this.updateStatus(msg, '#f56c6c');
        } finally {
            // 错误分类处理
            btn.disabled = false;
        }
    }
};

window.SKR_Preferences = {
    init: function () {
        Zotero.debug("YES!");
        const url_input = document.getElementById("llm-api-url-input");
        const provider_input = document.getElementById("llm-api-provider-input");
        const text_label = document.getElementById("final-url");

        // Populate Bibliography Styles
        const stylePopup = document.getElementById("skr-bib-style-popup");
        let stylesMap = {};
        if (stylePopup && Zotero.Styles) {
            let styles = Zotero.Styles.getVisible();
            let defaultBibPopup = document.getElementById("skr-analysis-default-bib-popup");
            let defaultBibList = document.getElementById("skr-analysis-default-bib");
            if (defaultBibPopup) {
                while (defaultBibPopup.firstChild) {
                    defaultBibPopup.removeChild(defaultBibPopup.firstChild);
                }
            }
            
            for (let style of styles) {
                stylesMap[style.styleID] = style.title;
                let item = document.createXULElement("menuitem");
                item.setAttribute("value", style.styleID);
                item.setAttribute("label", style.title);
                stylePopup.appendChild(item);
                
                if (defaultBibPopup) {
                    let defaultItem = document.createXULElement("menuitem");
                    defaultItem.setAttribute("value", style.styleID);
                    defaultItem.setAttribute("label", style.title);
                    defaultBibPopup.appendChild(defaultItem);
                }
            }
            // Fix: ensure the menulist selects the first item initially if it's empty
            let styleMenuList = document.getElementById("skr-bib-new-style");
            if (styleMenuList && styles.length > 0) {
                // wait for population to reflect
                setTimeout(() => { styleMenuList.selectedIndex = 0; }, 100);
            }
            if (defaultBibList && defaultBibPopup && defaultBibPopup.childNodes.length > 0) {
                let savedStyle = Zotero.Prefs.get("extensions.zotero.skr.review.defaultBibStyle");
                let apaStyle = "http://www.zotero.org/styles/apa";
                let targetIndex = 0;
                let foundSavedStyle = false;
                for (let i = 0; i < defaultBibPopup.childNodes.length; i++) {
                    let styleID = defaultBibPopup.childNodes[i].getAttribute("value");
                    if (savedStyle && styleID === savedStyle) {
                        targetIndex = i;
                        foundSavedStyle = true;
                        break;
                    }
                    if (styleID === apaStyle) {
                        targetIndex = i;
                    }
                }
                setTimeout(() => { defaultBibList.selectedIndex = targetIndex; }, 100);
                if (!savedStyle || !foundSavedStyle) {
                    Zotero.Prefs.set("extensions.zotero.skr.review.defaultBibStyle", defaultBibPopup.childNodes[targetIndex].getAttribute("value"));
                }
            }
        }
        
        // Custom Bibliography Management
        const listContainer = document.getElementById("skr-bib-custom-list");
        const getCustomBibs = () => {
            let json = Zotero.Prefs.get("extensions.zotero.skr.review.customBibStyles");
            if (json) {
                try { 
                    let arr = JSON.parse(json); 
                    if (arr && arr.length > 0) return arr;
                } catch(e) {}
            }
            let defaultName = Zotero.locale.startsWith('zh') ? "英文" : "APA";
            return [{ name: defaultName, styleID: "http://www.zotero.org/styles/apa" }];
        };
        const setCustomBibs = (arr) => {
            Zotero.Prefs.set("extensions.zotero.skr.review.customBibStyles", JSON.stringify(arr));
        };
        const renderCustomBibs = () => {
            if (!listContainer) return;
            // Clear existing children
            while (listContainer.firstChild) {
                listContainer.removeChild(listContainer.firstChild);
            }
            
            let arr = getCustomBibs();
            arr.forEach((item, index) => {
                let hbox = document.createXULElement("hbox");
                hbox.setAttribute("style", "display: flex; align-items: center; gap: 10px; margin-bottom: 5px;");
                
                let nameLabel = document.createXULElement("label");
                nameLabel.setAttribute("value", item.name);
                nameLabel.setAttribute("style", "font-weight: bold; width: 100px;");
                
                let styleLabel = document.createXULElement("label");
                styleLabel.setAttribute("value", stylesMap[item.styleID] || item.styleID);
                styleLabel.setAttribute("style", "flex: 1; opacity: 0.8; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;");
                styleLabel.setAttribute("crop", "end");
                
                let delBtn = document.createXULElement("button");
                delBtn.setAttribute("label", "X");
                delBtn.setAttribute("style", "color: red; min-width: 30px; flex-shrink: 0;");
                delBtn.addEventListener("click", () => {
                    arr.splice(index, 1);
                    setCustomBibs(arr);
                    renderCustomBibs();
                });
                
                hbox.appendChild(nameLabel);
                hbox.appendChild(styleLabel);
                hbox.appendChild(delBtn);
                listContainer.appendChild(hbox);
                
            });
            
        };
        
        renderCustomBibs();

        const defaultBibList = document.getElementById("skr-analysis-default-bib");
        if (defaultBibList) {
            defaultBibList.addEventListener("command", () => {
                if (defaultBibList.value) {
                    Zotero.Prefs.set("extensions.zotero.skr.review.defaultBibStyle", defaultBibList.value);
                }
            });
        }
        
        const addBtn = document.getElementById("skr-bib-add-btn");
        if (addBtn) {
            addBtn.addEventListener("click", () => {
                let nameInput = document.getElementById("skr-bib-new-name").value.trim();
                let styleInput = document.getElementById("skr-bib-new-style").value;
                if (!nameInput || !styleInput) return;
                
                let arr = getCustomBibs();
                arr.push({ name: nameInput, styleID: styleInput });
                setCustomBibs(arr);
                renderCustomBibs();
                
                document.getElementById("skr-bib-new-name").value = "";
            });
        }

        const updateExportDirLabel = () => {
            let label = document.getElementById("skr-analysis-export-dir-label");
            if (label) {
                let dir = Zotero.Prefs.get("extensions.zotero.skr.review.exportDir");
                if (!dir) {
                    try {
                        let dirService = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties);
                        let homeDir = dirService.get("Home", Components.interfaces.nsIFile);
                        homeDir.append(".zotero-skr");
                        dir = homeDir.path + " (" + Zotero.skr.L10ns.getString('prefs-skr-analysis-export-placeholder') + ")";
                    } catch(e) {
                        dir = Zotero.skr.L10ns.getString('prefs-skr-analysis-export-placeholder');
                    }
                }
                label.setAttribute("value", dir);
            }
        };
        updateExportDirLabel();

        const notesCollectionInput = document.getElementById("skr-analysis-notes-collection-name");
        if (notesCollectionInput) {
            let collectionName = Zotero.Prefs.get("extensions.zotero.skr.review.notesCollectionName") || "";
            notesCollectionInput.value = collectionName;
            notesCollectionInput.addEventListener("input", () => {
                Zotero.Prefs.set("extensions.zotero.skr.review.notesCollectionName", notesCollectionInput.value.trim());
            });
        }

        const exportDirBtn = document.getElementById("skr-analysis-export-dir-btn");
        if (exportDirBtn) {
            exportDirBtn.addEventListener("click", () => {
                try {
                    const nsIFilePicker = Components.interfaces.nsIFilePicker;
                    let fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
                    
                    let parentWin = null;
                    if (window.browsingContext) {
                        parentWin = window.browsingContext;
                    } else if (typeof Zotero !== 'undefined' && Zotero.getMainWindow) {
                        parentWin = Zotero.getMainWindow();
                    } else {
                        parentWin = window;
                    }
                    
                    fp.init(parentWin, "Select Export Directory", nsIFilePicker.modeGetFolder);
                    
                    if (fp.open.length > 0) {
                        fp.open((result) => {
                            if (result === nsIFilePicker.returnOK) {
                                Zotero.Prefs.set("extensions.zotero.skr.review.exportDir", fp.file.path);
                                updateExportDirLabel();
                            }
                        });
                    } else {
                        fp.open().then((result) => {
                            if (result === nsIFilePicker.returnOK) {
                                Zotero.Prefs.set("extensions.zotero.skr.review.exportDir", fp.file.path);
                                updateExportDirLabel();
                            }
                        });
                    }
                } catch (e) {
                    Zotero.debug("[SKR] Error opening folder picker: " + e);
                    // Fallback to manual entry if file picker fails due to sandbox
                    let currentPath = Zotero.Prefs.get("extensions.zotero.skr.review.exportDir") || "";
                    let newPath = prompt("Error launching native folder picker.\n\nPlease manually paste the absolute folder path below:", currentPath);
                    if (newPath !== null && newPath.trim() !== "") {
                        Zotero.Prefs.set("extensions.zotero.skr.review.exportDir", newPath.trim());
                        updateExportDirLabel();
                    }
                }
            });
        }

        const updateFinalUrl = (forceUrl, forceProvider) => {
            let url_val = document.getElementById("llm-api-url-input").value;
            if (typeof forceUrl === 'string') url_val = forceUrl;
            
            const url = url_val ? url_val.trim() : "";
            
            let provider = document.getElementById("llm-api-provider-input").value;
            if (typeof forceProvider === 'string') provider = forceProvider;
            if (!provider) provider = "openai";

            if (provider === "gemini") {
                const model = Zotero.Prefs.get("extensions.zotero.skr.review.model") || "gemini-1.5-pro";
                text_label.textContent = url ? `${url}/v1beta/models/${model}:streamGenerateContent?alt=sse` : "";
            } else if (provider === "anthropic") {
                text_label.textContent = url ? `${url}/v1/messages` : "";
            } else {
                text_label.textContent = url ? `${url}/v1/chat/completions` : "";
            }
        };

        const url = Zotero.Prefs.get("extensions.zotero.skr.review.apiurl");
        const provider = Zotero.Prefs.get("extensions.zotero.skr.review.apiprovider") || "openai";
        if (provider_input) provider_input.value = provider;
        
        // Pass the explicit preferences on init because XUL preference bindings 
        // might not have populated the DOM values synchronously yet.
        updateFinalUrl(url, provider);

        url_input.addEventListener("input", () => updateFinalUrl());
        if (provider_input) {
            provider_input.addEventListener("command", (event) => {
                let selectedVal = event.target.value || provider_input.value;
                Zotero.Prefs.set("extensions.zotero.skr.review.apiprovider", selectedVal);
                
                let currentUrl = url_input.value;
                if (selectedVal === "gemini" && (currentUrl === "https://api.openai.com" || currentUrl === "https://api.anthropic.com")) {
                    url_input.value = "https://generativelanguage.googleapis.com";
                    Zotero.Prefs.set("extensions.zotero.skr.review.apiurl", url_input.value);
                } else if (selectedVal === "openai" && (currentUrl === "https://generativelanguage.googleapis.com" || currentUrl === "https://api.anthropic.com")) {
                    url_input.value = "https://api.openai.com";
                    Zotero.Prefs.set("extensions.zotero.skr.review.apiurl", url_input.value);
                } else if (selectedVal === "anthropic" && (currentUrl === "https://api.openai.com" || currentUrl === "https://generativelanguage.googleapis.com")) {
                    url_input.value = "https://api.anthropic.com";
                    Zotero.Prefs.set("extensions.zotero.skr.review.apiurl", url_input.value);
                }
                updateFinalUrl();
            });
        }
        document.getElementById("prefs-button-for-reset").addEventListener("click", async () => {
            Zotero.debug("[SKR]start reseting information.......");
            Zotero.Prefs.set("extensions.zotero.skr.review.apiurl", "http://0.0.0.0:8000/v1");
            Zotero.Prefs.set("extensions.zotero.skr.review.apikey", "qwen2.5-72b");
            Zotero.Prefs.set("extensions.zotero.skr.review.model", "Qwen3-32B");
            // Zotero.debug(document.getElementById('llm-api-url-input').value);
            document.getElementById('llm-api-url-input').value = Zotero.Prefs.get("extensions.zotero.skr.review.apiurl");
            document.getElementById('llm-api-key-input').value = Zotero.Prefs.get("extensions.zotero.skr.review.apikey");
            document.getElementById('llm-api-model-input').value = Zotero.Prefs.get("extensions.zotero.skr.review.model");
            // LLMConnectionTester.testConnection();
            Zotero.skr.requestLLM.init();
        });

        document.getElementById("prefs-button-for-check").addEventListener("click", async () => {
            Zotero.debug("[SKR]start checking Internet environment.......");
            Zotero.Prefs.set("extensions.zotero.skr.review.apiurl", document.getElementById('llm-api-url-input').value);
            Zotero.Prefs.set("extensions.zotero.skr.review.apikey", document.getElementById('llm-api-key-input').value);
            Zotero.Prefs.set("extensions.zotero.skr.review.model", document.getElementById('llm-api-model-input').value);
            let providerInput = document.getElementById('llm-api-provider-input');
            if (providerInput) {
                let pVal = providerInput.value;
                if (!pVal && providerInput.selectedItem) {
                    pVal = providerInput.selectedItem.value;
                }
                if (pVal) {
                    Zotero.Prefs.set("extensions.zotero.skr.review.apiprovider", pVal);
                }
            }
            // Zotero.debug(document.getElementById('llm-api-url-input').value);
            LLMConnectionTester.testConnection();
            Zotero.skr.requestLLM.init();
        });
    }
};
