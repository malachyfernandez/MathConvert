import React from 'react';

interface MarkdownMathPreviewProps {
    markdown: string;
    className?: string;
}

const escapeHtml = (value: string) => {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

const createSourceDocument = (markdown: string) => {
    const escapedMarkdown = escapeHtml(markdown);

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body {
      margin: 0;
      padding: 24px;
      background: rgb(253, 251, 246);
      color: #1a1a1a;
      font-family: Arial, sans-serif;
      line-height: 1.7;
    }

    #content {
      min-height: 100%;
    }

    h1, h2, h3, h4, h5, h6 {
      margin-top: 0;
      color: #1a1a1a;
    }

    code {
      background: rgba(45, 90, 45, 0.12);
      padding: 2px 6px;
      border-radius: 6px;
    }

    pre code {
      display: block;
      padding: 12px;
      overflow-x: auto;
    }

    blockquote {
      border-left: 4px solid #1a1a1a;
      margin: 0;
      padding-left: 16px;
      opacity: 0.9;
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script>
    MathJax = {
      tex: { inlineMath: [['$', '$'], ['\\(', '\\)']] },
      startup: { typeset: false }
    };
  </script>
  <script async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
</head>
<body>
  <div id="content"></div>
  <script>
    const markdown = ${JSON.stringify(escapedMarkdown)};
    const decodedMarkdown = markdown
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
    const html = window.marked.parse(decodedMarkdown);
    const content = document.getElementById('content');
    content.innerHTML = html;
    window.MathJax.typesetPromise([content]).catch((error) => console.error(error));
  </script>
</body>
</html>`;
};

const MarkdownMathPreview = ({ markdown, className = '' }: MarkdownMathPreviewProps) => {
    return (
        <iframe
            title='Math markdown preview'
            srcDoc={createSourceDocument(markdown)}
            className={`min-h-72 w-full rounded-xl border border-[#cccccc] bg-[#fdfbf6] ${className}`}
            style={{ minHeight: 420 }}
        />
    );
};

export default MarkdownMathPreview;
