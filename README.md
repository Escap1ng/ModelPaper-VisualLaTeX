# VisualLaTeX

**中文** | [English](README.en.md)

![Version](https://img.shields.io/github/v/release/Escap1ng/VisualLaTeX?color=green&label=Version)
![License](https://img.shields.io/github/license/Escap1ng/VisualLaTeX?color=blue)
![HTML](https://img.shields.io/badge/HTML-纯原生-orange)
![CSS](https://img.shields.io/badge/CSS-纯原生-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![Dependencies](https://img.shields.io/badge/dependencies-none-brightgreen)
![Platform](https://img.shields.io/badge/platform-web%20%7C%20offline-lightgrey)

> **📌 项目状态**
> v2.0.0 为最终功能版本，项目转入维护状态（仅修复关键问题，不再新增功能）。

纯前端、零依赖、完全离线的 LaTeX 轻编辑器。**导入 `.tex` 文件，像 Word 一样做可视化轻量修改，实时生成并导出 LaTeX 代码。**

## 📖 项目介绍

已有 LaTeX 论文想改几句话、换个标题、调整一段文字，却不想面对满屏源码？Overleaf 是优秀的代码编辑器，但对"只想小改一下"的场景并不友好。

VisualLaTeX 的定位是**轻编辑器**：打开本地 `.tex` 文件后，章节、段落、列表、公式、图片自动转为可视化元素，直接点选修改；导言区、表格、参考文献、代码清单等复杂结构以灰色「原样保留块」展示，其中的文本同样可以直接编辑，导出时原样输出。

**核心承诺：导入 -> 轻改 -> 导出，内容不丢失。**

基于原生 HTML/CSS/JavaScript 开发，无任何框架、无后端、无构建步骤，双击 `index.html` 即可离线使用。

## ✨ 核心功能

- **导入 .tex**：一键打开本地 LaTeX 文件，自动解析为可视化内容
- **双栏布局**：左侧可视化编辑区｜右侧实时 LaTeX 代码预览
- **基础排版**：标题（`\section` 三级）、加粗、斜体、居中、有序/无序列表
- **公式输入**：弹窗式公式输入，内置 30+ 常用符号快捷面板（分数、根式、求和、积分、希腊字母等），支持行内 `$...$` 与行间 `$$...$$`
- **原样保留块**：表格、参考文献、代码清单等复杂结构原文展示、可编辑、导出不丢失
- **行内命令保护**：`\cite`、`\ref` 等引用命令原样保留，不会被转义破坏
- **图片插入**：填写路径自动生成 `figure` 浮动环境
- **一键导出**：复制 LaTeX 源码、下载 `.tex` 文件（自动沿用导入时的文件名）
- **本地缓存**：草稿连同导言区一起自动保存，刷新页面内容不丢失

## 🚀 快速启动

### 1. 克隆仓库

```bash
git clone https://github.com/Escap1ng/VisualLaTeX.git
```

### 2. 进入项目文件夹，直接双击打开 `index.html`

✅ **无需服务器、无需安装依赖，离线直接运行**

## 📂 项目结构

```
VisualLaTeX/
├── index.html              # 主页面（页面布局、工具栏）
├── style.css               # 全局样式
├── main.js                 # 编辑器核心、.tex 导入解析、DOM 转 LaTeX
├── README.md               # 项目说明（中文）
└── README.en.md            # 项目说明（English）
```

## ⚠️ 已知限制（重要）

1. 基于 `contenteditable` 简易富文本实现，复杂嵌套排版容易解析出错
2. 不支持可视化表格编辑（表格以原样保留块形式编辑源码）
3. 嵌套同名环境（如 itemize 套 itemize）等极端结构可能解析不完美
4. 定位是轻量修改工具，大规模重写建议直接使用代码编辑器

## 💡 使用小贴士

**推荐工作流**：导入要修改的 `.tex` -> 可视化完成文字与结构调整 -> 导出下载 -> 放回原项目编译。修改只发生在你改动的地方。

## 🤝 参与贡献

项目已转入维护状态，关键 Bug 修复欢迎提交 Issue 或 Pull Request。

## 📄 开源协议

MIT License

## 📅 版本历史

- **v2.0.0（最终版）**：去垂直化改造，转型为通用离线 LaTeX 轻编辑器；新增 .tex 导入；未支持结构原样保留，实现往返保真；修复导言区不随草稿缓存、公式误改丢数据等问题
- **v1.1.0**：可视化编辑器 + 数模公式助手（已被 v2.0.0 移除）
- **v1.0.0**：首个版本
