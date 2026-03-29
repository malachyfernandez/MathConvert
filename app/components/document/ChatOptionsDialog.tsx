import React, { useState } from 'react';
import { Pressable, ActivityIndicator } from 'react-native';
import Column from '../layout/Column';
import PoppinsText from '../ui/text/PoppinsText';
import AppButton from '../ui/buttons/AppButton';
import ConvexDialog from '../ui/dialog/ConvexDialog';
import DialogHeader from '../ui/dialog/DialogHeader';
import { MonoIconsOptionsHorizontal } from '../icons/MonoIconsOptionsHorizontal';
import { MathDocumentPage } from 'types/mathDocuments';
import { useMathGeneration } from 'hooks/useMathGeneration';
import { useGeneration } from '../../../contexts/GenerationContext';
import { generateId } from 'utils/generateId';

interface ChatOptionsDialogProps {
    followUps: MathDocumentPage['followUps'];
    page: MathDocumentPage;
    onUpdatePage: (nextPage: MathDocumentPage, description: string) => void;
    onUpdateMarkdown: (markdown: string) => void;
}

const ChatOptionsDialog = ({ followUps, page, onUpdatePage, onUpdateMarkdown }: ChatOptionsDialogProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentFollowUps, setCurrentFollowUps] = useState(followUps);
    const [originalPageId, setOriginalPageId] = useState<string | null>(null);
    const { setGeneratingPage } = useGeneration();
    
    // Update current follow-ups when props change
    React.useEffect(() => {
        setCurrentFollowUps(followUps);
    }, [followUps]);
    
    const { isGenerating, errorMessage, handleInitialGeneration, setErrorMessage } = useMathGeneration({
        page,
        onUpdatePage,
        onUpdateMarkdown,
        shouldUpdatePage: () => {
            // Check if the current page ID matches the original page ID we captured
            // This ensures we only update if the user is still on the same page
            return page.id === originalPageId;
        },
        onFollowUpUpdate: (resultingMarkdown: string) => {
            // Simple approach: add the follow-up only after generation completes
            const regenerationFollowUp = {
                id: generateId(),
                prompt: 'Regenerated from scratch',
                createdAt: Date.now(),
                resultingMarkdown, // Add the result immediately
            };
            
            const updatedFollowUps = [...currentFollowUps, regenerationFollowUp];
            setCurrentFollowUps(updatedFollowUps);
            const updatedPage = { ...page, followUps: updatedFollowUps };
            onUpdatePage(updatedPage, 'Added regeneration follow-up with result');
        },
    });

    const handleRegenerate = async () => {
        // Close the modal immediately
        setIsOpen(false);
        
        // Capture the original page ID before starting generation
        setOriginalPageId(page.id);
        
        // Clear the editor first
        onUpdateMarkdown('');

        // Set the global generation state BEFORE starting generation
        setGeneratingPage(page.id, true);

        // Perform regeneration with cleared markdown
        try {
            await handleInitialGeneration();
        } finally {
            // Clear the global generation state after completion
            setGeneratingPage(page.id, false);
            // Clear the original page ID after generation completes
            setOriginalPageId(null);
        }
    };

    return (
        <ConvexDialog.Root isOpen={isOpen} onOpenChange={setIsOpen}>
            <ConvexDialog.Trigger asChild>
                <Pressable onPress={() => setIsOpen(true)}>
                    <MonoIconsOptionsHorizontal width={20} height={20} className="text-gray-600" />
                </Pressable>
            </ConvexDialog.Trigger>
            <ConvexDialog.Portal>
                <ConvexDialog.Overlay />
                <ConvexDialog.Content>
                    <ConvexDialog.Close iconProps={{ color: 'rgb(246, 238, 219)' }} className='w-10 h-10 bg-accent-hover absolute right-4 top-4 z-10' />
                    <Column>
                        <DialogHeader text='Chat Options' subtext='Manage your AI conversation and regenerate responses.' />
                        <Column className='pt-5' gap={6}>
                            <AppButton
                                variant='black'
                                className={`h-12 ${isGenerating ? 'opacity-50' : ''}`}
                                onPress={isGenerating ? undefined : handleRegenerate}
                            >
                                <PoppinsText weight='medium' color='white'>
                                    {isGenerating ? <ActivityIndicator color='white' /> : 'Regenerate from scratch'}
                                </PoppinsText>
                            </AppButton>

                            {errorMessage ? <PoppinsText className='text-red-500 text-center'>{errorMessage}</PoppinsText> : null}
                            <Column gap={2}>
                                {currentFollowUps.length > 0 && (
                                    <PoppinsText weight='medium' varient='cardHeader' className='ml-2'>Chat History</PoppinsText>
                                )}

                                {currentFollowUps.length === 0 ? (
                                    <Column className='items-center justify-center py-8'>
                                        <PoppinsText varient='subtext' className='text-center'>
                                            No previous follow-ups yet
                                        </PoppinsText>
                                    </Column>
                                ) : (
                                    <Column gap={3}>
                                        {currentFollowUps.slice().reverse().map((followUp) => (
                                            <Column key={followUp.id} className='rounded-xl border border-subtle-border bg-background p-4' gap={2}>
                                                <PoppinsText weight='medium'>{followUp.prompt}</PoppinsText>
                                                <PoppinsText varient='subtext' className='text-xs'>
                                                    {new Date(followUp.createdAt).toLocaleString()}
                                                </PoppinsText>
                                            </Column>
                                        ))}
                                    </Column>
                                )}
                            </Column>
                        </Column>
                    </Column>
                </ConvexDialog.Content>
            </ConvexDialog.Portal>
        </ConvexDialog.Root>
    );
};

export default ChatOptionsDialog;
