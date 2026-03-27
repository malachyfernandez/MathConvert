import React, { useState, useEffect } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import { Spinner } from 'heroui-native';
import Column from '../layout/Column';
import Row from '../layout/Row';
import PoppinsText from '../ui/text/PoppinsText';
import AppButton from '../ui/buttons/AppButton';
import { Tabs } from 'heroui-native';
import { useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { MathDocumentPage } from 'types/mathDocuments';
import { useGeneration } from '../../../contexts/GenerationContext';
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
    const { setGeneratingPage, isPageGenerating } = useGeneration();
    const [markdownDraft, setMarkdownDraft] = useState(activePage.markdown);
    const [activeTab, setActiveTab] = useState('preview');
    const [errorMessage, setErrorMessage] = useState('');
    const [headerHeight, setHeaderHeight] = useState(0);
    const [footerHeight, setFooterHeight] = useState(0);
    const [dotCount, setDotCount] = useState(1);
    
    const isGenerating = isPageGenerating(activePage.id);

    const hasChanges = markdownDraft !== activePage.markdown;

    // Sync markdownDraft when activePage changes (e.g., after AI generation)
    useEffect(() => {
        setMarkdownDraft(activePage.markdown);
    }, [activePage.markdown]);

    // Animate dots during generation
    useEffect(() => {
        if (isGenerating) {
            const interval = setInterval(() => {
                setDotCount((prev) => (prev % 3) + 1);
            }, 500);
            return () => clearInterval(interval);
        } else {
            setDotCount(1);
        }
    }, [isGenerating]);

    const handleHeaderLayout = (event: LayoutChangeEvent) => {
        setHeaderHeight(event.nativeEvent.layout.height);
    };

    const handleFooterLayout = (event: LayoutChangeEvent) => {
        setFooterHeight(event.nativeEvent.layout.height);
    };

    const handleInitialGeneration = async () => {
        // Capture the current page data at the start of generation
        const currentPage = activePage;
        
        if (!currentPage.imageUrl) {
            setErrorMessage('Add an image before asking the AI to convert the page.');
            return;
        }

        try {
            setGeneratingPage(currentPage.id, true);
            setErrorMessage('');

            const result = await convertMathImageToMarkdown({
                imageUrl: currentPage.imageUrl,
                guidance: 'Convert this handwritten math to LaTeX',
                currentMarkdown: currentPage.markdown,
                followUpPrompt: undefined,
            });

            const nextPage = {
                ...currentPage,
                markdown: result.markdown,
                lastAiPrompt: 'Convert this handwritten math to LaTeX',
                lastGeneratedAt: Date.now(),
            };

            onReplacePage(nextPage, 'Generated page markdown from image');
            
            // Only update markdown draft if we're still on the same page
            if (activePage.id === currentPage.id) {
                setMarkdownDraft(result.markdown);
            }
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'AI conversion failed.');
        } finally {
            setGeneratingPage(currentPage.id, false);
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
                            {isGenerating ? `Converting${'.'.repeat(dotCount)}` : 'Convert to LaTeX'}
                        </PoppinsText>
                        <PoppinsText varient='subtext' className='text-center'>
                            {isGenerating ? 'This will continue to happen in the background' : 'Click to generate LaTeX from handwritten math image.'}
                        </PoppinsText>
                        <AppButton
                            variant={isGenerating ? 'grey' : 'green'}
                            onPress={handleInitialGeneration}
                            className='h-12 w-40'
                            disabled={isGenerating}
                        >
                            <Row className='items-center' gap={2}>
                                {isGenerating && <Spinner size="sm" color="white" />}
                                <PoppinsText weight='medium' color='white'>
                                    Generate LaTeX
                                </PoppinsText>
                            </Row>
                        </AppButton>

                        {errorMessage ? <PoppinsText className='text-red-500 text-center mt-2'>{errorMessage}</PoppinsText> : null}
                    </Column>
                </View>
            )}
        </View>
    );
};

export default DocumentContent;
