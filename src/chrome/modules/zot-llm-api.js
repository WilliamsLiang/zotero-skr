// 更新状态提示
function updateStatus(text, color = '#666') {
    const label = document.getElementById('api-requests-status');
    label.value = text;
    label.style.color = color;
}

function getReviewByPaper(requestData) {
    let paper_info = "";
    for (const item of requestData) {
        const abstract = item['abstract'];
        const title = item['title'];
        paper_info += `${Zotero.skr.prompt.getLocalQuestion('title')}：${title}\n${Zotero.skr.prompt.getLocalQuestion('abstract')}：${abstract}\n`;
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
		const { apiUrl, apiKey, model } = this.getConfig();
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
        this.model = model;
	},
    
    getConfig() {
        return {
            apiUrl: Zotero.Prefs.get("extensions.zotero.skr.review.apiurl"),
            apiKey: Zotero.Prefs.get("extensions.zotero.skr.review.apikey"),
            model: Zotero.Prefs.get("extensions.zotero.skr.review.model"),
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
            status_code = response.status;
            responseData = JSON.parse(response.response);
            text = responseData.choices[0].message.content;
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
    requestStream(data) {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${this.apiUrl}/v1/chat/completions`, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Authorization', `Bearer ${this.apiKey}`);

        let buff = '';
        let status_code = 200;

        let result_obj = {
            code: 200,
            text: '',
            finished: false,
            next: function() {
                if(this.code!= 200){
                    this.finished = true;
                    return {code: 500, msg: Zotero.skr.L10ns.getString('skr-erro-api-info') , finished: true};
                }else{
                    return {code: this.code, msg: this.text , finished: this.finished};
                }  
            }
        }
        xhr.onreadystatechange = function() {
            function processChunk(chunk) {
                const lines = chunk.split(/(\n{2})/); // 按SSE协议分割[6](@ref)
                let allcontent = '';
                lines.forEach(line => {
                    if (line.trim().startsWith('data:')) {
                        try {
                            const jsonStr = line.replace('data:', '').trim();
                            if (jsonStr === '[DONE]') return; // 流式结束标记
                            const data = JSON.parse(jsonStr);
                            const content = data.choices[0].delta?.content || '';
                            allcontent += content;
                        } catch (e) {
                            status_code = 500;
                            allcontent = e.message;
                        }
                    }
                });
                return { status_code: status_code, msg: allcontent };
            }
            if (xhr.readyState === 3) { // 正在接收数据块
                const chunk = xhr.responseText.substring(buff.length);
                chunk_result = processChunk(chunk);
                buff +=chunk
                // Zotero.debug('[SKR]:'+chunk_result.msg);
                result_obj.code = chunk_result.status_code;
                text = chunk_result.msg;
                if(result_obj.code != 200){
                    Zotero.debug("[SKR]大模型请求失败，错误代码: " + result_obj.code);
                    result_obj.text = Zotero.skr.L10ns.getString('skr-erro-api-info');
                    result_obj.finished = true;
                }else{
                    result_obj.text += text
                }
                // 实时处理分块数据（如逐字显示）
            } else if (xhr.readyState === 4) { // 请求完成
                const chunk = xhr.responseText.substring(buff.length);
                chunk_result = processChunk(chunk);
                buff +=chunk
                // Zotero.debug('[SKR]:'+chunk_result.msg);
                result_obj.code = chunk_result.status_code;
                text = chunk_result.msg;
                if(result_obj.code != 200){
                    Zotero.debug("[SKR]大模型请求失败，错误代码: " + result_obj.code);
                    result_obj.text = Zotero.skr.L10ns.getString('skr-erro-api-info');
                    result_obj.finished = true;
                }else{
                    result_obj.text += text
                }
                Zotero.debug('最终响应:', result_obj.text);
                result_obj.finished = true;
            }
        };
        xhr.onerror = function() {
            result_obj.code = xhr.status;
            result_obj.text = Zotero.skr.L10ns.getString('skr-erro-api-info');
        };
        xhr.send(data);
        return result_obj;
    },
    requestTagReviewStream(requestData, demand) { 
        let paper_info = getReviewByMultiReview(requestData);
        let user_prmpt = paper_info + "\n\n" + demand;
        Zotero.debug("[SKR]大模型开始请求....");
        Zotero.debug("[SKR]大模型请求数据: " + Zotero.skr.prompt.getreviewTagPrompt());
        const data = JSON.stringify({
            model: this.model,
            messages: [{ role: "system", content: Zotero.skr.prompt.getreviewTagPrompt() }, { role: "user", content: user_prmpt }],
            stream: true,
        });
        return this.requestStream(data);
    },
    requestReviewStream(requestData, demand) { 
        let paper_info = getReviewByPaper(requestData);
        let user_prmpt = paper_info + "\n\n" + demand;
        Zotero.debug("[SKR]大模型开始请求....");
        Zotero.debug("[SKR]大模型请求数据: " + Zotero.skr.prompt.getreviewPrompt());
        const data = JSON.stringify({
            model: this.model,
            messages: [{ role: "system", content: Zotero.skr.prompt.getreviewPrompt() }, { role: "user", content: user_prmpt }],
            stream: true,
        });
        return this.requestStream(data);
    },
    requestRetrievalStream(requestData, demand) { 
        let paper_info = getReviewByPaper(requestData);
        let user_prmpt = paper_info + "\n\n" + demand;
        Zotero.debug("[SKR]大模型请求数据: " + Zotero.skr.prompt.getTimestampPrompt()+Zotero.skr.prompt.getRetrievalPrompt());
        Zotero.debug("[SKR]用户要求: " + demand);
        const data = JSON.stringify({
            model: this.model,
            messages: [{ role: "system", content: Zotero.skr.prompt.getTimestampPrompt()+Zotero.skr.prompt.getRetrievalPrompt() }, { role: "user", content: user_prmpt }],
            stream: true,
        });
        return this.requestStream(data);
    },
    requestGeneralStream(requestData, type) { 
        let paper_info = getReviewByPaper(requestData);
        let user_prmpt = paper_info
        Zotero.debug("[SKR]大模型请求数据: " + Zotero.skr.prompt.getExtractinfoPrompt(type));
        const data = JSON.stringify({
            model: this.model,
            messages: [{ role: "system", content: Zotero.skr.prompt.getExtractinfoPrompt(type) }, { role: "user", content: user_prmpt }],
            stream: true,
        });
        return this.requestStream(data);
    },
});
