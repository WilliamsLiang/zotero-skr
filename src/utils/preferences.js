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
                        this.updateStatus(`❌ ` + Zotero.skr.L10ns.getString('skr-api-erro-info')+` ${tmp_status.code} : ` + `${tmp_status.msg}`, '#f56c6c');
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
                    this.updateStatus(`❌ ` + Zotero.skr.L10ns.getString('skr-api-erro-info')+` ${tmp_status.code} : ` + `${tmp_status.msg}`, '#f56c6c');
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
        
        const updateFinalUrl = () => {
            const url_val = document.getElementById("llm-api-url-input").value;
            const url = url_val ? url_val.trim() : "";
            const provider = document.getElementById("llm-api-provider-input").value || "openai";
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
        updateFinalUrl();

        url_input.addEventListener("input", updateFinalUrl);
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
