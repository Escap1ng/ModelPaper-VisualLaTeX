# ModelPaper-VisualLaTeX

[中文](README.md) | **English**

![Version](https://img.shields.io/github/v/release/Escap1ng/ModelPaper-VisualLaTeX?color=green&label=Version)
![License](https://img.shields.io/github/license/Escap1ng/ModelPaper-VisualLaTeX?color=blue)
![HTML](https://img.shields.io/badge/HTML-native-orange)
![CSS](https://img.shields.io/badge/CSS-native-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![Dependencies](https://img.shields.io/badge/dependencies-none-brightgreen)
![Platform](https://img.shields.io/badge/platform-web%20%7C%20offline-lightgrey)

> **🚧 Development Status**  
> Current version (v1.1.0) is focusing on feature refinement. The next version will prioritize UX/UI improvements.

A lightweight WYSIWYG LaTeX editor for mathematical modeling contestants. Edit like Word, generate LaTeX code in real time.

## 📖 Introduction

Many STEM students need LaTeX to write mathematical modeling papers, but struggle to memorize its syntax.
Overleaf is a raw code editor that lacks visual typesetting; traditional Word-to-LaTeX tools require uploading documents and cannot preview conversion results while writing.

This project is a pure-frontend offline web editor built with vanilla HTML/CSS/JavaScript — no frameworks, no backend.
It provides a Word-like visual editing area that generates standard `.tex` code in real time, and ships with a built-in Chinese National Mathematical Contest (MCM) paper template for quickly scaffolding a paper.

**Core positioning**: A rapid first-draft generation tool for modeling contest papers that lowers the LaTeX learning curve.

## ✨ Features

- **Split-pane layout**: Visual editor on the left | real-time LaTeX preview on the right
- **Basic formatting**: H1/H2/H3 headings, bold, italic, center toggle
- **Font selection**: Built-in open-source font support (Noto Serif SC, Noto Sans SC) with local loading
- **Lists**: ordered `enumerate`, unordered `itemize`
- **Formula shortcuts**: inline `$ $`, display `$$ $$`
- **Image insertion**: prompts for path and auto-generates the LaTeX `figure` float environment
- **Built-in template**: complete MCM LaTeX template, initialize your document with one click
- **Quick actions**: Start new document, Reload (clear draft)
- **Auto indent**: Type two spaces to automatically convert to first-line indent
- **One-click export**: copy LaTeX source or download the `.tex` file
- **Local cache**: `localStorage` draft autosave — content survives page refresh

## ⚠️ Known Limitations (Important)

1. Built on `contenteditable` for simplicity; complex nested layouts may parse incorrectly
2. V1.0 does not yet support complex tables, multi-level cross-references, or complex algorithm environment
3. Generated code is a draft framework only; fine-tune advanced LaTeX syntax manually
4. Local file read/write via the File System API is planned for V2.0; currently only export/download is supported

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/Escap1ng/ModelPaper-VisualLaTeX.git
```

### 2. Enter the project folder and double-click `index.html`

✅ **No server, no dependencies — runs fully offline**

## 📂 Project Structure

```
ModelPaper-VisualLaTeX/
├── index.html              # Main page (layout, toolbar)
├── style.css               # Global styles
├── main.js                 # Editor core, DOM-to-LaTeX conversion
├── templates/
│   └── mcm_template.tex    # MCM LaTeX base template
├── fonts/
│   └── README.md           # Open-source font documentation (Noto Serif SC, Noto Sans SC)
├── README.md               # Project docs (Chinese)
└── README.en.md            # Project docs (English)
```

## 📅 Roadmap

### V1.1.0 (Current version)

- ✅ Split-pane layout and basic formatting toolbar
- ✅ DOM → LaTeX basic syntax mapping
- ✅ Local draft caching and `.tex` file export
- ✅ Load preset MCM paper template
- ✅ Font selection (Noto Serif SC, Noto Sans SC)
- ✅ Quick actions (start new document, reload)
- ✅ Center toggle functionality
- ✅ Auto first-line indent conversion

### V2.0 (Next iterations)

- [ ] Visual table editor that generates `tabular`
- [ ] BibTeX reference quick-insert
- [ ] File System API support: open & save local `.tex`
- [ ] Algorithm pseudocode environment and more math package shortcuts
- [ ] Comprehensive UX/UI improvements

## 🤝 Contributing

Issues and feature requests are welcome. Pull Requests are also appreciated.

## 📄 License

MIT License

## 💡 Tips

**Recommended workflow**: Use this tool to generate the paper skeleton → import the `.tex` into Overleaf → refine complex formulas, figures, and formatting details manually.
