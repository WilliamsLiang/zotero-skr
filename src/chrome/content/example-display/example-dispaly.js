// user-page-data.js
var dataIn;
let tabID = Zotero.getMainWindow().Zotero_Tabs.selectedID;
Zotero.debug('[SKR]' + tabID);
if (tabID) {
    let tab = Zotero.getMainWindow().Zotero_Tabs._getTab(tabID);
    if (tab && tab.tab && tab.tab.type === 'library' && tab.tab.id.startsWith('smart-knowledge-example-dislay')) {
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

async function load_text(request_data,div_id,type_name){
    div_result = document.getElementById(div_id);
    div_result.textContent = Zotero.skr.L10ns.getString('skr-excute-api-info');
    let finalMarkdown = "";
    try{
        result_obj = Zotero.skr.requestLLM.requestGeneralStream(request_data,type_name);
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
                    finalMarkdown = message;
                }
            }   
            await Zotero.skr.requestLLM.sleep(15);
            tmp_status = result_obj.next();
        }
        message = tmp_status.msg;
        div_result.innerHTML = marked.parse(message);
        finalMarkdown = message;
        
    }catch(err){
        Zotero.debug(err.message);
        message = Zotero.skr.L10ns.getString('skr-erro-info')+ String(500) + "=>" + err.message;
        div_result.textContent = message;
        finalMarkdown = message;
    }
    return finalMarkdown;
}

window.addEventListener("load", async function() {
    const request_data = []
    for (const item of dataIn) {
        const abstract = item.getField('abstractNote');
        const title = item.getField('title');
        request_data.push({
            "title":title,
            "abstract":abstract,
        });
    }
    let md1 = await load_text(request_data,'content1',"question");
    let md2 = await load_text(request_data,'content2',"method");
    let md3 = await load_text(request_data,'content3',"design");
    
    try {
        if (dataIn && dataIn.length === 1) {
            let fullMd = "## 研究问题\n\n" + md1 + "\n\n## 研究方法\n\n" + md2 + "\n\n## 研究设计\n\n" + md3;
            let parentItem = Zotero.Items.get(dataIn[0].id) || dataIn[0];
            if (parentItem && parentItem.isRegularItem()) {
                let note = new Zotero.Item('note');
                note.libraryID = parentItem.libraryID;
                note.parentItemID = parentItem.id;
                
                // Render Markdown to HTML for Zotero Note
                let renderedHtml = marked.parse(fullMd);
                
                note.setNote('<h1>SKR辅助阅读</h1><div>' + renderedHtml + '</div>');
                await note.saveTx();
                Zotero.debug("[SKR] Automatically created child note for " + parentItem.id);
            }
        }
    } catch (e) {
        Zotero.debug("[SKR] Error creating child note: " + e);
    }
});1