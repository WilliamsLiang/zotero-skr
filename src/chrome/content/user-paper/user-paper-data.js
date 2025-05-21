// user-page-data.js
var dataIn;
var storedData = {};
let io;
let tabID = Zotero.getMainWindow().Zotero_Tabs.selectedID;
Zotero.debug('[SKR]' + tabID);
if (tabID) {
    let tab = Zotero.getMainWindow().Zotero_Tabs._getTab(tabID);
    if (tab && tab.tab && tab.tab.type === 'library' && tab.tab.id.startsWith('skr-user-paper-')) {
        dataIn = tab.tab.data ? tab.tab.data.dataIn : undefined;
        _filters = tab.tab.data ? tab.tab.data.filters : undefined;

        from = 'tab';
    }
} 

if (!dataIn) {
    io = window.arguments && window.arguments.length > 0 ? window.arguments[0] : {dataIn: []};
    dataIn = io.dataIn;
    from = 'window';
}

// 新增文本截断函数
const truncateText = (text, maxChars = 200) => {
    return text.length > maxChars ? text.substr(0, maxChars).trim() + '...' : text;
};

const addPaperinfo = (dataIn,div_id) => {
    dataIn.forEach(item => {
        const listContainer = document.getElementById(div_id);

        const listItem = document.createElement('div');
        listItem.classList.add('bg-white', 'p-4', 'rounded-md', 'shadow-md');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = true;
        checkbox.id = item.getField('key');
        // checkbox.disabled = !item.isSelectable;
        listItem.appendChild(checkbox);
        
        // 标题区块
        const titleBlock = document.createElement('div');
        titleBlock.classList.add('flex', 'items-baseline', 'gap-2');
        
        const titleLabel = document.createElement('span');
        titleLabel.setAttribute("data-l10n-id","user-page-paper-title");
        titleLabel.classList.add('text-gray-500', 'text-sm');
        
        const title = document.createElement('h2');
        title.classList.add('text-lg', 'font-bold', 'mb-2');
        title.textContent = item.getField('title');

        titleBlock.append(titleLabel, title);
        listItem.appendChild(titleBlock);

         // 摘要区块
        const summaryBlock = document.createElement('div');
        summaryBlock.classList.add('flex', 'items-baseline', 'gap-2');
        
        const summaryLabel = document.createElement('span');
        summaryLabel.setAttribute("data-l10n-id","user-page-paper-abstract");
        summaryLabel.classList.add('text-gray-500', 'text-sm');
        
        const summary = document.createElement('p');
        summary.classList.add('text-gray-600', 'truncate-text', 'flex-1');
        summary.textContent = truncateText(item.getField('abstractNote'),150);

        summaryBlock.append(summaryLabel, summary);
        listItem.appendChild(summaryBlock);

        listContainer.appendChild(listItem);
    });
};

function getDataByPapers(div_id) {
    var requestData = [];
    const div = document.querySelector("#"+div_id);
    Zotero.debug("[SKR]开始获取标题摘要数据.....");
    const checkboxes = div.querySelectorAll('input[type="checkbox"]:checked');
    for (let i = 0; i < checkboxes.length; i++) {
        const paper_id = checkboxes[i].id
        requestData.push({
            "title": storedData[paper_id]["title"],
            "abstract": storedData[paper_id]["abstract"]
        });
    }
    return requestData;
};

window.addEventListener("load", function() {
    for (const item of dataIn) {
        const paper_key = item.getField('key');
        const abstract = item.getField('abstractNote');
        const title = item.getField('title');
        storedData[paper_key] = {
            "title":title,
            "abstract":abstract,
        };
    }
    addPaperinfo(dataIn,'list-container-review');
    addPaperinfo(dataIn,'list-container-retrieval');

    let selectinput_tag = document.getElementById("databaseType");
    let language_text = Zotero.skr.prompt.getLocal();
    selectinput_tag.innerHTML = ''; // 清空现有选项
    all_database = Zotero.skr.prompt.getDataBase(language_text);
    for (const [key, value] of Object.entries(all_database)) {
        const option = document.createElement('option')
        option.value = key;
        option.text = value;
        if(key == "") {
            option.selected = true;
        }
        selectinput_tag.appendChild(option);
    }

    const selectinput_language = document.getElementById("language");
    selectinput_language.addEventListener('change',async function() {
            // 获取当前组容器
        let selectinput_tag = document.getElementById("databaseType");
        let language_text = this.options[this.selectedIndex].value;
        selectinput_tag.innerHTML = ''; // 清空现有选项
        all_database = Zotero.skr.prompt.getDataBase(language_text)
        for (const [key, value] of Object.entries(all_database)) {
            const option = document.createElement('option')
            option.value = key;
            option.text = value;
            if(key == "") {
                option.selected = true;
            }
            selectinput_tag.appendChild(option);
        }
    });


    const submit_by_review = document.getElementById('review-by-paper');
    submit_by_review.addEventListener("click", async () => {
        // 获取所有选中的复选框
        submit_by_review.disable = true;
        const request_data = getDataByPapers('list-container-review');
        div_result = document.getElementById('result-review-by-paper');
        div_result.textContent = Zotero.skr.L10ns.getString('skr-excute-api-info');
        var demand = document.getElementById('demand-review-by-paper').value;
        if (!demand) {
            demand = Zotero.skr.prompt.getNullPaperPrompt();
        }
        const language_select = document.getElementById("language-select")
        const language_text = language_select.options[language_select.selectedIndex].value
        demand = Zotero.skr.prompt.getLocalQuestion("review_requirement") + demand + "\n" + Zotero.skr.prompt.getLocalQuestion("language_requirement") + Zotero.skr.prompt.getLocalQuestion(language_text+"-language");
        try{
            result_obj = Zotero.skr.requestLLM.requestReviewStream(request_data,demand);
            tmp_status = result_obj.next();
            while(!tmp_status.finished){
                if(tmp_status.msg.length > 0){
                    if(tmp_status.code != 200){
                        message = Zotero.skr.L10ns.getString('skr-erro-info') + String(tmp_status.code) + "=>" + tmp_status.msg;
                        div_result.textContent = message;
                        break;
                    }else{
                        message = tmp_status.msg;
                        div_result.innerHTML = marked.parse(message);
                    }
                }   
                await Zotero.skr.requestLLM.sleep(15);
                tmp_status = result_obj.next();
            }
            message = tmp_status.msg;
            div_result.innerHTML = marked.parse(message);
            
        }catch(err){
            Zotero.debug(err.message);
            message = Zotero.skr.L10ns.getString('skr-erro-info')+ String(500) + "=>" + err.message;
            div_result.textContent = message;
        }finally{
            submit_by_review.disable = false;
        }

    });

    const submit_by_retrieval = document.getElementById('retrieval-by-paper');
    submit_by_retrieval.addEventListener("click", async () => {
        // 获取所有选中的复选框
        submit_by_retrieval.disable = true;
        const request_data = getDataByPapers('list-container-retrieval');
        div_result = document.getElementById('result-retrieval-by-paper');
        div_result.textContent = Zotero.skr.L10ns.getString('skr-excute-api-info');
        const database_select = document.getElementById("databaseType");
        const language_select = document.getElementById("language");
        var database = database_select.options[database_select.selectedIndex].value;
        var language = language_select.options[language_select.selectedIndex].value;
        var demand = document.getElementById("demand-retrieval-by-paper").value;
        demand_all = Zotero.skr.prompt.getRetrievalDemand(database,language,demand)
        try{
            result_obj = Zotero.skr.requestLLM.requestRetrievalStream(request_data,demand_all);
            tmp_status = result_obj.next();
            while(!tmp_status.finished){
                if(tmp_status.msg.length > 0){
                    if(tmp_status.code != 200){
                        message = Zotero.skr.L10ns.getString('skr-erro-info') + String(tmp_status.code) + "=>" + tmp_status.msg;
                        div_result.textContent = message;
                        break;
                    }else{
                        message = tmp_status.msg;
                        div_result.innerHTML = marked.parse(message);
                    }
                }   
                await Zotero.skr.requestLLM.sleep(15);
                tmp_status = result_obj.next();
            }
            message = tmp_status.msg;
            div_result.innerHTML = marked.parse(message);
            Zotero.debug("[SKR]检索式生成完成，结果为: " + marked.parse(message));
        }catch(err){
            Zotero.debug(err.message);
            message = Zotero.skr.L10ns.getString('skr-erro-info')+ String(500) + "=>" + err.message;
            div_result.textContent = message;
        }finally{
            submit_by_retrieval.disable = false;
        }

    });
    
});