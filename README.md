# ModelPaper-VisualLaTeX

**中文** | [English](README.en.md)

![Version](https://img.shields.io/github/v/release/Escap1ng/ModelPaper-VisualLaTeX?color=green&label=Version)
![License](https://img.shields.io/github/license/Escap1ng/ModelPaper-VisualLaTeX?color=blue)
![HTML](https://img.shields.io/badge/HTML-纯原生-orange)
![CSS](https://img.shields.io/badge/CSS-纯原生-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![Dependencies](https://img.shields.io/badge/dependencies-none-brightgreen)
![Platform](https://img.shields.io/badge/platform-web%20%7C%20offline-lightgrey)

> **🚧 开发状态**  
> 当前版本（v1.1.0）已完成公式助手、公式输入升级等核心功能，下一版本将重点改善 UX/UI 显示效果。

面向数学建模参赛者的可视化 LaTeX 编辑器，内置常用数模公式助手，实时生成 LaTeX 代码

## 📖 项目介绍

很多理工科学生需要使用 LaTeX 撰写数模论文，但难以记忆繁多的 LaTeX 语法；
Overleaf 属于原生代码编辑器，缺少可视化排版体验；传统 Word 转 LaTeX 工具需要上传文档，无法边写边预览转换结果。

本项目是纯前端离线网页编辑器，基于原生 HTML/CSS/JavaScript 开发，无任何框架、不需要后端。
仿 Word 可视化编辑区域，一边排版，一边实时生成标准 `.tex` 代码，内置数学建模国赛论文模板，适合快速搭建论文框架。

**核心定位**：数模竞赛论文快速初稿生成工具，降低 LaTeX 入门门槛。

## ✨ 核心功能

- **双栏布局**：左侧可视化编辑区｜右侧实时 LaTeX 预览
- **基础排版**：一级/二级/三级标题（按数模规范标注字号：三号/四号/小四）、加粗、斜体、居中切换
- **字体选择**：内置开源字体支持（思源宋体、思源黑体），可本地加载
- **列表支持**：有序列表 `enumerate`、无序列表 `itemize`
- **公式工具弹窗**：可视化公式输入，内置 35+ 常用符号快捷面板（分数、根式、求和、积分、希腊字母等）
- **公式助手**：内置 70+ 常用数模公式库，按模型分类一键插入
- **图片插入**：填写路径自动生成 LaTeX figure 浮动环境
- **内置模板**：数模国赛 LaTeX 完整模板，一键初始化文档
- **快捷操作**：开始新文档、重新加载（清除草稿）
- **一键导出**：复制 LaTeX 源码、直接下载 `.tex` 文件
- **本地缓存**：`localStorage` 草稿缓存，刷新页面内容不丢失

## 🧮 公式助手

点击工具栏 **📚 公式助手** 按钮，打开公式助手面板。左侧按模型分类浏览，右侧展示公式名称与 LaTeX 源码，**点击任意公式即可插入到编辑器光标处**。

| 分类 | 内容 |
|------|------|
| 基础数学 | 分数、矩阵、行列式、分段函数、方程组、泰勒展开等 |
| 概率统计 | 均值、方差、正态分布、贝叶斯公式、泊松分布等 |
| 评价模型 | AHP、TOPSIS、熵权法、灰色关联度、Min-Max 归一化等 |
| 预测模型 | GM(1,1) 灰色预测、线性回归、指数平滑、RMSE、MAPE 等 |
| 优化模型 | 线性规划、运输问题、多目标规划、M/M/1 排队论等 |
| 微分方程 | Logistic 增长、SIR 传染病模型、欧拉法、龙格-库塔法等 |
| 插值拟合 | 拉格朗日插值、最小二乘、梯形/辛普森求积公式等 |

公式助手会为每个公式标注**行内 / 行间**插入类型，直接生成正确的 `$...$` 或 `$$...$$` 环境。

## ⚠️ 已知限制（重要）

1. 使用 `contenteditable` 简易富文本实现，复杂嵌套排版容易解析出错
2. V1.1.0 暂不支持复杂表格、多层交叉引用、复杂算法环境
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
├── fonts/
│   └── README.md           # 开源字体说明（思源宋体、思源黑体）
├── README.md               # 项目说明（中文）
└── README.en.md            # 项目说明（English）
```

## 📅 开发规划

### V1.1.0（当前版本）

- ✅ 双栏页面布局、基础排版工具栏
- ✅ DOM -> LaTeX 基础语法映射
- ✅ 草稿本地缓存、`.tex` 文件导出
- ✅ 载入预设数模论文模板
- ✅ 字体选择（思源宋体、思源黑体）
- ✅ 快捷操作（开始新文档、重新加载）
- ✅ 居中切换功能
- ✅ 首行缩进自动转换（输入两个空格 → 首行缩进两字符）
- ✅ 公式助手（70+ 常用数模公式分类库，一键插入）
- ✅ 公式输入系统升级（可视化弹窗 + 常用符号快捷面板）
- ✅ 标题字号按数模规范标注（三号/四号/小四）

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
