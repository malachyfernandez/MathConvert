import React from 'react';
import Column from '../layout/Column';
import PoppinsText from '../ui/text/PoppinsText';
import MarkdownMathPreview from '../ui/markdown/MarkdownMathPreview';

interface ContentPreviewProps {
    markdown: string;
}

const ContentPreview = ({ markdown }: ContentPreviewProps) => {
    return (
        <Column className='rounded-2xl border-2 border-border bg-inner-background p-4' gap={3}>
            <PoppinsText weight='bold' varient='cardHeader'>Rendered preview</PoppinsText>
            <MarkdownMathPreview markdown={markdown} />
        </Column>
    );
};

export default ContentPreview;
