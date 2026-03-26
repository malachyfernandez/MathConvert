import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import Column from '../layout/Column';
import PoppinsText from '../ui/text/PoppinsText';
import AppButton from '../ui/buttons/AppButton';
import { useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
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
    const convertMathImageToMarkdown = useAction(api.mathAi.convertMathImageToMarkdown);
    const [markdownDraft, setMarkdownDraft] = useState(activePage.markdown);
    const [isGenerating, setIsGenerating] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleInitialGeneration = async () => {
        if (!activePage.imageUrl) {
            setErrorMessage('Add an image before asking the AI to convert the page.');
            return;
        }

        try {
            setIsGenerating(true);
            setErrorMessage('');

            const result = await convertMathImageToMarkdown({
                imageUrl: activePage.imageUrl,
                guidance: 'Convert this handwritten math to LaTeX',
                currentMarkdown: activePage.markdown,
                followUpPrompt: undefined,
                documentTitle,
                pageTitle: activePage.title,
            });

            const nextPage = {
                ...activePage,
                markdown: result.markdown,
                lastAiPrompt: 'Convert this handwritten math to LaTeX',
                lastGeneratedAt: Date.now(),
            };

            onReplacePage(nextPage, 'Generated page markdown from image');
            setMarkdownDraft(result.markdown);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'AI conversion failed.');
        } finally {
            setIsGenerating(false);
        }
    };

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
                    <Column className='items-center gap-4' style={{ maxWidth: '700px' }}>
                        <PoppinsText weight='bold' className='text-xl text-center'>
                            Convert to LaTeX
                        </PoppinsText>
                        <PoppinsText varient='subtext' className='text-center'>
                            Click to generate LaTeX from handwritten math image.
                        </PoppinsText>
                        <AppButton 
                            variant='green'
                            onPress={handleInitialGeneration}
                            className='h-12 w-40'
                        >
                            <PoppinsText weight='medium' color='white'>
                                {isGenerating ? 'Generating...' : 'Generate LaTeX'}
                            </PoppinsText>
                        </AppButton>

                        {errorMessage ? <PoppinsText className='text-red-500 text-center mt-2'>{errorMessage}</PoppinsText> : null}
                    </Column>
                </View>
            )}
        </View>
    );
};

export default DocumentContent;
