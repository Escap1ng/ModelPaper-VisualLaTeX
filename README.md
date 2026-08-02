# ModelPaper-VisualLaTeX

**中文** | [English](README.en.md)

![Version](https://img.shields.io/github/v/release/Escap1ng/ModelPaper-VisualLaTeX?color=green&label=Version)
![License](https://img.shields.io/github/license/Escap1ng/ModelPaper-VisualLaTeX?color=blue)
![HTML](https://img.shields.io/badge/HTML-纯原生-orange)
![CSS](https://img.shields.io/badge/CSS-纯原生-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![Dependencies](https://img.shields.io/badge/dependencies-none-brightgreen)
![Platform](https://img.shields.io/badge/platform-web%20%7C%20offline-lightgrey)

面向数学建模参赛者，轻量化可视化编辑器，类Word操作，实时生成LaTeX代码

## 📖 项目介绍

很多理工科学生需要使用 LaTeX 撰写数模论文，但难以记忆繁多的 LaTeX 语法；
Overleaf 属于原生代码编辑器，缺少可视化排版体验；传统 Word 转 LaTeX 工具需要上传文档，无法边写边预览转换结果。

本项目是纯前端离线网页编辑器，基于原生 HTML/CSS/JavaScript 开发，无任何框架、不需要后端。
仿 Word 可视化编辑区域，一边排版，一边实时生成标准 `.tex` 代码，内置数学建模国赛论文模板，适合快速搭建论文框架。

**核心定位**：数模竞赛论文快速初稿生成工具，降低 LaTeX 入门门槛。

## ✨ 核心功能

- **双栏布局**：左侧可视化编辑区｜右侧实时 LaTeX 预览
- **基础排版**：一级/二级/三级标题、加粗、斜体、段落居中
- **列表支持**：有序列表 `enumerate`、无序列表 `itemize`
- **公式快捷插入**：行内公式 `$ $`、行间公式 `$$ $$`
- **图片插入**：填写路径自动生成 LaTeX figure 浮动环境
- **内置模板**：数模国赛 LaTeX 完整模板，一键初始化文档
- **一键导出**：复制 LaTeX 源码、直接下载 `.tex` 文件
- **本地缓存**：`localStorage` 草稿缓存，刷新页面内容不丢失

## ⚠️ 已知限制（重要）

1. 使用 `contenteditable` 简易富文本实现，复杂嵌套排版容易解析出错
2. V1.0 暂不支持复杂表格、多层交叉引用、复杂算法环境
3. 生成代码仅作为论文初稿框架，复杂高级 LaTeX 语法建议手动微调
4. File System 本地文件读写功能为二期规划，当前仅支持导出下载

## 🚀 快速启动

### 1. 克隆仓库

```bash
git clone https://github.com/Escap1ng/ModelPaper-VisualLaTeX.git
```

### 2. 进入项目文件夹，直接双击打开 `index.html`

✅ **无需服务器、无需安装依赖，离线直接运行**

## 📂 项目结构

```
ModelPaper-VisualLaTeX/
├── index.html              # 主页面（页面布局、工具栏）
├── style.css               # 全局样式
├── main.js                 # 编辑器核心、DOM转LaTeX转换逻辑
├── templates/
│   └── mcm_template.tex    # 数模国赛LaTeX基础模板
├── README.md               # 项目说明（中文）
└── README.en.md            # 项目说明（English）
```

## 📅 开发规划

### V1.0（首发版本，当前目标）

- ✅ 双栏页面布局、基础排版工具栏
- ✅ DOM -> LaTeX 基础语法映射
- ✅ 草稿本地缓存、`.tex` 文件导出
- ✅ 载入预设数模论文模板

### V2.0（后续迭代）

- [ ] 可视化表格编辑器，自动生成 `tabular`
- [ ] 参考文献 BibTeX 快捷插入
- [ ] 支持 File System API，直接打开&保存本地 `.tex`
- [ ] 算法伪代码环境、更多数学宏包快捷按钮

## 🤝 参与贡献

欢迎提交 Issue 反馈bug或者新功能想法，也可以提交 Pull Request。

## 📄 开源协议

MIT License

## 💡 使用小贴士

**推荐工作流**：使用本工具生成论文基础框架 → 将 `.tex` 文件导入 Overleaf → 手动完善复杂公式、图表与格式细节。
