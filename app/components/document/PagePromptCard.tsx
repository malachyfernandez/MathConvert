import React, { useState } from 'react';
import { useAction } from 'convex/react';
import Column from '../layout/Column';
import AppButton from '../ui/buttons/AppButton';
import PoppinsText from '../ui/text/PoppinsText';
import PoppinsTextInput from '../ui/forms/PoppinsTextInput';
import { api } from '../../../convex/_generated/api';
import { MathDocumentPage } from 'types/mathDocuments';
import { generateId } from 'utils/generateId';

interface PagePromptCardProps {
    documentTitle: string;
    page: MathDocumentPage;
    onReplacePage: (nextPage: MathDocumentPage, description: string) => void;
}

const PagePromptCard = ({ documentTitle, page, onReplacePage }: PagePromptCardProps) => {
    const convertMathImageToMarkdown = useAction(api.mathAi.convertMathImageToMarkdown);
    const [followUpPrompt, setFollowUpPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

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
                guidance: page.initialGuidance,
                currentMarkdown: page.markdown,
                followUpPrompt: followUpPrompt.trim() || undefined,
                documentTitle,
                pageTitle: page.title,
            });

            const nextPage: MathDocumentPage = {
                ...page,
                markdown: result.markdown,
                lastAiPrompt: followUpPrompt.trim() || page.initialGuidance,
                lastGeneratedAt: Date.now(),
                followUps: followUpPrompt.trim()
                    ? [
                          ...page.followUps,
                          {
                              id: generateId(),
                              prompt: followUpPrompt.trim(),
                              createdAt: Date.now(),
                              resultingMarkdown: result.markdown,
                          },
                      ]
                    : page.followUps,
            };

            onReplacePage(nextPage, page.markdown ? 'Applied AI follow-up to page' : 'Generated page markdown from image');
            setFollowUpPrompt('');
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'AI conversion failed.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Column className='rounded-2xl border-2 border-border bg-inner-background p-4' gap={3}>
            <PoppinsText weight='bold' className='text-lg'>AI conversion</PoppinsText>

            <Column gap={1}>
                <PoppinsText weight='medium'>Initial guidance</PoppinsText>
                <PoppinsText varient='subtext'>This is added to the first conversion prompt.</PoppinsText>
                <PoppinsTextInput
                    value={page.initialGuidance}
                    onChangeText={() => undefined}
                    editable={false}
                    className='w-full border border-subtle-border bg-background p-3 opacity-70'
                    multiline={true}
                    autoGrow={true}
                />
            </Column>

            <Column gap={1}>
                <PoppinsText weight='medium'>Follow-up prompt</PoppinsText>
                <PoppinsText varient='subtext'>For follow-ups, the image, current markdown, and this prompt are all sent together.</PoppinsText>
                <PoppinsTextInput
                    value={followUpPrompt}
                    onChangeText={setFollowUpPrompt}
                    placeholder='Example: preserve the matrix brackets exactly and fix any missing fractions.'
                    className='w-full border border-subtle-border bg-background p-3 min-h-28'
                    multiline={true}
                    autoGrow={true}
                />
            </Column>

            <AppButton variant='green' className='h-12 px-4' onPress={() => void handleGenerate()}>
                <PoppinsText weight='medium' color='white'>
                    {isGenerating ? 'Running AI...' : page.markdown ? 'Apply follow-up' : 'Convert image to markdown + LaTeX'}
                </PoppinsText>
            </AppButton>

            {errorMessage ? <PoppinsText className='text-red-500'>{errorMessage}</PoppinsText> : null}

            {page.followUps.length > 0 ? (
                <Column gap={2}>
                    <PoppinsText weight='medium'>Previous follow-ups</PoppinsText>
                    {page.followUps.slice().reverse().map((followUp) => (
                        <Column key={followUp.id} className='rounded-xl border border-subtle-border bg-background p-3' gap={1}>
                            <PoppinsText>{followUp.prompt}</PoppinsText>
                            <PoppinsText varient='subtext'>
                                {new Date(followUp.createdAt).toLocaleString()}
                            </PoppinsText>
                        </Column>
                    ))}
                </Column>
            ) : null}
        </Column>
    );
};

export default PagePromptCard;
