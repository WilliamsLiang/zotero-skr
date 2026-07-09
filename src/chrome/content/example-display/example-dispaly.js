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

function showAutoSaveNoteLocation(saveInfo) {
    let container = document.getElementById('auto-save-note-location');
    let textNode = document.getElementById('auto-save-note-location-text');
    if (!container || !textNode || !saveInfo) return;

    let message;
    let isError = saveInfo.type === 'notSaved';
    if (saveInfo.type === 'child') {
        message = Zotero.skr.L10ns.getString('skr-example-display-note-save-child', {
            title: saveInfo.parentTitle || ''
        });
    } else if (saveInfo.type === 'collection') {
        message = Zotero.skr.L10ns.getString('skr-example-display-note-save-collection', {
            collection: saveInfo.collectionName || ''
        });
    } else if (saveInfo.type === 'notSaved') {
        message = Zotero.skr.L10ns.getString('skr-example-display-note-not-saved', {
            location: saveInfo.location || ''
        });
    } else {
        message = Zotero.skr.L10ns.getString('skr-example-display-note-save-error');
    }

    textNode.textContent = message;
    container.classList.remove('border-blue-200', 'bg-blue-50', 'text-blue-900', 'border-red-200', 'bg-red-50', 'text-red-900');
    container.classList.add(
        isError ? 'border-red-200' : 'border-blue-200',
        isError ? 'bg-red-50' : 'bg-blue-50',
        isError ? 'text-red-900' : 'text-blue-900'
    );
    container.classList.remove('hidden');
}

function getNotesCollectionName() {
    let customName = "";
    try {
        customName = Zotero.Prefs.get("extensions.zotero.skr.review.notesCollectionName") || "";
    } catch (e) {}
    return customName.trim() || Zotero.skr.L10ns.getString('skr-notes-collection-name');
}

function getPlannedNoteLocation(items) {
    if (items && items.length === 1) {
        let parentTitle = items[0].getField ? items[0].getField('title') : items[0].title;
        return Zotero.skr.L10ns.getString('skr-example-display-note-save-child', {
            title: parentTitle || ''
        });
    }
    return Zotero.skr.L10ns.getString('skr-example-display-note-save-collection', {
        collection: getNotesCollectionName()
    });
}

async function load_text(request_data,div_id,type_name){
    div_result = document.getElementById(div_id);
    div_result.textContent = Zotero.skr.L10ns.getString('skr-excute-api-info');
    let finalMarkdown = "";
    let ok = true;
    try{
        result_obj = Zotero.skr.requestLLM.requestGeneralStream(request_data,type_name);
        tmp_status = result_obj.next();
        while(!tmp_status.finished){
            if(tmp_status.msg.length > 0){
                if(tmp_status.code != 200){
                    message = Zotero.skr.L10ns.getString('skr-erro-info') + String(tmp_status.code) + "=>" + tmp_status.msg;
                    div_result.textContent = message;
                    finalMarkdown = message;
                    ok = false;
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
        if (ok) {
            message = tmp_status.msg;
            if (tmp_status.code != 200) {
                message = Zotero.skr.L10ns.getString('skr-erro-info') + String(tmp_status.code) + "=>" + tmp_status.msg;
                div_result.textContent = message;
                ok = false;
            } else {
                div_result.innerHTML = marked.parse(message);
            }
            finalMarkdown = message;
        }
        
    }catch(err){
        Zotero.debug(err.message);
        message = Zotero.skr.L10ns.getString('skr-erro-info')+ String(500) + "=>" + err.message;
        div_result.textContent = message;
        finalMarkdown = message;
        ok = false;
    }
    return {
        markdown: finalMarkdown,
        ok
    };
}

// Add save functionality function in global scope
window.saveStandaloneNote = async function(contentMd, items) {
    try {
        let note = new Zotero.Item('note');
        let libID = items[0] ? items[0].libraryID : Zotero.Libraries.userLibraryID;
        note.libraryID = libID;
        let renderedHtml = marked.parse(contentMd);
        
        if (items && items.length === 1) {
            // Single document: save as child note
            note.parentItemID = items[0].id;
            let noteTitle = 'skr辅助分析结果';
            note.setNote(`<h1>${noteTitle}</h1><div>` + renderedHtml + '</div>');
            await note.saveTx();
            Zotero.debug("[SKR] Automatically created child note for single document.");
            let parentTitle = items[0].getField ? items[0].getField('title') : items[0].title;
            return {
                type: 'child',
                parentTitle: parentTitle || '',
                noteID: note.id
            };
        } else {
            // Multi documents: save as standalone note in specific collection
            let d = new Date();
            let dateStr = d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0');
            let timeStr = String(d.getHours()).padStart(2, '0') + String(d.getMinutes()).padStart(2, '0') + String(d.getSeconds()).padStart(2, '0');
            let noteTitle = dateStr + "_" + timeStr + ' skr辅助分析';
            note.setNote(`<h1>${noteTitle}</h1><div>` + renderedHtml + '</div>');
            
            let collName = getNotesCollectionName();
            let collections = Zotero.Collections.getByLibrary(libID);
            let noteColl = collections.find(c => c.name === collName);
            if (!noteColl) {
                noteColl = new Zotero.Collection();
                noteColl.libraryID = libID;
                noteColl.name = collName;
                await noteColl.saveTx();
            }
            note.setCollections([noteColl.id]);
            await note.saveTx();
            Zotero.debug(`[SKR] Automatically created standalone note in '${collName}' collection.`);
            return {
                type: 'collection',
                collectionName: collName,
                collectionID: noteColl.id,
                noteID: note.id
            };
        }
    } catch(e) {
        Zotero.debug("[SKR] Error creating note: " + e);
        return {
            type: 'error',
            error: e && e.message ? e.message : String(e)
        };
    }
}

window.exportToMarkdown = async function() {
    Zotero.debug("[SKR-EXPORT] Export button clicked");
    let md = "";
    if (window.generatedMdContent) {
        md = window.generatedMdContent;
        Zotero.debug("[SKR-EXPORT] Using generatedMdContent. Length: " + md.length);
    } else {
        md += "## " + (document.getElementById('btn1').innerText || "Question") + "\n" + document.getElementById('content1').innerText + "\n\n";
        md += "## " + (document.getElementById('btn2').innerText || "Method") + "\n" + document.getElementById('content2').innerText + "\n\n";
        md += "## " + (document.getElementById('btn3').innerText || "Design") + "\n" + document.getElementById('content3').innerText + "\n";
        Zotero.debug("[SKR-EXPORT] Generated MD from UI. Length: " + md.length);
    }
    
    let d = new Date();
    let dateStr = d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0');
    let timeStr = String(d.getHours()).padStart(2, '0') + String(d.getMinutes()).padStart(2, '0') + String(d.getSeconds()).padStart(2, '0');
    let filename = dateStr + "_" + timeStr + " skr辅助分析.md";

    try {
        Zotero.debug("[SKR-EXPORT] Attempting to save directly to target directory");
        
        let targetDir = Zotero.Prefs.get("extensions.zotero.skr.review.exportDir");
        let targetFile;
        
        let dirService = Components.classes["@mozilla.org/file/directory_service;1"]
                             .getService(Components.interfaces.nsIProperties);
                             
        if (targetDir) {
            targetFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);
            targetFile.initWithPath(targetDir);
        } else {
            // Default to C:\Users\...\.zotero-skr
            targetFile = dirService.get("Home", Components.interfaces.nsIFile);
            targetFile.append(".zotero-skr");
        }
        
        if (!targetFile.exists()) {
            targetFile.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0o755);
        }
        
        targetFile.append(filename);
        
        // If file exists, append a random number to avoid overwriting
        if (targetFile.exists()) {
            let rnd = Math.floor(Math.random() * 10000);
            targetFile.leafName = dateStr + " skr辅助分析_" + rnd + ".md";
        }
        
        Zotero.File.putContents(targetFile, md);
        Zotero.debug("[SKR-EXPORT] Saved successfully to: " + targetFile.path);
        
        // Alert the user
        let wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Components.interfaces.nsIWindowMediator);
        let win = wm.getMostRecentWindow(null);
        
        let isZh = (Zotero.skr && Zotero.skr.prompt && Zotero.skr.prompt.local_language === "zh-CN");
        let collName = getNotesCollectionName();
        let collReminder = (dataIn && dataIn.length === 1) ? 
                           (isZh ? "独立笔记已保存至当前条目下作为子笔记。" : "Standalone note saved as a child note under the current item.") :
                           (isZh ? "独立笔记已自动保存至【" + collName + "】分类下。" : "Standalone note automatically saved under 【" + collName + "】 collection.");
                           
        let msg = isZh ?
            "导出成功！\n\n路径:\n" + targetFile.path + "\n\n" + collReminder + "\n\n(您可以在 Zotero 编辑 -> 首选项 -> SKR 中更改默认导出路径)" :
            "Export successful!\n\nSaved to:\n" + targetFile.path + "\n\n" + collReminder + "\n\n(You can change the default export location in Zotero Edit -> Preferences -> SKR)";
        
        if (win && win.alert) {
            win.alert(msg);
        } else {
            alert(msg);
        }
    } catch(e) {
        Zotero.debug("[SKR-EXPORT] Exception caught while saving: " + e);
        Zotero.debug("[SKR-EXPORT] Exception stack: " + (e.stack || "no stack"));
        try {
            alert("Export failed! Error: " + e.message);
        } catch(fallbackErr) {
            Zotero.debug("[SKR-EXPORT] Fallback alert failed: " + fallbackErr);
        }
    }
}

// Token Reducer for PDF
async function getReducedPdfText(item) {
    let fullText = "";
    try {
        let attachmentIDs = item.getAttachments();
        for (let attId of attachmentIDs) {
            let attItem = Zotero.Items.get(attId);
            if (attItem.attachmentContentType === 'application/pdf') {
                if (typeof Zotero.PDFWorker !== 'undefined' && Zotero.PDFWorker.getFullText) {
                    let result = await Zotero.PDFWorker.getFullText(attItem.id);
                    if (result && result.text) {
                        fullText = result.text;
                    }
                } else if (Zotero.Fulltext && Zotero.Fulltext.getText) {
                    fullText = await Zotero.Fulltext.getText(attItem);
                }
                
                if (fullText) break;
            }
        }
    } catch (e) {
        Zotero.debug("[SKR] Error extracting PDF text: " + e);
    }
    
    if (!fullText) return "";
    
    // Config for cleaning paper text
    const paperConfig = {
        // 1. Relaxed noise cleaning rules
        noisePatterns: [
            /^\d+\s*$/,                            // Pure number lines (e.g. page numbers, Y-axis scales)
            /https?:\/\/[^\s]+/i                   // Lines containing URLs
        ],
        // References trigger (scanned bottom-up)
        referenceRegex: /^(?:\d+\.?\s*|\[\d+\]\s*)?(References|Bibliography|Literature Cited|参考文献)\s*$/i,
        keywordsRegex: /^Keywords/i,
        bodyStartRegex: /^(?:1\.?\s*)?(Introduction|Background|Motivation|Related Work)\b/i,
        figureRegex: /^(?:Fig\.|Figure|Table)\s+\d+/i
    };

    function extractPaperBody(rawText, config) {
        const lines = rawText.split('\n');
        
        // --- Step 1: Tail truncation (find references bottom-up) ---
        let refIndex = -1;
        const searchLimit = Math.floor(lines.length * 0.5); 
        for (let i = lines.length - 1; i >= searchLimit; i--) {
            if (config.referenceRegex.test(lines[i].trim())) {
                refIndex = i;
                break;
            }
        }
        let processLines = refIndex !== -1 ? lines.slice(0, refIndex) : lines;

        // --- Step 2: Basic pre-cleaning (filter empty lines and obvious noise) ---
        let preCleanedLines = [];
        for (let i = 0; i < processLines.length; i++) {
            let trimmed = processLines[i].trim();
            if (!trimmed) continue;
            if (config.noisePatterns.some(regex => regex.test(trimmed))) continue;
            preCleanedLines.push(trimmed);
        }

        // --- Step 3: Advanced state machine and figure fragment filtering ---
        let resultBody = [];
        let state = 'SKIPPING_FRONT_MATTER';
        let hasSeenKeywords = false;
        let emptyLineCount = 0; // Keeping emptyLineCount for SKIP_FIGURE heuristic

        for (let i = 0; i < preCleanedLines.length; i++) {
            let currentLine = preCleanedLines[i];

            switch (state) {
                case 'SKIPPING_FRONT_MATTER':
                    if (config.keywordsRegex.test(currentLine)) {
                        hasSeenKeywords = true;
                        continue;
                    }
                    if (config.bodyStartRegex.test(currentLine)) {
                        state = 'IN_BODY';
                        resultBody.push(currentLine);
                        break;
                    }
                    if (hasSeenKeywords && currentLine.length > 30 && /^[A-Z]/.test(currentLine)) {
                        state = 'IN_BODY';
                        resultBody.push(currentLine);
                    }
                    break;

                case 'IN_BODY':
                    if (config.figureRegex.test(currentLine)) {
                        state = 'SKIP_FIGURE';
                        emptyLineCount = 0; // Initialize empty lines for skip logic
                        continue; 
                    }

                    // Heuristic figure fragment filtering (Look-ahead)
                    if (currentLine.length < 40 && !/[.:!?]$/.test(currentLine)) {
                        let nextLine = preCleanedLines[i + 1] || "";
                        if (nextLine.length > 0 && nextLine.length < 40 && !/[.:!?]$/.test(nextLine)) {
                            continue;
                        }
                    }

                    resultBody.push(currentLine);
                    break;

                case 'SKIP_FIGURE':
                    // In the user's new logic, emptyLineCount wasn't incremented because preCleanedLines stripped empty lines.
                    // We need to adapt the SKIP_FIGURE logic. Since empty lines are gone, we just look for a normal text line.
                    if (/^[A-Z\u4e00-\u9fa5]/.test(currentLine) && currentLine.length > 30) {
                        state = 'IN_BODY';
                        resultBody.push(currentLine);
                    }
                    break;
            }
        }

        // Fallback if no body was found
        if (resultBody.length === 0) {
            return preCleanedLines.join('\n\n');
        }

        return resultBody.join('\n\n');
    }

    try {
        fullText = extractPaperBody(fullText, paperConfig);
    } catch(e) {
        Zotero.debug("[SKR] Error during paper parsing: " + e);
        // fallback to raw if error
    }

    // 3. Truncate (Disabled as per user request)
    // if (fullText.length > 15000) {
    //     fullText = fullText.substring(0, 15000) + '\n...[Truncated]';
    // }
    
    return fullText;
}

window.addEventListener("load", async function() {
    if (dataIn && dataIn.length === 1) {
        // Mode 1: Single Document - Direct LLM request with 3 tasks extraction
        const item = Zotero.Items.get(dataIn[0].id) || dataIn[0];
        const title = item.getField ? item.getField('title') : item.title;
        const abstract = item.getField ? item.getField('abstractNote') : item.abstractNote;
        
        let div1 = document.getElementById('content1');
        let div2 = document.getElementById('content2');
        let div3 = document.getElementById('content3');
        
        let useFullText = false;
        try {
            useFullText = Zotero.Prefs.get("extensions.zotero.skr.review.useFullText");
        } catch (e) {}
        
        let reducedPdf = "";
        if (useFullText) {
            div1.textContent = "Extracting PDF Fulltext, please wait...";
            reducedPdf = await getReducedPdfText(item);
        } else {
            div1.textContent = "Using abstract only (full-text disabled)...";
        }
        
        div1.textContent = Zotero.skr.L10ns.getString('skr-excute-api-info');
        div2.textContent = Zotero.skr.L10ns.getString('skr-excute-api-info');
        div3.textContent = Zotero.skr.L10ns.getString('skr-excute-api-info');
        
        let systemPrompt = Zotero.skr.prompt.getSinglePaperPrompt();
        let userPrompt = `### Document Content ###\nTitle: ${title}\nAbstract: ${abstract}\nBody:\n${reducedPdf}`;
        let messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ];
        
        function extractTask(text, taskNum) {
            let startMarker = `===TASK_${taskNum}_START===`;
            let endMarker = `===TASK_${taskNum}_END===`;
            let startIndex = text.indexOf(startMarker);
            if (startIndex === -1) return "";
            startIndex += startMarker.length;
            let endIndex = text.indexOf(endMarker, startIndex);
            if (endIndex === -1) {
                return text.substring(startIndex).trim();
            } else {
                return text.substring(startIndex, endIndex).trim();
            }
        }
        
        let finalMarkdown = "";
        let apiSucceeded = true;
        try {
            let result_obj = Zotero.skr.requestLLM.requestStream(messages);
            let tmp_status = result_obj.next();
            while(!tmp_status.finished) {
                if(tmp_status.msg.length > 0) {
                    if(tmp_status.code != 200) {
                        let errMsg = Zotero.skr.L10ns.getString('skr-erro-info') + String(tmp_status.code) + "=>" + tmp_status.msg;
                        div1.textContent = errMsg;
                        div2.textContent = "";
                        div3.textContent = "";
                        finalMarkdown = errMsg;
                        apiSucceeded = false;
                        break;
                    } else {
                        let text = tmp_status.msg;
                        let t1 = extractTask(text, 1);
                        let t2 = extractTask(text, 2);
                        let t3 = extractTask(text, 3);
                        if (t1) div1.innerHTML = marked.parse(t1);
                        if (t2) div2.innerHTML = marked.parse(t2);
                        if (t3) div3.innerHTML = marked.parse(t3);
                    }
                }
                await Zotero.skr.requestLLM.sleep(15);
                tmp_status = result_obj.next();
            }
            
            // Final parse after stream finished
            let text = tmp_status.msg;
            if(apiSucceeded && tmp_status.code == 200 && text) {
                let t1 = extractTask(text, 1);
                let t2 = extractTask(text, 2);
                let t3 = extractTask(text, 3);
                
                // Fallback for cases where LLM ignores the strict markers
                if (!t1 && !t2 && !t3) {
                    div1.innerHTML = marked.parse(text);
                    div2.innerHTML = "<p><i>(No TASK_2 found)</i></p>";
                    div3.innerHTML = "<p><i>(No TASK_3 found)</i></p>";
                    finalMarkdown = text;
                } else {
                    if (t1) div1.innerHTML = marked.parse(t1);
                    if (t2) div2.innerHTML = marked.parse(t2);
                    if (t3) div3.innerHTML = marked.parse(t3);
                    finalMarkdown = "### Task 1：研究问题总结\n\n" + t1 + "\n\n### Task 2：研究方法提取\n\n" + t2 + "\n\n### Task 3：实验设计与结论提取\n\n" + t3;
                }
            } else if(tmp_status.code != 200 && tmp_status.msg) {
                let errMsg = Zotero.skr.L10ns.getString('skr-erro-info') + String(tmp_status.code) + "=>" + tmp_status.msg;
                div1.textContent = errMsg;
                div2.textContent = "";
                div3.textContent = "";
                finalMarkdown = errMsg;
                apiSucceeded = false;
            }
        } catch(err) {
            Zotero.debug("[SKR-EXPORT] " + err.message);
            let errMsg = Zotero.skr.L10ns.getString('skr-erro-info') + String(500) + "=>" + err.message;
            div1.textContent = errMsg;
            div2.textContent = "";
            div3.textContent = "";
            finalMarkdown = errMsg;
            apiSucceeded = false;
        }
        
        window.generatedMdContent = finalMarkdown;
        if (apiSucceeded && finalMarkdown) {
            let saveInfo = await window.saveStandaloneNote(finalMarkdown, dataIn);
            showAutoSaveNoteLocation(saveInfo);
        } else {
            showAutoSaveNoteLocation({
                type: 'notSaved',
                location: getPlannedNoteLocation(dataIn)
            });
        }
        document.getElementById('btn-export').classList.remove('hidden');
    } else {
        // Mode 2: Multi Document - Request API and format output with bibliography
        const request_data = [];
        for (const rawItem of dataIn) {
            const item = Zotero.Items.get(rawItem.id) || rawItem;
            const abstract = item.getField('abstractNote');
            const title = item.getField('title');
            request_data.push({
                "title": title,
                "abstract": abstract,
            });
        }
        
        let md1 = await load_text(request_data, 'content1', "question");
        let md2 = await load_text(request_data, 'content2', "method");
        let md3 = await load_text(request_data, 'content3', "design");
        let apiSucceeded = md1.ok && md2.ok && md3.ok;
        
        // Generate Bibliography
        let bibStyle = Zotero.Prefs.get("extensions.zotero.skr.review.defaultBibStyle") || "http://www.zotero.org/styles/apa";
        let bibItems = dataIn.map(i => Zotero.Items.get(i.id) || i);
        let bibHTML = "### 参考文献 (References)\n\n";
        try {
            let zoteroFormat = Zotero.QuickCopy.unserializeSetting("bibliography=" + bibStyle);
            let bibResult = Zotero.QuickCopy.getContentFromItems(bibItems, zoteroFormat);
            
            // Try to extract an array of strings if possible, or parse the HTML
            if (bibResult && bibResult.html) {
                // Extract text from div.csl-entry
                let tempDiv = document.createElement("div");
                tempDiv.innerHTML = bibResult.html;
                let entries = tempDiv.querySelectorAll(".csl-entry");
                if (entries.length > 0) {
                    for (let entry of entries) {
                        bibHTML += "- " + entry.textContent.trim() + "\n\n";
                    }
                } else {
                    bibHTML += bibResult.text.split('\n').filter(l => l.trim()).map(l => "- " + l.trim()).join('\n\n') + "\n\n";
                }
            } else if (bibResult && bibResult.text) {
                bibHTML += bibResult.text.split('\n').filter(l => l.trim()).map(l => "- " + l.trim()).join('\n\n') + "\n\n";
            }
        } catch(e) {
            bibHTML += "*Failed to generate bibliography: " + e + "*\n\n";
        }
        
        // Append bib to final markdown
        let fullMd = "## 研究问题\n\n" + md1.markdown + "\n\n## 研究方法\n\n" + md2.markdown + "\n\n## 研究设计\n\n" + md3.markdown + "\n\n" + bibHTML;
        
        window.generatedMdContent = fullMd;
        
        if (apiSucceeded) {
            // Save automatically as a standalone note
            let saveInfo = await window.saveStandaloneNote(fullMd, bibItems);
            showAutoSaveNoteLocation(saveInfo);
        } else {
            showAutoSaveNoteLocation({
                type: 'notSaved',
                location: getPlannedNoteLocation(bibItems)
            });
        }
        
        // Show save to OS file button
        document.getElementById('btn-export').classList.remove('hidden');
    }
});
