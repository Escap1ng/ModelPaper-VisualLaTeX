/**
 * ModelPaper-WYSIWYG-LaTeX 主逻辑
 * 编辑器核心 + DOM 转 LaTeX 转换
 */

// 全局变量
let editorArea = null;
let previewArea = null;
let statusText = null;
let debounceTimer = null;
let templatePreamble = null; // 保存模板的 preamble（可选）
let savedSelection = null; // 保存编辑器选区（用于字体切换等场景）

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    editorArea = document.getElementById('editorArea');
    previewArea = document.getElementById('previewArea');
    statusText = document.getElementById('statusText');

    // 绑定工具栏按钮事件
    initToolbar();

    // 初始化公式工具弹窗
    initFormulaModal();

    // 从 localStorage 恢复草稿
    loadDraft();

    // 监听编辑器变化，实时更新 LaTeX
    editorArea.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function() {
            checkDoubleSpaceIndent();
            updatePreview();
            saveDraft();
        }, 300);
    });

    // 初始更新预览
    updatePreview();
    
    // 保存编辑器选区（用于字体切换等场景）
    editorArea.addEventListener('mouseup', saveEditorSelection);
    editorArea.addEventListener('keyup', saveEditorSelection);
});

// 保存编辑器选区
function saveEditorSelection() {
    const sel = window.getSelection();
    if (sel.rangeCount > 0 && editorArea.contains(sel.anchorNode)) {
        savedSelection = sel.getRangeAt(0).cloneRange();
    }
}

// 检测双空格并转换为首行缩进
function checkDoubleSpaceIndent() {
    const paragraphs = editorArea.querySelectorAll('p, div');
    paragraphs.forEach(p => {
        const text = p.textContent;
        // 检测段落开头是否有两个空格
        if (text.startsWith('  ')) {
            // 移除开头的空格
            const cleanText = text.replace(/^  +/, '');
            p.textContent = cleanText;
            // 添加首行缩进样式
            p.style.textIndent = '2em';
        }
    });
}

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
    document.getElementById('fontSelect').addEventListener('change', changeFont);

    // 列表按钮
    document.getElementById('btnUl').addEventListener('click', insertUnorderedList);
    document.getElementById('btnOl').addEventListener('click', insertOrderedList);

    // 公式按钮
    document.getElementById('btnInlineFormula').addEventListener('click', insertInlineFormula);
    document.getElementById('btnBlockFormula').addEventListener('click', insertBlockFormula);
    document.getElementById('btnFormulaAssistant').addEventListener('click', openFormulaAssistant);

    // 图片按钮
    document.getElementById('btnImage').addEventListener('click', insertImage);

    // 模板按钮
    document.getElementById('btnTemplate').addEventListener('click', loadTemplate);

    // 开始和重新加载按钮
    document.getElementById('btnStart').addEventListener('click', startNewDocument);
    document.getElementById('btnReload').addEventListener('click', reloadAndClearDraft);

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
    // 检查当前是否已居中
    const isCentered = document.queryCommandState('justifyCenter');
    
    if (isCentered) {
        // 已居中，切换回左对齐
        document.execCommand('justifyLeft', false, null);
    } else {
        // 未居中，设置为居中
        document.execCommand('justifyCenter', false, null);
    }
    editorArea.focus();
}

// 改变字体
function changeFont() {
    const fontSelect = document.getElementById('fontSelect');
    const selectedFont = fontSelect.value;
    
    if (!selectedFont) {
        updateStatus('请选择字体');
        return;
    }
    
    // 恢复保存的选区
    if (savedSelection) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(savedSelection);
    }
    
    // 检查是否有选中文本
    const sel = window.getSelection();
    const selectedText = sel.toString();
    
    if (selectedText && sel.rangeCount > 0) {
        // 有选中文本，用 span 包裹并设置字体
        const range = sel.getRangeAt(0);
        const span = document.createElement('span');
        span.style.fontFamily = selectedFont;
        span.setAttribute('data-font', selectedFont);
        
        try {
            range.surroundContents(span);
        } catch (e) {
            // 如果选区跨越多个节点，使用替代方法
            const fragment = range.extractContents();
            span.appendChild(fragment);
            range.insertNode(span);
        }
        
        // 重新设置选区
        sel.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        sel.addRange(newRange);
    } else {
        // 无选中文本，在光标处插入带字体标记的 span
        const span = document.createElement('span');
        span.style.fontFamily = selectedFont;
        span.setAttribute('data-font', selectedFont);
        span.textContent = '在此输入';
        insertNodeAtCursor(span);
    }
    
    updatePreview();
    saveDraft();
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

// 插入行内公式（打开公式工具弹窗）
function insertInlineFormula() {
    openFormulaModal('inline', 'input');
}

// 插入行间公式（打开公式工具弹窗）
function insertBlockFormula() {
    openFormulaModal('block', 'input');
}

// 打开公式助手
function openFormulaAssistant() {
    openFormulaModal('inline', 'assistant');
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

// 开始新文档（清空编辑器）
function startNewDocument() {
    if (!confirm('确定要清空编辑器开始新文档吗？当前内容将丢失。')) return;
    
    editorArea.innerHTML = '<h1>新文档</h1><p>在此输入内容...</p>';
    templatePreamble = null; // 清除模板 preamble
    updatePreview();
    saveDraft();
    updateStatus('已开始新文档');
}

// 重新加载并删除草稿
function reloadAndClearDraft() {
    if (!confirm('确定要删除草稿并重新加载吗？所有未保存的内容将丢失。')) return;
    
    // 清除 localStorage 中的草稿
    try {
        localStorage.removeItem('modelpaper_draft');
        localStorage.removeItem('modelpaper_draft_time');
    } catch (e) {
        console.error('清除草稿失败：', e);
    }
    
    // 重新加载页面
    location.reload();
}

// 应用模板到编辑器
function applyTemplate(texContent) {
    // 提取并保存模板的 preamble
    const preambleMatch = texContent.match(/^([\s\S]*?)\\begin\{document\}/);
    if (preambleMatch) {
        templatePreamble = preambleMatch[1].trim();
    }
    
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

    // 如果有模板 preamble，使用它；否则使用默认配置
    if (templatePreamble) {
        latex += templatePreamble + '\n\n';
    } else {
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
    }

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
                // 检查是否有首行缩进样式
                const hasIndent = node.style.textIndent === '2em';
                if (hasIndent) {
                    latex += '\\indent ';
                }
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
            } else if (tag === 'font' || (tag === 'span' && child.getAttribute('data-font'))) {
                // 处理字体标记
                const fontFace = child.getAttribute('face') || child.style.fontFamily || child.getAttribute('data-font');
                const content = getNodeTextContent(child);
                if (fontFace.includes('SimSun') || fontFace.includes('宋体') || fontFace.includes('Noto Serif SC') || fontFace.includes('思源宋体')) {
                    latex += '{\\songti ' + content + '}';
                } else if (fontFace.includes('SimHei') || fontFace.includes('黑体') || fontFace.includes('Noto Sans SC') || fontFace.includes('思源黑体')) {
                    latex += '{\\heiti ' + content + '}';
                } else {
                    latex += content;
                }
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

// ========== 公式工具弹窗（手动输入 + 公式助手） ==========

// 常用 LaTeX 符号面板
const SYMBOL_PALETTE = [
    { label: '分数', latex: '\\frac{}{}' },
    { label: '根式', latex: '\\sqrt{}' },
    { label: 'n次根', latex: '\\sqrt[n]{}' },
    { label: '上标', latex: '^{}' },
    { label: '下标', latex: '_{}' },
    { label: '求和', latex: '\\sum_{i=1}^{n}' },
    { label: '求积', latex: '\\prod_{i=1}^{n}' },
    { label: '积分', latex: '\\int_{a}^{b}' },
    { label: '二重积分', latex: '\\iint_{D}' },
    { label: '极限', latex: '\\lim_{x \\to 0}' },
    { label: '∞', latex: '\\infty' },
    { label: '≈', latex: '\\approx' },
    { label: '≥', latex: '\\geq' },
    { label: '≤', latex: '\\leq' },
    { label: '≠', latex: '\\neq' },
    { label: '±', latex: '\\pm' },
    { label: '∈', latex: '\\in' },
    { label: '⊂', latex: '\\subset' },
    { label: '∪', latex: '\\cup' },
    { label: '∩', latex: '\\cap' },
    { label: '向量', latex: '\\vec{}' },
    { label: '偏导', latex: '\\frac{\\partial}{\\partial x}' },
    { label: '点乘', latex: '\\cdot' },
    { label: 'α', latex: '\\alpha' },
    { label: 'β', latex: '\\beta' },
    { label: 'γ', latex: '\\gamma' },
    { label: 'θ', latex: '\\theta' },
    { label: 'λ', latex: '\\lambda' },
    { label: 'μ', latex: '\\mu' },
    { label: 'σ', latex: '\\sigma' },
    { label: 'ω', latex: '\\omega' },
    { label: 'π', latex: '\\pi' },
    { label: 'Δ', latex: '\\Delta' },
    { label: 'Σ', latex: '\\Sigma' }
];

// 常用数模公式库（type: inline=行内公式, block=行间公式）
const FORMULA_LIBRARY = [
    {
        name: '基础数学',
        icon: '∑',
        formulas: [
            { name: '分数', latex: '\\frac{a}{b}', type: 'inline' },
            { name: '根式', latex: '\\sqrt{a}', type: 'inline' },
            { name: 'n 次根式', latex: '\\sqrt[n]{a}', type: 'inline' },
            { name: '求和', latex: '\\sum_{i=1}^{n} x_i', type: 'inline' },
            { name: '求积', latex: '\\prod_{i=1}^{n} x_i', type: 'inline' },
            { name: '积分', latex: '\\int_{a}^{b} f(x) \\, dx', type: 'inline' },
            { name: '极限', latex: '\\lim_{x \\to 0} \\frac{f(x)}{x}', type: 'inline' },
            { name: '导数', latex: "f'(x) = \\lim_{\\Delta x \\to 0} \\frac{f(x + \\Delta x) - f(x)}{\\Delta x}", type: 'block' },
            { name: '矩阵', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', type: 'block' },
            { name: '行列式', latex: '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}', type: 'block' },
            { name: '分段函数', latex: 'f(x) = \\begin{cases} x^2, & x \\geq 0 \\\\ -x, & x < 0 \\end{cases}', type: 'block' },
            { name: '方程组', latex: '\\begin{cases} x + y = 1 \\\\ x - y = 2 \\end{cases}', type: 'block' },
            { name: '牛顿-莱布尼茨公式', latex: '\\int_{a}^{b} f(x) \\, dx = F(b) - F(a)', type: 'block' },
            { name: '泰勒展开', latex: 'f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!} (x-a)^n', type: 'block' }
        ]
    },
    {
        name: '概率统计',
        icon: 'σ',
        formulas: [
            { name: '样本均值', latex: '\\bar{x} = \\frac{1}{n} \\sum_{i=1}^{n} x_i', type: 'inline' },
            { name: '样本方差', latex: 's^2 = \\frac{1}{n-1} \\sum_{i=1}^{n} (x_i - \\bar{x})^2', type: 'block' },
            { name: '样本标准差', latex: 's = \\sqrt{\\frac{1}{n-1} \\sum_{i=1}^{n} (x_i - \\bar{x})^2}', type: 'block' },
            { name: '期望', latex: 'E(X) = \\sum_{i=1}^{n} x_i p_i', type: 'inline' },
            { name: '方差', latex: 'D(X) = E[(X - E(X))^2]', type: 'inline' },
            { name: '协方差', latex: 'Cov(X, Y) = E[(X - E(X))(Y - E(Y))]', type: 'inline' },
            { name: '相关系数', latex: '\\rho_{XY} = \\frac{Cov(X, Y)}{\\sqrt{D(X)} \\sqrt{D(Y)}}', type: 'block' },
            { name: '条件概率', latex: 'P(A|B) = \\frac{P(AB)}{P(B)}', type: 'inline' },
            { name: '贝叶斯公式', latex: 'P(A_i|B) = \\frac{P(B|A_i) P(A_i)}{\\sum_{j} P(B|A_j) P(A_j)}', type: 'block' },
            { name: '正态分布密度', latex: 'f(x) = \\frac{1}{\\sqrt{2\\pi} \\sigma} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}', type: 'block' },
            { name: '均匀分布', latex: 'f(x) = \\frac{1}{b-a}, \\quad a \\leq x \\leq b', type: 'inline' },
            { name: '二项分布', latex: 'P(X=k) = C_n^k p^k (1-p)^{n-k}', type: 'inline' },
            { name: '泊松分布', latex: 'P(X=k) = \\frac{\\lambda^k e^{-\\lambda}}{k!}', type: 'inline' },
            { name: '指数分布', latex: 'f(x) = \\lambda e^{-\\lambda x}, \\quad x \\geq 0', type: 'inline' },
            { name: '中心极限定理', latex: '\\frac{\\bar{X} - \\mu}{\\sigma/\\sqrt{n}} \\sim N(0, 1)', type: 'block' }
        ]
    },
    {
        name: '评价模型',
        icon: '★',
        formulas: [
            { name: 'Min-Max 归一化（正向）', latex: "x'_{ij} = \\frac{x_{ij} - \\min_j x_{ij}}{\\max_j x_{ij} - \\min_j x_{ij}}", type: 'block' },
            { name: 'Min-Max 归一化（逆向）', latex: "x'_{ij} = \\frac{\\max_j x_{ij} - x_{ij}}{\\max_j x_{ij} - \\min_j x_{ij}}", type: 'block' },
            { name: 'Z-score 标准化', latex: "x'_{ij} = \\frac{x_{ij} - \\bar{x}_j}{s_j}", type: 'inline' },
            { name: '熵权法-比重', latex: 'p_{ij} = \\frac{x_{ij}}{\\sum_{i=1}^{n} x_{ij}}', type: 'block' },
            { name: '熵权法-熵值', latex: 'H_j = -\\frac{1}{\\ln n} \\sum_{i=1}^{n} p_{ij} \\ln p_{ij}', type: 'block' },
            { name: '熵权法-权重', latex: 'w_j = \\frac{1 - H_j}{m - \\sum_{j=1}^{m} H_j}', type: 'block' },
            { name: 'AHP 一致性指标', latex: 'CI = \\frac{\\lambda_{\\max} - n}{n - 1}', type: 'block' },
            { name: 'AHP 一致性比率', latex: 'CR = \\frac{CI}{RI} < 0.1', type: 'block' },
            { name: 'TOPSIS 正理想解距离', latex: 'd_i^{+} = \\sqrt{\\sum_{j=1}^{m} (v_{ij} - v_j^{+})^2}', type: 'block' },
            { name: 'TOPSIS 负理想解距离', latex: 'd_i^{-} = \\sqrt{\\sum_{j=1}^{m} (v_{ij} - v_j^{-})^2}', type: 'block' },
            { name: 'TOPSIS 贴近度', latex: 'C_i = \\frac{d_i^{-}}{d_i^{+} + d_i^{-}}', type: 'block' },
            { name: '加权综合评价', latex: 'S_i = \\sum_{j=1}^{m} w_j r_{ij}', type: 'inline' },
            { name: '灰色关联系数', latex: '\\xi_i(k) = \\frac{\\min_i \\min_k |x_0(k)-x_i(k)| + \\rho \\max_i \\max_k |x_0(k)-x_i(k)|}{|x_0(k)-x_i(k)| + \\rho \\max_i \\max_k |x_0(k)-x_i(k)|}', type: 'block' },
            { name: '灰色关联度', latex: 'r_i = \\frac{1}{n} \\sum_{k=1}^{n} \\xi_i(k)', type: 'block' },
            { name: '模糊综合评价', latex: 'B = A \\circ R', type: 'inline' }
        ]
    },
    {
        name: '预测模型',
        icon: '📈',
        formulas: [
            { name: '一元线性回归', latex: 'y = \\beta_0 + \\beta_1 x + \\varepsilon', type: 'inline' },
            { name: '回归系数估计', latex: '\\hat{\\beta}_1 = \\frac{\\sum_{i=1}^{n} (x_i - \\bar{x})(y_i - \\bar{y})}{\\sum_{i=1}^{n} (x_i - \\bar{x})^2}', type: 'block' },
            { name: '多元线性回归', latex: 'y = \\beta_0 + \\beta_1 x_1 + \\cdots + \\beta_p x_p + \\varepsilon', type: 'inline' },
            { name: '逻辑回归', latex: 'P = \\frac{1}{1 + e^{-(\\beta_0 + \\beta_1 x)}}', type: 'block' },
            { name: 'GM(1,1) 累加生成', latex: "x^{(1)}(k) = \\sum_{i=1}^{k} x^{(0)}(i)", type: 'block' },
            { name: 'GM(1,1) 时间响应式', latex: "\\hat{x}^{(1)}(k+1) = \\left( x^{(0)}(1) - \\frac{b}{a} \\right) e^{-ak} + \\frac{b}{a}", type: 'block' },
            { name: 'GM(1,1) 预测还原', latex: "\\hat{x}^{(0)}(k+1) = \\hat{x}^{(1)}(k+1) - \\hat{x}^{(1)}(k)", type: 'block' },
            { name: '一次指数平滑', latex: 'S_t = \\alpha x_t + (1 - \\alpha) S_{t-1}', type: 'inline' },
            { name: '移动平均', latex: '\\bar{x}_t = \\frac{1}{n} \\sum_{i=1}^{n} x_{t-i}', type: 'inline' },
            { name: '指数增长模型', latex: 'N(t) = N_0 e^{rt}', type: 'inline' },
            { name: 'Malthus 模型', latex: '\\frac{dN}{dt} = rN', type: 'block' },
            { name: '均方根误差 RMSE', latex: 'RMSE = \\sqrt{\\frac{1}{n} \\sum_{i=1}^{n} (y_i - \\hat{y}_i)^2}', type: 'block' },
            { name: '平均绝对百分比误差 MAPE', latex: 'MAPE = \\frac{1}{n} \\sum_{i=1}^{n} \\left| \\frac{y_i - \\hat{y}_i}{y_i} \\right| \\times 100\\%', type: 'block' },
            { name: '拟合优度 R²', latex: 'R^2 = 1 - \\frac{\\sum_{i=1}^{n} (y_i - \\hat{y}_i)^2}{\\sum_{i=1}^{n} (y_i - \\bar{y})^2}', type: 'block' }
        ]
    },
    {
        name: '优化模型',
        icon: '⚙',
        formulas: [
            { name: '线性规划（标准形）', latex: '\\min z = \\sum_{j=1}^{n} c_j x_j, \\quad s.t. \\ \\sum_{j=1}^{n} a_{ij} x_j \\leq b_i, \\ x_j \\geq 0', type: 'block' },
            { name: '0-1 整数变量', latex: 'x_j \\in \\{0, 1\\}', type: 'inline' },
            { name: '运输问题目标', latex: '\\min z = \\sum_{i=1}^{m} \\sum_{j=1}^{n} c_{ij} x_{ij}', type: 'block' },
            { name: '产销平衡约束', latex: '\\sum_{j=1}^{n} x_{ij} = a_i, \\quad \\sum_{i=1}^{m} x_{ij} = b_j', type: 'block' },
            { name: '多目标规划', latex: '\\min F(x) = (f_1(x), f_2(x), \\cdots, f_k(x))^T', type: 'block' },
            { name: '加权法转化', latex: '\\min \\sum_{i=1}^{k} w_i f_i(x)', type: 'inline' },
            { name: '动态规划递推', latex: 'f_k(s_k) = \\min_{x_k} \\{ v_k(s_k, x_k) + f_{k+1}(s_{k+1}) \\}', type: 'block' },
            { name: 'M/M/1 队长', latex: 'L_s = \\frac{\\lambda}{\\mu - \\lambda}', type: 'inline' },
            { name: 'M/M/1 等待时间', latex: 'W_s = \\frac{1}{\\mu - \\lambda}', type: 'inline' },
            { name: 'M/M/1 空闲率', latex: 'P_0 = 1 - \\frac{\\lambda}{\\mu}', type: 'inline' }
        ]
    },
    {
        name: '微分方程',
        icon: 'dx',
        formulas: [
            { name: '一阶常微分方程', latex: '\\frac{dy}{dx} = f(x, y)', type: 'inline' },
            { name: '可分离变量', latex: '\\int \\frac{dy}{h(y)} = \\int g(x) \\, dx + C', type: 'block' },
            { name: 'Logistic 增长模型', latex: '\\frac{dN}{dt} = rN \\left( 1 - \\frac{N}{K} \\right)', type: 'block' },
            { name: 'Logistic 模型解', latex: 'N(t) = \\frac{K}{1 + \\left( \\frac{K}{N_0} - 1 \\right) e^{-rt}}', type: 'block' },
            { name: '指数衰减', latex: '\\frac{dN}{dt} = -\\lambda N', type: 'inline' },
            { name: '二阶常系数齐次方程', latex: "y'' + py' + qy = 0", type: 'inline' },
            { name: 'SIR 模型', latex: '\\begin{cases} \\frac{dS}{dt} = -\\beta SI \\\\ \\frac{dI}{dt} = \\beta SI - \\gamma I \\\\ \\frac{dR}{dt} = \\gamma I \\end{cases}', type: 'block' },
            { name: 'SI 模型', latex: '\\frac{dI}{dt} = \\beta SI, \\quad S + I = N', type: 'block' },
            { name: '欧拉法', latex: 'y_{k+1} = y_k + h f(x_k, y_k)', type: 'inline' },
            { name: '四阶龙格-库塔法', latex: 'y_{k+1} = y_k + \\frac{h}{6} (k_1 + 2k_2 + 2k_3 + k_4)', type: 'block' }
        ]
    },
    {
        name: '插值拟合',
        icon: '~',
        formulas: [
            { name: '拉格朗日基函数', latex: 'l_i(x) = \\prod_{j \\neq i} \\frac{x - x_j}{x_i - x_j}', type: 'block' },
            { name: '拉格朗日插值多项式', latex: 'L_n(x) = \\sum_{i=0}^{n} y_i l_i(x)', type: 'block' },
            { name: '最小二乘拟合', latex: '\\min \\sum_{i=1}^{n} (y_i - f(x_i))^2', type: 'block' },
            { name: '梯形求积公式', latex: '\\int_{a}^{b} f(x) \\, dx \\approx \\frac{b-a}{2} (f(a) + f(b))', type: 'block' },
            { name: '辛普森求积公式', latex: '\\int_{a}^{b} f(x) \\, dx \\approx \\frac{b-a}{6} \\left[ f(a) + 4f\\left(\\frac{a+b}{2}\\right) + f(b) \\right]', type: 'block' }
        ]
    }
];

// HTML 转义（用于公式库展示）
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 打开公式工具弹窗
function openFormulaModal(mode, tab) {
    const modal = document.getElementById('formulaModal');

    // 保存编辑器选区（弹窗聚焦会劫持 DOM 选区）
    saveEditorSelection();

    // 设置插入模式
    const radio = document.querySelector('input[name="formulaMode"][value="' + (mode || 'inline') + '"]');
    if (radio) radio.checked = true;

    switchModalTab(tab || 'input');
    modal.classList.add('show');

    if (tab !== 'assistant') {
        document.getElementById('formulaInput').focus();
    }
}

// 关闭公式工具弹窗
function closeFormulaModal() {
    document.getElementById('formulaModal').classList.remove('show');
    if (editorArea) editorArea.focus();
}

// 切换弹窗标签页
function switchModalTab(tab) {
    document.querySelectorAll('.modal-tab').forEach(function(t) {
        t.classList.toggle('active', t.dataset.tab === tab);
    });
    document.querySelectorAll('.tab-panel').forEach(function(p) {
        p.classList.toggle('active', p.id === 'tab-' + tab);
    });
    if (tab === 'assistant') {
        renderFormulaAssistant();
    }
}

// 渲染符号面板
function renderSymbolPalette() {
    const palette = document.getElementById('symbolPalette');
    palette.innerHTML = '';
    SYMBOL_PALETTE.forEach(function(sym) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.title = sym.label;
        btn.textContent = sym.label;
        btn.addEventListener('click', function() {
            insertSymbolIntoTextarea(sym.latex);
        });
        palette.appendChild(btn);
    });
}

// 向公式输入框光标处插入符号
function insertSymbolIntoTextarea(symbol) {
    const ta = document.getElementById('formulaInput');
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    ta.value = ta.value.slice(0, start) + symbol + ta.value.slice(end);
    ta.selectionStart = ta.selectionEnd = start + symbol.length;
    ta.focus();
}

// 从手动输入插入公式
function insertFormulaFromInput() {
    const latex = document.getElementById('formulaInput').value.trim();
    if (!latex) {
        updateStatus('请输入公式内容');
        return;
    }
    const mode = document.querySelector('input[name="formulaMode"]:checked').value;
    insertFormulaNode(latex, mode);
    document.getElementById('formulaInput').value = '';
    closeFormulaModal();
}

// 在编辑器光标处插入公式节点
function insertFormulaNode(latex, type) {
    // 恢复编辑器中的选区（弹窗会劫持 DOM 选区，需先恢复再插入）
    restoreEditorSelection();

    if (type === 'block') {
        const div = document.createElement('div');
        div.className = 'formula-block';
        div.setAttribute('data-formula', latex);
        div.textContent = '$$' + latex + '$$';
        insertNodeAtCursor(div);
    } else {
        const span = document.createElement('span');
        span.className = 'formula-inline';
        span.setAttribute('data-formula', latex);
        span.textContent = '$' + latex + '$';
        insertNodeAtCursor(span);
    }
    updatePreview();
    saveDraft();
    updateStatus('公式已插入');
}

// 恢复编辑器选区（无有效选区时定位到编辑器末尾）
function restoreEditorSelection() {
    const sel = window.getSelection();
    let range = null;

    if (savedSelection && savedSelection.commonAncestorContainer) {
        if (editorArea.contains(savedSelection.commonAncestorContainer)) {
            range = savedSelection.cloneRange();
        }
    }

    if (!range) {
        range = document.createRange();
        range.selectNodeContents(editorArea);
        range.collapse(false); // 折叠到末尾
    }

    sel.removeAllRanges();
    sel.addRange(range);
    editorArea.focus();
}

// 渲染公式助手
let currentFormulaCategory = null;

function renderFormulaAssistant() {
    const catsEl = document.getElementById('assistantCats');
    const listEl = document.getElementById('assistantList');

    catsEl.innerHTML = '';
    FORMULA_LIBRARY.forEach(function(cat, idx) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cat-item' + (idx === 0 ? ' active' : '');
        btn.textContent = cat.icon + ' ' + cat.name;
        btn.addEventListener('click', function() {
            currentFormulaCategory = cat;
            catsEl.querySelectorAll('.cat-item').forEach(function(c) {
                c.classList.remove('active');
            });
            btn.classList.add('active');
            renderFormulaList(cat);
        });
        catsEl.appendChild(btn);
    });

    currentFormulaCategory = FORMULA_LIBRARY[0];
    renderFormulaList(currentFormulaCategory);
}

// 渲染分类下的公式列表
function renderFormulaList(cat) {
    const listEl = document.getElementById('assistantList');
    listEl.innerHTML = '';

    const hint = document.createElement('div');
    hint.className = 'assistant-hint';
    hint.textContent = '共 ' + cat.formulas.length + ' 个公式，点击即可插入到编辑器光标处';
    listEl.appendChild(hint);

    cat.formulas.forEach(function(f) {
        const item = document.createElement('div');
        item.className = 'formula-item';
        item.title = '点击插入' + (f.type === 'block' ? '行间' : '行内') + '公式';

        const nameRow = document.createElement('div');
        nameRow.className = 'formula-item-name';
        nameRow.textContent = f.name;
        const badge = document.createElement('span');
        badge.className = 'badge';
        badge.textContent = f.type === 'block' ? '行间' : '行内';
        nameRow.appendChild(badge);

        const latexCode = document.createElement('code');
        latexCode.className = 'formula-item-latex';
        latexCode.textContent = f.latex;

        item.appendChild(nameRow);
        item.appendChild(latexCode);

        item.addEventListener('click', function() {
            insertFormulaNode(f.latex, f.type || 'inline');
            closeFormulaModal();
        });
        listEl.appendChild(item);
    });
}

// 初始化公式工具弹窗
function initFormulaModal() {
    renderSymbolPalette();

    // 标签切换
    document.querySelectorAll('.modal-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
            switchModalTab(tab.dataset.tab);
        });
    });

    // 关闭按钮
    document.getElementById('formulaModalClose').addEventListener('click', closeFormulaModal);

    // 点击遮罩关闭
    document.getElementById('formulaModal').addEventListener('click', function(e) {
        if (e.target === this) closeFormulaModal();
    });

    // 插入按钮
    document.getElementById('btnInsertFormula').addEventListener('click', insertFormulaFromInput);

    // 文本框回车插入（Ctrl+Enter）
    document.getElementById('formulaInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            insertFormulaFromInput();
        }
    });

    // Esc 关闭
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && document.getElementById('formulaModal').classList.contains('show')) {
            closeFormulaModal();
        }
    });
}
