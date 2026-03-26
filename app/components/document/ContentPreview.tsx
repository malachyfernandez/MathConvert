import React from 'react';
import MarkdownMathPreview from '../ui/markdown/MarkdownMathPreview';

interface ContentPreviewProps {
    markdown: string;
}

const ContentPreview = ({ markdown }: ContentPreviewProps) => {
    return (
        <MarkdownMathPreview markdown={markdown} />
    );
};

export default ContentPreview;
