// 更新状态提示
function updateStatus(text, color = '#666') {
    const label = document.getElementById('api-requests-status');
    label.value = text;
    label.style.color = color;
}

var reviewPrompt = "请根据提供的论文标题和摘要，撰写一段结构清晰、内容紧凑的文献综述段落，旨在概述该研究主题相关领域的重要研究进展与核心观点。综述内容需要满足以下要求：\n \
重点突出：紧扣论文标题与摘要中的研究主题，围绕核心问题梳理已有文献；\n\
逻辑清晰：合理组织观点，体现研究演进脉络或不同学术视角；\n\
引文规范：凡涉及具体研究结论或观点，均需在文中适当位置标注引文标题，便于读者查阅；\n\
语言学术：表述客观准确，避免主观评价与无根据推论；\n";

function getReviewByPaper(requestData) {
    let paper_info = "";
    for (const item of requestData) {
        const abstract = item['abstract'];
        const title = item['title'];
        paper_info += `标题：${title}\n摘要：${abstract}\n`;
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
            apiUrl: Zotero.Prefs.get("extensions.zotero.review.apiurl"),
            apiKey: Zotero.Prefs.get("extensions.zotero.review.apikey"),
            model: Zotero.Prefs.get("extensions.zotero.review.model"),
        };
    },
    
    // 核心测试逻辑
    async requestReview(requestData, demand) {
        let paper_info = getReviewByPaper(requestData);
        if (!demand) {
            demand = "请生成一段话，总结这些文章";
        }
        let user_prmpt = paper_info + "\n" + "综述要求" + demand;
        Zotero.debug("[SKR]大模型开始请求....");
        try{
            // 发送模型请求
            const response = await Zotero.HTTP.request(
                'POST',
                `${this.apiUrl}/chat/completions`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`
                    },
                    body: JSON.stringify({
                        model: this.model,
                        messages: [{ role: "system", content: reviewPrompt }, { role: "user", content: user_prmpt }]
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
});
