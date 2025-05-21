if (!Zotero.skr) Zotero.skr = {};
if (!Zotero.skr.prompt) Zotero.skr.prompt = {};


Zotero.skr.prompt = Object.assign(Zotero.skr.prompt, {
    local_language: null,
    init() {
        Zotero.debug('Zotero.skr.prompt inited.');
        if(Zotero.locale!="zh-CN" && Zotero.locale!="en-US"){
            this.local_language = "en-US";
        }else{
            this.local_language = Zotero.locale;
        }
    },
    getLocal(){
        return this.local_language;
    },
    getLocalQuestion(type) {
        var local_query = {
            "zh-CN": {
                "question": "研究问题提取：从每篇文献中识别作者所聚焦的核心研究问题，即试图解决的科学难题、理论空白或应用需求。若摘要未直接表述研究问题，请结合研究动机与研究目标进行合理提炼。\n候选研究问题生成：基于现有文献的研究空白、方法局限或视角缺失，提出2–3个具有延续性或创新性的研究问题作为候选方案，供后续选题或深入研究使用。",
                "method": "研究方法提取：识别每篇论文所采用的核心研究方法，包括但不限于：研究范式（定性、定量、混合方法）、数据来源（实验、问卷、语料库、传感器等）、分析方法（深度学习模型、回归分析、图模型、内容分析等）、实验设置或系统架构（模型训练方式、模块设计、平台等）、理论或技术框架（使用的理论基础、建模思路等）。\n候选研究方法方案建议：基于现有研究方法的不足、局限性或缺失环节，提出2–3个可能改进或创新的方法路径，供后续研究使用；可从方法融合、算法替代、数据多样性、评估机制等方面提出建议；每项建议须基于已有文献趋势，并指出其理论或应用潜力。",
                "design": "实验设计提取：梳理各论文的实验设计，包括实验目的、变量设置、数据来源、实验流程、评估指标与对照方式等；总结常用设计范式及创新点，便于跨研究比较。\n候选方案准备：在完成提取后，请预留结构化信息，供用户后续指令触发生成候选实验设计方案（如标准实验框架、参数设置建议、对照实验设计变体等）。",
                "title": "标题",
                "abstract": "摘要",
                "zh-CN-language":"中文",
                "en-US-language":"英文",
                "review_requirement":"综述要求：",
                "language_requirement":"综述撰写的语言：",
            },"en-US": {
                "question": "Research Question Extraction: Identify the core research question each paper focuses on—that is, the scientific challenge, theoretical gap, or practical need the study aims to address. If the abstract does not explicitly state the research question, extract it by reasonably inferring from the research motivation and objectives.\nCandidate Research Questions Generation: Based on existing gaps, methodological limitations, or missing perspectives in the literature, propose 2–3 potential follow-up or innovative research questions as candidate options for future topic selection or in-depth exploration.",
                "method": "Research Method Extraction: Identify the core research method used in each paper, including but not limited to: research paradigm (qualitative, quantitative, mixed methods), data sources (experiments, surveys, corpora, sensors, etc.), analysis methods (deep learning models, regression analysis, graph-based models, content analysis, etc.), experimental setups or system architectures (model training strategies, module designs, platforms, etc.), and theoretical or technical frameworks (underlying theories, modeling approaches, etc.).\nCandidate Methodological Proposals: Based on the shortcomings, limitations, or missing components in existing research methods, propose 2–3 potentially improved or innovative methodological approaches for future studies. Suggestions may include method integration, algorithm substitution, data diversity, or evaluation mechanisms. Each proposal should be grounded in existing research trends and highlight its theoretical or practical potential.",
                "design": "Experimental Design Extraction: Summarize the experimental design of each paper, including the experimental objectives, variable settings, data sources, procedures, evaluation metrics, and control strategies. Highlight common design patterns as well as innovative aspects to facilitate cross-study comparison.\nCandidate Design Preparation: After extraction, reserve structured information to allow users to later trigger the generation of candidate experimental design schemes (e.g., standard experimental frameworks, parameter setting suggestions, or controlled experiment variants).",
                "title": "Title",
                "abstract": "Abstract",
                "zh-CN-language":"Chinese",
                "en-US-language":"English",
                "review_requirement":"Review Requirements:",
                "language_requirement":"Language for Writing the Review:",
            },
        };
        return local_query[this.local_language][type];
    },
    getDataBase(language){
        var database={
            "zh-CN": {
                "CNKI": "中国知网",
                "": "一般搜索引擎(如谷歌学术、百度学术等)",
            },
            "en-US": {
                "Web of Science":"Web of Science",
                "Springer":"Springer",
                "IEEE Xplore":"IEEE Xplore",
                "ScienceDirect":"ScienceDirect",
                "Wiley Online Library":"Wiley Online Library",
                "Elsevier":"Elsevier",
                "":"General Search Engine(eg. google scholar)",
            }
        }
        return database[language];
    },
    getNullPaperPrompt() {
        if(this.local_language == "zh-CN") {
            var NullPaperPrompt = "严格按照提供的论文内容，总结相关工作。";
            return NullPaperPrompt;
        } else {
            var NullPaperPrompt = "Strictly summarize the related work based on the provided paper content.";
            return NullPaperPrompt;
        }
    },
    getNullMultiReviewPrompt() {
        if(this.local_language == "zh-CN") {
            var NullMultiReviewPrompt = "请根据我提供的综述内容，帮我重新整理综述内容。";
            return NullMultiReviewPrompt;
        } else {
            var NullMultiReviewPrompt = "Please help me reorganize the review content based on the review content I provided.";
            return NullMultiReviewPrompt;
        }
    },
    getreviewPrompt() {
        if(this.local_language == "zh-CN") {
            var reviewPrompt = "请根据提供的论文标题和摘要，撰写一段结构清晰、内容紧凑的文献综述段落，旨在概述该研究主题相关领域的重要研究进展与核心观点。\n\
综述内容需要满足以下要求：\n\
重点突出：紧扣论文标题与摘要中的研究主题，围绕核心问题梳理已有文献；\n\
逻辑清晰：合理组织观点，体现研究演进脉络或不同学术视角；\n\
引文规范：凡涉及具体研究结论或观点，均需在文中适当位置标注引文标题，便于读者查阅；\n\
语言学术：表述客观准确，避免主观评价与无根据推论；\n\
用户要求：根据用户提供的综述要求生成综述";
            return reviewPrompt;
        } else {
            var reviewPrompt = "Based on the provided paper titles and abstracts, write a well-structured and concise literature review paragraph that summarizes key developments and core viewpoints in the relevant research field.\n\
The review should meet the following requirements:\n\
- Focused: Center around the main research topic as indicated by the titles and abstracts, and organize existing literature around core issues;\n\
- Logically coherent: Present viewpoints in a clear and structured manner, reflecting the progression of research or contrasting academic perspectives;\n\
- Proper citation: For any specific findings or viewpoints mentioned, include the paper title as an inline citation to facilitate reference;\n\
- Academic language: Use objective and precise language, avoiding subjective judgments or unsupported assumptions;\n\
- User-defined: The review should be generated based on user-provided review instructions.";
            return reviewPrompt
        }
    },
    getRetrievalPrompt() {
        if(this.local_language == "zh-CN") {
            var retrievalPrompt = "我将提供一篇或多篇相关文献的标题和摘要，以及所使用的文献检索网站或数据库的检索要求（例如字段限制、逻辑运算符规则、截词符号等）。\n\
请你根据文献内容提取关键词（包括同义词、变体、相关概念等），并结合数据库的检索语法，生成一个高质量的、可复用的检索查询式，用于获取该主题下的相关文献。 \n\
要求如下：\n\
1.关键词涵盖文献的核心研究主题；\n\
2.使用布尔逻辑（AND、OR、NOT）组织关键词；\n\
3.根据数据库特点使用适当的字段限定（如：TI=、AB=、TS=、MeSH Terms等）；\n\
4.支持中英文检索时，分别列出两种版本（如适用）；\n\
5.输出最终的查询式，并简要解释关键词和结构的选择逻辑。";
            return retrievalPrompt;
        } else {
            var retrievalPrompt = "I will provide the titles and abstracts of one or more related papers, along with the search requirements of the literature retrieval website or database (e.g., field restrictions, Boolean operator rules, truncation symbols, etc.).\n\
Based on the content of the papers, please extract keywords (including synonyms, variants, and related concepts), and generate a high-quality, reusable search query using the syntax of the specified database to retrieve relevant literature on the topic.\n\
The query should meet the following requirements:\n\
1. Keywords should cover the core research topics of the literature;\n\
2. Use Boolean logic (AND, OR, NOT) to organize the keywords;\n\
3. Apply appropriate field-specific tags according to the database (e.g., TI=, AB=, TS=, MeSH Terms, etc.);\n\
4. If applicable, provide separate versions for both Chinese and English search queries;\n\
5. Output the final search query and briefly explain the logic behind the keyword selection and query structure.";
            return retrievalPrompt;
        }
    },
    getExtractinfoPrompt(type) {
        if(this.local_language == "zh-CN") {
            var extractinfoPrompt = "你将接收到一篇或多篇文献的标题与摘要，任务是分析并准备文献中的关键信息，而非直接输出完整内容。请遵循以下要求：\n\
跨文献整合：识别多篇文献之间的共性与差异，按研究主题进行组织，而非逐篇列举。\n\
结构清晰：整理后的信息需逻辑明确、段落分明，便于后续按需调用。\n\
表达准确简洁：使用准确的学术语言归纳原文核心含义，避免主观臆测或超出原文内容的推断。";
            return extractinfoPrompt + "\n" + this.getLocalQuestion(type);
        }else{ 
            var extractinfoPrompt = "You will receive the titles and abstracts of one or more academic papers. Your task is to analyze and prepare the key information from these documents, rather than directly outputting the full content. Please follow the guidelines below:\n\
Cross-paper synthesis: Identify the commonalities and differences across multiple papers. Organize the content by research themes rather than listing each paper individually.\n\
Clear structure: The extracted information should be logically organized and clearly segmented into paragraphs, making it easy to reference and reuse.\n\
Accurate and concise expression: Use precise academic language to summarize the core meaning of the original text. Avoid subjective speculation or inferences beyond the provided content.";
            return extractinfoPrompt + "\n" + this.getLocalQuestion(type);
        }
    },
    getRetrievalDemand(database,language,demand){
        var database_prompt = {
            "en-US": "Only extract keywords and construct a query for retrieval in general search engines.",
            "zh-CN": "仅提取关键词，构建查询式在一般搜索引擎中检索",
        };

        var strict_promp = {
            "en-US":"\nStrictly follow the above requirements to generate the query.",
            "zh-CN":"\n严格按照以上要求生成检索式",
        };
        var null_demand = {
            "en-US":"Strictly follow the above requirements to generate the query.",
            "zh-CN":"请根据以上信息，生成一个检索式",
        };
        if(database == ""){
            database = database_prompt[this.local_language];
        }
        if(demand == ""){
            demand = null_demand[this.local_language];
        }else{
            demand = demand + "\n"+strict_promp[this.local_language]
        }
        var all_demand_dict = {
            "en-US":`Additional conditions:\nDatabase: ${database}\nQuery language: ${this.getLocalQuestion(language+"-language")}\nOther requirements: ${demand}`,
            "zh-CN":`其他条件要求：\n数据库类型:${database}\n检索式语言:${this.getLocalQuestion(language+"-language")}\n检索其他要求:${demand}`,
        };
        return all_demand_dict[this.local_language];
    },
    getreviewTagPrompt() {
        if(this.local_language == "zh-CN") {
            var reviewTagPrompt = "请根据提供的综述段落，撰写一篇结构清晰、内容紧凑的文献综述，旨在概述该研究主题相关领域的重要研究进展与核心观点。";
            return reviewTagPrompt;
        } else {
            var reviewTagPrompt = "Based on the provided review paragraph, please write a well-structured and concise literature review that aims to summarize key research developments and core viewpoints in the relevant field of the study topic.";
            return reviewTagPrompt;
        }
    },
    getTimestampPrompt(){
        var now_year = new Date().getFullYear();
        if(this.local_language == "zh-CN") {
            var timestamp = "当前时间是："+now_year+"年\n";
            return timestamp;
        }else {
            var timestamp = "Current year:"+now_year+"\n";
            return timestamp;
        }
    },
  });
