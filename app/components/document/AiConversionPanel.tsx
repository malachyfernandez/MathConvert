import React, { useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Spinner } from 'heroui-native';
import Column from '../layout/Column';
import Row from '../layout/Row';
import PoppinsText from '../ui/text/PoppinsText';
import { useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { MathDocumentPage } from 'types/mathDocuments';
import { generateId } from 'utils/generateId';
import AiPromptInput from './AiPromptInput';
import ChatOptionsDialog from './ChatOptionsDialog';

interface AiConversionPanelProps {
    documentTitle: string;
    page: MathDocumentPage;
    onUpdatePage: (nextPage: MathDocumentPage, description: string) => void;
    onUpdateMarkdown: (markdown: string) => void;
    onLayout?: (event: LayoutChangeEvent) => void;
}

const AiConversionPanel = ({ page, onUpdatePage, onUpdateMarkdown, onLayout }: AiConversionPanelProps) => {
    const convertMathImageToMarkdown = useAction(api.mathAi.convertMathImageToMarkdown);
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const getContextualPrompt = () => {
        if (page.markdown) {
            return `Follow-up: ${prompt || 'Continue working on this math content'}`;
        } else {
            return prompt || 'Convert this handwritten math to LaTeX';
        }
    };

    const handleGenerate = async () => {
        if (!page.imageUrl) {
            setErrorMessage('Add an image before asking the AI to convert the page.');
            return;
        }

        try {
            setIsGenerating(true);
            setErrorMessage('');

            const result = await convertMathImageToMarkdown({
                imageUrl: page.imageUrl,
                guidance: getContextualPrompt(),
                currentMarkdown: page.markdown,
                followUpPrompt: page.markdown ? prompt : undefined,
            });

            const nextPage: MathDocumentPage = {
                ...page,
                markdown: result.markdown,
                lastAiPrompt: getContextualPrompt(),
                lastGeneratedAt: Date.now(),
                followUps: prompt.trim()
                    ? [
                          ...page.followUps,
                          {
                              id: generateId(),
                              prompt: getContextualPrompt(),
                              createdAt: Date.now(),
                              resultingMarkdown: result.markdown,
                          },
                      ]
                    : page.followUps,
            };

            onUpdatePage(nextPage, page.markdown ? 'Applied AI follow-up to page' : 'Generated page markdown from image');
            setPrompt('');
            onUpdateMarkdown(result.markdown);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'AI conversion failed.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <View className='absolute bottom-0 left-0 right-0' onLayout={onLayout}>
            <BlurView 
                intensity={20} 
                tint='light'
                className='absolute bottom-0 left-0 right-0 h-full'
            />
            <View className='relative bg-background/50 border-t border-subtle-border'>
                <Column className='py-4' gap={3}>
                    <Row className='justify-between items-center px-2'>
                        <PoppinsText weight='bold' varient='cardHeader'>Chat with the AI</PoppinsText>
                        <ChatOptionsDialog 
                            followUps={page.followUps} 
                            page={page}
                            onUpdatePage={onUpdatePage}
                            onUpdateMarkdown={onUpdateMarkdown}
                        />
                    </Row>
                    
                    <AiPromptInput
                        page={page}
                        prompt={prompt}
                        onPromptChange={setPrompt}
                        onSubmit={handleGenerate}
                        isGenerating={isGenerating}
                    />

                    {errorMessage ? <PoppinsText className='text-red-500'>{errorMessage}</PoppinsText> : null}
                </Column>
            </View>
        </View>
    );
};

export default AiConversionPanel;
