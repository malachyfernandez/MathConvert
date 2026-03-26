import React from 'react';
import PoppinsTextInput from '../ui/forms/PoppinsTextInput';

interface ContentEditorProps {
    markdown: string;
    onChange: (markdown: string) => void;
}

const ContentEditor = ({ markdown, onChange }: ContentEditorProps) => {
    return (
        <PoppinsTextInput
            value={markdown}
            onChangeText={onChange}
            placeholder='Your markdown and LaTeX will appear here.'
            className='w-full border border-subtle-border bg-background p-4 min-h-96 text-base'
            multiline={true}
            autoGrow={true}
        />
    );
};

export default ContentEditor;
