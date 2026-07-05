function getReviewByPaper(requestData) {
    let paper_info = "";
    for (const item of requestData) {
        const abstract = item['abstract'];
        const title = item['title'];
        paper_info += `${Zotero.skr.prompt.getLocalQuestion('title')}：${title}\n${Zotero.skr.prompt.getLocalQuestion('abstract')}：${abstract}\n`;
    }
    return paper_info;
}

function getReviewByPaperNumber(requestData) {
    let paper_info = "";
    for (const item of requestData) {
        const abstract = item['abstract'];
        const title = item['title'];
        const number = item.number ? item.number : 'None';
        paper_info += `${Zotero.skr.prompt.getLocalQuestion('number')}：${number}\n${Zotero.skr.prompt.getLocalQuestion('title')}：${title}\n${Zotero.skr.prompt.getLocalQuestion('abstract')}：${abstract}\n`;
    }
    return paper_info;
}

function getReviewByMultiReview(requestData) {
    let paper_info = "";
    for (const text of requestData) {
        paper_info += `${text}\n\n`;
    }
    return paper_info;
}

if (!Zotero.skr) Zotero.skr = {};
if (!Zotero.skr.requestLLM) Zotero.skr.requestLLM = {};

Zotero.skr.requestLLM = Object.assign(Zotero.skr.requestLLM, {
    apiUrl: null,
	apiKey: null,
	model: null,
	
	init() {
		const { apiUrl, apiKey, model, apiprovider } = this.getConfig();
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
        this.model = model;
        this.apiprovider = apiprovider;
	},
    
    getConfig() {
        return {
            apiUrl: Zotero.Prefs.get("extensions.zotero.skr.review.apiurl"),
            apiKey: Zotero.Prefs.get("extensions.zotero.skr.review.apikey"),
            model: Zotero.Prefs.get("extensions.zotero.skr.review.model"),
            apiprovider: Zotero.Prefs.get("extensions.zotero.skr.review.apiprovider") || "openai",
        };
    },
    
    // 核心测试逻辑
    async requestReview(requestData, demand) {
        let paper_info = getReviewByPaper(requestData);
        if (!demand) {
            demand = Zotero.skr.prompt.getNullPaperPrompt();
        }
        let user_prmpt = paper_info + "\n" + "综述要求:" + demand;
        Zotero.debug("[SKR]大模型开始请求....");
        try{
            // 发送模型请求
            const response = await Zotero.HTTP.request(
                'POST',
                `${this.apiUrl}/v1/chat/completions`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`
                    },
                    body: JSON.stringify({
                        model: this.model,
                        messages: [{ role: "system", content: Zotero.skr.prompt.getreviewPrompt() }, { role: "user", content: user_prmpt }]
                    })
                }
            );
            // Zotero.debug(response);
            let status_code = response.status;
            let responseData = JSON.parse(response.response);
            let text = responseData.choices[0].message.content;
            if(status_code != 200){
                Zotero.debug("[SKR]大模型请求失败，错误代码: " + status_code);
                return {code: status_code, msg: text};
            }else{
                Zotero.debug("[SKR]大模型请求成功，返回数据: " + text);
                return {code: status_code, msg: text};
            }
        }catch(err){
            return {code: 500, msg: err.message};
        }
    },
    async sleep(ms) {
        return new Promise(res => setTimeout(res, ms));
    },
    requestStream(messages, testApiUrl = this.apiUrl, testApiKey = this.apiKey, testModel = this.model, testProvider = this.apiprovider) {
        const xhr = new XMLHttpRequest();
        let url = "";
        let requestDataStr = "";
        
        if (testProvider === "gemini") {
            url = `${testApiUrl}/v1beta/models/${testModel}:streamGenerateContent?alt=sse`;
            let geminiContents = [];
            let systemInstruction = null;
            for (let msg of messages) {
                if (msg.role === "system") {
                    systemInstruction = { role: "system", parts: [{ text: msg.content }] };
                } else {
                    geminiContents.push({ role: msg.role === "user" ? "user" : "model", parts: [{ text: msg.content }] });
                }
            }
            let reqData = { contents: geminiContents };
            if (systemInstruction) reqData.systemInstruction = systemInstruction;
            requestDataStr = JSON.stringify(reqData);
        } else if (testProvider === "anthropic") {
            url = `${testApiUrl}/v1/messages`;
            let systemInstruction = "";
            let anthropicMessages = [];
            for (let msg of messages) {
                if (msg.role === "system") {
                    systemInstruction = msg.content;
                } else {
                    anthropicMessages.push(msg);
                }
            }
            let reqData = {
                model: testModel,
                max_tokens: 4096,
                messages: anthropicMessages,
                stream: true,
                thinking: { type: "disabled" }
            };
            if (systemInstruction) {
                reqData.system = systemInstruction;
            }
            requestDataStr = JSON.stringify(reqData);
        } else {
            url = `${testApiUrl}/v1/chat/completions`;
            requestDataStr = JSON.stringify({
                model: testModel,
                messages: messages,
                stream: true
            });
        }
        
        Zotero.debug("[SKR] API Request URL: " + url);
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        if (testProvider === "gemini" && !testApiKey.startsWith("Bearer")) {
            xhr.setRequestHeader('x-goog-api-key', testApiKey);
        } else if (testProvider === "anthropic") {
            xhr.setRequestHeader('x-api-key', testApiKey);
            xhr.setRequestHeader('anthropic-version', '2023-06-01');
        } else {
            xhr.setRequestHeader('Authorization', `Bearer ${testApiKey}`);
        }
        
        let buff = '';
        let unprocessed = '';
        let result_obj = {
            code: 200,
            text: '',
            finished: false,
            next: function() {
                if(this.code!= 200){
                    this.finished = true;
                    return {code: this.code, msg: this.text  , finished: true};
                }else{
                    return {code: this.code, msg: this.text , finished: this.finished};
                }  
            }
        }
        xhr.onreadystatechange = function() {
            function processChunk(chunk, isFinal = false) {
                let status_code = 200;
                let allcontent = '';
                
                unprocessed += chunk;
                let events = unprocessed.split(/\n\n/);
                
                if (!isFinal) {
                    unprocessed = events.pop(); // Keep incomplete event in buffer
                } else {
                    unprocessed = ''; // Flush everything
                }
                
                events.forEach(eventStr => {
                    if (!eventStr.trim()) return;
                    const lines = eventStr.split('\n');
                    lines.forEach(line => {
                        if (line.trim().startsWith('data:')) {
                            const jsonStr = line.replace('data:', '').trim();
                            if (jsonStr === '[DONE]') return;
                            
                            Zotero.debug("[SKR] SSE Stream JSON: " + jsonStr);
                            try {
                                const dataObj = JSON.parse(jsonStr);
                                let content = '';
                                if (dataObj.choices && dataObj.choices.length > 0 && dataObj.choices[0].delta) {
                                    content = dataObj.choices[0].delta.content || '';
                                } else if (dataObj.candidates && dataObj.candidates.length > 0 && dataObj.candidates[0].content && dataObj.candidates[0].content.parts) {
                                    content = dataObj.candidates[0].content.parts[0].text || '';
                                } else if (dataObj.delta && dataObj.delta.text) { 
                                    content = dataObj.delta.text || '';
                                } else if (dataObj.type === 'content_block_delta' && dataObj.delta && dataObj.delta.text) {
                                    content = dataObj.delta.text || '';
                                }
                                allcontent += content;
                            } catch (e) {
                                Zotero.debug("[SKR] JSON Parse Error: " + e.message + " | Str: " + jsonStr);
                                status_code = 500;
                                allcontent += "\n[Parse Error: " + e.message + "]";
                            }
                        }
                    });
                });
                return { status_code: status_code, msg: allcontent };
            }

            if (xhr.readyState === 3 || xhr.readyState === 4) { 
                result_obj.code = xhr.status;
                const chunk = xhr.responseText.substring(buff.length);
                buff += chunk;
                
                if (result_obj.code !== 200) {
                    Zotero.debug("[SKR] API请求失败，状态码: " + result_obj.code + " 响应原文: " + xhr.responseText);
                    result_obj.text = xhr.responseText || "API 请求失败";
                    result_obj.finished = true;
                    return;
                }
                
                let chunk_result = processChunk(chunk, xhr.readyState === 4);
                let prcessing_status_code = chunk_result.status_code;
                let text = chunk_result.msg;
                
                if(prcessing_status_code !== 200){
                    Zotero.debug("[SKR] 数据流解析失败，错误代码: " + prcessing_status_code);
                    result_obj.text += text;
                    result_obj.code = prcessing_status_code;
                    result_obj.finished = true;
                }else{
                    result_obj.text += text;
                }
                
                if (xhr.readyState === 4) {
                    Zotero.debug('[SKR]最终响应: ' + result_obj.text);
                    result_obj.finished = true;
                }
            }
        };
        xhr.onerror = function() {
            result_obj.code = xhr.status;
            let content = '';
            try{
                const data = JSON.parse(xhr.responseText);
                content = data.message? data.message : Zotero.skr.L10ns.getString('skr-erro-api-info');
            }catch(e){
                content = xhr.responseText? xhr.responseText : Zotero.skr.L10ns.getString('skr-erro-api-info');
            }
            result_obj.text = content;
        };
        xhr.send(requestDataStr);
        return result_obj;
    },
    requestTagReviewStream(requestData, demand) { 
        let paper_info = getReviewByMultiReview(requestData);
        let user_prmpt = paper_info + "\n\n" + demand;
        Zotero.debug("[SKR]大模型开始请求....");
        Zotero.debug("[SKR]大模型请求数据: " + Zotero.skr.prompt.getreviewTagPrompt());
        const messages = [{ role: "system", content: Zotero.skr.prompt.getreviewTagPrompt() }, { role: "user", content: user_prmpt }];
        return this.requestStream(messages);
    },
    requestReviewStream(requestData, demand) { 
        let paper_info = getReviewByPaper(requestData);
        let user_prmpt = paper_info + "\n\n" + demand;
        Zotero.debug("[SKR]大模型开始请求....");
        Zotero.debug("[SKR]大模型请求数据: " + Zotero.skr.prompt.getreviewPrompt());
        const messages = [{ role: "system", content: Zotero.skr.prompt.getreviewPrompt() }, { role: "user", content: user_prmpt }];
        return this.requestStream(messages);
    },
    requestReviewStreamByNumber(requestData, demand) { 
        let paper_info = getReviewByPaperNumber(requestData);
        let user_prmpt = paper_info + "\n\n" + demand;
        Zotero.debug("[SKR]大模型开始请求....");
        Zotero.debug("[SKR]大模型请求数据: " + Zotero.skr.prompt.getreviewPrompt());
        const messages = [{ role: "system", content: Zotero.skr.prompt.getreviewPrompt() }, { role: "user", content: user_prmpt }];
        return this.requestStream(messages);
    },
    requestRetrievalStream(requestData, demand) { 
        let paper_info = getReviewByPaper(requestData);
        let user_prmpt = paper_info + "\n\n" + demand;
        Zotero.debug("[SKR]大模型请求数据: " + Zotero.skr.prompt.getTimestampPrompt()+Zotero.skr.prompt.getRetrievalPrompt());
        Zotero.debug("[SKR]用户要求: " + demand);
        const messages = [{ role: "system", content: Zotero.skr.prompt.getTimestampPrompt()+Zotero.skr.prompt.getRetrievalPrompt() }, { role: "user", content: user_prmpt }];
        return this.requestStream(messages);
    },
    requestGeneralStream(requestData, type) { 
        let paper_info = getReviewByPaper(requestData);
        let user_prmpt = paper_info
        Zotero.debug("[SKR]大模型请求数据: " + Zotero.skr.prompt.getExtractinfoPrompt(type));
        const messages = [{ role: "system", content: Zotero.skr.prompt.getExtractinfoPrompt(type) }, { role: "user", content: user_prmpt }];
        return this.requestStream(messages);
    },
});
