/**
 * ModelPaper-WYSIWYG-LaTeX 主逻辑
 * 编辑器核心 + DOM 转 LaTeX 转换
 */

// 全局变量
let editorArea = null;
let previewArea = null;
let statusText = null;
let debounceTimer = null;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    editorArea = document.getElementById('editorArea');
    previewArea = document.getElementById('previewArea');
    statusText = document.getElementById('statusText');

    // 绑定工具栏按钮事件
    initToolbar();

    // 从 localStorage 恢复草稿
    loadDraft();

    // 监听编辑器变化，实时更新 LaTeX
    editorArea.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function() {
            updatePreview();
            saveDraft();
        }, 300);
    });

    // 初始更新预览
    updatePreview();
});

// 初始化工具栏
function initToolbar() {
    // 标题按钮
    document.getElementById('btnH1').addEventListener('click', () => insertHeading(1));
    document.getElementById('btnH2').addEventListener('click', () => insertHeading(2));
    document.getElementById('btnH3').addEventListener('click', () => insertHeading(3));

    // 格式按钮
    document.getElementById('btnBold').addEventListener('click', toggleBold);
    document.getElementById('btnItalic').addEventListener('click', toggleItalic);
    document.getElementById('btnCenter').addEventListener('click', toggleCenter);

    // 列表按钮
    document.getElementById('btnUl').addEventListener('click', insertUnorderedList);
    document.getElementById('btnOl').addEventListener('click', insertOrderedList);

    // 公式按钮
    document.getElementById('btnInlineFormula').addEventListener('click', insertInlineFormula);
    document.getElementById('btnBlockFormula').addEventListener('click', insertBlockFormula);

    // 图片按钮
    document.getElementById('btnImage').addEventListener('click', insertImage);

    // 模板按钮
    document.getElementById('btnTemplate').addEventListener('click', loadTemplate);

    // 导出按钮
    document.getElementById('btnCopy').addEventListener('click', copyLatex);
    document.getElementById('btnDownload').addEventListener('click', downloadTexFile);
}

// 插入标题
function insertHeading(level) {
    const tag = 'h' + level;
    const text = level === 1 ? '一级标题' : level === 2 ? '二级标题' : '三级标题';
    document.execCommand('formatBlock', false, tag);
    editorArea.focus();
}

// 切换粗体
function toggleBold() {
    document.execCommand('bold', false, null);
    editorArea.focus();
}

// 切换斜体
function toggleItalic() {
    document.execCommand('italic', false, null);
    editorArea.focus();
}

// 切换居中
function toggleCenter() {
    document.execCommand('justifyCenter', false, null);
    editorArea.focus();
}

// 插入无序列表
function insertUnorderedList() {
    document.execCommand('insertUnorderedList', false, null);
    editorArea.focus();
}

// 插入有序列表
function insertOrderedList() {
    document.execCommand('insertOrderedList', false, null);
    editorArea.focus();
}

// 插入行内公式
function insertInlineFormula() {
    const formula = prompt('请输入行内公式（LaTeX 格式，如 E=mc^2）：', 'E=mc^2');
    if (formula) {
        const span = document.createElement('span');
        span.className = 'formula-inline';
        span.setAttribute('data-formula', formula);
        span.textContent = '$' + formula + '$';
        insertNodeAtCursor(span);
        updatePreview();
        saveDraft();
    }
}

// 插入行间公式
function insertBlockFormula() {
    const formula = prompt('请输入行间公式（LaTeX 格式）：', '\\int_{a}^{b} f(x) dx');
    if (formula) {
        const div = document.createElement('div');
        div.className = 'formula-block';
        div.setAttribute('data-formula', formula);
        div.textContent = '$$' + formula + '$$';
        insertNodeAtCursor(div);
        updatePreview();
        saveDraft();
    }
}

// 插入图片
function insertImage() {
    const imagePath = prompt('请输入图片路径（LaTeX 中使用的路径）：', 'example-image.png');
    const caption = prompt('请输入图片标题：', '图片标题');
    const label = prompt('请输入图片标签（用于引用）：', 'fig:example');

    if (imagePath) {
        const img = document.createElement('img');
        img.src = imagePath;
        img.alt = caption;
        img.setAttribute('data-caption', caption || '');
        img.setAttribute('data-label', label || '');
        img.setAttribute('data-width', '0.6');

        insertNodeAtCursor(img);
        updatePreview();
        saveDraft();
    }
}

// 在光标处插入节点
function insertNodeAtCursor(node) {
    const sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(node);

        // 在节点后添加一个空格，方便继续输入
        const space = document.createTextNode(' ');
        range.setStartAfter(node);
        range.setEndAfter(node);
        range.insertNode(space);

        // 移动光标到空格后
        range.setStartAfter(space);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }
}

// 加载数模模板
function loadTemplate() {
    if (!confirm('加载模板会覆盖当前内容，是否继续？')) return;

    // 优先尝试 fetch（HTTP 模式下可读取外部 .tex 文件）
    fetch('templates/mcm_template.tex')
        .then(response => {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.text();
        })
        .then(texContent => applyTemplate(texContent))
        .catch(() => {
            // fetch 失败（file:// 协议），使用内嵌模板
            const embedded = document.getElementById('mcm-template');
            if (embedded && embedded.textContent.trim()) {
                applyTemplate(embedded.textContent.trim());
            } else {
                alert('加载模板失败：无法获取模板内容');
            }
        });
}

// 应用模板到编辑器
function applyTemplate(texContent) {
    const htmlContent = parseTemplateToHTML(texContent);
    editorArea.innerHTML = htmlContent;
    updatePreview();
    saveDraft();
    updateStatus('模板加载成功');
}

// 解析 LaTeX 模板为 HTML
function parseTemplateToHTML(tex) {
    let html = '';

    // 辅助：清理 LaTeX 文本为 HTML
    function cleanLatexText(text) {
        // 先提取行内公式 $...$，避免被其他替换影响
        const formulas = [];
        text = text.replace(/\$([^$]+)\$/g, (match, formula) => {
            const f = formula.trim();
            formulas.push(f);
            return '\x00F' + (formulas.length - 1) + '\x00';
        });
        // 处理文本格式命令
        text = text
            .replace(/\\textbf\{([^}]*)\}/g, '<b>$1</b>')
            .replace(/\\textit\{([^}]*)\}/g, '<i>$1</i>')
            .replace(/\\emph\{([^}]*)\}/g, '<i>$1</i>')
            .replace(/\\\\/g, '<br>');
        // 还原行内公式为 span
        text = text.replace(/\x00F(\d+)\x00/g, (match, idx) => {
            const f = formulas[parseInt(idx)];
            return '<span class="formula-inline" data-formula="' + f + '">$' + f + '$</span>';
        });
        return text.trim();
    }

    // 去除注释（不处理 \% 转义）
    tex = tex.replace(/(^|[^\\])%.*/g, '$1');

    // 提取标题
    const titleMatch = tex.match(/\\title\{([^}]+)\}/);
    if (titleMatch) {
        html += '<h1>' + cleanLatexText(titleMatch[1]) + '</h1>\n';
    }

    // 提取文档主体
    const bodyMatch = tex.match(/\\begin\{document\}([\s\S]*?)\\end\{document\}/);
    if (!bodyMatch) return html;
    let body = bodyMatch[1];

    // 移除不需要解析的命令
    body = body.replace(/\\maketitle|\\thispagestyle\{[^}]*\}|\\tableofcontents|\\newpage|\\appendix/g, '');

    // 处理 abstract 环境
    body = body.replace(/\\begin\{abstract\}([\s\S]*?)\\end\{abstract\}/g, (match, content) =>
        '\n<h2>摘要</h2>\n<p>' + cleanLatexText(content) + '</p>\n'
    );

    // 处理 equation 环境
    body = body.replace(/\\begin\{equation\}([\s\S]*?)\\end\{equation\}/g, (match, content) => {
        const formula = content.trim();
        return '\n<div class="formula-block" data-formula="' + formula + '">$$' + formula + '$$</div>\n';
    });

    // 处理 figure 环境
    body = body.replace(/\\begin\{figure\}[\s\S]*?\\end\{figure\}/g, match => {
        const imgMatch = match.match(/\\includegraphics(?:\[[^\]]*\])?\{([^}]+)\}/);
        const capMatch = match.match(/\\caption\{([^}]+)\}/);
        const labelMatch = match.match(/\\label\{([^}]+)\}/);
        const path = imgMatch ? imgMatch[1] : '';
        const caption = capMatch ? capMatch[1] : '';
        const label = labelMatch ? labelMatch[1] : '';
        return '\n<img src="' + path + '" alt="' + caption + '" data-caption="' + caption + '" data-label="' + label + '" data-width="0.6">\n';
    });

    // 处理 table 环境（简化为占位符）
    body = body.replace(/\\begin\{table\}[\s\S]*?\\end\{table\}/g, '\n<p>[表格：请手动编辑]</p>\n');

    // 处理 itemize 环境
    body = body.replace(/\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/g, (match, content) => {
        const items = content.match(/\\item\s+([\s\S]*?)(?=\\item|$)/g);
        if (!items) return '';
        const listHtml = items.map(item =>
            '    <li>' + cleanLatexText(item.replace(/\\item\s+/, '')) + '</li>'
        ).join('\n');
        return '\n<ul>\n' + listHtml + '\n</ul>\n';
    });

    // 处理 enumerate 环境
    body = body.replace(/\\begin\{enumerate\}([\s\S]*?)\\end\{enumerate\}/g, (match, content) => {
        const items = content.match(/\\item\s+([\s\S]*?)(?=\\item|$)/g);
        if (!items) return '';
        const listHtml = items.map(item =>
            '    <li>' + cleanLatexText(item.replace(/\\item\s+/, '')) + '</li>'
        ).join('\n');
        return '\n<ol>\n' + listHtml + '\n</ol>\n';
    });

    // 移除参考文献和代码清单（暂不解析）
    body = body.replace(/\\begin\{thebibliography\}[\s\S]*?\\end\{thebibliography\}/g, '');
    body = body.replace(/\\begin\{lstlisting\}[\s\S]*?\\end\{lstlisting\}/g, '');

    // 逐行处理章节和普通文本
    const lines = body.split('\n');
    let pendingText = '';

    function flushText() {
        const trimmed = pendingText.trim();
        if (trimmed) {
            html += '<p>' + cleanLatexText(trimmed) + '</p>\n';
        }
        pendingText = '';
    }

    for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed) {
            flushText();
            continue;
        }

        // 已处理的 HTML 标签直接输出
        if (/^</.test(trimmed)) {
            flushText();
            html += trimmed + '\n';
            continue;
        }

        // 跳过未处理的 LaTeX 命令行
        if (/^\\(maketitle|thispagestyle|tableofcontents|newpage|appendix|bibitem)/.test(trimmed)) {
            continue;
        }

        let m;
        if ((m = trimmed.match(/^\\section\{([^}]+)\}/))) {
            flushText();
            html += '<h1>' + cleanLatexText(m[1]) + '</h1>\n';
        } else if ((m = trimmed.match(/^\\subsection\{([^}]+)\}/))) {
            flushText();
            html += '<h2>' + cleanLatexText(m[1]) + '</h2>\n';
        } else if ((m = trimmed.match(/^\\subsubsection\{([^}]+)\}/))) {
            flushText();
            html += '<h3>' + cleanLatexText(m[1]) + '</h3>\n';
        } else if (/^\\/.test(trimmed)) {
            // 其他 LaTeX 命令行，跳过
            continue;
        } else {
            pendingText += (pendingText ? ' ' : '') + trimmed;
        }
    }
    flushText();

    return html;
}

// DOM 转 LaTeX
function domToLatex() {
    let latex = '';

    // 添加文档类
    latex += '\\documentclass[12pt,a4paper]{article}\n\n';

    // 添加常用宏包
    latex += '% 中文支持\n';
    latex += '\\usepackage{ctex}\n';
    latex += '\\usepackage{fontspec}\n\n';

    latex += '% 数学公式\n';
    latex += '\\usepackage{amsmath}\n';
    latex += '\\usepackage{amssymb}\n\n';

    latex += '% 图表\n';
    latex += '\\usepackage{graphicx}\n';
    latex += '\\usepackage{float}\n\n';

    latex += '% 页面布局\n';
    latex += '\\usepackage{geometry}\n';
    latex += '\\geometry{left=2.5cm,right=2.5cm,top=2.5cm,bottom=2.5cm}\n\n';

    latex += '\\begin{document}\n\n';

    // 遍历编辑器内容（使用 childNodes 以包含文本节点）
    const nodes = editorArea.childNodes;
    for (let i = 0; i < nodes.length; i++) {
        latex += convertNodeToLatex(nodes[i]);
    }

    latex += '\n\\end{document}\n';

    return latex;
}

// 转换单个节点为 LaTeX
function convertNodeToLatex(node) {
    let latex = '';

    if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.trim();
        if (text) {
            return escapeLatex(text) + '\n';
        }
        return '';
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
        return '';
    }

    const tagName = node.tagName.toLowerCase();

    switch (tagName) {
        case 'h1':
            latex += '\\section{' + getNodeTextContent(node) + '}\n\n';
            break;

        case 'h2':
            latex += '\\subsection{' + getNodeTextContent(node) + '}\n\n';
            break;

        case 'h3':
            latex += '\\subsubsection{' + getNodeTextContent(node) + '}\n\n';
            break;

        case 'p':
        case 'div':
            // 检查是否是公式块
            if (node.classList.contains('formula-block')) {
                const formula = node.getAttribute('data-formula');
                latex += '\\begin{equation}\n';
                latex += '    ' + formula + '\n';
                latex += '\\end{equation}\n\n';
            } else {
                latex += convertInlineNodes(node) + '\n\n';
            }
            break;

        case 'ul': {
            latex += '\\begin{itemize}\n';
            const ulItems = node.querySelectorAll(':scope > li');
            ulItems.forEach(item => {
                latex += '    \\item ' + getNodeTextContent(item) + '\n';
            });
            latex += '\\end{itemize}\n\n';
            break;
        }

        case 'ol': {
            latex += '\\begin{enumerate}\n';
            const olItems = node.querySelectorAll(':scope > li');
            olItems.forEach(item => {
                latex += '    \\item ' + getNodeTextContent(item) + '\n';
            });
            latex += '\\end{enumerate}\n\n';
            break;
        }

        case 'img':
            const imgPath = node.getAttribute('src') || '';
            const imgCaption = node.getAttribute('data-caption') || '图片';
            const imgLabel = node.getAttribute('data-label') || 'fig:image';
            const imgWidth = node.getAttribute('data-width') || '0.6';

            latex += '\\begin{figure}[H]\n';
            latex += '    \\centering\n';
            latex += '    \\includegraphics[width=' + imgWidth + '\\textwidth]{' + imgPath + '}\n';
            latex += '    \\caption{' + imgCaption + '}\n';
            latex += '    \\label{' + imgLabel + '}\n';
            latex += '\\end{figure}\n\n';
            break;

        case 'br':
            latex += '\\\\\n';
            break;

        default:
            // 递归处理子节点
            for (let i = 0; i < node.childNodes.length; i++) {
                latex += convertNodeToLatex(node.childNodes[i]);
            }
    }

    return latex;
}

// 转换行内节点（处理粗体、斜体、行内公式等）
function convertInlineNodes(node) {
    let latex = '';

    for (let i = 0; i < node.childNodes.length; i++) {
        const child = node.childNodes[i];

        if (child.nodeType === Node.TEXT_NODE) {
            latex += escapeLatex(child.textContent);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
            const tag = child.tagName.toLowerCase();

            // 检查是否是行内公式
            if (child.classList.contains('formula-inline')) {
                const formula = child.getAttribute('data-formula');
                latex += '$' + formula + '$';
            } else if (tag === 'b' || tag === 'strong') {
                latex += '\\textbf{' + getNodeTextContent(child) + '}';
            } else if (tag === 'i' || tag === 'em') {
                latex += '\\textit{' + getNodeTextContent(child) + '}';
            } else if (tag === 'span' || tag === 'u') {
                latex += getNodeTextContent(child);
            } else {
                latex += getNodeTextContent(child);
            }
        }
    }

    return latex;
}

// 获取节点的纯文本内容
function getNodeTextContent(node) {
    let text = '';
    for (let i = 0; i < node.childNodes.length; i++) {
        const child = node.childNodes[i];
        if (child.nodeType === Node.TEXT_NODE) {
            text += child.textContent;
        } else if (child.nodeType === Node.ELEMENT_NODE) {
            if (child.classList.contains('formula-inline')) {
                text += '$' + child.getAttribute('data-formula') + '$';
            } else {
                text += getNodeTextContent(child);
            }
        }
    }
    return text;
}

// 转义 LaTeX 特殊字符
function escapeLatex(text) {
    const specialChars = {
        '&': '\\&',
        '%': '\\%',
        '$': '\\$',
        '#': '\\#',
        '_': '\\_',
        '{': '\\{',
        '}': '\\}',
        '~': '\\textasciitilde{}',
        '^': '\\textasciicircum{}'
    };

    return text.replace(/[&%$#_{}~^]/g, function(match) {
        return specialChars[match];
    });
}

// 更新预览
function updatePreview() {
    const latex = domToLatex();
    previewArea.textContent = latex;
    updateStatus('已更新');
}

// 复制 LaTeX 代码
function copyLatex() {
    const latex = domToLatex();
    navigator.clipboard.writeText(latex).then(() => {
        updateStatus('已复制到剪贴板');
        alert('LaTeX 代码已复制到剪贴板！');
    }).catch(err => {
        alert('复制失败：' + err);
    });
}

// 下载 .tex 文件
function downloadTexFile() {
    const latex = domToLatex();
    const blob = new Blob([latex], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'paper.tex';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    updateStatus('文件已下载');
}

// 保存草稿到 localStorage
function saveDraft() {
    try {
        const content = editorArea.innerHTML;
        localStorage.setItem('modelpaper_draft', content);
        localStorage.setItem('modelpaper_draft_time', new Date().toISOString());
    } catch (e) {
        console.error('保存草稿失败：', e);
    }
}

// 从 localStorage 加载草稿
function loadDraft() {
    try {
        const content = localStorage.getItem('modelpaper_draft');
        const time = localStorage.getItem('modelpaper_draft_time');

        if (content) {
            editorArea.innerHTML = content;
            if (time) {
                const date = new Date(time);
                updateStatus('已恢复草稿（' + date.toLocaleString('zh-CN') + '）');
            }
        }
    } catch (e) {
        console.error('加载草稿失败：', e);
    }
}

// 更新状态栏
function updateStatus(message) {
    if (statusText) {
        statusText.textContent = message;
    }
}
