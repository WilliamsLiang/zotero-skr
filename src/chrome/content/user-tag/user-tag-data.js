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

const addPaperinfo = (dataIn) => {
    dataIn.forEach(item => {
        const listContainer = document.getElementById('list-container');

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
        titleLabel.textContent = '标题：';
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

window.addEventListener("load", function() {
    Zotero.debug('[SKR]'+JSON.stringify(dataIn));  
    for (const item of dataIn) {
        const paper_key = item.getField('key');
        const abstract = item.getField('abstractNote');
        const title = item.getField('title');
        storedData[paper_key] = {
            "title":title,
            "abstract":abstract,
        };
    }
    Zotero.debug('[SKR]dataIn: ' + JSON.stringify(storedData));
    addPaperinfo(dataIn);

    const submit_by_paper = document.getElementById('review-by-paper');
    submit_by_paper.addEventListener("click", async () => {
        // 获取所有选中的复选框
        submit_by_paper.disable = true;
        const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
        const demand = document.getElementById('review-by-paper-demand').value;
        const requestData = [];
        for (let i = 0; i < checkboxes.length; i++) {
            const paper_id = checkboxes[i].id
            Zotero.debug(paper_id);
            requestData.push({
                "title": storedData[paper_id]["title"],
                "abstract": storedData[paper_id]["abstract"]
            });
        }
        div_result = document.getElementById('review-by-paper-result');
        div_result.textContent = "正在请求中，请稍等...";
        
        try{
            result = await Zotero.skr.requestLLM.requestReview(requestData,demand);
            Zotero.debug("[SKR]结果:" + JSON.stringify(result));
            if(result.code != 200){
                message = "错误代码：" + String(result.code) + "=>" + result.msg;
                div_result.textContent = message;
            }else{
                message = result.msg;
                div_result.textContent = message;
            }
        }catch(err){
            Zotero.debug(err.message);
            message = "错误代码：500" + "=>" + err.message;
            div_result.textContent = message;
        }finally{
            submit_by_paper.disable = false;
        }
    });
    
});