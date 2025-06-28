var LLMConnectionTester = {
    // 获取当前配置
    getConfig() {
        return {
            apiUrl: Zotero.Prefs.get("extensions.zotero.skr.review.apiurl"),
            apiKey: Zotero.Prefs.get("extensions.zotero.skr.review.apikey"),
            model: Zotero.Prefs.get("extensions.zotero.skr.review.model"),
        };
    },
    // 更新状态提示
    updateStatus(text, color = '#666') {
        const label = document.getElementById('api-requests-status');
        label.value = text;
        label.style.color = color;
    },
    // 核心测试逻辑
    async testConnection() {
        const { apiUrl, apiKey, model } = this.getConfig();
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

        const data = JSON.stringify({
            model: model,
            messages: [{ role: "user", content: "who are you?" }],
            stream: true,
            enable_thinking: false,
        });

        try {
            // 发送测试请求
            result_obj = Zotero.skr.requestLLM.requestStream(data,apiUrl,apiKey);
            tmp_status = result_obj.next();
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

SKR_Preferences = {
    init: function () {
        Zotero.debug("YES!");
        const url_input = document.getElementById("llm-api-url-input");
        const text_label = document.getElementById("final-url");
        const url = Zotero.Prefs.get("extensions.zotero.skr.review.apiurl");
        text_label.textContent = url ? `${url}/v1/chat/completions` : "";

        url_input.addEventListener("input", (event) => {
            const text_label = document.getElementById("final-url");
            const url = event.target.value.trim();
            text_label.textContent = url ? `${url}/v1/chat/completions` : "";
        });


        document.getElementById("prefs-button-for-reset").addEventListener("command", async () => {
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

        document.getElementById("prefs-button-for-check").addEventListener("command", async () => {
            Zotero.debug("[SKR]start checking Internet environment.......");
            Zotero.Prefs.set("extensions.zotero.skr.review.apiurl", document.getElementById('llm-api-url-input').value);
            Zotero.Prefs.set("extensions.zotero.skr.review.apikey", document.getElementById('llm-api-key-input').value);
            Zotero.Prefs.set("extensions.zotero.skr.review.model", document.getElementById('llm-api-model-input').value);
            // Zotero.debug(document.getElementById('llm-api-url-input').value);
            LLMConnectionTester.testConnection();
            Zotero.skr.requestLLM.init();
        });
    }
};
