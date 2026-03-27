import React from 'react';
import MarkdownMathPreview from '../ui/markdown/MarkdownMathPreview';

interface ContentPreviewProps {
    markdown: string;
    headerHeight?: number;
    footerHeight?: number;
}

const ContentPreview = ({ markdown, headerHeight = 0, footerHeight = 0 }: ContentPreviewProps) => {
    return (
        <MarkdownMathPreview markdown={markdown} headerHeight={headerHeight} footerHeight={footerHeight} />
    );
};

export default ContentPreview;
