<p align="center">
  <img src="src/chrome/icons/favicon-32x32.png">
</p>
<p align="center">
  <a href="https://www.zotero.org">
    <img src="https://img.shields.io/badge/Zotero-7-red" alt="Zotero-7">
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

- 第一步：下载最新版本 zotcard: [下载地址](https://github.com/018/zotcard/releases)
- 第二步：Zotero - 工具 - 插件 - ⚙️ - 从文件安装插件... ，选择插件 xpi 文件
- 第三步：设置你自己部署的大模型地址或者平台API（例如 openAI）

<img src="https://raw.githubusercontent.com/WilliamsLiang/zotero-skr/master/images/skr_setting.png" width="600"/>

- 第四步：你可以：

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

## 未来工作

1. [ ] 大模型prompt优化  
2. [ ] 高级用户交互功能（由用户设计prompt交互）  
3. [ ] 页面布局优化
4. [ ] 与其他插件交互，例如ZotCard  

## 开源协议

[MIT](./LICENSE)

版权所有 (c) 2020-2024 018
