import React, { useState } from 'react';
import Column from '../layout/Column';
import AppButton from '../ui/buttons/AppButton';
import PoppinsText from '../ui/text/PoppinsText';
import PoppinsTextInput from '../ui/forms/PoppinsTextInput';
import { MathDocumentPage } from 'types/mathDocuments';

interface ContentEditorProps {
    page: MathDocumentPage;
    onSave: (markdown: string) => void;
}

const ContentEditor = ({ page, onSave }: ContentEditorProps) => {
    const [markdownDraft, setMarkdownDraft] = useState(page.markdown);

    const handleSave = () => {
        onSave(markdownDraft);
    };

    return (
        <Column className='rounded-2xl border-2 border-border bg-inner-background p-4' gap={3}>
            <PoppinsText weight='bold' varient='cardHeader'>Markdown + LaTeX editor</PoppinsText>
            <PoppinsTextInput
                value={markdownDraft}
                onChangeText={setMarkdownDraft}
                placeholder='Your markdown and LaTeX will appear here.'
                className='w-full border border-subtle-border bg-background p-3 min-h-72'
                multiline={true}
                autoGrow={true}
            />
            <AppButton variant='green' className='h-12 px-4' onPress={handleSave}>
                <PoppinsText weight='medium' color='white'>Save markdown</PoppinsText>
            </AppButton>
        </Column>
    );
};

export default ContentEditor;
