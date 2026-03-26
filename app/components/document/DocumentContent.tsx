import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import Column from '../layout/Column';
import PoppinsText from '../ui/text/PoppinsText';
import { MathDocumentPage } from 'types/mathDocuments';
import ContentEditor from './ContentEditor';
import ContentPreview from './ContentPreview';
import AiConversionPanel from './AiConversionPanel';

interface DocumentContentProps {
    documentTitle: string;
    activePage: MathDocumentPage;
    onReplacePage: (nextPage: MathDocumentPage, description: string) => void;
    onDeletePage: (pageId: string) => void;
}

const DocumentContent = ({ documentTitle, activePage, onReplacePage, onDeletePage }: DocumentContentProps) => {
    const [markdownDraft, setMarkdownDraft] = useState(activePage.markdown);

    const handleSaveMarkdown = (markdown: string) => {
        const nextPage = {
            ...activePage,
            markdown,
        };
        onReplacePage(nextPage, 'Updated page markdown');
    };

    return (
        <View className='flex-1'>
            {activePage.markdown ? (
                <>
                    {/* Scrollable Content Section */}
                    <ScrollView className='flex-1' style={{ paddingBottom: 200 }}>
                        <Column gap={4} className='p-4'>
                            <ContentEditor
                                page={activePage}
                                onSave={handleSaveMarkdown}
                            />

                            <ContentPreview markdown={markdownDraft} />
                        </Column>
                    </ScrollView>

                    {/* Sticky AI Section */}
                    <AiConversionPanel
                        documentTitle={documentTitle}
                        page={activePage}
                        onUpdatePage={onReplacePage}
                        onUpdateMarkdown={setMarkdownDraft}
                    />
                </>
            ) : (
                /* Initial State - No markdown yet */
                <View className='flex-1 items-center justify-center p-8'>
                    <Column className='items-center gap-4' style={{ maxWidth: '400px' }}>
                        <PoppinsText weight='bold' className='text-2xl text-center'>
                            Ready to convert your math?
                        </PoppinsText>
                        <PoppinsText varient='subtext' className='text-center'>
                            Add an image to get started with AI-powered LaTeX conversion.
                        </PoppinsText>
                    </Column>
                </View>
            )}
        </View>
    );
};

export default DocumentContent;
