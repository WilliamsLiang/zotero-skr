<p align="center">
  <img src="src/chrome/icons/favicon-32x32.png">
</p>
<p align="center">
  <a href="https://www.zotero.org">
    <img src="https://img.shields.io/badge/Zotero-7%20|%208%20|%209-red" alt="Zotero-7/8/9">
  </a>
  <a href="https://github.com/WilliamsLiang/zotero-skr/stargazers">
    <img src="https://img.shields.io/github/stars/WilliamsLiang/zotero-skr?label=Stars" alt="Stars">
  </a>
  <a href="https://github.com/WilliamsLiang/zotero-skr/releases">
    <img src="https://img.shields.io/github/downloads/WilliamsLiang/zotero-skr/total?label=Downloads" alt="Downloads">
  </a>
</p>

[English](https://github.com/WilliamsLiang/zotero-skr/blob/master/README.md) | 简体中文

## 简介

Zotero-skr 是 Zotero 的一款插件，作为文献综述的辅助工具，提供以下核心功能：

1. 根据用户选定的论文自动生成文献综述和搜索引擎查询语句。
2. 自动收集用户选定标签下的论文，并生成多段落综述。
3. 根据用户选定的论文总结研究问题、研究方法和实验设计。

## 快速开始

* 第一步：下载最新版本 Zotero-SKR: [下载地址](https://github.com/WilliamsLiang/zotero-skr/releases)
* 第二步：Zotero - 工具 - 插件 - ⚙️ - 从文件安装插件... ，选择插件 xpi 文件
* 第三步：设置你自己部署的大模型地址或者平台API（例如 openAI）

<img src="https://raw.githubusercontent.com/WilliamsLiang/zotero-skr/master/images/skr_setting.png" width="600"/>

* 第四步：你可以：

1. 选择文献进行分析

- SKR 阅读辅助分析

<img src="https://raw.githubusercontent.com/WilliamsLiang/zotero-skr/master/images/skr_analysis_by_paper.gif" width="600"/>

- 生成综述或检索式

<img src="https://raw.githubusercontent.com/WilliamsLiang/zotero-skr/master/images/review_by_paper.gif" width="600"/>

- 生成检索式

<img src="https://raw.githubusercontent.com/WilliamsLiang/zotero-skr/master/images/query_by_paper.gif" width="600"/>

2. 选择综述生成工具，利用你之前的打的标签生成综述

<img src="https://raw.githubusercontent.com/WilliamsLiang/zotero-skr/master/images/review_by_tag.gif" width="600"/>

## 功能特性

- 通过你选择的文献生成综述

  <img src="https://raw.githubusercontent.com/WilliamsLiang/zotero-skr/master/images/paper_review.png" width="600"/>
- 通过你选择的文献生成各大文献数据库的高级检索式

  <img src="https://raw.githubusercontent.com/WilliamsLiang/zotero-skr/master/images/query.png" width="600"/>
- 通过你选择的文献总结研究问题、研究方法和实验设计

  <img src="https://raw.githubusercontent.com/WilliamsLiang/zotero-skr/master/images/question.png" width="600"/> 
  <img src="https://raw.githubusercontent.com/WilliamsLiang/zotero-skr/master/images/method.png" width="600"/>
  <img src="https://raw.githubusercontent.com/WilliamsLiang/zotero-skr/master/images/design.png" width="600"/>
- 根据你选择标签，自动匹配相关文献，分段落做综述

  <img src="https://raw.githubusercontent.com/WilliamsLiang/zotero-skr/master/images/tag_review.png" width="600"/>

## 最近更新 (v1.2.1)

- **Markdown 与 SKR 辅助阅读优化**：优化 Markdown 渲染和 SKR 辅助阅读分析流程，使生成的 Zotero 笔记结构更清晰、排版更稳定。
- **单篇 PDF 全文支持**：单篇文档分析支持提取 PDF 全文参与请求，可通过“分析时使用全文本”设置决定是否启用；多篇文档分析仍默认使用摘要。
- **SKR 辅助阅读自动保存**：仅在 API 请求成功后自动保存 Zotero 笔记；API 请求失败时不再生成包含错误信息的笔记。
- **保存位置可见**：`example-display` 页面会显示 Zotero 中的保存路径，例如 `我的文献库 -> SKR 笔记`；未保存时使用红色提示。
- **多篇文档笔记集合可配置**：首选项中新增多篇文档 SKR 辅助分析笔记保存类别名称设置；留空时使用本地化默认值。
- **APA 7 默认参考文献格式**：默认参考文献格式优先选择 APA 7th edition；如果系统中没有该样式，则选择 Zotero 样式列表第一个。
- **复制参考文献窗口**：新增参考文献复制窗口，支持自定义参考文献格式和中英文界面文案。
- **发布前打磨**：修复英文/中文本地化 key、界面标签和调试输出等发布前问题。

## 未来工作

1. [ ] 大模型prompt优化
2. [ ] 高级用户交互功能（由用户设计prompt交互）
3. [ ] 页面布局优化
4. [ ] 与其他插件交互，例如ZotCard

## 开发参考网址

* [ZotCard插件](https://github.com/018/zotcard/tree/main)
* [官方开发文档](https://www.zotero.org/support/dev/client_coding/javascript_api#running_ad_hoc_javascript_in_zotero)
* [官方范例](https://github.com/zotero/make-it-red)
* [官方Zotero插件](https://www.zotero.org/support/dev/zotero_7_for_developers)

## 开源协议

[MIT](./LICENSE)

版权所有 (c) 2020-2024 018
