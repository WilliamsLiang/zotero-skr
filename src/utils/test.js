var LLMConnectionTester = {
    // 获取当前配置
    getConfig() {
      return {
        apiUrl: Zotero.Prefs.get("extensions.zotero.review.apiurl"),
        apiKey: Zotero.Prefs.get("extensions.zotero.review.apikey")
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
      const { apiUrl, apiKey } = this.getConfig();
      const btn = document.getElementById('prefs-button-check-input');

      // // 输入验证
      // if (!apiUrl || !apiKey) {
      //   this.updateStatus('❌ 请填写完整配置', '#f56c6c');
      //   return;
      // }

      // // 禁用按钮防止重复点击
      // btn.disabled = true;
      // this.updateStatus('⌛ 正在连接...', '#409eff');

      // try {
      //   // 发送测试请求
      //   const response = await Zotero.HTTP.request(
      //     'POST',
      //     `${apiUrl}/chat/completions`,
      //     {
      //       headers: {
      //         'Content-Type': 'application/json',
      //         'Authorization': `Bearer ${apiKey}`
      //       },
      //       body: JSON.stringify({
      //         model: "gpt-3.5-turbo",
      //         messages: [{ role: "user", content: "TEST" }],
      //         max_tokens: 1
      //       }),
      //       timeout: 5000
      //     }
      //   );

      //   // 处理响应
      //   if (response.status === 200) {
      //     this.updateStatus('✅ 连接正常', '#67c23a');
      //   } else {
      //     this.updateStatus(`❌ 错误代码: ${response.status}`, '#f56c6c');
      //   }
      // } catch (err) {
      //   // 错误分类处理
      //   const msg = err instanceof Zotero.HTTP.TimeoutError ? 
      //     '⏳ 请求超时' : 
      //     `❌ ${err.message.substring(0, 50)}`;
      //   this.updateStatus(msg, '#f56c6c');
      // } finally {
      //   btn.disabled = false;
      // }
    }
  };

export { LLMConnectionTester };