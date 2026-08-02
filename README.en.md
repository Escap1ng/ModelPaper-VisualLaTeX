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
> Current version (v1.1.0) has completed the formula assistant and formula input upgrades. The next version will prioritize UX/UI improvements.

A visual LaTeX editor for mathematical modeling contestants with a built-in formula assistant for common math-modeling formulas. Edit like Word, generate LaTeX code in real time.

## 📖 Introduction

Many STEM students need LaTeX to write mathematical modeling papers, but struggle to memorize its syntax.
Overleaf is a raw code editor that lacks visual typesetting; traditional Word-to-LaTeX tools require uploading documents and cannot preview conversion results while writing.

This project is a pure-frontend offline web editor built with vanilla HTML/CSS/JavaScript — no frameworks, no backend.
It provides a Word-like visual editing area that generates standard `.tex` code in real time, and ships with a built-in Chinese National Mathematical Contest (MCM) paper template for quickly scaffolding a paper.

**Core positioning**: A rapid first-draft generation tool for modeling contest papers that lowers the LaTeX learning curve.

## ✨ Features

- **Split-pane layout**: Visual editor on the left | real-time LaTeX preview on the right
- **Basic formatting**: H1/H2/H3 headings (annotated with standard Chinese font sizes 三号/四号/小四), bold, italic, center toggle
- **Font selection**: Built-in open-source font support (Noto Serif SC, Noto Sans SC) with local loading
- **Lists**: ordered `enumerate`, unordered `itemize`
- **Formula input dialog**: visual formula entry with a 35+ symbol quick palette (fractions, roots, sums, integrals, Greek letters, etc.)
- **Formula assistant**: 70+ common math-modeling formulas organized by model category, insert with one click
- **Image insertion**: prompts for path and auto-generates the LaTeX `figure` float environment
- **Built-in template**: complete MCM LaTeX template, initialize your document with one click
- **Quick actions**: Start new document, Reload (clear draft)
- **One-click export**: copy LaTeX source or download the `.tex` file
- **Local cache**: `localStorage` draft autosave — content survives page refresh

## 🧮 Formula Assistant

Click the **📚 Formula Assistant** button in the toolbar to open the assistant panel. Browse by model category on the left; each formula shows its name and LaTeX source on the right. **Click any formula to insert it at the editor's cursor position.**

| Category | Contents |
|----------|----------|
| Basic Math | fractions, matrices, determinants, piecewise functions, equation systems, Taylor expansion, etc. |
| Probability & Statistics | mean, variance, normal distribution, Bayes' theorem, Poisson distribution, etc. |
| Evaluation Models | AHP, TOPSIS, entropy weight, grey relational analysis, Min-Max normalization, etc. |
| Prediction Models | GM(1,1) grey prediction, linear regression, exponential smoothing, RMSE, MAPE, etc. |
| Optimization Models | linear programming, transportation problem, multi-objective programming, M/M/1 queueing, etc. |
| Differential Equations | Logistic growth, SIR epidemic model, Euler's method, Runge-Kutta, etc. |
| Interpolation & Fitting | Lagrange interpolation, least squares, trapezoidal/Simpson quadrature, etc. |

Each formula is tagged as **inline / display** and generates the correct `$...$` or `$$...$$` environment.

## ⚠️ Known Limitations (Important)

1. Built on `contenteditable` for simplicity; complex nested layouts may parse incorrectly
2. V1.1.0 does not yet support complex tables, multi-level cross-references, or complex algorithm environments
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
- ✅ Quick actions (Start new document, Reload)
- ✅ Center toggle
- ✅ Automatic first-line indent (two leading spaces → 2-character indent)
- ✅ Formula assistant (70+ common math-modeling formulas by category, one-click insert)
- ✅ Formula input upgrade (visual dialog + common symbol palette)
- ✅ Heading font sizes annotated per Chinese typesetting standard (三号/四号/小四)

### V2.0 (Next iterations)

- [ ] Visual table editor that generates `tabular`
- [ ] BibTeX reference quick-insert
- [ ] File System API support: open & save local `.tex`
- [ ] Algorithm pseudocode environment and more math package shortcuts

## 🤝 Contributing

Issues and feature requests are welcome. Pull Requests are also appreciated.

## 📄 License

MIT License

## 💡 Tips

**Recommended workflow**: Use this tool to generate the paper skeleton → import the `.tex` into Overleaf → refine complex formulas, figures, and formatting details manually.
