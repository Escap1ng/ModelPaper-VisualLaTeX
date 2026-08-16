# VisualLaTeX

[中文](README.md) | **English**

![Version](https://img.shields.io/github/v/release/Escap1ng/VisualLaTeX?color=green&label=Version)
![License](https://img.shields.io/github/license/Escap1ng/VisualLaTeX?color=blue)
![HTML](https://img.shields.io/badge/HTML-native-orange)
![CSS](https://img.shields.io/badge/CSS-native-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![Dependencies](https://img.shields.io/badge/dependencies-none-brightgreen)
![Platform](https://img.shields.io/badge/platform-web%20%7C%20offline-lightgrey)

> **📌 Project Status**
> v2.0.0 is the final feature release. The project is now in maintenance mode (critical fixes only, no new features).

A pure-frontend, zero-dependency, fully offline LaTeX light editor. **Import a `.tex` file, make light visual edits like in Word, and export LaTeX code in real time.**

## 📖 Introduction

Want to tweak a few sentences, change a title, or adjust a paragraph in an existing LaTeX paper without facing a wall of source code? Overleaf is a great code editor, but it is not friendly to "I just need a small change".

VisualLaTeX positions itself as a **light editor**: after opening a local `.tex` file, sections, paragraphs, lists, formulas, and images are automatically turned into visual elements you can edit directly. The preamble, tables, bibliographies, code listings, and other complex structures are shown as gray "verbatim blocks" - their text is still directly editable, and they are exported as-is.

**Core promise: import -> light edit -> export, with nothing lost.**

Built with vanilla HTML/CSS/JavaScript - no frameworks, no backend, no build step. Double-click `index.html` to run it offline.

## ✨ Features

- **Import .tex**: open a local LaTeX file and have it parsed into visual content automatically
- **Split-pane layout**: visual editor on the left | real-time LaTeX preview on the right
- **Basic formatting**: headings (three levels of `\section`), bold, italic, center, ordered/unordered lists
- **Formula input**: dialog-based entry with a 30+ symbol quick palette (fractions, roots, sums, integrals, Greek letters, etc.), supporting inline `$...$` and display `$$...$$` math
- **Verbatim blocks**: tables, bibliographies, code listings, and other complex structures are shown as-is, editable, and never lost on export
- **Inline command protection**: `\cite`, `\ref`, and other reference commands are preserved verbatim instead of being corrupted by escaping
- **Image insertion**: enter a path to generate the LaTeX `figure` float environment
- **One-click export**: copy LaTeX source or download the `.tex` file (reusing the imported file name)
- **Local cache**: drafts are autosaved together with the preamble - content survives page refresh

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/Escap1ng/VisualLaTeX.git
```

### 2. Enter the project folder and double-click `index.html`

✅ **No server, no dependencies - runs fully offline**

## 📂 Project Structure

```
VisualLaTeX/
├── index.html              # Main page (layout, toolbar)
├── style.css               # Global styles
├── main.js                 # Editor core, .tex import parsing, DOM-to-LaTeX
├── README.md               # Project docs (Chinese)
└── README.en.md            # Project docs (English)
```

## ⚠️ Known Limitations (Important)

1. Built on `contenteditable` for simplicity; complex nested layouts may parse incorrectly
2. No visual table editing (tables are edited as source inside verbatim blocks)
3. Edge cases such as nested same-name environments (e.g., itemize inside itemize) may not parse perfectly
4. This is a light editing tool; for large-scale rewrites, use a code editor

## 💡 Tips

**Recommended workflow**: import the `.tex` you want to touch up -> make visual text and structure adjustments -> export and download -> drop it back into your project and compile. Changes only happen where you make them.

## 🤝 Contributing

The project is in maintenance mode; Issue reports and Pull Requests for critical bug fixes are welcome.

## 📄 License

MIT License

## 📅 Version History

- **v2.0.0 (final)**: de-verticalized into a general offline LaTeX light editor; added .tex import; verbatim preservation of unsupported structures for lossless round-trips; fixed preamble not being cached with drafts and formulas losing user edits
- **v1.1.0**: visual editor + formula assistant for math-modeling papers (removed in v2.0.0)
- **v1.0.0**: initial release
