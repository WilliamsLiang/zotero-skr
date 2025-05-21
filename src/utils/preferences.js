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
            this.updateStatus('❌ 请填写完整配置', '#f56c6c');
            return;
        }

        // 禁用按钮防止重复点击
        btn.disabled = true;
        this.updateStatus('⌛ 正在连接...', '#409eff');

        try {
            // 发送测试请求
            const response = await Zotero.HTTP.request(
                'POST',
                `${apiUrl}/v1/chat/completions`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [{ role: "user", content: "who are you?" }],
                        max_tokens: 1
                    }),
                    timeout: 5000
                }
            );
            Zotero.debug(response.response);
            // 处理响应
            if (response.status === 200) {
                this.updateStatus('✅ 连接正常', '#67c23a');
            } else {
                this.updateStatus(`❌ 错误代码: ${response.status}`, '#f56c6c');
            }
        } catch (err) {
            // 错误分类处理
            const msg = err instanceof Zotero.HTTP.TimeoutError ?
                '⏳ 请求超时' :
                `❌ ${err.message.substring(0, 50)}`;
            this.updateStatus(msg, '#f56c6c');
        } finally {
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
            // LLMConnectionTester.testConnection();
        });

        document.getElementById("prefs-button-for-check").addEventListener("command", async () => {
            Zotero.debug("[SKR]start checking Internet environment.......");
            Zotero.Prefs.set("extensions.zotero.skr.review.apiurl", document.getElementById('llm-api-url-input').value);
            Zotero.Prefs.set("extensions.zotero.skr.review.apikey", document.getElementById('llm-api-key-input').value);
            Zotero.Prefs.set("extensions.zotero.skr.review.model", document.getElementById('llm-api-model-input').value);
            // Zotero.debug(document.getElementById('llm-api-url-input').value);
            LLMConnectionTester.testConnection();
        });
    }
};
