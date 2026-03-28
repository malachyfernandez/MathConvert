import { ViewOnlyTab } from '../../app/components/document/ViewOnlyDocumentHeader';

interface PrintPage {
    id: string;
    title: string;
    imageUrl: string;
    aspectRatio: number;
    srcDoc: string;
}

interface OpenViewOnlyPrintWindowArgs {
    documentTitle: string;
    activeTab: ViewOnlyTab;
    pages: PrintPage[];
}

const escapeClosingScriptTag = (value: string) => {
    return value.replace(/<\/script/gi, '<\\/script');
};

export const openViewOnlyPrintWindow = ({
    documentTitle,
    activeTab,
    pages,
}: OpenViewOnlyPrintWindowArgs) => {
    if (typeof window === 'undefined') {
        return;
    }

    const printWindow = window.open('', '_blank', 'width=1000,height=800,scrollbars=yes,resizable=yes');

    if (!printWindow) {
        console.error('Failed to open print window. Please allow popups for this site.');
        alert('Failed to open print window. Please allow popups for this site and try again.');
        return;
    }

    const serializedPages = escapeClosingScriptTag(JSON.stringify(pages));
    const serializedTitle = escapeClosingScriptTag(JSON.stringify(documentTitle));
    const serializedTab = escapeClosingScriptTag(JSON.stringify(activeTab));

    try {
        printWindow.document.open();
        printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${documentTitle}</title>
  <style>
    @page {
      margin: 12mm;
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      padding: 0;
      background: white;
      font-family: Arial, sans-serif;
    }

    body {
      padding: 16px;
    }

    #pages {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .print-page {
      position: relative;
      width: 100%;
      max-width: 900px;
      margin: 0 auto;
      overflow: hidden;
      break-after: page;
      page-break-after: always;
      background: #f6eedb;
    }

    .print-page:last-child {
      break-after: auto;
      page-break-after: auto;
    }

    .print-page iframe,
    .print-page img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }

    .print-page iframe {
      border: none;
      background: #f6eedb;
    }

    .print-page img {
      object-fit: cover;
    }

    .page-title {
      max-width: 900px;
      margin: 0 auto 8px auto;
      font-size: 14px;
      font-weight: 600;
      color: #1a1a1a;
    }

    @media print {
      body {
        padding: 0;
      }

      .page-title {
        margin-bottom: 6px;
      }
    }
  </style>
</head>
<body>
  <div id="pages"></div>

  <script>
    const DOCUMENT_TITLE = ${serializedTitle};
    const ACTIVE_TAB = ${serializedTab};
    const PAGES = ${serializedPages};

    function buildPages() {
      const pagesRoot = document.getElementById('pages');

      PAGES.forEach(function (page) {
        const section = document.createElement('section');

        const title = document.createElement('div');
        title.className = 'page-title';
        title.textContent = page.title || '';

        const shell = document.createElement('div');
        shell.className = 'print-page';
        shell.style.aspectRatio = String(page.aspectRatio || 8.5 / 11);

        const iframe = document.createElement('iframe');
        iframe.title = page.title || 'Math document page';
        iframe.srcdoc = page.srcDoc;
        shell.appendChild(iframe);

        if (ACTIVE_TAB === 'imageOverlay' && page.imageUrl) {
          const image = document.createElement('img');
          image.src = page.imageUrl;
          image.alt = page.title || 'Math document page image';
          shell.appendChild(image);
        }

        section.appendChild(title);
        section.appendChild(shell);
        pagesRoot.appendChild(section);
      });

      document.title = DOCUMENT_TITLE || 'Math document';
      window.setTimeout(function () {
        window.focus();
        window.print();
      }, 1400);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', buildPages);
    } else {
      buildPages();
    }
  </script>
</body>
</html>`);
        printWindow.document.close();
    } catch (error) {
        console.error('Error writing to print window:', error);
        alert('Failed to generate PDF content. Please try again.');
        printWindow.close();
    }
};
