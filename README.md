<p align="center">
  <img src="src/chrome/icons/favicon-32x32.png">
</p>
<p align="center">
  <a href="https://www.zotero.org">
    <img src="https://img.shields.io/badge/Zotero-7%20|%208%20|%209-red" alt="Zotero-7/8/9">
  </a>
  <a href="https://github.com/WilliamsLiang/zotero-skr/stargazers">
    <img src="https://img.shields.io/github/stars/WilliamsLiang/zotero-skr?label=Stars" alt="element-ui">
  </a>
  <a href="https://github.com/WilliamsLiang/zotero-skr/releases">
    <img src="https://img.shields.io/github/downloads/WilliamsLiang/zotero-skr/total?label=Downloads" alt="element-ui">
  </a>
</p>

English | [简体中文](https://github.com/WilliamsLiang/zotero-skr/blob/master/README_CN.md)

## Introduction

Zotero-skr is a plugin for Zotero, serving as an auxiliary tool for literature review. It provides the following core functionalities:

1. Automatically generates literature reviews and search engine queries based on user-selected papers.
2. Automatically collects papers under user-specified tags and produces multi-paragraph summaries.
3. Summarizes research questions, methodologies, and experimental designs from user-selected papers.

## Getting started

* Step 1, download the latest version of Zotero-SKR: [Download](https://github.com/WilliamsLiang/zotero-skr/releases);
* Step 2: Zotero - Tools - Add-ons - ⚙️ - Install Add-on From File... , select the plug-in xpi file;
* Step 3: Set your own deployed large model address or platform API (e.g., OpenAI)

<img src="https://raw.githubusercontent.com/WilliamsLiang/zotero-skr/master/images/skr_setting.png" width="600"/>

* Step 4: You can:

1. Select literature for analysis.

- SKR Reading Support Analysis

  <img src="https://raw.githubusercontent.com/WilliamsLiang/zotero-skr/master/images/skr_analysis_by_paper.gif" width="600"/>
- Generate review or query

  <img src="https://raw.githubusercontent.com/WilliamsLiang/zotero-skr/master/images/review_by_paper.gif" width="600"/>
- Generate query

  <img src="https://raw.githubusercontent.com/WilliamsLiang/zotero-skr/master/images/query_by_paper.gif" width="600"/>

2. Choose a review generation tool to generate a review using the tags you've previously assigned.

<img src="https://raw.githubusercontent.com/WilliamsLiang/zotero-skr/master/images/review_by_tag.gif" width="600"/> 
  <!-- <img src="https://raw.githubusercontent.com/018/zotcard/main/image/newcard1_en.gif" width="600"/> -->

<!-- ## Video -->

<!-- - [bilibili](https://space.bilibili.com/404131635) -->

## Features

- Generate a literature review based on the selected documents.

  <img src="https://raw.githubusercontent.com/WilliamsLiang/zotero-skr/master/images/paper_review.png" width="600"/>
- Generate advanced search queries for major literature databases based on the selected documents.

  <img src="https://raw.githubusercontent.com/WilliamsLiang/zotero-skr/master/images/query.png" width="600"/>
- Summarize research questions, methodologies, and experimental designs from the selected literature.

  <img src="https://raw.githubusercontent.com/WilliamsLiang/zotero-skr/master/images/question.png" width="600"/> 
  <img src="https://raw.githubusercontent.com/WilliamsLiang/zotero-skr/master/images/method.png" width="600"/>
  <img src="https://raw.githubusercontent.com/WilliamsLiang/zotero-skr/master/images/design.png" width="600"/>
- Automatically match relevant literature based on your selected tags and generate a sectioned review.

  <img src="https://raw.githubusercontent.com/WilliamsLiang/zotero-skr/master/images/tag_review.png" width="600"/>

<!-- ## Donate

<img src="https://raw.githubusercontent.com/018/zotcard/main/src/chrome/content/images/wechat-alipay.png" style="zoom:70%;float:left" /> -->

## Recent Updates (v1.2.1)

- **Markdown & SKR Reading Support Optimization**: Improved Markdown rendering and the SKR Reading Support Analysis workflow for cleaner, better structured Zotero notes.
- **Single-Paper PDF Full-Text Support**: Single-document analysis can include extracted PDF full text, controlled by the "Use Full Text for Analysis" preference. Multi-document analysis continues to use abstracts by default.
- **SKR Reading Support Auto-Save**: Analysis results are automatically saved to Zotero notes only after successful API responses. Failed API requests no longer create error-content notes.
- **Visible Save Location**: The example-display page now shows the Zotero save path, such as `My Library -> SKR Notes`, with red warning styling when the note was not saved.
- **Configurable Multi-Document Note Collection**: Added a preference for the collection name used by multi-document SKR analysis notes. Leaving it blank uses the localized default.
- **APA 7 Default Bibliography**: The default bibliography style now prefers APA 7th edition when available, and falls back to the first installed Zotero style otherwise.
- **Copy Bibliography Window**: Added a bibliography copy dialog with localized UI text and custom bibliography style support.
- **Release Polish**: Improved English/Chinese localization keys and fixed several pre-release UI and debug-output issues.

## Future Work

1. [ ] Optimize LLM prompts
2. [ ] Advanced user interaction features (user-designed prompt interaction)
3. [ ] Page layout optimization
4. [ ] Interoperability with other plugins, e.g., ZotCard

## License

[MIT](./LICENSE)

Copyright (c) 2020-2024 018
