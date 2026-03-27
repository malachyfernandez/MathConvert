import React, { useState, useEffect } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import Column from '../layout/Column';
import PoppinsText from '../ui/text/PoppinsText';
import AppButton from '../ui/buttons/AppButton';
import { Tabs } from 'heroui-native';
import { useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { MathDocumentPage } from 'types/mathDocuments';
import DocumentHeader from './DocumentHeader';
import ContentEditor from './ContentEditor';
import ContentPreview from './ContentPreview';
import AiConversionPanel from './AiConversionPanel';

interface DocumentContentProps {
    documentTitle: string;
    activePage: MathDocumentPage;
    onReplacePage: (nextPage: MathDocumentPage, description: string) => void;
    onDeletePage: (pageId: string) => void;
}

const DocumentContent = ({ documentTitle, activePage, onReplacePage }: DocumentContentProps) => {
    const convertMathImageToMarkdown = useAction(api.mathAi.convertMathImageToMarkdown);
    const [markdownDraft, setMarkdownDraft] = useState(activePage.markdown);
    const [activeTab, setActiveTab] = useState('editor');
    const [isGenerating, setIsGenerating] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [headerHeight, setHeaderHeight] = useState(0);
    const [footerHeight, setFooterHeight] = useState(0);

    const hasChanges = markdownDraft !== activePage.markdown;

    // Sync markdownDraft when activePage changes (e.g., after AI generation)
    useEffect(() => {
        setMarkdownDraft(activePage.markdown);
    }, [activePage.markdown]);

    const handleHeaderLayout = (event: LayoutChangeEvent) => {
        setHeaderHeight(event.nativeEvent.layout.height);
    };

    const handleFooterLayout = (event: LayoutChangeEvent) => {
        setFooterHeight(event.nativeEvent.layout.height);
    };

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
        // Update the activePage reference to reflect saved state
        // This will be updated when the parent component re-renders with the new activePage
    };

    return (
        <View className='flex-1'>
            {activePage.markdown ? (
                <>
                    {/* Sticky Header with Tabs */}
                    <DocumentHeader
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        hasChanges={hasChanges}
                        onSave={() => handleSaveMarkdown(markdownDraft)}
                        onLayout={handleHeaderLayout}
                    />

                    {/* Scrollable Content Section */}
                    {/* <ScrollView
                        className='h-full bg-accent-hover'
                    // style={{ paddingTop: 80, paddingBottom: 200 }}
                    > */}
                    {/* <View className='h-full bg-l'>
                            <PoppinsText className='text-lg'>No markdown yet</PoppinsText>
                        </View> */}
                    <View className='flex-1'>
                        <Column gap={4} className='flex-1'>
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                                <Tabs.Content value="editor" className='flex-1' style={{ minHeight: 0 }}>
                                    <View className='flex-1' style={{ minHeight: 0 }}>
                                        <ContentEditor
                                            markdown={markdownDraft}
                                            onChange={setMarkdownDraft}
                                            headerHeight={headerHeight}
                                            footerHeight={footerHeight}
                                        />
                                        {/* <PoppinsText>Editor content</PoppinsText> */}
                                    </View>
                                </Tabs.Content>

                                <Tabs.Content value="preview" className='flex-1' style={{ minHeight: 0 }}>
                                    <View className='flex-1' style={{ minHeight: 0 }}>
                                        <ContentPreview markdown={markdownDraft} headerHeight={headerHeight} footerHeight={footerHeight} />
                                    </View>
                                </Tabs.Content>
                            </Tabs>

                        </Column>
                    </View>



                    {/* Sticky AI Section */}
                    <AiConversionPanel
                        documentTitle={documentTitle}
                        page={activePage}
                        onUpdatePage={onReplacePage}
                        onUpdateMarkdown={setMarkdownDraft}
                        onLayout={handleFooterLayout}
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
