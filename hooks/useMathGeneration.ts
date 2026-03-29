import { useState } from 'react';
import { useAction } from 'convex/react';
import { api } from '../convex/_generated/api';
import { MathDocumentPage } from 'types/mathDocuments';
import { useUserVariable } from 'hooks/useUserVariable';

interface UseMathGenerationProps {
    page: MathDocumentPage;
    onUpdatePage: (nextPage: MathDocumentPage, description: string) => void;
    onUpdateMarkdown: (markdown: string) => void;
}

export const useMathGeneration = ({ page, onUpdatePage, onUpdateMarkdown }: UseMathGenerationProps) => {
    const convertMathImageToMarkdown = useAction(api.mathAi.convertMathImageToMarkdown);
    const [isGenerating, setIsGenerating] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Get user-wide AI guidance
    const [aiGuidance] = useUserVariable({
        key: 'aiGuidance',
        defaultValue: 'Convert this handwritten math to Markdown + LaTeX with exact transcription.',
        privacy: 'PRIVATE'
    });

    const handleInitialGeneration = async () => {
        if (!page.imageUrl) {
            setErrorMessage('Add an image before asking the AI to convert the page.');
            return;
        }

        try {
            setIsGenerating(true);
            setErrorMessage('');

            const result = await convertMathImageToMarkdown({
                imageUrl: page.imageUrl,
                guidance: aiGuidance.value,
                currentMarkdown: page.markdown,
                followUpPrompt: undefined,
            });

            const nextPage = {
                ...page,
                markdown: result.markdown,
                lastAiPrompt: aiGuidance.value,
                lastGeneratedAt: Date.now(),
            };

            onUpdatePage(nextPage, 'Generated page markdown from image');
            onUpdateMarkdown(result.markdown);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'AI conversion failed.');
        } finally {
            setIsGenerating(false);
        }
    };

    return {
        isGenerating,
        errorMessage,
        handleInitialGeneration,
        setErrorMessage,
    };
};
