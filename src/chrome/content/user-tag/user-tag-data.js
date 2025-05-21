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

function switchPage() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const pages = document.querySelectorAll('.page');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const targetPageId = button.dataset.page;
            pages.forEach(page => {
                page.classList.remove('active');
                if (page.id === targetPageId) {
                    page.classList.add('active');
                }
            });
        });
    });
};

async function updateSelect(libraryId) {
    const selectinput_tag = document.getElementById('tag-combination').querySelector('select');
    selectinput_tag.innerHTML = ''; // 清空现有选项
    tags = await Zotero.skr.sqlconnector.getTags(libraryId);
    for (const [key, value] of Object.entries(tags)) {
        const option = document.createElement('option');
        option.value = key;
        option.text = value;
        selectinput_tag.appendChild(option);
    }
}

async function addElement(tag_div_id){
    const tagaddList = document.getElementById(tag_div_id);
    const newTagCombination = document.createElement('div');
    newTagCombination.className = 'tag-combination-item mb-2 flex items-center';

    const selectinput_library = document.createElement('select');
    selectinput_library.classList.add('collection-list','w-20','border','border-gray-300','p-2','rounded-md','mr-2');
    // selectinput.setAttribute("data-l10n-id","skr-user-tag-by-description");
    libraries = await Zotero.skr.sqlconnector.getCollections();
    libraries[-1] = Zotero.skr.L10ns.getString('skr-user-tag-for-collections');
    for (const [key, value] of Object.entries(libraries)) {
        const option = document.createElement('option');
        option.value = key;
        option.text = value;
        if(key == -1) {
            option.selected = true;
        }
        selectinput_library.appendChild(option);
    }

    let libraryId = selectinput_library.options[selectinput_library.selectedIndex].value;
    const selectinput_tag = document.createElement('select');
    selectinput_tag.classList.add('tag-list','w-20','border','border-gray-300','p-2','rounded-md','mr-2');
    // selectinput.setAttribute("data-l10n-id","skr-user-tag-by-description");
    tags = await Zotero.skr.sqlconnector.getTags(libraryId);
    tags[-1] = Zotero.skr.L10ns.getString('skr-user-tag-for-tags');
    for (const [key, value] of Object.entries(tags)) {
        const option = document.createElement('option');
        option.value = key;
        option.text = value;
        if(key == -1) {
            option.selected = true;
        }
        selectinput_tag.appendChild(option);
    }

    selectinput_library.addEventListener('change',async function() {
            // 获取当前组容器
        let libraryId = this.options[this.selectedIndex].value;
        Zotero.debug("[SKR]getTags: " + libraryId);
        tags = await Zotero.skr.sqlconnector.getTags(libraryId);
        selectinput_tag.innerHTML = ''; // 清空现有选项
        tags[-1] = Zotero.skr.L10ns.getString('skr-user-tag-for-tags');
        for (const [key, value] of Object.entries(tags)) {
            const option = document.createElement('option')
            option.value = key;
            option.text = value;
            if(key == -1) {
                option.selected = true;
            }
            selectinput_tag.appendChild(option);
        }
    });

    const textinput = document.createElement('input');
    textinput.classList.add('w-[60%]','border','border-gray-300','p-2','rounded-md','mr-2');
    textinput.setAttribute("type","text");
    textinput.setAttribute("data-l10n-id","skr-user-tag-by-description");

    const deletebutton = document.createElement('button');
    deletebutton.classList.add('delete-btn','bg-red-500','text-white','py-1','px-2','rounded-md','hover:bg-red-600','transition-colors','duration-300');
    deletebutton.textContent = '-';
    deletebutton.addEventListener('click', (button) => {
        button.target.parentElement.remove();
    });

    newTagCombination.appendChild(selectinput_library);
    newTagCombination.appendChild(selectinput_tag);
    newTagCombination.appendChild(textinput);
    newTagCombination.appendChild(deletebutton);
    tagaddList.appendChild(newTagCombination);
}

function userInteraction() {
    const DeleteButtons = document.getElementsByClassName('delete-btn');
    for(let i = 0; i < DeleteButtons.length; i++) {
        DeleteButtons[i].addEventListener('click', (button) => {
            console.log(button.target.parentElement);
            button.target.parentElement.remove();
        });
    }

    const tagaddButton1 = document.getElementById('tag-add');
    tagaddButton1.addEventListener('click', () => {
        addElement("tag-combination-review");
    });

    const tagaddButton2 = document.getElementById('tag-add-retrieval');
    tagaddButton2.addEventListener('click', () => {
        addElement("tag-combination-retrieval");
    });

};

async function getDataIn(pageid) {
    var tag_dataIn = [];
    const divs = document.querySelectorAll(pageid);
    Zotero.debug("[SKR]开始获取标题摘要数据.....");
    for (const div of divs) {
        div_tags = div.querySelectorAll('div.tag-combination-item');
        for(div_tag of div_tags){
            const selectinput_library = div_tag.querySelector('select.collection-list');
            const selectinput_tag = div_tag.querySelector('select.tag-list');
            const textinput = div_tag.querySelector('input[type="text"]');
            const libraryId = selectinput_library.options[selectinput_library.selectedIndex].value;
            const tagId = selectinput_tag.options[selectinput_tag.selectedIndex].value;
            const description = textinput.value;
            let paragraph = {
                dataIn: [],
                description: description,
            }
            const itemIDs = await Zotero.skr.sqlconnector.getItembyCollectionAndTag(libraryId,tagId);
            const items = await Zotero.Items.getAsync(itemIDs);
            for (const item of items) {
                const abstract = item.getField('abstractNote');
                const title = item.getField('title');
                paragraph.dataIn.push({
                    "title":title,
                    "abstract":abstract,
                });
            }
            tag_dataIn.push(paragraph);
        }
    };
    return tag_dataIn;
};

async function updateReviewResult(tag_dataIn,demand_text,language_text,result_div_id) {
    div_result = document.getElementById(result_div_id);
    div_result.textContent = Zotero.skr.L10ns.getString('skr-excute-api-info');
    var status_code = 200;
    var review_message = [];
    var error_message = "";
    Zotero.debug("[skr] review_message3: " + JSON.stringify(tag_dataIn));
    for (const item of tag_dataIn) {
        let message = "";
        const paper_info = item['dataIn'];
        if(paper_info.length == 0){
            status_code = 500;
            error_message = Zotero.skr.L10ns.getString("skr-erro-tag-all-selected");
            break;
        }
        var description = item['description'];
        if (!description) {
            var description = Zotero.skr.prompt.getNullPaperPrompt();
        }
        description = Zotero.skr.prompt.getLocalQuestion("review_requirement") + description + "\n" + Zotero.skr.prompt.getLocalQuestion("language_requirement") + Zotero.skr.prompt.getLocalQuestion(language_text+"-language");
        try{
            result_obj = Zotero.skr.requestLLM.requestReviewStream(paper_info,description);
            tmp_status = result_obj.next();
            while(!tmp_status.finished){
                status_code = tmp_status.code;
                if(tmp_status.msg.length > 0){
                    if(status_code != 200){
                        break;
                    }else{
                        message = tmp_status.msg;
                    }
                }   
                await Zotero.skr.requestLLM.sleep(15);
                tmp_status = result_obj.next();
            }
            message = tmp_status.msg;
        }catch(err){
            Zotero.debug(err.message);
            status_code = 500;
            error_message += err.message;
        }finally{
            review_message.push(message);
            if(status_code != 200){
                break;
            }
        }
    }    
    if(!demand_text){
        demand_text = Zotero.skr.prompt.getNullMultiReviewPrompt();
    }
    demand_text = Zotero.skr.prompt.getLocalQuestion("review_requirement") + description + "\n" + Zotero.skr.prompt.getLocalQuestion("language_requirement") + Zotero.skr.prompt.getLocalQuestion(language_text+"-language");
    if(status_code == 200 && review_message.length > 0){
        try{
            result_obj = Zotero.skr.requestLLM.requestTagReviewStream(review_message,demand_text);
            tmp_status = result_obj.next();
            while(!tmp_status.finished){
                status_code = tmp_status.code;
                if(tmp_status.msg.length > 0){
                    if(status_code != 200){
                        break;
                    }else{
                        div_result.innerHTML = marked.parse(tmp_status.msg);
                    }
                }   
                await Zotero.skr.requestLLM.sleep(15);
                tmp_status = result_obj.next();
            }
            if(status_code != 200){
                div_result.textContent = Zotero.skr.L10ns.getString('skr-erro-info') + 500 + "=>"+Zotero.skr.L10ns.getString('skr-erro-api-info');
            }else{
                div_result.innerHTML = marked.parse(tmp_status.msg);
            }
        }catch(err){
            Zotero.debug(err.message);
            div_result.textContent = Zotero.skr.L10ns.getString('skr-erro-info') + 500 + "=>" + err.message;
        }
    }else{
        status_code = 500;
        div_result.textContent = Zotero.skr.L10ns.getString('skr-erro-info') + String(status_code) + "=>" + error_message + Zotero.skr.L10ns.getString('skr-erro-api-info');
    }
};

window.addEventListener("load", function() {
    Zotero.debug('[SKR] user-tag-data.js load');  
    addElement("tag-combination-review");
    addElement("tag-combination-retrieval");
    let libraryId = null;
    Zotero.skr.sqlconnector.getTags(libraryId);
    switchPage();
    userInteraction();

    const submit_by_paper = document.getElementById('review-submit-by-tag');
    submit_by_paper.addEventListener("click", async () => {
        // 获取所有选中的复选框
        submit_by_paper.disable = true;
        demand_text = document.getElementById('review-by-tag-result-demand').value;
        const language_select = document.getElementById("review-tag-language");
        language_text = language_select.options[language_select.selectedIndex].value;
        tag_dataIn = await getDataIn('div#tag-combination-review');
        updateReviewResult(tag_dataIn,demand_text,language_text,'review-by-tag-review-result');
        submit_by_paper.disable = false;
    });

    // const submit_by_retrieval = document.getElementById('retrieval-by-tag');
    // submit_by_retrieval.addEventListener("click", async () => {
    //     // 获取所有选中的复选框
    //     submit_by_retrieval.disable = true;
    //     const request_data = getDataByTags('list-container-retrieval');
    //     div_result = document.getElementById('result-retrieval-by-tag');
    //     div_result.textContent = Zotero.skr.L10ns.getString('skr-excute-api-info');
    //     const database_select = document.getElementById("databaseType");
    //     const language_select = document.getElementById("language");
    //     var database = database_select.options[database_select.selectedIndex].value;
    //     var language = language_select.options[language_select.selectedIndex].value;
    //     var demand = document.getElementById("demand-retrieval-by-tag").value;
    //     if(database == ""){
    //         database = "仅提取关键词，构建查询式在Google Scholar中检索";
    //     }
    //     if(demand == ""){
    //         demand = "请根据以上信息，生成一个检索式";
    //     }
    //     demand_all = "其他条件要求：\n数据库类型:" + database + "\n" + "检索式语言:" + language + "\n" + "检索其他要求:" + demand + "\n严格按照以上要求生成检索式";
    //     try{
    //         result_obj = Zotero.skr.requestLLM.requestRetrievalStream(request_data,demand_all);
    //         tmp_status = result_obj.next();
    //         while(!tmp_status.finished){
    //             if(tmp_status.msg.length > 0){
    //                 if(tmp_status.code != 200){
    //                     message = Zotero.skr.L10ns.getString('skr-erro-info') + String(tmp_status.code) + "=>" + tmp_status.msg;
    //                     div_result.textContent = message;
    //                     break;
    //                 }else{
    //                     message = tmp_status.msg;
    //                     div_result.innerHTML = marked.parse(message);
    //                 }
    //             }   
    //             await Zotero.skr.requestLLM.sleep(15);
    //             tmp_status = result_obj.next();
    //         }
    //         message = tmp_status.msg;
    //         div_result.innerHTML = marked.parse(message);
    //         Zotero.debug("[SKR]检索式生成完成，结果为: " + marked.parse(message));
    //     }catch(err){
    //         Zotero.debug(err.message);
    //         message = Zotero.skr.L10ns.getString('skr-erro-info')+ String(500) + "=>" + err.message;
    //         div_result.textContent = message;
    //     }finally{
    //         submit_by_retrieval.disable = false;
    //     }

    // });
    
});